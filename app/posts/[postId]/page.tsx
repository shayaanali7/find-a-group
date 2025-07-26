import PostonCommentSection from '@/app/components/PostOnCommentSection';
import NavigationBar from '@/app/components/navbar';
import ProfileButton from '@/app/components/ProfileButton';
import ProfileCard from '@/app/components/ProfileCard';
import SearchBar from '@/app/components/searchbar';
import { createClient } from '@/app/utils/supabase/server';
import { getProfileInformation } from '@/app/utils/supabaseComponets/getProfileInformation';
import { GetProfilePicture } from '@/app/utils/supabaseComponets/getProfilePicture';
import { getUserCourses } from '@/app/utils/supabaseComponets/getUserCourses';
import getUserServer, { getUsername } from '@/app/utils/supabaseComponets/getUserServer';
import { courses as courseTags, groupSizes, roles, groupStatus, locations } from '@/app/data/tags';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import RenderCommentSection from './RenderCommentSection';

interface PostPageProps {
  params: {
    postId: string;
  }
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

  const profile = user.id ? await getProfileInformation(postData.user_id) : null;
  
  const allTags = [...courseTags, ...groupSizes, ...roles, ...groupStatus, ...locations];
  const getTagStyle = (tag: string) => {
    const tagConfig = allTags.find(t => t.label.toLowerCase() === tag.toLowerCase());
    if (tagConfig) {
      const baseColor = tagConfig.color.replace('bg-', '').replace('-400', '');
      return {
        backgroundColor: `bg-${baseColor}-400`,
        textColor: `text-${baseColor}-800`
      };
    }
    return {
      backgroundColor: 'bg-gray-100',
      textColor: 'text-gray-800'
    };
  }

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
      <div className='w-full flex justify-center border-b border-purple-500 pb-2 flex-shrink-0'>
        <div className='md:w-12 w-16'></div>
        
        <div className='flex-1 flex justify-center'>
          <SearchBar placeholder='Search for a post'/>
        </div>

        <div className='md:w-12 w-16 flex justify-end'>
          <ProfileButton imageURL={imageURL} username={username.data?.username}/>
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
              </div>

              <div className="space-y-3 mt-4">
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  {postData.header}
                </h2>
                
                {postData.tags && postData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {postData.tags.map((tag: string, index: number) => {
                      const tagStyle = getTagStyle(tag);
                      console.log('Tag Style:', tagStyle);
                      console.log('Tag:', tag);
                      return (
                        <span 
                          key={index}
                          className={`inline-block ${tagStyle.backgroundColor} ${tagStyle.textColor} text-xs px-2 py-1 rounded-full font-medium`}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                )}
                
                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {postData.content}
                </div>
              </div>
            </div>

            <div>
              {user.id && <PostonCommentSection postId={postId}  id={user.id} />}
              <RenderCommentSection postId={postId} />
            </div>
          </div>

          <ProfileCard profile={profile} />
      </div>    
    </main>
  )
}

export default PostPage