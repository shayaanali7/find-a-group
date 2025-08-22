'use client'
import { createClient } from '@/app/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { SendHorizonal } from 'lucide-react'
import React, { useRef, useState } from 'react'

interface GroupMessage {
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

interface SendGroupMessageProps {
  groupId: string | undefined;
  user: User | undefined;
  onOptimisticAdd: (content: string ) => string;
  onMessageSent: (tempId: string, realMessage: GroupMessage) => void;
  onMessageError: (tempId: string) => void;
}

const SendGroupMessage = ({ groupId, user, onOptimisticAdd, onMessageSent, onMessageError }: SendGroupMessageProps) => {
  const [sending, setSending] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !groupId || !user) return;
    setSending(true);
    const tempId = onOptimisticAdd(newMessage);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          user_id: user.id,
          content: messageContent,
        })
        .select(`
          id,
          user_id,
          created_at,
          content,
          profile:user_id (
            name,
            username,
            profile_picture_url
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const { data: profileData } = await supabase
          .from('profile')
          .select('name, username, profile_picture_url')
          .eq('id', data.user_id)
          .single();

        const messageWithSender: GroupMessage = {
          id: data.id,
          user_id: data.user_id,
          created_at: data.created_at,
          content: data.content,
          sender: profileData ? {
            name: profileData.name || '',
            username: profileData.username || '',
            profile_picture_url: profileData.profile_picture_url || undefined
          } : undefined
        };
        onMessageSent(tempId, messageWithSender);
      }

    } catch (error) {
      console.error('Error sending group message:', error);
      onMessageError(tempId);
      setNewMessage(messageContent);
    } finally {
      setSending(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <form onSubmit={handleSubmit} className='p-4 border-t border-purple-500 bg-white flex-shrink-0'>
      <div className='flex items-center space-x-2'>
        <input
          ref={inputRef}
          type='text'
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Type your message to the group...'
          disabled={sending}
          className='flex-1 p-2 rounded-full border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50'
        />
        <button
          type='submit'
          disabled={!newMessage.trim() || sending}
          className='p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          <SendHorizonal className='h-5 w-5' />
        </button>
      </div>
    </form>
  )
}

export default SendGroupMessage