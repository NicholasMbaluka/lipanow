'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Business, Transaction, DashboardMetrics } from '@/types'
import { Copy, Share2, Eye, LogOut } from 'lucide-react'

export default function Dashboard() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth')
      return
    }

    // Get business
    const { data: businessData } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!businessData) {
      router.push('/onboarding')
      return
    }

    setBusiness(businessData)

    // Get transactions
    const { data: transactionData } = await supabase
      .from('transactions')
      .select('*')
      .eq('business_id', businessData.id)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(10)

    setTransactions(transactionData || [])

    // Calculate metrics
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const allTransactions = transactionData || []
    const todayTransactions = allTransactions.filter(t => 
      new Date(t.created_at) >= today
    )
    const monthTransactions = allTransactions.filter(t => 
      new Date(t.created_at) >= thisMonth
    )

    const todayEarnings = todayTransactions.reduce((sum, t) => sum + t.amount, 0) / 100
    const monthEarnings = monthTransactions.reduce((sum, t) => sum + t.amount, 0) / 100
    const avgPayment = monthTransactions.length > 0 
      ? monthEarnings / monthTransactions.length 
      : 0

    setMetrics({
      todayEarnings,
      monthEarnings,
      todayTransactions: todayTransactions.length,
      monthTransactions: monthTransactions.length,
      avgPayment,
    })

    setLoading(false)
  }

  const copyPaymentLink = () => {
    if (!business) return
    const link = `${window.location.origin}/pay/${business.slug}`
    navigator.clipboard.writeText(link)
    alert('Payment link copied!')
  }

  const shareOnWhatsApp = () => {
    if (!business) return
    const link = `${window.location.origin}/pay/${business.slug}`
    const message = `Pay ${business.name} via M-Pesa: ${link}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
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

  if (!business || !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No business found</h2>
          <p className="text-gray-600">Please set up your business first.</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Good morning, {business.name}</h1>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                business.plan === 'pro' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {business.plan === 'pro' ? 'Pro' : 'Free'}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
            <p className="text-2xl font-bold text-gray-900">KES {metrics.todayEarnings.toLocaleString()}</p>
            <p className="text-sm text-green-600">+12% vs yesterday</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">This Month</p>
            <p className="text-2xl font-bold text-gray-900">KES {metrics.monthEarnings.toLocaleString()}</p>
            <p className="text-sm text-gray-500">{30 - new Date().getDate()} days left</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.monthTransactions}</p>
            <p className="text-sm text-gray-500">today: {metrics.todayTransactions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Avg. Payment</p>
            <p className="text-2xl font-bold text-gray-900">KES {Math.round(metrics.avgPayment).toLocaleString()}</p>
            <p className="text-sm text-gray-500">this month</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Recent Payments</h2>
                <button className="text-sm text-green-600 hover:text-green-500">
                  View all
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
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
                          {new Date(transaction.created_at).toLocaleDateString()}, {new Date(transaction.created_at).toLocaleTimeString()}
                          {' • '}
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            confirmed
                          </span>
                        </p>
                      </div>
                      <p className="text-sm font-medium text-green-600">
                        +KES {(transaction.amount / 100).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment Link */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Your Payment Link</h2>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900 truncate">
                    {window.location.origin}/pay/{business.slug}
                  </span>
                  <button
                    onClick={copyPaymentLink}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={shareOnWhatsApp}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share on WhatsApp
                </button>
                <button
                  onClick={() => window.open(`/pay/${business.slug}`, '_blank')}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
