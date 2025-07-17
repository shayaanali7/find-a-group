import { createClient } from "../supabase/client"

const supabase = createClient();
export interface Conversation {
  conversation_id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  messages_id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export const createOrGetConversation = async (user1Id: string, user2Id: string) => {
  try { 
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
      .single()
    if (conversationData && !conversationError) return { data: conversationData, error: null };
    
    const { data: newConversationData, error: newConversationError } = await supabase 
      .from('conversations')
      .insert({
        user1_id: user1Id,
        user2_id: user2Id,
      })
      .select()
      .single()

    return { data: newConversationData, error: newConversationError };
  } catch (error) {
    return { data: null, error };
  }
}

export const getUserConversations = async (userId: string) => {
  try { 
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *, 
        messages (
          content,
          created_at,
          sender_id
        )
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('updated_at', { ascending: false });
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const getConversationMessages = async (conversationId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const sendMessage = async (conversationId: string, senderId: string, content: string) => {
  try { 
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content,
      })
      .select()
      .single()
    if (!error) {
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
    }
    return { data, error }
  } catch (error) { 
    return { data: null, error }
  }
}

export const markMessageAsRead = async (conversationId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
    
    return { error }
  } catch (error) {
    return { error }
  }
}

export const subscribeToMessages = async (conversationId: string, callback: (message: Message) => void) => {
  const subscription = supabase
    .channel(`messages-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        callback(payload.new as Message)
      }
    )
    .subscribe()
  
  return subscription;
}

export const subscribeToConversations = async (userId: string, callback: (conversation: Conversation) => void)  => {
  const subscription = supabase
    .channel(`conversations-${userId}`)
    .on(
      'postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `user1_id=eq.${userId}`
      },
      (payload) => {
        callback(payload.new as Conversation)
      }
    )
    .on(
      'postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `user2_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Conversation)
      }
    )
    .subscribe()
  return subscription;
}

export const getUnreadMessageCount = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('conversation_id', { count: 'exact' })
      .eq('is_read', false)
      .neq('sender_id', userId)
    
    return { data: data?.length || 0, error }
  } catch (error) {
    return { data: 0, error }
  }
}

export const getConversationUnreadCount = async (conversationId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('messages_id', { count: 'exact' })
      .eq('conversation_id', conversationId)
      .eq('is_read', false)
      .neq('sender_id', userId)
    
    return { data: data?.length || 0, error }
  } catch (error) {
    return { data: 0, error }
  }
}