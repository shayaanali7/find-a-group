import Link from 'next/link';
import React from 'react'
import { Post, UserInfo } from './RenderPosts';
import Image from 'next/image';

export const PostCard = React.memo(({ 
  post, 
  user, 
  course, 
  formatDate, 
  handleClick, 
  handleClickProfile 
}: {
  post: Post;
  user?: UserInfo;
  course: string;
  formatDate: (dateString: string) => string;
  handleClick: (postId: string) => void;
  handleClickProfile: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}) => {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => handleClick(post.post_id)}
    >
      <div className="flex items-start gap-3">
        <Link 
          href={user?.username ? `/user/${user.username}` : '/profilePage'}
          className="flex items-start gap-3 flex-shrink-0 hover:opacity-80 transition-opacity"
          onClick={handleClickProfile}
        >
          {user?.profile_picture_url ? (
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <Image 
                src={user.profile_picture_url} 
                width={40} 
                height={40} 
                alt={`${user.name || user.username}'s profile picture`}
                className="w-full h-full object-cover"
                loading="lazy"
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

        {course === 'Feed' && (
          <Link href={`/courses/${post.course_name}`} onClick={handleClickProfile}>
            <span className="text-xs text-purple-700 transform transition-all duration-300 bg-purple-100 hover:bg-purple-200 px-2 py-1 rounded-full flex-shrink-0">
              {post.course_name}
            </span>
          </Link>
        )}
      </div>

      <div className="space-y-3 mt-4">
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
          {post.header}
        </h2>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: string, index: number) => (
              <span 
                key={index}
                className="inline-block bg-gradient-to-r from-purple-500 to-indigo-500 transform transition-colors duration-300 hover:from-purple-600 hover:to-indigo-600 shadow-purple-200 text-white min-w-[40px] text-center text-xs px-2 py-1 rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </div>
      </div>
    </div>
  );
});

PostCard.displayName = 'PostCard';