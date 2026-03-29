'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Business {
  id: string
  name: string
  phone: string
  plan: 'free' | 'pro'
  created_at: string
}

interface Transaction {
  id: string
  amount: number
  customer_name: string
  created_at: string
  business_id: string
}

interface PlatformStats {
  totalBusinesses: number
  proBusinesses: number
  totalRevenue: number
  monthlyRevenue: number
  totalTransactions: number
  monthlyTransactions: number
}

export default function AdminDashboard() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    totalBusinesses: 0,
    proBusinesses: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalTransactions: 0,
    monthlyTransactions: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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

    fetchAdminData()
  }

  const fetchAdminData = async () => {
    try {
      const adminSession = localStorage.getItem('adminSession')
      
      // Get platform stats
      const statsResponse = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${JSON.parse(adminSession || '{}').access_token}`
        }
      })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setPlatformStats(statsData.stats)
      }

      // Get businesses
      const businessesResponse = await fetch('/api/admin/businesses', {
        headers: {
          'Authorization': `Bearer ${JSON.parse(adminSession || '{}').access_token}`
        }
      })
      
      if (businessesResponse.ok) {
        const businessesData = await businessesResponse.json()
        setBusinesses(businessesData.businesses)
      }

      // Get recent transactions (simplified - in real app would have a dedicated endpoint)
      const transactionsResponse = await fetch('/api/admin/businesses', {
        headers: {
          'Authorization': `Bearer ${JSON.parse(adminSession || '{}').access_token}`
        }
      })
      
      if (transactionsResponse.ok) {
        // For now, we'll use a placeholder for transactions
        setTransactions([])
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgradeBusiness = async (businessId: string, plan: 'free' | 'pro') => {
    try {
      const adminSession = localStorage.getItem('adminSession')
      const response = await fetch(`/api/admin/businesses/${businessId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(adminSession || '{}').access_token}`
        },
        body: JSON.stringify({ plan })
      })

      if (response.ok) {
        fetchAdminData()
        alert(`Business ${plan === 'pro' ? 'upgraded' : 'downgraded'} successfully`)
      } else {
        alert('Failed to update business plan')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    localStorage.removeItem('adminSession')
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Platform Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/businesses"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                All Businesses
              </Link>
              <button
                onClick={handleLogout}
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
        {/* Platform Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                <p className="text-2xl font-bold text-gray-900">{platformStats.totalBusinesses}</p>
                <p className="text-sm text-green-600">{platformStats.proBusinesses} Pro plans</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V4a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">KES {platformStats.monthlyRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500">From Pro subscriptions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{platformStats.totalTransactions}</p>
                <p className="text-sm text-gray-500">{platformStats.monthlyTransactions} this month</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Businesses */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Recent Businesses</h2>
                <Link
                  href="/admin/businesses"
                  className="text-sm text-red-600 hover:text-red-500"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {businesses.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No businesses registered yet
                </div>
              ) : (
                businesses.slice(0, 10).map((business) => (
                  <div key={business.id} className="px-6 py-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{business.name}</p>
                        <p className="text-xs text-gray-500">{business.phone}</p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(business.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          business.plan === 'pro' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {business.plan}
                        </span>
                        <div className="flex gap-1">
                          {business.plan === 'free' && (
                            <button
                              onClick={() => handleUpgradeBusiness(business.id, 'pro')}
                              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                            >
                              Upgrade
                            </button>
                          )}
                          {business.plan === 'pro' && (
                            <button
                              onClick={() => handleUpgradeBusiness(business.id, 'free')}
                              className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                            >
                              Downgrade
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* Revenue Chart Placeholder */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Platform Revenue</span>
                  <span className="text-lg font-bold text-gray-900">
                    KES {platformStats.totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="text-lg font-bold text-green-600">
                    KES {platformStats.monthlyRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pro Subscriptions</span>
                  <span className="text-lg font-bold text-blue-600">
                    {platformStats.proBusinesses}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/admin/businesses"
                  className="block w-full text-left px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Manage All Businesses
                </Link>
                <button
                  onClick={() => alert('Export feature coming soon!')}
                  className="block w-full text-left px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Export Business Data
                </button>
                <button
                  onClick={() => alert('Reports feature coming soon!')}
                  className="block w-full text-left px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
