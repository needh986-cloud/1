import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const UserDetailModal = ({ user, isOpen, onClose, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  if (!isOpen || !user) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'User' },
    { id: 'referrals', label: 'Referrals', icon: 'Users' },
    { id: 'transactions', label: 'Transactions', icon: 'CreditCard' },
    { id: 'proofs', label: 'Proofs', icon: 'FileText' },
    { id: 'notes', label: 'Admin Notes', icon: 'StickyNote' }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-warning/10 text-warning border-warning/20', icon: 'Clock' },
      approved: { color: 'bg-success/10 text-success border-success/20', icon: 'CheckCircle' },
      suspended: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: 'XCircle' }
    };

    const config = statusConfig?.[status] || statusConfig?.pending;
    
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${config?.color}`}>
        <Icon name={config?.icon} size={12} />
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })?.format(amount);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      name: user?.name,
      email: user?.email,
      status: user?.status,
      balance: user?.balance
    });
  };

  const handleSave = () => {
    onUserUpdate(user?.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="glass rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-foreground">Basic Information</h4>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={handleEdit} iconName="Edit">
              Edit
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleSave}>
                Save
              </Button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {isEditing ? (
              <Input
                label="Full Name"
                value={editData?.name}
                onChange={(e) => setEditData({...editData, name: e?.target?.value})}
              />
            ) : (
              <div>
                <label className="text-sm font-medium text-text-secondary">Full Name</label>
                <p className="text-foreground">{user?.name}</p>
              </div>
            )}
            
            {isEditing ? (
              <Input
                label="Email Address"
                type="email"
                value={editData?.email}
                onChange={(e) => setEditData({...editData, email: e?.target?.value})}
              />
            ) : (
              <div>
                <label className="text-sm font-medium text-text-secondary">Email Address</label>
                <p className="text-foreground">{user?.email}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-text-secondary">Referral Code</label>
              <p className="text-foreground font-data">{user?.referralCode}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-text-secondary">Registration Date</label>
              <p className="text-foreground">{formatDate(user?.registrationDate)}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-secondary">Status</label>
              <div className="mt-1">
                {getStatusBadge(user?.status)}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-text-secondary">Country</label>
              <p className="text-foreground flex items-center space-x-2">
                <Icon name="MapPin" size={16} />
                <span>{user?.country}</span>
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-text-secondary">Last Activity</label>
              <p className="text-foreground">{formatDate(user?.lastActivity)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-text-secondary">Online Status</label>
              <p className="text-foreground flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${user?.isOnline ? 'bg-success' : 'bg-text-secondary'}`}></div>
                <span>{user?.isOnline ? 'Online' : 'Offline'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="glass rounded-lg p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">Financial Overview</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 glass rounded-lg">
            <Icon name="Wallet" size={24} className="text-primary mx-auto mb-2" />
            <p className="text-sm text-text-secondary">Current Balance</p>
            <p className="text-xl font-bold text-foreground font-data">{formatCurrency(user?.balance)}</p>
          </div>
          
          <div className="text-center p-4 glass rounded-lg">
            <Icon name="TrendingUp" size={24} className="text-success mx-auto mb-2" />
            <p className="text-sm text-text-secondary">Total Earnings</p>
            <p className="text-xl font-bold text-foreground font-data">{formatCurrency(user?.totalEarnings)}</p>
          </div>
          
          <div className="text-center p-4 glass rounded-lg">
            <Icon name="Users" size={24} className="text-secondary mx-auto mb-2" />
            <p className="text-sm text-text-secondary">Referral Earnings</p>
            <p className="text-xl font-bold text-foreground font-data">{formatCurrency(user?.referralEarnings)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReferralsTab = () => (
    <div className="space-y-6">
      <div className="glass rounded-lg p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">Referral Network</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-text-secondary mb-2">Total Referrals</p>
            <p className="text-2xl font-bold text-foreground">{user?.referrals}</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-2">Active Referrals</p>
            <p className="text-2xl font-bold text-success">{user?.activeReferrals}</p>
          </div>
        </div>
      </div>
      
      <div className="glass rounded-lg p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">Recent Referrals</h4>
        <div className="space-y-3">
          {user?.recentReferrals?.map((referral, index) => (
            <div key={index} className="flex items-center justify-between p-3 glass rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {referral?.name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{referral?.name}</p>
                  <p className="text-xs text-text-secondary">{formatDate(referral?.joinDate)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-data text-success">{formatCurrency(referral?.earnings)}</p>
                <p className="text-xs text-text-secondary">Earned</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTransactionsTab = () => (
    <div className="space-y-6">
      <div className="glass rounded-lg p-6">
        <h4 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h4>
        <div className="space-y-3">
          {user?.recentTransactions?.map((transaction, index) => (
            <div key={index} className="flex items-center justify-between p-3 glass rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  transaction?.type === 'credit' ? 'bg-success/20' : 'bg-destructive/20'
                }`}>
                  <Icon 
                    name={transaction?.type === 'credit' ? 'Plus' : 'Minus'} 
                    size={16} 
                    className={transaction?.type === 'credit' ? 'text-success' : 'text-destructive'}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{transaction?.description}</p>
                  <p className="text-xs text-text-secondary">{formatDate(transaction?.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-data ${
                  transaction?.type === 'credit' ? 'text-success' : 'text-destructive'
                }`}>
                  {transaction?.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(transaction?.amount))}
                </p>
                <p className="text-xs text-text-secondary capitalize">{transaction?.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      {/* Modal */}
      <div className="fixed inset-4 md:inset-8 lg:inset-16 glass rounded-lg border border-border z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
              <Image
                src={user?.avatar}
                alt={user?.avatarAlt}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
              <p className="text-text-secondary">{user?.email}</p>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={24} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab?.id
                  ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-foreground'
              }`}
            >
              <Icon name={tab?.icon} size={16} />
              <span>{tab?.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'referrals' && renderReferralsTab()}
          {activeTab === 'transactions' && renderTransactionsTab()}
          {activeTab === 'proofs' && (
            <div className="text-center py-12">
              <Icon name="FileText" size={48} className="text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary">Proof submissions will be displayed here.</p>
            </div>
          )}
          {activeTab === 'notes' && (
            <div className="text-center py-12">
              <Icon name="StickyNote" size={48} className="text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary">Admin notes will be displayed here.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserDetailModal;