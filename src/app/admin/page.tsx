'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Business, Transaction, AdminUser } from '@/types'
import { Users, TrendingUp, CreditCard, Settings, LogOut } from 'lucide-react'

export default function AdminPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [platformMetrics, setPlatformMetrics] = useState({
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

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth')
      return
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!adminUser) {
      router.push('/dashboard')
      return
    }

    fetchAdminData()
  }

  const fetchAdminData = async () => {
    // Get all businesses
    const { data: businessData } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false })

    // Get all transactions
    const { data: transactionData } = await supabase
      .from('transactions')
      .select('*')
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(100)

    setBusinesses(businessData || [])
    setTransactions(transactionData || [])

    // Calculate platform metrics
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const monthlyTransactions = (transactionData || []).filter(t => 
      new Date(t.created_at) >= thisMonth
    )

    const proBusinesses = (businessData || []).filter(b => b.plan === 'pro')
    const monthlyRevenue = proBusinesses.length * 799 // KES 799 per pro business

    setPlatformMetrics({
      totalBusinesses: businessData?.length || 0,
      proBusinesses: proBusinesses.length,
      totalRevenue: proBusinesses.length * 799, // Simplified calculation
      monthlyRevenue,
      totalTransactions: transactionData?.length || 0,
      monthlyTransactions: monthlyTransactions.length
    })

    setLoading(false)
  }

  const handleUpgradeBusiness = async (businessId: string, plan: 'free' | 'pro') => {
    const { error } = await supabase
      .from('businesses')
      .update({ plan })
      .eq('id', businessId)

    if (error) {
      alert('Failed to update business plan')
      return
    }

    fetchAdminData()
  }

  const handleSuspendBusiness = async (businessId: string) => {
    if (!confirm('Are you sure you want to suspend this business?')) return

    // In a real app, you'd add a 'suspended' status to the businesses table
    alert('Business suspended (feature not implemented)')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Platform Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                <p className="text-2xl font-bold text-gray-900">{platformMetrics.totalBusinesses}</p>
                <p className="text-sm text-green-600">{platformMetrics.proBusinesses} Pro plans</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">KES {platformMetrics.monthlyRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500">From Pro subscriptions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{platformMetrics.totalTransactions}</p>
                <p className="text-sm text-gray-500">{platformMetrics.monthlyTransactions} this month</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Businesses List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">All Businesses</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {businesses.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No businesses registered yet
                </div>
              ) : (
                businesses.map((business) => (
                  <div key={business.id} className="px-6 py-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{business.name}</p>
                        <p className="text-xs text-gray-500">{business.phone}</p>
                        <p className="text-xs text-gray-500">Till: {business.till_number}</p>
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
                          <button
                            onClick={() => handleSuspendBusiness(business.id)}
                            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                          >
                            Suspend
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Platform Transactions</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {transactions.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No transactions yet
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="px-6 py-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.customer_name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Business ID: {transaction.business_id.slice(0, 8)}...
                        </p>
                      </div>
                      <p className="text-sm font-medium text-green-600">
                        KES {(transaction.amount / 100).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
