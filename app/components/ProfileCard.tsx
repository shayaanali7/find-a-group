import React from 'react'
import { Mail, Calendar, BookOpen, Trophy, Users, MessageCircle, Link } from 'lucide-react'
import { UserProfile } from '../interfaces/interfaces';

interface ProfileCardProps {
  profile: UserProfile | null;
  loading?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, loading }) => {
  if (loading) {
    return (
      <div className='hidden md:block w-1/4 h-full mt-1 pb-5'>
        <div className='bg-gradient-to-br from-purple-500 to-purple-700 h-full w-9/10 rounded-2xl mt-2 ml-3 shadow-lg text-white'>
          <div className='p-6 text-center'>
            <div className='animate-pulse'>
              <div className='h-6 bg-white/20 rounded mb-4'></div>
              <div className='h-4 bg-white/20 rounded mb-2'></div>
              <div className='h-4 bg-white/20 rounded'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='hidden md:block w-1/4 h-full mt-1 pb-5'>
        <div className='bg-gradient-to-br from-purple-500 to-purple-700 h-full w-9/10 rounded-2xl mt-2 ml-3 shadow-lg text-white'>
          <div className='p-6 text-center'>
            <p className='text-white/80'>No profile data available</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className='hidden md:block w-1/4 h-full mt-1 pb-5'>
      <div className='bg-gradient-to-br from-purple-500 to-purple-700 h-full w-9/10 rounded-2xl mt-2 ml-3 shadow-lg text-white'>
        
        <div className='p-6 text-center border-b border-purple-300/30'>
          <h2 className='text-2xl font-bold'>{profile.username}</h2>
        </div>

        <div className='px-6 py-4 border-b border-purple-300/30'>
          <div className='grid grid-cols-3 gap-4 text-center'>
            <div className='bg-white/10 rounded-lg p-3 backdrop-blur-sm'>
              <MessageCircle className='w-5 h-5 mx-auto mb-1' />
              <div className='text-lg font-bold'>{profile.posts_count || 0}</div>
              <div className='text-xs text-purple-100'>Posts</div>
            </div>
            <div className='bg-white/10 rounded-lg p-3 backdrop-blur-sm'>
              <Users className='w-5 h-5 mx-auto mb-1' />
              <div className='text-lg font-bold'>{profile.groups_count || 0}</div>
              <div className='text-xs text-purple-100'>Groups</div>
            </div>
            <div className='bg-white/10 rounded-lg p-3 backdrop-blur-sm'>
              <Trophy className='w-5 h-5 mx-auto mb-1' />
              <div className='text-lg font-bold'>{profile.reputation || 0}</div>
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
              <span className='font-medium'>{profile.major || 'Not specified'}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-purple-100'>Year:</span>
              <span className='font-medium'>{profile.year || 'Not specified'}</span>
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
              <span className='font-medium'>
                {profile.github_url ? (
                  <a 
                    href={profile.github_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className='text-purple-100 hover:text-white underline'
                  >
                    Link
                  </a>
                ) : (
                  'Not provided'
                )}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-purple-100'>Instagram:</span>
              <span className='font-medium'>
                {profile.instagram_url ? (
                  <a 
                    href={profile.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className='text-purple-100 hover:text-white underline'
                  >
                    Link
                  </a>
                ) : (
                  'Not provided'
                )}
              </span>
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
              <span className='truncate'>{profile.email || 'Not provided'}</span>
            </div>
            <div className='flex items-center'>
              <Calendar className='w-4 h-4 mr-2 text-purple-200' />
              <span>Joined {formatDate(profile.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileCard