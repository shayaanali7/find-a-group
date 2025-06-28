import React, {useState} from 'react'
import { CirclePlus } from 'lucide-react';
import ModalScreen from './ModalScreen';

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
          <></>
        </ModalScreen>
      )}
    </div>
  )
}

export default AddGroupModal