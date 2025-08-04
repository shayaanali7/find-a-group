import React from 'react'
import { Calendar, BookOpen, Link, User } from 'lucide-react'
import { UserProfile } from '../interfaces/interfaces';

interface ProfileCardProps {
  profile: UserProfile | null;
  loading?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, loading }) => {
  if (loading) {
    return (
      <div className='hidden md:block w-1/4 h-full mt-1 pb-5'>
        <div className='bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 h-full w-9/10 rounded-3xl mt-2 ml-3 shadow-2xl text-white overflow-hidden'>
          <div className='p-6 text-center'>
            <div className='animate-pulse space-y-4'>
              <div className='w-20 h-20 bg-white/20 rounded-full mx-auto'></div>
              <div className='h-6 bg-white/20 rounded-lg'></div>
              <div className='space-y-2'>
                <div className='h-4 bg-white/20 rounded'></div>
                <div className='h-4 bg-white/20 rounded w-3/4 mx-auto'></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='hidden md:block w-1/4 h-full mt-1 pb-5'>
        <div className='bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 h-full w-9/10 rounded-3xl mt-2 ml-3 shadow-2xl text-white overflow-hidden'>
          <div className='p-6 text-center flex items-center justify-center h-full'>
            <div className='text-center'>
              <User className='w-12 h-12 mx-auto mb-3 text-white/60' />
              <p className='text-white/80'>No profile data available</p>
            </div>
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

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  };

  return (
    <div className='hidden md:block w-1/4 h-full mt-1 pb-5'>
      <div className='bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 h-full w-9/10 rounded-3xl mt-2 ml-3 shadow-2xl text-white overflow-hidden backdrop-blur-sm border border-white/10'>
        <div className='relative p-6 text-center'>
          <div className='absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl'></div>
          <div className='absolute bottom-0 left-0 w-16 h-16 bg-indigo-400/20 rounded-full blur-lg'></div>
          
          <div className='relative z-10'>
            <div className='mb-2'>
              {profile.profile_picture_url ? (
                <img 
                  src={profile.profile_picture_url} 
                  alt={profile.name || profile.username}
                  className="w-20 h-20 rounded-full object-cover mx-auto border-3 border-white/30 shadow-lg ring-4 ring-white/10 bg-white"
                />
              ) : (
                <div className='w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center mx-auto border-3 border-white/30 shadow-lg ring-4 ring-white/10 backdrop-blur-sm'>
                  <span className='text-2xl font-bold text-white'>
                    {getInitials(profile.name || profile.username)}
                  </span>
                </div>
              )}
            </div>

            <div>
              {profile.name && (
                <h2 className='text-xl font-bold mb-1 text-white drop-shadow-sm'>{profile.name}</h2>
              )}
              <p className='text-purple-100 text-sm font-medium'>@{profile.username}</p>
            </div>
          </div>
        </div>

        <div className='mx-4 mb-4 bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10'>
          <h3 className='text-base font-semibold mb-3 flex items-center text-white'>
            <BookOpen className='w-4 h-4 mr-2 text-purple-200' />
            Academic Info
          </h3>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between items-center'>
              <span className='text-purple-100'>Major:</span>
              <span className='font-medium text-white text-right flex-1 ml-2 truncate'>
                {profile.major || 'Not provided'}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-purple-100'>Year:</span>
              <span className='font-medium text-white'>{profile.year || 'Not provided'}</span>
            </div>
          </div>
        </div>

        <div className='mx-4 mb-4 pt-5 pb-5 bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10'>
          <h3 className='text-base font-semibold mb-3 flex items-center text-white'>
            <Link className='w-4 h-4 mr-2 text-purple-200' />
            Social Links
          </h3>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between items-center'>
              <span className='text-purple-100'>Github:</span>
              <span className='font-medium flex-1 ml-2 text-right'>
                {profile.github_link ? (
                  <a 
                    href={profile.github_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className='text-purple-200 hover:text-white underline underline-offset-2 transition-colors duration-200 truncate inline-block max-w-full'
                    title={profile.github_link}
                  >
                    View Github
                  </a>
                ) : (
                  <span className='text-white/70'>Not provided</span>
                )}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-purple-100'>Instagram:</span>
              <span className='font-medium flex-1 ml-2 text-right'>
                {profile.instagram_link ? (
                  <a 
                    href={profile.instagram_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className='text-purple-200 hover:text-white underline underline-offset-2 transition-colors duration-200 truncate inline-block max-w-full'
                    title={profile.instagram_link}
                  >
                    View Instagram
                  </a>
                ) : (
                  <span className='text-white/70'>Not provided</span>
                )}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-purple-100'>Instagram:</span>
              <span className='font-medium flex-1 ml-2 text-right'>
                {profile.linkedin_link ? (
                  <a 
                    href={profile.linkedin_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className='text-purple-200 hover:text-white underline underline-offset-2 transition-colors duration-200 truncate inline-block max-w-full'
                    title={profile.linkedin_link}
                  >
                    View Linkedin
                  </a>
                ) : (
                  <span className='text-white/70'>Not provided</span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className='mx-4 mb-4 bg-white/5 rounded-2xl p-4 pt-6 pb-6 backdrop-blur-sm border border-white/10'>
          <div className='space-y-3 text-sm'>
            <div className='flex items-center'>
              <Calendar className='w-4 h-4 mr-2 text-purple-200 flex-shrink-0' />
              <span className='text-white/90 font-semibold'>Joined {formatDate(profile.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileCard