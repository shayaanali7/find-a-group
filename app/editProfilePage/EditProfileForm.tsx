'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Save, Loader2 } from 'lucide-react';

interface ProfileData {
  name: string;
  bio: string;
  major: string;
  year: string;
}

const EditProfileForm = ({ userId }: { userId: string }) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    bio: '',
    major: '',
    year: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profile')
          .select('name, bio, major, year')
          .eq('id', userId)
          .single();

        if (error) throw error;

        if (data) {
          setProfileData({
            name: data.name || '',
            bio: data.bio || '',
            major: data.major || '',
            year: data?.year.toString() || ''
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

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
    setSuccess(false);
  };

  const handleSave = async () => {
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
          year: profileData.year
        })
        .eq('id', userId);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

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