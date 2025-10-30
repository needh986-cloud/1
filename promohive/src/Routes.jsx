import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "components/ProtectedRoute";
import NotFound from "pages/NotFound";
import AdminDashboard from './pages/admin-dashboard';
import ProofsReview from './pages/proofs-review';
import LoginPage from './pages/login';
import UserDashboard from './pages/user-dashboard';
import WithdrawalsProcessing from './pages/withdrawals-processing';
import DailySpinWheel from './pages/daily-spin-wheel';
import TaskDetails from './pages/task-details';
import ReferralsManagement from './pages/referrals-management';
import WalletOverview from './pages/wallet-overview';
import ProofsManagement from './pages/proofs-management';
import UsersManagement from './pages/users-management';
import WithdrawalRequest from './pages/withdrawal-request';
import ProfileSettings from './pages/profile-settings';
import Register from './pages/register';
import TasksList from './pages/tasks-list';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin routes - require admin role */}
        <Route path="/admin-dashboard" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/proofs-review" element={<ProtectedRoute requireAdmin={true}><ProofsReview /></ProtectedRoute>} />
        <Route path="/withdrawals-processing" element={<ProtectedRoute requireAdmin={true}><WithdrawalsProcessing /></ProtectedRoute>} />
        <Route path="/users-management" element={<ProtectedRoute requireAdmin={true}><UsersManagement /></ProtectedRoute>} />
        
        {/* User routes - require authentication only */}
        <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/daily-spin-wheel" element={<ProtectedRoute><DailySpinWheel /></ProtectedRoute>} />
        <Route path="/task-details" element={<ProtectedRoute><TaskDetails /></ProtectedRoute>} />
        <Route path="/tasks-list" element={<ProtectedRoute><TasksList /></ProtectedRoute>} />
        <Route path="/referrals-management" element={<ProtectedRoute><ReferralsManagement /></ProtectedRoute>} />
        <Route path="/wallet-overview" element={<ProtectedRoute><WalletOverview /></ProtectedRoute>} />
        <Route path="/proofs-management" element={<ProtectedRoute><ProofsManagement /></ProtectedRoute>} />
        <Route path="/withdrawal-request" element={<ProtectedRoute><WithdrawalRequest /></ProtectedRoute>} />
        <Route path="/profile-settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
