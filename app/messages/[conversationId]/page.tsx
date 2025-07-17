import { createClient } from '@/app/utils/supabase/client'
import { getClientPicture } from '@/app/utils/supabaseComponets/getClientPicture'
import getUserClient, { getName, getUsername } from '@/app/utils/supabaseComponets/getUserClient'
import { getConversationMessages, markMessageAsRead, Message, sendMessage, subscribeToMessages } from '@/app/utils/supabaseComponets/messaging'
import { Subscript } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

interface UserProfile {
  id: string
  username: string
  name: string
  profile_picture_url?: string | null
}

const ConversationPage = () => {
  const params = useParams(); 
  const router = useRouter();
  const conversationId = Array.isArray(params.conversationId) ? params.conversationId[0] : params.conversationId

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [sending, setSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    if (conversationId && currentUser) {
      const subscription = subscribeToMessages(conversationId, (newMessage) => {
        setMessages(prev => [...prev, newMessage])
        if (newMessage.sender_id !== currentUser.id) {
          markMessageAsRead(conversationId, currentUser.id);
        }
      })
      return () => {
        subscription.unsubscribe();
      }
    }
  }, [conversationId, currentUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (currentUser && conversationId) {
      markMessageAsRead(conversationId, currentUser.id)
    }
  }, [currentUser, conversationId])

  const initalizeConversation = async () => {
    try { 
      const user = await getUserClient()
      const imageUrl = await getClientPicture()
      const username = await getUsername(user)
      const name = await getName(user)
      
      if (user.id && imageURL) {
        setCurrentUser({
          id: user.id,
          username: username.data?.username || '',
          name: name.data?.name || '',
          profile_picture_url: imageUrl
        })
        setImageURL(imageUrl)
      } else {
        console.log('Error getting user id or image');
      }

      const { data: convoData, error: convoError } = await supabase
        .from('conversations')
        .select('user1_id, user2_id')
        .eq('conversation_id', conversationId)
        .single()
      if (convoError) {
        console.log('Error: ' + convoError);
        return
      }

      const otherUserId = convoData?.user1_id === user.id ? convoData.user2_id : convoData?.user1_id
      const { data: otherUserProfile, error: otherUserError } = await supabase
        .from('profile')
        .select('id, username, name, profile_picture_url') 
        .eq('id', otherUserId)
        .single()
      
      if (otherUserError) {
        console.log('Error: ' + otherUserError);
        return
      }
      setOtherUser(otherUserProfile)

      if (conversationId) {
        const { data: messagesData, error: messagesError } = await getConversationMessages(conversationId);
        if (messagesError) console.log('Error: ' + messagesError);
        setMessages(messagesData || [])
      }
      
    } catch (error) {
      console.log('Retrieved error while getting data: ' + error)
    } finally {
      setLoading(false);
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser || sending) return

    setSending(true);
    try {
      if (conversationId) {
        const { error } = await sendMessage(conversationId, currentUser.id, newMessage.trim())
        if (error){
          console.log('Error: ' + error);
          return 
        }
        setNewMessage('');
      } 
    }
    catch (error) {
      console.log('Error occured while trying to send message: ' + error)
    } finally {
      setSending(false);
    }
  }
  
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
 
  return (
    <div>page</div>
  )
}

export default ConversationPage