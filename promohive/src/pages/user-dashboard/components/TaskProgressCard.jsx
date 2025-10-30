import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TaskProgressCard = ({ stats, loading = false }) => {
  const progressItems = [
    {
      label: 'Available Tasks',
      value: stats?.availableTasks || 0,
      icon: 'Search',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Completed Tasks',
      value: stats?.completedTasks || 0,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Pending Proofs',
      value: stats?.pendingProofs || 0,
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ];

  return (
    <div className="glass rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Task Progress</h3>
        <Link to="/tasks-list">
          <Button variant="outline" size="sm" iconName="ArrowRight" iconPosition="right">
            Browse Tasks
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {progressItems?.map((item, index) => (
          <div key={index} className="text-center">
            {loading ? (
              <div className="space-y-2">
                <div className="w-12 h-12 bg-muted/30 rounded-full mx-auto animate-pulse" />
                <div className="h-4 bg-muted/30 rounded animate-pulse" />
                <div className="h-6 bg-muted/30 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <div className={`w-12 h-12 ${item?.bgColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <Icon name={item?.icon} size={20} className={item?.color} />
                </div>
                <p className="text-sm text-text-secondary">{item?.label}</p>
                <p className="text-2xl font-bold text-foreground">{item?.value}</p>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link to="/proofs-management">
          <Button variant="outline" fullWidth iconName="Upload" iconPosition="left">
            Submit Proof
          </Button>
        </Link>
        <Link to="/referrals-management">
          <Button variant="secondary" fullWidth iconName="Users" iconPosition="left">
            Referrals
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default TaskProgressCard;