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
import { UserProfile } from '@/app/interfaces/interfaces';
import { fetchUserPosts } from '@/app/utils/supabaseComponets/clientUtils';

interface UserPost {
  post_id: string;
  header: string;
  content: string;
  course_name: string;
  created_at: string;
  tags?: string;
}

const ProfilePage = () => {
  const router = useRouter();
  const params = useParams()
  const username = Array.isArray(params.username) ? params.username[0] : params.username;
  const [viewingUser, setViewingUser] = useState<string>('');
  const [userCourses, setUserCourses] = useState<string[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
	const [imageURL, setimageURL] = useState<string | null >('');
  const [isMessageLoading, setIsMessageLoading] = useState<boolean>(false);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [postsLoading, setPostsLoading] = useState<boolean>(false);

  useEffect(() => {
    getImage();
    const getViewingUser = async () => {
      try {
        const user = await getUserClient();
        if (user.id) { 
          setViewingUser(user.id);
          const supabase = createClient();
          const { data: userCourses, error } = await supabase
            .from('user_courses')
            .select('courses')
            .eq('id', user.id)
          if (error) {
            console.error('Error getting user courses:', error);
            return [];
          }
          setUserCourses(userCourses?.[0]?.courses || []); 
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
        try {
          setPostsLoading(true);
          const posts = await fetchUserPosts(data.id);
          setUserPosts(posts);
        } catch (error) {
          console.error('Error fetching user posts:', error);
          setUserPosts([]);
        }
        finally {
          setPostsLoading(false);
        }
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

  if (error) {
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
          <NavigationBar courses={userCourses} />
          <div className='w-6/10 flex-1 h-full overflow-y-auto bg-white flex items-center justify-center'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4'></div>
              <p className='text-gray-600'>{`Error: ${error}`}</p>
            </div>
          </div>
        </div>
      </main>
    );
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
          <NavigationBar courses={userCourses} />
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
          <NavigationBar courses={userCourses} />

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
              
              <div className='mx-8 mt-4'>
                {postsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-pulse">
                        <div className="mt-4 space-y-2">
                          <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-300 rounded w-full"></div>
                          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : userPosts.length > 0 ? (
                  <div className='space-y-4'>
                    {userPosts.map((post) => (
                      <div 
                        onClick={() => router.push(`/posts/${post.post_id}`)} 
                        key={post.post_id} 
                        className='bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer'
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <h2 className="text-2xl font-bold text-gray-900 leading-tight flex-1">
                              {post.header}
                            </h2>
                            <span className='text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full ml-4 flex-shrink-0'>
                              {post.course_name}
                            </span>
                          </div>
                          
                          {post.tags && (
                            <div className="flex flex-wrap gap-2">
                              <span className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium'>
                                {post.tags}
                              </span>
                            </div>
                          )}
                          
                          <div className="text-gray-700 text-sm ml-1 leading-relaxed whitespace-pre-wrap break-words">
                            {post.content}
                          </div>
                          
                          <div className="flex justify-end">
                            <span className='text-xs text-gray-500'>
                              {new Date(post.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8 text-gray-500'>
                    <p>No posts yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <ProfileCard profile={profile} />
      </div>     
    </main>
  )
}

export default ProfilePage