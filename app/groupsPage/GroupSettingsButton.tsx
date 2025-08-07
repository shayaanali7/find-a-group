'use client'
import React, { useState } from 'react'
import { GroupMember } from './[groupchatId]/page'
import ModalScreen from '../components/ModalScreen'
import { AlertTriangle, Crown, Settings, X, Loader2 } from 'lucide-react'
import { createClient } from '../utils/supabase/client'

interface GroupSettingsButtonProps {
  groupMembers: GroupMember[]
  groupId: string | undefined
}

const GroupSettingsButton = ({groupMembers, groupId}: GroupSettingsButtonProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentGroupMembers, setCurrentGroupMembers] = useState<GroupMember[]>(groupMembers);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [removedMemberIds, setRemovedMemberIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCloseModal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsOpen(false);
    setCurrentGroupMembers(groupMembers);
    setHasChanges(false);
    setRemovedMemberIds([]);
  };

  const handleRemoveUser = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (removedMemberIds.length === 0) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      console.log()
      const { data, error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .in('user_id', removedMemberIds)
        .select();

      if (error) {
        console.error('Error removing members:', error);
        alert('Failed to remove members. Please try again.');
        return;
      }
      
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const handleRemoveGroupMember = (memberId: string) => {
    setCurrentGroupMembers(prev => prev.filter(member => member.user?.id !== memberId));
    setRemovedMemberIds(prev => [...prev, memberId]);
    setHasChanges(true);
  };

  const handleOpenModal = () => {
    setIsOpen(true);
    setCurrentGroupMembers(groupMembers);
    setHasChanges(false);
    setRemovedMemberIds([]);
  };

  return (
    <>
      <button onClick={handleOpenModal} className='p-2 transform transition-all hover:bg-purple-300 duration-300 rounded-full'>
        <Settings height={20} width={20} />
      </button>

      {isOpen && (<ModalScreen height='80vh' width='100vh' isOpen={isOpen}>
        <div className='flex flex-col h-full text-black' onClick={(e) => e.stopPropagation()}>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shadow-md'>
              <AlertTriangle className='w-6 h-6 text-red-600' />
            </div>
            <h1 className='text-2xl font-bold text-gray-800'>Edit Group Members</h1>
          </div>

          <div className='flex-1 overflow-hidden'>
            <h2 className='text-xl font-semibold mb-3'>
              Selected Members ({currentGroupMembers.length})
              {removedMemberIds.length > 0 && (
                <span className='text-sm text-red-600 font-normal ml-2'>
                  ({removedMemberIds.length} to be removed)
                </span>
              )}
            </h2>
            <div className='border border-gray-200 rounded-lg p-4 bg-white h-full overflow-y-auto'>
              <div className='space-y-2'>
                {currentGroupMembers.map((member) => (
                  <div 
                    key={member.user_id}
                    className='flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors duration-200'
                  >
                    <div className='flex items-center gap-3'>
                      { member.user?.profile_picture_url
                      ? 
                      <img 
                        src={member.user.profile_picture_url} 
                        alt={member.user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      : <div className='w-8 h-8 rounded-full bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 flex items-center justify-center'>
                          <span className='text-white font-semibold text-sm'>{member.user?.name ? getInitial(member.user.name) : getInitial('?')}</span>
                        </div>
                      }
                      
                      <div>
                        <p className='font-medium text-gray-800'>{member.user?.name}</p>
                        <p className='text-sm text-gray-500'>@{member.user?.username}</p>
                      </div>
                    </div>
                    
                    {!member.is_owner ? (
                      <button
                        onClick={() => handleRemoveGroupMember(member.user_id)}
                        className='w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors duration-200 group'
                        title='Remove member'
                        disabled={isLoading}
                      >
                        <X className='w-4 h-4 text-red-600 group-hover:text-red-700' />
                      </button>
                    ) : (
                      <div className='flex items-center gap-1'>
                        <Crown className='w-4 h-4 text-purple-400' />
                        <span className='text-xs text-purple-600'>Owner</span>
                      </div>
                    )}
                  </div>
                ))}
                
                {currentGroupMembers.length === 0 && (
                  <div className='text-center py-8 text-gray-500'>
                    <p>No members remaining</p>
                    <p className='text-sm'>At least one owner must remain in the group</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='flex-shrink-0 flex justify-end gap-3 pt-4 pb-2 border-t border-gray-200 bg-white'>
            <button
              onClick={handleCloseModal}
              className='min-w-[128px] py-2 px-8 rounded-full font-semibold text-purple-500 bg-white hover:bg-purple-50 shadow-md border border-purple-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300'
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              onClick={handleRemoveUser}
              disabled={!hasChanges || isLoading}
              className={`min-w-[128px] py-2 px-8 rounded-full font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300 flex items-center justify-center ${
                hasChanges && !isLoading
                  ? 'text-white bg-red-500 hover:bg-red-600 shadow-md border border-red-500' 
                  : 'text-gray-400 bg-gray-100 border border-gray-300 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin mr-2' />
                  Saving...
                </>
              ) : (
                `Remove ${removedMemberIds.length > 0 ? `(${removedMemberIds.length})` : ''}`
              )}
            </button>
          </div>
        </div>
      </ModalScreen>)}
    </>
  )
}

export default GroupSettingsButton