import { createClient } from "../supabase/server"

export async function getUserCourses(userId: string) {
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