import React from 'react'
import { User, Mail, Calendar, MapPin, BookOpen, Trophy, Users, MessageCircle, Link } from 'lucide-react'

interface ProfileCardProps {
  username: string;
  email?: string;
  joinDate?: string;
  location?: string;
  major?: string;
  year?: string;
  postsCount?: number;
  groupsCount?: number;
  reputation?: number;
  bio?: string;
}

const ProfileCard = ({ 
  username, 
  email = "user@example.com",
  joinDate = "January 2024",
  major = "Computer Science",
  year = "Junior",
  postsCount = 42,
  groupsCount = 8,
  reputation = 156,
}: ProfileCardProps) => {
  return (
    <div className='hidden md:block w-1/4 h-full mt-1 pb-5'>
      <div className='bg-gradient-to-br from-purple-500 to-purple-700 h-full w-9/10 rounded-2xl mt-2 ml-3 shadow-lg text-white'>
        
        <div className='p-6 text-center border-b border-purple-300/30'>
          <h2 className='text-2xl font-bold'>{username}</h2>
        </div>

        <div className='px-6 py-4 border-b border-purple-300/30'>
          <div className='grid grid-cols-3 gap-4 text-center'>
            <div className='bg-white/10 rounded-lg p-3 backdrop-blur-sm'>
              <MessageCircle className='w-5 h-5 mx-auto mb-1' />
              <div className='text-lg font-bold'>{postsCount}</div>
              <div className='text-xs text-purple-100'>Posts</div>
            </div>
            <div className='bg-white/10 rounded-lg p-3 backdrop-blur-sm'>
              <Users className='w-5 h-5 mx-auto mb-1' />
              <div className='text-lg font-bold'>{groupsCount}</div>
              <div className='text-xs text-purple-100'>Groups</div>
            </div>
            <div className='bg-white/10 rounded-lg p-3 backdrop-blur-sm'>
              <Trophy className='w-5 h-5 mx-auto mb-1' />
              <div className='text-lg font-bold'>{reputation}</div>
              <div className='text-xs text-purple-100'>Rep</div>
            </div>
          </div>
        </div>

        <div className='px-6 py-4 border-b border-purple-300/30'>
          <h3 className='text-lg font-semibold mb-3 flex items-center'>
            <BookOpen className='w-5 h-5 mr-2' />
            Academic Info
          </h3>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-purple-100'>Major:</span>
              <span className='font-medium'>{major}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-purple-100'>Year:</span>
              <span className='font-medium'>{year}</span>
            </div>
          </div>
        </div>

        <div className='px-6 py-4 border-b border-purple-300/30'>
          <h3 className='text-lg font-semibold mb-3 flex items-center'>
            <Link className='w-5 h-5 mr-2' />
            Social Links
          </h3>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-purple-100'>Github:</span>
              <span className='font-medium'>{major}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-purple-100'>Instagram:</span>
              <span className='font-medium'>{year}</span>
            </div>
          </div>
        </div>

        <div className='px-6 py-4 border-b border-purple-300/30'>
          <h3 className='text-lg font-semibold mb-3 flex items-center'>
            <Mail className='w-5 h-5 mr-2' />
            Contact
          </h3>
          <div className='space-y-3 text-sm'>
            <div className='flex items-center'>
              <Mail className='w-4 h-4 mr-2 text-purple-200' />
              <span className='truncate'>{email}</span>
            </div>
            <div className='flex items-center'>
              <Calendar className='w-4 h-4 mr-2 text-purple-200' />
              <span>Joined {joinDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileCard