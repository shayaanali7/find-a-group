'use client'
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react'

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    setTimeout(() => {
      setStatus('verified')
    }, 1500) 

    setTimeout(() => {
      router.push('/loginPage');
    }, 3000)
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {status === 'verifying' && (
          <p className="text-lg">Verifying your email...</p>
        )}
        {status === 'verified' && (
          <div>
            <p className="text-lg text-green-600 font-semibold">Email verified successfully!</p>
            <p className="text-sm text-gray-600 mt-2">Redirecting...</p>
          </div>
        )}
        {status === 'error' && (
          <div>
            <p className="text-lg text-red-600 font-semibold">Verification failed</p>
            <p className="text-sm text-gray-600 mt-2">Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  )
}