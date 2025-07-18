'use client'
import React, { useEffect, useState } from 'react'
import NavigationBar from '../../components/navbar';
import SearchBar from '../../components/searchbar';
import ProfileCard from '../../components/ProfileCard';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import { getClientPicture } from '@/app/utils/supabaseComponets/getClientPicture';
import ProfileButton from '@/app/components/ProfileButton';
import Image from 'next/image';
import getUserClient from '@/app/utils/supabaseComponets/getUserClient';
import { MessageCircle } from 'lucide-react';
import { createOrGetConversation } from '@/app/utils/supabaseComponets/messaging';

interface UserProfile {
  id: string
  created_at: string
  username: string
  name: string
  year: string
  major: string
  bio: string
  email?: string
  profile_picture_url?: string
  github_url?: string
  instagram_url?: string
  posts_count?: number
  groups_count?: number
  reputation?: number
}

const profilePage = () => {
  const router = useRouter();
  const params = useParams()
  const username = Array.isArray(params.username) ? params.username[0] : params.username;
  const [viewingUser, setViewingUser] = useState<string>('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
	const [imageURL, setimageURL] = useState<string | null >('');
  const [isMessageLoading, setIsMessageLoading] = useState<boolean>(false);

  useEffect(() => {
    getImage();
    const getViewingUser = async () => {
      try {
        const user = await getUserClient();
        if (user.id) { 
          setViewingUser(user.id);
        }
        else throw new Error('Error getting user!');
      } catch (error) {
        console.log(error);
      }
    }
    getViewingUser();  
  }, [])
	
  useEffect(() => {
    if (username && typeof username === 'string') {
      fetchProfile(username);
    }
  }, [username])

  const getImage = async () => {
    setimageURL(await getClientPicture());
  }

  const fetchProfile = async (username: string) => {
    try { 
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('username', username)
        .single()
      if (error) setError("Could not Retrieve Profile")
      else { 
				setProfile(data);
			}
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }  
  }

  useEffect(() => {
    console.log('State updated - viewingUser:', viewingUser);
    console.log('State updated - imageURL:', imageURL);
    console.log(profile?.id)
  }, [viewingUser, imageURL, profile])


  const handleMessageButton = async () => {
    if (profile) {
      setIsMessageLoading(true);
      try {
        const { data: conversation, error } = await createOrGetConversation(viewingUser, profile?.id);
        if (error) throw new Error('Error getting creating new conversation: ' + error);

        if (conversation) {
          router.push(`/messages/${conversation.conversation_id}`)
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsMessageLoading(false);
      }
    }
  }

  if (loading) {
    return (
      <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
        <div className='w-full flex justify-center border-b border-purple-500 pb-2 flex-shrink-0'>
          <div className='md:w-12 w-16'></div>
          <div className='flex-1 flex justify-center'>
            <SearchBar placeholder='Search for a post'/>
          </div>
          <div className='md:w-12 w-16 flex justify-end'>
            {username && <ProfileButton imageURL={imageURL} username={username}/>}
          </div>
        </div>
        <div className='w-full flex flex-1 overflow-hidden'>  
          <NavigationBar />
          <div className='w-6/10 flex-1 h-full overflow-y-auto bg-white flex items-center justify-center'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4'></div>
              <p className='text-gray-600'>Loading profile...</p>
            </div>
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
          {username && <ProfileButton imageURL={imageURL} username={username}/>}
        </div>
      </div>

      <div className='w-full flex flex-1 overflow-hidden'>  
          <NavigationBar />

          <div className='w-6/10  flex-1 h-full overflow-y-auto bg-white'>
            <div className='flex flex-row justify-between p-4 gap-4'>
              <div className='flex flex-row gap-4 ml-4'>
                <div className='w-10 h-10 rounded-full overflow-hidden'>
                  {profile?.profile_picture_url && <Image width={64} height={64} src={profile.profile_picture_url} alt='Profile' className="w-full h-full object-cover object-center"/>}
                </div>                
                <div className='flex flex-col'>
                  <h1 className='font-semibold text-3xl'>{profile?.username}</h1>
                  <p className='text-sm text-gray-600'>{profile?.name}</p>
                </div>
              </div>
              <div>
                {viewingUser && (profile?.id !== viewingUser) && (
                  <button onClick={handleMessageButton} disabled={isMessageLoading} 
                    className='flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                      <MessageCircle className='h-4 w-4' />
                    {isMessageLoading ? 'Loading...' : 'Message'}
                  </button>
                )}
              </div>
            </div>

            <div className='ml-8 mr-2 rounded-2xl bg-gray-100 h-20'>
              <p className='text-lg m-2'>{profile?.bio}</p>
            </div>

            <div>
              <h1 className='mt-5 ml-10 font-semibold text-2xl'>Activity</h1>
            </div>

          </div>
          <ProfileCard profile={profile} />
      </div>     
    </main>
  )
}

export default profilePage