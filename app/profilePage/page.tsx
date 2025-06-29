import React from 'react'
import { CircleUserRound, ImageIcon } from "lucide-react";
import NavigationBar from '../components/navbar';
import SearchBar from '../components/searchbar';
import ProfileCard from '../components/ProfileCard';

interface profilePageProps {
  username: string;
}

const profilePage = ({ username = 'WiseDolphin7032' }: profilePageProps) => {
  return (
    <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
        <div className='w-full flex justify-center border-b border-purple-500 pb-2 flex-shrink-0'>
          <div className='md:w-12 w-16'></div>
          
          <div className='flex-1 flex justify-center'>
            <SearchBar placeholder='Search for a post'/>
          </div>

          <div className='md:w-12 w-16 flex justify-end'>
            <button className='hidden md:flex items-center justify-center p-1 mr-5 hover:bg-purple-200 rounded-full transition-colors duration-200'>
              <CircleUserRound className='w-8 h-8 text-gray-700' />
            </button>
          </div>
        </div>

        <div className='w-full flex flex-1 overflow-hidden'>  
            <NavigationBar />

            <div className='w-6/10  flex-1 h-full overflow-y-auto bg-white'>
              <div className='flex flex-row items-center p-4 gap-4'>
                <ImageIcon className='w-16 h-16 text-black' />
                <h1 className='font-semibold text-3xl'>{username}</h1>
              </div>

              <div className='ml-8 mr-2 rounded-2xl bg-gray-100 h-20'>
                <p className='text-lg m-2'>Bio: This is a placeholder bio for the user.</p>
              </div>

              <div>
                <h1 className='mt-5 ml-10 font-semibold text-2xl'>Activity</h1>
              </div>

            </div>
            <ProfileCard  username={username} />
        </div>     
    </main>
  )
}

export default profilePage