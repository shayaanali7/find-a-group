import React from 'react'
import { createClient } from '../supabase/server'

const getUser = async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) console.log(error);
  const id = user?.id

  return { id };
}

export default getUser