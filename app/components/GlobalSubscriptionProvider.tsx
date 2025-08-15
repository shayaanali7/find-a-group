'use client'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/app/utils/supabase/client'
import { useUser } from '@/lib/store/user'

interface GlobalSubscriptionProviderProps {
  children: React.ReactNode;
}

interface Message {
  messages_id: string;
  sender_id: string;
  created_at: string;
  content: string;
  conversation_id: string;
}

interface GroupMessage {
  id: string;
  user_id: string;
  created_at: string;
  content: string;
  group_id: string;
}

const GlobalSubscriptionProvider = ({ children }: GlobalSubscriptionProviderProps) => {
  const queryClient = useQueryClient();
  const currentUser = useUser();

  useEffect(() => {
    if (!currentUser?.user?.id) return;

    const supabase = createClient();
    
    const channel = supabase
      .channel('global-messages')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as Message;
          queryClient.invalidateQueries({
            queryKey: ['conversations', currentUser?.user?.id]
          });

          const messagesQueryKey = ['messages', newMessage.conversation_id];
          const existingMessagesData = queryClient.getQueryData(messagesQueryKey);

          if (existingMessagesData) {
            queryClient.setQueryData(messagesQueryKey, (oldData: any) => {
              if (!oldData) return oldData;
              
              const messageExists = oldData.pages.some((page: any) => 
                page.messages.some((msg: any) => msg.messages_id === newMessage.messages_id)
              );
              if (messageExists) return oldData;
    
              const newPages = [...oldData.pages];
              if (newPages[0]) {
                newPages[0] = {
                  ...newPages[0],
                  messages: [...newPages[0].messages, newMessage]
                };
              }
              
              return {
                ...oldData,
                pages: newPages
              };
            });
          }
        }
      )
      .on('postgres_changes', 
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          queryClient.invalidateQueries({
            queryKey: ['conversations', currentUser?.user?.id]
          });

          const messagesQueryKey = ['messages', updatedMessage.conversation_id];
          const existingMessagesData = queryClient.getQueryData(messagesQueryKey);

          if (existingMessagesData) {
            queryClient.setQueryData(messagesQueryKey, (oldData: any) => {
              if (!oldData) return oldData;
              
              const newPages = oldData.pages.map((page: any) => ({
                ...page,
                messages: page.messages.map((msg: any) =>
                  msg.messages_id === updatedMessage.messages_id ? updatedMessage : msg
                )
              }));
              
              return {
                ...oldData,
                pages: newPages
              };
            });
          }
        }
      )
      .on('postgres_changes', 
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const deletedMessage = payload.old as Message;
          queryClient.invalidateQueries({
            queryKey: ['conversations', currentUser?.user?.id]
          });

          const messagesQueryKey = ['messages', deletedMessage.conversation_id];
          const existingMessagesData = queryClient.getQueryData(messagesQueryKey);
          if (existingMessagesData) {
            queryClient.setQueryData(messagesQueryKey, (oldData: any) => {
              if (!oldData) return oldData;
              
              const newPages = oldData.pages.map((page: any) => ({
                ...page,
                messages: page.messages.filter((msg: any) => msg.messages_id !== deletedMessage.messages_id)
              }));
              
              return {
                ...oldData,
                pages: newPages
              };
            });
          }
        }
      )
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages'
        },
        (payload) => {
          const newGroupMessage = payload.new as GroupMessage;
          queryClient.invalidateQueries({
            queryKey: ['group-chats', currentUser?.user?.id]
          });

          const groupMessagesQueryKey = ['group-messages', newGroupMessage.group_id];
          const existingGroupMessagesData = queryClient.getQueryData(groupMessagesQueryKey);

          if (existingGroupMessagesData) {
            queryClient.setQueryData(groupMessagesQueryKey, (oldData: any) => {
              if (!oldData) return oldData;
              
              const messageExists = Array.isArray(oldData) && 
                oldData.some((msg: any) => msg.id === newGroupMessage.id);
              if (messageExists) return oldData;
              
              return Array.isArray(oldData) ? [...oldData, newGroupMessage] : oldData;
            });
          }
        }
      )
      .on('postgres_changes', 
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'group_messages'
        },
        (payload) => {
          const updatedGroupMessage = payload.new as GroupMessage;
          queryClient.invalidateQueries({
            queryKey: ['group-chats', currentUser?.user?.id]
          });

          const groupMessagesQueryKey = ['group-messages', updatedGroupMessage.group_id];
          const existingGroupMessagesData = queryClient.getQueryData(groupMessagesQueryKey);

          if (existingGroupMessagesData) {
            queryClient.setQueryData(groupMessagesQueryKey, (oldData: any) => {
              if (!oldData || !Array.isArray(oldData)) return oldData;
              
              return oldData.map((msg: any) =>
                msg.id === updatedGroupMessage.id ? updatedGroupMessage : msg
              );
            });
          }
        }
      )
      .on('postgres_changes', 
        {
          event: 'DELETE',
          schema: 'public',
          table: 'group_messages'
        },
        (payload) => {
          const deletedGroupMessage = payload.old as GroupMessage;
          queryClient.invalidateQueries({
            queryKey: ['group-chats', currentUser?.user?.id]
          });

          const groupMessagesQueryKey = ['group-messages', deletedGroupMessage.group_id];
          const existingGroupMessagesData = queryClient.getQueryData(groupMessagesQueryKey);

          if (existingGroupMessagesData) {
            queryClient.setQueryData(groupMessagesQueryKey, (oldData: any) => {
              if (!oldData || !Array.isArray(oldData)) return oldData;
              
              return oldData.filter((msg: any) => msg.id !== deletedGroupMessage.id);
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.user?.id, queryClient]);

  return <>{children}</>;
}

export default GlobalSubscriptionProvider