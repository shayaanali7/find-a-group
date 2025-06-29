'use client'
import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import ModalScreen from './ModalScreen';
import FilterList from './filterList';

const FilterButton = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false); 

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center p-2 hover:bg-purple-200 rounded-full transition-colors duration-200`}
        aria-label="Open filters"
      >
        <Filter className="w-6 h-6 text-gray-700" />
      </button>

      {isOpen && (
        <ModalScreen isOpen={isOpen} handleClose={() => setIsOpen(false)}>
          <div className='flex flex-col h-full text-black'>
            <div className='flex-shrink-0 pt-4 pb-2'>
              <h1 className='font-semibold text-center text-2xl'>Add Filters</h1>
            </div>

            <div className='flex-1 overflow-y-auto px-2 py-2 min-h-0'>
              <div className='max-h-[400px] overflow-y-auto'>
                
              </div>
            </div>

            <div className='flex-shrink-0 flex justify-end gap-3 pt-4 pb-2'>
              <button
                onClick={() => setIsOpen(false)}
                className='w-32 py-2 px-8 rounded-full font-semibold text-white bg-purple-500 hover:bg-purple-600 shadow transition-colors duration-200 border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300'
              >
                Add
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className='w-32 py-2 px-8 rounded-full font-semibold text-purple-500 bg-white hover:bg-purple-50 shadow border border-purple-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300'
              >
                Close
              </button>
            </div>
          </div>
        </ModalScreen>
      )}
    </div>
    


  );
};

export default FilterButton;