'use client'
import { User } from '@supabase/supabase-js';
import React, { useEffect, useRef, useState } from 'react'
import { Message } from './page';
import { createClient } from '@/app/utils/supabase/client';
import { Trash2 } from 'lucide-react';

interface ChatMessagesProps {
  messages: Message[], 
  user: User | undefined,
  loading: boolean
}

const ChatMessages = ({ messages, user, loading }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDeleteMessage = async (messageId: string) => {
    if (!user || deletingMessageId) return;
    if (messageId.startsWith('temp-')) return;
    
    setDeletingMessageId(messageId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('messages_id', messageId)
      
      if (error) {
        console.error('Error deleting message:', error);
      }
    } catch (error) {
      console.error('Unexpected error deleting message:', error);
    } finally {
      setDeletingMessageId(null);
      setHoveredMessageId(null);
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500">Loading messages...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isOptimistic = message.messages_id.startsWith('temp-');
        const isOwnMessage = message.sender_id === user?.id;
        const isHovered = hoveredMessageId === message.messages_id;
        const isDeleting = deletingMessageId === message.messages_id;
        const canDelete = isOwnMessage && !isOptimistic && !isDeleting;

        return (
          <div
            key={message.messages_id}
            className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className="flex items-center gap-2"
              onMouseEnter={() => setHoveredMessageId(message.messages_id)}
              onMouseLeave={() => setHoveredMessageId(null)}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender_id === user?.id
                    ? `bg-purple-500 text-white ${isOptimistic ? 'opacity-70' : ''}`
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className='text-sm'>{message.content}</p>
                <p className={`text-xs mt-1 flex items-center gap-1 ${
                  isOwnMessage ? 'text-purple-200' : 'text-gray-500'
                }`}>
                  {new Date(message.created_at).toLocaleTimeString()}
                  {isOptimistic && (
                    <span className="text-xs">⏳</span>
                  )}
                  {isDeleting && (
                    <span className="text-xs">🗑️</span>
                  )}
                </p>
              </div>
              {canDelete && isHovered && (
                <button
                  onClick={() => handleDeleteMessage(message.messages_id)}
                  className="p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-200 transform hover:scale-110 opacity-90 hover:opacity-100"
                  title="Delete message"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default ChatMessages