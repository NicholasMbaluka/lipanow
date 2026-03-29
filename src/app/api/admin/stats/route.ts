import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get total businesses
    const { count: totalBusinesses } = await supabaseAdmin
      .from('businesses')
      .select('*', { count: 'exact', head: true })

    // Get pro businesses
    const { count: proBusinesses } = await supabaseAdmin
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('plan', 'pro')

    // Get total transactions
    const { data: allTransactions } = await supabaseAdmin
      .from('transactions')
      .select('amount')
      .eq('status', 'confirmed')

    // Get this month's transactions
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const { data: monthlyTransactions } = await supabaseAdmin
      .from('transactions')
      .select('amount')
      .eq('status', 'confirmed')
      .gte('created_at', thisMonth.toISOString())

    // Calculate revenue
    const totalRevenue = (allTransactions || []).reduce((sum, t) => sum + t.amount, 0) / 100
    const monthlyRevenue = (monthlyTransactions || []).reduce((sum, t) => sum + t.amount, 0) / 100
    const platformMonthlyRevenue = (proBusinesses || 0) * 799 // KES 799 per pro business

    return NextResponse.json({
      success: true,
      stats: {
        totalBusinesses: totalBusinesses || 0,
        proBusinesses: proBusinesses || 0,
        totalRevenue,
        monthlyRevenue,
        totalTransactions: allTransactions?.length || 0,
        monthlyTransactions: monthlyTransactions?.length || 0,
        platformMonthlyRevenue
      }
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
