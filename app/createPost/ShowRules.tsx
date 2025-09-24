'use client'
import { TriangleAlert } from 'lucide-react'
import React, { useState } from 'react'
import ModalScreen from '../components/UI/Modals/ModalScreen';

const ShowRules = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleClose = () => {
    setIsOpen(false);
  }

  return (
    <>
      <button className='transition duration-300 hover:bg-purple-300 rounded-3xl p-1' onClick={() => setIsOpen(!isOpen)}>
        <TriangleAlert className='h-8 w-8'/>
      </button>

      {isOpen && (
        <ModalScreen isOpen={isOpen}>
          <div className='flex flex-col h-full text-black'>
            <div className='flex-shrink-0 pt-4 pb-2'>
              <h1 className='font-semibold text-center text-2xl'>Rules</h1>
            </div>

            <div className='flex-1 overflow-y-auto p-4'>
              <ol className='list-none space-y-4'>
                <li className="flex items-start">
                  <span className='pr-3'>1</span>
                  <span className='break-words'>Be respectful and courteous to all members. No harassment, hate speech, or foul language.</span>
                </li>
                <li className="flex items-start">
                  <span className='pr-3'>2</span>
                  <span className='break-words'>Only post content related to finding or forming groups for courses or projects.</span>
                </li>
                <li className="flex items-start">
                  <span className='pr-3'>3</span>
                  <span className='break-words'>Be honest about your skills and availability when joining or creating groups.</span>
                </li>
                <li className="flex items-start">
                  <span className='pr-3'>4</span>
                  <span className='break-words'>No spam, advertising, or self-promotion of unrelated services.</span>
                </li>
                <li className="flex items-start">
                  <span className='pr-3'>5</span>
                  <span className='break-words'>Do not share personal information (yours or others&apos;) publicly.</span>
                </li>
                <li className="flex items-start">
                  <span className='pr-3'>6</span>
                  <span className='break-words'>Follow all university and course policies when collaborating with others.</span>
                </li>
              </ol>
            </div> 

            <div className='flex-shrink-0 flex justify-end gap-3 pt-4 pb-2'>
              <button
                onClick={handleClose}
                className='w-32 py-2 px-8 rounded-full font-semibold text-purple-500 bg-white hover:bg-purple-50 shadow border border-purple-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300'
              >
                Close
              </button>
            </div>
          </div>
        </ModalScreen>
      )}
    </>
    
  )
}

export default ShowRules