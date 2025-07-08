import React from 'react'
import getUser from '../utils/supabaseComponets/getUser'
import { redirect } from 'next/navigation';
import AddCoursesButtons from '../components/AddCoursesButtons';
import MultiStageSignup from './MultiStageSignup';

const signupInformation = async () => {
  const user = await getUser();
  if (!user) redirect('/loginPage');

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 flex justify-center items-center p-4'>
      <div className='bg-white/95 w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl border border-white/20 overflow-hidden'>
        <MultiStageSignup user={user} />
      </div>
    </div>
  )
}

export default signupInformation