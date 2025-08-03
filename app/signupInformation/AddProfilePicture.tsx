'use client'
import { Image, X } from 'lucide-react'
import React, { useState } from 'react'
import { createClient } from '../utils/supabase/client'
import { updateDatabase } from '../utils/supabaseComponets/updateDatabase'
import { User } from '../interfaces/interfaces'

interface AddProfilePictureProps {
  user: User,
  onImageUpload: (imageUrl: string) => void 
}

const AddProfilePicture = ({ user, onImageUpload }: AddProfilePictureProps) => {
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null);

  const addPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader();
      reader.onload = (e) =>  {
        const result = e.target?.result
        if (typeof result === 'string') setPreviewUrl(result);
      }
      reader.readAsDataURL(file);
      await uploadImage(file);
    }
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  const uploadImage = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    try {
      const fileName = `${user?.id || 'user'}_${Date.now()}.${file.name.split('.').pop()}`
      const filePath = fileName

      const supabase = await createClient();
      const { error: uploadError} = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file)
      
      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData} = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl

      if (user?.id) {
        await updateDatabase('profile', { profile_picture_url: publicUrl}, user)
      }
      
      if (onImageUpload) {
        onImageUpload(publicUrl)
      }
    } catch (error) {
      console.log(error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image. Please try again.'
      setError(errorMessage)
    } finally {
      setIsUploading(false);
    }
  }

  const removeImage = () => {
    setPreviewUrl(null);
    setError(null);
  }

  return (
    <div className='flex flex-col justify-center items-center gap-6'>
      <div className='relative'>
        {previewUrl ? (
          <div className='relative'>
            <img 
              src={previewUrl} 
              alt="Profile preview" 
              className='w-32 h-32 rounded-full object-cover border-4 border-purple-200'
            />
            {isUploading && (
              <div className='absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center'>
                <div className='w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin' />
              </div>
            )}
            <div className='absolute -bottom-2 -right-2 flex gap-1'>
              <button 
                className='p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors'
                onClick={addPhoto}
                disabled={isUploading}
              >
                <Image className='w-4 h-4' />
              </button>
              <button 
                className='p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors'
                onClick={removeImage}
                disabled={isUploading}
              >
                <X className='w-4 h-4' />
              </button>
            </div>
          </div>
        ) : (
          <button 
            className='p-12 rounded-full bg-gray-300 transition-all duration-300 transform hover:bg-gray-400 disabled:opacity-50' 
            onClick={addPhoto}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className='w-20 h-20 border-4 border-gray-600 border-t-transparent rounded-full animate-spin' />
            ) : (
              <Image className='w-20 h-20' />
            )}
          </button>
        )}
      </div>
      
      <p className='text-gray-600 text-center'>
        {previewUrl ? 'Click the camera icon to change your photo' : 'Click to add your profile picture'}
      </p>

      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-3 max-w-md'>
          <p className='text-red-700 text-sm'>{error}</p>
        </div>
      )}
    </div>
  )
}

export default AddProfilePicture