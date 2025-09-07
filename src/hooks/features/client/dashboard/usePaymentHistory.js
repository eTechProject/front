import { useState, useCallback } from 'react';
import { paymentHistoryService } from "@/services/features/client/dashboard/paymentHistoryService.js";

export const usePaymentHistory = (clientId) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreHistory, setHasMoreHistory] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [filteredHistory, setFilteredHistory] = useState([]);

    const getPaymentHistory = useCallback(async (params = {}) => {
        if (!clientId) {
            setError('Client ID is required');
            return { success: false, error: 'Client ID is required' };
        }

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        const result = await paymentHistoryService.getPaymentHistory(clientId, params);
        setIsLoading(false);
        setSuccess(result.success);

        if (result.success) {
            const historyList = result.data.history || [];
            setPaymentHistory(historyList);
            console.log(historyList);
            setFilteredHistory(historyList);
            setCurrentPage(1);
            setHasMoreHistory(false); // Simple structure doesn't support pagination yet
        } else {
            setError(result.error);
        }
        return result;
    }, [clientId]);

    const getPaymentBySubscription = useCallback(async (paymentId) => {
        if (!clientId || !paymentId) {
            return { success: false, error: 'Client ID and Payment ID are required' };
        }

        const result = await paymentHistoryService.getPaymentById(clientId, paymentId);

        if (result.success) {
            // Filter history to show only payments related to this subscription
            const relatedPayments = paymentHistory.filter(payment =>
                payment.payment_id === paymentId
            );
            setFilteredHistory(relatedPayments);
        }

        return result;
    }, [clientId, paymentHistory]);

    const resetFilter = useCallback(() => {
        setFilteredHistory(paymentHistory);
    }, [paymentHistory]);

    const filterByStatus = useCallback((status) => {
        if (status === 'all') {
            setFilteredHistory(paymentHistory);
        } else {
            const filtered = paymentHistory.filter(payment => payment.status === status);
            setFilteredHistory(filtered);
        }
    }, [paymentHistory]);

    const filterByDateRange = useCallback((startDate, endDate) => {
        const filtered = paymentHistory.filter(payment => {
            const paymentDate = new Date(payment.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return paymentDate >= start && paymentDate <= end;
        });
        setFilteredHistory(filtered);
    }, [paymentHistory]);

    // Load more payment history for pagination
    const loadMoreHistory = useCallback(async () => {
        if (!clientId || !hasMoreHistory || isLoadingMore) {
            return;
        }

        setIsLoadingMore(true);
        const nextPage = currentPage + 1;
        const result = await paymentHistoryService.getPaymentHistory(clientId, { page: nextPage, limit: 20 });

        setIsLoadingMore(false);

        if (result.success) {
            const newHistory = result.data.history || [];
            setPaymentHistory(prev => [...prev, ...newHistory]);
            setFilteredHistory(prev => [...prev, ...newHistory]);
            setCurrentPage(nextPage);
            setHasMoreHistory(newHistory.length === 20); // Assuming 20 is the limit
        } else {
            setError(result.error);
        }
        return result;
    }, [clientId, hasMoreHistory, isLoadingMore, currentPage]);

    // Reset payment history state
    const resetPaymentHistory = useCallback(() => {
        setPaymentHistory([]);
        setFilteredHistory([]);
        setCurrentPage(1);
        setHasMoreHistory(true);
        setError(null);
        setSuccess(false);
    }, []);

    return {
        isLoading,
        error,
        success,
        paymentHistory,
        filteredHistory,
        isLoadingMore,
        hasMoreHistory,
        currentPage,
        getPaymentHistory,
        getPaymentBySubscription,
        loadMoreHistory,
        resetPaymentHistory,
        resetFilter,
        filterByStatus,
        filterByDateRange
    };
};