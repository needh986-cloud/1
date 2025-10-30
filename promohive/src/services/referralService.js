import { supabase } from '../lib/supabase';

class ReferralService {
  // Generate or get user's referral link
  async getReferralLink() {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    if (!currentUser?.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase?.from('user_profiles')?.select('referral_code, id')?.eq('id', currentUser?.user?.id)?.single();

    if (error) throw error;

    const baseUrl = window.location?.origin;
    return {
      referralCode: data?.referral_code,
      referralLink: `${baseUrl}/register?ref=${data?.referral_code}`,
      userId: data?.id
    };
  }

  // Get referral statistics (limited info shown to users)
  async getReferralStats() {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    const { data, error } = await supabase?.from('referrals')?.select(`
        *,
        referred:referred_id(email, full_name, level, created_at)
      `)?.eq('referrer_id', currentUser?.user?.id)?.order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate visible stats (hide bonus rules)
    const totalReferrals = data?.length || 0;
    const paidBonuses = data?.filter(r => r?.is_paid)?.length || 0;
    const totalBonusEarned = data?.reduce((sum, r) => sum + parseFloat(r?.bonus_amount || 0), 0);

    // Group by level (but don't show requirements)
    const referralsByLevel = data?.reduce((acc, ref) => {
      const level = ref?.referred?.level || 0;
      acc[level] = (acc?.[level] || 0) + 1;
      return acc;
    }, {});

    return {
      totalReferrals,
      paidBonuses,
      totalBonusEarned,
      referralsByLevel,
      recentReferrals: data?.slice(0, 10) || []
    };
  }

  // Register a new referral (called during signup)
  async registerReferral(referralCode) {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    if (!currentUser?.user) {
      throw new Error('User not authenticated');
    }

    // Find referrer by code
    const { data: referrer, error: referrerError } = await supabase?.from('user_profiles')?.select('id, level')?.eq('referral_code', referralCode)?.single();

    if (referrerError || !referrer) {
      throw new Error('Invalid referral code');
    }

    // Don't allow self-referral
    if (referrer?.id === currentUser?.user?.id) {
      throw new Error('Cannot refer yourself');
    }

    // Check if referral already exists
    const { data: existing } = await supabase?.from('referrals')?.select('id')?.eq('referred_id', currentUser?.user?.id)?.single();

    if (existing) {
      throw new Error('User already referred');
    }

    // Create referral record
    const { data, error } = await supabase?.from('referrals')?.insert({
        referrer_id: referrer?.id,
        referred_id: currentUser?.user?.id,
        referrer_level: referrer?.level,
        referred_level: 0 // New users start at level 0
      })?.select()?.single();

    if (error) throw error;

    // Update user profile to track referrer
    await supabase?.from('user_profiles')?.update({ referred_by: referrer?.id })?.eq('id', currentUser?.user?.id);

    return data;
  }

  // Get referral tree/network (limited depth for users)
  async getReferralTree(depth = 1) {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    const { data, error } = await supabase?.from('referrals')?.select(`
        *,
        referred:referred_id(
          id, email, full_name, level, created_at,
          referrals_as_referrer:referrals!referrer_id(
            referred:referred_id(email, full_name, level)
          )
        )
      `)?.eq('referrer_id', currentUser?.user?.id)?.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Check bonus eligibility (hidden from users - returns generic message)
  async checkBonusEligibility() {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    // Get user's referrals grouped by level
    const { data: referrals, error } = await supabase?.from('referrals')?.select(`
        *,
        referred:referred_id(level)
      `)?.eq('referrer_id', currentUser?.user?.id)?.eq('is_paid', false);

    if (error) throw error;

    // Get user's current level
    const { data: userProfile } = await supabase?.from('user_profiles')?.select('level')?.eq('id', currentUser?.user?.id)?.single();

    const userLevel = userProfile?.level || 0;
    
    // Count referrals at same level
    const sameLevelReferrals = referrals?.filter(
      r => r?.referred?.level >= userLevel
    )?.length || 0;

    // Return generic progress (don't reveal exact requirements)
    return {
      currentLevel: userLevel,
      qualifiedReferrals: sameLevelReferrals,
      message: sameLevelReferrals > 0 
        ? "You have qualified referrals. Keep inviting friends!"
        : "Invite friends who upgrade to your level or higher for bonus rewards!",
      canEarnBonus: sameLevelReferrals >= 3 // Generic threshold shown
    };
  }

  // Trigger bonus processing (calls hidden server function)
  async processPendingBonuses() {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    // This calls the hidden database function
    const { data, error } = await supabase?.rpc('process_referral_bonuses', {
      referrer_uuid: currentUser?.user?.id
    });

    if (error) throw error;
    return { success: true, message: "Bonus processing completed" };
  }

  // Get referral earnings history
  async getReferralEarnings() {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    const { data, error } = await supabase?.from('transactions')?.select('*')?.eq('user_id', currentUser?.user?.id)?.eq('type', 'referral_bonus')?.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Validate referral code format
  validateReferralCode(code) {
    if (!code || typeof code !== 'string') {
      return false;
    }
    
    // Check if code is alphanumeric and 8 characters
    const codePattern = /^[A-Z0-9]{8}$/;
    return codePattern?.test(code?.toUpperCase());
  }

  // Generate share message for social media
  generateShareMessage(referralLink) {
    return `🚀 Join me on PromoHive and earn money by completing simple tasks!\n\n💰 Get $5 welcome bonus\n🎯 Complete tasks and earn rewards\n🎡 Daily spin wheel\n📈 Level up for better earnings\n\nSign up with my link: ${referralLink}\n\n#PromoHive #EarnMoney #OnlineEarning`;
  }

  // Get referral leaderboard (top referrers)
  async getReferralLeaderboard(limit = 10) {
    const { data, error } = await supabase?.from('user_profiles')?.select(`
        full_name,
        level,
        referrals_as_referrer:referrals!referrer_id(id)
      `)?.order('created_at', { ascending: true })?.limit(limit);

    if (error) throw error;

    // Calculate referral counts and sort
    const leaderboard = data
      ?.map(user => ({
        name: user?.full_name,
        level: user?.level,
        referralCount: user?.referrals_as_referrer?.length || 0
      }))
      ?.filter(user => user?.referralCount > 0)
      ?.sort((a, b) => b?.referralCount - a?.referralCount);

    return leaderboard || [];
  }
}

export const referralService = new ReferralService();
export default referralService;