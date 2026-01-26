// src/App.jsx
import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from "./hooks/useAuth";
import AuthGuard from "./components/Layout/AuthGuard";

/* ---------- lazy pages ---------- */
const Home = lazy(() => import("./pages/Public/Home"));
const PreOnboard = lazy(() => import("./pages/Public/pre-onboard"));
const PostOnboard = lazy(() => import("./pages/Public/post-onboard"));
const Register = lazy(() => import("./pages/Auth/Register"));
const Login = lazy(() => import("./pages/Auth/Login"));
const ForgetPassword = lazy(() => import("./pages/Auth/ForgetPassword"));
const VerifyEmail = lazy(() => import("./pages/Auth/VerifyEmail"));
const PasswordResetSuccess = lazy(() => import("./pages/Auth/PasswordReset"));
const LoadingScreen = lazy(() => import("./pages/Public/LoadingScreen"));
const KYCFlow = lazy(() => import("./components/Identification/KYCFlow"));

/* ---------- dashboard shells ---------- */
const DashboardLayout = lazy(() => import("./components/Layout/DashboardLayout"));
const DashboardSettingLayout = lazy(() => import("./components/Layout/DashboardSettingLayout"));

/* ---------- dashboard pages ---------- */
const MainOverview = lazy(() => import("./pages/Dashboard/Main"));
const Messages = lazy(() => import("./pages/Dashboard/Messages"));
const Analytics = lazy(() => import("./pages/Dashboard/Analytics"));
const Payment = lazy(() => import("./pages/Dashboard/Payment"));
const Wallet = lazy(() => import("./pages/Dashboard/Wallet"));
const Notification = lazy(() => import("./pages/Dashboard/Notification"));
const MyProfile = lazy(() => import("./pages/Dashboard/Settings/MyProfile"));
const NotificationSettings = lazy(() => import("./pages/Dashboard/Settings/Notifications"));
const Verification = lazy(() => import("./pages/Dashboard/Settings/Verification"));
const Support = lazy(() => import("./pages/Dashboard/Settings/Support"));
const ResetPassword = lazy(() => import("./pages/Dashboard/Settings/ResetPassword"));

/* ---------- splitz pages ---------- */
const CreateSplitz = lazy(() => import("./pages/Dashboard/Splits/CreateSplitz"));
const MySplitz = lazy(() => import("./pages/Dashboard/Splits/MySplitz"));
const SplitzDetail = lazy(() => import("./pages/Dashboard/Splits/SplitzDetail"));
const SplitzSuccessful = lazy(() => import("./pages/Dashboard/Splits/SplitzSuccessful"));
const AllSplitsPage = lazy(() => import("./pages/Dashboard/Splits/AllSplitsPage"));

/* ---------- 404 ---------- */
const NotFound = lazy(() => import("./pages/NotFound"));

/* ---------- Public Only Guard ---------- */
function PublicOnly({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) return <LoadingScreen />;
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }  
  return children;
}


export default function App() {
  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>}/>
          <Route path="/register" element={<PublicOnly><Register /></PublicOnly>}/>
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/pre-onboard" element={<PreOnboard />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/password-reset-success" element={<PasswordResetSuccess />} />

          {/* PROTECTED */}
          <Route element={<AuthGuard />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<MainOverview />} />
              <Route path="messages" element={<Messages />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="payment" element={<Payment />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="notification" element={<Notification />} />
              <Route path="kyc-flow" element={<KYCFlow />} />
              <Route path="post-onboarding" element={<PostOnboard />} />
              
              {/* Splitz Routes */}
              <Route path="allsplits" element={<AllSplitsPage />} />
              <Route path="mysplitz" element={<MySplitz />} />
              <Route path="create-splitz" element={<CreateSplitz />} />
              <Route path="splitz-details/:id" element={<SplitzDetail />} />
              <Route path="splitz-success" element={<SplitzSuccessful />} />

              {/* SETTINGS NESTED */}
              <Route path="settings" element={<DashboardSettingLayout />}>
                <Route index element={<MyProfile />} />
                <Route path="profile" element={<MyProfile />} />
                <Route path="notifications" element={<NotificationSettings />} />
                <Route path="verification" element={<Verification />} />
                <Route path="reset-password" element={<ResetPassword />} />
                <Route path="support" element={<Support />} />
              </Route>
            </Route>
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}