'use client'
import { createClient } from '@/app/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const searchParams = new URLSearchParams(window.location.search)
        const supabase = createClient();

        const type = hashParams.get('type') || searchParams.get('type')
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token')
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
        } else {
          console.log('Current session:', data.session ? 'Present' : 'None')
        }

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (sessionError) {
            console.error('Error setting session:', sessionError)
            setStatus('error')
            setMessage('Verification failed')
            setTimeout(() => {
              router.push('/loginPage')
            }, 3000)
            return
          }
        }

        if (type === 'recovery') {
          setMessage('Email verified! Redirecting to password reset...')
          setTimeout(() => {
            setStatus('verified')
            setMessage('Redirecting to password reset...')
          }, 1500)

          setTimeout(() => {
            router.push('/resetPassword')
          }, 3000)
        } else if (type === 'signup' || type === 'email_change' || (!type && (accessToken || data.session))) {
          setTimeout(() => {
            setStatus('verified')
            setMessage('Email verified successfully!')
          }, 1500)

          setTimeout(() => {
            router.push('/loginPage')
          }, 3000)
        } else {
          console.log('No valid auth tokens found')
          setStatus('error')
          setMessage('Invalid or expired link')
          setTimeout(() => {
            router.push('/loginPage')
          }, 3000)
        }

      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage('Verification failed')
        setTimeout(() => {
          router.push('/loginPage')
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {status === 'verifying' && (
          <div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-lg">{message}</p>
          </div>
        )}
        {status === 'verified' && (
          <div>
            <div className="text-green-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-lg text-green-600 font-semibold">{message}</p>
            <p className="text-sm text-gray-600 mt-2">Redirecting...</p>
          </div>
        )}
        {status === 'error' && (
          <div>
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-lg text-red-600 font-semibold">{message}</p>
            <p className="text-sm text-gray-600 mt-2">Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  )
}