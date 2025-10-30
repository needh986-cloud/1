-- Create Withdrawals Table
-- Date: 2025-10-31
-- Purpose: Add withdrawals table for managing user withdrawal requests

-- ============================================================================
-- 1. CREATE WITHDRAWALS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 10.00),
    usdt_address TEXT NOT NULL,
    network TEXT NOT NULL DEFAULT 'TRC20', -- TRC20, ERC20, BEP20
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, completed
    tx_hash TEXT,
    admin_notes TEXT,
    rejection_reason TEXT,
    processed_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_network CHECK (network IN ('TRC20', 'ERC20', 'BEP20')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON public.withdrawals(created_at DESC);

-- ============================================================================
-- 2. RLS POLICIES
-- ============================================================================

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Users can view their own withdrawals
CREATE POLICY "Users can view own withdrawals"
ON public.withdrawals FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own withdrawal requests
CREATE POLICY "Users can create own withdrawal requests"
ON public.withdrawals FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id 
    AND status = 'pending'
);

-- Admins can view all withdrawals
CREATE POLICY "Admins can view all withdrawals"
ON public.withdrawals FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND (raw_user_meta_data->>'role' = 'admin' 
             OR raw_user_meta_data->>'role' = 'super_admin')
    )
);

-- Admins can update withdrawals
CREATE POLICY "Admins can update withdrawals"
ON public.withdrawals FOR UPDATE
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
-- 3. FUNCTIONS
-- ============================================================================

-- Function to process withdrawal request
CREATE OR REPLACE FUNCTION public.request_withdrawal(
    p_user_id UUID,
    p_amount NUMERIC,
    p_usdt_address TEXT,
    p_network TEXT DEFAULT 'TRC20'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_balance NUMERIC;
    min_withdrawal NUMERIC;
    withdrawal_id UUID;
BEGIN
    -- Get minimum withdrawal amount from settings
    SELECT CAST(value AS NUMERIC) INTO min_withdrawal
    FROM public.admin_settings
    WHERE key = 'min_withdrawal_amount';
    
    -- Validate amount
    IF p_amount < min_withdrawal THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Amount below minimum withdrawal of $' || min_withdrawal
        );
    END IF;
    
    -- Get user balance from wallet
    SELECT balance INTO user_balance
    FROM public.wallets
    WHERE user_id = p_user_id;
    
    IF user_balance IS NULL OR user_balance < p_amount THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Insufficient balance'
        );
    END IF;
    
    -- Create withdrawal request
    INSERT INTO public.withdrawals (
        user_id,
        amount,
        usdt_address,
        network,
        status
    ) VALUES (
        p_user_id,
        p_amount,
        p_usdt_address,
        p_network,
        'pending'
    ) RETURNING id INTO withdrawal_id;
    
    -- Deduct from balance and add to pending
    UPDATE public.wallets
    SET 
        balance = balance - p_amount,
        pending_balance = pending_balance + p_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;
    
    -- Create transaction record
    INSERT INTO public.transactions (
        user_id,
        type,
        amount,
        description,
        status,
        reference_id
    ) VALUES (
        p_user_id,
        'withdrawal',
        -p_amount,
        'Withdrawal request to ' || p_network || ' - ' || p_usdt_address,
        'pending',
        withdrawal_id
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'withdrawal_id', withdrawal_id,
        'message', 'Withdrawal request submitted successfully'
    );
END;
$$;

-- Function to approve withdrawal (admin only)
CREATE OR REPLACE FUNCTION public.approve_withdrawal(
    p_withdrawal_id UUID,
    p_admin_id UUID,
    p_tx_hash TEXT DEFAULT NULL,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    withdrawal_record RECORD;
BEGIN
    -- Get withdrawal details
    SELECT * INTO withdrawal_record
    FROM public.withdrawals
    WHERE id = p_withdrawal_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Withdrawal not found');
    END IF;
    
    IF withdrawal_record.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Withdrawal already processed');
    END IF;
    
    -- Update withdrawal status
    UPDATE public.withdrawals
    SET 
        status = 'completed',
        tx_hash = p_tx_hash,
        admin_notes = p_admin_notes,
        processed_by = p_admin_id,
        processed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_withdrawal_id;
    
    -- Update pending balance
    UPDATE public.wallets
    SET 
        pending_balance = pending_balance - withdrawal_record.amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = withdrawal_record.user_id;
    
    -- Update transaction status
    UPDATE public.transactions
    SET 
        status = 'completed',
        updated_at = CURRENT_TIMESTAMP
    WHERE reference_id = p_withdrawal_id;
    
    -- Log admin action
    INSERT INTO public.admin_actions (
        admin_id,
        action_type,
        target_type,
        target_id,
        details
    ) VALUES (
        p_admin_id,
        'approve_withdrawal',
        'withdrawal',
        p_withdrawal_id,
        jsonb_build_object(
            'amount', withdrawal_record.amount,
            'user_id', withdrawal_record.user_id,
            'tx_hash', p_tx_hash
        )
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Withdrawal approved successfully'
    );
END;
$$;

-- Function to reject withdrawal (admin only)
CREATE OR REPLACE FUNCTION public.reject_withdrawal(
    p_withdrawal_id UUID,
    p_admin_id UUID,
    p_rejection_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    withdrawal_record RECORD;
BEGIN
    -- Get withdrawal details
    SELECT * INTO withdrawal_record
    FROM public.withdrawals
    WHERE id = p_withdrawal_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Withdrawal not found');
    END IF;
    
    IF withdrawal_record.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Withdrawal already processed');
    END IF;
    
    -- Update withdrawal status
    UPDATE public.withdrawals
    SET 
        status = 'rejected',
        rejection_reason = p_rejection_reason,
        processed_by = p_admin_id,
        processed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_withdrawal_id;
    
    -- Return amount to balance
    UPDATE public.wallets
    SET 
        balance = balance + withdrawal_record.amount,
        pending_balance = pending_balance - withdrawal_record.amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = withdrawal_record.user_id;
    
    -- Update transaction status
    UPDATE public.transactions
    SET 
        status = 'failed',
        description = description || ' - REJECTED: ' || p_rejection_reason,
        updated_at = CURRENT_TIMESTAMP
    WHERE reference_id = p_withdrawal_id;
    
    -- Log admin action
    INSERT INTO public.admin_actions (
        admin_id,
        action_type,
        target_type,
        target_id,
        details
    ) VALUES (
        p_admin_id,
        'reject_withdrawal',
        'withdrawal',
        p_withdrawal_id,
        jsonb_build_object(
            'amount', withdrawal_record.amount,
            'user_id', withdrawal_record.user_id,
            'reason', p_rejection_reason
        )
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Withdrawal rejected and amount returned to user'
    );
END;
$$;

-- ============================================================================
-- 4. COMMENTS
-- ============================================================================

COMMENT ON TABLE public.withdrawals IS 'User withdrawal requests with manual admin approval';
COMMENT ON FUNCTION public.request_withdrawal IS 'Create a withdrawal request (min $10)';
COMMENT ON FUNCTION public.approve_withdrawal IS 'Approve withdrawal and complete transaction (admin only)';
COMMENT ON FUNCTION public.reject_withdrawal IS 'Reject withdrawal and return funds to user (admin only)';
