import { Suspense } from 'react'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../utils/supabase/server'
import ModalScreen from '../components/ModalScreen'
import Link from 'next/link'

async function loginAction(formData: FormData) {
  'use server'
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  if (!data.email || !data.password) {
    redirect('/login?error=Please fill in all fields')
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Login error:', error)
    redirect('/login?error=Invalid credentials')
  }

  revalidatePath('/', 'layout')
  redirect('/mainPage')
}

export default async function LoginPage({ searchParams, }: { searchParams: { message?: string; error?: string }}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let returnMessage = '';
  
  if (user) redirect('/mainPage')
  return (
    <ModalScreen isOpen={true} opacity={1} backgroundColor='#7e22ce'>
      <div className='flex flex-col h-full text-black'>
        <div className='flex-shrink-0 pt-4 pb-2'>
          <h1 className='font-semibold text-center text-2xl'>Login</h1>
        </div>

        <div className='flex-1 overflow-y-auto px-2 py-2 min-h-0'>
          <div className='max-h-[400px] overflow-y-auto'>
              <form className="space-y-4" action={loginAction}>
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
                {returnMessage !== '' && (
                    <div className={`p-3 rounded-lg text-sm mb-1 ${
                      returnMessage.includes('successful') 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {returnMessage}
                    </div>
                  )}
                <button
                  type='submit'
                  className="w-full p-3 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Login
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