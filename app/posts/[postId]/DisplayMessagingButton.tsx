'use client'
import { createOrGetConversation } from '@/app/utils/supabaseComponets/messaging';
import { Loader2, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

const DisplayMessagingButton = ({ viewingUserId, postUserId }: { viewingUserId: string, postUserId: string }) => {
  const router = useRouter();
  const [isMessageLoading, setIsMessageLoading] = useState<boolean>(false);

  const handleMessageButton = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (postUserId) {
      setIsMessageLoading(true);
      try {
        const { data: conversation, error } = await createOrGetConversation(viewingUserId, postUserId);
        if (error) throw new Error('Error getting creating new conversation: ' + error);

        if (conversation) {
          router.push(`/messages/${conversation.conversation_id}`)
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsMessageLoading(false);
      }
    }
  }

  return (
    <div className='flex justify-end w-full
    '>
      <button 
        onClick={handleMessageButton} 
        disabled={isMessageLoading}
        className='group relative flex items-center justify-center w-9 h-9 rounded-full bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm active:scale-95'
      >
        {isMessageLoading ? (
          <Loader2 className='h-4 w-4 text-purple-600 animate-spin' />
        ) : (
          <MessageCircle className='h-4 w-4 text-gray-600 group-hover:text-purple-600 transition-colors duration-200' />
        )}
        
        <div className='absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10'>
          Message
        </div>
      </button>
    </div>
  )
}

export default DisplayMessagingButton