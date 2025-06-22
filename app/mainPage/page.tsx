import React from 'react'
import { CircleUserRound } from "lucide-react";
import NavigationBar from '../components/navbar';
import SearchBar from '../components/searchbar';
import FilterList from './filterList';
import CreatePostButton from '../components/CreatePostButton';

const mainPage = () => {
  return (
    <>
    <main className='h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
        <div className='w-full flex justify-center border-b border-purple-500 pb-2 flex-shrink-0'>
          <div className='md:w-12 w-16'></div>
          
          <div className='flex-1 flex justify-center'>
            <SearchBar placeholder='Search for a post'/>
          </div>

          <div className='md:w-12 w-16 flex justify-end'>
            <button className='hidden md:flex items-center justify-center p-1 mr-5 hover:bg-purple-200 rounded-full transition-colors duration-200'>
              <CircleUserRound className='w-8 h-8 text-gray-700' />
            </button>
          </div>
        </div>

        <div className='w-full flex flex-1 overflow-hidden'>  
            <NavigationBar />

            <div className='w-7/10  flex-1 h-full overflow-y-auto bg-white'>
              <CreatePostButton />

              <div className='p-4'>
                {Array.from({ length: 50 }, (_, i) => (
                  <div key={i} className='mb-4 p-4 border border-gray-200 rounded'>
                    <h4>Post {i + 1}</h4>
                    <p>This is post content that will scroll when there are many posts...</p>
                  </div>
                ))}
              </div>
            </div>

            <div className='hidden md:block w-3/20 h-full mt-2'>
              <div className='text-xl text-center border-b border-purple-500 mr-2 ml-2'>
                <span>Filters</span>
              </div>
              <FilterList />
            </div>
        </div>
        
    </main>
    </>
  )
}

export default mainPage