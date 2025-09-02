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
        total: 0,
        page: 1,
        limit: 20
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMorePayments, setHasMorePayments] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Helper function to categorize payments based on the new data structure
    const categorizePayments = (paymentList) => {
        const active = [];
        const expired = [];
        const other = [];
        
        paymentList.forEach(payment => {
            if (payment.status === 'actif') {
                active.push(payment);
            } else if (payment.status === 'expire') {
                expired.push(payment);
            } else if (payment.status === 'non_paye') {
                other.push(payment);
            }
        });

        return {
            active_payments: active,
            expired_payments: expired,
            other_payments: other
        };
    };

    const getPayments = useCallback(async (params = {}) => {
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
            // Handle the new simplified data structure
            const paymentList = result.data.data || result.data || [];
            const categorizedPayments = categorizePayments(paymentList);
            
            setPayments({
                ...categorizedPayments,
                total: paymentList.length,
                page: 1,
                limit: 20
            });
            setCurrentPage(1);
            setHasMorePayments(false); // Simple structure doesn't support pagination yet
        } else {
            setError(result.error);
        }
        return result;
    }, [clientId]);

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
            const paymentList = result.data.data || result.data || [];
            const categorizedPayments = categorizePayments(paymentList);
            
            setPayments(prev => ({
                active_payments: [...prev.active_payments, ...categorizedPayments.active_payments],
                expired_payments: [...prev.expired_payments, ...categorizedPayments.expired_payments],
                other_payments: [...prev.other_payments, ...categorizedPayments.other_payments],
                total: prev.total + paymentList.length,
                page: nextPage,
                limit: 20
            }));
            setCurrentPage(nextPage);
            setHasMorePayments(false); // Disable pagination for now
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