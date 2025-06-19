'use client'
import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react';

interface FilterCardProps {
  tags: Array<string>;
  name: string
}

const FilterCard = ({ tags, name }: FilterCardProps) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const [maxHeight, setMaxHeight] = useState<string>('0px')

    useEffect(() => {
      if (isExpanded && contentRef.current) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`)
      }
      else setMaxHeight('0px');
    }, [isExpanded, tags]);

    return(
        <>
          <div className='font-sans text-xl w-full h-8 mt-2 bg-purple-100'>
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
            <div className='grid grids-cols-2 gap-2 p-2'>
              {tags.map((tag, idx) => (
                <button key={idx} className='bg-purple-300 h-8 rounded-full flex items-center justify-center'>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </>
        
    )
}

export default FilterCard