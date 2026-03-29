import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Business } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Get business info
    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user!.id)
      .single()

    return NextResponse.json({
      success: true,
      user: { id: user!.id, email: user!.email },
      business,
      session
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
