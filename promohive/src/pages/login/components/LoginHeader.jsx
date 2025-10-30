import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      {/* Logo */}
      <Link to="/" className="inline-flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
          <Icon name="Zap" size={28} color="white" />
        </div>
        <span className="text-2xl font-bold gradient-text">PromoHive</span>
      </Link>

      {/* Welcome Text */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome Back
        </h1>
        <p className="text-text-secondary">
          Sign in to your account to continue earning rewards
        </p>
      </div>
    </div>
  );
};

export default LoginHeader;