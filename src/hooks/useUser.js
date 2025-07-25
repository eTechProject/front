import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';

export const useUser = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    /*useEffect(() => {
        let mounted = true;
        setIsLoading(true);
        userService.getProfile()
            .then(data => {
                if (mounted) setUser(data);
            })
            .catch(err => {
                if (mounted) setError(err.message || 'Erreur lors du chargement');
            })
            .finally(() => {
                if (mounted) setIsLoading(false);
            });
        return () => {
            mounted = false;
        }
    }, []);
    */
    const updateProfile = useCallback(async (profile) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await userService.updateProfile(profile);
            setUser(data);
            return { success: true, data };
        } catch (err) {
            setError(err.message || 'Erreur lors de la mise à jour');
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Mettre à jour l’avatar
    const updateAvatar = useCallback(async (avatarFile) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await userService.updateAvatar(avatarFile);
            setUser(data);
            return { success: true, data };
        } catch (err) {
            setError(err.message || 'Erreur lors du changement d’avatar');
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        user,
        isLoading,
        error,
        updateProfile,
        updateAvatar
    };
};