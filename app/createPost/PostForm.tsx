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
  const [course, setCourse] = useState<string>('');
  const buttonClass = 'border-black border-1 hover:bg-gray-100';
  const [error, setError] = useState<string>('');
  const [showError, setShowError] = useState<boolean>(false);

  const handleTagsAdded = (newTags: string[]) => {
    setTags(newTags);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (course === '') {
      setError('Please select a course for your post.')
      setShowError(true);
      setIsSubmitting(false);
      return
    }
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('body', body);
      formData.append('courseName', course);
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
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000)
    }
  };

  const onCourseChange = (newCourse: string) => {
    setCourse(newCourse);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='mt-5'>
        <h1 className='text-xl font-semibold'>Course</h1>
        <CoursePickerButton course={courseName} onCourseChange={onCourseChange} />
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

      {showError && (
        <div className="mt-4 flex items-center gap-3 w-fit max-w-full px-4 py-3 bg-red-100 text-red-800 border border-red-300 rounded-xl shadow-sm animate-fade-in">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 flex-shrink-0 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z"
            />
          </svg>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
    </form>
  )
}

export default PostForm