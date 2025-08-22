'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ModalScreen from '../components/ModalScreen'
import Link from 'next/link'
import { useResetPassword } from './useResetPassword'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const { resetPassword, error, isPending, isSuccess } = useResetPassword()
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)

  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (!accessToken || !refreshToken) {
      setIsValidToken(false)
      return
    }
    
    setIsValidToken(true)
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      return
    }

    resetPassword(formData)
  }

  if (isValidToken === null) {
    return (
      <ModalScreen isOpen={true}>
        <div className='flex flex-col h-full text-black items-center justify-center'>
          <div className="text-center">
            <p>Loading...</p>
          </div>
        </div>
      </ModalScreen>
    )
  }

  if (isValidToken === false) {
    return (
      <ModalScreen isOpen={true}>
        <div className='flex flex-col h-full text-black'>
          <div className='flex-shrink-0 pt-4 pb-2'>
            <h1 className='font-semibold text-center text-2xl'>Invalid Reset Link</h1>
          </div>
          
          <div className='flex-1 overflow-y-auto px-2 py-2 min-h-0 flex items-center justify-center'>
            <div className="text-center space-y-4">
              <div className="p-4 rounded-lg bg-red-100 text-red-800">
                <p>This password reset link is invalid or has expired.</p>
              </div>
              <p className="text-sm text-gray-600">
                Please request a new password reset link.
              </p>
            </div>
          </div>

          <div className='mb-4'>
            <p className='text-center text-sm text-gray-500 mt-4'>
              <Link href="/forgotPassword" className='text-purple-600 hover:underline'>
                Request New Reset Link
              </Link>
            </p>
            <p className='text-center text-sm text-gray-500 mt-4'>
              <Link href="/login" className='text-purple-600 hover:underline'>
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </ModalScreen>
    )
  }

  return (
    <ModalScreen isOpen={true}>
      <div className='flex flex-col h-full text-black'>
        <div className='flex-shrink-0 pt-4 pb-2'>
          <h1 className='font-semibold text-center text-2xl'>Reset Password</h1>
        </div>

        <div className='flex-1 overflow-y-auto px-2 py-2 min-h-0'>
          <div className='max-h-[400px] overflow-y-auto'>
            {isSuccess ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-100 text-green-800 text-center">
                  <h2 className="font-semibold mb-2">Password Updated!</h2>
                  <p className="text-sm">
                    Your password has been successfully updated. You can now log in with your new password.
                  </p>
                </div>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="mb-6">
                  <p className="text-sm text-gray-600 text-center">
                    Enter your new password below.
                  </p>
                </div>

                <div>
                  <input
                    name="password"
                    type="password"
                    placeholder='New Password'
                    className='w-full p-2 border rounded-lg border-gray-300'
                    minLength={6}
                    required
                  />
                </div>

                <div>
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder='Confirm New Password'
                    className='w-full p-2 border rounded-lg border-gray-300'
                    minLength={6}
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg text-sm mb-1 bg-red-100 text-red-700">
                    {error}
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
                  {isPending ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className='mb-4'>
          {isSuccess ? (
            <p className='text-center text-sm text-gray-500 mt-4'>
              <Link href="/login" className='text-purple-600 hover:underline'>
                Go to Login
              </Link>
            </p>
          ) : (
            <p className='text-center text-sm text-gray-500 mt-4'>
              Remember your password?
              <Link href="/loginPage" className='text-purple-600 hover:underline ml-1'>
                Back to Login
              </Link>
            </p>
          )}
        </div>
      </div>
    </ModalScreen>
  )
}

function LoadingFallback() {
  return (
    <ModalScreen isOpen={true}>
      <div className='flex flex-col h-full text-black items-center justify-center'>
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    </ModalScreen>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  )
}