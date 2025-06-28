'use client'
import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react';

interface Tag {
  label: string, 
  color: string
  hoverColor: string
}

interface FilterCardProps {
  tags: Tag[];
  name: string;
  length: number;
  onFilterAddition?: (filters: string[]) => void;
  onFilterDeletion?: (filters: string[]) => void;
  selectedFilters?: string[]; // Add this to sync with parent state
}

const FilterCard = ({ tags, name, length, onFilterAddition, onFilterDeletion, selectedFilters = [] }: FilterCardProps) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [isBeingFiltered, setIsBeingFiltered] = useState<Array<boolean>>(() => Array(length).fill(false));
    const contentRef = useRef<HTMLDivElement>(null);
    const [maxHeight, setMaxHeight] = useState<string>('0px')

    // Sync with parent's selected filters
    useEffect(() => {
      const updated = tags.map(tag => selectedFilters.includes(tag.label));
      setIsBeingFiltered(updated);
    }, [selectedFilters, tags]);

    useEffect(() => {
      if (isExpanded && contentRef.current) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`)
      }
      else setMaxHeight('0px');
    }, [isExpanded, tags]);

    const handleClick = (idx: number, label: string) => {
      const updated = [...isBeingFiltered];
      updated[idx] = true;
      setIsBeingFiltered(updated);

      const newList = [...selectedFilters, label];
      if (onFilterAddition) onFilterAddition(newList);
    }; 

    const handleRemoveClick = (idx: number, e: React.MouseEvent, label: string) => {
      e.stopPropagation();
      const updated = [...isBeingFiltered];
      updated[idx] = false;
      setIsBeingFiltered(updated);

      // Fixed: Remove the specific label from the list
      const newList = selectedFilters.filter(element => element !== label);
      if (onFilterDeletion) onFilterDeletion(newList);
    };

    const needsSingleColumn = tags.some(tag => tag.label.length > 12);
    return(
        <>
          <div className='font-sans text-xl w-full h-8 mt-2 bg-purple-400 rounded-full'>
            <button 
            className='w-full flex items-center justify-between px-2 cursor-pointer' 
            onClick={() => setIsExpanded(!isExpanded)}>
              <span className='ml-2'>{name}</span>
              <ChevronDown 
                className={`transition-transform duration-400 ${isExpanded ? 'rotate-180' : ''}`} 
              />
            </button>
          </div>

          <div
            ref={contentRef}
            style={{
              maxHeight,
              transition: 'max-height 0.3s ease',
              overflow: 'hidden'
            }}
          >
            <div className={`bg-white border border-purple-400 rounded-2xl p-3  ml-1 mr-1 ${needsSingleColumn ? 'flex flex-col gap-2' : 'grid grid-cols-2 gap-2'}`}>
              {tags.map((tag, idx) => (
                isBeingFiltered[idx] ? (
                  <button
                    key={idx}
                    className={`${tag.color} hover:${tag.hoverColor} transition-colors duration-300 h-8 rounded-full flex flex-row items-center justify-between px-2`} 
                    onClick={e => handleRemoveClick(idx, e, tag.label)}
                    aria-label='Remove filter'
                  >
                    <span className='truncate mr-2'>{tag.label}</span>
                    <X className='w-4 h-4 flex-shrink-0'/>
                  </button>
                ) : (
                  <button 
                    key={idx} 
                    className={`${tag.color} hover:${tag.hoverColor} transition-colors duration-300 h-8 rounded-full flex flex-row items-center justify-center`}
                    onClick={() => handleClick(idx, tag.label)}
                  >
                    <span className='truncate'>{tag.label}</span>
                  </button>
                )
              ))}
            </div>
          </div>
        </>
        
    )
}

export default FilterCard