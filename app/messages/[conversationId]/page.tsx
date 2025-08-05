'use client'
import { createClient } from '@/app/utils/supabase/client'
import getUserClient, { getName, getUsername } from '@/app/utils/supabaseComponets/getUserClient'
import { getClientPicture } from '@/app/utils/supabaseComponets/getClientPicture'
import { markMessageAsRead, Message, sendMessage, subscribeToMessages } from '@/app/utils/supabaseComponets/messaging'
import { RealtimeChannel } from '@supabase/supabase-js'
import { SendHorizonal, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'

interface UserProfile {
  id: string
  username: string
  name: string
  profile_picture_url?: string | null
}

interface CurrentUserData {
  id: string
  username: string
  name: string
  profile_picture_url: string | null
  imageURL: string | null
}

interface ConversationData {
  user1_id: string
  user2_id: string
}

interface MessagesPage {
  messages: Message[]
  nextCursor?: string
  hasMore: boolean
}

const MESSAGES_PER_PAGE = 30

const fetchCurrentUser = async (): Promise<CurrentUserData> => {
  const user = await getUserClient()
  const imageUrl = await getClientPicture()
  const username = await getUsername(user)
  const name = await getName(user)
  
  if (!user.id) {
    throw new Error('Error getting user id')
  }

  return {
    id: user.id,
    username: username.data?.username || '',
    name: name.data?.name || '',
    profile_picture_url: imageUrl,
    imageURL: imageUrl
  }
}

const fetchConversationData = async (conversationId: string): Promise<ConversationData> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('conversations')
    .select('user1_id, user2_id')
    .eq('conversation_id', conversationId)
    .single()
    
  if (error) {
    throw new Error(`Error fetching conversation: ${error.message}`)
  }
  
  return data
}

const fetchOtherUser = async (conversationData: ConversationData, currentUserId: string): Promise<UserProfile> => {
  const supabase = createClient()
  const otherUserId = conversationData.user1_id === currentUserId ? conversationData.user2_id : conversationData.user1_id
  
  const { data, error } = await supabase
    .from('profile')
    .select('id, username, name, profile_picture_url') 
    .eq('id', otherUserId)
    .single()
  
  if (error) {
    throw new Error(`Error fetching other user: ${error.message}`)
  }
  
  return data
}

const fetchMessagesPaginated = async ({ 
  pageParam, 
  conversationId 
}: { 
  pageParam: string | undefined
  conversationId: string 
}): Promise<MessagesPage> => {
  const supabase = createClient()
  
  let query = supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(MESSAGES_PER_PAGE)
  
  if (pageParam) {
    query = query.lt('created_at', pageParam)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Error fetching messages: ${error.message}`)
  }
  
  const messages = data || []
  const hasMore = messages.length === MESSAGES_PER_PAGE
  const nextCursor = hasMore ? messages[messages.length - 1].created_at : undefined
  
  return {
    messages: messages.reverse(), 
    nextCursor,
    hasMore
  }
}

const ConversationPage = () => {
  const params = useParams()
  const conversationId = Array.isArray(params.conversationId) ? params.conversationId[0] : params.conversationId
  const [newMessage, setNewMessage] = useState<string>('')
  const [sending, setSending] = useState<boolean>(false)
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const {
    data: currentUser,
    isLoading: currentUserLoading,
    error: currentUserError
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })

  const {
    data: conversationData,
    isLoading: conversationLoading,
    error: conversationError
  } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => fetchConversationData(conversationId!),
    enabled: !!conversationId,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })

  const {
    data: otherUser,
    isLoading: otherUserLoading,
    error: otherUserError
  } = useQuery({
    queryKey: ['otherUser', conversationData, currentUser?.id],
    queryFn: () => fetchOtherUser(conversationData!, currentUser!.id),
    enabled: !!conversationData && !!currentUser?.id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })

  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: messagesLoading,
    error: messagesError
  } = useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: ({ pageParam }) => fetchMessagesPaginated({ pageParam, conversationId: conversationId! }),
    enabled: !!conversationId,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })

  const allMessages = useMemo(() => {
    if (!messagesData?.pages) return []
    return messagesData.pages.flatMap(page => page.messages)
  }, [messagesData])

  useEffect(() => {
    if (!conversationId || !currentUser) return

    let subscription: RealtimeChannel | null = null
    const setupSubscription = async () => {
      const result = await subscribeToMessages(conversationId, (newMessage) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryClient.setQueryData(['messages', conversationId], (oldData: any) => {
          if (!oldData) return oldData
          
          const updatedPages = [...oldData.pages]
          if (updatedPages.length > 0) {
            updatedPages[0] = {
              ...updatedPages[0],
              messages: [...updatedPages[0].messages, newMessage]
            }
          }
          
          return {
            ...oldData,
            pages: updatedPages
          }
        })

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
  }, [conversationId, currentUser, queryClient])

  useEffect(() => {
    scrollToBottom()
  }, [allMessages])

  useEffect(() => {
    if (currentUser && conversationId) {
      markMessageAsRead(conversationId, currentUser.id)
    }
  }, [currentUser, conversationId])
  
  useEffect(() => {
  if (!conversationId || !currentUser) return

  let subscription: RealtimeChannel | null = null
  const setupSubscription = async () => {
    const result = await subscribeToMessages(conversationId, (newMessage) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData(['messages', conversationId], (oldData: any) => {
        if (!oldData) return oldData
        
        const updatedPages = [...oldData.pages]
        if (updatedPages.length > 0) {
          updatedPages[0] = {
            ...updatedPages[0],
            messages: [...updatedPages[0].messages, newMessage]
          }
        }
        
        return {
          ...oldData,
          pages: updatedPages
        }
      })

      // Also invalidate conversations list when new message arrives
      queryClient.invalidateQueries({ 
        queryKey: ['conversations', currentUser.id],
        refetchType: 'none'
      });

      if (newMessage.sender_id !== currentUser.id) {
        markMessageAsRead(conversationId, currentUser.id)
      }
    })
    subscription = result
  }

  setupSubscription()
  
  // Cleanup function with better error handling
  return () => {
    if (subscription) {
      try {
        subscription.unsubscribe()
      } catch (error) {
        console.log('Error unsubscribing from messages:', error)
      }
      subscription = null
    }  
  }
}, [conversationId, currentUser, queryClient])

  const handleScroll = useCallback(async () => {
    const container = messagesContainerRef.current
    if (!container || isLoadingMore || !hasNextPage) return

    if (container.scrollTop <= 100) {
      setIsLoadingMore(true)
      const previousScrollHeight = container.scrollHeight
      await fetchNextPage()
      
      setTimeout(() => {
        const newScrollHeight = container.scrollHeight
        const scrollDifference = newScrollHeight - previousScrollHeight
        container.scrollTop = scrollDifference
        setIsLoadingMore(false)
      }, 100)
    }
  }, [fetchNextPage, hasNextPage, isLoadingMore])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser || sending) return

    setSending(true)
    const messageContent = newMessage.trim()
    setNewMessage('')
    
    try {
      if (conversationId) {
        const { data: sentMessage, error } = await sendMessage(conversationId, currentUser.id, messageContent)
        
        if (error) {
          console.log('Error: ' + error)
          setNewMessage(messageContent)
          return 
        }

        if (sentMessage) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          queryClient.setQueryData(['messages', conversationId], (oldData: any) => {
            if (!oldData || !oldData.pages || oldData.pages.length === 0) {
              return {
                pages: [{
                  messages: [sentMessage],
                  hasMore: false,
                  nextCursor: undefined
                }],
                pageParams: [undefined]
              }
            }
            
            const updatedPages = [...oldData.pages]
            const firstPage = updatedPages[0]
            
            const messageExists = firstPage.messages.some(
              (msg: Message) => msg.messages_id === sentMessage.messages_id
            )
            
            if (!messageExists) {
              updatedPages[0] = {
                ...firstPage,
                messages: [...firstPage.messages, sentMessage]
              }
            }
            
            return {
              ...oldData,
              pages: updatedPages
            }
          })
        }
      } 
    } catch (error) {
      console.log('Error occurred while trying to send message: ' + error)
      setNewMessage(messageContent)
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

  const isLoading = currentUserLoading || conversationLoading || otherUserLoading || messagesLoading
  const error = currentUserError || conversationError || otherUserError || messagesError
 
  if (isLoading) {
    return (
      <div className='w-full flex flex-col h-full overflow-hidden items-center justify-center border-l border-purple-500'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading conversation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='w-full flex flex-col h-full overflow-hidden items-center justify-center border-l border-purple-500'>
        <div className='text-center'>
          <p className='text-red-600'>Error loading conversation: {error.message}</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className='w-full flex flex-col h-full overflow-hidden border-l border-purple-500'>
      <div className='flex items-center p-3 border-b ml-2 mr-2 border-purple-500 bg-white flex-shrink-0'>
        <Link href={`/user/${otherUser?.username}`}>
          <div className='flex items-center space-x-3 hover:opacity-70 cursor-pointer transition-all hover:scale-101'>
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
        </Link>
      </div>

      <div 
        ref={messagesContainerRef}
        className='flex-1 overflow-y-auto p-4 space-y-4'
      >
        {(isFetchingNextPage || isLoadingMore) && (
          <div className='flex justify-center py-4'>
            <div className='flex items-center gap-2 text-gray-500'>
              <Loader2 className='w-4 h-4 animate-spin' />
              <span className='text-sm'>Loading more messages...</span>
            </div>
          </div>
        )}

        {hasNextPage && !isFetchingNextPage && !isLoadingMore && (
          <div className='flex justify-center py-2'>
            <div className='text-xs text-gray-400'>
              Scroll up to load more messages
            </div>
          </div>
        )}

        {allMessages.map((message) => (
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
  )
}

export default ConversationPage