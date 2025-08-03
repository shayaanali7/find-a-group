'use client'
import React, { useEffect, useRef, useState } from 'react'
import { GraduationCap, MessageSquare, Search, User } from "lucide-react"
import { createClient } from '../utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useLoading } from './LoadingContext'


interface SearchBarProps {
  placeholder: string
  groupModal?: boolean
  coursePickerButton?: boolean
  onClickAction?: (result: SearchResult) => void
  changeCourse?: (course: string) => void
}

export interface SearchResult {
  id: string, 
  type: 'user' | 'course' | 'post',
  title: string | undefined,
  subtitle?: string,
  profile_picture?: string,
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder, groupModal, onClickAction, coursePickerButton, changeCourse }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const { startLoading, stopLoading } = useLoading();
  const supabase = createClient();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);
  
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    setIsLoading(true);
    const searchTerm = query.trim().toLowerCase()

    try {
      const { data: users, error: usersError } = await supabase
        .from('profile')
        .select('id, username, name, profile_picture_url')
        .or(`username.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
        .limit(5);

      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('course_id, course_name')
        .or(`course_name.ilike.%${searchTerm}%`)
        .limit(5);

      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('post_id, user_id, header, content, course_name')
        .or(`header.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,course_name.ilike.%${searchTerm}%`)
        .limit(5);
      
      if (usersError || postsError || coursesError) {
        console.error('Error fetching search results:', usersError || postsError || coursesError);
        return;
      }
      
      let formattedResults = null
      if (groupModal) {
        formattedResults = [
          ...(users || []).map(user => ({
            id: user.id,
            type: 'user' as const,
            title: user.name || user.username,
            subtitle: user.username !== user.name ? `@${user.username}` : undefined,
            profile_picture: user.profile_picture_url
          })),
        ];
      }
      else if (coursePickerButton) {
       formattedResults = [
          ...(courses || []).map(course => ({
            id: course.course_id,
            type: 'course' as const,
            title: course.course_name,
            subtitle: ''
          })),
        ];
      }
      else {
        formattedResults = [
          ...(users || []).map(user => ({
            id: user.id,
            type: 'user' as const,
            title: user.name || user.username,
            subtitle: user.username !== user.name ? `@${user.username}` : undefined,
            profile_picture: user.profile_picture_url
          })),
          
          ...(courses || []).map(course => ({
            id: course.course_id,
            type: 'course' as const,
            title: course.course_name,
            subtitle: ''
          })),
          
          ...(posts || []).map(post => ({
            id: post.post_id,
            type: 'post' as const,
            user_id: post.user_id,
            title: post.header,
            subtitle: post.course_name
          }))
        ];
      }

      setSearchResults(formattedResults);
      setShowResults(true);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const query = event.target.value;
    setSearchQuery(query);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    performSearch(searchQuery);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      performSearch(searchQuery);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'user' && groupModal) {
      onClickAction?.(result);
      setSearchQuery('');
      setShowResults(false);
      return;
    }
    else if (result.type === 'course' && coursePickerButton) {
      if (onClickAction) {
        onClickAction(result);
      }
      else {
        if (result.title) changeCourse?.(result.title);
      }
      setSearchQuery('');
      setShowResults(false);
      return;
    }
    else {
      startLoading();
    }  
    
    if (result.type === 'user') {
      router.push(`/user/${result.subtitle?.slice(1)}`);
    } else if (result.type === 'course') {
      router.push(`/courses/${result.title}`);
    } else if (result.type === 'post') {
      router.push(`/posts/${result.id}`);
    }
    setSearchQuery('');
    setShowResults(false);
    setTimeout(() => {
      stopLoading();
    }, 1000)
  }

  const getResultIcon = (type: string) => {
    const iconClass = "w-4 h-4";
    
    switch (type) {
      case 'user':
        return <User className={iconClass} />;
      case 'course':
        return <GraduationCap className={`${iconClass} text-white`} />; 
      case 'post':
        return <MessageSquare className={`${iconClass} text-white`} />;
      default:
        return null;
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'user':
        return 'User';
      case 'course':
        return 'Course';
      case 'post':
        return 'Post';
      default:
        return '';
    }
  };

  return (
    <div ref={searchBarRef} className='relative w-full'>
      {coursePickerButton 
      ?  (
        <>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5 pointer-events-none' />
          <div>
            <input 
              type='text'
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className='w-full pl-10 pr-3 py-1 text-lg border-2 bg-white text-black border-black rounded-full focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-200'
            />
          </div>
        </>
      )
      : (
        <>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5 pointer-events-none' />
          <form onSubmit={handleSearchSubmit}>
            <input 
              type='text'
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={placeholder}
              className='w-full pl-10 pr-3 py-1 text-lg border-2 bg-white text-black border-black rounded-full focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-200'
            />
          </form>
        </>
      )}

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
              <span className="mt-2 block">Searching...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                >
                  <div className="flex items-center space-x-3">
                    {result.profile_picture ? (
                      <img 
                        src={result.profile_picture} 
                        alt={result.title}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        result.type === 'course' 
                          ? 'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white' 
                          : result.type === 'post' 
                          ? 'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
                          : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
                      }`}>
                        {getResultIcon(result.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {result.title}
                        </h4>
                        <span className="text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          {getResultTypeLabel(result.type)}
                        </span>
                      </div>
                      {result.subtitle && (
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No results found for &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar