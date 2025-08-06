'use client'

import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/app/utils/supabase/client'
import UnifiedMessagingManager from '../GlobalSubscriptionManger'

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
        console.log('Unified messaging subscription initialized for user:', currentUser.id)
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
          console.log('User signed out, cleaned up unified messaging subscription')
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
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs rounded opacity-50 z-50">
          {(() => {
            const stats = UnifiedMessagingManager.getInstance().getStats()
            return (
              <div>
                <div>User: {currentUser ? '✅' : '❌'}</div>
                <div>Unified Messaging: {stats.isActive ? '✅' : '❌'}</div>
                <div>Groups: {stats.groupCount}</div>
                <div>Conversations: {stats.conversationCount}</div>
              </div>
            )
          })()}
        </div>
      )}
    </>
  )
}