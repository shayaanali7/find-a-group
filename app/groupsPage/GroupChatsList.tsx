'use client'
import React from 'react'
import { createClient } from '../utils/supabase/client'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

interface GroupChat {
  id: string
  name: string
  photo_url?: string
  created_at: string
  last_message?: {
    content: string
    created_at: string
    sender_id: string
    sender_name?: string
  }
  member_count?: number
  unread_count?: number
  is_owner?: boolean
}

interface GroupChatsListProps {
  userId: string
}

const supabase = createClient()

const fetchGroupChats = async (userId: string): Promise<GroupChat[]> => {
  try {
    const { data: memberGroups, error: memberError } = await supabase
      .from('group_members')
      .select(`
        group_id,
        is_owner,
        joined_at,
        groups:group_id (
          id,
          name,
          photo_url,
          created_at
        )
      `)
      .eq('user_id', userId)

    if (memberError) {
      throw new Error(`Failed to fetch member groups: ${memberError.message}`)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allGroups: any[] = []
    
    if (memberGroups) {
      memberGroups.forEach(member => {
        const group = member.groups
        const groupObj = Array.isArray(group) ? group[0] : group
        if (groupObj) {
          allGroups.push({
            ...groupObj,
            is_owner: member.is_owner,
            joined_at: member.joined_at
          })
        }
      })
    }

    const groupChatsWithDetails = await Promise.all(
      allGroups.map(async (group) => {
        const { data: lastMessageData } = await supabase
          .from('group_messages')
          .select('content, created_at, user_id')
          .eq('group_id', group.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        let senderName = 'Unknown'
        if (lastMessageData) {
          const { data: senderData } = await supabase
            .from('profile')
            .select('name')
            .eq('id', lastMessageData.user_id)
            .single()
          
          senderName = senderData?.name || 'Unknown'
        }

        const { count: memberCount } = await supabase
          .from('group_members')
          .select('*', { count: 'exact' })
          .eq('group_id', group.id)

        return {
          id: group.id,
          name: group.name,
          photo_url: group.photo_url,
          created_at: group.created_at,
          is_owner: group.is_owner,
          last_message: lastMessageData ? {
            content: lastMessageData.content,
            created_at: lastMessageData.created_at,
            sender_id: lastMessageData.user_id,
            sender_name: senderName
          } : undefined,
          member_count: memberCount || 0,
        }
      })
    )

    groupChatsWithDetails.sort((a, b) => {
      const aTime = a.last_message?.created_at || a.created_at
      const bTime = b.last_message?.created_at || b.created_at
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })

    return groupChatsWithDetails
  } catch (error) {
    console.error('Error fetching group chats:', error)
    throw error
  }
}

const GroupChatsList = ({ userId }: GroupChatsListProps) => {
  const {
    data: groupChats = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['groupChats', userId],
    queryFn: () => fetchGroupChats(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000, 
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  })

  // REMOVED: The useEffect with subscription - now handled by GlobalSubscriptionManager

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffHours < 1) {
      return 'Just now'
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getGroupInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'G'
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500'></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-4 text-center'>
        <div className='text-red-500 mb-2'>Failed to load group chats</div>
        <button 
          onClick={() => refetch()}
          className='text-sm text-purple-600 hover:text-purple-800'
        >
          Retry
        </button>
      </div>
    )
  }

  if (groupChats.length === 0) {
    return (
      <div className='p-4 text-center text-gray-500'>
        No group chats yet. Create or join a group!
      </div>
    )
  }

  return (
    <div className='divide-y divide-gray-200 w-full'>
      {groupChats.map((groupChat) => (
        <Link 
          key={groupChat.id} 
          href={`/groupsPage/${groupChat.id}`}
          className='block hover:bg-gray-50 transition-colors w-full'
        >
          <div className='p-4 flex items-center space-x-3 w-full min-w-0'>
            <div className='flex-shrink-0'>
              {groupChat.photo_url ? (
                <img 
                  src={groupChat.photo_url} 
                  alt={groupChat.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                  onError={(e) => {
                    // Fallback to default if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold ${groupChat.photo_url ? 'hidden' : 'flex'}`}
              >
                {groupChat.photo_url ? (
                  <Users className='w-6 h-6' />
                ) : (
                  <span className='text-sm'>{getGroupInitial(groupChat.name)}</span>
                )}
              </div>
            </div>
            
            <div className='flex-1 min-w-0 overflow-hidden w-full'>
              <div className='flex items-center justify-between gap-2 w-full'>
                <div className='flex items-center gap-2 flex-1 min-w-0'>
                  <p className='text-xs sm:text-sm font-medium text-gray-900 truncate'>
                    {groupChat.name}
                  </p>
                  {groupChat.is_owner && (
                    <span className='text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap'>
                      Owner
                    </span>
                  )}
                </div>
                {groupChat.last_message && (
                  <p className='text-xs text-gray-500 flex-shrink-0 whitespace-nowrap'>
                    {formatTime(groupChat.last_message.created_at)}
                  </p>
                )}
              </div>
              
              <p className='text-xs sm:text-sm text-gray-500 truncate w-full'>
                {groupChat.member_count} {groupChat.member_count === 1 ? 'member' : 'members'}
              </p>
              
              <div className='flex items-center mt-1 w-full min-w-0'>
                {groupChat.last_message ? (
                  <p className='text-xs sm:text-sm text-gray-600 truncate flex-1 min-w-0'>
                    {groupChat.last_message.sender_id === userId ? 'You: ' : `${groupChat.last_message.sender_name}: `}
                    {groupChat.last_message.content}
                  </p>
                ) : (
                  <p className='text-xs sm:text-sm text-gray-400 italic flex-1 min-w-0'>
                    No messages yet
                  </p>
                )}
                {groupChat.unread_count && groupChat.unread_count > 0 && (
                  <span className='ml-2 bg-purple-500 text-white text-xs rounded-full px-2 py-1 flex-shrink-0 min-w-0'>
                    {groupChat.unread_count > 99 ? '99+' : groupChat.unread_count}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default GroupChatsList