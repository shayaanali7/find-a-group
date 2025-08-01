'use client'
import React, { useState } from 'react'
import { Pencil, Settings } from 'lucide-react'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import Image from 'next/image'
import { useLoading } from './LoadingContext'

const ProfileButton = ({ imageURL, username, name }: { imageURL: (string | null), username: string, name: string}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { startLoading, stopLoading } = useLoading(); 

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const handleClick = () => {
    startLoading();

    setTimeout(() => {
      stopLoading();
    }, 1000)
  }

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
            : (
              <div className='w-8 h-8 rounded-full bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 flex items-center justify-center'>
                <span className='text-white font-semibold text-sm'>{getInitial(name)}</span>
              </div>
            )}
      </button>
    
      <div className={`absolute right-0 border-purple-500 top-full h-100 mt-2 w-60 bg-white border rounded-lg shadow-2xl z-50 duration-300 transition-all ease-in-out transform origin-top ${
      isOpen ? 'opacity-100 scale-y-100 transition-y-0' : 'opacity-0 scale-y-0 -translate-y-2 pointer-events-none'
      }`}>
        <div className='p-4'>
          <div className='mb-2'>
            <Link href={username ? `/user/${username}` : '/profilePage'}>
              <button className='flex items-center w-full gap-2 m-1 hover:bg-purple-200 p-2 rounded-lg text-xl' onClick={() => handleClick()}>
                {imageURL ? (
                  <div className='w-8 h-8 rounded-full overflow-hidden'>
                    <Image width={32} height={32} src={imageURL} alt='Profile' className="w-full h-full object-cover object-center"/>
                  </div>
                ) 
                  : (
                    <div className='w-8 h-8 rounded-full bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 flex items-center justify-center'>
                      <span className='text-white font-semibold text-sm'>{getInitial(name)}</span>
                    </div>
                  )}
                <span>Profile</span>
              </button>
            </Link>
          </div>
          <div className='mb-2'>
            <Link href='/editProfilePage'>
              <button className='flex items-center w-full gap-2 m-1 hover:bg-purple-200 p-2 rounded-lg text-xl' onClick={() => handleClick()}>
                <Pencil className='text-4xl' />
                <span>Edit Profile</span>
              </button>
            </Link>
          </div>
          <div className='border-t-1 border-purple-500 mt-5 mb-2'>
            <Link href='/updateInformation'>
              <button className='flex items-center w-full gap-2 m-1 hover:bg-purple-200 p-2 rounded-lg text-xl' onClick={() => handleClick()}>
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