'use client'
import { UserProfile } from "@/app/interfaces/interfaces";
import { createClient } from "../supabase/client";

export const getProfileInformationClient = async (id: string): Promise<UserProfile | null> => {
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from('profile')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    console.log('Error fetching profile for:  ' + id);
    return null
  }
  return profile as UserProfile;
}