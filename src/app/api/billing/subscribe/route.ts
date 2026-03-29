import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { mpesaService } from '@/lib/mpesa'

export async function POST(request: NextRequest) {
  try {
    const { businessId } = await request.json()

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID required' },
        { status: 400 }
      )
    }

    // Get business details
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Check if already has active billing
    const { data: existingBilling } = await supabase
      .from('billing_requests')
      .select('*')
      .eq('business_id', businessId)
      .eq('status', 'paid')
      .gte('billing_period_end', new Date().toISOString())
      .single()

    if (existingBilling) {
      return NextResponse.json(
        { error: 'Already have active billing' },
        { status: 400 }
      )
    }

    // Create billing request
    const billingPeriodStart = new Date()
    const billingPeriodEnd = new Date()
    billingPeriodEnd.setMonth(billingPeriodEnd.getMonth() + 1)

    const { data: billing, error: billingError } = await supabase
      .from('billing_requests')
      .insert({
        business_id: businessId,
        amount: 79900, // KES 799 in cents
        status: 'pending',
        billing_period_start: billingPeriodStart.toISOString(),
        billing_period_end: billingPeriodEnd.toISOString(),
      })
      .select()
      .single()

    if (billingError) {
      return NextResponse.json(
        { error: 'Failed to create billing request' },
        { status: 500 }
      )
    }

    // Initiate M-Pesa payment for billing
    const mpesaResponse = await mpesaService.initiateSTKPush({
      phoneNumber: business.phone,
      amount: 799,
      businessId: 'lipanow-billing', // Special business ID for billing
      customerName: business.name,
    })

    if (!mpesaResponse.success) {
      // Update billing as failed
      await supabase
        .from('billing_requests')
        .update({ status: 'failed' })
        .eq('id', billing.id)

      return NextResponse.json(
        { error: mpesaResponse.message || 'Billing payment initiation failed' },
        { status: 500 }
      )
    }

    // Update billing with checkout request ID
    await supabase
      .from('billing_requests')
      .update({ 
        checkout_request_id: mpesaResponse.checkoutRequestID 
      })
      .eq('id', billing.id)

    return NextResponse.json({
      success: true,
      billingId: billing.id,
      checkoutRequestId: mpesaResponse.checkoutRequestID,
      message: 'Billing payment initiated. Please check your phone for M-Pesa prompt.'
    })
  } catch (error) {
    console.error('Billing subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
