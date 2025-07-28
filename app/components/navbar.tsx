'use client'
import React, { useEffect, useState } from 'react'
import { Home, MessageCircle, CircleUserRound, X, Menu } from "lucide-react";
import Link from 'next/link';
import DropDownList from './DropDownList';
import AddGroupModal from './AddGroupModal';
import getUserClient from '../utils/supabaseComponets/getUserClient';
import { getProfileInformationClient } from '../utils/supabaseComponets/clientUtils';
import Image from 'next/image';
import { createClient } from '../utils/supabase/client';

interface NavigationBarProps {
  courses?: string[];
}

const NavigationBar: React.FC<NavigationBarProps> = ({ courses }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [user, setUser] = useState<string | undefined>('');
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = await getUserClient();
      if (user?.id) {
        setUser(user.id);
        const profile = await getProfileInformationClient(user.id);
        if (profile) {
          setProfilePicture(profile.profile_picture_url || null);
          setUsername(profile.username || null);
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
          supabase.from('groups').select('name').eq('owner', user),
          supabase.from('group_members').select('group_id').eq('user_id', user)
        ]);

        const ownedGroups = ownedRes.data || [];
        const memberGroupIds = memberRes.data?.map(m => m.group_id) || [];

        let memberGroups: { name: string }[] = [];
        if (memberGroupIds.length > 0) {
          const memberGroupsRes = await supabase.from('groups').select('name').in('id', memberGroupIds);
          memberGroups = memberGroupsRes.data || [];
        }

        const groupNamesSet = new Set<string>();
        ownedGroups.forEach(g => groupNamesSet.add(g.name));
        memberGroups.forEach(g => groupNamesSet.add(g.name));

        setUserGroups(Array.from(groupNamesSet));
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

  const NavigationContent: React.FC<{ onItemClick?: () => void }> = ({ onItemClick }) => (
    <nav className='flex flex-col h-full justify-between'>
      <div>
        <Link href='/mainPage'>
          <button 
            onClick={onItemClick}
            className='flex items-center w-9/10 gap-2 m-1 ml-2 hover:bg-purple-200 p-2 rounded-full text-xl'>
              <Home className='text-3xl' />
              <span>Home</span>
          </button>
        </Link>

        <Link href='/messages'>
          <button 
            onClick={onItemClick}
            className='flex items-center w-9/10 gap-2 m-1 ml-2 hover:bg-purple-200 p-2 rounded-full text-xl'>
              <MessageCircle className='text-3xl' />
              <span>Messages</span>
          </button>
        </Link>

        <AddGroupModal />

        <div className='mt-5 border-t-1 border-purple-500 mr-3 ml-3'>
          {groupsLoading ? (
            <div className='text-gray-500 p-2 text-sm'>Loading groups...</div>
          ) : (
            <DropDownList name='My Groups' elements={userGroups} />
          )}
        </div>

        <div className='mt-5 border-t-1 border-purple-500 mr-3 ml-3'>
          {courses && (
            <DropDownList name='My Courses' elements={courses} />
          )}   
        </div>
      </div>

      <div className='mb-2'>
        <Link href={`/user/${username}`}> 
          <button className='flex items-center w-9/10 gap-2 m-1 ml-2 hover:bg-purple-200 p-2 rounded-full text-xl'>
            {profilePicture ? (
              <Image src={profilePicture} alt='Profile Picture' width={40} height={40} className='rounded-full' />
            ) : (
              <CircleUserRound className='text-3xl' />
            )}
            <span>Profile</span>
          </button>
        </Link>
      </div>
    </nav>
  )

  return (
    <>
      <button
        onClick={toggleMenu}
        className='md:hidden fixed top-2.5 left-0.5 z-50 p-1.5 hover:bg-purple-200 rounded-full'
      >
        <Menu className='w-6 h-6' />
      </button>

      <div className='hidden md:flex md:w-3/20 h-full flex-col bg-white border-r border-purple-500'>
        <NavigationContent />
      </div>

      <div 
        className={`md:hidden fixed left-0 top-0 h-full w-64 bg-white border-r border-purple-500 z-50 
          transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className='p-4 border-b border-purple-500 flex justify-between items-center'>
          <h2 className='text-lg font-semibold'>Menu</h2>
          <button 
            onClick={toggleMenu}
            className='p-2 hover:bg-purple-200 rounded-full'
          >
            <X className='w-6 h-6' />
          </button>
        </div>
        <NavigationContent onItemClick={handleClick} />
      </div>   
    </>
  )
}

export default NavigationBar;
