import React from 'react'
import { X } from 'lucide-react'
import { courses, groupSizes, roles, groupStatus, locations } from '../data/tags.js'

interface AddedTagsProps {
	filters: string[];
	onRemoveTag?: (tagToRemove: string) => void;
}

const AddedTags = ({ filters, onRemoveTag }: AddedTagsProps) => {
	const allTags = [...courses, ...groupSizes, ...roles, ...groupStatus, ...locations];
	
	const getTagColor = (filterLabel: string) => {
		const tag = allTags.find(tag => tag.label === filterLabel);
		return tag ? { color: tag.color, hoverColor: tag.hoverColor } : { color: 'bg-gray-400', hoverColor: 'bg-gray-500' };
	};

	if (filters.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-wrap gap-2 mb-2">
			{filters.map((filter, index) => {
				const { color, hoverColor } = getTagColor(filter);
				return (
					<div
						key={index}
						className={`${color} text-black font-semibold px-3 py-1 rounded-full text-sm flex items-center gap-1`}
					>
						<span>{filter}</span>
						{onRemoveTag && (
							<button
								onClick={() => onRemoveTag(filter)}
								className={`hover:${hoverColor} rounded-full p-0.5 transition-colors duration-200`}
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