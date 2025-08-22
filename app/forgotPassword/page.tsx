'use client'
import ModalScreen from '../components/ModalScreen'
import Link from 'next/link'
import { useForgotPassword } from './passwordHooks'

export default function ForgotPasswordPage() {
  const { forgotPassword, error, isPending, isSuccess } = useForgotPassword()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    forgotPassword(formData)
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
                  <h2 className="font-semibold mb-2">Check Your Email</h2>
                  <p className="text-sm">
                    We've sent a password reset link to your email address. 
                    Please check your inbox and follow the instructions to reset your password.
                  </p>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="mb-6">
                  <p className="text-sm text-gray-600 text-center">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                <div>
                  <input
                    name="email"
                    type="email"
                    placeholder='Email Address'
                    className='w-full p-2 border rounded-lg border-gray-300'
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
                  {isPending ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className='mb-4'>
          <p className='text-center text-sm text-gray-500 mt-4'>
            Remember your password?
            <Link href="/loginPage" className='text-purple-600 hover:underline ml-1'>
              Back to Login
            </Link>
          </p>

          <p className='text-center text-sm text-gray-500 mt-4'>
            Need To Create An Account?
            <Link href="/signupPage" className='text-purple-600 hover:underline ml-1'>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </ModalScreen>
  )
}