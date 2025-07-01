'use client'
import React, { useState} from 'react'
import ModalScreen from '../components/ModalScreen'
import Link from 'next/link';
type ReactChangeEvent = React.ChangeEvent<HTMLInputElement>;

interface ValidationError {
  email?: string;
  password?: string;
  name?: string;
  username?: string;
}

const signUpPage = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [errors, setErrors] = useState<ValidationError>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  }

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) return 'Password must contain both uppercase and lowercase letters';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    return undefined;
  };

  const validateUsername = (username: string): string | undefined => {
    if (!username.trim()) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
    if (/^[0-9]/.test(username)) return 'Username cannot start with a number';
    return undefined;
  };

  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return 'Full name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return 'Name can only contain letters and spaces';
    return undefined;
  };

  const validateForm = () => {
    const newErros: ValidationError = {
      email: validateEmail(email),
      password: validatePassword(password),
      name: validateName(name),
      username: validateUsername(username)
    };
    setErrors(newErros);

    return !Object.values(newErros).some(error => error !== undefined);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Add your Supabase signup logic here
      console.log('Valid form data:', { email, password, name, username });
      
      // Example Supabase call:
      // const { data: authData, error: authError } = await supabase.auth.signUp({
      //   email,
      //   password
      // });
      
      // if (authError) throw authError;
      
      // const { error: profileError } = await supabase
      //   .from('profiles')
      //   .insert([{
      //     id: authData.user?.id,
      //     full_name: name,
      //     username,
      //   }]);
      
      // if (profileError) throw profileError;
      
    } catch (error) {
      console.error('Signup error:', error);
      // Handle signup errors here
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: ReactChangeEvent) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({...prev, email: validateEmail(e.target.value)}))
    }
  };

  const handlePasswordChange = (e: ReactChangeEvent) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors(prev => ({...prev, password: validatePassword(e.target.value)}))
    }
  };

  const handleUsernameChange = (e: ReactChangeEvent) => {
    setUsername(e.target.value);
    if (errors.username) {
      setErrors(prev => ({...prev, username: validateUsername(e.target.value)}))
    }
  }

  const handleNameChange = (e: ReactChangeEvent) => {
    setName(e.target.value);
    if (errors.name) {
      setErrors(prev => ({...prev, name: validateName(e.target.value)}))
    }
  }


  return (
    <ModalScreen isOpen={true} opacity={1} backgroundColor='#7e22ce'>
      <div className='flex flex-col h-full text-black'>
            <div className='flex-shrink-0 pt-4 pb-2'>
              <h1 className='font-semibold text-center text-2xl'>Sign Up</h1>
            </div>

            <div className='flex-1 overflow-y-auto px-2 py-2 min-h-0'>
              <div className='max-h-[400px] overflow-y-auto'>
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div className='mb-4'>
                    <input 
                    type='email'
                    placeholder='Email Address'
                    value={email}
                    className={`w-full p-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    onChange={handleEmailChange}
                  />
                  {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email}</p>}
                  </div>

                  <div className='mb-4'>
                      <input
                        type='password' 
                        placeholder='Password'
                        value={password}
                        className={`w-full p-2 border rounded-lg ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                        onChange={handlePasswordChange}
                      />
                      {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password}</p>}
                  </div>
                  
                  <div className='mb-4'>
                    <input 
                      type='text'
                      placeholder='Full Name'
                      value={name}
                      className={`w-full p-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                      onChange={handleNameChange}
                    />
                    {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name}</p>}
                  </div>
                  
                  <div className='mb-4'>
                    <input 
                      type='text'
                      placeholder='Username'
                      value={username}
                      className={`w-full p-2 border rounded-lg ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                      onChange={handleUsernameChange}
                    />
                    {errors.username && <p className='text-red-500 text-sm mt-1'>{errors.username}</p>}
                  </div>

                  <button 
                    type='submit'
                    disabled={isLoading}
                    className={`w-full p-3 rounded-lg font-semibold ${
                      isLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                    >
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                  </button>
                </form>
              </div>
            </div>

            <div>
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

export default signUpPage