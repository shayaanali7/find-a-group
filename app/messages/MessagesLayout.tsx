'use client'
import React, { useState, useCallback, useMemo } from 'react'
import ConversationsList from '@/app/components/ConversationsList'
import SearchBar from '@/app/components/searchbar'
import ProfileButton from '@/app/components/ProfileButton'
import getUserClient, { getName, getUsername } from '@/app/utils/supabaseComponets/getUserClient'
import { getClientPicture } from '@/app/utils/supabaseComponets/getClientPicture'
import { useQuery } from '@tanstack/react-query'
import { Home, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useLoading } from '../components/LoadingContext'

interface CurrentUserData {
  id: string
  username: string
  name: string
  profile_picture_url: string | null
  imageURL: string | null
}

const fetchCurrentUser = async (): Promise<CurrentUserData> => {
  const user = await getUserClient()
  const imageUrl = await getClientPicture()
  const username = await getUsername(user)
  const name = await getName(user)
  
  if (!user.id) {
    throw new Error('Error getting user id')
  }

  return {
    id: user.id,
    username: username.data?.username || '',
    name: name.data?.name || '',
    profile_picture_url: imageUrl,
    imageURL: imageUrl
  }
}

interface MessagesLayoutProps {
  children: React.ReactNode
}

const MessagesLayout = ({ children }: MessagesLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const { startLoading, stopLoading } = useLoading();

  const {
    data: currentUser,
    isLoading: currentUserLoading,
    error: currentUserError
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })

  const toggleSidebar = (): void => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleSidebarItemClick = (): void => {
    setIsSidebarOpen(false)
  }

  const memoizedConversationsList = useMemo(() => {
    if (!currentUser?.id) return null
    return <ConversationsList userId={currentUser.id} />
  }, [currentUser?.id])

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
        {memoizedConversationsList}
      </div>
    </div>
  ), [memoizedConversationsList])

  if (currentUserLoading) {
    return (
      <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
        <div className='w-full flex justify-center border-b border-purple-500 pb-2 flex-shrink-0'>
          <div className='md:w-12 w-16'></div>
          
          <div className='flex-1 flex justify-center'>
            <SearchBar placeholder='Search for a post'/>
          </div>

          <div className='md:w-12 w-16 flex justify-end'>
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

  if (currentUserError) {
    return (
      <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
        <div className='text-center'>
          <p className='text-red-600'>Error loading user data: {currentUserError.message}</p>
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
          {currentUser && (
            <ProfileButton 
              imageURL={currentUser.imageURL} 
              username={currentUser.username} 
              name={currentUser.name}
            />
          )}
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

        <div className='w-full flex flex-col h-full overflow-hidden border-l-1 md:border-l-1 border-purple-500'>
          {children}
        </div>
      </div>
    </main>
  )
}

export default MessagesLayout