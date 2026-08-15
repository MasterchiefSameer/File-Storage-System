'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  // Fallback if name is not provided
  const fullName = name || email.split('@')[0]

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  
  // URL to redirect back to after google auth
  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    },
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  if (data?.url) {
    redirect(data.url) // use the redirect API for your server framework
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function deleteAccount() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 1. Fetch user's files to clean up storage objects
  const { data: files } = await supabase
    .from('files')
    .select('storage_path')
    .eq('user_id', user.id)

  if (files && files.length > 0) {
    const paths = files.map((f) => f.storage_path)
    // Remove files from storage bucket
    await supabase.storage.from('uploads').remove(paths)
  }

  // 2. Delete database records from public.files table
  await supabase
    .from('files')
    .delete()
    .eq('user_id', user.id)

  // 3. Delete auth user record if service role key is present
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createClient: createAdminClient } = await import('@supabase/supabase-js')
      const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
      await adminSupabase.auth.admin.deleteUser(user.id)
    } catch (e) {
      console.error('Error deleting user from auth:', e)
    }
  }

  // 4. Sign out
  await supabase.auth.signOut()
  redirect('/login?message=' + encodeURIComponent('Your account and all associated files have been permanently deleted.'))
}
