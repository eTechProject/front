import { useState, useCallback } from 'react';
import { adminSubscriptionService } from '@/services/features/admin/adminSubscriptionService.js';

export const useSubscription = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 1,
        limit: 20,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSubscriptions = useCallback(async (params = {}) => {
        setIsLoading(true);
        setError(null);

        const result = await adminSubscriptionService.getAll(params);

        if (result.success) {
            setSubscriptions(result.data);
            setPagination(result.pagination || {
                total: result.data.length,
                page: 1,
                pages: 1,
                limit: 20,
            });
            setError(null);
        } else {
            setSubscriptions([]);
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    const fetchSubscriptionById = useCallback(async (id) => {
        setIsLoading(true);
        setError(null);

        const result = await adminSubscriptionService.getById(id);

        if (result.success) {
            setError(null);
            return result;
        } else {
            setError(result.error);
            return result;
        }
    }, []);

    const updateSubscriptionStatus = useCallback(async (id, status) => {
        setIsLoading(true);
        setError(null);

        const result = await adminSubscriptionService.updateStatus(id, status);
        if (result.success) {
            setSubscriptions(prev =>
                prev.map(sub => sub.id === id ? { ...sub, status: result.data.status, updatedAt: result.data.updatedAt } : sub)
            );
        } else {
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    return {
        subscriptions,
        pagination,
        isLoading,
        error,
        fetchSubscriptions,
        fetchSubscriptionById,
        updateSubscriptionStatus,
    };
};