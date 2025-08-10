'use client'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useUser } from '../../../lib/store/user'
import { createClient } from '@/app/utils/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { markGroupMessageAsRead } from '@/app/utils/supabaseComponets/messaging'
import SendGroupMessage from '../SendGroupMessage'
import GroupChatMessages from '../GroupChatMessages'

export interface GroupMessage {
  id: string,
  user_id: string,
  created_at: string,
  content: string,
  sender?: {
    name: string,
    username: string,
    profile_picture_url?: string
  }
}

interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  is_owner: boolean;
  user?: {
    name: string;
    username: string;
    profile_picture_url?: string;
  }
}

interface GroupInfo {
  id: string;
  name: string;
  photo_url?: string;
  created_at: string;
  members?: GroupMember[];
}

const fetchGroupInfo = async (groupId: string | undefined): Promise<GroupInfo | null> => {
  const supabase = createClient();
  if (!groupId) return null;

  // Fetch group details
  const { data: groupData, error: groupError } = await supabase
    .from('groups')
    .select('id, name, photo_url, created_at')
    .eq('id', groupId)
    .single();

  if (groupError || !groupData) {
    console.error('Error fetching group:', groupError);
    return null;
  }

  const { data: membersData, error: membersError } = await supabase
    .from('group_members')
    .select('id, group_id, user_id, joined_at, is_owner')
    .eq('group_id', groupId);

  if (membersError) {
    console.error('Error fetching group members:', membersError);
  }

  const membersWithProfiles: GroupMember[] = [];
  if (membersData) {
    for (const member of membersData) {
      const { data: profileData } = await supabase
        .from('profile')
        .select('name, username, profile_picture_url')
        .eq('id', member.user_id)
        .single();

      membersWithProfiles.push({
        ...member,
        user: profileData || undefined
      });
    }
  }

  return {
    ...groupData,
    members: membersWithProfiles
  };
};

const GroupChatPage = () => {
  const params = useParams()
  const groupId = Array.isArray(params.groupchatId) ? params.groupchatId[0] : params.groupchatId
  console.log(groupId);
  const currentUser = useUser();
  const queryClient = useQueryClient();
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const markAsReadAndUpdateCache = () => {
    if (groupId && currentUser.user?.id) {
      markGroupMessageAsRead(groupId, currentUser.user.id);
      queryClient.setQueryData(['group-chats', currentUser.user.id], (oldData: unknown) => {
        if (!Array.isArray(oldData)) return oldData;
        
        return oldData.map((chat: any) => {
          if (chat.group_id === groupId) {
            return {
              ...chat,
              unread_count: 0
            };
          }
          return chat;
        });
      });
    }
  };

  useEffect(() => {
    markAsReadAndUpdateCache();
  }, [groupId, currentUser.user?.id]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        markAsReadAndUpdateCache();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [groupId, currentUser.user?.id]);

  useEffect(() => {
    const getGroupInfo = async () => {
      if (groupId) {
        const info = await fetchGroupInfo(groupId);
        setGroupInfo(info);
      }
    };

    getGroupInfo();
  }, [groupId])

  const addOptimisticMessage = (content: string) => {
    if (!currentUser.user || !groupId) return `temp-${Date.now()}-failed`;

    const tempMessage: GroupMessage = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      user_id: currentUser.user.id,
      created_at: new Date().toISOString(),
      sender: {
        name: currentUser.user.user_metadata?.name || currentUser.user.email?.split('@')[0] || 'You',
        username: currentUser.user.user_metadata?.username || '',
        profile_picture_url: currentUser.user.user_metadata?.profile_picture_url
      }
    };

    setMessages(prev => [...prev, tempMessage]);
    return tempMessage.id;
  };

  const handleMessageSent = (tempId: string, realMessage: GroupMessage) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === tempId ? realMessage : msg
      )
    );

    if (currentUser.user?.id) {
      queryClient.setQueryData(['group-chats', currentUser.user.id], (oldData: any) => {
        if (!oldData) return oldData;
        
        return oldData.map((chat: any) => {
          if (chat.group_id === groupId) {
            return {
              ...chat,
              last_message: {
                content: realMessage.content,
                created_at: realMessage.created_at,
                user_id: realMessage.user_id
              },
              updated_at: realMessage.created_at,
              unread_count: 0
            };
          }
          return chat;
        }).sort((a: any, b: any) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      });
    }
  };

  const handleMessageError = (tempId: string) => {
    setMessages(prev => 
      prev.filter(msg => msg.id !== tempId)
    );
  };

  useEffect(() => {
    if (!groupId) return;
    const supabase = createClient();    
    const getMessages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('group_messages')
          .select('id, user_id, created_at, content')
          .eq('group_id', groupId)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('Error fetching messages:', error);
          setLoading(false);
          return;
        }

        if (data) {
          const userIds = [...new Set(data.map(msg => msg.user_id))];
          
          const { data: profilesData } = await supabase
            .from('profile')
            .select('id, name, username, profile_picture_url')
            .in('id', userIds);

          const profileMap = new Map();
          profilesData?.forEach(profile => {
            profileMap.set(profile.id, profile);
          });

          const messagesWithSenders: GroupMessage[] = data.map(msg => ({
            ...msg,
            sender: profileMap.get(msg.user_id) || undefined
          }));
          
          setMessages(messagesWithSenders);
        }
      } catch (error) {
        console.error('Error in getMessages:', error);
      } finally {
        setLoading(false);
      }
    };
    getMessages();

    const channel = supabase
      .channel(`group-messages-${groupId}`)
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          const newMessage = payload.new as GroupMessage;

          const { data: senderData } = await supabase
            .from('profile')
            .select('name, username, profile_picture_url')
            .eq('id', newMessage.user_id)
            .single();

          const messageWithSender = {
            ...newMessage,
            sender: senderData || undefined
          };

          setMessages(current => {
            const exists = current.some(msg => msg.id === messageWithSender.id);
            if (exists) return current;
            return [...current, messageWithSender];
          });

          if (currentUser.user?.id && newMessage.user_id !== currentUser.user.id) {
            markGroupMessageAsRead(groupId, currentUser.user.id);

            queryClient.setQueryData(['group-chats', currentUser.user.id], (oldData: any) => {
              if (!oldData) return oldData;
              
              return oldData.map((chat: any) => {
                if (chat.group_id === groupId) {
                  return {
                    ...chat,
                    last_message: {
                      content: newMessage.content,
                      created_at: newMessage.created_at,
                      user_id: newMessage.user_id
                    },
                    updated_at: newMessage.created_at,
                    unread_count: 0
                  };
                }
                return chat;
              }).sort((a: any, b: any) => 
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
              );
            });
            queryClient.invalidateQueries({
              queryKey: ['group-chats', currentUser.user.id]
            });
            
          } else if (currentUser.user?.id) {
            queryClient.setQueryData(['group-chats', currentUser.user.id], (oldData: any) => {
              if (!oldData) return oldData;
              
              return oldData.map((chat: any) => {
                if (chat.group_id === groupId) {
                  return {
                    ...chat,
                    last_message: {
                      content: newMessage.content,
                      created_at: newMessage.created_at,
                      user_id: newMessage.user_id
                    },
                    updated_at: newMessage.created_at
                  };
                }
                return chat;
              }).sort((a: any, b: any) => 
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
              );
            });
          }
        }
      )
      .on('postgres_changes', 
        {
          event: 'DELETE',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const deletedMessage = payload.old as GroupMessage;
          setMessages(current => {
            const filtered = current.filter(msg => msg.id !== deletedMessage.id);
            return filtered;
          });

          if (currentUser.user?.id) {
            queryClient.invalidateQueries({
              queryKey: ['group-chats', currentUser.user.id]
            });
          }
        }
      )
      .on('postgres_changes', 
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          const updatedMessage = payload.new as GroupMessage;
          const { data: senderData } = await supabase
            .from('profile')
            .select('name, username, profile_picture_url')
            .eq('id', updatedMessage.user_id)
            .single();

          const messageWithSender = {
            ...updatedMessage,
            sender: senderData || undefined
          };

          setMessages(current =>
            current.map(msg =>
              msg.id === messageWithSender.id ? messageWithSender : msg
            )
          );

          if (currentUser.user?.id) {
            queryClient.setQueryData(['group-chats', currentUser.user.id], (oldData: any) => {
              if (!oldData) return oldData;
              
              return oldData.map((chat: any) => {
                if (chat.group_id === groupId) {
                  return {
                    ...chat,
                    last_message: {
                      content: updatedMessage.content,
                      created_at: updatedMessage.created_at,
                      user_id: updatedMessage.user_id
                    },
                    updated_at: updatedMessage.created_at
                  };
                }
                return chat;
              }).sort((a: any, b: any) => 
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
              );
            });
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, currentUser.user?.id, queryClient]);

  const renderGroupHeader = () => {
    if (!groupInfo) return null;

    const memberCount = groupInfo.members?.length || 0;
    const displayMembers = groupInfo.members?.slice(0, 3) || [];
    const remainingCount = Math.max(0, memberCount - 3);

    return (
      <div className='flex items-center space-x-3'>
        <div className='relative'>
          {groupInfo.photo_url ? (
            <div className='w-10 h-10 rounded-full overflow-hidden bg-gray-200'>
              <Image 
                src={groupInfo.photo_url} 
                alt={groupInfo.name}
                width={40}
                height={40}
                className='w-full h-full object-cover'
              />
            </div>
          ) : (
            <div className='w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold'>
              {groupInfo.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className='flex-1'>
          <h2 className='font-semibold text-lg'>{groupInfo.name}</h2>
          <div className='flex items-center space-x-1'>
            {displayMembers.map((member, index) => (
              <div key={member.id} className='w-4 h-4 rounded-full overflow-hidden bg-gray-300'>
                {member.user?.profile_picture_url ? (
                  <Image 
                    src={member.user.profile_picture_url} 
                    alt={member.user.name}
                    width={16}
                    height={16}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full bg-purple-400 flex items-center justify-center text-white text-xs'>
                    {member.user?.name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
            ))}
            <span className='text-sm text-gray-500 ml-2'>
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
              {remainingCount > 0 && ` (+${remainingCount} more)`}
            </span>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className='w-full flex flex-col h-full overflow-hidden border-l border-purple-500'>
      <div className='flex items-center p-3 border-b ml-2 mr-2 border-purple-500 bg-white flex-shrink-0'>
        {renderGroupHeader()}
      </div>
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        <GroupChatMessages 
          messages={messages} 
          user={currentUser.user} 
          loading={loading}
        />
      </div>
      <SendGroupMessage 
        groupId={groupId}
        user={currentUser.user}
        onOptimisticAdd={addOptimisticMessage}
        onMessageSent={handleMessageSent}
        onMessageError={handleMessageError}
      />
    </div>
  )
}

export default GroupChatPage