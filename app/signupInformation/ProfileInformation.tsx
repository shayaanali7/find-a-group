'use client'
import React, { useEffect, useRef, useState } from 'react'

interface ProfileInformationProps {
  setSelectedYear: (year: string) => void;
  selectedYear: string;
}

const ProfileInformation = ({ setSelectedYear, selectedYear }: ProfileInformationProps) => {
  const years = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
  ];

    const handleYearSelect = (year: string) => {
    setSelectedYear(year);
  }

  return (
    <div className='grid grid-cols-3 grid-rows-2'>
      <div>
        <h3 className='text-lg font-semibold text-gray-700 mb-4'>What year are you in?</h3>
        <div className='max-w-xs'>
          <select 
            value={selectedYear}
            onChange={(e) => handleYearSelect(e.target.value)}
            className='w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium transition-all duration-300 transform hover:from-purple-700 hover:to-indigo-700 hover:scale-105 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 appearance-none cursor-pointer'
          >
            <option value='' disabled className='bg-white text-gray-800'>Select your year</option>
            {years.map((year) => (
              <option key={year.value} value={year.value} className='bg-white text-gray-800'>
                {year.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default ProfileInformation