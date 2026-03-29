import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { mpesaService } from '@/lib/mpesa'

export async function POST(request: NextRequest) {
  try {
    const { businessId, amount, customerPhone, customerName } = await request.json()

    if (!businessId || !amount || amount < 1) {
      return NextResponse.json(
        { error: 'Invalid payment details' },
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

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        business_id: businessId,
        amount: amount * 100, // Convert to cents
        customer_name: customerName,
        customer_phone: customerPhone,
        status: 'pending',
      })
      .select()
      .single()

    if (transactionError) {
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      )
    }

    // Initiate M-Pesa STK push
    const mpesaResponse = await mpesaService.initiateSTKPush({
      phoneNumber: customerPhone || business.phone,
      amount,
      businessId,
      customerName,
    })

    if (!mpesaResponse.success) {
      // Update transaction as failed
      await supabase
        .from('transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id)

      return NextResponse.json(
        { error: mpesaResponse.message || 'Payment initiation failed' },
        { status: 500 }
      )
    }

    // Update transaction with checkout request ID
    await supabase
      .from('transactions')
      .update({ 
        checkout_request_id: mpesaResponse.checkoutRequestID 
      })
      .eq('id', transaction.id)

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      checkoutRequestId: mpesaResponse.checkoutRequestID,
      message: 'Payment initiated. Please check your phone for M-Pesa prompt.'
    })
  } catch (error) {
    console.error('Payment initiation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
