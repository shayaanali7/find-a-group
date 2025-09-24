import React from 'react'
import SearchBar from '../components/UI/Forms/searchbar';
import getUserServer, { getName, getUsername } from '../utils/supabaseComponets/getUserServer';
import { getUserCourses } from '../utils/supabaseComponets/getUserCourses';
import { GetProfilePicture } from '../utils/supabaseComponets/getProfilePicture';
import ProfileButton from '../components/UI/Buttons/ProfileButton';
import NavigationBar from '../components/Layout/navbar';
import EditProfileForm from './EditProfileForm';
import Image from 'next/image';

const editProfilePage = async () => {
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

        <div className='w-full flex flex-1 overflow-hidden'>  
          <NavigationBar courses={courses} />
          
          <div className='flex-1 h-full overflow-hidden bg-white flex flex-col lg:flex-row'>
            <div className='flex-1 lg:flex-[2] p-4 lg:p-8 lg:border-r border-gray-200 overflow-y-auto'>
              <div className='mb-8'>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>Edit Profile</h1>
                <p className='text-gray-600'>Update your profile information</p>
              </div>

              {user.id && <EditProfileForm userId={user.id} />}
            </div>

            <div className='hidden lg:flex lg:flex-col lg:flex-1 bg-gray-50'>
              <div className='p-8 pb-4 flex-shrink-0'>
                <h2 className='text-2xl font-bold text-gray-900 mb-2'>Profile Guidelines</h2>
                <p className='text-gray-600'>Make the most of your profile</p>
              </div>

              <div className='flex-1 overflow-y-auto px-8 pb-8'>
                <div className='space-y-6'>
                  <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200'>
                    <h3 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                      <span className='w-2 h-2 bg-purple-500 rounded-full'></span>
                      Profile Tips
                    </h3>
                    <ul className='text-sm text-gray-600 space-y-3'>
                      <li className='flex items-start gap-3'>
                        <span className='text-purple-500 font-bold'>•</span>
                        <span>Use your real name to help classmates recognize and connect with you</span>
                      </li>
                      <li className='flex items-start gap-3'>
                        <span className='text-purple-500 font-bold'>•</span>
                        <span>Include your major and academic year for better course connections</span>
                      </li>
                      <li className='flex items-start gap-3'>
                        <span className='text-purple-500 font-bold'>•</span>
                        <span>Write a brief bio about your interests, goals, or study preferences</span>
                      </li>
                      <li className='flex items-start gap-3'>
                        <span className='text-purple-500 font-bold'>•</span>
                        <span>Keep your information current to maintain relevant connections</span>
                      </li>
                    </ul>
                  </div>

                  <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200'>
                    <h3 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                      <span className='w-2 h-2 bg-green-500 rounded-full'></span>
                      Privacy & Safety
                    </h3>
                    <ul className='text-sm text-gray-600 space-y-3'>
                      <li className='flex items-start gap-3'>
                        <span className='text-green-500 font-bold'>•</span>
                        <span>Your profile is only visible to other registered students</span>
                      </li>
                      <li className='flex items-start gap-3'>
                        <span className='text-green-500 font-bold'>•</span>
                        <span>You can always update or change your information later</span>
                      </li>
                      <li className='flex items-start gap-3'>
                        <span className='text-green-500 font-bold'>•</span>
                        <span>Only share information you&apos;re comfortable with others seeing</span>
                      </li>
                    </ul>
                  </div>

                  <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200'>
                    <h3 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                      <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
                      Best Practices
                    </h3>
                    <div className='text-sm text-gray-600 space-y-3'>
                      <p><strong>Bio length:</strong> Keep it concise but informative (3-4 sentences work well)</p>
                      <p><strong>Professional tone:</strong> This helps with creating groups and academic networking</p>
                      <p><strong>Be authentic:</strong> Genuine profiles lead to better group partnerships</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>     
    </main>
  )
}

export default editProfilePage