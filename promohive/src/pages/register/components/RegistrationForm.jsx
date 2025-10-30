import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Shield, AlertCircle, CheckCircle, Clock, Key } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { verificationService } from '../../../services/verificationService';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState('register'); // 'register', 'verify', 'success'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [verificationData, setVerificationData] = useState({
    code: '',
    userId: null,
    email: '',
    fullName: '',
    generatedCode: null // TESTING ONLY: Store the generated code
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({
    sent: false,
    timeRemaining: 0
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleVerificationCodeChange = (e) => {
    const { value } = e?.target;
    // Only allow numbers and limit to 5 digits
    const numericValue = value?.replace(/\D/g, '')?.slice(0, 5);
    setVerificationData(prev => ({
      ...prev,
      code: numericValue
    }));
    
    // Clear verification error
    if (errors?.verification) {
      setErrors(prev => ({
        ...prev,
        verification: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData?.fullName?.trim()?.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/?.test(formData?.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, and numbers';
    }

    if (!formData?.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData?.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data, error } = await signUp(
        formData?.email, 
        formData?.password,
        {
          fullName: formData?.fullName?.trim(),
          role: 'user'
        }
      );

      if (error) {
        setErrors({ 
          submit: error?.message 
        });
        return;
      }

      // Send verification code
      const verificationResult = await verificationService?.sendVerificationCode(
        formData?.email,
        formData?.fullName,
        data?.user?.id
      );

      if (verificationResult?.success) {
        // Set verification data
        setVerificationData({
          code: '',
          userId: data?.user?.id,
          email: formData?.email,
          fullName: formData?.fullName,
          generatedCode: verificationResult?.code // TESTING ONLY
        });
        
        setCurrentStep('verify');
        setVerificationStatus({
          sent: true,
          timeRemaining: 600 // 10 minutes
        });
        startCountdown();
      } else {
        setErrors({ 
          submit: verificationResult?.error || 'Failed to send verification code' 
        });
      }

    } catch (error) {
      setErrors({ 
        submit: 'Registration failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e?.preventDefault();
    
    if (!verificationData?.code || verificationData?.code?.length !== 5) {
      setErrors({ verification: 'Please enter the 5-digit verification code' });
      return;
    }

    setIsLoading(true);

    try {
      const result = await verificationService?.verifyEmailCode(
        verificationData?.userId,
        verificationData?.code
      );

      if (result?.success) {
        setCurrentStep('success');
      } else {
        setErrors({ 
          verification: result?.error || 'Verification code is incorrect' 
        });
      }
    } catch (error) {
      setErrors({ 
        verification: 'Failed to verify the code' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    
    try {
      const result = await verificationService?.resendVerificationCode(
        verificationData?.email,
        verificationData?.fullName,
        verificationData?.userId
      );

      if (result?.success) {
        // Update generated code for testing
        setVerificationData(prev => ({
          ...prev,
          generatedCode: result?.code // TESTING ONLY
        }));
        
        setVerificationStatus({
          sent: true,
          timeRemaining: 600
        });
        startCountdown();
        setErrors({}); // Clear any errors
      } else {
        setErrors({ 
          verification: result?.error || 'Failed to resend the code' 
        });
      }
    } catch (error) {
      setErrors({ 
        verification: 'Failed to resend the code' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startCountdown = () => {
    const interval = setInterval(() => {
      setVerificationStatus(prev => {
        if (prev?.timeRemaining <= 1) {
          clearInterval(interval);
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev?.timeRemaining - 1 };
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds?.toString()?.padStart(2, '0')}`;
  };

  const navigateToLogin = () => {
    navigate('/login', { 
      state: { 
        message: 'Your email has been verified successfully! Your account will be reviewed by the admin soon.',
        email: verificationData?.email 
      }
    });
  };

  // Success Step
  if (currentStep === 'success') {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          Your email is verified!
        </h3>
        <p className="text-text-secondary mb-4">
          Your email has been verified successfully.
          <br />
          Your account will be reviewed by the admin before the welcome bonus is activated.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> You will receive the $5 welcome bonus after your account is approved.
          </p>
        </div>
        <button
          onClick={navigateToLogin}
          className="w-full bg-gradient-to-r from-primary to-primary-hover text-white font-medium py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  // Verification Step
  if (currentStep === 'verify') {
    return (
      <form onSubmit={handleVerificationSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <div className="mb-4">
            <Key className="h-16 w-16 text-primary mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Email Verification
          </h3>
          <p className="text-text-secondary">
            A 5-digit verification code has been sent to:
            <br />
            <strong>{verificationData?.email}</strong>
          </p>
        </div>

        {/* TESTING ONLY: Show generated code */}
        {verificationData?.generatedCode && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm font-semibold mb-2 text-center">
              🧪 TESTING MODE - Email Disabled
            </p>
            <p className="text-yellow-700 text-xs mb-2 text-center">
              Your verification code is:
            </p>
            <p className="text-3xl font-bold text-yellow-900 text-center tracking-widest">
              {verificationData?.generatedCode}
            </p>
            <p className="text-yellow-600 text-xs mt-2 text-center">
              Copy this code and paste it below
            </p>
          </div>
        )}

        {/* Verification Code Input */}
        <div className="space-y-2">
          <label htmlFor="verificationCode" className="block text-sm font-medium text-text-primary text-center">
            Verification Code
          </label>
          <div className="flex justify-center">
            <input
              id="verificationCode"
              name="verificationCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="5"
              value={verificationData?.code}
              onChange={handleVerificationCodeChange}
              className={`
                w-32 text-center text-2xl font-bold py-3 px-4 border rounded-xl shadow-sm
                bg-surface/50 backdrop-blur-sm text-text-primary placeholder-text-secondary
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                transition-all duration-200 tracking-widest
                ${errors?.verification ? 'border-destructive ring-destructive/20' : 'border-border hover:border-border-hover'}
              `}
              placeholder="00000"
              disabled={isLoading}
              autoComplete="one-time-code"
            />
          </div>
          {errors?.verification && (
            <p className="text-sm text-destructive flex items-center justify-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors?.verification}
            </p>
          )}
        </div>

        {/* Timer */}
        {verificationStatus?.timeRemaining > 0 && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-text-secondary">
              <Clock className="h-4 w-4" />
              <span>Code expires in: {formatTime(verificationStatus?.timeRemaining)}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || verificationData?.code?.length !== 5}
          className={`
            w-full flex justify-center items-center gap-2 py-3 px-4
            bg-gradient-to-r from-primary to-primary-hover
            border border-transparent rounded-xl shadow-lg
            text-white font-medium
            hover:shadow-xl hover:scale-[1.02]
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
            transition-all duration-200 ease-out
            ${(isLoading || verificationData?.code?.length !== 5) ? 'opacity-70 cursor-not-allowed transform-none' : ''}
          `}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <Shield className="h-5 w-5" />
              <span>Verify Code</span>
            </>
          )}
        </button>

        {/* Resend Code */}
        <div className="text-center pt-4">
          <p className="text-text-secondary text-sm mb-2">
            Didn’t receive the code?
          </p>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isLoading || verificationStatus?.timeRemaining > 540} // Allow resend after 1 minute
            className={`
              text-primary hover:text-primary-hover underline font-medium
              transition-colors duration-200
              ${(isLoading || verificationStatus?.timeRemaining > 540) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            Resend code
          </button>
        </div>
      </form>
    );
  }

  // Registration Step (Default)
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Full Name Field */}
      <div className="space-y-2">
        <label htmlFor="fullName" className="block text-sm font-medium text-text-primary">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-text-secondary" />
          </div>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={formData?.fullName}
            onChange={handleChange}
            className={`
              block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm
              bg-surface/50 backdrop-blur-sm text-text-primary placeholder-text-secondary
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              transition-all duration-200
              ${errors?.fullName ? 'border-destructive ring-destructive/20' : 'border-border hover:border-border-hover'}
            `}
            placeholder="Enter your full name"
            disabled={isLoading}
          />
        </div>
        {errors?.fullName && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors?.fullName}
          </p>
        )}
      </div>

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
            autoComplete="new-password"
            value={formData?.password}
            onChange={handleChange}
            className={`
              block w-full pl-10 pr-12 py-3 border rounded-xl shadow-sm
              bg-surface/50 backdrop-blur-sm text-text-primary placeholder-text-secondary
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              transition-all duration-200
              ${errors?.password ? 'border-destructive ring-destructive/20' : 'border-border hover:border-border-hover'}
            `}
            placeholder="Choose a strong password"
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

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-text-secondary" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={formData?.confirmPassword}
            onChange={handleChange}
            className={`
              block w-full pl-10 pr-12 py-3 border rounded-xl shadow-sm
              bg-surface/50 backdrop-blur-sm text-text-primary placeholder-text-secondary
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              transition-all duration-200
              ${errors?.confirmPassword ? 'border-destructive ring-destructive/20' : 'border-border hover:border-border-hover'}
            `}
            placeholder="Re-enter your password"
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-surface/50 rounded-r-xl transition-colors"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5 text-text-secondary hover:text-text-primary" />
            ) : (
              <Eye className="h-5 w-5 text-text-secondary hover:text-text-primary" />
            )}
          </button>
        </div>
        {errors?.confirmPassword && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors?.confirmPassword}
          </p>
        )}
      </div>

      {/* Terms Agreement */}
      <div className="space-y-2">
        <div className="flex items-start">
          <input
            id="agreeToTerms"
            name="agreeToTerms"
            type="checkbox"
            checked={formData?.agreeToTerms}
            onChange={handleChange}
            className="mt-1 h-4 w-4 text-primary focus:ring-primary border-border rounded"
            disabled={isLoading}
          />
          <label htmlFor="agreeToTerms" className="mr-2 text-sm text-text-secondary">
            I agree to the{' '}
            <a href="#" className="text-primary hover:text-primary-hover underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:text-primary-hover underline">
              Privacy Policy
            </a>
          </label>
        </div>
        {errors?.agreeToTerms && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors?.agreeToTerms}
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
            <span>Creating account...</span>
          </>
        ) : (
          <>
            <Shield className="h-5 w-5" />
            <span>Create Account</span>
          </>
        )}
      </button>
    </form>
  );
};

export default RegistrationForm;