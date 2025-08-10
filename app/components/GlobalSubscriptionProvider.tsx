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
          
          // Always invalidate conversations to update unread counts and last messages
          queryClient.invalidateQueries({
            queryKey: ['conversations', currentUser?.user?.id]
          });

          // Check if this conversation's messages are cached
          const messagesQueryKey = ['messages', newMessage.conversation_id];
          const existingMessagesData = queryClient.getQueryData(messagesQueryKey);

          if (existingMessagesData) {
            // If messages are cached, add the new message to the cache
            queryClient.setQueryData(messagesQueryKey, (oldData: any) => {
              if (!oldData) return oldData;
              
              // Check if message already exists to prevent duplicates
              const messageExists = oldData.pages.some((page: any) => 
                page.messages.some((msg: any) => msg.messages_id === newMessage.messages_id)
              );
              
              if (messageExists) return oldData;
              
              // Add new message to the first page (most recent)
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
          // If messages aren't cached, we don't need to do anything
          // The conversation will load fresh messages when opened
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
          
          // Update conversations list
          queryClient.invalidateQueries({
            queryKey: ['conversations', currentUser?.user?.id]
          });

          // Update cached messages if they exist
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
          
          // Update conversations list
          queryClient.invalidateQueries({
            queryKey: ['conversations', currentUser?.user?.id]
          });

          // Update cached messages if they exist
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.user?.id, queryClient]);

  return <>{children}</>;
}

export default GlobalSubscriptionProvider

/*
interface UserProfile {
  id: string
  username: string
  name: string
  profile_picture_url?: string | null
}

const supabase = createClient()

const fetchUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile, error } = await supabase
      .from('profile')
      .select('id, username, name, profile_picture_url')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return profile
  } catch (error) {
    console.error('Error in fetchUserProfile:', error)
    return null
  }
}

export default function UnifiedMessagingProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const queryClient = useQueryClient()
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (isLoading) return

    if (!currentUser?.id) {
      UnifiedMessagingManager.getInstance().cleanup()
      console.log('No user found, cleaned up unified messaging subscription')
      return
    }
    
    const initializeSubscription = async () => {
      try {
        await UnifiedMessagingManager.getInstance().initialize(queryClient, currentUser.id)
      } catch (error) {
        console.error('Failed to initialize unified messaging subscription:', error)
      }
    }

    initializeSubscription()
  }, [currentUser?.id, queryClient, isLoading])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          UnifiedMessagingManager.getInstance().cleanup()
        } else if (event === 'SIGNED_IN' && session?.user) {
          queryClient.invalidateQueries({ queryKey: ['userProfile'] })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient])

  return (
    <>
      {children}
    </>
  )
}

*/

