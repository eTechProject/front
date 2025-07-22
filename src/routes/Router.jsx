import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from "../pages/LandingPage.jsx";
import AuthPage from "../pages/AuthPage.jsx";
import ForgotPasswordPage from "../pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../pages/ResetPasswordPage.jsx";
import NotFound from "../useTools/NotFound.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import { useAuth } from '../context/AuthContext';

const RouterConfig = () => {
    const { isAuthenticated } = useAuth();
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default RouterConfig;