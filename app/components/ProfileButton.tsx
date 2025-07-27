'use client'
import React, { useState } from 'react'
import { CircleUserRound, Pencil, Settings } from 'lucide-react'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import Image from 'next/image'

const ProfileButton = ({ imageURL, username }: { imageURL: (string | null), username: string}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className='relative'>
      <button 
        className='md:flex items-center justify-center p-1 mr-5 hover:bg-purple-200 rounded-full transition-colors duration-200'
        onClick={() => setIsOpen(!isOpen)}
        >
           {imageURL ? (
            <div className='w-8 h-8 rounded-full overflow-hidden'>
              <Image width={32} height={32} src={imageURL} alt='Profile' className="w-full h-full object-cover object-center"/>
            </div>
           ) 
            : <CircleUserRound className='w-8 h-8 text-gray-700' /> }
      </button>
    
      <div className={`absolute right-0 border-purple-500 top-full h-100 mt-2 w-60 bg-white border rounded-lg shadow-2xl z-50 duration-300 transition-all ease-in-out transform origin-top ${
      isOpen ? 'opacity-100 scale-y-100 transition-y-0' : 'opacity-0 scale-y-0 -translate-y-2 pointer-events-none'
      }`}>
        <div className='p-4'>
          <div className='mb-2'>
            <Link href={username ? `/user/${username}` : '/profilePage'}>
              <button className='flex items-center w-full gap-2 m-1 hover:bg-purple-200 p-2 rounded-lg text-xl'>
                {imageURL ? (
                  <div className='w-8 h-8 rounded-full overflow-hidden'>
                    <Image width={32} height={32} src={imageURL} alt='Profile' className="w-full h-full object-cover object-center"/>
                  </div>
                ) 
                  : <CircleUserRound className='w-8 h-8 text-gray-700' /> }
                <span>Profile</span>
              </button>
            </Link>
          </div>
          <div className='mb-2'>
            <Link href='/editProfilePage'>
              <button className='flex items-center w-full gap-2 m-1 hover:bg-purple-200 p-2 rounded-lg text-xl'>
                <Pencil className='text-4xl' />
                <span>Edit Profile</span>
              </button>
            </Link>
          </div>
          <div className='border-t-1 border-purple-500 mt-5 mb-2'>
            <Link href='/updateInformation'>
              <button className='flex items-center w-full gap-2 m-1 hover:bg-purple-200 p-2 rounded-lg text-xl'>
                <Settings className='text-4xl' />
                <span>Settings</span>
              </button>
            </Link>
          </div>
          <div className='border-t-1 border-purple-500 mt-5 mb-2'>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
      
  )
}

export default ProfileButton