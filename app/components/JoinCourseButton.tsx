'use client'
import React, { useEffect, useState } from 'react'
import { addCourse, removeCourse } from '../utils/supabaseComponets/changeCourseStatus';
import ModalScreen from './ModalScreen';
import { AlertTriangle, BookOpen, CheckCircle, Clock } from 'lucide-react';

interface JoinCourseButtonProps {
  courseName: string,
  id?: string,
  courseList: Array<string>,
  onCourseChange?: (course: string, joined: boolean) => void
}

const JoinCourseButton = ({courseList, courseName, id, onCourseChange}: JoinCourseButtonProps) => {
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [confirmationPanelOpen, setConfirmationPanelOpen] = useState<boolean>(false);

  useEffect(() => {
    if (courseList.includes(courseName)) {
      setIsJoined(true);
    }
  }, [courseList, courseName])

  const handleClick = () => {
    if (isJoined === false) handleJoin();
    else setConfirmationPanelOpen(true);
  }

  const handleJoin = async () => {
    setIsJoined(true)
    if (id) await addCourse({ courseName, id })
    else console.error('User is undefined. Cannot join course.');
    onCourseChange?.(courseName, true);
  }

  const handleLeave = async () => {
    setIsJoined(false)
    setConfirmationPanelOpen(false);
    if (id) await removeCourse({ courseName, id })
    else console.error('User is undefined. Cannot join course.');
    onCourseChange?.(courseName, false);
  }
 
  return (
    <>
      <div>
        <button 
          className={
            `${isJoined ? ' bg-purple-200 hover:bg-purple-300' : 'hover:bg-gray-100'} flex items-center border-black border-1 rounded-full pl-5 pr-5 p-2 mt-2 mr-5 cursor-pointers`
          }
          onClick={handleClick}
          >
            <span>{isJoined ? 'Joined' : 'Join'}</span>
        </button>
      </div>

      {(confirmationPanelOpen && isJoined) && ( 
        <ModalScreen isOpen={confirmationPanelOpen} handleClose={() => setConfirmationPanelOpen(!confirmationPanelOpen)} height='50vh' width='85vh'>
          <div className='flex flex-col h-full text-black'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center'>
                <AlertTriangle className='w-6 h-6 text-red-600' />
              </div>
              <h1 className='text-2xl font-bold text-gray-800'>Leave Course</h1>
            </div>

            <div className='flex-grow space-y-4'>
              <p className='text-gray-600 text-lg'>
                Are you sure you want to leave <span className='font-semibold text-purple-600'>"{courseName}"</span>?
              </p>
              
              <ul className='text-sm text-gray-600 space-y-2'>
                <li className='flex items-center gap-2'>
                  <CheckCircle className='w-4 h-4 text-green-500' />
                  Your posts and comments will be saved
                </li>
                <li className='flex items-center gap-2'>
                  <Clock className='w-4 h-4 text-blue-500' />
                  You can rejoin anytime
                </li>
                <li className='flex items-center gap-2'>
                  <BookOpen className='w-4 h-4 text-gray-500' />
                  Course-specific posts will be unavailable
                </li>
              </ul>
            </div>

            <div className='flex-shrink-0 flex justify-end gap-3 pt-4 pb-2'>
              <button
                onClick={() => setConfirmationPanelOpen(false)}
                className='w-32 py-2 px-8 rounded-full font-semibold text-purple-500 bg-white hover:bg-purple-50 shadow border border-purple-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300'
              >
                Close
              </button>

              <button
                onClick={handleLeave}
                className='w-32 py-2 px-8 rounded-full font-semibold text-white bg-purple-500 hover:bg-purple-600 shadow transition-colors duration-200 border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300'
              >
                Leave
              </button>
            </div>
          </div>
        </ModalScreen>
      )}
    </>
    
  )
}

export default JoinCourseButton