'use client'
import React, { useState } from 'react'
import NavigationBar from './navbar'
import FilterButton from './FilterButton'
import CreatePostButton from './CreatePostButton'
import JoinCourseButton from './JoinCourseButton'
import { join } from 'path'

interface MainContentLayoutProps {
    pageTitle: string, 
    courses: Array<string>,
    id: string
}

const MainContentLayout = ( {pageTitle, courses, id}: MainContentLayoutProps ) => {
	const [currentCourses, setCurrentCourses] = useState<Array<string>>(courses);

	const handleCourseChange = (course: string, joined: boolean) => {
		setCurrentCourses(prev => 
			joined ? [...prev, course] : prev.filter(element => element !== course)
		)
	} 

  return (
    <>
    <NavigationBar courses={currentCourses} />
		<div className='w-7/10  flex-1 h-full overflow-y-auto bg-white'>
			<div className='flex justify-between items-center p-4'>
				<h1 className='text-3xl font-bold w-1/2'>
						{pageTitle && pageTitle.length !== 0 ? pageTitle : 'Main Page'}
				</h1>  
				<div className='flex flex-row items-center gap-0.5'>
					<div className='md:w-12 w-16 flex justify-start md:hidden mt-2 ml-10'>
						<FilterButton />
					</div>
					<div className='flex justify-end w-full'>
						<CreatePostButton />
						<JoinCourseButton courseList={courses} courseName={pageTitle} id={id} onCourseChange={handleCourseChange} />
					</div>
				</div>
			</div>
			

			<div className='p-4'>
				{Array.from({ length: 50 }, (_, i) => (
					<div key={i} className='mb-4 p-4 border border-gray-200 rounded'>
						<h4>Post {i + 1}</h4>
						<p>This is post content that will scroll when there are many posts...</p>
					</div>
				))}
			</div>
		</div>
    </>
  )
}

export default MainContentLayout