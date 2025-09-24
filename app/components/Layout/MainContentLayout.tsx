'use client'
import React, { useState, useEffect } from 'react'
import NavigationBar from './navbar'
import FilterButton from '../UI/Buttons/FilterButton'
import CreatePostButton from '../UI/Buttons/CreatePostButton'
import JoinCourseButton from '../UI/Buttons/JoinCourseButton'
import { RenderPosts } from '../Features/PostComponents/RenderPosts'

interface MainContentLayoutProps {
    pageTitle: string, 
    courses: Array<string>,
    id: string,
    activeFilters: string[]
}

const MainContentLayout = ({ pageTitle, courses, id, activeFilters }: MainContentLayoutProps) => {
	const [currentCourses, setCurrentCourses] = useState<Array<string>>(courses);
  const [mobileFilters, setMobileFilters] = useState<string[]>([]);
  const effectiveFilters = mobileFilters.length > 0 ? mobileFilters : activeFilters;

	const handleCourseChange = (course: string, joined: boolean) => {
		setCurrentCourses(prev => 
			joined ? [...prev, course] : prev.filter(element => element !== course)
		)
	}
  
  const handleMobileFiltersApply = (filters: string[]) => {
    setMobileFilters(filters);
  };

  useEffect(() => {
    if (activeFilters.length > 0) {
      setMobileFilters([]);
    }
  }, [activeFilters]);

  return (
    <>
      <NavigationBar courses={currentCourses} />
      <div className='w-7/10 flex-1 h-full overflow-y-auto bg-white'>
        <div className='flex justify-between items-center p-4'>
          <h1 className='text-3xl font-bold w-1/2'>
            {pageTitle && pageTitle.length !== 0 ? pageTitle : 'Feed'}
          </h1>  
          <div className='flex flex-row items-center gap-0.5'>
            <div className='md:w-12 w-16 flex justify-start md:hidden mt-2 ml-10 relative'>
              <FilterButton 
                onFiltersApply={handleMobileFiltersApply} 
                saveButtonOn={true}
                selectedFilters={mobileFilters}
              />
            </div>
            <div className='flex justify-end w-full'>
              {<CreatePostButton courseName={pageTitle} />}
              {pageTitle !== 'Feed' && <JoinCourseButton courseList={courses} courseName={pageTitle} id={id} onCourseChange={handleCourseChange} /> } 
            </div>
          </div>
        </div>

        <div className='p-4'>
          <RenderPosts course={pageTitle} activeFilters={effectiveFilters} />
        </div>
      </div>
    </>
  )
}

export default MainContentLayout