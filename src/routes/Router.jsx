import { Routes, Route } from 'react-router-dom';
import LandingPage from "../pages/LandingPage.jsx";
import AuthPage from "../pages/AuthPage.jsx";
import ForgotPasswordPage from "../pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../pages/ResetPasswordPage.jsx";
import NotFound from "../useTools/NotFound.jsx";
import Unauthorized from "../useTools/Unauthorized.jsx";
import { useAuth } from '../context/AuthContext';
import ProtectedRoleRoute from "./ProtectedRoleRoute.jsx";
import DashboardAdminPage from "../pages/dashboard/DashboardAdminPage.jsx";
import DashboardAgentPage from "../pages/dashboard/DashboardAgentPage.jsx";
import DashboardClientPage from "../pages/dashboard/DashboardClientPage.jsx";


const RouterConfig = () => {
    const { isAuthenticated, userRole } = useAuth();

    return (
        <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/unauthorised" element={<Unauthorized />} />

            {/* Routes protégées par rôle */}
            <Route
                path="/client/dashboard"
                element={
                    <ProtectedRoleRoute
                        isAuthenticated={isAuthenticated}
                        userRole={userRole}
                        allowedRoles={['client']}
                    >
                        <DashboardClientPage />
                    </ProtectedRoleRoute>
                }
            />

            <Route
                path="/agent/dashboard"
                element={
                    <ProtectedRoleRoute
                        isAuthenticated={isAuthenticated}
                        userRole={userRole}
                        allowedRoles={['agent']}
                    >
                        <DashboardAgentPage />
                    </ProtectedRoleRoute>
                }
            />

            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoleRoute
                        isAuthenticated={isAuthenticated}
                        userRole={userRole}
                        allowedRoles={['admin']}
                    >
                        <DashboardAdminPage />
                    </ProtectedRoleRoute>
                }
            />

            {/* Redirection générique vers le dashboard approprié */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoleRoute
                        isAuthenticated={isAuthenticated}
                        userRole={userRole}
                        allowedRoles={['client', 'agent', 'admin']}
                    >
                        {userRole === 'admin' ? <DashboardAdminPage /> :
                            userRole === 'agent' ? <DashboardAgentPage /> :
                                <DashboardClientPage />}
                    </ProtectedRoleRoute>
                }
            />

            {/* Route 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default RouterConfig;