export interface Business {
  id: string
  user_id: string
  name: string
  slug: string
  phone: string
  business_type?: string
  till_number: string
  plan: 'free' | 'pro'
  logo_url?: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  business_id: string
  amount: number
  customer_name?: string
  customer_phone?: string
  mpesa_receipt?: string
  status: 'pending' | 'confirmed' | 'failed'
  checkout_request_id?: string
  created_at: string
}

export interface BillingRequest {
  id: string
  business_id: string
  amount: number
  status: 'pending' | 'paid' | 'failed'
  mpesa_receipt?: string
  billing_period_start: string
  billing_period_end: string
  checkout_request_id?: string
  created_at: string
}

export interface Admin {
  id: string
  user_id: string
  email: string
  created_at: string
}

export interface DashboardMetrics {
  todayEarnings: number
  monthEarnings: number
  todayTransactions: number
  monthTransactions: number
  avgPayment: number
}

export interface PlatformStats {
  totalBusinesses: number
  proBusinesses: number
  totalRevenue: number
  monthlyRevenue: number
  totalTransactions: number
  monthlyTransactions: number
}
