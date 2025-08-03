'use client'
import React, { useState } from 'react'
import MainContentLayout from './MainContentLayout';
import FilterList from './filterList';

const HomePageContent = ({ pageTitle, courses, id }: { pageTitle: string, courses: Array<string>, id: string }) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleFiltersApply = (filters: string[]) => {
    setActiveFilters(filters);
  };

  return (
    <div className='w-full flex flex-1 overflow-hidden'>  
      <MainContentLayout 
        pageTitle={pageTitle} 
        courses={courses} 
        id={id} 
        activeFilters={activeFilters}
      />

      <div className='hidden md:block w-3/20 h-full mt-2 overflow-y-auto'>
        <div className='text-xl font-semibold text-center border-b border-purple-500 mr-2 ml-2'>
          <span>Filters</span>
        </div>
        <div className='mr-2 ml-2'>
          <FilterList 
            saveButtonOn={true} 
            onFiltersApply={handleFiltersApply}
          />
        </div>
      </div>
    </div>     
  );
};

export default HomePageContent