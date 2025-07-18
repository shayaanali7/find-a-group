'use client'
import React, { useEffect, useState } from 'react'
import SearchBar from '../components/searchbar'
import Link from 'next/link';
import {Home } from "lucide-react";
import ProfileButton from '../components/ProfileButton';
import ConversationsList from '../components/ConversationsList';
import getUserClient, { getUsername } from '../utils/supabaseComponets/getUserClient';
import { getClientPicture } from '../utils/supabaseComponets/getClientPicture';
import { getUserConversations } from '../utils/supabaseComponets/messaging';
import { useRouter } from 'next/navigation';

const MessagesPage = () => {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string>('');
  const [imageURL, setImageURL] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const initializeConversation = async () => {
      try {
        const user = await getUserClient();
        const imageURL = await getClientPicture();
        const username = await getUsername(user);
        if (imageURL && username) {
          setUser(user);
          setUsername(username.data?.username);
          setImageURL(imageURL);
        }

        if (user.id) {
          const { data, error } = await getUserConversations(user.id);
          if (!error && data) {
            router.push(`/messages/${data[0].conversation_id}`);
          }
        }
      } catch (error) {
        console.error('Error initializing messages page:', error);
      } finally {
        setLoading(false);
      }
    }
    initializeConversation();
  }, [router])

  if (loading) {
    return (
      <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
        <div className='w-full flex justify-center border-b border-purple-500 pb-2 flex-shrink-0'>
          <div className='md:w-12 w-16'></div>
          
          <div className='flex-1 flex justify-center'>
            <SearchBar placeholder='Search for a post'/>
          </div>

          <div className='md:w-12 w-16 flex justify-end'>
            <ProfileButton imageURL={imageURL} username={username}/>
          </div>
        </div>

        <div className='w-full flex flex-1 overflow-hidden items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading conversations...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
      <div className='w-full flex justify-center border-b border-purple-500 pb-2 flex-shrink-0'>
        <div className='md:w-12 w-16'></div>
        
        <div className='flex-1 flex justify-center'>
          <SearchBar placeholder='Search for a post'/>
        </div>

        <div className='md:w-12 w-16 flex justify-end'>
            <ProfileButton  imageURL={imageURL} username={username}/>
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
          <div className='flex-1 overflow-y-auto'>
            {user.id && <ConversationsList userId={user?.id} /> } 
          </div>
        </div>

        <div className='w-4/5 flex flex-col h-full overflow-y-auto bg-white border-l-1 border-purple-500'>
          
        </div>
      </div>
    </main>
  )
}

export default MessagesPage
