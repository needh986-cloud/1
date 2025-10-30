import { supabase } from '../lib/supabase';

export const spinWheelService = {
  // Check if user can spin today
  async canSpinToday(userId) {
    try {
      const { data, error } = await supabase
        .rpc('can_spin_today', { p_user_id: userId });

      if (error) throw error;

      return { canSpin: data, error: null };
    } catch (error) {
      return { canSpin: false, error };
    }
  },

  // Process spin
  async processSpin(userId) {
    try {
      const { data, error } = await supabase
        .rpc('process_spin', { p_user_id: userId });

      if (error) throw error;

      return { result: data, error: null };
    } catch (error) {
      return { result: null, error };
    }
  },

  // Get user's spin history
  async getSpinHistory(userId, limit = 30) {
    try {
      const { data, error } = await supabase
        .from('spin_prizes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { history: data || [], error: null };
    } catch (error) {
      return { history: [], error };
    }
  },

  // Get today's total winnings
  async getTodayWinnings(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('spin_prizes')
        .select('prize_amount')
        .eq('user_id', userId)
        .eq('spin_date', today);

      if (error) throw error;

      const total = data.reduce((sum, prize) => sum + parseFloat(prize.prize_amount), 0);

      return { total, error: null };
    } catch (error) {
      return { total: 0, error };
    }
  },

  // Get spin stats
  async getSpinStats(userId) {
    try {
      const { data, error } = await supabase
        .from('spin_prizes')
        .select('prize_amount, spin_date')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        totalSpins: data.length,
        totalWon: data.reduce((sum, p) => sum + parseFloat(p.prize_amount), 0),
        averageWin: data.length > 0 ? 
          data.reduce((sum, p) => sum + parseFloat(p.prize_amount), 0) / data.length : 0,
        lastSpin: data.length > 0 ? data[0].spin_date : null
      };

      return { stats, error: null };
    } catch (error) {
      return { stats: null, error };
    }
  }
};
