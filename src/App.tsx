import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import RecipeApp from "./RecipeApp";
import LandingPage from "./LandingPage";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import ForgotPassword from "./ForgotPassword";
import Settings from "./Settings";
import TermsOfService from "./TermsOfService";
import PrivacyPolicy from "./PrivacyPolicy";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/signin" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

export default function App() {
  const rawKey = (import.meta as any).env.VITE_RECAPTCHA_SITE_KEY;
  const isKeyValid = typeof rawKey === 'string' && 
    rawKey.trim() !== '' && 
    rawKey !== 'undefined' && 
    rawKey !== 'null' && 
    !rawKey.includes('YOUR_');
  const recaptchaKey = isKeyValid ? rawKey : "6LeIxAcTAAAAAJcZVRqy9m71b933_o7v4yW1up_I";

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
            <Route path="/signin" element={<PublicRoute><SignIn /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/app" element={<ProtectedRoute><RecipeApp /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleReCaptchaProvider>
  );
}

