'use client'
import { createClient } from '@/app/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { SendHorizonal } from 'lucide-react'
import React, { useRef, useState } from 'react'

interface Message {
  messages_id: string,
  sender_id: string,
  created_at: string,
  content: string
}

interface SendMessageProps {
  conversationId: string | undefined;
  user: User | undefined;
  onOptimisticAdd: (content: string ) => string;
  onMessageSent: (tempId: string, realMessage: Message) => void;
  onMessageError: (tempId: string) => void;
}

const SendMessage = ({ conversationId, user, onOptimisticAdd, onMessageSent, onMessageError }: SendMessageProps) => {
  const [sending, setSending] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user) return;
    setSending(true);
    const tempId = onOptimisticAdd(newMessage);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: messageContent,
        })
        .select('messages_id, sender_id, created_at, content')
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        onMessageSent(tempId, data as Message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
          placeholder='Type your message...'
          disabled={sending}
          className='flex-1 p-2 rounded-full border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50'
        />
        <button
          type='submit'
          disabled={!newMessage.trim() || sending}
          className='p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <SendHorizonal className='h-5 w-5' />
        </button>
      </div>
    </form>
  )
}

export default SendMessage