import { useState, useCallback } from 'react';
import { notificationService } from '@/services/features/notification/notificationService.js';

export const useNotifications = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [success, setSuccess] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const getNotifications = async (userId, params = {}) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        const result = await notificationService.getNotification(userId, params);
        setIsLoading(false);
        setSuccess(result.success);
        if (result.success) {
            setNotifications(result.notifications || []);
            setCurrentPage(result.page || 1);
            setHasMoreNotifications(result.page < result.pages);
        } else {
            setError(result.error);
        }
        return result;
    };

    const loadMoreNotifications = useCallback(async (userId) => {
        if (!hasMoreNotifications || isLoadingMore) {
            return;
        }
        const nextPage = currentPage + 1;
        return getNotifications(userId, { page: nextPage, limit: 20 });
    }, [hasMoreNotifications, isLoadingMore, currentPage]);

    const getMercureToken = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        const result = await notificationService.getMercureToken();
        setIsLoading(false);
        setSuccess(result.success);
        if (!result.success) setError(result.error);
        return result;
    };

    const addMercureNotification = (newNotification) => {
        setNotifications(prevNotifications => {
            const prev = prevNotifications || [];

            // Check if it already exists
            const index = prev.findIndex(n => n.id === newNotification.data.id);

            let updated;
            if (index === -1) {
                // New notification → add it
                updated = [...prev, newNotification.data];
            } else {
                // Existing → replace (to force re-render)
                updated = [...prev];
                updated[index] = { ...prev[index], ...newNotification.data };
            }

            // Always return a new sorted array
            return updated.sort(
                (a, b) =>
                    new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
            );
        });
    };


    const resetNotifications = useCallback(() => {
        setNotifications([]);
        setCurrentPage(1);
        setHasMoreNotifications(true);
        setError(null);
        setSuccess(false);
    }, []);

    return {
        isLoading,
        error,
        success,
        notifications,
        isLoadingMore,
        hasMoreNotifications,
        currentPage,
        loadMoreNotifications,
        resetNotifications,
        getNotifications,
        getMercureToken,
        addMercureNotification,
    };
};
