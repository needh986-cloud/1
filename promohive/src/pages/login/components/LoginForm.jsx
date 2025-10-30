import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data, error } = await signIn(formData?.email, formData?.password);

      if (error) {
        setErrors({ 
          submit: error?.message 
        });
        return;
      }

      // Get user profile to determine role
      const userRole = data?.user?.user_metadata?.role || 
                      data?.user?.app_metadata?.role || 
                      'user';

      // Redirect based on role
      if (userRole === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } catch (error) {
      setErrors({ 
        submit: 'Login failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-text-primary">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-text-secondary" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData?.email}
            onChange={handleChange}
            className={`
              block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm
              bg-surface/50 backdrop-blur-sm text-text-primary placeholder-text-secondary
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              transition-all duration-200
              ${errors?.email ? 'border-destructive ring-destructive/20' : 'border-border hover:border-border-hover'}
            `}
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </div>
        {errors?.email && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors?.email}
          </p>
        )}
      </div>
      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-text-primary">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-text-secondary" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={formData?.password}
            onChange={handleChange}
            className={`
              block w-full pl-10 pr-12 py-3 border rounded-xl shadow-sm
              bg-surface/50 backdrop-blur-sm text-text-primary placeholder-text-secondary
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              transition-all duration-200
              ${errors?.password ? 'border-destructive ring-destructive/20' : 'border-border hover:border-border-hover'}
            `}
            placeholder="Enter your password"
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-surface/50 rounded-r-xl transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-text-secondary hover:text-text-primary" />
            ) : (
              <Eye className="h-5 w-5 text-text-secondary hover:text-text-primary" />
            )}
          </button>
        </div>
        {errors?.password && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors?.password}
          </p>
        )}
      </div>
      {/* Submit Error */}
      {errors?.submit && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
          <p className="text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {errors?.submit}
          </p>
        </div>
      )}
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`
          w-full flex justify-center items-center gap-2 py-3 px-4
          bg-gradient-to-r from-primary to-primary-hover
          border border-transparent rounded-xl shadow-lg
          text-white font-medium
          hover:shadow-xl hover:scale-[1.02]
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
          transition-all duration-200 ease-out
          ${isLoading ? 'opacity-70 cursor-not-allowed transform-none' : ''}
        `}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Signing In...</span>
          </>
        ) : (
          <>
            <Shield className="h-5 w-5" />
            <span>Sign In</span>
          </>
        )}
      </button>
      {/* Forgot Password Link */}
      <div className="text-center">
        <button
          type="button"
          className="text-sm text-primary hover:text-primary-hover underline-offset-4 hover:underline transition-colors"
          disabled={isLoading}
        >
          Forgot your password?
        </button>
      </div>
    </form>
  );
};

export default LoginForm;