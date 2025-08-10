'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import SendMessage from './SendMessage'
import { useUser } from '../../../lib/store/user'
import ChatMessages from './ChatMessages'
import { createClient } from '@/app/utils/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { markMessageAsRead } from '@/app/utils/supabaseComponets/messaging'

export interface Message {
  messages_id: string,
  sender_id: string,
  created_at: string,
  content: string
}

interface OtherUserProfile {
  id: string;
  name: string;
  username: string;
  profile_picture_url?: string;
}

const fetchOtherUser = async (conversationId: string | undefined, currentUserId: string): Promise<OtherUserProfile | null> => {
  const supabase = createClient();
  if (!conversationId) return null;

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      user1_id,
      user2_id
    `)
    .eq('conversation_id', conversationId)
    .single();

  if (error || !data) {
    console.error('Error fetching conversation:', error);
    return null;
  }

  const otherUserId = data.user1_id === currentUserId ? data.user2_id : data.user1_id;
  const { data: profile, error: profileError } = await supabase
    .from('profile')
    .select('id, name, username, profile_picture_url')
    .eq('id', otherUserId)
    .single();

  if (profileError || !profile) {
    console.error('Error fetching profile:', profileError);
    return null;
  }
  return profile;
};

const ConversationPage = () => {
  const params = useParams()
  const conversationId = Array.isArray(params.conversationId) ? params.conversationId[0] : params.conversationId
  const currentUser = useUser();
  const queryClient = useQueryClient();
  const [otherUser, setOtherUser] = useState<OtherUserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  console.log(currentUser.user?.user_metadata)

  const markAsReadAndUpdateCache = () => {
    if (conversationId && currentUser.user?.id) {
      markMessageAsRead(conversationId, currentUser.user.id);
      queryClient.setQueryData(['conversations', currentUser.user.id], (oldData: unknown) => {
        if (!Array.isArray(oldData)) return oldData;
        
        return oldData.map((conv: any) => {
          if (conv.conversation_id === conversationId) {
            return {
              ...conv,
              unread_count: 0
            };
          }
          return conv;
        });
      });
    }
  };

  useEffect(() => {
    markAsReadAndUpdateCache();
  }, [conversationId, currentUser.user?.id]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        markAsReadAndUpdateCache();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [conversationId, currentUser.user?.id]);

  useEffect(() => {
    const getOtherUser = async () => {
      if (conversationId && currentUser.user?.id) {
        const user = await fetchOtherUser(conversationId, currentUser.user.id);
        setOtherUser(user);
      }
    };

    getOtherUser();
  }, [conversationId, currentUser.user?.id])

  const addOptimisticMessage = (content: string) => {
    if (!currentUser.user || !conversationId) return `temp-${Date.now()}-failed`;

    const tempMessage: Message = {
      messages_id: `temp-${Date.now()}`,
      content: content.trim(),
      sender_id: currentUser.user.id,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempMessage]);
    return tempMessage.messages_id;
  };

  const handleMessageSent = (tempId: string, realMessage: Message) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.messages_id === tempId ? realMessage : msg
      )
    );

    if (currentUser.user?.id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData(['conversations', currentUser.user.id], (oldData: any) => {
        if (!oldData) return oldData;
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return oldData.map((conv: any) => {
          if (conv.conversation_id === conversationId) {
            return {
              ...conv,
              last_message: {
                content: realMessage.content,
                created_at: realMessage.created_at,
                sender_id: realMessage.sender_id
              },
              updated_at: realMessage.created_at,
              unread_count: 0
            };
          }
          return conv;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }).sort((a: any, b: any) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      });
    }
  };

  const handleMessageError = (tempId: string) => {
    setMessages(prev => 
      prev.filter(msg => msg.messages_id !== tempId)
    );
  };

   useEffect(() => {
    if (!conversationId) return;

    const supabase = createClient();    
    const getMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('messages_id, sender_id, created_at, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      
      if (!error && data) {
        setMessages(data);
      }
      setLoading(false);
    };
    getMessages();

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(current => {
            const exists = current.some(msg => msg.messages_id === newMessage.messages_id);
            if (exists) return current;
            return [...current, newMessage];
          });

          if (currentUser.user?.id && newMessage.sender_id !== currentUser.user.id) {
            markMessageAsRead(conversationId, currentUser.user.id);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            queryClient.setQueryData(['conversations', currentUser.user.id], (oldData: any) => {
              if (!oldData) return oldData;
              
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return oldData.map((conv: any) => {
                if (conv.conversation_id === conversationId) {
                  return {
                    ...conv,
                    last_message: {
                      content: newMessage.content,
                      created_at: newMessage.created_at,
                      sender_id: newMessage.sender_id
                    },
                    updated_at: newMessage.created_at,
                    unread_count: 0
                  };
                }
                return conv;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              }).sort((a: any, b: any) => 
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
              );
            });
            queryClient.invalidateQueries({
              queryKey: ['conversations', currentUser.user.id]
            });
            
          } else if (currentUser.user?.id) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            queryClient.setQueryData(['conversations', currentUser.user.id], (oldData: any) => {
              if (!oldData) return oldData;
              
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return oldData.map((conv: any) => {
                if (conv.conversation_id === conversationId) {
                  return {
                    ...conv,
                    last_message: {
                      content: newMessage.content,
                      created_at: newMessage.created_at,
                      sender_id: newMessage.sender_id
                    },
                    updated_at: newMessage.created_at
                  };
                }
                return conv;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const deletedMessage = payload.old as Message;
          setMessages(current => {
            const filtered = current.filter(msg => msg.messages_id !== deletedMessage.messages_id);
            return filtered;
          });

          if (currentUser.user?.id) {
            queryClient.invalidateQueries({
              queryKey: ['conversations', currentUser.user.id]
            });
          }
        }
      )
      .on('postgres_changes', 
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages(current =>
            current.map(msg =>
              msg.messages_id === updatedMessage.messages_id ? updatedMessage : msg
            )
          );

          if (currentUser.user?.id) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            queryClient.setQueryData(['conversations', currentUser.user.id], (oldData: any) => {
              if (!oldData) return oldData;
              
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return oldData.map((conv: any) => {
                if (conv.conversation_id === conversationId) {
                  return {
                    ...conv,
                    last_message: {
                      content: updatedMessage.content,
                      created_at: updatedMessage.created_at,
                      sender_id: updatedMessage.sender_id
                    },
                    updated_at: updatedMessage.created_at
                  };
                }
                return conv;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  }, [conversationId, currentUser.user?.id, queryClient]);
  
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
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        <ChatMessages 
          messages={messages} 
          user={currentUser.user} 
          loading={loading}
        />
      </div>
      <SendMessage 
        conversationId={conversationId} 
        user={currentUser.user}
        onOptimisticAdd={addOptimisticMessage}
        onMessageSent={handleMessageSent}
        onMessageError={handleMessageError}
      />
    </div>
  )
}

export default ConversationPage