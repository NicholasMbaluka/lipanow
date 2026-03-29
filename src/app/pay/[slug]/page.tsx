'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Business } from '@/types'

export default function PaymentPage() {
  const params = useParams()
  const slug = params.slug as string
  const [business, setBusiness] = useState<Business | null>(null)
  const [amount, setAmount] = useState('')
  const [customerName, setCustomerName] = useState('')
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
        // Simulate payment processing
        setTimeout(() => {
          setPaymentStatus('success')
        }, 3000)
      } else {
        setPaymentStatus('error')
        setErrorMessage(data.message || 'Payment failed')
      }
    } catch (error) {
      setPaymentStatus('error')
      setErrorMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetPayment = () => {
    setAmount('')
    setCustomerName('')
    setPaymentStatus('idle')
    setErrorMessage('')
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading payment page...</p>
        </div>
      </div>
    )
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Confirmed!</h2>
          <div className="text-3xl font-bold text-green-600 mb-2">KES {parseInt(amount).toLocaleString()}</div>
          <p className="text-gray-600 mb-6">Paid to {business.name}</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Transaction ID: QEW7H2K1P9</p>
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}, {new Date().toLocaleTimeString()}</p>
          </div>
          <button
            onClick={resetPayment}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            Make Another Payment
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto pt-8 pb-12 px-4">
        {/* Business Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-green-600">
              {business.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
            </span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">{business.name}</h1>
          <p className="text-gray-600">Till No. {business.till_number}</p>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {paymentStatus === 'processing' ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Payment</h3>
              <p className="text-gray-600">Check your phone for M-Pesa prompt</p>
              <p className="text-sm text-gray-500 mt-2">Enter your M-Pesa PIN to complete</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (KES)
                </label>
                <div className="text-4xl font-bold text-center py-4 text-gray-900">
                  KES {amount ? parseInt(amount).toLocaleString() : '0'}
                </div>
              </div>

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
                  <button
                    key={key}
                    onClick={() => handleNumpad(key)}
                    className={`py-3 rounded-md font-medium transition-colors ${
                      key === 'C' || key === '⌫'
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your name (optional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. John Kamau"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}

              <button
                onClick={startPayment}
                disabled={!amount || parseInt(amount) < 1 || loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Processing...' : 'Pay with M-Pesa'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
