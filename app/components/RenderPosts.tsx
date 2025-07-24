'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '../utils/supabase/client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Post {
  post_id: string,
  course_name: string
  user_id: string,
  created_at: string,
  header: string,
  content: string,
  tags: string[]
}

interface UserInfo {
  username: string,
  name: string,
  profile_picture_url: string,
}

interface PostWithUser extends Post {
  user?: UserInfo;
}

export const RenderPosts = ({ course }: { course: string }) => {
  const [postsWithUsers, setPostsWithUsers] = useState<PostWithUser[]>([]); 
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getPostsWithUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('*')
          .eq('course_name', course)
          .order('created_at', { ascending: false });

        if (postError) {
          throw postError;
        }

        if (!postData || postData.length === 0) {
          setPostsWithUsers([]);
          return;
        }

        const uniqueUserIds = [...new Set(postData.map(post => post.user_id))];
        const { data: userData, error: userError } = await supabase
          .from('profile')
          .select('id, username, name, profile_picture_url')
          .in('id', uniqueUserIds);

        if (userError) {
          console.warn('Error fetching user data:', userError);
          setPostsWithUsers(postData.map(post => ({ ...post })));
          return;
        }

        const userMap = (userData || []).reduce((acc, user) => {
          acc[user.id] = {
            username: user.username,
            name: user.name,
            profile_picture_url: user.profile_picture_url,
          };
          return acc;
        }, {} as { [key: string]: UserInfo });

        const postsWithUserData = postData.map(post => ({
          ...post,
          user: userMap[post.user_id],
        }));

        setPostsWithUsers(postsWithUserData);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setPostsWithUsers([]);
      } finally {
        setLoading(false);
      }
    };

    getPostsWithUsers();
  }, [course, supabase]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-32"></div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">Error loading posts</div>
        <div className="text-gray-600 text-sm">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {postsWithUsers.map((post) => {
        const user = post.user;
        return (
          <div 
            key={post.post_id} 
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {router.push(`/posts/${post.post_id}`)}}
          >
            <div className="flex items-start gap-3">
              <Link 
                href={user?.username ? `/user/${user.username}` : '/profilePage'}
                className="flex items-start gap-3 flex-shrink-0 hover:opacity-80 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                {user?.profile_picture_url ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image 
                      src={user.profile_picture_url} 
                      width={40} 
                      height={40} 
                      alt={`${user.name || user.username}'s profile picture`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                    {user?.name || 'Unknown User'}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-500 text-xs whitespace-nowrap">
                    <span>@{user?.username || 'unknown'}</span>
                    <span>• {formatDate(post.created_at)}</span>
                  </div>
                </div>
              </Link>
            </div>

            <div className="space-y-3 mt-4">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                {post.header}
              </h2>
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
                {post.content}
              </div>
            </div>
          </div>
        )
      })}
      
      {postsWithUsers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No posts found for this course.
        </div>
      )}
    </div>
  )
}