import { supabase } from '../lib/supabase';

class SpinWheelService {
  // Check if user can spin today
  async canUserSpinToday() {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    if (!currentUser?.user) {
      throw new Error('User not authenticated');
    }

    // Check daily limit using the database function
    const { data, error } = await supabase?.rpc('can_user_spin_today', {
      user_uuid: currentUser?.user?.id
    });

    if (error) throw error;
    return data;
  }

  // Get today's spin count and rewards
  async getTodaySpinData() {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    const { data, error } = await supabase?.from('daily_spin_rewards')?.select('*')?.eq('user_id', currentUser?.user?.id)?.eq('spin_date', new Date()?.toISOString()?.split('T')?.[0])?.order('created_at', { ascending: false });

    if (error) throw error;

    const totalReward = data?.reduce((sum, spin) => sum + parseFloat(spin?.reward_amount), 0) || 0;
    const spinCount = data?.length || 0;
    const remainingAmount = Math.max(0, 0.30 - totalReward);

    return {
      spins: data,
      totalReward,
      spinCount,
      remainingAmount,
      canSpin: remainingAmount > 0
    };
  }

  // Perform spin (server-side logic)
  async performSpin() {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    if (!currentUser?.user) {
      throw new Error('User not authenticated');
    }

    // First check if user can spin
    const canSpin = await this.canUserSpinToday();
    if (!canSpin) {
      throw new Error('Daily spin limit reached ($0.30)');
    }

    // Get current day's total to calculate remaining
    const todayData = await this.getTodaySpinData();
    const maxReward = Math.min(0.30 - todayData?.totalReward, 0.30);

    if (maxReward <= 0) {
      throw new Error('Daily limit reached');
    }

    // Generate random reward (hidden algorithm)
    const rewardAmount = this.generateSpinReward(maxReward);

    // Record spin in database
    const { data, error } = await supabase?.from('daily_spin_rewards')?.insert({
        user_id: currentUser?.user?.id,
        reward_amount: rewardAmount,
        spin_date: new Date()?.toISOString()?.split('T')?.[0]
      })?.select()?.single();

    if (error) throw error;

    // Update user balance
    await supabase?.from('user_profiles')?.update({
        balance: supabase?.raw(`balance + ${rewardAmount}`)
      })?.eq('id', currentUser?.user?.id);

    // Create transaction record
    await supabase?.from('transactions')?.insert({
      user_id: currentUser?.user?.id,
      type: 'spin_reward',
      amount: rewardAmount,
      description: 'Daily spin wheel reward',
      status: 'completed',
      reference_type: 'daily_spin_reward',
      reference_id: data?.id
    });

    return {
      success: true,
      reward: rewardAmount,
      spinId: data?.id,
      newBalance: await this.getUserBalance()
    };
  }

  // Hidden reward generation algorithm
  generateSpinReward(maxReward) {
    // Hidden probability distribution (not exposed to frontend)
    const probabilities = [
      { min: 0.01, max: 0.05, weight: 50 },  // 50% chance: $0.01-$0.05
      { min: 0.06, max: 0.10, weight: 25 },  // 25% chance: $0.06-$0.10
      { min: 0.11, max: 0.20, weight: 15 },  // 15% chance: $0.11-$0.20
      { min: 0.21, max: 0.30, weight: 10 }   // 10% chance: $0.21-$0.30
    ];

    // Calculate total weight
    const totalWeight = probabilities?.reduce((sum, p) => sum + p?.weight, 0);
    
    // Generate random number
    let random = Math.random() * totalWeight;
    
    // Find selected range
    let selectedRange = probabilities?.[0];
    for (const range of probabilities) {
      if (random <= range?.weight) {
        selectedRange = range;
        break;
      }
      random -= range?.weight;
    }

    // Generate reward within selected range, capped by maxReward
    const minAmount = Math.min(selectedRange?.min, maxReward);
    const maxAmount = Math.min(selectedRange?.max, maxReward);
    
    const reward = minAmount + Math.random() * (maxAmount - minAmount);
    return Math.round(reward * 100) / 100; // Round to 2 decimal places
  }

  // Get user's current balance
  async getUserBalance() {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    const { data, error } = await supabase?.from('user_profiles')?.select('balance')?.eq('id', currentUser?.user?.id)?.single();

    if (error) throw error;
    return parseFloat(data?.balance || 0);
  }

  // Get spin history
  async getSpinHistory(limit = 30) {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    const { data, error } = await supabase?.from('daily_spin_rewards')?.select('*')?.eq('user_id', currentUser?.user?.id)?.order('created_at', { ascending: false })?.limit(limit);

    if (error) throw error;
    return data;
  }

  // Get wheel configuration (what users see)
  getWheelConfig() {
    // This is what users see (not the real probabilities)
    return {
      segments: [
        { value: '$0.01', color: '#fef3c7', textColor: '#92400e' },
        { value: '$0.30', color: '#dcfce7', textColor: '#166534' },
        { value: '$0.05', color: '#fef3c7', textColor: '#92400e' },
        { value: '$0.15', color: '#ddd6fe', textColor: '#5b21b6' },
        { value: '$0.03', color: '#fef3c7', textColor: '#92400e' },
        { value: '$0.25', color: '#dcfce7', textColor: '#166534' },
        { value: '$0.08', color: '#fed7d7', textColor: '#c53030' },
        { value: '$0.10', color: '#ddd6fe', textColor: '#5b21b6' }
      ],
      maxDailyReward: 0.30,
      spinCooldown: 86400000 // 24 hours in milliseconds
    };
  }
}

export const spinWheelService = new SpinWheelService();
export default spinWheelService;