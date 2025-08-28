import { useState, useCallback } from 'react';
import {paymentService} from "@/services/features/client/dashboard/clientPaymentService.js";

export const usePayments = (clientId) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [payments, setPayments] = useState({
        active_payments: [],
        expired_payments: [],
        other_payments: [],
        history: [],
        total: 0,
        page: 1,
        limit: 20
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMorePayments, setHasMorePayments] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const getPayments = async (params = {}) => {
        if (!clientId) {
            setError('Client ID is required');
            return { success: false, error: 'Client ID is required' };
        }

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        const result = await paymentService.getPayments(clientId, params);

        setIsLoading(false);
        setSuccess(result.success);

        if (result.success) {
            setPayments({
                active_payments: result.data.active_payments || [],
                expired_payments: result.data.expired_payments || [],
                other_payments: result.data.other_payments || [],
                history: result.data.history || [],
                total: result.data.total || 0,
                page: result.data.page || 1,
                limit: result.data.limit || 20
            });
            setCurrentPage(result.data.page || 1);
            setHasMorePayments(result.data.page < Math.ceil(result.data.total / result.data.limit));
        } else {
            setError(result.error);
        }
        return result;
    };

    // Load more payments for pagination
    const loadMorePayments = useCallback(async () => {
        if (!clientId || !hasMorePayments || isLoadingMore) {
            return;
        }

        setIsLoadingMore(true);
        const nextPage = currentPage + 1;
        const result = await paymentService.getPayments(clientId, { page: nextPage, limit: 20 });

        setIsLoadingMore(false);

        if (result.success) {
            setPayments(prev => ({
                active_payments: [...prev.active_payments, ...(result.data.active_payments || [])],
                expired_payments: [...prev.expired_payments, ...(result.data.expired_payments || [])],
                other_payments: [...prev.other_payments, ...(result.data.other_payments || [])],
                history: [...prev.history, ...(result.data.history || [])],
                total: result.data.total || prev.total,
                page: result.data.page || nextPage,
                limit: result.data.limit || 20
            }));
            setCurrentPage(result.data.page || nextPage);
            setHasMorePayments(result.data.page < Math.ceil(result.data.total / result.data.limit));
        } else {
            setError(result.error);
        }
        return result;
    }, [clientId, hasMorePayments, isLoadingMore, currentPage]);

    // Reset payment state
    const resetPayments = useCallback(() => {
        setPayments({
            active_payments: [],
            expired_payments: [],
            other_payments: [],
            history: [],
            total: 0,
            page: 1,
            limit: 20
        });
        setCurrentPage(1);
        setHasMorePayments(true);
        setError(null);
        setSuccess(false);
    }, []);

    return {
        isLoading,
        error,
        success,
        payments,
        isLoadingMore,
        hasMorePayments,
        currentPage,
        loadMorePayments,
        resetPayments,
        getPayments
    };
};