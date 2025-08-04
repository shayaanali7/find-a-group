'use client'
import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import ModalScreen from './ModalScreen';
import {groupSizes, roles, groupStatus, locations} from '../data/tags.js'
import SearchBar, { SearchResult } from './searchbar';
import FilterCard from './filterCard';

interface FilterListProps {
	saveButtonOn: boolean;
	selectedFilters?: string[];
	onFiltersChange?: (filters: string[]) => void;
	onFiltersApply?: (filters: string[]) => void;
}

const FilterButton = ({ selectedFilters = [], onFiltersChange, onFiltersApply }: FilterListProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
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
    if (onFiltersApply) {
      onFiltersApply(currentFilters);
    }
    setIsOpen(false);
  } 

  const handleClose = () => {
    setIsOpen(false);
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center p-2 hover:bg-purple-200 rounded-full transition-colors duration-200 ${
          currentFilters.length > 0 ? 'bg-purple-100 border-2 border-purple-300' : ''
        }`}
        aria-label="Open filters"
      >
        <Filter className={`w-6 h-6 ${currentFilters.length > 0 ? 'text-purple-700' : 'text-gray-700'}`} />
        {currentFilters.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {currentFilters.length}
          </span>
        )}
      </button>

      {isOpen && (
        <ModalScreen isOpen={isOpen} handleClose={handleClose}>
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl p-4 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Filters</h2>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            {currentFilters.length > 0 && (
              <div className="mt-2 text-sm opacity-90">
                {currentFilters.length} filter{currentFilters.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-4">
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

              <div className="border-t pt-4">
                <div className="text-lg font-semibold text-center text-gray-800 mb-3">Course Filter</div>
                <SearchBar 
                  placeholder="Filter Courses"
                  coursePickerButton={true}
                  onClickAction={handleCourseSelection}
                />
                {selectedCourses.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-medium text-gray-600">Selected courses:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCourses.map((course, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-full text-sm shadow-sm"
                        >
                          <span>{course}</span>
                          <button
                            onClick={() => removeCourse(course)}
                            className="hover:bg-white/20 rounded-full p-0.5 transition-colors ml-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t p-4 z-10">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setAllFilters([]);
                  setSelectedCourses([]);
                  if (onFiltersChange) onFiltersChange([]);
                }}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-full font-medium hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
              <button 
                onClick={handleSaveClick}
                className='flex-2 px-6 py-2 text-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 font-semibold hover:from-purple-600 hover:to-indigo-600 hover:shadow-lg text-white cursor-pointer'
              >
                Apply Filters
              </button>
            </div>
          </div>
        </ModalScreen>
      )}
    </div>
  );
};

export default FilterButton;