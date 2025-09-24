import PostonCommentSection from '@/app/components/Features/PostComponents/PostOnCommentSection';
import NavigationBar from '@/app/components/Layout/navbar';
import ProfileButton from '@/app/components/UI/Buttons/ProfileButton';
import ProfileCard from '@/app/components/UI/Cards/ProfileCard';
import SearchBar from '@/app/components/UI/Forms/searchbar';
import { createClient } from '@/app/utils/supabase/server';
import { getProfileInformation } from '@/app/utils/supabaseComponets/getProfileInformation';
import { GetProfilePicture } from '@/app/utils/supabaseComponets/getProfilePicture';
import { getUserCourses } from '@/app/utils/supabaseComponets/getUserCourses';
import getUserServer, { getName, getUsername } from '@/app/utils/supabaseComponets/getUserServer';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import RenderCommentSection from './RenderCommentSection';
import DisplayMessagingButton from './DisplayMessagingButton';
import OptionOnPostButton from '@/app/components/UI/Buttons/OptionOnPostButton';

interface PostPageProps {
  params: Promise<{
    postId: string;
  }>
}

const PostPage = async ({ params }: PostPageProps) => {
  const { postId } = await params;
  const supabase = await createClient();
  const { data: postData, error } = await supabase
    .from('posts')
    .select('*')
    .eq('post_id', postId)
    .single()
  if (error) console.log(error.message);

  const user = await getUserServer();
  const courses = user.id ? await getUserCourses(user.id) : [];
  const imageURL = await GetProfilePicture();
  const username = await getUsername(user);
  const name = await getName(user);
  const profile = user.id ? await getProfileInformation(postData.user_id) : null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
      <div className='w-full flex items-center border-b border-purple-500 pb-2 flex-shrink-0 px-4'>
        <div className='flex-shrink-0 w-10 lg:w-[180px]'>
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
            <ProfileButton 
              imageURL={imageURL} 
              username={username.data?.username} 
              name={name.data?.name}
            />
        </div>
      </div>

      <div className='w-full flex flex-1 overflow-hidden'>  
          <NavigationBar courses={courses} />

          <div className='w-6/10 flex-1 h-full overflow-y-auto bg-white'>
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md mt-4 ml-5 mr-5">
              <div className="flex items-start gap-3">
                <Link 
                  href={profile?.username ? `/user/${profile?.username}` : '/profilePage'}
                  className="flex items-start gap-3 flex-shrink-0 hover:opacity-80 transition-opacity"
                >
                  {profile?.profile_picture_url ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <Image 
                        src={profile?.profile_picture_url} 
                        width={32} 
                        height={32} 
                        alt={`${profile.name || profile.username}'s profile picture`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {profile?.name.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                      {profile?.name || 'Unknown User'}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-500 text-xs whitespace-nowrap">
                      <span>@{profile?.username || 'unknown'}</span>
                      <span>• {formatDate(postData.created_at)}</span>
                    </div>
                  </div>
                </Link>

                <div className='flex justify-end items-center gap-2 ml-auto'>
                  <OptionOnPostButton post={postId} isOwnPost={user.id === profile?.id} />
                  {user.id !== profile?.id ? ( 
                    (user.id && profile?.id) && <DisplayMessagingButton viewingUserId={user.id} postUserId={profile?.id} /> 
                  ): <div></div>}
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  {postData.header}
                </h2>
                
                {postData.tags && postData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {postData.tags.map((tag: string, index: number) => {
                      return (
                        <span 
                          key={index}
                          className={`inline-block min-w-[40px] text-center bg-gradient-to-r from-purple-500 to-indigo-500 transform transition-colors duration-300 hover:from-purple-600 hover:to-indigo-600 shadow-purple-200 text-white text-xs px-2 py-1 rounded-full font-medium`}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                )}
                
                <div className="text-black text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {postData.content}
                </div>
              </div>
            </div>

            <div>
              {user.id && <PostonCommentSection postId={postId} />}
              <RenderCommentSection postId={postId} />
            </div>
          </div>

          <ProfileCard profile={profile} />
      </div>    
    </main>
  )
}

export default PostPage