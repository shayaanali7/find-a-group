'use client'
import React, { useEffect, useState } from 'react'
import { getConversationUnreadCount, getUserConversations, subscribeToConversations, type Conversation } from '../utils/supabaseComponets/messaging'
import { createClient } from '../utils/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { RealtimeChannel } from '@supabase/supabase-js'

interface ConversationWithDetails extends Conversation {
  other_user: {
    username: string
    name: string
    profile_picture_url?: string
  }
  last_message?: {
    content: string
    created_at: string
    sender_id: string
  }
  unread_count?: number
}

interface ConversationsListProps {
  userId: string
}

const ConversationsList = ({ userId }: ConversationsListProps) => {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchConversations()

    let subscription: RealtimeChannel | null = null
    const setupSubscription = async () => {
      const result = await subscribeToConversations(userId, (updatedConversation) => {
        setConversations(prev => {
          const index = prev.findIndex(c => c.conversation_id === updatedConversation.conversation_id)
          if (index >= 0) {
            const updated = [...prev]
            updated[index] = { ...updated[index], ...updatedConversation }
            return updated.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          }
          return prev
        })
      })
      subscription = result;
    }
    
    setupSubscription();
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      } 
    }
  }, [userId])

  const fetchConversations = async () => {
    try {
      const supabase = createClient();
      const { data: conversationData, error: conversationError } = await getUserConversations(userId);
      if (conversationError) {
        setError('Failed to fetch conversations');
        return
      }
      if (!conversationData) {
        setConversations([]);
        return
      }
      
      const conversationWithDeatils = await Promise.all(
        conversationData.map(async (conv) => {
          const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;
          const { data: userProfile } = await supabase
            .from('profile')
            .select('username, name, profile_picture_url')
            .eq('id', otherUserId)
            .single()
          
          const lastMessage = conv.messages && conv.messages.length > 0
            ? conv.messages[conv.messages.length - 1]
            : null
          const { data: unreadCount } = await getConversationUnreadCount(conv.conversation_id, userId);

          return {
            ...conv,
            other_user: userProfile,
            last_message: lastMessage,
            unread_count: unreadCount
          }
        })
      )
      setConversations(conversationWithDeatils)
    } catch (error) {
      setError('An unexpected error occured');
      console.log('Error getting conversation list: ' + error);
      return 
    } finally {
      setLoading(false);
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1) {
      return 'Just now'
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500'></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-4 text-center text-red-500'>
        {error}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className='p-4 text-center text-gray-500'>
        No conversations yet. Start a conversation!
      </div>
    )
  }

  return (
    <div className='divide-y divide-gray-200'>
      {conversations.map((conversation) => (
        <Link 
          key={conversation.conversation_id} 
          href={`/messages/${conversation.conversation_id}`}
          className='block hover:bg-gray-50 transition-colors'
        >
          <div className='p-4 flex items-center space-x-3'>
            <div className='flex-shrink-0'>
              <div className='w-10 h-10 rounded-full overflow-hidden bg-gray-200'>
                {conversation.other_user?.profile_picture_url ? (
                  <Image 
                    src={conversation.other_user.profile_picture_url} 
                    alt={conversation.other_user.name}
                    width={48}
                    height={48}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full bg-purple-500 flex items-center justify-center text-white font-semibold'>
                    {conversation.other_user?.name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
            </div>
            
            <div className='flex-1 min-w-0 overflow-hidden'>
              <div className='flex items-center justify-between gap-2'>
                <p className='text-xs sm:text-sm font-medium text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap flex-1'>
                  {conversation.other_user?.name || 'Unknown User'}
                </p>
                <p className='text-xs text-gray-500 flex-shrink-0'>
                  {conversation.last_message && formatTime(conversation.last_message.created_at)}
                </p>
              </div>
              
              <p className='text-xs sm:text-sm text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap'>
                @{conversation.other_user?.username || 'unknown'}
              </p>
              
              {conversation.last_message && (
                <p className='text-xs sm:text-sm text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap mt-1'>
                  {conversation.last_message.sender_id === userId ? 'You: ' : ''}
                  {conversation.last_message.content}
                </p>
              )}
            </div>
            
            {conversation.unread_count && conversation.unread_count > 0 && (
              <div className='flex-shrink-0 ml-1 sm:ml-2'>
                <span className='bg-purple-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center'>
                  {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                </span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}

export default ConversationsList