import React from 'react'
import HomePage from '../components/HomePage'
import { createClient } from '../utils/supabase/server'
import { redirect } from 'next/navigation';

const mainPage = async () => {
  const supabase = await createClient();
  const { data: userData, error: userError} = await supabase.auth.getUser();
  if (userError || !userData) {
    console.log(userError);
    redirect('/loginPage');
  }

  const { data: coursesData, error: coursesError } = await supabase
    .from('user_courses')
    .select('courses')
    .eq('id', userData.user.id)
    .single()
  if (coursesError) {
    console.log(coursesError);
    redirect('/loginPage');
  }
  else {
    return <HomePage pageTitle='Feed' />
  }
}

export default mainPage