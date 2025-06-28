'use client'
import React, { useState } from 'react'
import FilterCard from './filterCard'
import SaveButton from './saveButton'
import {courses, groupSizes, roles, groupStatus, locations} from '../data/tags.js'
import AddedTags from './AddedTags'

interface FilterListProps {
	saveButtonOn: boolean;
	addButtonOn: boolean;
	selectedFilters?: string[];
	onFiltersChange?: (filters: string[]) => void;
}

const FilterList = ({ saveButtonOn, addButtonOn, selectedFilters = [], onFiltersChange }: FilterListProps) => {
	const [allFilters, setAllFilters] = useState<string[]>(selectedFilters);

	const handleFilterAddition = (filters: string[]) => {
		setAllFilters(filters);
		if (onFiltersChange) onFiltersChange(filters);
	}

	const handleFilterDeletion = (filters: string[]) => {
		setAllFilters(filters);
		if (onFiltersChange) onFiltersChange(filters);
	}

	// Use the passed selectedFilters if available, otherwise use local state
	const currentFilters = selectedFilters.length > 0 ? selectedFilters : allFilters;

  return (
    <>
		<FilterCard 
			tags={courses} 
			name='Courses' 
			length={3} 
			selectedFilters={currentFilters}
			onFilterAddition={handleFilterAddition} 
			onFilterDeletion={handleFilterDeletion} 
		/>
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
		{saveButtonOn && <SaveButton filters={currentFilters} /> }
		{addButtonOn && <AddedTags filters={currentFilters} /> }
	</>
  )
}

export default FilterList