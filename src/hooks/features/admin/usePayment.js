import { useState, useCallback } from 'react';
import { adminPaymentService } from '@/services/features/admin/adminPaymentService.js';

export const usePayment = () => {
    const [paymentHistories, setPaymentHistories] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 1,
        limit: 20,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPaymentHistories = useCallback(async (params = {}) => {
        setIsLoading(true);
        setError(null);

        const result = await adminPaymentService.getAll(params);

        if (result.success) {
            setPaymentHistories(result.data);
            setPagination(result.pagination || {
                total: result.data.length,
                page: 1,
                pages: 1,
                limit: 20,
            });
            setError(null);
        } else {
            setPaymentHistories([]);
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    return {
        paymentHistories,
        pagination,
        isLoading,
        error,
        fetchPaymentHistories,
    };
};