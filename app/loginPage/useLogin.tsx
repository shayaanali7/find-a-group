'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { loginAction } from './loginAction'

export function useLogin() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const login = async (formData: FormData) => {
    setError('')
    startTransition(async () => {
      const result = await loginAction(
        { message: '', success: false, redirectTo: '' },
        formData
      )
      
      if (result.success) {
        router.push(result.redirectTo)
      } else {
        setError(result.message)
      }
    })
  }

  return { login, error, isPending }
}