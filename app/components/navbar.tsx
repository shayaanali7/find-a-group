'use client'
import React, { useState } from 'react'
import { Home, MessageCircle, X, Menu, Users, BookOpen } from "lucide-react";
import Link from 'next/link';
import DropDownList from './DropDownList';
import AddGroupModal from './AddGroupModal';
import getUserClient from '../utils/supabaseComponets/getUserClient';
import { getProfileInformationClient } from '../utils/supabaseComponets/clientUtils';
import Image from 'next/image';
import { useLoading } from './LoadingContext';
import { BasicInformation } from '../interfaces/interfaces';
import { useQuery } from '@tanstack/react-query';

interface NavigationBarProps {
  courses?: string[];
}

const fetchUserProfile = async (): Promise<BasicInformation | null> => {
  const user = await getUserClient();
  if (!user?.id) return null;
  
  const profile = await getProfileInformationClient(user.id);
  if (!profile) return null;
  
  return {
    id: user.id,
    username: profile.username || '',
    name: profile.name || '',
    profile_picture_url: profile.profile_picture_url || '',
  };
}

const NavigationBar: React.FC<NavigationBarProps> = ({ courses }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { startLoading, stopLoading } = useLoading();

  const {
    data: userProfile,
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  });

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const handleClick = () => setIsMobileMenuOpen(false);

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const handleNavigationClick = (callback?: () => void) => {
    startLoading();
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
              onClick={() => handleNavigationClick(onItemClick)}
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
              onClick={() => handleNavigationClick(onItemClick)}
              className='group flex items-center w-full gap-3 p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-indigo-100 hover:text-purple-700 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'>
                <div className='w-10 h-10 flex items-center justify-center rounded-lg bg-white group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-sm'>
                  <MessageCircle className='w-5 h-5' />
                </div>
                <span className='font-medium'>Messages</span>
                <div className='ml-auto w-2 h-2 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
            </button>
          </Link>

          <Link href='/groupsPage'>
            <button 
              onClick={() => handleNavigationClick(onItemClick)}
              className='group flex items-center w-full gap-3 p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-indigo-100 hover:text-purple-700 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'>
                <div className='w-10 h-10 flex items-center justify-center rounded-lg bg-white group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-sm'>
                  <Users className='w-5 h-5' />
                </div>
                <span className='font-medium'>My Groups</span>
                <div className='ml-auto w-2 h-2 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
            </button>
          </Link>
        </div>

        <div>
          <AddGroupModal />
        </div>

      

        {courses && (
          <div className='pt-4'>
            <div className='flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 uppercase tracking-wide'>
              <BookOpen className='w-4 h-4' />
              <span className='font-medium '>My Courses</span>
              <div className='flex-grow h-px bg-gradient-to-r from-purple-200 to-transparent'></div>
            </div>
            
            <div className='bg-white/50 rounded-xl p-3 border border-purple-100/50 backdrop-blur-sm text-gray-700 font-medium'>
              <DropDownList name='My Courses' elements={courses} />
            </div>
          </div>
        )}
      </nav>

      <div className='p-4 border-t border-purple-100 bg-gradient-to-r from-purple-50/50 to-indigo-50/50'>
        <Link href={`/user/${userProfile?.username}`}> 
          <button 
            onClick={() => handleNavigationClick(onItemClick)}
            className='group flex items-center w-full gap-3 p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-indigo-100 hover:text-purple-700 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] bg-white/70 border border-purple-100/50'>
            <div className='relative'>
              {userProfile?.profile_picture_url ? (
                <Image 
                  src={userProfile.profile_picture_url} 
                  alt='Profile Picture' 
                  width={40} 
                  height={40} 
                  className='w-10 h-10 rounded-full ring-2 ring-purple-200 group-hover:ring-purple-400 transition-all duration-300' 
                />
              ) : (
                <div className='w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 text-white shadow-lg'>
                  <div className='w-8 h-8 rounded-full bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 flex items-center justify-center'>
                    <span className='text-white font-semibold text-sm'>{userProfile?.name ? getInitial(userProfile.name) : getInitial('?')}</span>
                  </div>
                </div>
              )}
              <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white'></div>
            </div>
            <div className='flex-grow text-left'>
              <div className='font-medium text-sm'>{userProfile?.username || 'Profile'}</div>
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
        className='md:hidden fixed top-2 left-3 z-50 p-2.5 bg-white/90 backdrop-blur-sm hover:bg-purple-100 rounded-lg shadow-lg border border-purple-100 transition-all duration-300 hover:scale-105 active:scale-95'
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
          <Image 
            src="/assets/groupup-logo-cut.PNG" 
            alt='logo' 
            height={36} 
            width={180} 
            className='w-full h-full object-contain rounded-2xl mr-2' 
          />
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