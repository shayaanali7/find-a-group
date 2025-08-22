'use client'
import { useState } from 'react'
import { createClient } from '../utils/supabase/client'

export function useForgotPassword() {
  const [error, setError] = useState<string>('')
  const [isPending, setIsPending] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const forgotPassword = async (formData: FormData) => {
    const supabase = await createClient();
    const email = formData.get('email') as string

    if (!email) {
      setError('Email is required')
      return
    }

    setIsPending(true)
    setError('')

    try {
      const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
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
    forgotPassword,
    error,
    isPending,
    isSuccess,
  }
}