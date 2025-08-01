'use client'
import ModalScreen from '../components/ModalScreen'
import Link from 'next/link'
import { useLogin } from './useLogin'

export default function LoginPage() {
  const { login, error, isPending } = useLogin()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    login(formData)
  }

  return (
    <ModalScreen isOpen={true}>
      <div className='flex flex-col h-full text-black'>
        <div className='flex-shrink-0 pt-4 pb-2'>
          <h1 className='font-semibold text-center text-2xl'>Login</h1>
        </div>

        <div className='flex-1 overflow-y-auto px-2 py-2 min-h-0'>
          <div className='max-h-[400px] overflow-y-auto'>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <input
                  name="email"
                  type="email"
                  placeholder='Email Address'
                  className='w-full p-2 border rounded-lg border-gray-300'
                  required
                />
              </div>

              <div>
                <input
                  name="password"
                  type="password"
                  placeholder='Password'
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
                className="w-full p-3 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white"
              >
                {isPending ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>

        <div className='mb-4'>
          <p className='text-center text-sm text-gray-500 mt-4'>
            Forgot Password?
            <Link href="/forgotPassword" className='text-purple-600 hover:underline ml-1'>
              Reset Password
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
