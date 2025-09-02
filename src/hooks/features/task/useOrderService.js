import { useState, useCallback } from 'react';
import {orderService} from "@/services/features/task/orderService.js";

export const useOrderService = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const cancelTask = useCallback(async (orderId) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await orderService.cancelTask(orderId);
            if (response.success) {
                setResult(response.data);
                return {
                    success: true,
                    data: response.data
                };
            } else {
                throw new Error(response.error);
            }
        } catch (err) {
            setError(err.message || "Erreur lors de l'annulation de la tâche");
            return {
                success: false,
                error: err.message
            };
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        result,
        isLoading,
        error,
        cancelTask
    };
};