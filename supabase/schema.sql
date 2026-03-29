-- Businesses table (one row per business owner)
CREATE TABLE businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  business_type TEXT,
  till_number TEXT NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table (every payment a customer makes)
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL, -- in cents
  customer_name TEXT,
  customer_phone TEXT,
  mpesa_receipt TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  checkout_request_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing requests table (every time a business pays you KES 799)
CREATE TABLE billing_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL DEFAULT 79900, -- KES 799 in cents
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  mpesa_receipt TEXT,
  billing_period_start TIMESTAMP WITH TIME ZONE,
  billing_period_end TIMESTAMP WITH TIME ZONE,
  checkout_request_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admins table (just you - one row)
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Businesses policies
CREATE POLICY "Businesses can view own business" ON businesses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Businesses can update own business" ON businesses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Businesses can insert own business" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all businesses" ON businesses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
    )
  );

-- Transactions policies
CREATE POLICY "Businesses can view own transactions" ON transactions
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
    )
  );

-- Billing requests policies
CREATE POLICY "Businesses can view own billing" ON billing_requests
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all billing" ON billing_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
    )
  );

-- Admins policies
CREATE POLICY "Admins can manage admins" ON admins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins WHERE admins.user_id = auth.uid()
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION get_business_by_slug(slug_param TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  phone TEXT,
  business_type TEXT,
  till_number TEXT,
  plan TEXT,
  logo_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.slug,
    b.phone,
    b.business_type,
    b.till_number,
    b.plan,
    b.logo_url
  FROM businesses b
  WHERE b.slug = slug_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_transactions_business_id ON transactions(business_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_billing_requests_business_id ON billing_requests(business_id);
CREATE INDEX idx_admins_user_id ON admins(user_id);
