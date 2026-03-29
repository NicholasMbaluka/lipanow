import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    const search = searchParams.get('search') || ''

    let query = supabaseAdmin
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data: businesses, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch businesses' },
        { status: 500 }
      )
    }

    // Get transaction counts for each business
    const businessIds = businesses.map(b => b.id)
    const { data: transactionCounts } = await supabaseAdmin
      .from('transactions')
      .select('business_id, count')
      .in('business_id', businessIds)
      .eq('status', 'confirmed')

    const transactionCountMap = (transactionCounts || []).reduce((acc, tc) => {
      acc[tc.business_id] = tc.count
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      businesses: businesses.map(b => ({
        ...b,
        transaction_count: transactionCountMap[b.id] || 0
      })),
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Admin businesses list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
