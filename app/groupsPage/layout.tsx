'use client'
import React, { useState, useCallback } from 'react'
import { Home, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import SearchBar from '@/app/components/UI/Forms/searchbar'
import ProfileButton from '@/app/components/UI/Buttons/ProfileButton'
import GroupChatsList from './GroupChatsList'
import getUserClient, { getName, getUsername } from '@/app/utils/supabaseComponets/getUserClient'
import { getClientPicture } from '@/app/utils/supabaseComponets/getClientPicture'
import { useLoading } from '../components/UI/Loading/LoadingContext'
import Image from 'next/image'
import { UserProfileLayout } from '../interfaces/interfaces'

const fetchUserProfile = async (): Promise<UserProfileLayout | null> => {
  try {
    const user = await getUserClient()
    if (!user?.id) return null

    const [imageUrl, username, name] = await Promise.all([
      getClientPicture(),
      getUsername(user),
      getName(user)
    ])

    return {
      id: user.id,
      username: username.data?.username || '',
      name: name.data?.name || '',
      profile_picture_url: imageUrl
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

interface GroupLayoutProps {
  children: React.ReactNode
}

const GroupLayout: React.FC<GroupLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)
  const { startLoading, stopLoading } = useLoading();

  const {
    data: currentUser,
    isLoading: userLoading,
    error: userError
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
  })

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleSidebarItemClick = () => {
    setIsSidebarOpen(false)
  }

  const handleNavigationClick = (callback?: () => void) => {
    startLoading();
    if (callback) callback();
    
    setTimeout(() => {
      stopLoading();
    }, 1500);
  };

  const SidebarContent: React.FC<{ onItemClick?: () => void }> = useCallback(({ onItemClick }) => (
    <div className='h-full bg-white flex flex-col w-full'>
      <div className='border-b-1 border-purple-500 ml-2 mr-2 flex-shrink-0'>
        <Link href='/mainPage'>
          <div className='mb-1 mt-1'>
            <button 
              onClick={() => handleNavigationClick(onItemClick)}
              className='group flex items-center w-full gap-3 p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-indigo-100 hover:text-purple-700 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'>
                <div className='w-10 h-10 flex items-center justify-center rounded-lg bg-white group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-sm flex-shrink-0'>
                  <Home className='w-5 h-5' />
                </div>
                <span className='font-medium min-w-0 flex-1'>Home</span>
                <div className='ml-auto w-2 h-2 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0'></div>
            </button>
          </div>
        </Link>
      </div>
      <div className='flex-1 overflow-y-auto min-w-0'>
        {currentUser?.id && <GroupChatsList userId={currentUser.id} />}
      </div>
    </div>
  ), [currentUser?.id])

  if (userLoading) {
    return (
      <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
        <div className='w-full flex items-center border-b border-purple-500 pb-2 flex-shrink-0 px-4'>
        <div className='flex-shrink-0 w-10 lg:w-[180px]'>
          <div className='md:w-12 w-16 flex justify-start'>
            <button
              onClick={toggleSidebar}
              className='md:hidden fixed top-2 left-3 z-50 p-2.5 bg-white/90 backdrop-blur-sm hover:bg-purple-100 rounded-lg shadow-lg border border-purple-100 transition-all duration-300 hover:scale-105 active:scale-95'
            >
              <Menu className='w-4 h-4 text-gray-700' />
            </button>
          </div>
          <div className='hidden lg:flex items-center h-[36px]'>
            <Link href='/mainPage'>
              <Image 
                src="/assets/groupup-logo-cut.PNG" 
                alt='logo' 
                height={36} 
                width={180} 
                className='w-full h-full object-contain' 
              />
            </Link>
          </div>
        </div>
        
        <div className='flex-1 max-w-2xl mx-4 lg:mx-auto'>
          <SearchBar placeholder='Search for posts, users and courses'/>
        </div>

        <div className='flex-shrink-0 w-10 lg:w-auto'>
          {currentUser && (
            <ProfileButton 
              imageURL={null} 
              username={''} 
              name={''}
            />
          )}
        </div>
      </div>

        <div className='w-full flex flex-1 overflow-hidden items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading...</p>
          </div>
        </div>
      </main>
    )
  }

  if (userError || !currentUser) {
    return (
      <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
        <div className='w-full flex flex-1 overflow-hidden items-center justify-center'>
          <div className='text-center'>
            <div className='text-red-500 text-xl mb-4'>Error</div>
            <p className='text-gray-600'>Failed to load user information.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
      <div className='w-full flex items-center border-b border-purple-500 pb-2 flex-shrink-0 px-4'>
        <div className='flex-shrink-0 w-10 lg:w-[180px]'>
          <div className='md:w-12 w-16 flex justify-start'>
            <button
              onClick={toggleSidebar}
              className='md:hidden fixed top-2 left-3 z-50 p-2.5 bg-white/90 backdrop-blur-sm hover:bg-purple-100 rounded-lg shadow-lg border border-purple-100 transition-all duration-300 hover:scale-105 active:scale-95'
            >
              <Menu className='w-4 h-4 text-gray-700' />
            </button>
          </div>
          <div className='hidden lg:flex items-center h-[36px]'>
            <Link href='/mainPage'>
              <Image 
                src="/assets/groupup-logo-cut.PNG" 
                alt='logo' 
                height={36} 
                width={180} 
                className='w-full h-full object-contain' 
              />
            </Link>
          </div>
        </div>
        
        <div className='flex-1 max-w-2xl mx-4 lg:mx-auto'>
          <SearchBar placeholder=' Search for posts, users and courses'/>
        </div>

        <div className='flex-shrink-0 w-10 lg:w-auto'>
          {currentUser && (
            <ProfileButton 
              imageURL={currentUser.profile_picture_url ?? null} 
              username={currentUser.username} 
              name={currentUser.name}
            />
          )}
        </div>
      </div>

      <div className='w-full flex flex-1 overflow-hidden'>
        <div className='hidden md:flex md:w-80 h-full mr-1 flex-shrink-0 min-w-0'>
          <SidebarContent />
        </div>

        <div className={`md:hidden fixed left-0 top-0 h-full w-80 bg-white border-r border-purple-500 z-50 
          transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className='p-4 border-b border-purple-500 flex justify-between items-center flex-shrink-0'>
            <h2 className='text-lg font-semibold'>Menu</h2>
            <button 
              onClick={toggleSidebar}
              className='p-2 hover:bg-purple-200 rounded-full'
            >
              <X className='w-6 h-6' />
            </button>
          </div>
          <div className='flex-1 overflow-hidden'>
            <SidebarContent onItemClick={handleSidebarItemClick} />
          </div>
        </div>

        {isSidebarOpen && (
          <div 
            className='md:hidden fixed inset-0 backdrop-blur-md bg-opacity-50 z-40'
            onClick={toggleSidebar}
          />
        )}

        <div className='flex-1 flex flex-col h-full overflow-hidden min-w-0'>
          {children}
        </div>
      </div>
    </main>
  )
}

export default GroupLayout