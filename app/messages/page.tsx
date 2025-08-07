import React from 'react'

const MessagesPage = () => {
  return (
    <div className='flex-1 flex items-center justify-center bg-white border-l-1 border-purple-500'>
      <div className='text-center text-gray-500'>
        <div className='mb-4'>
          <svg className='w-16 h-16 mx-auto text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
          </svg>
        </div>
        <h2 className='text-xl font-semibold mb-2'>Select a conversation</h2>
        <p className='text-sm'>Choose a conversation from the sidebar to start messaging</p>
      </div>
    </div>
  )
}

export default MessagesPage