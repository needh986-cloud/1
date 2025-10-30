import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import MetricCard from './components/MetricCard';
import QuickActionPanel from './components/QuickActionPanel';
import ActivityFeed from './components/ActivityFeed';
import AnalyticsChart from './components/AnalyticsChart';
import SystemMonitoring from './components/SystemMonitoring';
import AdminShortcuts from './components/AdminShortcuts';

const AdminDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Simulate admin user data
    const userData = {
      name: "Admin User",
      email: "admin@promohive.com",
      role: "SUPER_ADMIN",
      lastLogin: new Date(Date.now() - 3600000),
      permissions: ["USER_MANAGEMENT", "TASK_MANAGEMENT", "FINANCIAL_OVERSIGHT", "SYSTEM_CONFIG"]
    };
    setAdminUser(userData);

    return () => clearInterval(timer);
  }, []);

  // Mock platform metrics
  const platformMetrics = [
    {
      title: "Total Users",
      value: 12847,
      change: "+12.5%",
      changeType: "positive",
      icon: "Users",
      iconColor: "text-primary",
      description: "Active registered users",
      trend: true
    },
    {
      title: "Pending Approvals",
      value: 23,
      change: "+5",
      changeType: "warning",
      icon: "UserCheck",
      iconColor: "text-warning",
      description: "Awaiting admin review",
      trend: true
    },
    {
      title: "Active Tasks",
      value: 89,
      change: "+8.2%",
      changeType: "positive",
      icon: "CheckSquare",
      iconColor: "text-success",
      description: "Currently available tasks",
      trend: true
    },
    {
      title: "Platform Revenue",
      value: "$45,230",
      change: "+15.3%",
      changeType: "positive",
      icon: "DollarSign",
      iconColor: "text-success",
      description: "This month\'s earnings",
      trend: true
    },
    {
      title: "Withdrawal Requests",
      value: 12,
      change: "-3",
      changeType: "positive",
      icon: "CreditCard",
      iconColor: "text-secondary",
      description: "Pending USDT withdrawals",
      trend: true
    },
    {
      title: "Proof Reviews",
      value: 47,
      change: "+18",
      changeType: "warning",
      icon: "Eye",
      iconColor: "text-warning",
      description: "Awaiting verification",
      trend: true
    }
  ];

  const formatDateTime = (date) => {
    return date?.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - PromoHive</title>
        <meta name="description" content="Comprehensive administrative dashboard for PromoHive platform management, user oversight, and system monitoring." />
      </Helmet>
      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <div className="glass border-b border-border p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Icon name="Shield" size={24} color="white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                  <p className="text-text-secondary">
                    Welcome back, {adminUser?.name || 'Administrator'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-text-secondary">
                {formatDateTime(currentTime)}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg glass">
                <Icon name="Clock" size={16} className="text-success" />
                <span className="text-sm text-success font-medium">
                  Last login: {adminUser?.lastLogin ? 
                    new Date(adminUser.lastLogin)?.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : 'N/A'}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" iconName="Download" iconPosition="left">
                  Export Report
                </Button>
                <Button variant="default" size="sm" iconName="Settings" iconPosition="left">
                  System Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-8">
          {/* Platform Metrics Grid */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Platform Overview</h2>
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span>Real-time data</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {platformMetrics?.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </div>
          </section>

          {/* Analytics and Quick Actions */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <AnalyticsChart />
            </div>
            <div>
              <QuickActionPanel />
            </div>
          </section>

          {/* Activity Feed and Admin Shortcuts */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <ActivityFeed />
            <AdminShortcuts 
              onActionClick={(action) => console.log('Admin action:', action)}
              stats={{
                totalUsers: 12847,
                pendingApprovals: 23,
                activeTasks: 89,
                withdrawalRequests: 12
              }}
            />
          </section>

          {/* System Monitoring */}
          <section>
            <SystemMonitoring />
          </section>

          {/* Footer Information */}
          <section className="glass rounded-xl p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <Icon name="Info" size={20} className="text-primary" />
                <div>
                  <h3 className="font-medium text-foreground">Platform Status</h3>
                  <p className="text-sm text-text-secondary">
                    All systems operational • Last updated: {currentTime?.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-text-secondary">
                <div className="flex items-center space-x-2">
                  <Icon name="Server" size={16} className="text-success" />
                  <span>Server: Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Database" size={16} className="text-success" />
                  <span>Database: Healthy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Wifi" size={16} className="text-success" />
                  <span>API: Responsive</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;