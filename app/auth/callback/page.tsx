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
        console.log('Full URL:', window.location.href)
        console.log('Hash:', window.location.hash)
        console.log('Search:', window.location.search)

        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const searchParams = new URLSearchParams(window.location.search)
        const supabase = createClient();

        console.log('Hash params:', Object.fromEntries(hashParams))
        console.log('Search params:', Object.fromEntries(searchParams))

        const type = hashParams.get('type') || searchParams.get('type')
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token')
        const code = searchParams.get('code')
        const recovery = searchParams.get('recovery')
        
        console.log('Auth callback params:', { type, hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken, hasCode: !!code, recovery })

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

        const isPasswordRecovery = type === 'recovery' || 
                                 window.location.href.includes('type=recovery') ||
                                 window.location.hash.includes('type=recovery') ||
                                 recovery === 'true' ||
                                 (code && data.session && !type)

        console.log('Detected flow type:', isPasswordRecovery ? 'password recovery' : 'other')

        if (isPasswordRecovery) {
          console.log('Processing password recovery flow')
          setMessage('Email verified! Redirecting to password reset...')
          setTimeout(() => {
            setStatus('verified')
            setMessage('Redirecting to password reset...')
          }, 1500)

          setTimeout(() => {
            if (data.session) {
              const resetUrl = `/resetPassword?access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}`
              router.push(resetUrl)
            } else if (accessToken && refreshToken) {
              const resetUrl = `/resetPassword?access_token=${accessToken}&refresh_token=${refreshToken}`
              router.push(resetUrl)
            } else {
              router.push('/resetPassword')
            }
          }, 3000)
        } 
        else if (type === 'signup' || type === 'email_change' || 
                (code && data.session && !isPasswordRecovery) || 
                (!type && accessToken) ||
                (!type && data.session && !isPasswordRecovery)) {
          console.log('Processing signup/email change/general auth flow')
          setTimeout(() => {
            setStatus('verified')
            setMessage('Email verified successfully!')
          }, 1500)

          setTimeout(() => {
            router.push('/loginPage')
          }, 3000)
        } 
        else {
          console.log('No valid auth flow detected')
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