import React from 'react'
import { Users } from 'lucide-react'
import AddGroupModal from '../components/UI/Modals/AddGroupModal'

const GroupsMainPage = () => {
  return (
    <div className='w-full flex flex-col h-full overflow-y-auto bg-white border-l-1 md:border-l-1 border-purple-500'>
      <div className='p-6 border-b border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <div className='w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white'>
              <Users className='w-7 h-7' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>My Groups</h1>
              <p className='text-gray-600'>Manage your group conversations</p>
            </div>
          </div>
        </div>
      </div>

      <div className='flex-1 flex items-center justify-center p-8'>
        <div className='text-center max-w-md'>
          <div className='w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center'>
            <Users className='w-12 h-12 text-purple-500' />
          </div>
          
          <h2 className='text-xl font-semibold text-gray-900 mb-3'>
            Welcome to Groups
          </h2>
          
          <p className='text-gray-600 mb-6 leading-relaxed'>
            Select a group from the sidebar to start chatting, or create a new group to bring people together.
          </p>

          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <AddGroupModal background={true} />
          </div>

          <div className='mt-8 p-4 bg-gray-50 rounded-lg'>
            <h3 className='font-medium text-gray-900 mb-2'>Quick Tips</h3>
            <ul className='text-sm text-gray-600 space-y-1 text-left'>
              <li>• Click on any group in the sidebar to join the conversation</li>
              <li>• Create groups to organize discussions by topic or team</li>
              <li>• Invite members to expand your group conversations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GroupsMainPage