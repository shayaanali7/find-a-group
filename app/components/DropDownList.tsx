'use client'
import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'

interface DropDownListProps { 
	name: string
	elements: Array<string>
}

const DropDownList = ( {name, elements}: DropDownListProps ) => {
	const [isExpanded, setIsExpanded] = useState<boolean>(false);
	const contentRef = useRef<HTMLDivElement>(null);
	const [maxHeight, setMaxHeight] = useState<string>('0px')

	useEffect(() => {
				if (isExpanded && contentRef.current) {
					setMaxHeight(`${contentRef.current.scrollHeight}px`)
				}
				else setMaxHeight('0px');
			}, [isExpanded, elements]);

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
					{elements.map((element, index) => (
						<Link href={`/courses/${element}`} key={index}>
							<button
								key={index}
								className='w-full p-2 hover:bg-gray-100'
							>{element}</button>
						</Link>
						
					))}
				</div>


			</div>
		</>
    
  )
}

export default DropDownList
