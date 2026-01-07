
import './App.css'
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

//Route Protection
const ProtectedRoute = lazy(()=> import("./routes/ProtectedRoute"))

const Home = lazy(()=> import("./pages/Public/Home"));
const LoadingScreen = lazy(()=>import("./pages/Public/LoadingScreen"));
const PreOnboard = lazy(() =>import("./pages/Public/pre-onboard"));
const PostOnboard = lazy(() => import("./pages/Public/post-onboard"));
const Register = lazy(() => import("./pages/Auth/Register/index"));
const Login = lazy(() =>import("./pages/Auth/Login/index"))

const Identify = lazy(() => import("./components/Identification/KYCFlow"));
const ForgetPassword = lazy(() => import("./pages/Auth/ForgetPassword"));
const VerifyEmail = lazy(() => import("./pages/Auth/VerifyEmail"));
const PasswordResetSuccess = lazy(() => import("./pages/Auth/PasswordReset"));

function App() {


  return (
    <>
    <Suspense fallback={<LoadingScreen/>}>
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/pre-onboard"  element={<PreOnboard />} />
        <Route path="/post-onboard" element={<PostOnboard/>}/>
        <Route path='/kyc-flow'     element={<Identify/>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Password Recovery */}
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/password-reset-success" element={<PasswordResetSuccess />}        />

      </Routes>

    </Suspense>
    </>
  )
}

export default App
