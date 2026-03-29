'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Business {
  id: string
  name: string
  plan: 'free' | 'pro'
}

interface BillingRequest {
  id: string
  amount: number
  status: 'pending' | 'paid' | 'failed'
  billing_period_start: string
  billing_period_end: string
  mpesa_receipt?: string
  created_at: string
}

export default function BillingPage() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [billingHistory, setBillingHistory] = useState<BillingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user')
    const businessData = localStorage.getItem('business')
    
    if (!user || !businessData) {
      router.push('/login')
      return
    }

    const parsedBusiness = JSON.parse(businessData)
    setBusiness(parsedBusiness)
    fetchBillingHistory(parsedBusiness.id)
  }, [router])

  const fetchBillingHistory = async (businessId: string) => {
    try {
      const response = await fetch('/api/billing/history', {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('session') || '{}').access_token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setBillingHistory(data.billingHistory || [])
      }
    } catch (error) {
      console.error('Failed to fetch billing history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    if (!business) return

    setUpgrading(true)
    setMessage('')

    try {
      const response = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('session') || '{}').access_token}`
        },
        body: JSON.stringify({ businessId: business.id })
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Payment initiated! Check your phone for M-Pesa prompt.')
        
        // Poll for payment status
        const checkStatus = async () => {
          try {
            const statusResponse = await fetch(`/api/billing/status?billingId=${data.billingId}`)
            const statusData = await statusResponse.json()
            
            if (statusData.success && statusData.billing.status === 'paid') {
              setMessage('Payment successful! You are now on Pro plan.')
              // Update business plan
              const updatedBusiness = { ...business, plan: 'pro' as const }
              setBusiness(updatedBusiness)
              localStorage.setItem('business', JSON.stringify(updatedBusiness))
              fetchBillingHistory(business.id)
            } else if (statusData.billing.status === 'failed') {
              setMessage('Payment failed. Please try again.')
            }
          } catch (error) {
            console.error('Failed to check billing status:', error)
          }
        }

        // Check status every 5 seconds for up to 2 minutes
        let attempts = 0
        const interval = setInterval(() => {
          checkStatus()
          attempts++
          if (attempts >= 24) { // 24 * 5 seconds = 2 minutes
            clearInterval(interval)
          }
        }, 5000)
      } else {
        setMessage(data.error || 'Failed to initiate payment')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    } finally {
      setUpgrading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading billing information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-green-600">LipaNow</Link>
              <span className="ml-4 text-gray-600">Billing</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {business?.name} • {business?.plan === 'pro' ? 'Pro' : 'Free'} Plan
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('user')
                  localStorage.removeItem('business')
                  localStorage.removeItem('session')
                  router.push('/login')
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Billing & Subscription</h2>
          <p className="text-gray-600">Manage your LipaNow subscription and billing</p>
        </div>

        {message && (
          <div className={`rounded-md p-4 mb-6 ${
            message.includes('successful') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Plan */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Comparison */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Choose Your Plan</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Free Plan */}
                <div className={`relative rounded-lg border-2 p-6 ${
                  business?.plan === 'free' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-white'
                }`}>
                  {business?.plan === 'free' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                        Current Plan
                      </span>
                    </div>
                  )}
                  
                  <h4 className="text-lg font-medium text-gray-900">Free</h4>
                  <p className="mt-2 text-sm text-gray-500">Perfect for small businesses</p>
                  <p className="mt-4 text-3xl font-bold text-gray-900">KES 0</p>
                  <p className="text-sm text-gray-500">Forever</p>
                  
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414-1.414l8 8a1 1 0 001.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">50 transactions/month</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414-1.414l8 8a1 1 0 001.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">Basic dashboard</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414-1.414l8 8a1 1 0 001.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">Payment link</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414-1.414l8 8a1 1 0 001.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">Email support</span>
                    </li>
                  </ul>
                </div>

                {/* Pro Plan */}
                <div className={`relative rounded-lg border-2 p-6 ${
                  business?.plan === 'pro' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-white'
                }`}>
                  {business?.plan === 'pro' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                        Current Plan
                      </span>
                    </div>
                  )}
                  
                  <h4 className="text-lg font-medium text-gray-900">Pro</h4>
                  <p className="mt-2 text-sm text-gray-500">For growing businesses</p>
                  <p className="mt-4 text-3xl font-bold text-gray-900">KES 799</p>
                  <p className="text-sm text-gray-500">Per month</p>
                  
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414-1.414l8 8a1 1 0 001.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">Unlimited transactions</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414-1.414l8 8a1 1 0 001.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">Advanced analytics</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414-1.414l8 8a1 1 0 001.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">Custom branding</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414-1.414l8 8a1 1 0 001.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">Priority support</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414-1.414l8 8a1 1 0 001.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">Export data</span>
                    </li>
                  </ul>

                  {business?.plan !== 'pro' && (
                    <button
                      onClick={handleUpgrade}
                      disabled={upgrading}
                      className="mt-6 w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {upgrading ? 'Processing...' : 'Upgrade to Pro'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Billing History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Billing History</h3>
              
              {billingHistory.length > 0 ? (
                <div className="space-y-4">
                  {billingHistory.map((billing) => (
                    <div key={billing.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(billing.billing_period_start).toLocaleDateString()} - {new Date(billing.billing_period_end).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(billing.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">KES {billing.amount.toFixed(2)}</p>
                        <p className={`text-xs ${
                          billing.status === 'paid' ? 'text-green-600' :
                          billing.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {billing.status === 'paid' ? '✓ Paid' :
                           billing.status === 'pending' ? '⏳ Pending' : '✗ Failed'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No billing history</p>
                  <p className="text-sm text-gray-400 mt-1">Upgrade to Pro to see your billing history</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Status</h3>
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  business?.plan === 'pro' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <svg className={`w-8 h-8 ${
                    business?.plan === 'pro' ? 'text-green-600' : 'text-gray-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {business?.plan === 'pro' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 capitalize">{business?.plan} Plan</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {business?.plan === 'pro' ? 'All features unlocked' : 'Limited features'}
                </p>
              </div>
            </div>

            {/* Support */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Have questions about billing or need to change your plan?
              </p>
              <a
                href="mailto:support@lipanow.co.ke"
                className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
