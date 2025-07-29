import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/authService';
import { jwtDecode } from "jwt-decode";

/**
 * AuthContext
 * Fournit le contexte d'authentification à toute l'application.
 */
const AuthContext = createContext(undefined);

/**
 * AuthProvider
 * Composant qui encapsule l'application et fournit les états et fonctions d'authentification.
 * Gère la connexion, la déconnexion, l'inscription, l'erreur, le rôle utilisateur, et la déconnexion automatique à expiration du JWT.
 */
export const AuthProvider = ({ children }) => {
    // États principaux
    const [user, setUser] = useState(authService.getCurrentUser());
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const [isLoading, setIsLoading] = useState(false);
    const [userRole, setUserRole] = useState(authService.getUserRole());
    const [error, setError] = useState(null);

    // Référence pour stocker l'ID du timer de déconnexion automatique
    const logoutTimerRef = useRef(null);

    /**
     * Met à jour l'état d'authentification en fonction du localStorage.
     * Appelé après login, logout ou synchronisation entre onglets.
     */
    const updateAuthState = useCallback(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(authService.isAuthenticated());
        setUserRole(authService.getUserRole());
    }, []);

    /**
     * Programme une déconnexion automatique lorsque le token JWT expire.
     * Décode le JWT pour obtenir l'expiration (`exp` en secondes UNIX).
     */
    const scheduleAutoLogout = useCallback(() => {
        // Nettoie un éventuel timer précédent
        if (logoutTimerRef.current) {
            clearTimeout(logoutTimerRef.current);
        }
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const { exp } = jwtDecode(token); // exp en secondes UNIX
                const expireMs = exp * 1000 - Date.now();
                if (expireMs > 0) {
                    // Déconnexion planifiée à expiration exacte du JWT
                    logoutTimerRef.current = setTimeout(() => {
                        logout();
                    }, expireMs);
                } else {
                    // Token déjà expiré
                    logout();
                }
            } catch (e) {
                logout();
            }
        }
    }, []);

    /**
     * À chaque changement d'authentification, programme ou annule le timer de déconnexion auto.
     * Nettoie le timer à l'unmount.
     */
    useEffect(() => {
        if (isAuthenticated) {
            scheduleAutoLogout();
        } else {
            if (logoutTimerRef.current) {
                clearTimeout(logoutTimerRef.current);
            }
        }
        return () => {
            if (logoutTimerRef.current) {
                clearTimeout(logoutTimerRef.current);
            }
        };
    }, [isAuthenticated, scheduleAutoLogout]);

    /**
     * Fonction de connexion utilisateur.
     * En cas de succès, met à jour l'état et programme la déconnexion automatique.
     */
    const login = useCallback(async (credentials) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await authService.login(credentials);
            if (result.success) {
                updateAuthState();
                scheduleAutoLogout();
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error, details: result.details };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur de connexion';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, [updateAuthState, scheduleAutoLogout]);

    /**
     * Fonction d'inscription utilisateur (pas de login automatique ici).
     */
    const register = useCallback(async (userData) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await authService.register(userData);
            if (result.success) {
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                return { success: false, error: result.error, details: result.details };
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de l\'inscription';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Fonction de déconnexion utilisateur.
     * Nettoie le localStorage, met à jour l'état et annule le timer de déconnexion automatique.
     */
    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await authService.logout();
            updateAuthState();
        } finally {
            setIsLoading(false);
            if (logoutTimerRef.current) {
                clearTimeout(logoutTimerRef.current);
            }
        }
    }, [updateAuthState]);

    /**
     * Réinitialise l'erreur d'authentification.
     */
    const clearError = useCallback(() => setError(null), []);

    /**
     * Synchronise l'état d'auth entre différents onglets du navigateur.
     * Met à jour l'état et reprogramme la déconnexion si besoin.
     */
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'token' || e.key === 'user') {
                updateAuthState();
                scheduleAutoLogout();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [updateAuthState, scheduleAutoLogout]);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isAdmin: userRole === "admin",
            isLoading,
            error,
            login,
            register,
            logout,
            clearError
        }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook personnalisé pour utiliser le contexte d'authentification dans les composants enfants.
 * @throws Erreur si utilisé en dehors d'un AuthProvider
 */

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};