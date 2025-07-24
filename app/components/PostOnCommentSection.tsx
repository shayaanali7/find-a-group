'use client'
import React, { useRef, useState } from 'react'
import { createClient } from '../utils/supabase/client';

const PostonCommentSection = ({ postId, id }: { postId: string, id: string }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [commentText, setCommentText] = useState<string>('');

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
  };

  const handleSubmit = async () => {
    if (commentText.trim()) {
      const supabase = await createClient();
      try {
        const { error } = await supabase
          .from('comments')
          .insert([
            {
              post_id: postId,
              user_id: id,
              context: commentText.trim()
            }
          ]);
        if (error) {
          setCommentText('Error Adding Comment');
        } 
      } catch (error) {
        console.error('Error inserting comment:', error);
      }
      setCommentText('');
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className='mx-5'>
      <textarea 
        className="w-full border border-gray-200 p-2 mt-5 pl-5 rounded-3xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none overflow-hidden min-h-[40px]"
        placeholder='Write A Comment...'
        ref={textareaRef}
        value={commentText}
        onInput={handleInput}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
      />
      
      <div className='flex justify-end mt-2'>
        <button 
          className='rounded-3xl px-4 py-2 border border-gray-300 cursor-pointer transition-all transform hover:bg-gray-100 active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          onClick={handleSubmit}
          disabled={!commentText.trim()}
        >
          Comment
        </button>
      </div>
    </div>
  )
}

export default PostonCommentSection