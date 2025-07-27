import React from 'react'
import SearchBar from '../components/searchbar';
import getUserServer, { getUsername } from '../utils/supabaseComponets/getUserServer';
import { getUserCourses } from '../utils/supabaseComponets/getUserCourses';
import { GetProfilePicture } from '../utils/supabaseComponets/getProfilePicture';
import ProfileButton from '../components/ProfileButton';
import NavigationBar from '../components/navbar';

const UpdateUserInformation = async () => {
  const user = await getUserServer();
  const courses = user.id ? await getUserCourses(user.id) : [];
  const imageURL = await GetProfilePicture();
  const username = await getUsername(user);

  return (
    <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
        <div className='w-full flex justify-center border-b border-purple-500 pb-2 flex-shrink-0'>
          <div className='md:w-12 w-16'></div>
          
          <div className='flex-1 flex justify-center'>
            <SearchBar placeholder='Search for a post'/>
          </div>

          <div className='md:w-12 w-16 flex justify-end'>
            <ProfileButton imageURL={imageURL} username={username.data?.username}/>
          </div>
        </div>

        <div className='w-full flex flex-1 overflow-hidden'>  
          <NavigationBar courses={courses} />
        </div>    
    </main>
  )
}

export default UpdateUserInformation