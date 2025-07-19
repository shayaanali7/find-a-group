import { User } from '@/app/interfaces/interfaces';
import { createClient } from '../supabase/server'
import { PostgrestError } from '@supabase/supabase-js';

export const firstTimeLogin = async (user: User) => {
  const supabase = await createClient();
  const { data, error} = await supabase
    .from('profile')
    .select('done_signup')
    .eq('id', user.id)
    .single()
  if (error) throw new PostgrestError(error);
  else return data;
}