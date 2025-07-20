'use client'
import React, { useEffect, useRef, useState } from 'react'
import { decryptMessage, encryptMessage, getRecipientPublicKey } from '../../utils/encryption/RSAEncryption'
import useRSAEncryption from '@/app/utils/encryption/useRSAEncryption'
import { createClient } from '@/app/utils/supabase/client'
import getUserClient from '@/app/utils/supabaseComponets/getUserClient'
import { getConversationMessages, markMessageAsRead, Message, sendMessage, subscribeToMessages } from '@/app/utils/supabaseComponets/messaging'
import { RealtimeChannel } from '@supabase/supabase-js'
import { SendHorizonal } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'

interface UserProfile {
  id: string
  username: string
  name: string
  profile_picture_url?: string | null
}

interface RSAMessage extends Message {
  encrypted_aes_key?: string
}

const ConversationPage = () => {
  const params = useParams()
  const conversationId = Array.isArray(params.conversationId) ? params.conversationId[0] : params.conversationId
  const [messages, setMessages] = useState<RSAMessage[]>([])
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null)
  const [newMessage, setNewMessage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [sending, setSending] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { keyPair, isReady, userId } = useRSAEncryption();
  const supabase = createClient()

  useEffect(() => {
    if (isReady && keyPair?.privateKey) {
      initializeConversation()
    }
  }, [conversationId, isReady, keyPair])

  useEffect(() => {
    if (conversationId && currentUser && isReady && keyPair) {
      let subscription: RealtimeChannel | null = null
      const setupSubscription = async () => {
        const result = await subscribeToMessages(conversationId, async (newMessage: RSAMessage) => {
          let processedMessage = newMessage

          if (newMessage.is_encrypted && keyPair.privateKey && newMessage.iv && newMessage.encrypted_aes_key) {
            try {
              const decryptedContent = await decryptMessage(
                newMessage.content,
                newMessage.encrypted_aes_key,
                newMessage.iv,
                keyPair.privateKey
              )
              processedMessage = {
                ...newMessage,
                content: decryptedContent
              }
            } catch (error) {
              console.error('Failed to decrypt message:', error)
              processedMessage = {
                ...newMessage,
                content: '[Message could not be decrypted]'
              }
            }
          }
          setMessages(prev => [...prev, processedMessage])
          if (newMessage.sender_id !== currentUser.id) {
            markMessageAsRead(conversationId, currentUser.id)
          }
        })
        subscription = result
      }

      setupSubscription()
      return () => {
        if (subscription) {
          subscription?.unsubscribe()
        }
      }
    }
  }, [conversationId, currentUser, isReady, keyPair])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (currentUser && conversationId) {
      markMessageAsRead(conversationId, currentUser.id)
    }
  }, [currentUser, conversationId])

  const initializeConversation = async () => {
    try {
      const user = await getUserClient()
      
      if (!user.id) {
        console.log('Error getting user id')
        return
      }

      const { data: userProfile } = await supabase
        .from('profile')
        .select('username, name, profile_picture_url')
        .eq('id', user.id)
        .single()

      if (userProfile) {
        setCurrentUser({
          id: user.id,
          username: userProfile.username || '',
          name: userProfile.name || '',
          profile_picture_url: userProfile.profile_picture_url
        })
      }

      const { data: convoData, error: convoError } = await supabase
        .from('conversations')
        .select('user1_id, user2_id')
        .eq('conversation_id', conversationId)
        .single()
      
      if (convoError) {
        console.log('Error: ' + convoError)
        return
      }

      const otherUserId = convoData?.user1_id === user.id ? convoData.user2_id : convoData?.user1_id
      const { data: otherUserProfile, error: otherUserError } = await supabase
        .from('profile')
        .select('id, username, name, profile_picture_url')
        .eq('id', otherUserId)
        .single()

      if (otherUserError) {
        console.log('Error: ' + otherUserError)
        return
      }
      setOtherUser(otherUserProfile)

      if (conversationId) {
        const { data: messagesData, error: messagesError } = await getConversationMessages(conversationId)
        if (messagesError) {
          console.log('Error: ' + messagesError)
          setMessages(messagesData || [])
        } else {
          const decryptedMessages = await Promise.all(
            (messagesData || []).map(async (message: RSAMessage) => {
              if (message.is_encrypted && keyPair?.privateKey && message.iv && message.encrypted_aes_key) {
                try {
                  const decryptedContent = await decryptMessage(
                    message.content,
                    message.encrypted_aes_key,
                    message.iv,
                    keyPair.privateKey
                  )
                  return {
                    ...message,
                    content: decryptedContent
                  }
                } catch (error) {
                  console.error('Failed to decrypt message:', error)
                  return {
                    ...message,
                    content: '[Message could not be decrypted]'
                  }
                }
              }
              return message
            })
          )
          setMessages(decryptedMessages)
        }
      }
    } catch (error) {
      console.log('Retrieved error while getting data: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser || sending || !otherUser) return

    setSending(true)
    try {
      if (conversationId && keyPair) {
        let messageContent = newMessage.trim()
        let isEncrypted = false
        let iv = ''
        let encryptedAESKey = ''

        const recipientPublicKey = await getRecipientPublicKey(otherUser.id)
        
        if (recipientPublicKey) {
          try {
            const encrypted = await encryptMessage(messageContent, recipientPublicKey)
            messageContent = encrypted.encryptedMessage
            encryptedAESKey = encrypted.encryptedAESKey
            iv = encrypted.iv
            isEncrypted = true
          } catch (error) {
            console.error('Failed to encrypt message, sending unencrypted:', error)
          }
        }

        const { error } = await sendMessage(conversationId, currentUser.id, messageContent, isEncrypted, iv, encryptedAESKey)
        if (error) {
          console.log('Error: ' + error)
          return
        }
        setNewMessage('')
      }
    } catch (error) {
      console.log('Error occurred while trying to send message: ' + error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading || !isReady) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading conversation...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='flex items-center p-0.5 border-b ml-2 mr-2 border-purple-500 bg-white flex-shrink-0'>
        <div className='flex items-center space-x-3'>
          <div className='w-10 h-10 rounded-full overflow-hidden bg-gray-200'>
            {otherUser?.profile_picture_url ? (
              <Image
                src={otherUser.profile_picture_url}
                alt={otherUser.name}
                width={40}
                height={40}
                className='w-full h-full object-cover'
              />
            ) : (
              <div className='w-full h-full bg-purple-500 flex items-center justify-center text-white font-semibold'>
                {otherUser?.name?.charAt(0) || '?'}
              </div>
            )}
          </div>

          <div>
            <h2 className='font-semibold text-lg'>{otherUser?.name}</h2>
            <p className='text-sm text-gray-500'>@{otherUser?.username}</p>
          </div>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map((message) => (
          <div
            key={message.messages_id}
            className={`flex ${message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender_id === currentUser?.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className='text-sm'>{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.sender_id === currentUser?.id ? 'text-purple-200' : 'text-gray-500'
              }`}>
                {formatTime(message.created_at)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className='p-4 border-t border-purple-500 bg-white flex-shrink-0'>
        <div className='flex items-center space-x-2'>
          <input
            type='text'
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder='Type your message...'
            disabled={sending}
            className='flex-1 p-2 rounded-full border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50'
          />
          <button
            type='submit'
            disabled={!newMessage.trim() || sending}
            className='p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <SendHorizonal className='h-5 w-5' />
          </button>
        </div>
      </form>
    </>
  )
}

export default ConversationPage