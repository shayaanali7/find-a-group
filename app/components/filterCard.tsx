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
  name: string
  length: number
}

const filterList = ''
export const filters = () => {

}

const FilterCard = ({ tags, name, length }: FilterCardProps) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [isBeingFiltered, setIsBeingFiltered] = useState<Array<boolean>>(() => Array(length).fill(false));
    const contentRef = useRef<HTMLDivElement>(null);
    const [maxHeight, setMaxHeight] = useState<string>('0px')

    useEffect(() => {
      if (isExpanded && contentRef.current) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`)
      }
      else setMaxHeight('0px');
    }, [isExpanded, tags]);

    const handleClick = (idx: number) => {
      const updated = [...isBeingFiltered];
      updated[idx] = true;
      setIsBeingFiltered(updated);
    }; 

    const handleRemoveClick = (idx: number, e: React.MouseEvent) => {
      e.stopPropagation();
      const updated = [...isBeingFiltered];
      updated[idx] = false;
      setIsBeingFiltered(updated);
    };

    return(
        <>
          <div className='font-sans text-xl w-full h-8 mt-2 bg-purple-200'>
            <button 
            className='w-full flex items-center justify-between px-2' 
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
            <div className='bg-purple-200 grid grid-cols-2 gap-2 p-2'>
              {tags.map((tag, idx) => (
                isBeingFiltered[idx] ? (
                  <button
                    key={idx}
                    className={`${tag.color} hover:${tag.hoverColor} transition-colors duration-300 h-8 rounded-full flex flex-row items-center justify-between px-2`} 
                    onClick={e => handleRemoveClick(idx, e)}
                    aria-label='Remove filter'
                  >
                    <span className='mr-2'>{tag.label}</span>
                    <X className='w-4 h-4'/>
                  </button>
                ) : (
                  <button 
                    key={idx} 
                    className={`${tag.color} hover:${tag.hoverColor} transition-colors duration-300 h-8 rounded-full flex flex-row items-center justify-center`}
                    onClick={() => handleClick(idx)}
                  >
                    {tag.label}
                  </button>
                )
              ))}
            </div>
          </div>
        </>
        
    )
}

export default FilterCard