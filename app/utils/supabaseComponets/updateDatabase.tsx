import { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "../supabase/client"
import { User } from "@/app/interfaces/interfaces";

export const updateDatabase = async (table: string, update: object, user: User) => {
    const supabase = createClient();
    const { error } = await supabase
      .from(table)
      .update(update)
      .eq('id', user.id)
    
      if (error) {
        throw new PostgrestError(error);
      }
} 