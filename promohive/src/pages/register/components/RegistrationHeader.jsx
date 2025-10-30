import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const RegistrationHeader = () => {
  return (
    <div className="text-center space-y-6 mb-8">
      {/* Logo */}
      <Link to="/" className="inline-flex items-center space-x-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
          <Icon name="Zap" size={28} color="white" />
        </div>
        <span className="text-2xl font-bold gradient-text">PromoHive</span>
      </Link>

      {/* Welcome Message */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Join PromoHive
        </h1>
        <p className="text-lg text-text-secondary max-w-md mx-auto">
          Start earning rewards by completing promotional tasks and building your network
        </p>
      </div>

      {/* Features Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
        <div className="flex items-center space-x-2 text-sm text-text-secondary">
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
            <Icon name="DollarSign" size={16} className="text-success" />
          </div>
          <span>Earn USDT Rewards</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-text-secondary">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="Users" size={16} className="text-primary" />
          </div>
          <span>Referral Bonuses</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-text-secondary">
          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
            <Icon name="Shield" size={16} className="text-secondary" />
          </div>
          <span>Secure Platform</span>
        </div>
      </div>
    </div>
  );
};

export default RegistrationHeader;