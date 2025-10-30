import { supabase } from '../lib/supabase';

export const levelUpgradeService = {
  // Get available upgrade levels
  async getAvailableUpgrades(currentLevel) {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .like('key', 'level_%_price')
        .order('key', { ascending: true });

      if (error) throw error;

      const upgrades = data
        .map(s => {
          const level = parseInt(s.key.split('_')[1]);
          return {
            level,
            price: parseFloat(s.value),
            available: level > currentLevel
          };
        })
        .filter(u => u.available);

      return { upgrades, error: null };
    } catch (error) {
      return { upgrades: [], error };
    }
  },

  // Request level upgrade
  async requestUpgrade(userId, toLevel, paymentProof = null, paymentAddress = null) {
    try {
      const { data, error } = await supabase
        .rpc('request_level_upgrade', {
          p_user_id: userId,
          p_to_level: toLevel,
          p_payment_proof: paymentProof,
          p_payment_address: paymentAddress
        });

      if (error) throw error;

      return { result: data, error: null };
    } catch (error) {
      return { result: null, error };
    }
  },

  // Get user's upgrade requests
  async getUserUpgradeRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('level_upgrades')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { requests: data || [], error: null };
    } catch (error) {
      return { requests: [], error };
    }
  },

  // Get pending upgrade requests (admin)
  async getPendingUpgrades() {
    try {
      const { data, error } = await supabase
        .from('level_upgrades')
        .select(`
          *,
          user_profile:user_profiles(
            id,
            full_name,
            username,
            email,
            level
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;

      return { requests: data || [], error: null };
    } catch (error) {
      return { requests: [], error };
    }
  },

  // Approve upgrade request (admin)
  async approveUpgrade(upgradeId, adminId, txHash = null) {
    try {
      // Get upgrade details
      const { data: upgrade, error: upgradeError } = await supabase
        .from('level_upgrades')
        .select('*')
        .eq('id', upgradeId)
        .single();

      if (upgradeError) throw upgradeError;

      // Update upgrade status
      const { error: updateError } = await supabase
        .from('level_upgrades')
        .update({
          status: 'verified',
          verified_by: adminId,
          verified_at: new Date().toISOString(),
          tx_hash: txHash
        })
        .eq('id', upgradeId);

      if (updateError) throw updateError;

      // Update user level
      const { error: levelError } = await supabase
        .from('user_profiles')
        .update({ level: upgrade.to_level })
        .eq('id', upgrade.user_id);

      if (levelError) throw levelError;

      // Create transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: upgrade.user_id,
          type: 'level_upgrade',
          amount: -upgrade.price,
          description: `Level upgrade from ${upgrade.from_level} to ${upgrade.to_level}`,
          status: 'completed'
        });

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: adminId,
          action_type: 'approve_level_upgrade',
          target_type: 'level_upgrade',
          target_id: upgradeId,
          details: { upgrade_id: upgradeId, to_level: upgrade.to_level, user_id: upgrade.user_id }
        });

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Reject upgrade request (admin)
  async rejectUpgrade(upgradeId, adminId, reason) {
    try {
      const { error } = await supabase
        .from('level_upgrades')
        .update({
          status: 'rejected',
          verified_by: adminId,
          verified_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('id', upgradeId);

      if (error) throw error;

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: adminId,
          action_type: 'reject_level_upgrade',
          target_type: 'level_upgrade',
          target_id: upgradeId,
          details: { upgrade_id: upgradeId, reason }
        });

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  }
};
