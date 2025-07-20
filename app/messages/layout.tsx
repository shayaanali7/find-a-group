import React from 'react'
import SearchBar from '../components/searchbar'
import Link from 'next/link'
import { Home } from "lucide-react"
import ProfileButton from '../components/ProfileButton'
import ConversationsList from '../components/ConversationsList'
import { createClient } from '../utils/supabase/server'
import { redirect } from 'next/navigation'

interface MessagesLayoutProps {
  children: React.ReactNode
}

const MessagesLayout = async ({ children }: MessagesLayoutProps) => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profile')
    .select('username, name, profile_picture_url')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  return (
    <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
      <div className='w-full flex justify-center border-b border-purple-500 pb-2 flex-shrink-0'>
        <div className='md:w-12 w-16'></div>
        
        <div className='flex-1 flex justify-center'>
          <SearchBar placeholder='Search for a post'/>
        </div>

        <div className='md:w-12 w-16 flex justify-end'>
          <ProfileButton 
            imageURL={profile.profile_picture_url || ''} 
            username={profile.username}
          />
        </div>
      </div>

      <div className='w-full flex flex-1 overflow-hidden'> 
        <div className='hidden md:block w-1/5 h-full bg-white'>
          <div className='border-b-1 border-purple-500 ml-2 mr-2 '>
            <Link href='/mainPage'>
              <button className='flex items-center w-9/10 gap-2 m-1 ml-2 hover:bg-purple-200 p-2 rounded-full text-xl'>
                <Home className='text-3xl' />
                <span>Home</span>
              </button>
            </Link>
          </div>
          <div className='flex-1 overflow-y-auto'>
            <ConversationsList userId={user.id} />
          </div>
        </div>

        <div className='w-4/5 flex flex-col h-full overflow-y-auto bg-white border-l-1 border-purple-500'>
          {children}
        </div>
      </div>
    </main>
  )
}

export default MessagesLayout