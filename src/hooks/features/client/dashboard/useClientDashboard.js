import { useState, useCallback } from 'react';
import { clientDashboardService } from "@/services/features/client/dashboard/clientDashboardService.js";

export const useClientDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        filters: { choice: 'all', dateStart: null, dateEnd: null },
        kpis: { totalTasks: 0, completionRate: "0%", avgTaskDuration: "0h 00m", avgDistancePerAgent: "0 km", totalAlerts: 0, subscription: "Inactif" },
        charts: {
            tasksOverTime: { type: 'line', labels: [], data: [] },
            taskCompletion: { type: 'doughnut', labels: [], data: [] },
            agentPunctuality: { type: 'bar', labels: [], data: [] },
            averageResponseTime: { type: 'bar', labels: [], data: [] }
        },
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
                filters: { choice: 'all', dateStart: null, dateEnd: null },
                kpis: { totalTasks: 0, completionRate: "0%", avgTaskDuration: "0h 00m", avgDistancePerAgent: "0 km", totalAlerts: 0, subscription: "Inactif" },
                charts: {
                    tasksOverTime: { type: 'line', labels: [], data: [] },
                    taskCompletion: { type: 'doughnut', labels: [], data: [] },
                    agentPunctuality: { type: 'bar', labels: [], data: [] },
                    averageResponseTime: { type: 'bar', labels: [], data: [] }
                },
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