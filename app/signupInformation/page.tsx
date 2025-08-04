import React from 'react'
import { redirect } from 'next/navigation';
import MultiStageSignup from './MultiStageSignup';
import getUserServer from '../utils/supabaseComponets/getUserServer';
import { createClient } from '../utils/supabase/server';

export default async function SignupInformation() {
  const user = await getUserServer();
  const supabase = await createClient();
  const { data } = await supabase
    .from('profile')
    .select('done_signup')
    .eq('id', user.id)
    .single()
  if (!user) redirect('/loginPage');
  else if (data?.done_signup === true) redirect('/mainPage')

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 flex justify-center items-center p-4'>
      <div className='bg-white/95 w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl border border-white/20 overflow-hidden'>
        <MultiStageSignup user={user} />
      </div>
    </div>
  )
}