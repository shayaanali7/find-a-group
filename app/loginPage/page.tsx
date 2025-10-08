'use client'
import ModalScreen from '../components/UI/Modals/ModalScreen'
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
                className={`w-full p-3 rounded-lg font-semibold ${
                  isPending 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {isPending ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <div className="mb-4 mt-15 p-3 bg-purple-50 border border-purple-300 rounded-lg shadow-sm flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-purple-400 rounded mr-2"></span>
              <div>
                <span className="font-semibold text-purple-700">Guest Login:</span>
                <span className="block text-sm text-purple-600">
                  Use <span className="font-mono bg-purple-100 px-1 rounded">groupfinderguest@gmail.com</span> and <span className="font-mono bg-purple-100 px-1 rounded">Groupfinderpass123$</span> to try the app as a guest.
                </span>
              </div>
            </div>
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