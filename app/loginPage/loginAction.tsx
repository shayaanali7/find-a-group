'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/app/utils/supabase/server'
import getUserServer from '@/app/utils/supabaseComponets/getUserServer'
import { firstTimeLogin } from '@/app/utils/supabaseComponets/firstTimeLogin'

export async function loginAction(
  _prevState: { message: string; success: boolean; redirectTo: string },
  formData: FormData
): Promise<{ message: string; success: boolean; redirectTo: string }> {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { message: 'Missing Credentials!', success: false, redirectTo: '' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error('Login error:', error)
    return { message: 'Invalid Email or password.', success: false, redirectTo: '' }
  }

  revalidatePath('/', 'layout')

  try {
    const user = await getUserServer()
    const hasLoggedInBefore = await firstTimeLogin(user)

    const redirectTo = hasLoggedInBefore.done_signup ? '/mainPage' : '/signupInformation'
    
    return { 
      message: 'Login successful!', 
      success: true, 
      redirectTo 
    }
  } catch (err) {
    console.log(err)
    return { message: 'Something went wrong. Please try again.', success: false, redirectTo: '' }
  }
}