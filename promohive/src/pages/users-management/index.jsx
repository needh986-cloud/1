import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import MobileDrawer from '../../components/ui/MobileDrawer';
import Breadcrumb from '../../components/ui/Breadcrumb';
import UserStats from './components/UserStats';
import UserFilters from './components/UserFilters';
import UserTable from './components/UserTable';
import UserDetailModal from './components/UserDetailModal';
import BulkActionModal from './components/BulkActionModal';

const UsersManagement = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('registrationDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    country: 'all',
    dateFrom: '',
    dateTo: '',
    minBalance: '',
    maxBalance: ''
  });

  // Mock user data
  const mockUsers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    avatar: "https://images.unsplash.com/photo-1734456611474-13245d164868",
    avatarAlt: "Professional headshot of woman with brown hair in business attire smiling at camera",
    referralCode: "USR001",
    registrationDate: "2024-10-15T10:30:00Z",
    status: "approved",
    country: "United States",
    balance: 1250.75,
    totalEarnings: 2840.50,
    referralEarnings: 450.25,
    referrals: 12,
    activeReferrals: 8,
    lastActivity: "2024-10-29T14:22:00Z",
    isOnline: true,
    recentReferrals: [
    { name: "Mike Chen", joinDate: "2024-10-28T09:15:00Z", earnings: 125.50 },
    { name: "Lisa Park", joinDate: "2024-10-27T16:30:00Z", earnings: 89.25 }],

    recentTransactions: [
    { type: "credit", description: "Task Completion Bonus", amount: 25.00, date: "2024-10-29T12:00:00Z", status: "completed" },
    { type: "credit", description: "Referral Bonus", amount: 15.50, date: "2024-10-28T18:45:00Z", status: "completed" }]

  },
  {
    id: 2,
    name: "Michael Rodriguez",
    email: "michael.rodriguez@email.com",
    avatar: "https://images.unsplash.com/photo-1724128195747-dd25cba7860f",
    avatarAlt: "Professional headshot of Hispanic man with short black hair in navy suit",
    referralCode: "USR002",
    registrationDate: "2024-10-20T15:45:00Z",
    status: "pending",
    country: "Mexico",
    balance: 0.00,
    totalEarnings: 0.00,
    referralEarnings: 0.00,
    referrals: 0,
    activeReferrals: 0,
    lastActivity: "2024-10-29T08:15:00Z",
    isOnline: false,
    recentReferrals: [],
    recentTransactions: []
  },
  {
    id: 3,
    name: "Emma Thompson",
    email: "emma.thompson@email.com",
    avatar: "https://images.unsplash.com/photo-1684262855358-88f296a2cfc2",
    avatarAlt: "Professional headshot of blonde woman in white blazer smiling confidently",
    referralCode: "USR003",
    registrationDate: "2024-10-12T09:20:00Z",
    status: "approved",
    country: "United Kingdom",
    balance: 2150.30,
    totalEarnings: 4320.80,
    referralEarnings: 890.40,
    referrals: 25,
    activeReferrals: 18,
    lastActivity: "2024-10-29T16:45:00Z",
    isOnline: true,
    recentReferrals: [
    { name: "James Wilson", joinDate: "2024-10-26T11:20:00Z", earnings: 245.75 },
    { name: "Sophie Davis", joinDate: "2024-10-25T14:10:00Z", earnings: 156.30 }],

    recentTransactions: [
    { type: "credit", description: "Weekly Bonus", amount: 50.00, date: "2024-10-29T10:00:00Z", status: "completed" },
    { type: "debit", description: "Withdrawal Request", amount: -200.00, date: "2024-10-28T14:30:00Z", status: "processing" }]

  },
  {
    id: 4,
    name: "David Kim",
    email: "david.kim@email.com",
    avatar: "https://images.unsplash.com/photo-1637080423110-6736ee5705ed",
    avatarAlt: "Professional headshot of Asian man with glasses in dark suit jacket",
    referralCode: "USR004",
    registrationDate: "2024-10-25T12:10:00Z",
    status: "suspended",
    country: "South Korea",
    balance: 450.20,
    totalEarnings: 1280.60,
    referralEarnings: 120.40,
    referrals: 5,
    activeReferrals: 2,
    lastActivity: "2024-10-27T20:30:00Z",
    isOnline: false,
    recentReferrals: [
    { name: "Anna Lee", joinDate: "2024-10-24T13:45:00Z", earnings: 78.20 }],

    recentTransactions: [
    { type: "credit", description: "Task Reward", amount: 12.50, date: "2024-10-27T15:20:00Z", status: "completed" }]

  },
  {
    id: 5,
    name: "Maria Garcia",
    email: "maria.garcia@email.com",
    avatar: "https://images.unsplash.com/photo-1672935694100-5b6092e923a0",
    avatarAlt: "Professional headshot of Latina woman with long dark hair in burgundy top",
    referralCode: "USR005",
    registrationDate: "2024-10-18T14:25:00Z",
    status: "approved",
    country: "Spain",
    balance: 890.45,
    totalEarnings: 1650.90,
    referralEarnings: 280.15,
    referrals: 8,
    activeReferrals: 6,
    lastActivity: "2024-10-29T11:20:00Z",
    isOnline: true,
    recentReferrals: [
    { name: "Carlos Mendez", joinDate: "2024-10-27T09:30:00Z", earnings: 95.40 },
    { name: "Ana Ruiz", joinDate: "2024-10-26T16:15:00Z", earnings: 67.80 }],

    recentTransactions: [
    { type: "credit", description: "Referral Bonus", amount: 18.75, date: "2024-10-29T09:45:00Z", status: "completed" },
    { type: "credit", description: "Daily Login Bonus", amount: 5.00, date: "2024-10-29T08:00:00Z", status: "completed" }]

  }];


  // Mock stats data
  const mockStats = {
    totalUsers: 1247,
    pendingUsers: 23,
    activeUsers: 1198,
    suspendedUsers: 26,
    userGrowth: 12.5,
    pendingChange: -8.2,
    activeGrowth: 15.3,
    suspendedChange: -5.1
  };

  const [users, setUsers] = useState(mockUsers);
  const [stats, setStats] = useState(mockStats);

  // Filter and sort users
  const filteredUsers = users?.filter((user) => {
    const matchesSearch = !filters?.search ||
    user?.name?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
    user?.email?.toLowerCase()?.includes(filters?.search?.toLowerCase()) ||
    user?.referralCode?.toLowerCase()?.includes(filters?.search?.toLowerCase());

    const matchesStatus = filters?.status === 'all' || user?.status === filters?.status;
    const matchesCountry = filters?.country === 'all' || user?.country === filters?.country;

    const matchesDateRange = (!filters?.dateFrom || new Date(user.registrationDate) >= new Date(filters.dateFrom)) && (
    !filters?.dateTo || new Date(user.registrationDate) <= new Date(filters.dateTo));

    const matchesBalance = (!filters?.minBalance || user?.balance >= parseFloat(filters?.minBalance)) && (
    !filters?.maxBalance || user?.balance <= parseFloat(filters?.maxBalance));

    return matchesSearch && matchesStatus && matchesCountry && matchesDateRange && matchesBalance;
  })?.sort((a, b) => {
    let aValue = a?.[sortBy];
    let bValue = b?.[sortBy];

    if (sortBy === 'registrationDate' || sortBy === 'lastActivity') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleUserSelect = (userId, isSelected) => {
    if (isSelected) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers?.filter((id) => id !== userId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedUsers(filteredUsers?.map((user) => user?.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleUserAction = (action, userId) => {
    if (action === 'approve') {
      setUsers(users?.map((user) =>
      user?.id === userId ? { ...user, status: 'approved' } : user
      ));
    } else if (action === 'suspend') {
      setUsers(users?.map((user) =>
      user?.id === userId ? { ...user, status: 'suspended' } : user
      ));
    } else if (action === 'message') {
      // Handle message action
      console.log('Send message to user:', userId);
    }
  };

  const handleBulkAction = (action, userIds) => {
    setBulkAction(action);
    setIsBulkModalOpen(true);
  };

  const handleBulkConfirm = (data) => {
    const { action, userIds } = data;

    if (action === 'approve') {
      setUsers(users?.map((user) =>
      userIds?.includes(user?.id) ? { ...user, status: 'approved' } : user
      ));
    } else if (action === 'suspend') {
      setUsers(users?.map((user) =>
      userIds?.includes(user?.id) ? { ...user, status: 'suspended' } : user
      ));
    } else if (action === 'message') {
      // Handle bulk message
      console.log('Send bulk message:', data);
    } else if (action === 'export') {
      // Handle export
      console.log('Export users:', userIds);
    }

    setSelectedUsers([]);
    setIsBulkModalOpen(false);
    setBulkAction(null);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleUserUpdate = (userId, updateData) => {
    setUsers(users?.map((user) =>
    user?.id === userId ? { ...user, ...updateData } : user
    ));
  };

  const handleExport = () => {
    // Handle export functionality
    console.log('Export all users');
  };

  const handleSort = (column, order) => {
    setSortBy(column);
    setSortOrder(order);
  };

  return (
    <>
      <Helmet>
        <title>Users Management - PromoHive Admin</title>
        <meta name="description" content="Manage user accounts, process approvals, and oversee user activities in PromoHive admin panel" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMenuOpen={isMobileMenuOpen} />

        
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

        
        <MobileDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)} />


        <main className={`pt-16 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'}`
        }>
          <div className="p-6">
            <div className="mb-6">
              <Breadcrumb />
              <div className="flex items-center justify-between mt-4">
                <div>
                  <h1 className="text-3xl font-bold gradient-text">Users Management</h1>
                  <p className="text-text-secondary mt-2">
                    Manage user accounts, process approvals, and oversee platform activities
                  </p>
                </div>
              </div>
            </div>

            <UserStats stats={stats} />

            <UserFilters
              filters={filters}
              onFiltersChange={setFilters}
              onExport={handleExport}
              onBulkAction={handleBulkAction}
              selectedUsers={selectedUsers} />


            <UserTable
              users={filteredUsers}
              selectedUsers={selectedUsers}
              onUserSelect={handleUserSelect}
              onSelectAll={handleSelectAll}
              onUserAction={handleUserAction}
              onViewDetails={handleViewDetails}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort} />

          </div>
        </main>

        <UserDetailModal
          user={selectedUser}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedUser(null);
          }}
          onUserUpdate={handleUserUpdate} />


        <BulkActionModal
          isOpen={isBulkModalOpen}
          onClose={() => {
            setIsBulkModalOpen(false);
            setBulkAction(null);
          }}
          action={bulkAction}
          selectedUsers={selectedUsers}
          onConfirm={handleBulkConfirm} />

      </div>
    </>);

};

export default UsersManagement;