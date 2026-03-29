'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-600">LipaNow</h1>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/login" 
                className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Get your M-Pesa
            <span className="text-green-600"> payment page</span>
          </h1>
          <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto">
            Professional payment page for your business in 2 minutes. 
            Share a link, get paid instantly via M-Pesa.
          </p>
          <div className="mt-8 sm:mt-10">
            <Link
              href="/signup"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10"
            >
              Start Free Trial
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything you need to accept payments
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Simple, fast, and reliable M-Pesa integration for Kenyan businesses
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="pt-6">
                <div className="flow-root rounded-lg p-6 bg-green-50">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 rounded-md shadow-lg bg-green-500">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7m0 0l7-7m-7 7l-7-7m7 7v-7m-7 7h18" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900">
                      Instant Setup
                    </h3>
                    <p className="mt-2 text-base text-gray-500">
                      Get your payment page live in under 2 minutes. No technical skills required.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="pt-6">
                <div className="flow-root rounded-lg p-6 bg-green-50">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 rounded-md shadow-lg bg-green-500">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900">
                      M-Pesa Integration
                    </h3>
                    <p className="mt-2 text-base text-gray-500">
                      Direct integration with M-Pesa Daraja API. Your customers pay the way they trust.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="pt-6">
                <div className="flow-root rounded-lg p-6 bg-green-50">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 rounded-md shadow-lg bg-green-500">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 3-2zm0 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 3-2zm9-4a1 1 0 100-2 0 1 1 0 012 0 1 1 0 012 0zm-1 9a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900">
                      Real-time Analytics
                    </h3>
                    <p className="mt-2 text-base text-gray-500">
                      Track payments, view earnings, and monitor your business growth in real-time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-16 bg-gray-50">
          <div className="max-w-2xl mx-auto pt-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-xl text-gray-500">
                Start free, upgrade when you need more power
              </p>
            </div>
            <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto">
              {/* Free Plan */}
              <div className="divide-y divide-gray-200 rounded-lg shadow-sm">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">Free</h3>
                  <p className="mt-4 text-sm text-gray-500">
                    Perfect for small businesses getting started
                  </p>
                </div>
                <div className="px-6 pt-6 pb-8">
                  <p className="text-4xl font-bold text-gray-900">KES 0</p>
                  <p className="mt-2 text-sm text-gray-500">Forever free</p>
                  <ul className="mt-6 space-y-4">
                    <li className="flex">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414-1.414l8 8a1 1 0 001.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-3 text-sm text-gray-500">50 transactions/month</span>
                    </li>
                    <li className="flex">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414-1.414l8 8a1 1 0 001.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-3 text-sm text-gray-500">Basic dashboard</span>
                    </li>
                    <li className="flex">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414-1.414l8 8a1 1 0 001.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-3 text-sm text-gray-500">Payment link</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="divide-y divide-gray-200 rounded-lg shadow-sm border-2 border-green-500">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">Pro</h3>
                  <p className="mt-4 text-sm text-gray-500">
                    For growing businesses that need unlimited transactions
                  </p>
                </div>
                <div className="px-6 pt-6 pb-8">
                  <p className="text-4xl font-bold text-gray-900">KES 799</p>
                  <p className="mt-2 text-sm text-gray-500">Per month</p>
                  <ul className="mt-6 space-y-4">
                    <li className="flex">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414-1.414l8 8a1 1 0 001.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-3 text-sm text-gray-500">Unlimited transactions</span>
                    </li>
                    <li className="flex">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414-1.414l8 8a1 1 0 001.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-3 text-sm text-gray-500">Advanced analytics</span>
                    </li>
                    <li className="flex">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414-1.414l8 8a1 1 0 001.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-3 text-sm text-gray-500">Custom branding</span>
                    </li>
                    <li className="flex">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414-1.414l8 8a1 1 0 001.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-3 text-sm text-gray-500">Priority support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
