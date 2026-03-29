'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Business } from '@/types'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [businessData, setBusinessData] = useState({
    name: '',
    phone: '',
    business_type: '',
    till_number: '',
    plan: 'free' as 'free' | 'pro'
  })
  const router = useRouter()

  useEffect(() => {
    checkExistingBusiness()
  }, [])

  const checkExistingBusiness = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth')
      return
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (business) {
      router.push('/dashboard')
    }
  }

  const handleStep1 = async () => {
    if (!businessData.name || !businessData.phone) {
      alert('Please fill in all required fields')
      return
    }
    setStep(2)
  }

  const handleStep2 = async () => {
    if (!businessData.till_number) {
      alert('Please enter your M-Pesa till number')
      return
    }
    await createBusiness()
  }

  const createBusiness = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth')
      return
    }

    try {
      const slug = businessData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const { error } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          name: businessData.name,
          slug,
          phone: businessData.phone,
          business_type: businessData.business_type,
          till_number: businessData.till_number,
          plan: businessData.plan,
        })

      if (error) throw error

      setStep(3)
    } catch (error) {
      console.error('Error creating business:', error)
      alert('Failed to create business. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 3) {
    const slug = businessData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your page is ready!</h2>
          <p className="text-gray-600 mb-6">Share this link with your customers</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900">
                {window.location.origin}/pay/{slug}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/pay/${slug}`)
                  alert('Link copied!')
                }}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              View my dashboard
            </button>
            <button
              onClick={() => window.open(`/pay/${slug}`, '_blank')}
              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
            >
              Preview my pay page
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto pt-8 pb-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600">LipaNow</h1>
          <p className="mt-2 text-gray-600">Get your M-Pesa payment page in 2 minutes</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber <= step 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber < step ? '✓' : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-8 h-1 mx-2 ${
                    stepNumber < step ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business name *
                </label>
                <input
                  type="text"
                  value={businessData.name}
                  onChange={(e) => setBusinessData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Mama Ngina's Boutique"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone number *
                </label>
                <input
                  type="tel"
                  value={businessData.phone}
                  onChange={(e) => setBusinessData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+254 7XX XXX XXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business type
                </label>
                <select
                  value={businessData.business_type}
                  onChange={(e) => setBusinessData(prev => ({ ...prev, business_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select type...</option>
                  <option value="retail">Retail shop</option>
                  <option value="salon">Salon / Barber</option>
                  <option value="restaurant">Restaurant / Cafe</option>
                  <option value="tutor">Tutor / Teacher</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button
                onClick={handleStep1}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">M-Pesa Setup</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  M-Pesa till / paybill number *
                </label>
                <input
                  type="text"
                  value={businessData.till_number}
                  onChange={(e) => setBusinessData(prev => ({ ...prev, till_number: e.target.value }))}
                  placeholder="e.g. 522522"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose your plan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setBusinessData(prev => ({ ...prev, plan: 'free' }))}
                    className={`p-4 rounded-lg border-2 cursor-pointer text-center ${
                      businessData.plan === 'free'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="font-medium">Free</div>
                    <div className="text-xs text-gray-500 mt-1">50 tx/month</div>
                    <div className="text-lg font-bold text-green-600 mt-2">KES 0</div>
                  </div>
                  <div
                    onClick={() => setBusinessData(prev => ({ ...prev, plan: 'pro' }))}
                    className={`p-4 rounded-lg border-2 cursor-pointer text-center relative ${
                      businessData.plan === 'pro'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                      Popular
                    </div>
                    <div className="font-medium">Pro</div>
                    <div className="text-xs text-gray-500 mt-1">Unlimited + branding</div>
                    <div className="text-lg font-bold text-green-600 mt-2">KES 799</div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStep2}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : 'Create my page'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
