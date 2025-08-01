'use client'
import React, { useEffect, useState, useActionState } from 'react'
import ModalScreen from '../components/ModalScreen'
import Link from 'next/link';
import { signUpUser } from '../utils/supabaseComponets/signupUser';
import { validateEmail, validateName, validatePassword, validateUsername } from '../utils/validation';
type ReactChangeEvent = React.ChangeEvent<HTMLInputElement>;

interface ValidationError {
  email?: string;
  password?: string;
  name?: string;
  username?: string;
}

const SignUpPage = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [clientErrors, setClientErrors] = useState<ValidationError>({});
  const [isPending, setIsPending] = useState<boolean>(false);

  const [state, formAction] = useActionState(signUpUser, {
    success: false, 
    message: '',
    errors: {}
  });

  useEffect(() => {
    if (state.success) {
      setEmail('');
      setPassword('');
      setName('');
      setUsername('');
      setClientErrors({});
    }
    setIsPending(false);
  }, [state])

  const handleEmailChange = (e: ReactChangeEvent) => {
    setEmail(e.target.value);
    setClientErrors(prev => ({...prev, email: validateEmail(e.target.value)}))
  };

  const handlePasswordChange = (e: ReactChangeEvent) => {
    setPassword(e.target.value);
    setClientErrors(prev => ({...prev, password: validatePassword(e.target.value)}))
  };

  const handleUsernameChange = (e: ReactChangeEvent) => {
    setUsername(e.target.value);
    setClientErrors(prev => ({...prev, username: validateUsername(e.target.value)}))
  }

  const handleNameChange = (e: ReactChangeEvent) => {
    setName(e.target.value);
    setClientErrors(prev => ({...prev, name: validateName(e.target.value)}))
  }

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    await formAction(formData);
  };

  const displayErrors = {
    email: clientErrors.email || state.errors?.email,
    password: clientErrors.password || state.errors?.password,
    name: clientErrors.name || state.errors?.name,
    username: clientErrors.username || state.errors?.username
  };

  return (
    <ModalScreen isOpen={true}>
      <div className='flex flex-col h-full text-black'>
            <div className='flex-shrink-0 pt-4 pb-2'>
              <h1 className='font-semibold text-center text-2xl'>Sign Up</h1>
            </div>

            <div className='flex-1 overflow-y-auto px-2 py-2 min-h-0'>
              <div className='max-h-[400px] overflow-y-auto'>
                <form action={handleSubmit} className='space-y-4'>
                  <div className='mb-4'>
                    <input 
                    name='email'
                    type='email'
                    placeholder='Email Address'
                    value={email}
                    className={`w-full p-2 border rounded-lg ${displayErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                    onChange={handleEmailChange}
                  />
                  {displayErrors.email && <p className='text-red-500 text-sm mt-1'>{displayErrors.email}</p>}
                  </div>

                  <div className='mb-4'>
                      <input
                        name='password'
                        type='password' 
                        placeholder='Password'
                        value={password}
                        className={`w-full p-2 border rounded-lg ${displayErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                        onChange={handlePasswordChange}
                      />
                      {displayErrors.password && <p className='text-red-500 text-sm mt-1'>{displayErrors.password}</p>}
                  </div>
                  
                  <div className='mb-4'>
                    <input 
                      name='name'
                      type='text'
                      placeholder='Full Name'
                      value={name}
                      className={`w-full p-2 border rounded-lg ${displayErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                      onChange={handleNameChange}
                    />
                    {displayErrors.name && <p className='text-red-500 text-sm mt-1'>{displayErrors.name}</p>}
                  </div>
                  
                  <div className='mb-4'>
                    <input 
                      name='username'
                      type='text'
                      placeholder='Username'
                      value={username}
                      className={`w-full p-2 border rounded-lg ${displayErrors.username ? 'border-red-500' : 'border-gray-300'}`}
                      onChange={handleUsernameChange}
                    />
                    {displayErrors.username && <p className='text-red-500 text-sm mt-1'>{displayErrors.username}</p>}
                  </div>

                  {state.message && (
                    <div className={`p-3 rounded-lg text-sm ${
                      state.success
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {state.message}
                    </div>
                  )}

                  <button 
                    type='submit'
                    disabled={isPending}
                    className={`w-full p-3 rounded-lg font-semibold ${
                      isPending 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                    >
                    {isPending ? 'Creating Account...' : 'Sign Up'}
                  </button>
                </form>
              </div>
            </div>

            <div className='mb-4'>
              <p className='text-center text-sm text-gray-500 mt-4'>
                Already have an account? 
                <Link href="/loginPage" className='text-purple-600 hover:underline ml-1'>
                  Log In
                </Link>
              </p>
            </div>
          </div>
    </ModalScreen>
  )
}

export default SignUpPage