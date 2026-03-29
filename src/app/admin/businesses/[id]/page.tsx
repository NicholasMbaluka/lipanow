'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Business {
  id: string
  name: string
  slug: string
  phone: string
  business_type?: string
  till_number: string
  plan: 'free' | 'pro'
  created_at: string
  totalEarnings: number
  totalTransactions: number
  avgPayment: number
  recentTransactions: Transaction[]
  billingHistory: BillingRequest[]
}

interface Transaction {
  id: string
  amount: number
  customer_name: string
  customer_phone: string
  mpesa_receipt: string
  created_at: string
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

export default function AdminBusinessDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = () => {
    const admin = localStorage.getItem('admin')
    const adminSession = localStorage.getItem('adminSession')
    
    if (!admin || !adminSession) {
      router.push('/admin')
      return
    }

    fetchBusiness()
  }

  const fetchBusiness = async () => {
    try {
      const adminSession = localStorage.getItem('adminSession')
      const response = await fetch(`/api/admin/businesses/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${JSON.parse(adminSession || '{}').access_token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setBusiness(data.business)
      } else {
        alert('Business not found')
        router.push('/admin/businesses')
      }
    } catch (error) {
      console.error('Failed to fetch business:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgradeBusiness = async (plan: 'free' | 'pro') => {
    if (!business) return

    setUpdating(true)
    try {
      const adminSession = localStorage.getItem('adminSession')
      const response = await fetch(`/api/admin/businesses/${business.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(adminSession || '{}').access_token}`
        },
        body: JSON.stringify({ plan })
      })

      if (response.ok) {
        fetchBusiness()
        alert(`Business ${plan === 'pro' ? 'upgraded' : 'downgraded'} successfully`)
      } else {
        alert('Failed to update business plan')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  const handleSuspendBusiness = async () => {
    if (!business || !confirm('Are you sure you want to suspend this business?')) return

    try {
      const adminSession = localStorage.getItem('adminSession')
      const response = await fetch(`/api/admin/businesses/${business.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${JSON.parse(adminSession || '{}').access_token}`
        }
      })

      if (response.ok) {
        alert('Business suspended successfully')
        router.push('/admin/businesses')
      } else {
        alert('Failed to suspend business')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading business details...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Business Not Found</h2>
          <p className="text-gray-600">The business you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/admin/businesses" className="text-gray-600 hover:text-gray-900 mr-4">
                ← Back to Businesses
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('admin')
                  localStorage.removeItem('adminSession')
                  router.push('/admin')
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Business Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Business Details</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business Name</label>
                    <p className="mt-1 text-sm text-gray-900">{business.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Slug</label>
                    <p className="mt-1 text-sm text-gray-900">{business.slug}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{business.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Till Number</label>
                    <p className="mt-1 text-sm text-gray-900">{business.till_number}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business Type</label>
                    <p className="mt-1 text-sm text-gray-900">{business.business_type || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Plan</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      business.plan === 'pro' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {business.plan}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(business.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-4">Plan Management</h4>
                <div className="flex space-x-4">
                  {business.plan === 'free' ? (
                    <button
                      onClick={() => handleUpgradeBusiness('pro')}
                      disabled={updating}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {updating ? 'Processing...' : 'Upgrade to Pro'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgradeBusiness('free')}
                      disabled={updating}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                    >
                      {updating ? 'Processing...' : 'Downgrade to Free'}
                    </button>
                  )}
                  <button
                    onClick={handleSuspendBusiness}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Suspend Business
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Link */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Link</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-900 break-all">
                  {window.location.origin}/pay/{business.slug}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/pay/${business.slug}`)
                  alert('Link copied to clipboard!')
                }}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Copy Payment Link
              </button>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Recent Transactions</h3>
              
              {business.recentTransactions && business.recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {business.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.customer_name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500">{new Date(transaction.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">KES {transaction.amount.toFixed(2)}</p>
                        <p className="text-xs text-green-600">✓ {transaction.mpesa_receipt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No transactions yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Business Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Business Metrics</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Earnings</span>
                  <span className="text-lg font-bold text-gray-900">
                    KES {business.totalEarnings.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Transactions</span>
                  <span className="text-lg font-bold text-gray-900">
                    {business.totalTransactions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Payment</span>
                  <span className="text-lg font-bold text-gray-900">
                    KES {business.avgPayment.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Billing History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Billing History</h3>
              
              {business.billingHistory && business.billingHistory.length > 0 ? (
                <div className="space-y-3">
                  {business.billingHistory.map((billing) => (
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
                  <p className="text-gray-500">No billing history</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/pay/${business.slug}`}
                  target="_blank"
                  className="block w-full text-left px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  View Payment Page
                </Link>
                <button
                  onClick={() => alert('Export feature coming soon!')}
                  className="block w-full text-left px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Export Business Data
                </button>
                <button
                  onClick={() => alert('Contact feature coming soon!')}
                  className="block w-full text-left px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Contact Business Owner
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
