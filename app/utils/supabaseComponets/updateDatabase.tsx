import { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "../supabase/client"

export const updateDatabase = async (table: string, update: object, user: any) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(table)
      .update(update)
      .eq('id', user.id)
    
      if (error) {
        throw new PostgrestError(error);
      }
} 