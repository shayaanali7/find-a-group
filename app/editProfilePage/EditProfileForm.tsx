'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Github, Instagram, Linkedin, AlertCircle, ExternalLink } from 'lucide-react';

interface ProfileData {
  name: string;
  bio: string;
  major: string;
  year: string;
  github_link: string;
  instagram_link: string;
  linkedin_link: string;
}

const EditProfileForm = ({ userId }: { userId: string }) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    bio: '',
    major: '',
    year: '',
    github_link: '',
    instagram_link: '',
    linkedin_link: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [linkErrors, setLinkErrors] = useState<{[key: string]: string}>({});
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profile')
          .select('name, bio, major, year, github_link, instagram_link, linkedin_link')
          .eq('id', userId)
          .single();

        if (error) throw error;

        if (data) {
          setProfileData({
            name: data.name || '',
            bio: data.bio || '',
            major: data.major || '',
            year: data?.year.toString() || '',
            github_link: data.github_link || '',
            instagram_link: data.instagram_link || '',
            linkedin_link: data.linkedin_link || ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId, supabase]);

  const validateUrl = (url: string, platform: string): string => {
    if (!url.trim()) return '';
    
    try {
      const urlObj = new URL(url);
      
      switch (platform) {
        case 'github_link':
          if (!urlObj.hostname.includes('github.com')) {
            return 'Please enter a valid GitHub URL (e.g., https://github.com/username)';
          }
          break;
        case 'instagram_link':
          if (!urlObj.hostname.includes('instagram.com')) {
            return 'Please enter a valid Instagram URL (e.g., https://instagram.com/username)';
          }
          break;
        case 'linkedin_link':
          if (!urlObj.hostname.includes('linkedin.com')) {
            return 'Please enter a valid LinkedIn URL (e.g., https://linkedin.com/in/username)';
          }
          break;
      }
      return '';
    } catch {
      return 'Please enter a valid URL starting with https://';
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
    setSuccess(false);

    // Validate social links
    if (field.includes('_link')) {
      const linkError = validateUrl(value, field);
      setLinkErrors(prev => ({
        ...prev,
        [field]: linkError
      }));
    }
  };

  const handleSave = async () => {
    // Check for validation errors
    const hasLinkErrors = Object.values(linkErrors).some(error => error !== '');
    if (hasLinkErrors) {
      setError('Please fix the URL errors before saving.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      console.log('Saving profile data:', profileData);

      const { error } = await supabase
        .from('profile')
        .update({
          name: profileData.name,
          bio: profileData.bio,
          major: profileData.major,
          year: profileData.year,
          github_link: profileData.github_link,
          instagram_link: profileData.instagram_link,
          linkedin_link: profileData.linkedin_link
        })
        .eq('id', userId);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setTimeout(() => {
        setSaving(false);
      }, 1500)
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const socialLinks = [
    {
      field: 'github_link' as keyof ProfileData,
      label: 'GitHub',
      icon: <Github className="w-5 h-5 text-gray-600" />,
      placeholder: 'https://github.com/yourusername',
      color: 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'
    },
    {
      field: 'instagram_link' as keyof ProfileData,
      label: 'Instagram',
      icon: <Instagram className="w-5 h-5 text-pink-500" />,
      placeholder: 'https://instagram.com/yourusername',
      color: 'border-pink-300 focus:ring-pink-500 focus:border-pink-500'
    },
    {
      field: 'linkedin_link' as keyof ProfileData,
      label: 'LinkedIn',
      icon: <Linkedin className="w-5 h-5 text-blue-600" />,
      placeholder: 'https://linkedin.com/in/yourusername',
      color: 'border-blue-300 focus:ring-blue-500 focus:border-blue-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={profileData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-2">
          Major
        </label>
        <input
          type="text"
          id="major"
          value={profileData.major}
          onChange={(e) => handleInputChange('major', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
          placeholder="e.g., Computer Science, Business Administration"
        />
      </div>

      <div>
        <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
          Academic Year
        </label>
        <select
          id="year"
          value={profileData.year}
          onChange={(e) => handleInputChange('year', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
        >
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
        </select>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          id="bio"
          value={profileData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
          placeholder="Tell us about yourself, your interests, or what you're studying..."
          maxLength={500}
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {profileData.bio.length}/500 characters
        </div>
      </div>

      {/* Social Links Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Social Links</h3>
        <div className="space-y-4">
          {socialLinks.map((link) => (
            <div key={link.field} className="space-y-2">
              <label htmlFor={link.field} className="block text-sm font-medium text-gray-700">
                {link.label}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {link.icon}
                </div>
                <input
                  type="url"
                  id={link.field}
                  value={profileData[link.field]}
                  onChange={(e) => handleInputChange(link.field, e.target.value)}
                  placeholder={link.placeholder}
                  className={`
                    w-full pl-12 pr-10 py-3 border rounded-lg transition-colors
                    ${linkErrors[link.field] 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : link.color
                    }
                  `}
                />
                {profileData[link.field] && !linkErrors[link.field] && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
              
              {linkErrors[link.field] && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{linkErrors[link.field]}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> Make sure your profiles are public if you want others to see them. You can leave any field empty if you don't want to share that social media.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600 text-sm">Profile updated successfully!</p>
        </div>
      )}

      <div className="flex justify-end space-x-4 pt-4">
        <button
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EditProfileForm;