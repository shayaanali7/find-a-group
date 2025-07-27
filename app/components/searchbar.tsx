'use client'
import React, { useEffect, useRef, useState } from 'react'
import { BookOpen, FileText, Search, User } from "lucide-react"
import { createClient } from '../utils/supabase/client'


interface SearchBarProps {
  placeholder: string
}

interface SearchResult {
  id: string, 
  type: 'user' | 'course' | 'post',
  title: string,
  subtitle?: string,
  imageUrl?: string,
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
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

      const formattedResults: SearchResult[] = [
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
      console.log('Search results:', posts);
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

  const handleResultClick = (result: SearchResult) => {
    console.log('Result clicked:', result);

    setSearchQuery('');
    setShowResults(false);
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'course':
        return <BookOpen className="w-4 h-4" />;
      case 'post':
        return <FileText className="w-4 h-4" />;
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
    <>
      <div className='md:hidden w-10' />

      <div ref={searchBarRef} className='relative flex-1 max-w-md mx-auto md:mx-0'>
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
                      {result.imageUrl ? (
                        <img 
                          src={result.imageUrl} 
                          alt={result.title}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          {getResultIcon(result.type)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {result.title}
                          </h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
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
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
      <div className='md:hidden w-10' />
    </>
  )
}

export default SearchBar