'use client'
import React, { useState } from 'react'
import { Home, MessageCircle, Users, CirclePlus, CircleUserRound, X, Menu } from "lucide-react";

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
      <nav className='flex flex-col h-full'>
        <div className='flex-1'>
          <button 
            onClick={onItemClick}
            className='flex items-center w-9/10 gap-2 m-1 ml-2 hover:bg-purple-200 p-2 rounded-full text-xl'>
              <Home className='text-3xl' />
              <span>Home</span>
          </button>

          <button 
            onClick={onItemClick}
            className='flex items-center w-9/10 gap-2 m-1 ml-2 hover:bg-purple-200 p-2 rounded-full text-xl'>
              <MessageCircle className='text-3xl' />
              <span>Messages</span>
          </button>

          <button 
            onClick={onItemClick}
            className='flex items-center w-9/10 gap-2 m-1 ml-2 hover:bg-purple-200 p-2 rounded-full text-xl'>
              <Users className='text-3xl' />
              <span>My Groups</span>
          </button>

          <button 
            onClick={onItemClick}
            className='flex items-center w-9/10 gap-2 m-1 ml-2 hover:bg-purple-200 p-2 rounded-full text-xl'>
              <CirclePlus className='text-3xl' />
              <span>Create Group</span>
          </button>

          <button className='flex items-center w-9/10 gap-2 m-1 ml-2 hover:bg-purple-200 p-2 rounded-full text-xl mt-93 mb-2'>
              <CircleUserRound className='text-3xl' />
              <span>Profile</span>
          </button>
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
        {isMobileMenuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
      </button>

      <div className='hidden md:flex md:w-3/20 h-full flex-col bg-white border-r border-purple-500'>
        <NavigationContent onItemClick={handleClick} />
      </div>

      {isMobileMenuOpen && (
        <>
          <div className='md:hidden fixed left-0 top-0 h-full w-64 bg-white border-r border-purple-500 z-50 transform transition-transform duration-300'>
            <div className='p-4 border-b border-purple-500'>
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
      )}    
    </>

  )
}

export default NavigationBar