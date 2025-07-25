'use client'

import React, { useEffect, useState } from 'react'
import { Search } from "lucide-react"
import courses from '../data/courses.js'

interface SearchBarProps {
  placeholder: string
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    loadData();
    setUpSubscriptions();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    // Simulate data loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  }

  const setUpSubscriptions = () => {
    // Set up any necessary subscriptions here
    console.log('Setting up subscriptions...');
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value)
  }

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      console.log('Searching for:', searchQuery)
    }
  }

  return (
    <>
      <div className='md:hidden w-10' />

      <div className='relative flex-1 max-w-md mx-auto md:mx-0'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5 pointer-events-none' />
        <form onSubmit={handleSearchSubmit}>
          <input 
            type='text'
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            placeholder={placeholder}
            className='w-full pl-10 pr-3 py-1 text-lg border-2 bg-white text-black border-black rounded-full focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-200'
          />
        </form>
      </div>
      <div className='md:hidden w-10' />
    </>
  )
}

export default SearchBar