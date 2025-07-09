'use client'
import React, { useEffect, useRef, useState } from 'react'

interface ProfileInformationProps {
  setSelectedYear: (year: string) => void;
  selectedYear: string;
  major: string;
  setMajor: (major: string) => void;
  showError: boolean;
}

const ProfileInformation = ({ setSelectedYear, selectedYear, major, setMajor, showError }: ProfileInformationProps) => {
  const years = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
  ];

  const majors = [
    { value: 'Computer Science', label: 'Computer Science' } ,
    { value: 'Business', label: 'Business' },
  ]

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
  }

  const handleMajorSelect = (major: string) => {
    setMajor(major);
  }

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-6'>
        <div>
          <h3 className='text-lg font-semibold text-black mb-2 ml-2'>What Year Are You In?</h3>
          <div className='max-w-xs'>
            <select 
              value={selectedYear}
              onChange={(e) => handleYearSelect(e.target.value)}
              className='w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium transition-all duration-300 transform hover:from-purple-700 hover:to-indigo-700 p-4 rounded-3xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 appearance-none cursor-pointer'
            >  
              <option value='' disabled className='bg-white text-gray-800'>Select Your Year</option>
              {years.map((year) => (
                <option key={year.value} value={year.value} className='bg-white text-gray-800'>
                  {year.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <h3 className='text-lg font-semibold text-black mb-2 ml-2'>What's Your Major</h3>
          <div className='max-w-xs'>
            <select 
              value={major}
              onChange={(e) => handleMajorSelect(e.target.value)}
              className='w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium transition-all duration-300 transform hover:from-purple-700 hover:to-indigo-700 p-4 rounded-3xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 appearance-none cursor-pointer'
            >  
              <option value='' disabled className='bg-white text-gray-800'>Select Your Major</option>
              {majors.map((major) => (
                <option key={major.value} value={major.value} className='bg-white text-gray-800'>
                  {major.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showError && (
        <div className='bg-red-50 border border-red-200 rounded-2xl p-4'>
          <h3 className='text-sm font-medium text-red-800'>
            Complete Your Profile
          </h3>
          <p className='text-sm text-red-700 mt-1'>
            Please select both your year and major before continuing.
          </p>
        </div>
      )}
    </div>
  )
}

export default ProfileInformation