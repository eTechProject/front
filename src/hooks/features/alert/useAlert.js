import { useState, useCallback } from 'react';
import {alertService} from "@/services/features/alert/alertService.js";

export const useAlert = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [alert, setAlert] = useState(null);

    const createAlert = useCallback(async (alertData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await alertService.createAlert(alertData);
            if (response.success) {
                setAlert(response.data);
                return {
                    success: true,
                    data: response.data
                };
            } else {
                throw new Error(response.error);
            }
        } catch (err) {
            setError(err.message || "Erreur lors de la création de l'alerte");
            return {
                success: false,
                error: err.message
            };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const cancelAlert = useCallback(async (alertId) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await alertService.cancelAlert(alertId);
            if (response.success) {
                setAlert(null);
                return {
                    success: true,
                    data: response.data
                };
            } else {
                throw new Error(response.error);
            }
        } catch (err) {
            setError(err.message || "Erreur lors de l'annulation de l'alerte");
            return {
                success: false,
                error: err.message
            };
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        alert,
        isLoading,
        error,
        createAlert,
        cancelAlert
    };
};