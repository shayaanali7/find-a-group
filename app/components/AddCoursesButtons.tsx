'use client'
import React from 'react'

interface AddCoursesButtonsProps {
  courses: string[];
  courseHasBeenAdded: boolean[];
  changeStatus: (index: number) => void;
  showError: boolean;
}

const AddCoursesButtons = ({ courses, courseHasBeenAdded, changeStatus, showError }: AddCoursesButtonsProps) => {
  return (
    <div className='flex flex-col h-full max-h-[60vh]'>
      <div className='flex-1 mb-8'>
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
              style={{ transitionDelay: `${index * 100}ms` }}
              onClick={() => changeStatus(index)}
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

        <div className='mt-6 p-4 bg-gray-50 rounded-xl transition-all duration-500 ease-out'>
          <p className={`text-black font-semibold p-2 rounded-2xl
    ${courseHasBeenAdded.filter(Boolean).length > 0 
      ? 'bg-green-100' 
      : showError 
        ? 'bg-red-100' 
        : 'bg-gray-100'
    }`}>
            {courseHasBeenAdded.filter(Boolean).length > 0 
              ? `Selected ${courseHasBeenAdded.filter(Boolean).length} course${courseHasBeenAdded.filter(Boolean).length !== 1 ? 's' : ''}`
              : `${showError ? 'Please select atleast one course' : 'No courses selected yet'}`
            }
          </p>
        </div>
      </div>
    </div>
  )
}

export default AddCoursesButtons