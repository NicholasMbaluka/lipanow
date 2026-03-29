'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Business } from '@/types'

export default function PaymentPage() {
  const params = useParams()
  const slug = params.slug as string
  const [success, setSuccess] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [business, setBusiness] = useState<Business | null>(null)
  const [amount, setAmount] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchBusiness()
  }, [slug])

  const fetchBusiness = async () => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Error fetching business:', error)
      return
    }

    setBusiness(data)
  }

  const handleNumpad = (key: string) => {
    if (key === 'clear') {
      setAmount('')
    } else if (key === 'back') {
      setAmount(prev => prev.slice(0, -1))
    } else if (amount.length < 6) {
      setAmount(prev => prev + key)
    }
  }

  const startPayment = async () => {
    if (!amount || parseInt(amount) < 1 || !business) return

    setLoading(true)
    setPaymentStatus('processing')
    setErrorMessage('')

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: business.id,
          amount: parseInt(amount),
          customerName: customerName || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setTransactionId(data.transactionId)
        setSuccess(true)
        // Start polling for payment status
        pollPaymentStatus(data.transactionId)
      } else {
        setError(data.error || 'Payment initiation failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const pollPaymentStatus = async (txId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payments/status?transactionId=${txId}`)
        const data = await response.json()
        
        if (data.success && data.transaction.status === 'confirmed') {
          setSuccess(true)
          setError('')
        } else if (data.transaction.status === 'failed') {
          setError('Payment failed. Please try again.')
          setSuccess(false)
        }
      } catch (error) {
        console.error('Failed to check payment status:', error)
      }
    }

    // Check status every 3 seconds for up to 2 minutes
    let attempts = 0
    const interval = setInterval(() => {
      checkStatus()
      attempts++
      if (attempts >= 40) { // 40 * 3 seconds = 2 minutes
        clearInterval(interval)
        setError('Payment timed out. Please check your M-Pesa messages.')
      }
    }, 3000)
  }

  const handleNumberClick = (num: string) => {
    if (num === 'clear') {
      setAmount('')
    } else if (num === 'backspace') {
      setAmount(prev => prev.slice(0, -1))
    } else {
      setAmount(prev => prev + num)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment page...</p>
        </div>
      </div>
    )
  }

  if (!business && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Business Not Found</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {business?.logo_url ? (
                <img src={business.logo_url} alt={business.name} className="h-8 w-8 rounded-full object-cover mr-3" />
              ) : (
                <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">
                    {business?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <h1 className="text-xl font-bold text-gray-900">{business?.name}</h1>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              {business?.business_type && <span className="mr-4">{business.business_type}</span>}
              <span>Powered by LipaNow</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Make Payment</h2>
            
            {!success ? (
              <>
                <div className="space-y-6">
                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (KES)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={amount}
                        readOnly
                        placeholder="0.00"
                        className="w-full text-3xl font-bold text-center py-4 px-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        KES
                      </span>
                    </div>
                  </div>

                  {/* Number Pad */}
                  <div className="grid grid-cols-3 gap-2">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleNumberClick(num)}
                        className="py-4 px-4 text-lg font-medium bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        {num === 'backspace' ? '⌫' : num}
                      </button>
                    ))}
                  </div>

                  {/* Customer Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+254 7XX XXX XXX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  )}

                  <button
                    onClick={handlePayment}
                    disabled={processing || !amount || parseFloat(amount) < 1 || !customerPhone}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Pay with M-Pesa'
                    )}
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 You'll receive an M-Pesa prompt on your phone to complete the payment
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Initiated!</h3>
                <p className="text-gray-600 mb-6">
                  Check your phone for the M-Pesa prompt and enter your PIN to complete the payment.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    <strong>Business:</strong> {business?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Amount:</strong> KES {amount}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Phone:</strong> {customerPhone}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Business Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  {business?.logo_url ? (
                    <img src={business.logo_url} alt={business.name} className="h-12 w-12 rounded-full object-cover mr-4" />
                  ) : (
                    <div className="h-12 w-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold">
                        {business?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{business?.name}</h4>
                    {business?.business_type && (
                      <p className="text-sm text-gray-500">{business.business_type}</p>
                    )}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Payment Details</p>
                  <p className="text-sm text-gray-900">
                    <strong>M-Pesa Till:</strong> {business?.till_number}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Secure Payment</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414-1.414l8 8a1 1 0 001.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">M-Pesa secure payment</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414-1.414l8 8a1 1 0 001.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">Instant confirmation</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414-1.414l8 8a1 1 0 001.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">Receipt provided</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-lg font-medium mb-2">About LipaNow</h3>
              <p className="text-sm opacity-90">
                Secure M-Pesa payment processing for Kenyan businesses. Fast, reliable, and trusted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
