'use client'
import React, { useState } from 'react'
import { useRouter } from "next/navigation";
import CoursePickerButton from '../components/CoursePickerButton';
import TagModal from '../components/TagModal'

interface PostFormProps {
  courseName: string;
  createPost: (formData: FormData) => Promise<{ success: boolean; postId?: string; error?: string }>;
}

const PostForm = ({ courseName, createPost }: PostFormProps) => {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const buttonClass = 'border-black border-1 hover:bg-gray-100';

  const handleTagsAdded = (newTags: string[]) => {
    setTags(newTags);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('body', body);
      formData.append('courseName', courseName);
      formData.append('tags', JSON.stringify(tags));
    
      const result = await createPost(formData);
      if (result.success && result.postId) {
        setTitle('');
        setBody('');
        setTags([]);
        router.push(`/posts/${result.postId}`);
      } else {
        console.error('Failed to create post:', result.error);
      }
    } catch (error) {
      console.error('Error submitting post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='mt-5'>
        <h1 className='text-xl font-semibold'>Course</h1>
        <CoursePickerButton course={courseName} />
        <input type="hidden" name="courseName" value={courseName} />
      </div>
      
      <div className='mt-10'>
        <div className='pr-8'>
          <input 
            type='text' 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            name='title'
            placeholder='Title' 
            className={`${buttonClass} rounded-full mt-1 p-3 w-full text-2xl text-left`}
            required
            disabled={isSubmitting}
          />

          <div className='flex justify-start mt-10 ml-2'>
            <TagModal text='Add Tags' onTagsAdded={handleTagsAdded} />
          </div>
          
          <textarea
            name='body'
            placeholder='Body Text'
            value={body}
            onChange={(e) => setBody(e.target.value)} 
            className={`${buttonClass} rounded-3xl mt-1 p-3 w-full h-40 text-left items-start resize-none`}
            required
            disabled={isSubmitting}
          />
          
          <div className='flex justify-end'>
            <button 
              type='submit'
              className={`${buttonClass} rounded-full p-2 px-5 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default PostForm