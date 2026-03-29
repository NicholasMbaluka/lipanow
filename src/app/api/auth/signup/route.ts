import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Business } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { email, password, businessName, phone, businessType, tillNumber } = await request.json()

    // Validate input
    if (!email || !password || !businessName || !phone || !tillNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create user account
    const { data: { user }, error: userError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 400 }
      )
    }

    // Create business record
    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const { error: businessError } = await supabase
      .from('businesses')
      .insert({
        user_id: user.id,
        name: businessName,
        slug,
        phone,
        business_type: businessType,
        till_number: tillNumber,
        plan: 'free',
      })

    if (businessError) {
      return NextResponse.json(
        { error: 'Failed to create business' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: { id: user.id, email },
      business: { name: businessName, slug }
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
