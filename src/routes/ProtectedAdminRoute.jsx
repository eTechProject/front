import { Navigate, useLocation } from 'react-router-dom';

const ProtectedAdminRoute = ({ children, isAuthenticated, isAdmin }) => {
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }
    if (!isAdmin) {
        return <Navigate to="/unauthorised" state={{ from: location }} replace />;
    }
    return children;
};

export default ProtectedAdminRoute;