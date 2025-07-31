'use client'
import ProfileButton from '@/app/components/ProfileButton'
import SearchBar from '@/app/components/searchbar'
import { createClient } from '@/app/utils/supabase/client'
import { getClientPicture } from '@/app/utils/supabaseComponets/getClientPicture'
import getUserClient, { getName, getUsername } from '@/app/utils/supabaseComponets/getUserClient'
import { RealtimeChannel } from '@supabase/supabase-js'
import { Home, Menu, SendHorizonal, Users, X } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import GroupChatsList from '../GroupChatsList'
import Link from 'next/link'

interface GroupMessage {
  id: string
  group_id: string
  user_id: string
  content: string
  created_at: string
  sender?: {
    id: string
    username: string
    name: string
    profile_picture_url?: string | null
  }
}

interface UserProfile {
  id: string
  username: string
  name: string
  profile_picture_url?: string | null
}

interface GroupInfo {
  id: string
  name: string
  created_at: string
}

interface GroupMember {
  user_id: string
  group_id: string
  joined_at: string
  is_owner: boolean
  user?: UserProfile
}

const GroupChatPage = () => {
  const params = useParams();
  const groupId = Array.isArray(params.groupchatId) ? params.groupchatId[0] : params.groupchatId

  const [messages, setMessages] = useState<GroupMessage[]>([])
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null)
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])
  const [newMessage, setNewMessage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [imageURL, setImageURL] = useState<string | null>(null)
  const [sending, setSending] = useState<boolean>(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)
  const [showMembers, setShowMembers] = useState<boolean>(false)
  const [isUserMember, setIsUserMember] = useState<boolean>(false)
  const [isOwner, setIsOwner] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const supabase = createClient();

  useEffect(() => {
    initializeGroupChat();
  }, [groupId])

  useEffect(() => {
    if (groupId && currentUser && isUserMember) {
      let subscription: RealtimeChannel | null = null
      const setupSubscription = async () => {
        subscription = supabase
          .channel(`group_messages:${groupId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'group_messages',
              filter: `group_id=eq.${groupId}`
            },
            async (payload) => {
              const newMessage = payload.new as GroupMessage
              
              // Get sender data separately to avoid TypeScript issues
              const { data: senderData } = await supabase
                .from('profile')
                .select('id, username, name, profile_picture_url')
                .eq('id', newMessage.user_id)
                .single()
              
              if (senderData) {
                newMessage.sender = senderData
              }
              
              setMessages(prev => [...prev, newMessage])
            }
          )
          .subscribe((status) => {
            console.log('Group subscription status:', status)
          })
      }

      setupSubscription()
      return () => {
        if (subscription) {
          subscription.unsubscribe()
        }
      }
    }
  }, [groupId, currentUser, supabase, isUserMember])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeGroupChat = async () => {
    try {
      const user = await getUserClient()
      const imageUrl = await getClientPicture()
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

      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single()

      if (groupError) {
        console.error('Error fetching group:', groupError)
        setLoading(false)
        return
      }
      setGroupInfo(groupData)
    
      const { data: memberCheck, error: memberError } = await supabase
        .from('group_members')
        .select('*, user_id, is_owner')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single()

      if (memberError && memberError.code !== 'PGRST116') {
        console.error('Error checking membership:', memberError)
        setLoading(false)
        return
      }

      if (!memberCheck) {
        console.error('User is not a member of this group')
        setLoading(false)
        return
      }

      setIsUserMember(true)
      setIsOwner(memberCheck.is_owner)

      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('user_id, group_id, joined_at, is_owner')
        .eq('group_id', groupId)

      if (membersError) {
        console.error('Error fetching members:', membersError)
      }
      console.log(groupId)
      console.log(membersData)

      const memberIds = membersData?.map(m => m.user_id) || []

      const { data: memberProfiles, error: profilesError } = await supabase
        .from('profile')
        .select('id, username, name, profile_picture_url')
        .in('id', memberIds)

      if (profilesError) {
        console.error('Error fetching member profiles:', profilesError)
      }

      const formattedMembers: GroupMember[] = []
      if (membersData && memberProfiles) {
        membersData.forEach(member => {
          const profile = memberProfiles.find(p => p.id === member.user_id)
          if (profile) {
            formattedMembers.push({
              ...member,
              user: profile
            })
          }
        })
      }
      setGroupMembers(formattedMembers)

      const { data: messagesData, error: messagesError } = await supabase
        .from('group_messages')
        .select('id, group_id, user_id, content, created_at')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
      if (messagesError) {
        console.error('Error fetching messages:', messagesError)
      }

      if (messagesData) {
        const senderIds = [...new Set(messagesData.map(m => m.user_id))]
        const { data: senderProfiles } = await supabase
          .from('profile')
          .select('id, username, name, profile_picture_url')
          .in('id', senderIds)

        const formattedMessages = messagesData.map(msg => ({
          ...msg,
          sender: senderProfiles?.find(p => p.id === msg.user_id)
        })) 
        setMessages(formattedMessages)
      }

    } catch (error) {
      console.error('Error initializing group chat:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser || sending || !isUserMember) return

    setSending(true)
    try {
      const { error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          user_id: currentUser.id,
          content: newMessage.trim()
        })

      if (error) {
        console.error('Error sending message:', error)
        return
      }
      
      setNewMessage('')
    } catch (error) {
      console.error('Error occurred while sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleSidebarItemClick = () => {
    setIsSidebarOpen(false)
  }

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
        {currentUser?.id && <GroupChatsList userId={currentUser.id} />}
      </div>
    </div>
  ), [currentUser?.id])

  if (loading) {
    return (
      <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
        <div className='w-full flex justify-center border-b border-purple-500 pb-2 flex-shrink-0'>
          <div className='md:w-12 w-16'></div>
          
          <div className='flex-1 flex justify-center'>
            <SearchBar placeholder='Search for a post'/>
          </div>

          <div className='md:w-12 w-16 flex justify-end'>
            <ProfileButton imageURL={imageURL} username={currentUser?.username || ''}/>
          </div>
        </div>

        <div className='w-full flex flex-1 overflow-hidden items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading group chat...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!isUserMember) {
    return (
      <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
        <div className='w-full flex justify-center border-b border-purple-500 pb-2 flex-shrink-0'>
          <div className='md:w-12 w-16'></div>
          
          <div className='flex-1 flex justify-center'>
            <SearchBar placeholder='Search for a post'/>
          </div>

          <div className='md:w-12 w-16 flex justify-end'>
            <ProfileButton imageURL={imageURL} username={currentUser?.username || ''}/>
          </div>
        </div>

        <div className='w-full flex flex-1 overflow-hidden items-center justify-center'>
          <div className='text-center'>
            <div className='text-red-500 text-xl mb-4'>Access Denied</div>
            <p className='text-gray-600'>You are not a member of this group chat.</p>
          </div>
        </div>
      </main>
    )
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
          {currentUser && <ProfileButton imageURL={imageURL} username={currentUser?.username}/>}
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
          <div className='flex items-center justify-between p-3 border-b ml-2 mr-2 border-purple-500 bg-white flex-shrink-0'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold'>
                <Users className='w-6 h-6' />
              </div>
              
              <div>
                <div className='flex items-center gap-2'>
                  <h2 className='font-semibold text-lg'>{groupInfo?.name}</h2>
                  {isOwner && (
                    <span className='text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full'>
                      Owner
                    </span>
                  )}
                </div>
                <p className='text-sm text-gray-500'>{groupMembers.length} members</p>
              </div>
            </div>

            <button
              onClick={() => setShowMembers(!showMembers)}
              className='p-2 hover:bg-purple-200 rounded-full'
            >
              <Users className='w-5 h-5' />
            </button>
          </div>

          {showMembers && (
            <div className='bg-gray-50 border-b border-purple-500 p-4 max-h-32 overflow-y-auto'>
              <h3 className='font-semibold text-sm mb-2'>Group Members</h3>
              <div className='flex flex-wrap gap-2'>
                {groupMembers.map((member) => (
                  <div key={member.user_id} className='flex items-center space-x-2 bg-white rounded-full px-3 py-1 text-sm'>
                    <div className='w-6 h-6 rounded-full overflow-hidden bg-gray-200'>
                      {member.user?.profile_picture_url ? (
                        <Image 
                          src={member.user.profile_picture_url} 
                          alt={member.user.name}
                          width={24}
                          height={24}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full bg-purple-500 flex items-center justify-center text-white text-xs font-semibold'>
                          {member.user?.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <span className='flex items-center gap-1'>
                      {member.user?.name}
                      {member.is_owner && (
                        <span className='text-xs text-purple-600'>(Owner)</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className='flex-1 overflow-y-auto p-4 space-y-4'>
            {messages.length === 0 ? (
              <div className='text-center text-gray-500 mt-8'>
                <Users className='w-12 h-12 mx-auto mb-2 text-gray-300' />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.user_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className='flex items-start space-x-2 max-w-xs lg:max-w-md'>
                    {message.user_id !== currentUser?.id && (
                      <div className='w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0'>
                        {message.sender?.profile_picture_url ? (
                          <Image 
                            src={message.sender.profile_picture_url} 
                            alt={message.sender.name}
                            width={32}
                            height={32}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full bg-purple-500 flex items-center justify-center text-white text-xs font-semibold'>
                            {message.sender?.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.user_id === currentUser?.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {message.user_id !== currentUser?.id && (
                        <p className='text-xs font-semibold mb-1'>{message.sender?.name}</p>
                      )}
                      <p className='text-sm'>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.user_id === currentUser?.id ? 'text-purple-200' : 'text-gray-500'
                      }`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className='p-4 border-t border-purple-500 bg-white flex-shrink-0'>
            <div className='flex items-center space-x-2'>
              <input
                type='text'
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isUserMember ? 'Type your message...' : 'You cannot send messages'}
                disabled={sending || !isUserMember}
                className='flex-1 p-2 rounded-full border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50'
              />
              <button
                type='submit'
                disabled={!newMessage.trim() || sending || !isUserMember}
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

export default GroupChatPage