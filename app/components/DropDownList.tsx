'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface DropDownListProps { 
	name: string
	children: Array<string>
}

const DropDownList = ( {name, children}: DropDownListProps ) => {
	const [isExpanded, setIsExpanded] = useState<boolean>(false);
	const contentRef = useRef<HTMLDivElement>(null);
	const [maxHeight, setMaxHeight] = useState<string>('0px')

	useEffect(() => {
				if (isExpanded && contentRef.current) {
					setMaxHeight(`${contentRef.current.scrollHeight}px`)
				}
				else setMaxHeight('0px');
			}, [isExpanded, children]);

  return (
		<>
			<div>
				<button
					className='w-full flex hover:bg-purple-200 rounded-full m-1 p-2 text-xl items-center justify-between px-2 cursor-pointer'
					onClick={() => setIsExpanded(!isExpanded)}     
				>
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
				<div>
					{children.map((child, index) => (
						<button
							key={index}
							className='w-full p-2 hover:bg-gray-100'
						>{child}</button>
					))}
				</div>


			</div>
		</>
    
  )
}

export default DropDownList
