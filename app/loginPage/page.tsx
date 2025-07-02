'use client'
import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import ModalScreen from '../components/ModalScreen'
import Link from 'next/link';

const LoginPage = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        throw authError;
      }
      if (!authData.user) {
        throw new Error('Login failed');
      }
      setSubmitMessage('Login successful! Redirecting...');
      setEmail('');
      setPassword('');
    
    }
    catch (error: any) {
      setSubmitMessage(error.message || 'An error occurred during login. Please try again.');
    }
  }

  return (
    <ModalScreen isOpen={true} opacity={1} backgroundColor='#7e22ce'>
      <div className='flex flex-col h-full text-black'>
            <div className='flex-shrink-0 pt-4 pb-2'>
              <h1 className='font-semibold text-center text-2xl'>Login</h1>
            </div>

            <div className='flex-1 overflow-y-auto px-2 py-2 min-h-0'>
              <div className='max-h-[400px] overflow-y-auto'>
                <form onSubmit={handleSubmit}>
                  <div className='mb-4'>
                    <input 
                      placeholder='Email Address'
                      className='w-full p-2 border rounded-lg border-gray-300'
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className='mb-4'>
                    <input 
                      placeholder='Password'
                      className='w-full p-2 border rounded-lg border-gray-300'
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {submitMessage && (
                    <div className={`p-3 rounded-lg text-sm mb-1 ${
                      submitMessage.includes('successful') 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {submitMessage}
                    </div>
                  )}

                  <button
                    type='submit'
                    disabled={isLoading}
                    className={`w-full p-3 rounded-lg font-semibold ${
                      isLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                    >
                    {isLoading ? 'Logging In...' : 'Login'}
                  </button>
                </form>
              </div>
            </div>

            <div className='mb-4'>
              <p className='text-center text-sm text-gray-500 mt-4'>
                Forgot Password?
                <Link href="/forgotPassword" className='text-purple-600 hover:underline ml-1'>
                  Reset Password
                </Link>
              </p>

              <p className='text-center text-sm text-gray-500 mt-4'>
                Need To Create An Account? 
                <Link href="/signupPage" className='text-purple-600 hover:underline ml-1'>
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
    </ModalScreen>
  )
}

export default LoginPage