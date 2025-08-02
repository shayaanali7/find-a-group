'use client'
import React, { useState, useCallback } from 'react'
import { Home, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import SearchBar from '@/app/components/searchbar'
import ProfileButton from '@/app/components/ProfileButton'
import GroupChatsList from './GroupChatsList'
import getUserClient, { getName, getUsername } from '@/app/utils/supabaseComponets/getUserClient'
import { getClientPicture } from '@/app/utils/supabaseComponets/getClientPicture'
import { useLoading } from '../components/LoadingContext'

interface UserProfile {
  id: string
  username: string
  name: string
  profile_picture_url?: string | null
}

const fetchUserProfile = async (): Promise<UserProfile | null> => {
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
    gcTime: 30 * 60 * 1000,
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

	const handleNavigationClick = (callback?: () => void, section?: string) => {
    startLoading();
    if (callback) callback();
    
    setTimeout(() => {
      stopLoading();
    }, 1500);
  };

  const SidebarContent: React.FC<{ onItemClick?: () => void }> = useCallback(({ onItemClick }) => (
    <div className='h-full bg-white flex flex-col'>
      <div className='border-b-1 border-purple-500 ml-2 mr-2'>
        <Link href='/mainPage'>
					<div className='mb-1 mt-1'>
						<button 
							onClick={() => handleNavigationClick(onItemClick, 'home')}
							className='group flex items-center w-full gap-3 p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-indigo-100 hover:text-purple-700 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'>
								<div className='w-10 h-10 flex items-center justify-center rounded-lg bg-white group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-sm'>
									<Home className='w-5 h-5' />
								</div>
								<span className='font-medium'>Home</span>
								<div className='ml-auto w-2 h-2 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
						</button>
					</div>
				</Link>
      </div>
      <div className='flex-1 overflow-y-auto'>
        {currentUser?.id && <GroupChatsList userId={currentUser.id} />}
      </div>
    </div>
  ), [currentUser?.id])

  if (userLoading) {
    return (
      <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
        <div className='w-full flex justify-center border-b border-purple-500 pb-2 flex-shrink-0'>
          <div className='md:w-12 w-16'></div>
          
          <div className='flex-1 flex justify-center'>
            <SearchBar placeholder='Search for a post'/>
          </div>

          <div className='md:w-12 w-16 flex justify-end'>
            <div className='w-10 h-10 bg-gray-200 rounded-full animate-pulse'></div>
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
      <div className='w-full flex justify-center border-b border-purple-500 pb-2 flex-shrink-0'>
        <div className='md:w-12 w-16 flex justify-start'>
          <button
            onClick={toggleSidebar}
            className='md:hidden p-1.5 hover:bg-purple-200 rounded-full'
          >
            <Menu className='w-6 h-6' />
          </button>
        </div>
        
        <div className='flex-1 flex justify-center'>
          <SearchBar placeholder='Search for a post'/>
        </div>

        <div className='md:w-12 w-16 flex justify-end'>
          {currentUser && <ProfileButton 
            imageURL={currentUser.profile_picture_url ?? null} 
            username={currentUser.username} 
            name={currentUser.name}
          />}
        </div>
      </div>

      <div className='w-full flex flex-1 overflow-hidden'>
        <div className='hidden md:flex md:w-1/5 h-full'>
          <SidebarContent />
        </div>

        <div className={`md:hidden fixed left-0 top-0 h-full w-64 bg-white border-r border-purple-500 z-50 
          transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className='p-4 border-b border-purple-500 flex justify-between items-center'>
            <h2 className='text-lg font-semibold'>Menu</h2>
            <button 
              onClick={toggleSidebar}
              className='p-2 hover:bg-purple-200 rounded-full'
            >
              <X className='w-6 h-6' />
            </button>
          </div>
          <SidebarContent onItemClick={handleSidebarItemClick} />
        </div>

        {isSidebarOpen && (
					<div 
						className='md:hidden fixed inset-0 backdrop-blur-sm bg-white/10 z-40'
						onClick={toggleSidebar}
					/>
				)}
        <div className='flex-1 flex flex-col h-full overflow-hidden'>
          {children}
        </div>
      </div>
    </main>
  )
}

export default GroupLayout