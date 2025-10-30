import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionPanel = () => {
  const quickActions = [
    {
      title: "Pending User Approvals",
      count: 23,
      description: "New registrations awaiting approval",
      icon: "UserCheck",
      color: "text-warning",
      bgColor: "bg-warning/10",
      link: "/users-management",
      action: "Review Users"
    },
    {
      title: "Proof Reviews",
      count: 47,
      description: "Task proofs requiring verification",
      icon: "Eye",
      color: "text-primary",
      bgColor: "bg-primary/10",
      link: "/proofs-review",
      action: "Review Proofs"
    },
    {
      title: "Withdrawal Requests",
      count: 12,
      description: "USDT withdrawals pending processing",
      icon: "CreditCard",
      color: "text-success",
      bgColor: "bg-success/10",
      link: "/withdrawals-processing",
      action: "Process Withdrawals"
    },
    {
      title: "System Alerts",
      count: 3,
      description: "Critical system notifications",
      icon: "AlertTriangle",
      color: "text-error",
      bgColor: "bg-error/10",
      link: "#",
      action: "View Alerts"
    }
  ];

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
        <Icon name="Zap" size={20} className="text-primary" />
      </div>
      <div className="space-y-4">
        {quickActions?.map((action, index) => (
          <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/30 transition-colors">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-lg ${action?.bgColor} flex items-center justify-center`}>
                <Icon name={action?.icon} size={20} className={action?.color} />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-foreground">{action?.title}</h3>
                  {action?.count > 0 && (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${action?.bgColor} ${action?.color}`}>
                      {action?.count}
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-secondary">{action?.description}</p>
              </div>
            </div>
            <Link to={action?.link}>
              <Button variant="outline" size="sm">
                {action?.action}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActionPanel;