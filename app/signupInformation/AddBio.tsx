'use client'
import React, { useState } from 'react'

const AddBio = () => {
  const [bio, setBio] = useState('')
  const maxLength = 500;

  return (
    <div className='p-6 bg-gray-100 rounded-2xl shadow-lg w-full'>
      <div className='flex flex-col space-y-3'>
        <label htmlFor="bio" className='text-gray-700 font-medium text-sm'>
          Tell us about yourself
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Write your bio here..."
          className='min-h-[120px] bg-white border border-gray-300 rounded-lg p-4 text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
          maxLength={500}
        />

        <div className='flex justify-between items-center text-sm text-gray-500'>
          <span>{bio.length}/{maxLength} characters</span>
          {bio.length === maxLength && (
            <span className='text-red-500 font-medium'>Character limit reached</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddBio
