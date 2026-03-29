# LipaNow - M-Pesa SaaS Payment Platform

A modern Next.js application that provides businesses with instant M-Pesa payment pages. Built with TypeScript, Supabase, and Tailwind CSS.

## Features

### For Customers
- Clean, mobile-first payment interface
- Real-time M-Pesa STK push integration
- Instant payment confirmation
- No account required

### For Business Owners
- Simple 3-minute signup process
- Real-time dashboard with analytics
- Transaction history and receipts
- Shareable payment links and QR codes
- Free and Pro plans

### For Platform Admins
- Complete business management
- Revenue tracking and analytics
- User plan management
- Transaction monitoring

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: M-Pesa Daraja API
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- M-Pesa Daraja API credentials

### Installation

1. Install dependencies
```bash
npm install
```

2. Set up environment variables
Create `.env.local` with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# M-Pesa Daraja API Configuration
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_PASSKEY=your_mpesa_passkey
MPESA_SHORTCODE=your_mpesa_shortcode
MPESA_CALLBACK_URL=your_callback_url

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Set up Supabase database
- Create a new Supabase project
- Run the SQL schema from `supabase/schema.sql`
- Enable Row Level Security policies

4. Run the development server
```bash
npm run dev
```

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Business owner dashboard
│   ├── admin/             # Admin panel
│   ├── onboarding/        # Business signup
│   └── pay/[slug]/        # Customer payment pages
├── lib/                   # Utilities and configurations
├── types/                 # TypeScript type definitions
└── components/            # Reusable components
```

## User Roles

### Customer
- Access: `/pay/[business-slug]`
- Features: Make payments, view receipts

### Business Owner
- Access: `/dashboard`, `/settings`
- Features: View analytics, manage business, billing

### Admin
- Access: `/admin`
- Features: Platform management, revenue tracking

## Business Model

### Free Plan
- 50 transactions per month
- Basic payment page
- Core dashboard features

### Pro Plan (KES 799/month)
- Unlimited transactions
- Custom branding
- Advanced analytics
- Priority support

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

---

Built with ❤️ for Kenyan businesses
