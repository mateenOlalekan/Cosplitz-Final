
import './App.css'
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

const Home = lazy(()=> import("./pages/Public/Home"));
const LoadingScreen = lazy(()=>import("./pages/Public/LoadingScreen"));
const PreOnboard = lazy(() =>import("./pages/Public/pre-onboarding"))

function App() {


  return (
    <>
    <Suspense fallback={<LoadingScreen/>}>
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/pre-onboard" element={<PreOnboard />} />
      </Routes>
    </Suspense>
    </>
  )
}

export default App
