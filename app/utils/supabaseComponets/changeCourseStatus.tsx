import { createClient } from "../supabase/client";

const supabase = await createClient();

const getCourseList = async ({ id }: { id: string }) => {
    const { data: currentData, error: currentError } = await supabase
        .from('user_courses')
        .select('courses')
        .eq('id', id)
        .single()
    if (currentError) { 
        console.log(currentError);
        return;
    }
    return currentData.courses;
}

const updateArray =  async ({ updatedArray, id }: {updatedArray: Array<string>, id: string }) => {
    const { data, error } = await supabase
        .from('user_courses')
        .update({ courses: updatedArray })
        .eq('id', id)
        .select()
    if (error) console.log(error)
    else console.log(data)
}

export const addCourse = async ({ courseName, id }: { courseName: string, id: string }) => {
    console.log('added');
    const data = await getCourseList({ id });
    if (!data) console.log('No data was Found');
    const updatedArray = [...data, courseName];
    updateArray({ updatedArray, id });
    return updateArray;
    
}

export const removeCourse = async ({ courseName, id }: { courseName: string, id: string }) => {
    console.log('removed');    
    const data = await getCourseList({ id })
    if (!data) console.log('No data was Found');
    const updatedArray = [...data].filter((course: string) => course !== courseName);
    updateArray({ updatedArray, id });
    return updateArray;
}

