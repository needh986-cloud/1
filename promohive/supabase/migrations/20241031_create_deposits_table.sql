-- Create Deposits Table
-- Date: 2025-10-31
-- Purpose: Add deposits table for managing user deposit requests and admin USDT addresses

-- ============================================================================
-- 1. CREATE DEPOSITS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 50.00),
    usdt_address TEXT NOT NULL, -- Admin's USDT address where user sent funds
    network TEXT NOT NULL DEFAULT 'TRC20', -- TRC20, ERC20, BEP20
    tx_hash TEXT, -- Transaction hash provided by user
    payment_proof TEXT, -- URL or description of payment proof
    status TEXT DEFAULT 'pending', -- pending, verified, rejected
    admin_notes TEXT,
    rejection_reason TEXT,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_network_deposit CHECK (network IN ('TRC20', 'ERC20', 'BEP20')),
    CONSTRAINT valid_status_deposit CHECK (status IN ('pending', 'verified', 'rejected', 'cancelled'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON public.deposits(status);
CREATE INDEX IF NOT EXISTS idx_deposits_created_at ON public.deposits(created_at DESC);

-- ============================================================================
-- 2. CREATE ADMIN DEPOSIT ADDRESSES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_deposit_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label TEXT NOT NULL,
    address TEXT NOT NULL UNIQUE,
    network TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    qr_code_url TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_network_admin CHECK (network IN ('TRC20', 'ERC20', 'BEP20'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_deposit_addresses_network ON public.admin_deposit_addresses(network);
CREATE INDEX IF NOT EXISTS idx_admin_deposit_addresses_active ON public.admin_deposit_addresses(is_active);

-- ============================================================================
-- 3. RLS POLICIES FOR DEPOSITS
-- ============================================================================

ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

-- Users can view their own deposits
CREATE POLICY "Users can view own deposits"
ON public.deposits FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own deposit requests
CREATE POLICY "Users can create own deposit requests"
ON public.deposits FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id 
    AND status = 'pending'
);

-- Admins can view all deposits
CREATE POLICY "Admins can view all deposits"
ON public.deposits FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND (raw_user_meta_data->>'role' = 'admin' 
             OR raw_user_meta_data->>'role' = 'super_admin')
    )
);

-- Admins can update deposits
CREATE POLICY "Admins can update deposits"
ON public.deposits FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND (raw_user_meta_data->>'role' = 'admin' 
             OR raw_user_meta_data->>'role' = 'super_admin')
    )
);

-- ============================================================================
-- 4. RLS POLICIES FOR ADMIN DEPOSIT ADDRESSES
-- ============================================================================

ALTER TABLE public.admin_deposit_addresses ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active admin deposit addresses
CREATE POLICY "Users can view active deposit addresses"
ON public.admin_deposit_addresses FOR SELECT
TO authenticated
USING (is_active = true);

-- Only admins can manage deposit addresses
CREATE POLICY "Admins can manage deposit addresses"
ON public.admin_deposit_addresses FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND (raw_user_meta_data->>'role' = 'admin' 
             OR raw_user_meta_data->>'role' = 'super_admin')
    )
);

-- ============================================================================
-- 5. FUNCTIONS
-- ============================================================================

-- Function to request deposit
CREATE OR REPLACE FUNCTION public.request_deposit(
    p_user_id UUID,
    p_amount NUMERIC,
    p_usdt_address TEXT,
    p_network TEXT,
    p_tx_hash TEXT DEFAULT NULL,
    p_payment_proof TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    min_deposit NUMERIC;
    deposit_id UUID;
BEGIN
    -- Get minimum deposit amount from settings
    SELECT CAST(value AS NUMERIC) INTO min_deposit
    FROM public.admin_settings
    WHERE key = 'min_deposit_amount';
    
    -- Validate amount
    IF p_amount < min_deposit THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Amount below minimum deposit of $' || min_deposit
        );
    END IF;
    
    -- Create deposit request
    INSERT INTO public.deposits (
        user_id,
        amount,
        usdt_address,
        network,
        tx_hash,
        payment_proof,
        status
    ) VALUES (
        p_user_id,
        p_amount,
        p_usdt_address,
        p_network,
        p_tx_hash,
        p_payment_proof,
        'pending'
    ) RETURNING id INTO deposit_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'deposit_id', deposit_id,
        'message', 'Deposit request submitted successfully. Awaiting admin verification.'
    );
END;
$$;

-- Function to verify deposit (admin only)
CREATE OR REPLACE FUNCTION public.verify_deposit(
    p_deposit_id UUID,
    p_admin_id UUID,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deposit_record RECORD;
BEGIN
    -- Get deposit details
    SELECT * INTO deposit_record
    FROM public.deposits
    WHERE id = p_deposit_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Deposit not found');
    END IF;
    
    IF deposit_record.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Deposit already processed');
    END IF;
    
    -- Update deposit status
    UPDATE public.deposits
    SET 
        status = 'verified',
        admin_notes = p_admin_notes,
        verified_by = p_admin_id,
        verified_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_deposit_id;
    
    -- Add amount to user wallet
    INSERT INTO public.wallets (user_id, balance, deposits)
    VALUES (deposit_record.user_id, deposit_record.amount, deposit_record.amount)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        balance = wallets.balance + deposit_record.amount,
        deposits = wallets.deposits + deposit_record.amount,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Create transaction record
    INSERT INTO public.transactions (
        user_id,
        type,
        amount,
        description,
        status,
        reference_id
    ) VALUES (
        deposit_record.user_id,
        'deposit',
        deposit_record.amount,
        'Deposit via ' || deposit_record.network || ' - Verified',
        'completed',
        p_deposit_id
    );
    
    -- Log admin action
    INSERT INTO public.admin_actions (
        admin_id,
        action_type,
        target_type,
        target_id,
        details
    ) VALUES (
        p_admin_id,
        'verify_deposit',
        'deposit',
        p_deposit_id,
        jsonb_build_object(
            'amount', deposit_record.amount,
            'user_id', deposit_record.user_id,
            'network', deposit_record.network
        )
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Deposit verified and credited to user account'
    );
END;
$$;

-- Function to reject deposit (admin only)
CREATE OR REPLACE FUNCTION public.reject_deposit(
    p_deposit_id UUID,
    p_admin_id UUID,
    p_rejection_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deposit_record RECORD;
BEGIN
    -- Get deposit details
    SELECT * INTO deposit_record
    FROM public.deposits
    WHERE id = p_deposit_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Deposit not found');
    END IF;
    
    IF deposit_record.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Deposit already processed');
    END IF;
    
    -- Update deposit status
    UPDATE public.deposits
    SET 
        status = 'rejected',
        rejection_reason = p_rejection_reason,
        verified_by = p_admin_id,
        verified_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_deposit_id;
    
    -- Log admin action
    INSERT INTO public.admin_actions (
        admin_id,
        action_type,
        target_type,
        target_id,
        details
    ) VALUES (
        p_admin_id,
        'reject_deposit',
        'deposit',
        p_deposit_id,
        jsonb_build_object(
            'amount', deposit_record.amount,
            'user_id', deposit_record.user_id,
            'reason', p_rejection_reason
        )
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Deposit rejected'
    );
END;
$$;

-- ============================================================================
-- 6. INSERT DEFAULT ADMIN DEPOSIT ADDRESSES
-- ============================================================================

-- Insert sample admin deposit addresses (to be updated by admin)
INSERT INTO public.admin_deposit_addresses (label, address, network, is_active) VALUES
    ('Main TRC20 Wallet', 'TYourTRC20AddressHere', 'TRC20', true),
    ('Main ERC20 Wallet', 'YourERC20AddressHere', 'ERC20', false),
    ('Main BEP20 Wallet', 'YourBEP20AddressHere', 'BEP20', false)
ON CONFLICT (address) DO NOTHING;

-- ============================================================================
-- 7. COMMENTS
-- ============================================================================

COMMENT ON TABLE public.deposits IS 'User deposit requests with manual admin verification';
COMMENT ON TABLE public.admin_deposit_addresses IS 'Admin-managed USDT addresses for receiving deposits';
COMMENT ON FUNCTION public.request_deposit IS 'Create a deposit request (min $50)';
COMMENT ON FUNCTION public.verify_deposit IS 'Verify deposit and credit user account (admin only)';
COMMENT ON FUNCTION public.reject_deposit IS 'Reject deposit request (admin only)';
