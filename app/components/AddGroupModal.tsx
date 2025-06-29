import React, {useState} from 'react'
import { CirclePlus } from 'lucide-react';
import ModalScreen from './ModalScreen';
import SearchBar from './searchbar';

const AddGroupModal = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className='flex items-center w-9/10 gap-2 m-1 ml-2 hover:bg-purple-200 p-2 rounded-full text-xl'>
        <CirclePlus className='text-3xl' />
        <span>Create Group</span>
      </button>
    
      {isOpen && (
        <ModalScreen isOpen={isOpen} handleClose={() => setIsOpen(false)}>
          <div className='flex flex-col h-full text-black'>
            <div className='flex-shrink-0 pt-4 pb-2'>
              <h1 className='font-semibold text-center text-2xl'>Create A Group</h1>
            </div>

            <div className='flex-1 overflow-y-auto px-2 py-2 min-h-0'>
              <div className='max-h-[400px] overflow-y-auto'>
                <div className='mt-2'>
                  <input 
                    type='text' 
                    placeholder='Group Name' 
                    className={`border-black border-1 hover:bg-gray-10 rounded-full mt-1 p-1 w-full text-xl text-left`}>
                  </input>
                </div>

                <div className='mt-5'>
                  <h1 className='text-xl font-semibold mt-4'>Group Members</h1>
                  <SearchBar placeholder='Select Group Members' />
                </div>
              </div>
            </div>

            <div className='flex-shrink-0 flex justify-end gap-3 pt-4 pb-2'>
              <button
                onClick={() => setIsOpen(false)}
                className='py-2 px-8 rounded-full font-semibold text-white bg-purple-500 hover:bg-purple-600 shadow transition-colors duration-200 border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300'
              >
                Create
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className='py-2 px-8 rounded-full font-semibold text-purple-500 bg-white hover:bg-purple-50 shadow border border-purple-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300'
              >
                Close
              </button>
            </div>
          </div>
        </ModalScreen>
      )}
    </div>
  )
}

export default AddGroupModal