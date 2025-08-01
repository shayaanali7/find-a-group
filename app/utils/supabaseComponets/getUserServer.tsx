import { User } from '@/app/interfaces/interfaces';
import { createClient } from '../supabase/server'

const getUserServer = async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) console.log(error);
  const id = user?.id

  return { id };
}
export default getUserServer

export async function getUsername(user: User) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profile')
    .select('username')
    .eq('id', user.id)
    .single();
  if (error) console.log(error);
  return { data }
}

export async function getName(user: User) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profile')
    .select('name')
    .eq('id', user.id)
    .single();
  if (error) console.log(error);
  return { data }
}