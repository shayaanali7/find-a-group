import React from 'react'
import SearchBar from '../components/searchbar'
import Link from 'next/link';
import {Home, SendHorizonal } from "lucide-react";
import getUserServer from '../utils/supabaseComponets/getUserServer';
import { GetProfilePicture } from '../utils/supabaseComponets/getProfilePicture';
import ProfileButton from '../components/ProfileButton';

const MessagesPage = async () => {
  const user = await getUserServer();
  const imageURL = await GetProfilePicture();

  return (
    <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
        <div className='w-full flex justify-center border-b border-purple-500 pb-2 flex-shrink-0'>
          <div className='md:w-12 w-16'></div>
          
          <div className='flex-1 flex justify-center'>
            <SearchBar placeholder='Search for a post'/>
          </div>

          <div className='md:w-12 w-16 flex justify-end'>
             <ProfileButton  imageURL={imageURL}/>
          </div>
        </div>

        <div className='w-full flex flex-1 overflow-hidden'> 
            <div className='hidden md:block w-1/5 h-full bg-white'>
              <div className='border-b-1 border-purple-500 ml-2 mr-2 '>
                <Link href='/mainPage'>
                <button 
                  className='flex items-center w-9/10 gap-2 m-1 ml-2 hover:bg-purple-200 p-2 rounded-full text-xl'>
                    <Home className='text-3xl' />
                    <span>Home</span>
                </button>
              </Link>
              </div>
            </div>

            <div className='w-4/5 flex flex-col h-full overflow-y-auto bg-white border-l-1 border-purple-500 '>
              <div className='flex-1'>

              </div>
              
              <div className='mb-4 flex flexr-row items-center'>
                <input
                  type='text'
                  placeholder='Type your message...'
                  className='w-4/5 ml-4 p-2 rounded-full border-1 bg-gray-100'
                >
                </input>
                <SendHorizonal className='ml-2' />  
              </div>
            </div>
        </div>
      </main>
  )
}

export default MessagesPage
