import React from 'react'
import { X } from 'lucide-react'
import { courses, groupSizes, roles, groupStatus, locations } from '../data/tags.js'

interface AddedTagsProps {
	filters: string[];
	onRemoveTag?: (tagToRemove: string) => void;
}

const AddedTags = ({ filters, onRemoveTag }: AddedTagsProps) => {
	if (filters.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-wrap gap-2 mb-2">
			{filters.map((filter, index) => {
				return (
					<div
						key={index}
						className={`bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold px-3 py-1 rounded-full text-sm flex items-center gap-1`}
					>
						<span>{filter}</span>
						{onRemoveTag && (
							<button
								onClick={() => onRemoveTag(filter)}
								className={`transform hover:from-purple-600 hover:to-indigo-600 shadow-purple-200 rounded-full p-0.5 transition-colors duration-200`}
								aria-label={`Remove ${filter}`}
							>
								<X className="w-3 h-3" />
							</button>
						)}
					</div>
				);
			})}
		</div>
	)
}

export default AddedTags