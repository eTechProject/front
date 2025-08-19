import { Navigate, useLocation } from 'react-router-dom';
import React from 'react';

/**
 * Composant de route protégée par rôle
 * @param {React.ReactNode} children - Composant enfant à rendre si l'utilisateur est autorisé
 * @param {boolean} isAuthenticated - Si l'utilisateur est authentifié
 * @param {string} userRole - Rôle actuel de l'utilisateur
 * @param {string[]} allowedRoles - Tableau des rôles autorisés pour cette route
 * @returns {React.ReactElement} - Le composant enfant ou une redirection
 */
const ProtectedRoleRoute = ({ children, isAuthenticated, userRole, allowedRoles }) => {
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorised" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoleRoute;