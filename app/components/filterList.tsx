'use client'
import React, { useState } from 'react'
import FilterCard from './filterCard'
import SearchBar, { SearchResult } from './searchbar'
import { X } from 'lucide-react'
import {groupSizes, roles, groupStatus, locations} from '../data/tags.js'

interface FilterListProps {
	saveButtonOn: boolean;
	selectedFilters?: string[];
	onFiltersChange?: (filters: string[]) => void;
	onFiltersApply?: (filters: string[]) => void;
}

const FilterList = ({ selectedFilters = [], onFiltersChange, onFiltersApply }: FilterListProps) => {
	const [allFilters, setAllFilters] = useState<string[]>(selectedFilters);
	const [selectedCourses, setSelectedCourses] = useState<string[]>(
		selectedFilters.filter(filter => 
			!groupSizes.some(tag => tag.label === filter) && 
			!roles.some(tag => tag.label === filter) && 
			!groupStatus.some(tag => tag.label === filter) && 
			!locations.some(tag => tag.label === filter)
		)
	);

	const handleFilterAddition = (filters: string[]) => {
		const combinedFilters = [...new Set([...selectedCourses, ...filters])];
		setAllFilters(combinedFilters);
		if (onFiltersChange) onFiltersChange(combinedFilters);
	}

	const handleFilterDeletion = (filters: string[]) => {
		const combinedFilters = [...new Set([...selectedCourses, ...filters])];
		setAllFilters(combinedFilters);
		if (onFiltersChange) onFiltersChange(combinedFilters);
	}

	const handleCourseSelection = (result: SearchResult) => {
		if (result.type === 'course' && result.title) {
			const courseName = result.title;
			console.log(selectedCourses);
			if (!selectedCourses.includes(courseName)) {
				const newSelectedCourses = [...selectedCourses, courseName];
				setSelectedCourses(newSelectedCourses);

				const otherFilters = allFilters.filter(filter => 
					!selectedCourses.includes(filter) && filter !== courseName
				);
				const combinedFilters = [...new Set([...newSelectedCourses, ...otherFilters])];
				setAllFilters(combinedFilters);
				if (onFiltersChange) onFiltersChange(combinedFilters);
			}
		}
	}

	const removeCourse = (courseToRemove: string) => {
		const newSelectedCourses = selectedCourses.filter(course => course !== courseToRemove);
		setSelectedCourses(newSelectedCourses);

		const otherFilters = allFilters.filter(filter => 
			!selectedCourses.includes(filter) && filter !== courseToRemove
		);
		const combinedFilters = [...new Set([...newSelectedCourses, ...otherFilters])];
		setAllFilters(combinedFilters);
		if (onFiltersChange) onFiltersChange(combinedFilters);
	}
	const currentFilters = allFilters;

	const handleSaveClick = () => {
		console.log('Applying filters:', currentFilters);
		if (onFiltersApply) {
			onFiltersApply(currentFilters);
		}
	}

	return (
    <>
      <FilterCard 
        tags={groupSizes} 
        name='Size' 
        length={5} 
        selectedFilters={currentFilters}
        onFilterAddition={handleFilterAddition} 
        onFilterDeletion={handleFilterDeletion} 
      />
      <FilterCard 
        tags={roles} 
        name='Roles' 
        length={3} 
        selectedFilters={currentFilters}
        onFilterAddition={handleFilterAddition} 
        onFilterDeletion={handleFilterDeletion} 
      />
      <FilterCard 
        tags={locations} 
        name='Locations' 
        length={3} 
        selectedFilters={currentFilters}
        onFilterAddition={handleFilterAddition} 
        onFilterDeletion={handleFilterDeletion} 
      />
      <FilterCard 
        tags={groupStatus} 
        name='Status' 
        length={2} 
        selectedFilters={currentFilters}
        onFilterAddition={handleFilterAddition} 
        onFilterDeletion={handleFilterDeletion} 
      />

      <div className="mb-4">
        <div className="text-xl font-semibold text-center text-black mb-2 mt-5">Course Filter</div>
        <SearchBar 
          placeholder="Filter Courses"
          coursePickerButton={true}
          onClickAction={handleCourseSelection}
        />
        {selectedCourses.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="text-xs text-gray-800">Selected courses:</div>
            <div className="flex flex-wrap gap-2">
              {selectedCourses.map((course, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-full text-xs"
                >
                  <span>{course}</span>
                  <button
                    onClick={() => removeCourse(course)}
                    className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={handleSaveClick}
        className='w-full h-8 text-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transform transition-colors duration-300 font-semibold hover:from-purple-600 hover:to-indigo-600 shadow-purple-200 text-white cursor-pointer'
        >Save
      </button>
	</>
  )
}

export default FilterList