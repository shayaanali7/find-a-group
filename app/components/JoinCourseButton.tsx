'use client'
import React, { useEffect, useState } from 'react'
import { addCourse, removeCourse } from '../utils/supabaseComponets/changeCourseStatus';

interface JoinCourseButtonProps {
  courseName: string,
  id?: string,
  courseList: Array<string>,
  onCourseChange?: (course: string, joined: boolean) => void
}

const JoinCourseButton = ({courseList, courseName, id, onCourseChange}: JoinCourseButtonProps) => {
  const [isJoined, setIsJoined] = useState<boolean>(false);

  useEffect(() => {
    if (courseList.includes(courseName)) {
      setIsJoined(true);
    }
  }, [courseList, courseName])

  const updateCourse = async () => {
    const joined = !isJoined
    setIsJoined(joined);
    if (id && !isJoined) await addCourse({ courseName, id }); 
    else if (id && isJoined) await removeCourse({ courseName, id });
    else console.error('User is undefined. Cannot join course.');
    onCourseChange?.(courseName, joined)
  }
 
  return (
    <div>
        <button 
          className={
            `${isJoined ? ' bg-purple-200 hover:bg-purple-300' : 'hover:bg-gray-100'} flex items-center border-black border-1 rounded-full pl-5 pr-5 p-2 mt-2 mr-5 cursor-pointers`
          }
          onClick={updateCourse}
          >
            <span>{isJoined ? 'Joined' : 'Join'}</span>
        </button>
    </div>
  )
}

export default JoinCourseButton