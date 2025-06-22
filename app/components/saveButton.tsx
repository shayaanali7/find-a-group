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
        className='w-full h-8 mt-2 text-center rounded-full bg-blue-400 hover:bg-blue-500 transition-colors duration-300 cursor-pointer'
        >Save
      </button>
  );
}

export default SaveButton