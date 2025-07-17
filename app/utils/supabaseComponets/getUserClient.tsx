import React from "react";
import { createClient } from "../supabase/client";

const getUserClient = async () => {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) console.log(error);
  const id = user?.id

  return { id };
}

export default getUserClient

export async function getUsername(user: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profile')
    .select('username')
    .eq('id', user.id)
    .single();
  if (error) console.log(error);
  return { data }
}

export async function getName(user: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profile')
    .select('name')
    .eq('id', user.id)
    .single();
  if (error) console.log(error);
  return { data }
}