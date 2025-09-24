'use client'
import { ChevronDown } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import SearchBar from '../Forms/searchbar';

interface CoursePickerButtonProps {
  course: string
  onCourseChange: (course: string) => void
}

const CoursePickerButton = ( {course, onCourseChange}: CoursePickerButtonProps ) => {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [courseForPost, setCourseForPost] = useState<string>(course);
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

  const changeCourse = (course: string) => {
    setCourseForPost(course);
    onCourseChange(course);
    setIsSearching(false);
  }

  return (
    <div ref={searchRef}>
      {isSearching ? ( 
        <SearchBar placeholder='Search for a course' coursePickerButton={true} changeCourse={changeCourse} />
      ) : (
        <button 
        className='border-black border-1 rounded-full hover:bg-gray-100 p-2 w-1/3 flex items-center justify-between cursor-pointer'
        onClick={() => setIsSearching(true)}
        >
          <span>{courseForPost}</span>
          <ChevronDown />
        </button>
      )}
    </div>
  )
}

export default CoursePickerButton