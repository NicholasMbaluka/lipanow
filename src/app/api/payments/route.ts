import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { mpesaService } from '@/lib/mpesa'

export async function POST(request: NextRequest) {
  try {
    const { businessId, amount, customerName } = await request.json()

    if (!businessId || !amount || amount < 1) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment details' },
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
        { success: false, message: 'Business not found' },
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
        status: 'pending',
      })
      .select()
      .single()

    if (transactionError) {
      return NextResponse.json(
        { success: false, message: 'Failed to create transaction' },
        { status: 500 }
      )
    }

    // For demo purposes, we'll simulate the M-Pesa payment
    // In production, you would call the real M-Pesa API here
    // const mpesaResponse = await mpesaService.initiateSTKPush({
    //   phoneNumber: business.phone, // Or customer phone if provided
    //   amount,
    //   businessId,
    //   customerName,
    // })

    // Simulate successful payment for demo
    setTimeout(async () => {
      await supabase
        .from('transactions')
        .update({
          status: 'confirmed',
          mpesa_receipt: `QEW7H2K1P9${Date.now()}`,
        })
        .eq('id', transaction.id)
    }, 3000)

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      message: 'Payment initiated successfully',
    })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
