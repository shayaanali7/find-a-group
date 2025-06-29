'use client'
import React, { useState } from 'react'
import ModalScreen from './ModalScreen';
import FilterList from './filterList';
import AddedTags from './AddedTags';

interface TagModalProps {
    text: string;
    onTagsAdded?: (tags: string[]) => void;
}

const TagModal = ({ text, onTagsAdded }: TagModalProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [confirmedTags, setConfirmedTags] = useState<string[]>([]);

  const handleFiltersChange = (filters: string[]) => {
    setSelectedTags(filters);
  };

  const handleAddTags = () => {
    setConfirmedTags(selectedTags);
    if (onTagsAdded) {
      onTagsAdded(selectedTags);
    }
    setIsOpen(false);
  };

  const handleRemoveConfirmedTag = (tagToRemove: string) => {
    const updatedTags = confirmedTags.filter(tag => tag !== tagToRemove);
    setConfirmedTags(updatedTags);
    if (onTagsAdded) {
      onTagsAdded(updatedTags);
    }
  };

  const handleModalClose = () => {
    setSelectedTags(confirmedTags);
    setIsOpen(false);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <AddedTags 
          filters={confirmedTags} 
          onRemoveTag={handleRemoveConfirmedTag}
        />
        <button 
          className='border-black border hover:bg-gray-100 rounded-full p-1 px-5 flex-shrink-0' 
          onClick={() => {
            setSelectedTags(confirmedTags);
            setIsOpen(true);
          }}
        >
          {text}
        </button>
      </div>
      
      {isOpen && (
        <ModalScreen isOpen={isOpen} handleClose={handleModalClose}>
          <div className='flex flex-col h-full text-black'>
            <div className='flex-shrink-0 pt-4 pb-2'>
              <h1 className='font-semibold text-center text-2xl'>Add Tags</h1>
            </div>

            <div className='flex-1 overflow-y-auto px-2 py-2 min-h-0'>
              <div className='max-h-[400px] overflow-y-auto'>
                <FilterList 
                  saveButtonOn={false} 
                  selectedFilters={selectedTags}
                  onFiltersChange={handleFiltersChange}
                />
              </div>
            </div>

            <div className='flex-shrink-0 flex justify-end gap-3 pt-4 pb-2'>
              <button
                onClick={handleAddTags}
                className='w-32 py-2 px-8 rounded-full font-semibold text-white bg-purple-500 hover:bg-purple-600 shadow transition-colors duration-200 border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300'
              >
                Add
              </button>

              <button
                onClick={handleModalClose}
                className='w-32 py-2 px-8 rounded-full font-semibold text-purple-500 bg-white hover:bg-purple-50 shadow border border-purple-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300'
              >
                Close
              </button>
            </div>
          </div>
        </ModalScreen>
      )}
    </div>
  )
}

export default TagModal