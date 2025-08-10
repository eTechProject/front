import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {authService} from "@/services/auth/authService.js";

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
    // États principaux - maintenant basés uniquement sur le token JWT
    const [user, setUser] = useState(authService.getCurrentUser());
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const [isLoading, setIsLoading] = useState(false);
    const [userRole, setUserRole] = useState(authService.getUserRole());
    const [error, setError] = useState(null);

    // Référence pour stocker l'ID du timer de déconnexion automatique
    const logoutTimerRef = useRef(null);

    /**
     * Met à jour l'état d'authentification en fonction du token JWT uniquement.
     * Appelé après login, logout ou synchronisation entre onglets.
     */
    const updateAuthState = useCallback(() => {
        const currentUser = authService.getCurrentUser();
        const authenticated = authService.isAuthenticated();
        const role = authService.getUserRole();

        setUser(currentUser);
        setIsAuthenticated(authenticated);
        setUserRole(role);
    }, []);

    /**
     * Programme une déconnexion automatique lorsque le token JWT expire.
     * Utilise directement le payload du token pour obtenir l'expiration.
     */
    const scheduleAutoLogout = useCallback(() => {
        // Nettoie un éventuel timer précédent
        if (logoutTimerRef.current) {
            clearTimeout(logoutTimerRef.current);
        }

        const payload = authService.getTokenPayload();
        if (payload && payload.exp) {
            const expireMs = payload.exp * 1000 - Date.now();
            if (expireMs > 0) {
                // Déconnexion planifiée à expiration exacte du JWT
                logoutTimerRef.current = setTimeout(() => {
                    logout();
                }, expireMs);
            } else {
                // Token déjà expiré
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
                const role = authService.getUserRole();
                return {
                    success: true,
                    data: result.data,
                    role: role
                };
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
     * Nettoie le localStorage (token uniquement), met à jour l'état et annule le timer.
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
     * Nouvelle fonction pour obtenir les données fraîches du token
     */
    const refreshTokenData = useCallback(() => {
        updateAuthState();
        scheduleAutoLogout();
    }, [updateAuthState, scheduleAutoLogout]);

    /**
     * Synchronise l'état d'auth entre différents onglets du navigateur.
     * Met à jour l'état et reprogramme la déconnexion si besoin.
     */
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'token') {
                updateAuthState();
                scheduleAutoLogout();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [updateAuthState, scheduleAutoLogout]);

    // Vérification initiale au montage du composant
    useEffect(() => {
        updateAuthState();
    }, [updateAuthState]);

    // Vérification des rôles d'utilisateur
    const isAdmin = userRole === "admin";
    const isAgent = userRole === "agent";
    const isClient = userRole === "client";

    // Nouvelle méthode pour obtenir l'ID crypté
    const getUserId = useCallback(() => {
        return authService.getUserId();
    }, []);

    // Méthode pour vérifier si le token expire bientôt
    const isTokenExpiringSoon = useCallback((minutes = 5) => {
        return authService.isTokenExpiringSoon(minutes);
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isAdmin,
            isAgent,
            isClient,
            userRole,
            isLoading,
            error,
            login,
            register,
            logout,
            clearError,
            getUserId,
            isTokenExpiringSoon,
            refreshTokenData
        }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook personnalisé pour utiliser le contexte d'authentification dans les composants enfants.
 * @throws Erreur si utilisé en dehors d'un AuthProvider
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};