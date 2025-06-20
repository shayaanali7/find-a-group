import React from 'react'
import { CircleUserRound } from "lucide-react";
import {courses, groupSizes, roles, groupStatus, locations} from '../data/tags.js'
import NavigationBar from '../components/navbar';
import SearchBar from '../components/searchbar';
import FilterCard from '../components/filterCard';


const mainPage = () => {
  return (
    <>
    <main className='min-h-screen bg-white text-black flex flex-col items-center pt-2 font-sans'>
        <div className='w-full flex justify-center border-b border-purple-500 pb-2'>
          <div className='md:w-12 w-16'></div>
          
          <div className='flex-1 flex justify-center'>
            <SearchBar />
          </div>

          <div className='md:w-12 w-16 flex justify-end'>
            <button className='hidden md:flex items-center justify-center p-1 mr-5 hover:bg-purple-200 rounded-full transition-colors duration-200'>
              <CircleUserRound className='w-8 h-8 text-gray-700' />
            </button>
          </div>
        </div>

        <div className='w-full flex flex-1'>
            <NavigationBar />
            
            <div className='w-7/10 h-full bg-white'>
              <h3 className='text-black'>hELLO</h3>
            </div>

            <div className='hidden md:block w-3/20 h-full mt-2'>
              <div className='text-xl text-center border-b border-purple-500 mr-2 ml-2'>
                <span>Filters</span>
              </div>

              <FilterCard tags={courses} name='Courses' length={3} />
              <FilterCard tags={groupSizes} name='Size' length={5} />
              <FilterCard tags={roles} name='Roles' length={3} />
              <FilterCard tags={locations} name='Locations' length={3} />
              <FilterCard tags={groupStatus} name='Status' length={2} />
              
            </div>
        </div>
        
    </main>
    </>
  )
}

export default mainPage