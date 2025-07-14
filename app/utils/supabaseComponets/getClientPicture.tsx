import React from "react"
import { createClient } from "../supabase/client"
import getUserClient from "./getUserClient";

export const getClientPicture = async (): Promise<string | null> => {
    try {
        const supabase = await createClient();
        const user = await getUserClient();
        
        if (!user) {
            console.log("Error retrieving User");
            return null;
        }

        const { data: profile, error: profileError } = await supabase
            .from('profile')
            .select('profile_picture_url')
            .eq('id', user.id)
            .single()
        
        if (profileError) {
            console.log('Error Getting Profile Data:', profileError);
            return null;
        }

        if (!profile?.profile_picture_url) return null;
       
        if (profile.profile_picture_url.startsWith('https://')) {
            return profile.profile_picture_url;
        }
        const { data: urlData } = supabase.storage
            .from('profile-pictures')
            .getPublicUrl(profile.profile_picture_url)

        return urlData.publicUrl;

    } catch (error) {
        console.error('Unexpected error in GetProfilePicture:', error);
        return null;
    }
}