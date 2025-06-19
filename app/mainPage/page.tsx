import React from 'react'
import { CircleUserRound } from "lucide-react";
import NavigationBar from '../components/navbar';
import SearchBar from '../components/searchbar';

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
            
            <div className='w-13/20 h-full bg-white'>
              <h3 className='text-black'>hELLO</h3>
            </div>

            <div className='hidden md:block w-1/5 h-full bg-white'>
                <h3 className='text-black'>hELLO</h3>
            </div>
        </div>
        
    </main>
    </>
  )
}

export default mainPage