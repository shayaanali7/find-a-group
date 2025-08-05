// utils/globalSubscriptionManager.ts
import { createClient } from './utils/supabase/client'
import { QueryClient } from '@tanstack/react-query'
import { RealtimeChannel } from '@supabase/supabase-js'

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

class GlobalSubscriptionManager {
  private static instance: GlobalSubscriptionManager
  private supabase = createClient()
  private queryClient: QueryClient | null = null
  private currentUserId: string | null = null
  private subscription: RealtimeChannel | null = null
  private userGroupIds: Set<string> = new Set()

  private constructor() {}

  static getInstance(): GlobalSubscriptionManager {
    if (!GlobalSubscriptionManager.instance) {
      GlobalSubscriptionManager.instance = new GlobalSubscriptionManager()
    }
    return GlobalSubscriptionManager.instance
  }

  initialize(queryClient: QueryClient, userId: string) {
    this.queryClient = queryClient
    this.currentUserId = userId
    this.setupGlobalSubscription()
    this.loadUserGroups()
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
      }
    } catch (error) {
      console.error('Error loading user groups:', error)
    }
  }

  private setupGlobalSubscription() {
    if (!this.currentUserId || this.subscription) return

    this.subscription = this.supabase
      .channel('global_group_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages'
        },
        async (payload) => {
          const newMessage = payload.new as GroupMessage
          if (!this.userGroupIds.has(newMessage.group_id)) return
          if (newMessage.user_id === this.currentUserId) return

          await this.handleNewMessage(newMessage)
        }
      )
      .subscribe()
  }

  private async handleNewMessage(newMessage: GroupMessage) {
    if (!this.queryClient || !this.currentUserId) return

    const { data: senderData } = await this.supabase
      .from('profile')
      .select('id, username, name, profile_picture_url')
      .eq('id', newMessage.user_id)
      .single()

    if (senderData) {
      newMessage.sender = senderData
    }

    this.queryClient.setQueryData(
      ['groupData', newMessage.group_id, this.currentUserId],
      (oldData: GroupData | undefined) => {
        if (!oldData) return oldData
        
        const messageExists = oldData.messages.some(msg => msg.id === newMessage.id)
        if (messageExists) return oldData

        return {
          ...oldData,
          messages: [...oldData.messages, newMessage]
        }
      }
    )

    this.queryClient.setQueryData(
      ['groupChats', this.currentUserId],
      (oldData: GroupChat[] | undefined) => {
        if (!oldData) return oldData

        return oldData.map(group => {
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
      }
    )
  }

  updateUserGroups(groupIds: string[]) {
    this.userGroupIds = new Set(groupIds)
  }

  addUserGroup(groupId: string) {
    this.userGroupIds.add(groupId)
  }
  removeUserGroup(groupId: string) {
    this.userGroupIds.delete(groupId)
  }

  cleanup() {
    if (this.subscription) {
      this.subscription.unsubscribe()
      this.subscription = null
    }
    this.queryClient = null
    this.currentUserId = null
    this.userGroupIds.clear()
  }
}

export default GlobalSubscriptionManager