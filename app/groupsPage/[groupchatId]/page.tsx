'use client'
import React, { useEffect, useRef, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { SendHorizonal, Users, Upload, X, Trash2, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { GroupInfo, UserProfileLayout } from '@/app/interfaces/interfaces'
import GroupSettingsButton from '../GroupSettingsButton'

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
  isOptimistic?: boolean
  tempId?: string
}

export interface GroupMember {
  user_id: string
  group_id: string
  joined_at: string
  is_owner: boolean
  user?: UserProfileLayout
}

interface GroupData {
  groupInfo: GroupInfo
  groupMembers: GroupMember[]
  messages: GroupMessage[]
  isUserMember: boolean
  isOwner: boolean
}

const supabase = createClient()

const deleteGroupMessage = async (messageId: string): Promise<void> => {
  const { error } = await supabase.from('group_messages').delete().eq('id', messageId)
  if (error) throw new Error(`Error deleting message: ${error.message}`)
}

const fetchGroupData = async (groupId: string, currentUserId: string): Promise<GroupData> => {
  const { data: groupData, error: groupError } = await supabase
    .from('groups').select('*').eq('id', groupId).single()
  if (groupError) throw new Error(`Failed to fetch group: ${groupError.message}`)

  const { data: memberCheck, error: memberError } = await supabase
    .from('group_members').select('*, user_id, is_owner')
    .eq('group_id', groupId).eq('user_id', currentUserId).single()
  if (memberError && memberError.code !== 'PGRST116') throw new Error(`Failed to check membership: ${memberError.message}`)

  const isUserMember = !!memberCheck
  const isOwner = memberCheck?.is_owner || false

  if (!isUserMember) return { groupInfo: groupData, groupMembers: [], messages: [], isUserMember: false, isOwner: false }

  const [{ data: membersData }, { data: messagesData }] = await Promise.all([
    supabase.from('group_members').select('user_id, group_id, joined_at, is_owner').eq('group_id', groupId),
    supabase.from('group_messages').select('id, group_id, user_id, content, created_at').eq('group_id', groupId).order('created_at', { ascending: true })
  ])

  const memberIds = membersData?.map(m => m.user_id) || []
  const { data: memberProfiles } = await supabase.from('profile').select('id, username, name, profile_picture_url').in('id', memberIds)
  const formattedMembers: GroupMember[] = membersData?.map(member => ({
    ...member,
    user: memberProfiles?.find(p => p.id === member.user_id)
  })).filter(m => m.user) || []

  let formattedMessages: GroupMessage[] = []
  if (messagesData) {
    const senderIds = [...new Set(messagesData.map(m => m.user_id))]
    const { data: senderProfiles } = await supabase.from('profile').select('id, username, name, profile_picture_url').in('id', senderIds)
    formattedMessages = messagesData.map(msg => ({ ...msg, sender: senderProfiles?.find(p => p.id === msg.user_id) }))
  }

  return { groupInfo: groupData, groupMembers: formattedMembers, messages: formattedMessages, isUserMember: true, isOwner }
}

const GroupChatPage = () => {
  const params = useParams()
  const groupId = Array.isArray(params.groupchatId) ? params.groupchatId[0] : params.groupchatId
  const queryClient = useQueryClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newMessage, setNewMessage] = useState('')
  const [showMembers, setShowMembers] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [deletingMessages, setDeletingMessages] = useState<Set<string>>(new Set())
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null)

  const currentUser = queryClient.getQueryData<UserProfileLayout>(['userProfile'])
  const { data: groupData, isLoading, error, refetch } = useQuery({
    queryKey: ['groupData', groupId, currentUser?.id],
    queryFn: () => fetchGroupData(groupId!, currentUser!.id),
    enabled: !!groupId && !!currentUser?.id,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })

  useEffect(() => {
    if (!groupId) return
    const sub = supabase.channel(`group-${groupId}`)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` }, 
        (payload) => {
          queryClient.setQueryData(['groupData', groupId, currentUser?.id], (oldData: GroupData | undefined) => 
            oldData ? { ...oldData, messages: oldData.messages.filter((msg: GroupMessage) => msg.id !== payload.old.id) } : oldData
          )
        }).subscribe()
    return () => { sub.unsubscribe() }
  }, [groupId, queryClient, currentUser?.id])

  const handleDeleteMessage = async (messageId: string) => {
    if (deletingMessages.has(messageId)) return
    setDeletingMessages(prev => new Set(prev.add(messageId)))
    try {
      await deleteGroupMessage(messageId)
      queryClient.setQueryData(['groupData', groupId, currentUser?.id], (oldData: GroupData | undefined) =>
        oldData ? { ...oldData, messages: oldData.messages.filter(msg => msg.id !== messageId) } : oldData
      )
    } catch (error) {
      console.error('Error deleting message:', error)
    } finally {
      setDeletingMessages(prev => { const newSet = new Set(prev); newSet.delete(messageId); return newSet })
    }
  }

  const updateGroupPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (groupData?.groupInfo.photo_url) {
        const oldFileName = groupData.groupInfo.photo_url.split('/').pop()
        if (oldFileName) await supabase.storage.from('group-photos').remove([`${oldFileName}`])
      }
      const fileExt = file.name.split('.').pop()
      const fileName = `${groupId}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('group-photos').upload(fileName, file, { upsert: true })
      if (uploadError) throw new Error(`Failed to upload photo: ${uploadError.message}`)
      const { data: { publicUrl } } = supabase.storage.from('group-photos').getPublicUrl(fileName)
      const { error: updateError } = await supabase.from('groups').update({ photo_url: publicUrl }).eq('id', groupId)
      if (updateError) throw new Error(`Failed to update group photo: ${updateError.message}`)
      return publicUrl
    },
    onSuccess: (newPhotoUrl) => {
      queryClient.setQueryData(['groupData', groupId, currentUser?.id], (oldData: GroupData | undefined) =>
        oldData ? { ...oldData, groupInfo: { ...oldData.groupInfo, photo_url: newPhotoUrl } } : oldData
      )
      setIsUploadingPhoto(false)
    },
    onError: (error) => { console.error('Error updating group photo:', error); setIsUploadingPhoto(false) }
  })

  const removeGroupPhotoMutation = useMutation({
    mutationFn: async () => {
      if (groupData?.groupInfo.photo_url) {
        const fileName = groupData.groupInfo.photo_url.split('/').pop()
        if (fileName) await supabase.storage.from('group-photos').remove([fileName])
      }
      const { error: updateError } = await supabase.from('groups').update({ photo_url: null }).eq('id', groupId)
      if (updateError) throw new Error(`Failed to remove group photo: ${updateError.message}`)
    },
    onSuccess: () => {
      queryClient.setQueryData(['groupData', groupId, currentUser?.id], (oldData: GroupData | undefined) =>
        oldData ? { ...oldData, groupInfo: { ...oldData.groupInfo, photo_url: undefined } } : oldData
      )
    },
    onError: (error) => console.error('Error removing group photo:', error)
  })
  
  const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, tempId }: { content: string; tempId: string }) => {
      const { data, error } = await supabase.from('group_messages')
        .insert({ group_id: groupId, user_id: currentUser!.id, content: content.trim() })
        .select('id, created_at').single()
      if (error) throw new Error(`Failed to send message: ${error.message}`)
      return { ...data, tempId }
    },
    onMutate: async ({ content, tempId }) => {
      await queryClient.cancelQueries({ queryKey: ['groupData', groupId, currentUser?.id] })
      const previousData = queryClient.getQueryData<GroupData>(['groupData', groupId, currentUser?.id])
      if (previousData && currentUser) {
        const optimisticMessage: GroupMessage = {
          id: tempId, group_id: groupId!, user_id: currentUser.id, content: content.trim(),
          created_at: new Date().toISOString(), isOptimistic: true, tempId,
          sender: { id: currentUser.id, username: currentUser.username, name: currentUser.name, profile_picture_url: currentUser.profile_picture_url }
        }
        queryClient.setQueryData(['groupData', groupId, currentUser.id], { ...previousData, messages: [...previousData.messages, optimisticMessage] })
      }
      return { previousData }
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['groupData', groupId, currentUser?.id], (oldData: GroupData | undefined) =>
        oldData && currentUser ? {
          ...oldData,
          messages: oldData.messages.map(msg => 
            msg.tempId === variables.tempId ? { ...msg, id: data.id, created_at: data.created_at, isOptimistic: false, tempId: undefined } : msg
          )
        } : oldData
      )
      setNewMessage('')
    },
    onError: (error, variables, context) => {
      if (context?.previousData) queryClient.setQueryData(['groupData', groupId, currentUser?.id], context.previousData)
      console.error('Error sending message:', error)
    }
  })

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !groupData?.isOwner) return
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { alert('Image size should be less than 5MB'); return }
    setIsUploadingPhoto(true)
    updateGroupPhotoMutation.mutate(file)
  }

  const handlePhotoClick = () => { if (groupData?.isOwner && fileInputRef.current) fileInputRef.current.click() }
  const handleRemovePhoto = (e: React.MouseEvent) => { e.stopPropagation(); if (groupData?.isOwner) removeGroupPhotoMutation.mutate() }
  const getGroupInitial = (name: string) => name ? name.charAt(0).toUpperCase() : 'G'

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [groupData?.messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser || sendMessageMutation.isPending || !groupData?.isUserMember) return
    const tempId = generateTempId()
    sendMessageMutation.mutate({ content: newMessage.trim(), tempId })
  }

  const formatTime = (timestamp: string) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (isLoading) {
    return (
      <div className='w-full flex flex-col h-full overflow-y-auto bg-white border-l-1 md:border-l-1 border-purple-500 items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading group chat...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='w-full flex flex-col h-full overflow-y-auto bg-white border-l-1 md:border-l-1 border-purple-500 items-center justify-center'>
        <div className='text-center'>
          <div className='text-red-500 text-xl mb-4'>Error</div>
          <p className='text-gray-600'>Failed to load group chat.</p>
          <button onClick={() => refetch()} className='mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600'>Retry</button>
        </div>
      </div>
    )
  }

  if (!groupData?.isUserMember) {
    return (
      <div className='w-full flex flex-col h-full overflow-y-auto bg-white border-l-1 md:border-l-1 border-purple-500 items-center justify-center'>
        <div className='text-center'>
          <div className='text-red-500 text-xl mb-4'>Access Denied</div>
          <p className='text-gray-600'>You are not a member of this group chat.</p>
        </div>
      </div>
    )
  }

  const { groupInfo, groupMembers, messages, isOwner } = groupData
  return (
    <div className='w-full flex flex-col h-full overflow-y-auto bg-white border-l-1 md:border-l-1 border-purple-500'>
      <div className='flex items-center justify-between p-3 border-b ml-2 mr-2 border-purple-500 bg-white flex-shrink-0'>
        <div className='flex items-center space-x-3'>
          <div className='relative group'>
            {groupInfo?.photo_url ? (
              <div className='relative'>
                <img 
                  src={groupInfo.photo_url} alt={groupInfo.name}
                  className={`w-10 h-10 rounded-full object-cover border-2 border-purple-200 ${isOwner ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''}`}
                  onClick={handlePhotoClick}
                  onError={(e) => { const target = e.target as HTMLImageElement; target.style.display = 'none'; const fallback = target.nextElementSibling as HTMLElement; if (fallback) fallback.style.display = 'flex' }}
                />
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 items-center justify-center text-white font-semibold hidden ${isOwner ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''}`} onClick={handlePhotoClick}>
                  <span className='text-sm'>{getGroupInitial(groupInfo.name)}</span>
                </div>
                {isOwner && (
                  <>
                    <div className='absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer' onClick={handlePhotoClick}>
                      <Upload className='w-4 h-4 text-white' />
                    </div>
                    <button onClick={handleRemovePhoto} className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity' title='Remove photo'>
                      <X className='w-3 h-3 text-white' />
                    </button>
                  </>
                )}
                {isUploadingPhoto && (
                  <div className='absolute inset-0 bg-white bg-opacity-75 rounded-full flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500'></div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold relative ${isOwner ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''}`} onClick={handlePhotoClick}>
                <span className='text-sm'>{getGroupInitial(groupInfo.name)}</span>
                {isOwner && (
                  <div className='absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer'>
                    <Upload className='w-4 h-4 text-white' />
                  </div>
                )}
                {isUploadingPhoto && (
                  <div className='absolute inset-0 bg-white bg-opacity-75 rounded-full flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500'></div>
                  </div>
                )}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" disabled={!isOwner || isUploadingPhoto} />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h2 className='font-semibold text-lg'>{groupInfo?.name}</h2>
              {isOwner && <span className='text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full'>Owner</span>}
            </div>
            <p className='text-sm text-gray-500'>{groupMembers.length} members</p>
          </div>
        </div>
        <div className='flex justify-between gap-2.5'>
          <button onClick={() => setShowMembers(!showMembers)} className='p-2 transform transition-all hover:bg-purple-300 duration-300 rounded-full'>
            <Users className='w-5 h-5' />
          </button>
          {isOwner && <GroupSettingsButton groupMembers={groupMembers} groupId={groupId} /> }
        </div>
      </div>

      <div className={`bg-gray-50 border-b border-purple-500 overflow-hidden transition-all duration-300 ease-in-out ${showMembers ? 'max-h-40 py-4 px-4 opacity-100' : 'max-h-0 py-0 px-4 opacity-0'}`}>
        <h3 className='font-semibold text-sm mb-2'>Group Members</h3>
        <div className='flex flex-wrap gap-2'>
          {groupMembers.map((member) => (
            <Link href={`/user/${member.user?.username}`} className='transform transition-all duration-300 hover:scale-102 hover:opacity-70' key={member.user?.id}>
              <div className='flex items-center space-x-2 bg-white rounded-full px-3 py-1 text-sm'>
                <div className='w-6 h-6 rounded-full overflow-hidden bg-gray-200'>
                  {member.user?.profile_picture_url ? (
                    <Image src={member.user.profile_picture_url} alt={member.user.name} width={24} height={24} className='w-full h-full object-cover' />
                  ) : (
                    <div className='w-full h-full bg-purple-500 flex items-center justify-center text-white text-xs font-semibold'>
                      {member.user?.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div className='flex items-center gap-2'>
                  <span className='font-medium text-gray-900'>{member.user?.name || 'Unknown User'}</span>
                  <span className='text-gray-500'>{member.user?.username ? `@${member.user.username}` : ''}</span>
                  {member.is_owner && <span className='text-xs text-purple-600 font-medium'>(Owner)</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.length === 0 ? (
          <div className='text-center text-gray-500 mt-8'>
            <Users className='w-12 h-12 mx-auto mb-2 text-gray-300' />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.user_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                 onMouseEnter={() => setHoveredMessage(message.id)} onMouseLeave={() => setHoveredMessage(null)}>
              <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${message.user_id === currentUser?.id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {message.user_id !== currentUser?.id && (
                  <div className='w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0'>
                    {message.sender?.profile_picture_url ? (
                      <Image src={message.sender.profile_picture_url} alt={message.sender.name} width={32} height={32} className='w-full h-full object-cover' />
                    ) : (
                      <div className='w-full h-full bg-purple-500 flex items-center justify-center text-white text-xs font-semibold'>
                        {message.sender?.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                )}
                {message.user_id === currentUser?.id && (
                  <button onClick={() => handleDeleteMessage(message.id)} disabled={deletingMessages.has(message.id)}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-red-100 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${hoveredMessage === message.id ? 'opacity-100' : ''}`} title="Delete message">
                    {deletingMessages.has(message.id) ? <Loader2 className='w-4 h-4 animate-spin' /> : <Trash2 className='w-4 h-4' />}
                  </button>
                )}
                <div className={`group relative ${message.user_id === currentUser?.id ? 'flex-row-reverse' : ''}`}>
                  <div className={`px-4 py-2 rounded-lg ${message.user_id === currentUser?.id ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-800'} ${deletingMessages.has(message.id) ? 'opacity-50' : ''}`}>
                    {message.user_id !== currentUser?.id && <p className='text-xs font-semibold mb-1'>{message.sender?.name}</p>}
                    <p className='text-sm'>{message.content}</p>
                    <p className={`text-xs mt-1 ${message.user_id === currentUser?.id ? 'text-purple-200' : 'text-gray-500'}`}>{formatTime(message.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className='p-4 border-t border-purple-500 bg-white flex-shrink-0'>
        <div className='flex items-center space-x-2'>
          <input type='text' value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
            placeholder={groupData.isUserMember ? 'Type your message...' : 'You cannot send messages'}
            disabled={sendMessageMutation.isPending || !groupData.isUserMember}
            className='flex-1 p-2 rounded-full border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50' />
          <button type='submit' disabled={!newMessage.trim() || sendMessageMutation.isPending || !groupData.isUserMember}
            className='p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed'>
            <SendHorizonal className='h-5 w-5' />
          </button>
        </div>
      </form>
    </div>
  )
}

export default GroupChatPage