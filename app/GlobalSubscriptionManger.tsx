import { createClient } from './utils/supabase/client'
import { QueryClient } from '@tanstack/react-query'
import { RealtimeChannel } from '@supabase/supabase-js'

// Group Message Interfaces
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
    profile_picture_url?: string
  }
}

interface GroupData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  groupInfo: any
  messages: GroupMessage[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  members: any[]
  isUserMember: boolean
  isOwner: boolean
}

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

interface DirectMessage {
  messages_id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  is_read: boolean
}

interface Conversation {
  conversation_id: string
  user1_id: string
  user2_id: string
  created_at: string
  last_message?: {
    content: string
    created_at: string
    sender_id: string
    sender_name?: string
  }
  unread_count?: number
  other_user?: {
    id: string
    username: string
    name: string
    profile_picture_url?: string
  }
}

interface MessagesPage {
  messages: DirectMessage[]
  nextCursor?: string
  hasMore: boolean
}

class GlobalSubscriptionManager {
  private static instance: GlobalSubscriptionManager
  private supabase = createClient()
  private queryClient: QueryClient | null = null
  private currentUserId: string | null = null
  private subscription: RealtimeChannel | null = null
  
  // Group messaging state
  private userGroupIds: Set<string> = new Set()
  
  // Direct messaging state
  private userConversationIds: Set<string> = new Set()
  
  private isInitialized = false

  private constructor() {}

  static getInstance(): GlobalSubscriptionManager {
    if (!GlobalSubscriptionManager.instance) {
      GlobalSubscriptionManager.instance = new GlobalSubscriptionManager()
    }
    return GlobalSubscriptionManager.instance
  }

  async initialize(queryClient: QueryClient, userId: string) {
    if (this.isInitialized && this.currentUserId === userId) {
      return
    }
    this.cleanup()

    this.queryClient = queryClient
    this.currentUserId = userId
    this.isInitialized = true
    
    await Promise.all([
      this.loadUserGroups(),
      this.loadUserConversations()
    ])
    
    this.setupUnifiedSubscription()
  }

  private async loadUserGroups() {
    if (!this.currentUserId) return

    try {
      const { data: memberGroups } = await this.supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', this.currentUserId)

      if (memberGroups) {
        this.userGroupIds = new Set(memberGroups.map(member => member.group_id))
        console.log('Loaded user groups:', Array.from(this.userGroupIds))
      }
    } catch (error) {
      console.error('Error loading user groups:', error)
    }
  }

  private async loadUserConversations() {
    if (!this.currentUserId) return

    try {
      const { data: conversations } = await this.supabase
        .from('conversations')
        .select('conversation_id')
        .or(`user1_id.eq.${this.currentUserId},user2_id.eq.${this.currentUserId}`)

      if (conversations) {
        this.userConversationIds = new Set(conversations.map(conv => conv.conversation_id))
        console.log('Loaded user conversations:', Array.from(this.userConversationIds))
      }
    } catch (error) {
      console.error('Error loading user conversations:', error)
    }
  }

  private setupUnifiedSubscription() {
    if (!this.currentUserId || this.subscription) return

    console.log('Setting up unified messaging subscription for user:', this.currentUserId)

    this.subscription = this.supabase
      .channel('unified_messaging')
      // Group messages
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages'
        },
        async (payload) => {
          console.log('Received new group message:', payload.new)
          const newMessage = payload.new as GroupMessage
          
          if (!this.userGroupIds.has(newMessage.group_id)) {
            console.log('User not in group, skipping message')
            return
          }

          console.log('Processing group message for group:', newMessage.group_id)
          await this.handleNewGroupMessage(newMessage)
        }
      )
      // Direct messages
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          console.log('Received new direct message:', payload.new)
          const newMessage = payload.new as DirectMessage
          
          if (!this.userConversationIds.has(newMessage.conversation_id)) {
            console.log('User not in conversation, skipping message')
            return
          }

          console.log('Processing direct message for conversation:', newMessage.conversation_id)
          await this.handleNewDirectMessage(newMessage)
        }
      )
      // Direct message updates (read status)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          console.log('Direct message updated (read status):', payload.new)
          const updatedMessage = payload.new as DirectMessage
          
          if (!this.userConversationIds.has(updatedMessage.conversation_id)) {
            return
          }

          await this.handleDirectMessageUpdate(updatedMessage)
        }
      )
      .subscribe((status) => {
        console.log('Unified messaging subscription status:', status)
      })
  }

  // Group Message Handlers
  private async handleNewGroupMessage(newMessage: GroupMessage) {
    if (!this.queryClient || !this.currentUserId) return

    console.log('Handling new group message for group:', newMessage.group_id)
    const { data: senderData } = await this.supabase
      .from('profile')
      .select('id, username, name, profile_picture_url')
      .eq('id', newMessage.user_id)
      .single()

    if (senderData) {
      newMessage.sender = senderData
    }

    // Update group data
    this.queryClient.setQueryData(
      ['groupData', newMessage.group_id, this.currentUserId],
      (oldData: GroupData | undefined) => {
        if (!oldData) return oldData
        
        const messageExists = oldData.messages.some(msg => msg.id === newMessage.id)
        if (messageExists) {
          console.log('Group message already exists, skipping:', newMessage.id)
          return oldData
        }
        console.log('Adding group message to group data:', newMessage.id)
        return {
          ...oldData,
          messages: [...oldData.messages, newMessage]
        }
      }
    )

    // Update group chats list
    this.queryClient.setQueryData(
      ['groupChats', this.currentUserId],
      (oldData: GroupChat[] | undefined) => {
        if (!oldData) return oldData

        const updatedGroups = oldData.map(group => {
          if (group.id === newMessage.group_id) {
            return {
              ...group,
              last_message: {
                content: newMessage.content,
                created_at: newMessage.created_at,
                sender_id: newMessage.user_id,
                sender_name: senderData?.name || 'Unknown'
              }
            }
          }
          return group
        }).sort((a, b) => {
          const aTime = a.last_message?.created_at || a.created_at
          const bTime = b.last_message?.created_at || b.created_at
          return new Date(bTime).getTime() - new Date(aTime).getTime()
        })

        console.log('Updated group chats list')
        return updatedGroups
      }
    )

    this.queryClient.invalidateQueries({ 
      queryKey: ['groupData', newMessage.group_id], 
      exact: false 
    })
  }

  // Direct Message Handlers
  private async handleNewDirectMessage(newMessage: DirectMessage) {
    if (!this.queryClient || !this.currentUserId) return

    console.log('Handling new direct message for conversation:', newMessage.conversation_id)

    // Get sender information
    const { data: senderData } = await this.supabase
      .from('profile')
      .select('id, username, name, profile_picture_url')
      .eq('id', newMessage.sender_id)
      .single()

    // Update the messages query data for the specific conversation
    this.queryClient.setQueryData(
      ['messages', newMessage.conversation_id],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [{
              messages: [newMessage],
              hasMore: false,
              nextCursor: undefined
            }],
            pageParams: [undefined]
          }
        }
        
        const updatedPages = [...oldData.pages]
        const firstPage = updatedPages[0]
        
        const messageExists = firstPage.messages.some(
          (msg: DirectMessage) => msg.messages_id === newMessage.messages_id
        )
        
        if (!messageExists) {
          updatedPages[0] = {
            ...firstPage,
            messages: [...firstPage.messages, newMessage]
          }
        }
        
        return {
          ...oldData,
          pages: updatedPages
        }
      }
    )

    // Update conversations list
    this.queryClient.setQueryData(
      ['conversations', this.currentUserId],
      (oldData: Conversation[] | undefined) => {
        if (!oldData) return oldData

        const updatedConversations = oldData.map(conversation => {
          if (conversation.conversation_id === newMessage.conversation_id) {
            // Calculate unread count
            let unreadCount = conversation.unread_count || 0
            if (newMessage.sender_id !== this.currentUserId) {
              unreadCount += 1
            }

            return {
              ...conversation,
              last_message: {
                content: newMessage.content,
                created_at: newMessage.created_at,
                sender_id: newMessage.sender_id,
                sender_name: senderData?.name || 'Unknown'
              },
              unread_count: unreadCount
            }
          }
          return conversation
        }).sort((a, b) => {
          const aTime = a.last_message?.created_at || a.created_at
          const bTime = b.last_message?.created_at || b.created_at
          return new Date(bTime).getTime() - new Date(aTime).getTime()
        })

        console.log('Updated conversations list')
        return updatedConversations
      }
    )

    this.queryClient.invalidateQueries({ 
      queryKey: ['messages', newMessage.conversation_id], 
      exact: false 
    })
  }

  private async handleDirectMessageUpdate(updatedMessage: DirectMessage) {
    if (!this.queryClient || !this.currentUserId) return

    console.log('Handling direct message update for conversation:', updatedMessage.conversation_id)

    // Update the messages query data
    this.queryClient.setQueryData(
      ['messages', updatedMessage.conversation_id],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData

        const updatedPages = oldData.pages.map((page: MessagesPage) => ({
          ...page,
          messages: page.messages.map((msg: DirectMessage) => 
            msg.messages_id === updatedMessage.messages_id 
              ? { ...msg, is_read: updatedMessage.is_read }
              : msg
          )
        }))

        return {
          ...oldData,
          pages: updatedPages
        }
      }
    )

    // If message was marked as read, update unread counts in conversations list
    if (updatedMessage.is_read && updatedMessage.sender_id !== this.currentUserId) {
      this.queryClient.setQueryData(
        ['conversations', this.currentUserId],
        (oldData: Conversation[] | undefined) => {
          if (!oldData) return oldData

          return oldData.map(conversation => {
            if (conversation.conversation_id === updatedMessage.conversation_id) {
              return {
                ...conversation,
                unread_count: Math.max(0, (conversation.unread_count || 1) - 1)
              }
            }
            return conversation
          })
        }
      )
    }
  }

  // Group Management Methods
  async refreshUserGroups() {
    await this.loadUserGroups()
  }

  addUserGroup(groupId: string) {
    this.userGroupIds.add(groupId)
    console.log('Added group to subscription:', groupId)
  }

  removeUserGroup(groupId: string) {
    this.userGroupIds.delete(groupId)
    console.log('Removed group from subscription:', groupId)
  }

  // Direct Message Management Methods
  async refreshUserConversations() {
    await this.loadUserConversations()
  }

  addUserConversation(conversationId: string) {
    this.userConversationIds.add(conversationId)
    console.log('Added conversation to subscription:', conversationId)
  }

  removeUserConversation(conversationId: string) {
    this.userConversationIds.delete(conversationId)
    console.log('Removed conversation from subscription:', conversationId)
  }

  async markMessagesAsRead(conversationId: string, userId: string) {
    try {
      const { error } = await this.supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId) // Only mark messages from others as read
        .eq('is_read', false)

      if (error) {
        console.error('Error marking messages as read:', error)
      }
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error)
    }
  }

  // Utility Methods
  isActive(): boolean {
    return this.isInitialized && !!this.subscription && !!this.currentUserId
  }

  getStats() {
    return {
      isActive: this.isActive(),
      userId: this.currentUserId,
      groupCount: this.userGroupIds.size,
      conversationCount: this.userConversationIds.size,
      isInitialized: this.isInitialized
    }
  }

  cleanup() {
    if (this.subscription) {
      console.log('Cleaning up unified messaging subscription')
      this.subscription.unsubscribe()
      this.subscription = null
    }
    this.queryClient = null
    this.currentUserId = null
    this.userGroupIds.clear()
    this.userConversationIds.clear()
    this.isInitialized = false
  }
}

export default GlobalSubscriptionManager