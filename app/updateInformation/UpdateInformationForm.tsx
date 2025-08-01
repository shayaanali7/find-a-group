'use client'
import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Save, X } from 'lucide-react';

interface FormData {
  username: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ShowPasswords {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

interface UpdateFields {
  username: boolean;
  email: boolean;
  password: boolean;
}

interface Errors {
  [key: string]: string;
}

const UpdateUserInformationForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState<ShowPasswords>({
    current: false,
    new: false,
    confirm: false
  });

  const [updateFields, setUpdateFields] = useState<UpdateFields>({
    username: false,
    email: false,
    password: false
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFieldToggle = (field: keyof UpdateFields): void => {
    setUpdateFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));

    if (updateFields[field]) {
      if (field === 'username') {
        setFormData(prev => ({ ...prev, username: '' }));
      } else if (field === 'email') {
        setFormData(prev => ({ ...prev, email: '' }));
      } else if (field === 'password') {
        setFormData(prev => ({ 
          ...prev, 
          currentPassword: '', 
          newPassword: '', 
          confirmPassword: '' 
        }));
      }
    }
  };

  const togglePasswordVisibility = (field: keyof ShowPasswords): void => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (updateFields.username && !formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (updateFields.username && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (updateFields.email && !formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (updateFields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (updateFields.password) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    if (!updateFields.username && !updateFields.email && !updateFields.password) {
      newErrors.general = 'Please select at least one field to update';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    setSuccessMessage('');
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Updating user information:', {
        username: updateFields.username ? formData.username : null,
        email: updateFields.email ? formData.email : null,
        password: updateFields.password ? { 
          current: formData.currentPassword, 
          new: formData.newPassword 
        } : null
      });

      setSuccessMessage('User information updated successfully!');
      setFormData({
        username: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setUpdateFields({
        username: false,
        email: false,
        password: false
      });

    } catch (error) {
      setErrors({ general: 'Failed to update user information. Please try again.' });
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (): void => {
    setFormData({
      username: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setUpdateFields({
      username: false,
      email: false,
      password: false
    });
    setErrors({});
    setSuccessMessage('');
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 min-h-0">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Update Your Profile</h1>
          <p className="text-gray-600">Choose which information you&apos;d like to update</p>
        </div>
        
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {errors.general}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {successMessage}
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={updateFields.username}
                onChange={() => handleFieldToggle('username')}
                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <User className="w-6 h-6 text-purple-600" />
              <div>
                <span className="text-lg font-medium text-gray-800">Update Username</span>
                <p className="text-sm text-gray-600">Change your display name</p>
              </div>
            </label>
            
            {updateFields.username && (
              <div className="mt-4">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter new username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                />
                {errors.username && (
                  <p className="mt-2 text-sm text-red-600">{errors.username}</p>
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={updateFields.email}
                onChange={() => handleFieldToggle('email')}
                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <Mail className="w-6 h-6 text-purple-600" />
              <div>
                <span className="text-lg font-medium text-gray-800">Update Email</span>
                <p className="text-sm text-gray-600">Change your email address</p>
              </div>
            </label>
            
            {updateFields.email && (
              <div className="mt-4">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter new email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={updateFields.password}
                onChange={() => handleFieldToggle('password')}
                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <Lock className="w-6 h-6 text-purple-600" />
              <div>
                <span className="text-lg font-medium text-gray-800">Update Password</span>
                <p className="text-sm text-gray-600">Change your password for security</p>
              </div>
            </label>
            
            {updateFields.password && (
              <div className="mt-4 space-y-4">
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {errors.currentPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.currentPassword}</p>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {errors.newPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-purple-600 text-white py-4 px-6 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 text-lg font-medium transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Update Profile</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleCancel}
              className="px-6 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center space-x-3 text-lg font-medium transition-colors"
            >
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateUserInformationForm;