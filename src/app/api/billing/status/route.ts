import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const billingId = searchParams.get('billingId')

    if (!billingId) {
      return NextResponse.json(
        { error: 'Billing ID required' },
        { status: 400 }
      )
    }

    const { data: billing, error } = await supabase
      .from('billing_requests')
      .select('*')
      .eq('id', billingId)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Billing request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      billing: {
        id: billing.id,
        status: billing.status,
        amount: billing.amount / 100, // Convert to KES
        billing_period_start: billing.billing_period_start,
        billing_period_end: billing.billing_period_end,
        mpesa_receipt: billing.mpesa_receipt,
        created_at: billing.created_at
      }
    })
  } catch (error) {
    console.error('Billing status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
