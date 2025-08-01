import React from 'react'
import SearchBar from '../components/searchbar';
import FilterList from '../components/filterList';
import getUserServer, { getName, getUsername } from '../utils/supabaseComponets/getUserServer';
import { getUserCourses } from '../utils/supabaseComponets/getUserCourses';
import MainContentLayout from './MainContentLayout';
import ProfileButton from './ProfileButton';
import { GetProfilePicture } from '../utils/supabaseComponets/getProfilePicture';
import Image from 'next/image';

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
        <div className='w-full flex justify-center border-b border-purple-500 pb-2 flex-shrink-0'>
          <div className='md:w-12 w-16'></div>
          
          <div className='hidden md:block items-center h-[36px] w-[120px]'>
            <Image src="/assets/groupup-logo-cut.PNG" alt='logo' height={36} width={120} className='w-full h-full object-contain' />
          </div>
          
          <div className='flex-1 flex justify-center'>
            <SearchBar placeholder='Search for a post'/>
          </div>

          <div className='md:w-12 w-16 flex justify-end'>
            <ProfileButton imageURL={imageURL} username={username.data?.username} name={name.data?.name}/>
          </div>
        </div>

        <div className='w-full flex flex-1 overflow-hidden'>  
            <MainContentLayout pageTitle={pageTitle} courses={courses} id={user.id ?? ''} />

            <div className='hidden md:block w-3/20 h-full mt-2 overflow-y-auto'>
              <div className='text-xl text-center border-b border-purple-500 mr-2 ml-2'>
                <span>Filters</span>
              </div>
              <div className='mr-2 ml-2'>
                <FilterList saveButtonOn={true} />
              </div>
              
            </div>
        </div>     
    </main>
  )
}

export default HomePage