'use client'
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useLoading } from './LoadingContext';
import { useQuery } from '@tanstack/react-query';
import { PostCard } from './PostCard'; 
import {groupSizes, roles, groupStatus, locations} from '../data/tags.js'

type ProfileData = {
  id: string;
  username: string;
  name: string;
  profile_picture_url: string;
};

export interface Post {
  post_id: string,
  course_name: string
  user_id: string,
  created_at: string,
  header: string,
  content: string,
  tags: string[]
}

export interface UserInfo {
  username: string,
  name: string,
  profile_picture_url: string,
}

interface SupabasePostRow {
  post_id: string;
  user_id: string;
  course_name: string;
  created_at: string;
  header: string;
  content: string;
  tags: string[];
  profile: ProfileData | ProfileData[] | null;
}

interface PostWithUser extends Post {
  user?: UserInfo;
}

const extractUserInfo = (profile: ProfileData | ProfileData[] | null): UserInfo | undefined => {
  if (!profile) return undefined;
  
  if (Array.isArray(profile)) {
    return profile.length > 0 ? {
      username: profile[0].username,
      name: profile[0].name,
      profile_picture_url: profile[0].profile_picture_url
    } : undefined;
  }
  
  return {
    username: profile.username,
    name: profile.name,
    profile_picture_url: profile.profile_picture_url
  };
};

const fetchPostsWithUsers = async (
  course: string, 
  page: number = 0, 
  pageSize: number = 20, 
  filters: string[] = [],
  courseFilters: string[] = []
): Promise<PostWithUser[]> => {
  const supabase = createClient();
  const offset = page * pageSize;
  
  let query = supabase
    .from('posts')
    .select(`
      post_id,
      user_id,
      course_name,
      created_at,
      header,
      content,
      tags,
      profile:user_id(
          id,
          username,
          name,
          profile_picture_url
        )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (courseFilters.length > 0) {
    query = query.in('course_name', courseFilters);
  } else if (course !== 'Feed') {
    query = query.eq('course_name', course);
  }
  if (filters.length > 0) {
    query = query.overlaps('tags', filters);
  }

  const { data: postData, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  const typedPostData = postData as SupabasePostRow[] | null;
  return typedPostData?.map((post: SupabasePostRow) => ({
    post_id: post.post_id,
    course_name: post.course_name,
    user_id: post.user_id,
    created_at: post.created_at,
    header: post.header,
    content: post.content,
    tags: post.tags,
    user: extractUserInfo(post.profile)
  })) || [];
};

export const RenderPosts = React.memo(({ course, activeFilters = [] }: { course: string, activeFilters?: string[] }) => {
  const { startLoading, stopLoading } = useLoading();
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [allPosts, setAllPosts] = useState<PostWithUser[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const processedDataRef = useRef<string>('');

  const { courseFilters, tagFilters } = useMemo(() => {
    const allKnownTagLabels = [
      ...groupSizes.map(tag => tag.label),
      ...roles.map(tag => tag.label),
      ...groupStatus.map(tag => tag.label),
      ...locations.map(tag => tag.label)
    ];
    const courses = activeFilters.filter(filter => !allKnownTagLabels.includes(filter));
    const tags = activeFilters.filter(filter => allKnownTagLabels.includes(filter));
    
    return {
      courseFilters: courses,
      tagFilters: tags
    };
  }, [activeFilters]);

  useEffect(() => {
    setPage(0);
    setAllPosts([]);
    setHasMore(true);
    processedDataRef.current = '';
  }, [course, activeFilters]);

  const {
    data: newPosts = [],
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['posts', course, page, tagFilters, courseFilters],
    queryFn: () => fetchPostsWithUsers(course, page, 20, tagFilters, courseFilters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
    refetchInterval: 30 * 60 * 1000,
    enabled: true,
  });

  useEffect(() => {
    const dataKey = `${course}-${page}-${newPosts.length}-${newPosts[0]?.post_id || 'empty'}`;
    
    if (newPosts && processedDataRef.current !== dataKey) {
      processedDataRef.current = dataKey;
      
      if (page === 0) {
        setAllPosts(newPosts);
        setHasMore(newPosts.length === 20);
      } else {
        setAllPosts(prev => {
          const existingIds = new Set(prev.map(p => p.post_id));
          const newUniquePosts = newPosts.filter(p => !existingIds.has(p.post_id));
          return [...prev, ...newUniquePosts];
        });
        setHasMore(newPosts.length === 20);
      }
    }
  }, [newPosts.length, page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
        && !isFetching
        && hasMore
      ) {
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching, hasMore]);

  const formatDate = useMemo(() => {
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return (dateString: string) => dateFormatter.format(new Date(dateString));
  }, []);

  const handleClick = useCallback((postId: string) => {
    startLoading();
    router.push(`/posts/${postId}`);
    setTimeout(() => {
      stopLoading();
    }, 1000);
  }, [startLoading, stopLoading, router]);

  const handleClickProfile = useCallback((e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    startLoading();
    e.stopPropagation();
    setTimeout(() => {
      stopLoading();
    }, 1000);
  }, [startLoading, stopLoading]);

  const loadingSkeleton = useMemo(() => (
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
  ), []);

  const errorState = useMemo(() => (
    <div className="text-center py-8">
      <div className="text-red-500 mb-2">Error loading posts</div>
      <div className="text-gray-600 text-sm">{(error as Error)?.message}</div>
      <button 
        onClick={() => refetch()} 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Retry
      </button>
    </div>
  ), [error, refetch]);

  if (isLoading && page === 0) return loadingSkeleton;
  if (error) return errorState;

  return (
    <div className="space-y-4">
      {activeFilters.length > 0 && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
          <div className="text-sm text-purple-700 font-medium mb-2">Active Filters:</div>
          <div className="flex flex-wrap gap-2">
            {courseFilters.length > 0 && (
              <div className="w-full mb-2">
                <div className="text-xs text-purple-600 mb-1">Courses:</div>
                <div className="flex flex-wrap gap-1">
                  {courseFilters.map((filter, index) => (
                    <span 
                      key={index}
                      className={`inline-block min-w-[40px] text-center bg-gradient-to-r from-purple-500 to-indigo-500 transform transition-colors duration-300 hover:from-purple-600 hover:to-indigo-600 shadow-purple-200 text-white text-xs px-2 py-1 rounded-full font-medium`}
                    >
                      {filter}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {tagFilters.length > 0 && (
              <div className="w-full">
                <div className="text-xs text-purple-600 mb-1">Tags:</div>
                <div className="flex flex-wrap gap-1">
                  {tagFilters.map((filter, index) => (
                    <span 
                      key={index}
                      className={`inline-block min-w-[40px] text-center bg-gradient-to-r from-purple-500 to-indigo-500 transform transition-colors duration-300 hover:from-purple-600 hover:to-indigo-600 shadow-purple-200 text-white text-xs px-2 py-1 rounded-full font-medium`}
                    >
                      {filter}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {allPosts.map((post) => (
        <PostCard
          key={post.post_id}
          post={post}
          user={post.user}
          course={course}
          formatDate={formatDate}
          handleClick={handleClick}
          handleClickProfile={handleClickProfile}
        />
      ))}
      
      {isFetching && page > 0 && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}
      
      {!hasMore && allPosts.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          No more posts to load
        </div>
      )}
      
      {allPosts.length === 0 && !isLoading && !isFetching && (
        <div className="text-center py-8 text-gray-500">
          {activeFilters.length > 0 
            ? "No posts found matching the selected filters." 
            : "No posts found for this page."
          }
        </div>
      )}
    </div>
  );
});

RenderPosts.displayName = "RenderPosts";