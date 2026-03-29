import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get business details
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single()

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Get business transactions
    const { data: transactions, error: transactionError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('business_id', id)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(10)

    // Get billing history
    const { data: billingHistory, error: billingError } = await supabaseAdmin
      .from('billing_requests')
      .select('*')
      .eq('business_id', id)
      .order('created_at', { ascending: false })
      .limit(5)

    // Calculate metrics
    const totalEarnings = (transactions || []).reduce((sum, t) => sum + t.amount, 0) / 100
    const totalTransactions = transactions?.length || 0
    const avgPayment = totalTransactions > 0 ? totalEarnings / totalTransactions : 0

    return NextResponse.json({
      success: true,
      business: {
        ...business,
        totalEarnings,
        totalTransactions,
        avgPayment,
        recentTransactions: (transactions || []).map(t => ({
          id: t.id,
          amount: t.amount / 100,
          customer_name: t.customer_name,
          customer_phone: t.customer_phone,
          mpesa_receipt: t.mpesa_receipt,
          created_at: t.created_at
        })),
        billingHistory: (billingHistory || []).map(b => ({
          id: b.id,
          amount: b.amount / 100,
          status: b.status,
          billing_period_start: b.billing_period_start,
          billing_period_end: b.billing_period_end,
          mpesa_receipt: b.mpesa_receipt,
          created_at: b.created_at
        }))
      }
    })
  } catch (error) {
    console.error('Admin business detail error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { plan } = await request.json()

    if (!plan || !['free', 'pro'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('businesses')
      .update({ plan })
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update business' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Business updated to ${plan} plan`
    })
  } catch (error) {
    console.error('Admin business update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
