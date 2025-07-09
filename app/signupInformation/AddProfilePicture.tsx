import { Image } from 'lucide-react'
import React from 'react'

const AddProfilePicture = () => {
  const addPhoto = () => {

  }

  return (
    <div className='flex justify-center items-center'>
        <button className='p-16 rounded-full bg-gray-300 transition-all duration-300 transform hover:bg-gray-400' onClick={addPhoto}>
          <Image className='w-20 h-20' />
        </button>
    </div>
  )
}

export default AddProfilePicture