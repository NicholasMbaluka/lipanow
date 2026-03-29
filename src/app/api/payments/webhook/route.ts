import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // M-Pesa webhook structure (simplified)
    const {
      Body: {
        stkCallback: {
          MerchantRequestID,
          CheckoutRequestID,
          ResultCode,
          ResultDesc,
          Amount,
          MpesaReceiptNumber,
          PhoneNumber,
          TransactionDate
        }
      }
    } = body

    if (ResultCode === '0') {
      // Payment successful
      // Find transaction by checkout request ID
      const { data: transaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('checkout_request_id', CheckoutRequestID)
        .single()

      if (transaction) {
        // Update transaction as confirmed
        await supabase
          .from('transactions')
          .update({
            status: 'confirmed',
            mpesa_receipt: MpesaReceiptNumber,
          })
          .eq('id', transaction.id)

        console.log(`Payment confirmed: ${MpesaReceiptNumber} for transaction ${transaction.id}`)
      }
    } else {
      // Payment failed
      const { data: transaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('checkout_request_id', CheckoutRequestID)
        .single()

      if (transaction) {
        await supabase
          .from('transactions')
          .update({ status: 'failed' })
          .eq('id', transaction.id)

        console.log(`Payment failed: ${ResultDesc} for transaction ${transaction.id}`)
      }
    }

    return NextResponse.json({ ResultCode: '0' }) // Acknowledge receipt
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { ResultCode: '1' },
      { status: 500 }
    )
  }
}
