'use client'
import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useLoading } from '../../UI/Loading/LoadingContext'

interface DropDownListProps { 
	name: string
	elements?: Array<string>
	elementsWithIds?: Array<{ id: string, name: string }>;
}

const DropDownList = ( {name, elements, elementsWithIds}: DropDownListProps ) => {
	const [isExpanded, setIsExpanded] = useState<boolean>(false);
	const contentRef = useRef<HTMLDivElement>(null);
	const [maxHeight, setMaxHeight] = useState<string>('0px')
	 const { startLoading, stopLoading } = useLoading();

	useEffect(() => {
				if (isExpanded && contentRef.current) {
					setMaxHeight(`${contentRef.current.scrollHeight}px`)
				}
				else setMaxHeight('0px');
			}, [isExpanded, elements]);

	const handleNavigationClick = () => {
		startLoading();

		setTimeout(() => {
			stopLoading();
		}, 1000);
	}
	
  return (
		<>
			<div>
				<button
					className='group flex items-center justify-between w-full gap-3 p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-100 hover:to-indigo-100 hover:text-purple-700 transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
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
					{elements && elements.map((element, index) => (
						<Link href={`/courses/${element}`} key={index}>
							<button
								key={index}
								onClick={() => handleNavigationClick()}
								className='w-full p-2 hover:bg-gray-100'
							>{element}</button>
						</Link>
						
					))}
					{elementsWithIds && elementsWithIds.map((element, index) => (
						<Link href={`/groupsPage/${element.id}`} key={index}>
							<button
								key={index}
								className='w-full p-2 hover:bg-gray-100'
								onClick={() => handleNavigationClick()}
							>{element.name}</button>
						</Link>
					))}
				</div>
			</div>
		</>
    
  )
}

export default DropDownList
