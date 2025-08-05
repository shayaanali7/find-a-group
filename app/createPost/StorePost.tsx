'use server'
import { createClient } from "../utils/supabase/server";
import getUserServer from "../utils/supabaseComponets/getUserServer";

export const StorePost = async (formData: FormData) => {
  try {
    const title = formData.get('title') as string;
    const body = formData.get('body') as string;
    const tags = formData.get('tags') as string;
    const courseName = formData.get('courseName') as string;
    const parsedTags = tags ? JSON.parse(tags) : [];

    const supabase = await createClient();
    const user = await getUserServer();
    const { data, error } = await supabase
      .from('posts')
      .insert({
        course_name: courseName,
        header: title,
        content: body,
        tags: parsedTags,
        user_id: user.id
      })
      .select('*');
    if (error) {
      console.error('Error creating post:', error.message);
      return { success: false, error: `Database error: ${error.message}` };
    }
    if (data && data[0]) {
      console.log(data[0]);
      return { success: true, postId: data[0].post_id };
      
    }
    return { success: false, error: 'No data returned from insert' };
  } catch (error) {
    console.error('Error in createPost:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}