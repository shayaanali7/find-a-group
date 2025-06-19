'use client'

import React, { useState } from 'react'
import { Search } from "lucide-react"

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('')

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
            placeholder='Search for a post'
            className='w-full pl-10 pr-3 py-1 text-lg border-2 bg-white text-black border-black rounded-full focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-200'
          />
        </form>
      </div>
      <div className='md:hidden w-10' />
    </>
  )
}

export default SearchBar