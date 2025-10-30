import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/adminService';
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
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    country: 'all',
    dateFrom: '',
    dateTo: '',
    minBalance: '',
    maxBalance: ''
  });

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    userGrowth: 0,
    pendingChange: 0,
    activeGrowth: 0,
    suspendedChange: 0
  });

  // Fetch users data
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await adminService.getUsers();
      
      // Transform data to match component structure
      const transformedUsers = usersData.map(u => ({
        id: u.id,
        name: u.full_name || 'N/A',
        email: u.email,
        avatar: u.avatar_url || "https://images.unsplash.com/photo-1734456611474-13245d164868",
        avatarAlt: `${u.full_name || 'User'} profile picture`,
        referralCode: u.referral_code || u.id,
        registrationDate: u.created_at,
        status: u.approval_status || u.status,
        country: u.country || 'N/A',
        balance: parseFloat(u.balance) || 0,
        totalEarnings: parseFloat(u.total_earned) || 0,
        referralEarnings: parseFloat(u.referral_earnings) || 0,
        referrals: u.total_referrals || 0,
        activeReferrals: u.active_referrals || 0,
        lastActivity: u.last_login || u.updated_at,
        isOnline: false,
        recentReferrals: [],
        recentTransactions: []
      }));
      
      setUsers(transformedUsers);

      // Calculate stats
      const totalUsers = transformedUsers.length;
      const pendingUsers = transformedUsers.filter(u => u.status === 'pending').length;
      const activeUsers = transformedUsers.filter(u => u.status === 'approved').length;
      const suspendedUsers = transformedUsers.filter(u => u.status === 'suspended' || u.status === 'rejected').length;

      setStats({
        totalUsers,
        pendingUsers,
        activeUsers,
        suspendedUsers,
        userGrowth: 0,
        pendingChange: 0,
        activeGrowth: 0,
        suspendedChange: 0
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error loading users data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleUserAction = async (action, userId) => {
    if (actionLoading) return;
    
    try {
      setActionLoading(true);

      if (action === 'approve') {
        const result = await adminService.approveUser(userId, user?.id);
        
        if (result.success) {
          alert('✅ User approved successfully');
          // Refresh users list
          await fetchUsers();
        } else {
          alert('❌ Error approving user: ' + result.error);
        }
      } else if (action === 'suspend' || action === 'reject') {
        const reason = prompt('Please enter reason for rejection/suspension (optional):');
        const result = await adminService.rejectUser(userId, user?.id, reason || '');
        
        if (result.success) {
          alert('✅ User rejected/suspended successfully');
          // Refresh users list
          await fetchUsers();
        } else {
          alert('❌ Error rejecting/suspending user: ' + result.error);
        }
      } else if (action === 'message') {
        // Handle message action
        console.log('Send message to user:', userId);
        alert('Messaging feature is under development');
      }
    } catch (error) {
      console.error('Error handling user action:', error);
      alert('❌ Error executing operation: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = (action, userIds) => {
    setBulkAction(action);
    setIsBulkModalOpen(true);
  };

  const handleBulkConfirm = async (data) => {
    const { action, userIds } = data;

    if (actionLoading) return;

    try {
      setActionLoading(true);

      if (action === 'approve') {
        // Approve multiple users
        let successCount = 0;
        let errorCount = 0;
        
        for (const userId of userIds) {
          const result = await adminService.approveUser(userId, user?.id);
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
        }
        
        alert(`✅ Successfully approved ${successCount} user(s)${errorCount > 0 ? `\n❌ Failed to approve ${errorCount} user(s)` : ''}`);
        await fetchUsers();
      } else if (action === 'suspend' || action === 'reject') {
        const reason = prompt('Please enter rejection reason (optional):');
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const userId of userIds) {
          const result = await adminService.rejectUser(userId, user?.id, reason || '');
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
        }
        
        alert(`✅ Successfully rejected/suspended ${successCount} user(s)${errorCount > 0 ? `\n❌ Failed to reject ${errorCount} user(s)` : ''}`);
        await fetchUsers();
      } else if (action === 'message') {
        // Handle bulk message
        console.log('Send bulk message:', data);
        alert('Bulk messaging feature is under development');
      } else if (action === 'export') {
        // Handle export
        console.log('Export users:', userIds);
        alert('Export feature is under development');
      }

      setSelectedUsers([]);
    } catch (error) {
      console.error('Error in bulk action:', error);
      alert('❌ Error executing bulk operation: ' + error.message);
    } finally {
      setActionLoading(false);
      setIsBulkModalOpen(false);
      setBulkAction(null);
    }
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

            {loading ? (
              <div className="glass rounded-lg border border-border p-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-text-secondary">جاري تحميل بيانات المستخدمين...</p>
                </div>
              </div>
            ) : (
              <UserTable
                users={filteredUsers}
                selectedUsers={selectedUsers}
                onUserSelect={handleUserSelect}
                onSelectAll={handleSelectAll}
                onUserAction={handleUserAction}
                onViewDetails={handleViewDetails}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
                loading={actionLoading} />
            )}
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