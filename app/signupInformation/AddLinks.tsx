import React, { useState } from 'react';
import { Github, Instagram, Linkedin, ExternalLink, AlertCircle, GithubIcon } from 'lucide-react';

interface AddLinksProps {
  setGithubLink: (link: string) => void;
  setInstagramLink: (link: string) => void;
  setLinkedinLink: (link: string) => void;
  githubLink: string;
  instagramLink: string;
  linkedinLink: string;
}

const AddLinks = ({ 
  setGithubLink, 
  setInstagramLink, 
  setLinkedinLink, 
  githubLink, 
  instagramLink, 
  linkedinLink 
}: AddLinksProps) => {
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateUrl = (url: string, platform: string): string => {
    if (!url.trim()) return '';
    
    try {
      const urlObj = new URL(url);
      
      switch (platform) {
        case 'github':
          if (!urlObj.hostname.includes('github.com')) {
            return 'Please enter a valid GitHub URL (e.g., https://github.com/username)';
          }
          break;
        case 'instagram':
          if (!urlObj.hostname.includes('instagram.com')) {
            return 'Please enter a valid Instagram URL (e.g., https://instagram.com/username)';
          }
          break;
        case 'linkedin':
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

  const handleInputChange = (value: string, platform: string, setter: (link: string) => void) => {
    setter(value);
    
    const error = validateUrl(value, platform);
    setErrors(prev => ({
      ...prev,
      [platform]: error
    }));
  };

  const socialLinks = [
    {
      platform: 'github',
      label: 'GitHub',
      icon: <GithubIcon className="w-8 h-8 text-black" />,
      placeholder: 'https://github.com/yourusername',
      value: githubLink,
      setter: setGithubLink,
      color: 'from-gray-700 to-gray-900',
      hoverColor: 'hover:from-gray-800 hover:to-black'
    },
    {
      platform: 'instagram',
      label: 'Instagram',
      icon: <Instagram className="w-8 h-8 text-black" />,
      placeholder: 'https://instagram.com/yourusername',
      value: instagramLink,
      setter: setInstagramLink,
      color: 'from-pink-500 to-purple-600',
      hoverColor: 'hover:from-pink-600 hover:to-purple-700'
    },
    {
      platform: 'linkedin',
      label: 'LinkedIn',
      icon: <Linkedin className="w-8 h-8 text-black" />,
      placeholder: 'https://linkedin.com/in/yourusername',
      value: linkedinLink,
      setter: setLinkedinLink,
      color: 'from-blue-600 to-blue-800',
      hoverColor: 'hover:from-blue-700 hover:to-blue-900'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {socialLinks.map((link) => (
          <div key={link.platform} className="space-y-2">
            <div className={`
              bg-gradient-to-r ${link.color} p-6 rounded-2xl 
              transition-all duration-300 transform hover:scale-[1.02] ${link.hoverColor}
              shadow-lg hover:shadow-xl
            `}>
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                  {link.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{link.label}</h3>
                  <p className="text-white text-opacity-80 text-sm">
                    Share your {link.label.toLowerCase()} profile
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <input
                  type="url"
                  value={link.value}
                  onChange={(e) => handleInputChange(e.target.value, link.platform, link.setter)}
                  placeholder={link.placeholder}
                  className={`
                    w-full px-4 py-3 rounded-xl bg-white bg-opacity-20 text-black placeholder-white placeholder-opacity-60
                    focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:bg-opacity-30
                    transition-all duration-300 backdrop-blur-sm
                    ${errors[link.platform] ? 'ring-2 ring-red-300' : ''}
                  `}
                />
                {link.value && !errors[link.platform] && (
                  <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white text-opacity-60" />
                )}
              </div>
            </div>
            
            {errors[link.platform] && (
              <div className="flex items-center space-x-2 text-red-600 text-sm ml-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errors[link.platform]}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mt-8">
        <h4 className="text-sm font-medium text-blue-800 mb-2">
          💡 Tips for adding links:
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Make sure your profiles are public if you want others to see them</li>
          <li>• Double-check your URLs to ensure they're correct</li>
          <li>• You can always update these links later in your profile settings</li>
        </ul>
      </div>
    </div>
  );
};

export default AddLinks;