import { useState, useCallback } from 'react';
import { clientDashboardService } from "@/services/features/client/dashboard/clientDashboardService.js";

export const useClientDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        filters: { dateRange: 'all', shortcuts: [] },
        kpis: { tasks: 0, activeAgents: 0, duration: 0, distance: 0, incidents: 0, subscription: false },
        charts: { tasks: { labels: [], data: [] }, incidents: { labels: [], data: [] }, performance: { labels: [], data: [] }, financial: { labels: [], data: [] } },
        indicators: { topAgents: {}, productiveDays: [], punctuality: { punctualityRate: null, totalTasks: 0 } },
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDashboard = useCallback(async (clientId, params = {}) => {
        setIsLoading(true);
        setError(null);

        const result = await clientDashboardService.getDashboard(clientId, params);

        if (result.success) {
            setDashboardData(result.data);
            setError(null);
        } else {
            setDashboardData({
                filters: { dateRange: 'all', shortcuts: [] },
                kpis: { tasks: 0, activeAgents: 0, duration: 0, distance: 0, incidents: 0, subscription: false },
                charts: { tasks: { labels: [], data: [] }, incidents: { labels: [], data: [] }, performance: { labels: [], data: [] }, financial: { labels: [], data: [] } },
                indicators: { topAgents: {}, productiveDays: [], punctuality: { punctualityRate: null, totalTasks: 0 } },
            });
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    return {
        dashboardData,
        isLoading,
        error,
        fetchDashboard,
    };
};