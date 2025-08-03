import React from 'react'
import SearchBar from '../components/searchbar';
import getUserServer, { getName, getUsername } from '../utils/supabaseComponets/getUserServer';
import { getUserCourses } from '../utils/supabaseComponets/getUserCourses';
import { GetProfilePicture } from '../utils/supabaseComponets/getProfilePicture';
import ProfileButton from '../components/ProfileButton';
import NavigationBar from '../components/navbar';
import UpdateUserInformationForm from './UpdateInformationForm';
import Image from 'next/image';

const UpdateUserInformation = async () => {
  const user = await getUserServer();
  const courses = user.id ? await getUserCourses(user.id) : [];
  const imageURL = await GetProfilePicture();
  const username = await getUsername(user);
  const name = await getName(user);

  return (
    <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
        <div className='w-full flex items-center border-b border-purple-500 pb-2 flex-shrink-0 px-4'>
          <div className='flex-shrink-0 w-10 lg:w-[180px]'>
            <div className='md:w-12 w-16 flex justify-start'>
            </div>
            <div className='hidden lg:flex items-center h-[36px]'>
              <Image 
                src="/assets/groupup-logo-cut.PNG" 
                alt='logo' 
                height={36} 
                width={180} 
                className='w-full h-full object-contain' 
              />
            </div>
          </div>
        
          <div className='flex-1 max-w-2xl mx-4 lg:mx-auto'>
            <SearchBar placeholder='Search for a post'/>
          </div>

          <div className='flex-shrink-0 w-10 lg:w-auto'>
            <ProfileButton 
              imageURL={imageURL} 
              username={username.data?.username} 
              name={name.data?.name}
            />
          </div>
        </div>

        <div className='w-full flex flex-1 overflow-hidden'>  
          <NavigationBar courses={courses} />
          
          <UpdateUserInformationForm />
        </div>
        
    </main>
  )
}

export default UpdateUserInformation