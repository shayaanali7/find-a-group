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