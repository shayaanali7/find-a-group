'use client'
import React from 'react'

interface filterType {
  filters: string[];
}


const SaveButton = ({ filters }: filterType ) => {
  const handleClick = () => {
		console.log(filters);
	}

  return (
      <button 
        onClick={handleClick}
        className='w-full h-8 mt-2 text-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transform transition-colors duration-300 font-semibold hover:from-purple-600 hover:to-indigo-600 shadow-purple-200 text-white cursor-pointer'
        >Save
      </button>
  );
}

export default SaveButton