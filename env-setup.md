# Environment Setup for LipaNow

Create a `.env.local` file in the root of the project with the following variables:

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

## Getting the Values:

### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > API
4. Copy the Project URL and anon/public key
5. Go to Settings > Database
6. Run the SQL from `supabase/schema.sql`

### M-Pesa Daraja
1. Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create a new app
3. Get your Consumer Key and Secret
4. Configure your shortcode and passkey

### For Testing
You can run the app with placeholder values to see the UI, but payments won't work until real credentials are provided.
