'use client'
import React, { useEffect, useState } from 'react'
import { CirclePlus, X, Crown } from 'lucide-react';
import ModalScreen from './ModalScreen';
import SearchBar, { SearchResult } from './searchbar';
import getUserClient from '../utils/supabaseComponets/getUserClient';
import { getProfileInformationClient } from '../utils/supabaseComponets/clientUtils';
import { createClient } from '../utils/supabase/client';

const AddGroupModal = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [groupMembers, setGroupMembers] = useState<SearchResult[]>([]);
  const [groupName, setGroupName] = useState<string>('');
  const [userInfo, setUserInfo] = useState<{ id: string } | null>(null);
  const user = getUserClient();

  

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getUserClient();
      if (currentUser.id) setUserInfo({ id: currentUser.id });
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const addUser = async () => {
      const currentUser = await getUserClient();
      if (currentUser.id) {
        const profile = await getProfileInformationClient(currentUser.id);
        const userInfo: SearchResult = {
          id: currentUser.id,
          type: 'user',
          title: profile?.name,
          subtitle: profile?.username,
          profile_picture: profile?.profile_picture_url

        }
        setGroupMembers(prev => 
          prev.find(member => member.id === userInfo.id) ? prev : [...prev, userInfo]
        );
      }
    }
    addUser();
    
  }, [user]);

  const handleAddGroupMember = async (result: SearchResult) => {
    setGroupMembers(prev => 
      prev.find(member => member.id === result.id) ? prev : [...prev, result]
    );
    console.log(groupMembers);
  }

  const handleRemoveGroupMember = (memberId: string) => {
    setGroupMembers(prev => prev.filter(member => member.id !== memberId));
  }

  const handleAddGroup = async () => {
    try { 
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: groupName,

        })
        .select()
      if (error) {
        console.log('Error creating Group: ' + error.message);
        console.log(error);
        throw new Error();
      }
      
      if (data) {
        const membersInserts = groupMembers.map(member => ({
          group_id: data[0].id,
          user_id: member.id,
          is_owner: member.id === userInfo?.id
        }));

        const { error: addMembersError } = await supabase
          .from('group_members')
          .insert(membersInserts)
        if (addMembersError) throw addMembersError;
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsOpen(false);
    }
  }

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className='group flex items-center w-full gap-3 p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-indigo-100 hover:text-purple-700 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'>
        <div className='w-10 h-10 flex items-center justify-center rounded-lg bg-white group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-sm'>
          <CirclePlus className='w-5 h-5' />
        </div>
        <span className='font-medium'>Create Group</span>
        <div className='ml-auto w-2 h-2 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
      </button>
    
      {isOpen && (
        <ModalScreen isOpen={isOpen} handleClose={() => setIsOpen(false)}>
          <div className='flex flex-col h-full text-black'>
            <div className='flex-shrink-0 pt-4 pb-2'>
              <h1 className='font-semibold text-center text-2xl'>Create A Group</h1>
            </div>

            <div className='flex-1 overflow-y-auto px-4 py-2 min-h-0'>
              <div className='space-y-6'>
                <div>
                  <input 
                    type='text' 
                    placeholder='Group Name'
                    onChange={(e) => setGroupName(e.target.value)} 
                    className='border border-gray-300 hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-full px-4 py-3 w-full text-lg transition-all duration-200 outline-none'
                  />
                </div>

                <div>
                  <h2 className='text-xl font-semibold mb-3'>Add Group Members</h2>
                  <div className='border border-gray-200 rounded-lg p-4 bg-gray-50'>
                    <SearchBar 
                      placeholder='Search for members to add...' 
                      groupModal={true} 
                      onClickAction={handleAddGroupMember}
                    />
                  </div>
                </div>

                {groupMembers.length > 0 && (
                  <div>
                    <h2 className='text-xl font-semibold mb-3'>
                      Selected Members ({groupMembers.length})
                    </h2>
                    <div className='border border-gray-200 rounded-lg p-4 bg-white max-h-60 overflow-y-auto'>
                      <div className='space-y-2'>
                        {groupMembers.map((member) => (
                          <div 
                            key={member.id}
                            className='flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors duration-200'
                          >
                            <div className='flex items-center gap-3'>
                              { member.profile_picture 
                              ? 
                              <img 
                                src={member.profile_picture} 
                                alt={member.title}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              : <div className='w-8 h-8 rounded-full bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 flex items-center justify-center'>
                                  <span className='text-white font-semibold text-sm'>{member.title ? getInitial(member.title) : getInitial('?')}</span>
                                </div>
                              }
                              
                              <div>
                                <p className='font-medium text-gray-800'>{member.title}</p>
                                <p className='text-sm text-gray-500'>{member.subtitle}</p>
                              </div>
                            </div>
                            
                            {userInfo?.id !== member.id ? (
                              <button
                                onClick={() => handleRemoveGroupMember(member.id)}
                                className='w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors duration-200 group'
                                title='Remove member'
                              >
                                <X className='w-4 h-4 text-red-600 group-hover:text-red-700' />
                              </button>
                            ): (
                              <Crown className='w-4 h-4 text-purple-400' />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='flex-shrink-0 flex justify-end gap-3 pt-4 pb-4 px-4 border-t border-gray-200'>
              <button
                onClick={handleAddGroup}
                className='py-3 px-8 rounded-full font-semibold text-white bg-purple-500 hover:bg-purple-600 shadow-md transition-all duration-200 border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={groupMembers.length === 1}
              >
                Create Group
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className='py-3 px-8 rounded-full font-semibold text-purple-500 bg-white hover:bg-purple-50 shadow-md border border-purple-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300'
              >
                Cancel
              </button>
            </div>
          </div>
        </ModalScreen>
      )}
    </div>
  )
}

export default AddGroupModal