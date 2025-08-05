'use client'
import React, { useState } from 'react'
import NavigationBar from '../../components/navbar';
import SearchBar from '../../components/searchbar';
import ProfileCard from '../../components/ProfileCard';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import { getClientPicture } from '@/app/utils/supabaseComponets/getClientPicture';
import ProfileButton from '@/app/components/ProfileButton';
import Image from 'next/image';
import getUserClient, { getName } from '@/app/utils/supabaseComponets/getUserClient';
import { MessageCircle } from 'lucide-react';
import { createOrGetConversation } from '@/app/utils/supabaseComponets/messaging';
import { UserPost, UserProfile } from '@/app/interfaces/interfaces';
import { fetchUserPosts } from '@/app/utils/supabaseComponets/clientUtils';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

interface ViewingUserData {
  id: string;
  name: string;
  courses: string[];
  imageURL: string | null;
}

const fetchViewingUserData = async (): Promise<ViewingUserData> => {
  const user = await getUserClient();
  if (!user.id) {
    throw new Error('Error getting user!');
  }

  const name = await getName(user);
  const imageURL = await getClientPicture();
  
  const supabase = createClient();
  const { data: userCourses, error } = await supabase
    .from('user_courses')
    .select('courses')
    .eq('id', user.id);

  if (error) {
    console.error('Error getting user courses:', error);
    throw new Error('Failed to fetch user courses');
  }

  return {
    id: user.id,
    name: name.data?.name || '',
    courses: userCourses?.[0]?.courses || [],
    imageURL
  };
};

const fetchUserProfile = async (username: string): Promise<UserProfile> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    throw new Error("Could not Retrieve Profile");
  }

  return data;
};

const fetchUserPostsData = async (userId: string): Promise<UserPost[]> => {
  return await fetchUserPosts(userId);
};

const parseTagsToArray = (tags: string) => {
  if (!tags) return [];
  
  if (Array.isArray(tags)) {
    return tags;
  }
  
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [tags];
    } catch {
      return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
  }
  
  return [];
};

const ProfilePage = () => {
  const router = useRouter();
  const params = useParams()
  const username = Array.isArray(params.username) ? params.username[0] : params.username;
  const [isMessageLoading, setIsMessageLoading] = useState<boolean>(false);

  const {
    data: viewingUserData,
    isLoading: viewingUserLoading,
    error: viewingUserError
  } = useQuery({
    queryKey: ['viewingUser'],
    queryFn: fetchViewingUserData,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  });

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError
  } = useQuery({
    queryKey: ['userProfile', username],
    queryFn: () => fetchUserProfile(username!),
    enabled: !!username && typeof username === 'string',
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  });

  const {
    data: userPosts = [],
    isLoading: postsLoading,
    error: postsError
  } = useQuery({
    queryKey: ['userPosts', profile?.id],
    queryFn: () => fetchUserPostsData(profile!.id),
    enabled: !!profile?.id,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  });

  const handleMessageButton = async () => {
    if (profile) {
      setIsMessageLoading(true);
      try {
        if (viewingUserData) {
           const { data: conversation, error } = await createOrGetConversation(viewingUserData?.id, profile?.id);
           if (error) throw new Error('Error getting creating new conversation: ' + error);

          if (conversation) {
            router.push(`/messages/${conversation.conversation_id}`)
          }
        }       
      } catch (error) {
        console.log(error);
      } finally {
        setIsMessageLoading(false);
      }
    }
  }

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const isLoading = viewingUserLoading || profileLoading;
  const error = viewingUserError || profileError || postsError;

  if (error) {
    return (
      <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
        <div className='w-full flex items-center border-b border-purple-500 pb-2 flex-shrink-0 px-4'>
          <div className='flex-shrink-0 w-10 lg:w-[180px]'>
            <div className='md:w-12 w-16 flex justify-start'>
            </div>
            <div className='hidden lg:flex items-center h-[36px]'>
              <Link href='/mainPage'>
                <Image 
                  src="/assets/groupup-logo-cut.PNG" 
                  alt='logo' 
                  height={36} 
                  width={180} 
                  className='w-full h-full object-contain' 
                />
            </Link>
            </div>
          </div>
        
          <div className='flex-1 max-w-2xl mx-4 lg:mx-auto'>
            <SearchBar placeholder='Search for posts, users and courses'/>
          </div>

          <div className='flex-shrink-0 w-10 lg:w-auto'>
            {username && viewingUserData && <ProfileButton 
              imageURL={viewingUserData?.imageURL} 
              username={username} 
              name={viewingUserData?.name}
            />
            }
          </div>
        </div>
        <div className='w-full flex flex-1 overflow-hidden'>  
          <NavigationBar courses={viewingUserData?.courses} />
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

  if (isLoading) {
    return (
      <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
        <div className='w-full flex items-center border-b border-purple-500 pb-2 flex-shrink-0 px-4'>
          <div className='flex-shrink-0 w-10 lg:w-[180px]'>
            <div className='md:w-12 w-16 flex justify-start'>
            </div>
            <div className='hidden lg:flex items-center h-[36px]'>
              <Link href='/mainPage'>
                <Image 
                  src="/assets/groupup-logo-cut.PNG" 
                  alt='logo' 
                  height={36} 
                  width={180} 
                  className='w-full h-full object-contain' 
                />
            </Link>
            </div>
          </div>
        
          <div className='flex-1 max-w-2xl mx-4 lg:mx-auto'>
            <SearchBar placeholder='Search for posts, users and courses'/>
          </div>

          <div className='flex-shrink-0 w-10 lg:w-auto'>
            {username && viewingUserData && <ProfileButton 
              imageURL={viewingUserData?.imageURL} 
              username={username} 
              name={viewingUserData?.name}
            />
            }
          </div>
        </div>
        <div className='w-full flex flex-1 overflow-hidden'>  
          <NavigationBar courses={viewingUserData?.courses} />
          <div className='w-6/10 flex-1 h-full overflow-y-auto bg-white flex items-center justify-center'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4'></div>
              <p className='text-gray-600'>{`Loading...`}</p>
            </div>
          </div>
        </div>
    </main>
    );
  }

  return (
    <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
      <div className='w-full flex items-center border-b border-purple-500 pb-2 flex-shrink-0 px-4'>
        <div className='flex-shrink-0 w-10 lg:w-[180px]'>
          <div className='md:w-12 w-16 flex justify-start'>
          </div>
          <div className='hidden lg:flex items-center h-[36px]'>
            <Link href='/mainPage'>
              <Image 
                src="/assets/groupup-logo-cut.PNG" 
                alt='logo' 
                height={36} 
                width={180} 
                className='w-full h-full object-contain' 
              />
            </Link>
          </div>
        </div>
      
        <div className='flex-1 max-w-2xl mx-4 lg:mx-auto'>
          <SearchBar placeholder='Search for posts, users and courses'/>
        </div>

        <div className='flex-shrink-0 w-10 lg:w-auto'>
          {username && viewingUserData && <ProfileButton 
            imageURL={viewingUserData?.imageURL} 
            username={username} 
            name={viewingUserData?.name}
          />
          }
        </div>
      </div>

      <div className='w-full flex flex-1 overflow-hidden'>  
          <NavigationBar courses={viewingUserData?.courses} />

          <div className='w-6/10  flex-1 h-full overflow-y-auto bg-white'>
            <div className='flex flex-row justify-between p-4 gap-4'>
              <div className='flex flex-row gap-4 ml-4'>
                <div className='w-10 h-10 rounded-full overflow-hidden'>
                  {profile?.profile_picture_url 
                  ? <Image width={64} height={64} src={profile.profile_picture_url} alt='Profile' className="w-full h-full object-cover object-center"/> 
                  : 
                    <div className='w-full h-full bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 flex items-center justify-center'>
                      <span className='text-white font-semibold text-sm leading-none'>{getInitial(profile?.name || '')}</span>
                    </div>
                  }
                </div>                
                <div className='flex flex-col'>
                  <h1 className='font-semibold text-3xl'>{profile?.username}</h1>
                  <p className='text-sm text-gray-600'>{profile?.name}</p>
                </div>
              </div>
              <div>
                {viewingUserData && (profile?.id !== viewingUserData.id) && (
                  <button onClick={handleMessageButton} disabled={isMessageLoading} 
                    className='flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                      <MessageCircle className='h-4 w-4' />
                    {isMessageLoading ? 'Loading...' : 'Message'}
                  </button>
                )}
              </div>
            </div>

            <div className='ml-8 mr-2 rounded-2xl bg-gray-100 p-4'>
              <p className='text-lg'>{profile?.bio}</p>
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
                          
                          {(() => {
                            if (post.tags) {
                              const tagsArray = parseTagsToArray(post.tags);
                              return tagsArray.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {tagsArray.map((tag, index) => (
                                    <span 
                                      key={index}
                                      className='inline-block min-w-[40px] text-center text-xs bg-gradient-to-r from-purple-500 to-indigo-500 transform transition-colors duration-300 hover:from-purple-600 hover:to-indigo-600 shadow-purple-200 text-white px-2 py-1 rounded-full font-medium'
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              );
                            }
                          })()}
                          
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
          {profile && <ProfileCard profile={profile} />}
      </div>     
    </main>
  )
}

export default ProfilePage