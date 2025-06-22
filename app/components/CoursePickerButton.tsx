'use client'
import { ChevronDown } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import SearchBar from './searchbar';

interface CoursePickerButtonProps {
  course: string
}

const CoursePickerButton = ( {course}: CoursePickerButtonProps ) => {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSearching) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearching(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSearching]);

  return (
    <div ref={searchRef}>
      {isSearching ? ( 
        <SearchBar placeholder='Search for a course' />
      ) : (
        <button 
        className='border-black border-1 rounded-full hover:bg-gray-100 p-2 w-1/3 flex items-center justify-between cursor-pointer'
        onClick={() => setIsSearching(true)}
        >
          <span>{course}</span>
          <ChevronDown />
        </button>
      )}
    </div>
  )
}

export default CoursePickerButton