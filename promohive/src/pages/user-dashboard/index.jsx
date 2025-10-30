import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import BalanceCard from './components/BalanceCard';
import TaskProgressCard from './components/TaskProgressCard';
import RecentTransactions from './components/RecentTransactions';
import NotificationPanel from './components/NotificationPanel';
import QuickActions from './components/QuickActions';
import DailySpinWidget from './components/DailySpinWidget';
import { useAuth } from '../../contexts/AuthContext';

const UserDashboard = () => {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    balances: {
      current: 0,
      pending: 0,
      lifetime: 0
    },
    taskStats: {
      availableTasks: 0,
      completedTasks: 0,
      pendingProofs: 0
    },
    transactions: [],
    notifications: [],
    spinData: null
  });

  useEffect(() => {
    // Simulate API call to fetch dashboard data
    const fetchDashboardData = async () => {
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockData = {
        balances: {
          current: 1247.85,
          pending: 156.40,
          lifetime: 3892.75
        },
        taskStats: {
          availableTasks: 24,
          completedTasks: 87,
          pendingProofs: 3
        },
        transactions: [
          {
            id: 1,
            type: 'task_reward',
            description: 'AdGem Task Completion - Mobile Game Install',
            amount: 12.50,
            status: 'completed',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
          },
          {
            id: 2,
            type: 'referral_bonus',
            description: 'Level 1 Referral Bonus - John Smith',
            amount: 5.25,
            status: 'completed',
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
          },
          {
            id: 3,
            type: 'task_reward',
            description: 'Manual Task - Social Media Follow',
            amount: 2.00,
            status: 'pending',
            createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
          },
          {
            id: 4,
            type: 'withdrawal',
            description: 'USDT Withdrawal to Wallet',
            amount: 50.00,
            status: 'completed',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
          },
          {
            id: 5,
            type: 'signup_bonus',
            description: 'Welcome Bonus - Account Registration',
            amount: 10.00,
            status: 'completed',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
          },
          {
            id: 6,
            type: 'task_reward',
            description: 'AdSterra Task - Survey Completion',
            amount: 8.75,
            status: 'rejected',
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
          }
        ],
        notifications: [
          {
            id: 1,
            type: 'success',
            title: 'Task Approved',
            message: 'Your AdGem mobile game installation task has been approved and $12.50 has been added to your balance.',
            read: false,
            createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
          },
          {
            id: 2,
            type: 'approval',
            title: 'Account Status Update',
            message: 'Congratulations! Your account has been fully verified and approved. You now have access to all premium tasks and higher earning opportunities.',
            read: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
          },
          {
            id: 3,
            type: 'task',
            title: 'New High-Paying Tasks Available',
            message: 'We have added 5 new high-paying tasks to the marketplace. Complete them before they reach the participant limit!',
            read: true,
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
          },
          {
            id: 4,
            type: 'withdrawal',
            title: 'Withdrawal Processed',
            message: 'Your USDT withdrawal of $50.00 has been successfully processed and sent to your wallet address ending in ...7x9A.',
            read: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
          },
          {
            id: 5,
            type: 'warning',
            title: 'Proof Submission Reminder',
            message: 'You have 3 pending task proofs that need to be submitted within 24 hours to avoid task expiration.',
            read: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
          }
        ],
        spinData: {
          canSpin: true,
          maxPrize: 25.00,
          nextSpinIn: null,
          todaySpins: 1,
          maxSpins: 3,
          todayWinnings: 5.50
        }
      };
      
      setDashboardData(mockData);
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  const balanceChanges = {
    current: { type: 'increase', value: 8.5 },
    pending: { type: 'increase', value: 12.3 },
    lifetime: { type: 'increase', value: 15.7 }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - PromoHive</title>
        <meta name="description" content="View your earnings, task progress, and account activity on PromoHive dashboard" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Welcome Back to PromoHive
            </h1>
            <p className="text-text-secondary">
              Track your earnings, complete tasks, and grow your income
            </p>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BalanceCard
              title="Current Balance"
              amount={dashboardData?.balances?.current}
              icon="Wallet"
              gradient={true}
              change={balanceChanges?.current}
              loading={loading}
            />
            <BalanceCard
              title="Pending Earnings"
              amount={dashboardData?.balances?.pending}
              icon="Clock"
              change={balanceChanges?.pending}
              loading={loading}
            />
            <BalanceCard
              title="Lifetime Earnings"
              amount={dashboardData?.balances?.lifetime}
              icon="TrendingUp"
              change={balanceChanges?.lifetime}
              loading={loading}
            />
          </div>

          {/* Task Progress and Daily Spin */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TaskProgressCard 
                stats={dashboardData?.taskStats} 
                loading={loading} 
              />
            </div>
            <div>
              <DailySpinWidget 
                spinData={dashboardData?.spinData} 
                loading={loading} 
              />
            </div>
          </div>

          {/* Quick Actions */}
          <QuickActions 
            userStats={{
              currentBalance: dashboardData?.balances?.current,
              hasPendingTasks: dashboardData?.taskStats?.pendingProofs > 0
            }}
          />

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentTransactions 
              transactions={dashboardData?.transactions} 
              loading={loading} 
            />
            <NotificationPanel 
              notifications={dashboardData?.notifications} 
              loading={loading} 
            />
          </div>

          {/* Stats Summary */}
          <div className="glass rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Account Summary</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {loading ? '...' : dashboardData?.taskStats?.completedTasks}
                </p>
                <p className="text-sm text-text-secondary">Tasks Completed</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-success">
                  {loading ? '...' : `$${dashboardData?.balances?.lifetime?.toFixed(0)}`}
                </p>
                <p className="text-sm text-text-secondary">Total Earned</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">
                  {loading ? '...' : Math.floor(dashboardData?.balances?.lifetime / 50)}
                </p>
                <p className="text-sm text-text-secondary">Referrals</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">
                  {loading ? '...' : Math.floor(dashboardData?.balances?.lifetime / 100)}
                </p>
                <p className="text-sm text-text-secondary">Withdrawals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;