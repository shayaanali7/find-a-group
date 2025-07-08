'use client'
import React, { use, useState } from 'react'
import AddCoursesButtons from '../components/AddCoursesButtons';
import { createClient } from '../utils/supabase/client';
import { steps } from '../data/signupContent'
import ProfileInformation from './ProfileInformation';

const MultiStepSignup = ({ user }: {user: any}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [courseHasBeenAdded, setCourseHasBeenAdded] = useState<boolean[]>([false, false, false, false, false]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [showSkipButton, setShowSkipButton] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const courses = ['CS2212', 'CS3319', 'CS2214', 'CS1027', 'CS1026'];

  const changeStatus = (index: number) => {
    setCourseHasBeenAdded(prev => 
      prev.map((status, i) => i === index ? !status : status)
    );
  }

  const handleContinue = async () => {
    setIsLoading(true);
    setShowSkipButton(true);
    const coursesToAdd: string[] = courses.filter((_, index) => courseHasBeenAdded[index]);
    if (currentStep === 0 && coursesToAdd.length !== 0) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('users_courses')
        .update({ courses: coursesToAdd })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error saving courses:', error);
      }
    }
    else {
      setShowError(true);
      setIsLoading(false);
      return;
    }
    
    setTimeout(() => {
      setIsLoading(false);
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        console.log('Signup complete!');
      }
    }, 1000);
  }

  const handleSkip = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep(currentStep + 1);
    }, 1000);
    
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <AddCoursesButtons 
            courses={courses}
            courseHasBeenAdded={courseHasBeenAdded}
            changeStatus={changeStatus}
            showError={showError}
          />
        );
      case 1:
        return (
          <ProfileInformation setSelectedYear={setSelectedYear} selectedYear={selectedYear} />
        );
      case 2:
        return (
          <div></div>
        );
      default:
        return null;
    }
  }

  return (
    <div className='h-full flex flex-col'>
      <div className='bg-gradient-to-r from-purple-50 to-indigo-50 p-8 border-b border-purple-100'>
        <div className='transition-all duration-500 ease-out'>
          <h1 className='text-4xl font-bold mb-3 text-gray-800'>
            {steps[currentStep].title}
          </h1>
          <p className='text-lg text-gray-600'>
            {steps[currentStep].subtitle}
          </p>
        </div>
      </div>

      <div className='flex-1 p-8 flex flex-col'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-6'>
          {steps[currentStep].content}
        </h2>
        
        <div className='flex-1 flex flex-col'>
          {renderStepContent()}
        </div>
      </div>

      <div className='p-8 border-t border-gray-100'>
        <div className='flex justify-between items-center'>
          <div className='flex space-x-2'>
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-purple-500 scale-125'
                    : index < currentStep
                    ? 'bg-purple-300'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className='flex flex-row gap-4'>
            {showSkipButton && (
              <button
                className='bg-black font-semibold transition-all duration-300 transform hover:scale-105 px-10 p-4 rounded-2xl'
                onClick={handleSkip}>Skip
              </button>
            )}
            <button 
              className={`
                group relative px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-105 
                ${isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                }
                active:scale-95
              `}
              onClick={handleContinue}
              disabled={isLoading}
            >
              <span className={`flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                {currentStep === steps.length - 1 ? 'Complete' : 'Continue'}
                <svg className='w-5 h-5 transition-transform duration-300 group-hover:translate-x-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
                </svg>
              </span>
              
              {isLoading && (
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                </div>
              )}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  )
}

export default MultiStepSignup