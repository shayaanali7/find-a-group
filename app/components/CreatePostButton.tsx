import React from 'react'
import { Plus } from "lucide-react";
import Link from 'next/link';

const CreatePostButton = () => {
  return (
    <div>
      <Link href='/createPost'>
        <button 
          className='flex items-center gap-1 border-black border-1 hover:bg-gray-100 rounded-full whitespace-nowrap p-2 mt-2 mr-5 cursor-pointers'>
            <Plus className='text-3xl'/>
            <span>Create Post</span>
        </button>
      </Link>
      
    </div>
  )
}

export default CreatePostButton