'use client'
import React, { useState } from 'react'

interface FilterPopUpProps {
  text: string
}

const FilterPopUp = ({text}: FilterPopUpProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div>
      <button className='border-black border-1 hover:bg-gray-100 rounded-full p-1 px-5' onClick={() => setIsOpen(true)}>
        {text}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg min-w-[300px]">
            <h2 className="text-xl font-bold mb-4">Popup Title</h2>
            <p>This is the popup content.</p>
            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterPopUp