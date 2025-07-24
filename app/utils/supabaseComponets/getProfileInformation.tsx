import { UserProfile } from "@/app/interfaces/interfaces";
import { createClient } from "../supabase/server"
import { createClient as createClientClient } from "../supabase/client"

export const getProfileInformation = async (id: string): Promise<UserProfile | null> => {
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from('profile')
      .select('*')
      .eq('id', id)
      .single()
    if (error) {
      console.log(error.message);
      return null
    }
    return profile as UserProfile;
}


