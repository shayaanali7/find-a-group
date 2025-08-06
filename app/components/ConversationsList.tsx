'use client'
import React, { useEffect } from 'react'
import { getConversationUnreadCount, getUserConversations, type Conversation } from '../utils/supabaseComponets/messaging'
import { createClient } from '../utils/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'

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

const fetchConversations = async (userId: string): Promise<ConversationWithDetails[]> => {
  try {
    const supabase = createClient();
    const { data: conversationData, error: conversationError } = await getUserConversations(userId);
    if (conversationError) {
      throw new Error('Failed to fetch conversations');
    }
    if (!conversationData) {
      return [];
    }
    
    const conversationWithDetails = await Promise.all(
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
    
    return conversationWithDetails.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  } catch (error) {
    console.log('Error getting conversation list: ' + error);
    throw new Error('An unexpected error occurred');
  }
}

const ConversationsList = ({ userId }: ConversationsListProps) => {
  const pathname = usePathname();

  const {
    data: conversations = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['conversations', userId],
    queryFn: () => fetchConversations(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  });

  useEffect(() => {
    if (pathname && pathname.includes('/messages/') && userId) {
      const timer = setTimeout(() => {
        refetch();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [pathname, userId, refetch]);

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
      <div className='p-4 text-center'>
        <div className='text-red-500 mb-2'>
          {error instanceof Error ? error.message : 'Failed to load conversations'}
        </div>
        <button 
          onClick={() => refetch()}
          className='text-sm text-purple-600 hover:text-purple-800'
        >
          Retry
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className='p-4 text-center text-gray-500'>
        No conversations yet. Start a conversation!
      </div>
    );
  }

  return (
    <div className='divide-y divide-gray-200 w-full'>
      {conversations.map((conversation) => (
        <Link 
          key={conversation.conversation_id} 
          href={`/messages/${conversation.conversation_id}`}
          className='block hover:bg-gray-50 transition-colors w-full'
        >
          <div className='p-4 flex items-center space-x-3 w-full min-w-0'>
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
            
            <div className='flex-1 min-w-0 overflow-hidden w-full'>
              <div className='flex items-center justify-between gap-2 w-full'>
                <p className='text-xs sm:text-sm font-medium text-gray-900 truncate flex-1 min-w-0'>
                  {conversation.other_user?.name || 'Unknown User'}
                </p>
                {conversation.last_message && (
                  <p className='text-xs text-gray-500 flex-shrink-0 whitespace-nowrap'>
                    {formatTime(conversation.last_message.created_at)}
                  </p>
                )}
              </div>
              
              <p className='text-xs sm:text-sm text-gray-500 truncate w-full'>
                @{conversation.other_user?.username || 'unknown'}
              </p>
              
              <div className='flex items-center mt-1 w-full min-w-0'>
                {conversation.last_message && (
                  <p className='text-xs sm:text-sm text-gray-600 truncate flex-1 min-w-0'>
                    {conversation.last_message.sender_id === userId ? 'You: ' : ''}
                    {conversation.last_message.content}
                  </p>
                )}
                {conversation.unread_count && conversation.unread_count > 0 && (
                  <span className='ml-2 bg-purple-500 text-white text-xs rounded-full px-2 py-1 flex-shrink-0 min-w-0'>
                    {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                  </span>
                )}
              </div>
            </div>            
          </div>
        </Link>
      ))}
    </div>
  );
}

export default ConversationsList