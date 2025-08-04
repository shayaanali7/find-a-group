'use server'
import { supabase } from "@/lib/supabase";

export interface ValidationError {
  email?: string;
  password?: string;
  name?: string;
  username?: string;
}

export interface SignUpResult {
  success: boolean;
  message: string;
  errors?: ValidationError;
}

interface SupabaseAuthError extends Error {
  code?: string
}

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

const validateForm = (email: string, password: string, name: string, username: string): ValidationError => {
  return {
    email: validateEmail(email),
    password: validatePassword(password),
    name: validateName(name),
    username: validateUsername(username)
  };
};

export async function signUpUser(prevState: SignUpResult, formData: FormData): Promise<SignUpResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const username = formData.get('username') as string;

  if (!email || !password || !name || !username) {
    return {
      success: false,
      message: 'All fields are required',
      errors: {}
    };
  }

  const validationErrors = validateForm(email, password, name, username);
  const hasErrors = Object.values(validationErrors).some(error => error !== undefined);

  if (hasErrors) {
    return {
      success: false,
      message: 'Please fix the validation errors',
      errors: validationErrors
    };
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          name: name,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=signupInformation`,
      }
      
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    return {
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.'
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes('User already registered')) {
        return {
          success: false,
          message: 'Email already exists. Please try a different value.',
        };
      }

      const supabaseError = error as SupabaseAuthError;
      if (
        supabaseError.code === 'unexpected_failure' &&
        error.message.includes('Database error saving new user')
      ) {
        return {
          success: false,
          message: 'Username already exists. Please try a different value.',
        };
      }

      return {
        success: false,
        message: error.message || 'An error occurred during signup. Please try again.',
      };
    }

    return {
      success: false,
      message: 'An unknown error occurred during signup.',
    };
  }  
}