import React from 'react'
import SearchBar from '../components/searchbar';
import getUserServer, { getName, getUsername } from '../utils/supabaseComponets/getUserServer';
import { getUserCourses } from '../utils/supabaseComponets/getUserCourses';
import ProfileButton from './ProfileButton';
import { GetProfilePicture } from '../utils/supabaseComponets/getProfilePicture';
import Image from 'next/image';
import HomePageContent from './HomePageContent';
import Link from 'next/link';

interface MainPageProps {
  pageTitle: string;
}

const HomePage = async ( {pageTitle}: MainPageProps ) => {
  const user = await getUserServer();
  const courses = user.id ? await getUserCourses(user.id) : [];
  const imageURL = await GetProfilePicture();
  const username = await getUsername(user);
  const name = await getName(user);

  return (
    <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
      <div className='w-full flex items-center border-b border-purple-500 pb-2 flex-shrink-0 px-4'>
        <div className='flex-shrink-0 w-10 lg:w-[180px]'>
          <div className='hidden lg:flex items-center h-[36px]'>
            <Link href='/mainPage'>
              <Image 
                src="/assets/groupup-logo-cut.PNG" 
                alt='logo' 
                height={36} 
                width={180} 
                className='w-full h-full object-contain' 
              />
            </Link>
          </div>
        </div>
        
        <div className='flex-1 max-w-2xl mx-4 lg:mx-auto'>
          <SearchBar placeholder='Search for posts, users and courses'/>
        </div>

        <div className='flex-shrink-0 w-10 lg:w-auto'>
          <ProfileButton 
            imageURL={imageURL} 
            username={username.data?.username} 
            name={name.data?.name}
          />
        </div>
      </div>
      <HomePageContent pageTitle={pageTitle} courses={courses} id={user.id ?? ''} />
    </main>
  )
}

export default HomePage
