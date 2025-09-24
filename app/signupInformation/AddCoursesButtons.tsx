'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import SearchBar, { SearchResult } from '../components/UI/Forms/searchbar'

interface AddCoursesButtonsProps {
  courses: string[];
  courseHasBeenAdded: boolean[];
  changeStatus: (index: number) => void;
  searchedCourses: SelectedCourse[];
  setSearchedCourses: React.Dispatch<React.SetStateAction<SelectedCourse[]>>;
}

interface SelectedCourse {
  id: string;
  name: string;
  isFromArray: boolean;
  arrayIndex?: number;
}

const AddCoursesButtons = ({ 
  courses, 
  courseHasBeenAdded, 
  changeStatus, 
  searchedCourses,
  setSearchedCourses
}: AddCoursesButtonsProps) => {
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
          setShowSearchBar(false);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

  const arraySelectedCourses = courses
    .map((course, index) => ({
      id: course,
      name: course,
      isFromArray: true,
      arrayIndex: index
    }))
    .filter((_, index) => courseHasBeenAdded[index]);

  const allSelectedCourses = [...arraySelectedCourses, ...searchedCourses];

  const handleAddCourseFromSearch = (searchResult: SearchResult) => {
    const courseAlreadyExists = allSelectedCourses.some(
      course => course.name.toLowerCase() === searchResult.title!.toLowerCase()
    );
    
    if (courseAlreadyExists) {
      console.log('This course has already been added.');
      return;
    }

    const newCourse: SelectedCourse = {
      id: searchResult.id,
      name: searchResult.title || '',
      isFromArray: false
    };

    setSearchedCourses(prev => [...prev, newCourse]);
    setShowSearchBar(false);
  };

  const handleRemoveSearchedCourse = (courseId: string) => {
    setSearchedCourses(prev => prev.filter(course => course.id !== courseId));
  };

  const handleArrayCourseToggle = (index: number) => {
    changeStatus(index);
  };

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1'>
        <div className='mb-4'>
          {!showSearchBar ? (
            <button
              onClick={() => setShowSearchBar(true)}
              className='w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl border border-blue-200 border-dashed transition-all duration-300 flex items-center justify-center gap-2 text-blue-700 hover:text-blue-800 group'
            >
              <Search className='w-5 h-5 transition-transform group-hover:scale-110' />
              <span className='font-medium'>Search for additional courses</span>
            </button>
          ) : (
            <div className='border border-blue-200 rounded-xl p-4 bg-blue-50' ref={searchBarRef}>
              <SearchBar 
                placeholder='Search for courses (e.g., "CS1026", "CS1027")...' 
                coursePickerButton={true}
                onClickAction={handleAddCourseFromSearch}
              />
            </div>
          )}
          
          {searchedCourses.length > 0 && (
            <div className='mt-3'>
              <div className='flex flex-wrap gap-2'>
                {searchedCourses.map((course) => (
                  <div
                    key={course.id}
                    className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full font-medium text-sm transition-all duration-200 hover:from-purple-600 hover:to-indigo-600'
                  >
                    <span>{course.name}</span>
                    <button
                      onClick={() => handleRemoveSearchedCourse(course.id)}
                      className='w-4 h-4 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors duration-200'
                      title='Remove course'
                    >
                      <X className='w-3 h-3' />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className='text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2'>
            <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
            Popular Courses
          </h3>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
            {courses.map((course, index) => (
              <button 
                key={index} 
                className={`
                  group relative p-6 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                  ${courseHasBeenAdded[index] 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-200' 
                    : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-purple-200'
                  }
                  active:scale-95 opacity-100 transition-all duration-500 ease-out
                `}
                style={{ transitionDelay: `${index * 50}ms` }}
                onClick={() => handleArrayCourseToggle(index)}
              >
                <div className='flex items-center justify-center h-full'>
                  <span className='text-lg font-bold'>{course}</span>
                </div>

                <div className={`
                  absolute top-2 right-2 w-6 h-6 rounded-full border-2 border-white transition-all duration-300
                  ${courseHasBeenAdded[index] 
                    ? 'bg-white scale-100' 
                    : 'bg-transparent scale-0 group-hover:scale-100'
                  }
                `}>
                  {courseHasBeenAdded[index] && (
                    <div className='w-full h-full flex items-center justify-center'>
                      <svg className='w-4 h-4 text-emerald-500' fill='currentColor' viewBox='0 0 20 20'>
                        <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                      </svg>
                    </div>
                  )}
                </div>

                <div className='absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddCoursesButtons