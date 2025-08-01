'use client'
import ConversationsList from '@/app/components/ConversationsList'
import ProfileButton from '@/app/components/ProfileButton'
import SearchBar from '@/app/components/searchbar'
import { createClient } from '@/app/utils/supabase/client'
import { getClientPicture } from '@/app/utils/supabaseComponets/getClientPicture'
import getUserClient, { getName, getUsername } from '@/app/utils/supabaseComponets/getUserClient'
import { getConversationMessages, markMessageAsRead, Message, sendMessage, subscribeToMessages } from '@/app/utils/supabaseComponets/messaging'
import { RealtimeChannel } from '@supabase/supabase-js'
import { Home, SendHorizonal, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'

interface UserProfile {
  id: string
  username: string
  name: string
  profile_picture_url?: string | null
}

const ConversationPage = () => {
  const params = useParams(); 
  const conversationId = Array.isArray(params.conversationId) ? params.conversationId[0] : params.conversationId
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [sending, setSending] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [conversationsLoaded, setConversationsLoaded] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    initalizeConversation();
  }, [conversationId])

  useEffect(() => {
    if (conversationId && currentUser) {
      let subscription: RealtimeChannel | null = null;
      const setupSubscription = async () => {
        const result = await subscribeToMessages(conversationId, (newMessage) => {
          setMessages(prev => [...prev, newMessage])
          if (newMessage.sender_id !== currentUser.id) {
            markMessageAsRead(conversationId, currentUser.id);
          }
        });
        subscription = result;
      }

      setupSubscription();
      return () => {
        if (subscription) {
          subscription?.unsubscribe();
        }  
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

  const toggleSidebar = (): void => {
    setIsSidebarOpen(!isSidebarOpen);
  }

  const handleSidebarItemClick = (): void => {
    setIsSidebarOpen(false);
  }

  const initalizeConversation = async () => {
    try { 
      const user = await getUserClient()
      const imageUrl = await getClientPicture()
      console.log(imageURL);
      const username = await getUsername(user)
      const name = await getName(user)
      
      if (user.id && imageUrl) {
        setCurrentUser({
          id: user.id,
          username: username.data?.username || '',
          name: name.data?.name || '',
          profile_picture_url: imageUrl
        })
        setImageURL(imageUrl)
      }
      else if (user.id) {
        setCurrentUser({
          id: user.id,
          username: username.data?.username || '',
          name: name.data?.name || '',
          profile_picture_url: null
        })
        setImageURL(null)
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

  const memoizedConversationsList = useMemo(() => {
    if (!currentUser?.id) return null;
    
    if (!conversationsLoaded) {
      setConversationsLoaded(true);
    }
    return <ConversationsList userId={currentUser.id} />;
  }, [currentUser?.id, conversationsLoaded]);

  const SidebarContent: React.FC<{ onItemClick?: () => void }> = useCallback(({ onItemClick }) => (
    <div className='h-full bg-white flex flex-col'>
      <div className='border-b-1 border-purple-500 ml-2 mr-2'>
        <Link href='/mainPage'>
          <button 
            onClick={onItemClick}
            className='flex items-center w-9/10 gap-2 m-1 ml-2 hover:bg-purple-200 p-2 rounded-full text-xl'>
            <Home className='text-3xl' />
            <span>Home</span>
          </button>
        </Link>
      </div>
      <div className='flex-1 overflow-y-auto'>
        {memoizedConversationsList}
      </div>
    </div>
  ), [memoizedConversationsList])
 
  if (loading) {
    return (
      <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
        <div className='w-full flex justify-center border-b border-purple-500 pb-2 flex-shrink-0'>
          <div className='md:w-12 w-16'></div>
          
          <div className='flex-1 flex justify-center'>
            <SearchBar placeholder='Search for a post'/>
          </div>

          <div className='md:w-12 w-16 flex justify-end'>
            {currentUser?.name && <ProfileButton imageURL={imageURL} username={currentUser?.username || ''} name={currentUser?.name}/>}
          </div>
        </div>

        <div className='w-full flex flex-1 overflow-hidden items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading conversation...</p>
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
      <div className='w-full flex justify-center border-b border-purple-500 pb-2 flex-shrink-0'>
        <div className='md:w-12 w-16 flex justify-start'>
          <button
            onClick={toggleSidebar}
            className='md:hidden p-1.5 hover:bg-purple-200 rounded-full'
          >
            <Menu className='w-6 h-6' />
          </button>
        </div>
        
        <div className='flex-1 flex justify-center'>
          <SearchBar placeholder='Search for a post'/>
        </div>

        <div className='md:w-12 w-16 flex justify-end'>
          {currentUser && <ProfileButton imageURL={imageURL} username={currentUser?.username} name={currentUser.name}/>}
        </div>
      </div>

      <div className='w-full flex flex-1 overflow-hidden'>
        <div className='hidden md:flex md:w-1/5 h-full'>
          <SidebarContent />
        </div>

        <div className={`md:hidden fixed left-0 top-0 h-full w-64 bg-white border-r border-purple-500 z-50 
          transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className='p-4 border-b border-purple-500 flex justify-between items-center'>
            <h2 className='text-lg font-semibold'>Menu</h2>
            <button 
              onClick={toggleSidebar}
              className='p-2 hover:bg-purple-200 rounded-full'
            >
              <X className='w-6 h-6' />
            </button>
          </div>
          <SidebarContent onItemClick={handleSidebarItemClick} />
        </div>

        <div className='w-full flex flex-col h-full overflow-y-auto bg-white border-l-1 md:border-l-1 border-purple-500'>
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
        </div>
      </div>
    </main>
  )
}

export default ConversationPage