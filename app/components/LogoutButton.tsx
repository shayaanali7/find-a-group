'use client'
import { LogOut } from 'lucide-react'
import React from 'react'
import { createClient } from '../utils/supabase/client'
import { useRouter } from 'next/navigation'

const LogoutButton = () => {
  const router = useRouter();
  
  const handleClick = async () => {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) console.log(error);
    else {
      router.push('/');
      router.refresh();
    }
  }

  return (
      <button className='flex items-center w-full gap-2 m-1 hover:bg-purple-200 p-2 rounded-lg text-xl' onClick={handleClick}>
        <LogOut className='text-4xl' />
        <span>Logout</span>
      </button>
  )
}

export default LogoutButton