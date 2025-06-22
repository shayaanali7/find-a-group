'use client'

import React, { useState } from 'react'
import FilterCard from '../components/filterCard'
import SaveButton from '../components/saveButton'
import {courses, groupSizes, roles, groupStatus, locations} from '../data/tags.js'

const FilterList = () => {
	const [allFilters, setAllFilters] = useState<string[]>([]);

	const handleFilterAddition = (filters: string[]) => {
		const additions = filters.filter(f => !allFilters.includes(f));
		setAllFilters([...allFilters, ...additions]);
	}

	const handleFilterDeletion = (filters: string[]) => {
		const newFilters = allFilters.filter(element => !filters.includes(element));
		setAllFilters(newFilters);
	}

  return (
    <>
		<FilterCard tags={courses} name='Courses' length={3} onFilterAddition={handleFilterAddition} onFilterDeletion={handleFilterDeletion} />
      	<FilterCard tags={groupSizes} name='Size' length={5} onFilterAddition={handleFilterAddition} onFilterDeletion={handleFilterDeletion} />
		<FilterCard tags={roles} name='Roles' length={3} onFilterAddition={handleFilterAddition} onFilterDeletion={handleFilterDeletion} />
		<FilterCard tags={locations} name='Locations' length={3} onFilterAddition={handleFilterAddition} onFilterDeletion={handleFilterDeletion} />
		<FilterCard tags={groupStatus} name='Status' length={2} onFilterAddition={handleFilterAddition} onFilterDeletion={handleFilterDeletion} />
		<SaveButton filters={allFilters} />
	</>
  )
}

export default FilterList