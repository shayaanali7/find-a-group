'use client'
import { useState } from 'react'
import { createClient } from '../utils/supabase/client'

export function useResetPassword() {
  const [error, setError] = useState<string>('')
  const [isPending, setIsPending] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const resetPassword = async (formData: FormData) => {
    const supabase = createClient();
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!password || !confirmPassword) {
      setError('Both password fields are required')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsPending(true)
    setError('')

    try {
      const { error: supabaseError } = await supabase.auth.updateUser({
        password: password
      })

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsPending(false)
    }
  }

  return {
    resetPassword,
    error,
    isPending,
    isSuccess,
  }
}