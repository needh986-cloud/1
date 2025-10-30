import { supabase } from '../lib/supabase';

export const adminService = {
  // User Management
  async getUsers(filters = {}) {
    let query = supabase?.from('user_profiles')?.select('*')?.order('created_at', { ascending: false });

    if (filters?.role) {
      query = query?.eq('role', filters?.role);
    }
    if (filters?.status) {
      query = query?.eq('status', filters?.status);
    }
    if (filters?.level !== undefined) {
      query = query?.eq('level', filters?.level);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async updateUser(userId, updates) {
    const { data, error } = await supabase?.from('user_profiles')?.update(updates)?.eq('id', userId)?.select()?.single();

    if (error) throw error;
    
    // Log admin action
    await this.logAdminAction('UPDATE', 'user_profiles', userId, updates);
    return data;
  },

  async updateUserBalance(userId, balanceChange, type = 'admin_adjustment') {
    const { data: user, error: fetchError } = await supabase?.from('user_profiles')?.select('balance, pending_balance')?.eq('id', userId)?.single();

    if (fetchError) throw fetchError;

    const newBalance = parseFloat(user?.balance) + parseFloat(balanceChange);
    
    const { data, error } = await supabase?.from('user_profiles')?.update({ balance: newBalance })?.eq('id', userId)?.select()?.single();

    if (error) throw error;

    // Create transaction record
    await supabase?.from('transactions')?.insert({
      user_id: userId,
      type: type,
      amount: balanceChange,
      description: `Admin balance adjustment: ${balanceChange > 0 ? '+' : ''}${balanceChange}`,
      status: 'completed'
    });

    return data;
  },

  // Task Management
  async createTask(taskData) {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    const { data, error } = await supabase?.from('tasks')?.insert({
        ...taskData,
        created_by: currentUser?.user?.id
      })?.select()?.single();

    if (error) throw error;
    return data;
  },

  async updateTask(taskId, updates) {
    const { data, error } = await supabase?.from('tasks')?.update(updates)?.eq('id', taskId)?.select()?.single();

    if (error) throw error;
    await this.logAdminAction('UPDATE', 'tasks', taskId, updates);
    return data;
  },

  // Proof Review
  async getPendingProofs() {
    const { data, error } = await supabase?.from('task_submissions')?.select(`
        *,
        tasks:tasks(*),
        user_profiles:user_profiles(*)
      `)?.eq('status', 'pending')?.order('submitted_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async reviewProof(proofId, action, reason = '') {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    const status = action === 'approve' ? 'approved' : 'rejected';
    
    const { data, error } = await supabase?.from('task_submissions')?.update({
        status,
        reviewed_by: currentUser?.user?.id,
        reviewed_at: new Date()?.toISOString(),
        admin_notes: reason
      })?.eq('id', proofId)?.select(`
        *,
        tasks:tasks(*),
        user_profiles:user_profiles(*)
      `)?.single();

    if (error) throw error;

    // If approved, create earning transaction
    if (action === 'approve') {
      await supabase?.from('transactions')?.insert({
        user_id: data?.user_id,
        type: 'earning',
        amount: data?.tasks?.reward_amount,
        description: `Task completion: ${data?.tasks?.title}`,
        status: 'completed',
        reference_type: 'task_submission',
        reference_id: proofId
      });

      // Update user balance
      await supabase?.rpc('increment_user_balance', {
        user_uuid: data?.user_id,
        amount: data?.tasks?.reward_amount
      });
    }

    return data;
  },

  // USDT Address Management
  async getUSDTAddresses() {
    const { data, error } = await supabase?.from('usdt_addresses')?.select(`
        *,
        user_profiles:user_profiles(email, full_name)
      `)?.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createUSDTAddress(addressData) {
    const { data, error } = await supabase?.from('usdt_addresses')?.insert({
        ...addressData,
        is_admin_managed: true
      })?.select()?.single();

    if (error) throw error;
    return data;
  },

  async deleteUSDTAddress(addressId) {
    const { data, error } = await supabase?.from('usdt_addresses')?.delete()?.eq('id', addressId)?.select()?.single();

    if (error) throw error;
    await this.logAdminAction('DELETE', 'usdt_addresses', addressId);
    return data;
  },

  async exportUSDTAddressesCSV() {
    const addresses = await this.getUSDTAddresses();
    
    const csvContent = [
      ['User Email', 'Full Name', 'Label', 'Address', 'Network', 'Created At']?.join(','),
      ...addresses?.map(addr => [
        addr?.user_profiles?.email || '',
        addr?.user_profiles?.full_name || '',
        addr?.label || '',
        addr?.address,
        addr?.network,
        new Date(addr.created_at)?.toLocaleDateString()
      ]?.join(','))
    ]?.join('\n');

    return csvContent;
  },

  // Withdrawal Processing
  async getPendingWithdrawals() {
    const { data, error } = await supabase?.from('transactions')?.select(`
        *,
        user_profiles:user_profiles(*)
      `)?.eq('type', 'withdrawal')?.eq('status', 'pending')?.order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async processWithdrawal(withdrawalId, action, notes = '') {
    const { data: currentUser } = await supabase?.auth?.getUser();
    const status = action === 'approve' ? 'completed' : 'failed';
    
    const { data, error } = await supabase?.from('transactions')?.update({
        status,
        processed_by: currentUser?.user?.id,
        processed_at: new Date()?.toISOString(),
        admin_notes: notes
      })?.eq('id', withdrawalId)?.select(`
        *,
        user_profiles:user_profiles(*)
      `)?.single();

    if (error) throw error;

    // Send notification email
    try {
      await this.sendNotificationEmail(
        action === 'approve' ? 'withdrawal_approved' : 'withdrawal_rejected',
        data?.user_profiles?.email,
        {
          fullName: data?.user_profiles?.full_name,
          amount: data?.amount,
          address: data?.withdrawal_address,
          reason: action === 'reject' ? notes : undefined
        }
      );
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
    }

    return data;
  },

  // Settings Management
  async getSettings() {
    const { data, error } = await supabase?.from('admin_settings')?.select('*')?.order('key');

    if (error) throw error;
    return data;
  },

  async updateSetting(key, value) {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    const { data, error } = await supabase?.from('admin_settings')?.upsert({
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value),
        updated_by: currentUser?.user?.id,
        updated_at: new Date()?.toISOString()
      })?.select()?.single();

    if (error) throw error;
    return data;
  },

  // Referral Management
  async getReferralStats() {
    const { data, error } = await supabase?.from('referrals')?.select(`
        *,
        referrer:referrer_id(email, full_name, level),
        referred:referred_id(email, full_name, level)
      `)?.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async processReferralBonuses() {
    // This calls the hidden referral bonus processing function
    const { data, error } = await supabase?.rpc('process_all_referral_bonuses');
    if (error) throw error;
    return data;
  },

  // Spin Wheel Management
  async getSpinHistory(date = null) {
    let query = supabase?.from('daily_spin_rewards')?.select(`
        *,
        user_profiles:user_profiles(email, full_name)
      `)?.order('created_at', { ascending: false });

    if (date) {
      query = query?.eq('spin_date', date);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Email Notifications
  async sendNotificationEmail(type, to, data) {
    const { data: result, error } = await supabase?.functions?.invoke('send-notification-email', {
      body: { type, to, data }
    });

    if (error) throw error;
    return result;
  },

  // Audit Logging
  async logAdminAction(action, tableName, recordId, data = {}) {
    const { data: currentUser } = await supabase?.auth?.getUser();
    
    await supabase?.from('audit_logs')?.insert({
      admin_id: currentUser?.user?.id,
      action,
      table_name: tableName,
      record_id: recordId,
      new_values: data
    });
  },

  async getAuditLogs(limit = 100) {
    const { data, error } = await supabase?.from('audit_logs')?.select(`
        *,
        user_profiles:user_profiles(email, full_name)
      `)?.order('created_at', { ascending: false })?.limit(limit);

    if (error) throw error;
    return data;
  },

  // Analytics
  async getDashboardStats() {
    try {
      // Get basic stats
      const [usersResult, tasksResult, withdrawalsResult, transactionsResult] = await Promise.all([
        supabase?.from('user_profiles')?.select('id, status, approval_status, created_at'),
        supabase?.from('tasks')?.select('id, status, created_at'),
        supabase?.from('transactions')?.select('id, type, amount, status, created_at')?.eq('type', 'withdrawal'),
        supabase?.from('transactions')?.select('id, amount, status, created_at')?.eq('status', 'completed')
      ]);

      const users = usersResult?.data || [];
      const tasks = tasksResult?.data || [];
      const withdrawals = withdrawalsResult?.data || [];
      const transactions = transactionsResult?.data || [];

      // Calculate stats
      const totalUsers = users?.length;
      const pendingApprovals = users?.filter(u => u?.approval_status === 'pending')?.length;
      const activeTasks = tasks?.filter(t => t?.status === 'pending' || t?.status === 'in_progress')?.length;
      const pendingWithdrawals = withdrawals?.filter(w => w?.status === 'pending')?.length;
      const totalRevenue = transactions?.reduce((sum, t) => sum + (parseFloat(t?.amount) || 0), 0);

      // Recent activity (last 10 activities)
      const recentActivity = [
        ...users?.slice(-5)?.map(u => ({
          type: 'user_registration',
          description: `New user registration: ${u?.id}`,
          timestamp: u?.created_at
        })),
        ...tasks?.slice(-3)?.map(t => ({
          type: 'task_created',
          description: `New task: ${t?.id}`,
          timestamp: t?.created_at
        })),
        ...withdrawals?.slice(-2)?.map(w => ({
          type: 'withdrawal_request',
          description: `Withdrawal request: ${w?.amount}`,
          timestamp: w?.created_at
        }))
      ]?.sort((a, b) => new Date(b?.timestamp) - new Date(a?.timestamp))?.slice(0, 10);

      return {
        success: true,
        stats: {
          totalUsers,
          pendingApprovals,
          activeTasks,
          pendingWithdrawals,
          totalRevenue,
          recentActivity
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch dashboard statistics'
      };
    }
  },

  // Get pending user approvals
  async getPendingUserApprovals() {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select(`
          id,
          full_name,
          email,
          created_at,
          approval_status,
          email_verified,
          status
        `)?.eq('approval_status', 'pending')?.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        success: true,
        users: data || [],
        count: data?.length || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch pending users'
      };
    }
  },

  // Approve user
  async approveUser(userId, adminId) {
    try {
      const { data, error } = await supabase?.rpc('approve_user', {
        target_user_id: userId,
        admin_id: adminId
      });

      if (error) {
        throw error;
      }

      if (data) {
        return {
          success: true,
          message: 'User approved and welcome bonus sent successfully'
        };
      } else {
        return {
          success: false,
          error: 'Failed to approve user. Check permissions.'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to approve user'
      };
    }
  },

  // Reject user
  async rejectUser(userId, adminId, reason = '') {
    try {
      const { data, error } = await supabase?.rpc('reject_user', {
        target_user_id: userId,
        admin_id: adminId,
        rejection_reason: reason
      });

      if (error) {
        throw error;
      }

      if (data) {
        return {
          success: true,
          message: 'User rejected successfully'
        };
      } else {
        return {
          success: false,
          error: 'Failed to reject user. Check permissions.'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to reject user'
      };
    }
  },

  // Get user approval history
  async getUserApprovalHistory() {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select(`
          id,
          full_name,
          email,
          approval_status,
          approved_at,
          approved_by,
          created_at,
          approver:approved_by(full_name, email)
        `)?.not('approval_status', 'eq', 'pending')?.order('approved_at', { ascending: false })?.limit(50);

      if (error) {
        throw error;
      }

      return {
        success: true,
        history: data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch approvals log'
      };
    }
  },

  // Get user verification status
  async getUserVerificationStatus(userId) {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select(`
          id,
          email_verified,
          approval_status,
          status,
          created_at,
          approved_at
        `)?.eq('id', userId)?.single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        verification: data
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to fetch verification status'
      };
    }
  },

  // Create test user for admin testing
  async createTestUser(userData) {
    try {
      const { data, error } = await supabase?.auth?.admin?.createUser({
        email: userData?.email,
        password: userData?.password,
        user_metadata: {
          full_name: userData?.fullName || 'Test User',
          role: userData?.role || 'user'
        },
        email_confirm: false // Require email verification
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Test user created successfully',
        user: data?.user
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Failed to create test user'
      };
    }
  }
};

export default adminService;