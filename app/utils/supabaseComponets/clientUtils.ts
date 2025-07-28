'use client'
import { User, UserProfile } from "@/app/interfaces/interfaces";
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

export const fetchUserPosts = async (userId: string) => {
  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching user posts:', error);
    return [];
  }
  return posts || [];
}

export async function getUserCoursesClient(userId: string) {
  const supabase = await createClient()
  
  const { data: profile, error } = await supabase
    .from('user_courses')
    .select('courses')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error getting courses:', error)
    return []
  }
  
  return profile?.courses || []
}

export async function getUsernameClient(user: User) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profile')
    .select('username')
    .eq('id', user.id)
    .single();
  if (error) console.log(error);
  return { data }
}