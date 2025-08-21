'use client'
import { User } from '@supabase/supabase-js';
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client';
import { Trash2, Edit3, Check, X } from 'lucide-react';
import { QueryClient } from '@tanstack/react-query';

export interface GroupMessage {
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

interface GroupChatMessagesProps {
  messages: GroupMessage[], 
  user: User | undefined,
  loading: boolean,
  setMessages: Dispatch<SetStateAction<GroupMessage[]>>,
  queryClient: QueryClient,
}

const GroupChatMessages = ({ messages, user, loading, setMessages, queryClient }: GroupChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [updatingMessageId, setUpdatingMessageId] = useState<string | null>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (editingMessageId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingMessageId]);

  const handleDeleteMessage = async (messageId: string) => {
    if (!user || deletingMessageId) return;
    if (messageId.startsWith('temp-')) return;
    
    setDeletingMessageId(messageId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('group_messages')
        .delete()
        .eq('id', messageId)
      
      if (error) {
        console.error('Error deleting message:', error);
      } else {
        setMessages(current => current.filter(msg => msg.id !== messageId));

        if (user.id) {
          queryClient.invalidateQueries({
            queryKey: ['group-chats', user.id]
          });
        }
      }
    } catch (error) {
      console.error('Unexpected error deleting message:', error);
    } finally {
      setDeletingMessageId(null);
      setHoveredMessageId(null);
    }
  }

  const handleStartEdit = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditingContent(currentContent);
    setHoveredMessageId(null);
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent('');
  }

  const handleUpdateMessage = async (messageId: string) => {
    if (!user || updatingMessageId || !editingContent.trim()) return;
    if (messageId.startsWith('temp-')) return;
    
    setUpdatingMessageId(messageId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('group_messages')
        .update({ content: editingContent.trim() })
        .eq('id', messageId)
      
      if (error) {
        console.error('Error updating message:', error);
      } else {
        setEditingMessageId(null);
        setEditingContent('');
      }
    } catch (error) {
      console.error('Unexpected error updating message:', error);
    } finally {
      setUpdatingMessageId(null);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, messageId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUpdateMessage(messageId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
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
      {messages.map((message, index) => {
        const isOptimistic = message.id.startsWith('temp-');
        const isOwnMessage = message.user_id === user?.id;
        const isHovered = hoveredMessageId === message.id;
        const isDeleting = deletingMessageId === message.id;
        const isEditing = editingMessageId === message.id;
        const isUpdating = updatingMessageId === message.id;
        const canEdit = isOwnMessage && !isOptimistic && !isDeleting && !isUpdating;
        const canDelete = isOwnMessage && !isOptimistic && !isDeleting && !isEditing;

        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showSenderName = !isOwnMessage && (
          !prevMessage || 
          prevMessage.user_id !== message.user_id ||
          (new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime()) > 300000 // 5 minutes
        );

        return (
          <div key={message.id} className="group">
            {showSenderName && (
              <div className="flex justify-start mb-1 ml-10">
                <span className="text-xs text-gray-600 font-medium">
                  {message.sender?.name || 'Unknown User'}
                </span>
              </div>
            )}
            
            <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <div 
                className="flex items-end gap-2 group"
                onMouseEnter={() => !isEditing && setHoveredMessageId(message.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                {!isOwnMessage && (
                  <div className={`w-8 h-8 rounded-full overflow-hidden bg-gray-300 flex-shrink-0 ${
                    showSenderName ? 'self-end' : 'self-end opacity-0'
                  }`}>
                    {message.sender?.profile_picture_url ? (
                      <img 
                        src={message.sender.profile_picture_url} 
                        alt={message.sender.name || 'User'} 
                        className='w-full h-full object-cover' 
                      />
                    ) : (
                      <div className='w-full h-full bg-purple-500 flex items-center justify-center text-white text-xs font-semibold'>
                        {(message.sender?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg transition-all duration-200 ${
                    isOwnMessage
                      ? `bg-purple-500 text-white ${isOptimistic ? 'opacity-70' : ''}`
                      : 'bg-gray-200 text-gray-800'
                  } ${isEditing ? 'ring-2 ring-blue-400' : ''}`}
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e, message.id)}
                        className="w-full bg-transparent border-none outline-none text-sm placeholder-gray-300 resize-none"
                        placeholder="Edit message..."
                        disabled={isUpdating}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleUpdateMessage(message.id)}
                          disabled={isUpdating || !editingContent.trim()}
                          className="p-1 rounded hover:bg-white/20 transition-colors disabled:opacity-50"
                          title="Save (Enter)"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                          className="p-1 rounded hover:bg-white/20 transition-colors disabled:opacity-50"
                          title="Cancel (Esc)"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
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
                        {isUpdating && (
                          <span className="text-xs">✏️</span>
                        )}
                      </p>
                    </>
                  )}
                </div>

                <div className={`flex flex-col gap-1 transition-all duration-300 ease-in-out ${
                  (canEdit || canDelete) && isHovered && !isEditing
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 translate-x-2 pointer-events-none'
                }`}>
                  {canEdit && (
                    <button
                      onClick={() => handleStartEdit(message.id, message.content)}
                      className="p-1.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg"
                      title="Edit message"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg"
                      title="Delete message"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default GroupChatMessages