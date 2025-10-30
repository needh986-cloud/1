import { supabase } from '../lib/supabase';

export const verificationService = {
  // Create and send verification code
  async sendVerificationCode(email, fullName, userId) {
    try {
      // Create verification code in database
      const { data: codeData, error: codeError } = await supabase?.rpc('create_verification_code', {
        user_email: email,
        user_uuid: userId
      });

      if (codeError) {
        throw codeError;
      }

      // Send email via Edge Function
      const { data: emailData, error: emailError } = await supabase?.functions?.invoke('send-verification-email', {
        body: {
          email,
          verificationCode: codeData,
          fullName
        }
      });

      if (emailError) {
        throw emailError;
      }

      return { 
        success: true, 
        message: 'Verification code has been sent to your email',
        data: emailData 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error?.message || 'Failed to send verification code' 
      };
    }
  },

  // Verify email code
  async verifyEmailCode(userId, code) {
    try {
      const { data, error } = await supabase?.rpc('verify_email_code', {
        user_uuid: userId,
        input_code: code
      });

      if (error) {
        throw error;
      }

      if (data) {
        return { 
          success: true, 
          message: 'Your email has been verified successfully',
          verified: true 
        };
      } else {
        return { 
          success: false, 
          error: 'Verification code is invalid or expired',
          verified: false 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error?.message || 'Failed to verify code',
        verified: false 
      };
    }
  },

  // Get verification status
  async getVerificationStatus(userId) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('email_verified, approval_status, status')?.eq('id', userId)?.single();

      if (error) {
        throw error;
      }

      return { 
        success: true, 
        data: {
          emailVerified: data?.email_verified || false,
          approvalStatus: data?.approval_status || 'pending',
          userStatus: data?.status || 'pending'
        }
      };
    } catch (error) {
      return { 
        success: false, 
        error: error?.message || 'Failed to fetch verification status' 
      };
    }
  },

  // Get pending verification codes for user
  async getPendingVerificationCode(userId) {
    try {
      const { data, error } = await supabase?.from('email_verification_codes')?.select('*')?.eq('user_id', userId)?.eq('verified', false)?.gt('expires_at', new Date()?.toISOString())?.order('created_at', { ascending: false })?.limit(1)?.single();

      if (error && error?.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      return { 
        success: true, 
        data: data || null 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error?.message || 'Failed to fetch verification code' 
      };
    }
  },

  // Resend verification code
  async resendVerificationCode(email, fullName, userId) {
    try {
      // Check if user can request new code (rate limiting)
      const { data: recentCode } = await supabase?.from('email_verification_codes')?.select('created_at')?.eq('user_id', userId)?.gte('created_at', new Date(Date.now() - 60000)?.toISOString()) // Last minute
      ?.order('created_at', { ascending: false })?.limit(1)?.single();

      if (recentCode) {
        return { 
          success: false, 
          error: 'Please wait one minute before requesting a new code' 
        };
      }

      // Send new verification code
      return await this.sendVerificationCode(email, fullName, userId);
    } catch (error) {
      return { 
        success: false, 
        error: error?.message || 'Failed to resend verification code' 
      };
    }
  }
};

export default verificationService;