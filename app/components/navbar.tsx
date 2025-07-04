'use client'
import React, { useState } from 'react'
import { Home, MessageCircle, CircleUserRound, X, Menu } from "lucide-react";
import Link from 'next/link';
import DropDownList from './DropDownList';
import AddGroupModal from './AddGroupModal';
import getUser from '../utils/supabaseComponets/getUser';

const NavigationBar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
   
  const toggleMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }

  const handleClick = (): void => {
    setIsMobileMenuOpen(false);
  }

  interface NavigationContentProps {
    onItemClick?: () => void;
  }
  
  const NavigationContent: React.FC<NavigationContentProps> = ({ onItemClick }) => {
    return(
      <nav className='flex flex-col h-full justify-between'>
        <div>
          <Link href='/mainPage'>
            <button 
              onClick={onItemClick}
              className='flex items-center w-9/10 gap-2 m-1 ml-2 hover:bg-purple-200 p-2 rounded-full text-xl'>
                <Home className='text-3xl' />
                <span>Home</span>
            </button>
          </Link>
          
          <Link href='/messagesPage'>
            <button 
            onClick={onItemClick}
            className='flex items-center w-9/10 gap-2 m-1 ml-2 hover:bg-purple-200 p-2 rounded-full text-xl'>
              <MessageCircle className='text-3xl' />
              <span>Messages</span>
          </button>
          </Link>
          
          <AddGroupModal />

          <div className='mt-5 border-t-1 border-purple-500 mr-3 ml-3'>
            <DropDownList name={'My Groups'} elements={['CS2212', 'CS3319']} />
          </div>

          <div className='mt-5 border-t-1 border-purple-500 mr-3 ml-3'>
            <DropDownList name={'My Courses'} elements={['CS2212', 'CS3319']} />
          </div>
        </div>
          
        <div className='mb-2'>
          <Link href='/profilePage'>
            <button className='flex items-center w-9/10 gap-2 m-1 ml-2 hover:bg-purple-200 p-2 rounded-full text-xl'>
              <CircleUserRound className='text-3xl' />
              <span>Profile</span>
            </button>
          </Link>
        </div>
      </nav>
    )
  }


  return (
    <>
      <button
        onClick={toggleMenu}
        className='md:hidden fixed top-2.5 left-0.5 z-50 p-1.5 hover:bg-purple-200 rounded-full '
      >
        <Menu className='w-6 h-6' />
      </button>

      <div className='hidden md:flex md:w-3/20 h-full flex-col bg-white border-r border-purple-500'>
        <NavigationContent />
      </div>

      <div 
        className={`md:hidden fixed left-0 top-0 h-full w-64 bg-white border-r border-purple-500 z-50 
          transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className='p-4 border-b border-purple-500 flex justify-between items-center'>
          <h2 className='text-lg font-semibold'>Menu</h2>
          <button 
            onClick={toggleMenu}
            className='p-2 hover:bg-purple-200 rounded-full'
          >
            <X className='w-6 h-6' />
          </button>
        </div>
        <NavigationContent onItemClick={handleClick} />
      </div>   
    </>

  )
}

export default NavigationBar