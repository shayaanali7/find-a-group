'use client'
import React, { useEffect, useState } from 'react'
import { Home, MessageCircle, X, Menu, Users, BookOpen } from "lucide-react";
import Link from 'next/link';
import DropDownList from './DropDownList';
import AddGroupModal from './AddGroupModal';
import getUserClient from '../utils/supabaseComponets/getUserClient';
import { getProfileInformationClient } from '../utils/supabaseComponets/clientUtils';
import Image from 'next/image';
import { createClient } from '../utils/supabase/client';
import { useLoading } from './LoadingContext';

interface NavigationBarProps {
  courses?: string[];
}

const NavigationBar: React.FC<NavigationBarProps> = ({ courses }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [user, setUser] = useState<string | undefined>('');
  const [name, setName] = useState<string | null>('')
  const [userGroups, setUserGroups] = useState<{ id: string, name: string }[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('');
  
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = await getUserClient();
      if (user?.id) {
        setUser(user.id);
        const profile = await getProfileInformationClient(user.id);
        if (profile) {
          setProfilePicture(profile.profile_picture_url || null);
          setUsername(profile.username || null);
          setName(profile.name || null);
        }
      }
    }
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchUserGroups = async () => {
      if (!user) return;
      setGroupsLoading(true);
      const supabase = createClient();
      try {
        const [ownedRes, memberRes] = await Promise.all([
          supabase.from('groups').select('id, name').eq('owner', user),
          supabase.from('group_members').select('group_id').eq('user_id', user)
        ]);

        const ownedGroups = ownedRes.data || [];
        const memberGroupIds = memberRes.data?.map(m => m.group_id) || [];

        let memberGroups: { id: string, name: string }[] = [];
        if (memberGroupIds.length > 0) {
          const memberGroupsRes = await supabase.from('groups').select('id, name').in('id', memberGroupIds);
          memberGroups = memberGroupsRes.data || [];
        }

        const groupMap = new Map<string, { id: string, name: string }>();
        ownedGroups.forEach(g => groupMap.set(g.id, g));
        memberGroups.forEach(g => groupMap.set(g.id, g));

        setUserGroups(Array.from(groupMap.values()));
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setGroupsLoading(false);
      }
    }
    fetchUserGroups();
  }, [user]);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const handleClick = () => setIsMobileMenuOpen(false);

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const handleNavigationClick = (callback?: () => void, section?: string) => {
    startLoading();
    if (section) setActiveSection(section);
    if (callback) callback();
    
    setTimeout(() => {
      stopLoading();
    }, 1500);
  };

  const NavigationContent: React.FC<{ onItemClick?: () => void }> = ({ onItemClick }) => (
    <div className='flex flex-col h-full bg-gradient-to-b from-white to-purple-50/30'>
      <nav className='flex-grow p-4 space-y-2 overflow-y-auto'>
        <div className='space-y-1'>
          <Link href='/mainPage'>
            <button 
              onClick={() => handleNavigationClick(onItemClick, 'home')}
              className='group flex items-center w-full gap-3 p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-indigo-100 hover:text-purple-700 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'>
                <div className='w-10 h-10 flex items-center justify-center rounded-lg bg-white group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-sm'>
                  <Home className='w-5 h-5' />
                </div>
                <span className='font-medium'>Home</span>
                <div className='ml-auto w-2 h-2 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
            </button>
          </Link>

          <Link href='/messages'>
            <button 
              onClick={() => handleNavigationClick(onItemClick, 'messages')}
              className='group flex items-center w-full gap-3 p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-indigo-100 hover:text-purple-700 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'>
                <div className='w-10 h-10 flex items-center justify-center rounded-lg bg-white group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-sm'>
                  <MessageCircle className='w-5 h-5' />
                </div>
                <span className='font-medium'>Messages</span>
                <div className='ml-auto w-2 h-2 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
            </button>
          </Link>
        </div>

        <div>
          <AddGroupModal />
        </div>

        <div className='pt-4'>
          <div className='flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 uppercase tracking-wide'>
            <Users className='w-4 h-4' />
            <span>My Groups</span>
            <div className='flex-grow h-px bg-gradient-to-r from-purple-200 to-transparent'></div>
          </div>
          
          <div className='bg-white/50 rounded-xl p-3 border border-purple-100/50 backdrop-blur-sm'>
            {groupsLoading ? (
              <div className='flex items-center gap-2 text-gray-500 p-3 text-sm'>
                <div className='w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin'></div>
                <span>Loading groups...</span>
              </div>
            ) : (
              <DropDownList name='My Groups' elementsWithIds={userGroups} />
            )}
          </div>
        </div>

        {courses && (
          <div className='pt-4'>
            <div className='flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 uppercase tracking-wide'>
              <BookOpen className='w-4 h-4' />
              <span>My Courses</span>
              <div className='flex-grow h-px bg-gradient-to-r from-purple-200 to-transparent'></div>
            </div>
            
            <div className='bg-white/50 rounded-xl p-3 border border-purple-100/50 backdrop-blur-sm'>
              <DropDownList name='My Courses' elements={courses} />
            </div>
          </div>
        )}
      </nav>

      <div className='p-4 border-t border-purple-100 bg-gradient-to-r from-purple-50/50 to-indigo-50/50'>
        <Link href={`/user/${username}`}> 
          <button 
            onClick={() => handleNavigationClick(onItemClick, 'profile')}
            className='group flex items-center w-full gap-3 p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-indigo-100 hover:text-purple-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] bg-white/70 border border-purple-100/50'>
            <div className='relative'>
              {profilePicture ? (
                <Image 
                  src={profilePicture} 
                  alt='Profile Picture' 
                  width={40} 
                  height={40} 
                  className='w-10 h-10 rounded-full ring-2 ring-purple-200 group-hover:ring-purple-400 transition-all duration-300' 
                />
              ) : (
                <div className='w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 text-white shadow-lg'>
                  <div className='w-8 h-8 rounded-full bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 flex items-center justify-center'>
                    <span className='text-white font-semibold text-sm'>{name ? getInitial(name) : getInitial('?')}</span>
                  </div>
                </div>
              )}
              <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white'></div>
            </div>
            <div className='flex-grow text-left'>
              <div className='font-medium text-sm'>{username || 'Profile'}</div>
              <div className='text-xs text-gray-500'>View profile</div>
            </div>
          </button>
        </Link>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={toggleMenu}
        className='md:hidden fixed top-3 left-3 z-50 p-2.5 bg-white/90 backdrop-blur-sm hover:bg-purple-100 rounded-lg shadow-lg border border-purple-100 transition-all duration-300 hover:scale-105 active:scale-95'
      >
        <Menu className='w-4 h-4 text-gray-700' />
      </button>

      <div className='hidden md:flex md:w-72 h-full flex-col bg-white border-r border-purple-200 shadow-lg'>
        <NavigationContent />
      </div>

      {isMobileMenuOpen && (
        <div 
          className='md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300'
          onClick={toggleMenu}
        />
      )}

      <div 
        className={`md:hidden fixed left-0 top-0 h-full w-72 bg-white z-50 shadow-2xl
          transform transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
  
        <div className='p-4 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50 flex justify-end items-center'>
          <button 
            onClick={toggleMenu}
            className='p-2 hover:bg-purple-100 rounded-lg transition-colors duration-200 text-gray-600 hover:text-purple-700'
          >
            <X className='w-5 h-5' />
          </button>
        </div>
        
        <NavigationContent onItemClick={handleClick} />
      </div>   
    </>
  )
}

export default NavigationBar;