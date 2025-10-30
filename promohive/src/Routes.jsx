import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
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
        {/* Define your route here */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/proofs-review" element={<ProofsReview />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/withdrawals-processing" element={<WithdrawalsProcessing />} />
        <Route path="/daily-spin-wheel" element={<DailySpinWheel />} />
        <Route path="/task-details" element={<TaskDetails />} />
        <Route path="/referrals-management" element={<ReferralsManagement />} />
        <Route path="/wallet-overview" element={<WalletOverview />} />
        <Route path="/proofs-management" element={<ProofsManagement />} />
        <Route path="/users-management" element={<UsersManagement />} />
        <Route path="/withdrawal-request" element={<WithdrawalRequest />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tasks-list" element={<TasksList />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
