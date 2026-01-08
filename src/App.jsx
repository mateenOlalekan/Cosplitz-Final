import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

/* Route Guards */
const ProtectedRoute = lazy(() => import("./routes/ProtectedRoute"));

/* Public Pages */
const Home = lazy(() => import("./pages/Public/Home"));
const PreOnboard = lazy(() => import("./pages/Public/pre-onboard"));
const PostOnboard = lazy(() => import("./pages/Public/post-onboard"));
const Register = lazy(() => import("./pages/Auth/Register"));
const Login = lazy(() => import("./pages/Auth/Login"));
const ForgetPassword = lazy(() => import("./pages/Auth/ForgetPassword"));
const VerifyEmail = lazy(() => import("./pages/Auth/VerifyEmail"));
const PasswordResetSuccess = lazy(() => import("./pages/Auth/PasswordReset"));
const LoadingScreen = lazy(() => import("./pages/Public/LoadingScreen"));

/* KYC */
const KYCFlow = lazy(() => import("./components/Identification/KYCFlow"));

/* Dashboard Layout */
const DashboardLayout = lazy(() => import("./components/Layout/DashoardLayout"));

/* Dashboard Pages */
const MainOverview = lazy(() => import("./pages/Dashboard/Main"));
const Messages = lazy(() => import("./pages/Dashboard/Messages"));
const Analytics = lazy(() => import("./pages/Dashboard/Analytics"));
const Payment = lazy(() => import("./pages/Dashboard/Payment"));
const Wallet = lazy(() => import("./pages/Dashboard/Wallet"));
const Notification = lazy(() => import("./pages/Dashboard/Notification"));

/* Settings */
const SettingsLayout = lazy(() =>
  import("./components/Layout/DashboardSettingLayout")
);
const MyProfile = lazy(() =>
  import("./pages/Dashboard/Settings/MyProfile")
);
const NotificationSettings = lazy(() =>
  import("./pages/Dashboard/Settings/Notifications")
);
const Verification = lazy(() =>
  import("./pages/Dashboard/Settings/Verification")
);
const Support = lazy(() =>
  import("./pages/Dashboard/Settings/Support")
);
const ResetPassword = lazy(() =>
  import("./pages/Dashboard/Settings/ResetPassword")
);

/* Misc */
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/pre-onboard" element={<PreOnboard />} />
        <Route path="/post-onboard" element={<PostOnboard />} />
        <Route path="/kyc-flow" element={<KYCFlow />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Password Recovery */}
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/password-reset-success"
          element={<PasswordResetSuccess />}
        />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<MainOverview />} />
            <Route path="main" element={<MainOverview />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="messages" element={<Messages />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="payment" element={<Payment />} />
            <Route path="notification" element={<Notification />} />
            <Route path="kyc-flow" element={<KYCFlow />} />
            <Route path="post-onboarding" element={<PostOnboard />} />

            {/* Settings (correctly nested) */}
            <Route path="settings" element={<SettingsLayout />}>
              <Route index element={<MyProfile />} />
              <Route path="profile" element={<MyProfile />} />
              <Route
                path="notifications"
                element={<NotificationSettings />}
              />
              <Route path="verification" element={<Verification />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="support" element={<Support />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
