import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Button from '../../components/ui/Button';
import BalanceCard from './components/BalanceCard';
import TransactionTable from './components/TransactionTable';
import FilterControls from './components/FilterControls';
import EarningsChart from './components/EarningsChart';
import QuickActions from './components/QuickActions';

const WalletOverview = () => {
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});

  // Mock wallet data
  const walletData = {
    availableBalance: 1247.85,
    pendingBalance: 156.30,
    totalEarnings: 3892.45,
    usdtRate: 0.9998,
    withdrawalFee: 2.5
  };

  // Mock transaction data
  const mockTransactions = [
    {
      id: 'TXN001',
      date: '2024-10-29T14:30:00Z',
      type: 'signup_bonus',
      description: 'Welcome bonus for new account registration',
      amount: 10.00,
      status: 'completed',
      reference: 'SB2024102901'
    },
    {
      id: 'TXN002',
      date: '2024-10-29T10:15:00Z',
      type: 'task_reward',
      description: 'AdGem - Mobile Game Installation Task #AG4521',
      amount: 2.50,
      status: 'completed',
      reference: 'TR2024102902'
    },
    {
      id: 'TXN003',
      date: '2024-10-28T16:45:00Z',
      type: 'referral_bonus',
      description: 'Level 1 referral bonus from user john_doe_2024',
      amount: 5.00,
      status: 'completed',
      reference: 'RB2024102801'
    },
    {
      id: 'TXN004',
      date: '2024-10-28T09:20:00Z',
      type: 'task_reward',
      description: 'Manual Task - Social Media Engagement #MT1205',
      amount: 1.75,
      status: 'pending',
      reference: 'TR2024102803'
    },
    {
      id: 'TXN005',
      date: '2024-10-27T13:10:00Z',
      type: 'withdrawal',
      description: 'USDT withdrawal to wallet address 0x742d...8f3a',
      amount: -50.00,
      status: 'completed',
      reference: 'WD2024102701'
    },
    {
      id: 'TXN006',
      date: '2024-10-27T11:30:00Z',
      type: 'task_reward',
      description: 'AdSterra - Survey Completion Task #AS7892',
      amount: 3.25,
      status: 'completed',
      reference: 'TR2024102704'
    },
    {
      id: 'TXN007',
      date: '2024-10-26T15:55:00Z',
      type: 'referral_bonus',
      description: 'Level 2 referral bonus from user sarah_m_2024',
      amount: 2.50,
      status: 'completed',
      reference: 'RB2024102602'
    },
    {
      id: 'TXN008',
      date: '2024-10-26T08:40:00Z',
      type: 'task_reward',
      description: 'CPALead - Email Subscription Task #CP3456',
      amount: 1.50,
      status: 'failed',
      reference: 'TR2024102605'
    }
  ];

  // Mock earnings chart data
  const earningsData = [
    { date: 'Oct 22', earnings: 12.50 },
    { date: 'Oct 23', earnings: 18.75 },
    { date: 'Oct 24', earnings: 15.30 },
    { date: 'Oct 25', earnings: 22.40 },
    { date: 'Oct 26', earnings: 19.85 },
    { date: 'Oct 27', earnings: 25.60 },
    { date: 'Oct 28', earnings: 21.30 },
    { date: 'Oct 29', earnings: 16.75 }
  ];

  // Mock income source data
  const sourceData = [
    { name: 'Task Rewards', value: 2847.30 },
    { name: 'Referral Bonuses', value: 892.15 },
    { name: 'Daily Rewards', value: 143.00 },
    { name: 'Signup Bonus', value: 10.00 }
  ];

  useEffect(() => {
    setFilteredTransactions(mockTransactions);
  }, []);

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
    
    let filtered = [...mockTransactions];

    // Apply date filters
    if (filters?.dateFrom) {
      filtered = filtered?.filter(t => new Date(t.date) >= new Date(filters.dateFrom));
    }
    if (filters?.dateTo) {
      filtered = filtered?.filter(t => new Date(t.date) <= new Date(filters.dateTo));
    }

    // Apply type filter
    if (filters?.type) {
      filtered = filtered?.filter(t => t?.type === filters?.type);
    }

    // Apply status filter
    if (filters?.status) {
      filtered = filtered?.filter(t => t?.status === filters?.status);
    }

    // Apply amount filters
    if (filters?.minAmount) {
      filtered = filtered?.filter(t => Math.abs(t?.amount) >= parseFloat(filters?.minAmount));
    }
    if (filters?.maxAmount) {
      filtered = filtered?.filter(t => Math.abs(t?.amount) <= parseFloat(filters?.maxAmount));
    }

    setFilteredTransactions(filtered);
  };

  const handleFilterReset = () => {
    setFilteredTransactions(mockTransactions);
    setActiveFilters({});
  };

  const handleExportTransactions = () => {
    // Mock export functionality
    const csvContent = [
      ['Date', 'Type', 'Description', 'Amount', 'Status', 'Reference'],
      ...filteredTransactions?.map(t => [
        new Date(t.date)?.toLocaleDateString(),
        t?.type?.replace('_', ' '),
        t?.description,
        t?.amount,
        t?.status,
        t?.reference
      ])
    ]?.map(row => row?.join(','))?.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL?.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-transactions-${new Date()?.toISOString()?.split('T')?.[0]}.csv`;
    a?.click();
    window.URL?.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Wallet Overview</h1>
              <p className="text-text-secondary mt-2">
                Manage your earnings, track transactions, and process withdrawals
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                iconName="RefreshCw"
                iconPosition="left"
                onClick={() => window.location?.reload()}
              >
                Refresh
              </Button>
              <Link to="/withdrawal-request">
                <Button
                  variant="default"
                  iconName="ArrowUpRight"
                  iconPosition="left"
                >
                  Withdraw Funds
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <BalanceCard
                title="Available Balance"
                amount={walletData?.availableBalance}
                icon="Wallet"
                iconColor="text-success"
                bgGradient={true}
                description="Ready for withdrawal"
                trend={{ isPositive: true, percentage: 12.5 }}
                actionButton={
                  <Link to="/withdrawal-request">
                    <Button variant="secondary" size="sm" fullWidth>
                      Withdraw
                    </Button>
                  </Link>
                }
              />
              
              <BalanceCard
                title="Pending Balance"
                amount={walletData?.pendingBalance}
                icon="Clock"
                iconColor="text-warning"
                description="Awaiting verification"
                trend={{ isPositive: false, percentage: 3.2 }}
              />
              
              <BalanceCard
                title="Total Earnings"
                amount={walletData?.totalEarnings}
                icon="TrendingUp"
                iconColor="text-primary"
                description="Lifetime earnings"
                trend={{ isPositive: true, percentage: 8.7 }}
              />
            </div>

            {/* Earnings Chart */}
            <EarningsChart 
              earningsData={earningsData}
              sourceData={sourceData}
            />

            {/* Filter Controls */}
            <FilterControls
              onFilterChange={handleFilterChange}
              onReset={handleFilterReset}
            />

            {/* Transaction Table */}
            <TransactionTable
              transactions={filteredTransactions}
              onExport={handleExportTransactions}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <QuickActions
              usdtRate={walletData?.usdtRate}
              withdrawalFee={walletData?.withdrawalFee}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletOverview;