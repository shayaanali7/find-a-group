import React from 'react'
import SearchBar from '../components/searchbar'
import NavigationBar from '../components/navbar'
import ProfileButton from '../components/ProfileButton'
import getUserServer, { getName, getUsername } from '../utils/supabaseComponets/getUserServer'
import { GetProfilePicture } from '../utils/supabaseComponets/getProfilePicture'
import { getUserCourses } from '../utils/supabaseComponets/getUserCourses'
import ShowRules from './ShowRules'
import PostForm from './PostForm'
import { StorePost } from './StorePost'

interface CreatePostPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const CreatePostPage = async ({ searchParams }: CreatePostPageProps) => {
  const resolvedSearchParams = await searchParams;
  const courseName = typeof resolvedSearchParams.courseName === 'string' ? resolvedSearchParams.courseName : '';
  const user = await getUserServer();
  const imageURL = await GetProfilePicture();
  const username = await getUsername(user);
  const name = await getName(user);
  const courses = user.id ? await getUserCourses(user.id) : [];
  
  return (
    <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
      <div className='w-full flex justify-center border-b border-purple-500 pb-2 flex-shrink-0'>
        <div className='md:w-12 w-16'></div>
        
        <div className='flex-1 flex justify-center'>
          <SearchBar placeholder='Search for a post'/>
        </div>

        <div className='md:w-12 w-16 flex justify-end'>
          <ProfileButton imageURL={imageURL} username={username.data?.username} name={name.data?.name}/>
        </div>
      </div>

      <div className='w-full flex flex-1 overflow-hidden'>  
          <NavigationBar courses={courses} />

          <div className='w-6/10 flex-1 h-full overflow-y-auto bg-white'>
            <div className='p-4 pl-10'>
              <div className='flex flex-row justify-between'>
                <div></div>
                <div className='text-3xl font-bold text-center'>Create A Post</div>
                <div className='flex items-center'>
                  <div className='block sm:hidden mr-2'>
                    <ShowRules />
                  </div>
                </div>
              </div>
              <PostForm courseName={courseName} createPost={StorePost} />
            </div>
          </div>

          <div className='hidden md:block w-1/4 h-148 mt-2 p-4'>
            <div className='bg-gray-100 w-full h-full rounded-lg border border-gray-300 flex flex-col'>
              <h1 className='text-center font-semibold text-xl p-4 border-b border-gray-300 flex-shrink-0'>Rules</h1>
              <div className='flex-1 overflow-y-auto p-4'>
                <ol className='list-none space-y-4'>
                  <li className="flex items-start">
                    <span className='pr-3'>1</span>
                    <span className='break-words'>Be respectful and courteous to all members. No harassment, hate speech, or foul language.</span>
                  </li>
                  <li className="flex items-start">
                    <span className='pr-3'>2</span>
                    <span className='break-words'>Only post content related to finding or forming groups for courses or projects.</span>
                  </li>
                  <li className="flex items-start">
                    <span className='pr-3'>3</span>
                    <span className='break-words'>Be honest about your skills and availability when joining or creating groups.</span>
                  </li>
                  <li className="flex items-start">
                    <span className='pr-3'>4</span>
                    <span className='break-words'>No spam, advertising, or self-promotion of unrelated services.</span>
                  </li>
                  <li className="flex items-start">
                    <span className='pr-3'>5</span>
                    <span className='break-words'>Do not share personal information (yours or others&apos;) publicly.</span>
                  </li>
                  <li className="flex items-start">
                    <span className='pr-3'>6</span>
                    <span className='break-words'>Follow all university and course policies when collaborating with others.</span>
                  </li>
                </ol>
              </div> 
            </div>
          </div>
      </div>    
    </main>
  )
}

export default CreatePostPage