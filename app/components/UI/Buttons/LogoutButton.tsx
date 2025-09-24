'use client'
import { LogOut } from 'lucide-react'
import React from 'react'
import { createClient } from '../../../utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useLoading } from '../Loading/LoadingContext'

const LogoutButton = () => {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();
  
  const handleClick = async () => {
    startLoading();

    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) console.log(error);
    else {
      router.push('/');
      router.refresh();
    }
    setTimeout(() => {
      stopLoading();
    }, 1000)
  }

  return (
      <button className='flex items-center w-full gap-2 m-1 hover:bg-purple-200 p-2 rounded-lg text-xl' onClick={handleClick}>
        <LogOut className='text-4xl' />
        <span>Logout</span>
      </button>
  )
}

export default LogoutButton