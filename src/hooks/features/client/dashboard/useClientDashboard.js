import { useState, useCallback } from 'react';
import { clientDashboardService } from "@/services/features/client/dashboard/clientDashboardService.js";

export const useClientDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        kpis: {
            totalTasks: 0,
            completionRate: "0%",
            avgTaskDuration: "0h 00m",
            avgDistancePerAgent: "0 km",
            totalAlerts: 0,
            subscription: "Inactif"
        },
        charts: {
            tasksOverTime: { type: 'line', labels: [], data: [] },
            taskCompletion: { type: 'doughnut', labels: [], data: [] },
            agentPunctuality: { type: 'bar', labels: [], data: [] },
            averageResponseTime: { type: 'bar', labels: [], data: [] }
        },
        tasksHistory: []
    });

    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 1
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDashboard = useCallback(async (clientId, params = {}) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await clientDashboardService.getDashboard(clientId, params);

            if (result.success) {
                setDashboardData({
                    kpis: result.data?.kpis || {
                        totalTasks: 0,
                        completionRate: "0%",
                        avgTaskDuration: "0h 00m",
                        avgDistancePerAgent: "0 km",
                        totalAlerts: 0,
                        subscription: "Inactif"
                    },
                    charts: result.data?.charts || {
                        tasksOverTime: { type: 'line', labels: [], data: [] },
                        taskCompletion: { type: 'doughnut', labels: [], data: [] },
                        agentPunctuality: { type: 'bar', labels: [], data: [] },
                        averageResponseTime: { type: 'bar', labels: [], data: [] }
                    },
                    tasksHistory: result.data?.tasksHistory || []
                });

                if (result.pagination) {
                    setPagination(result.pagination);
                }

                setError(null);
            } else {
                setError(result.error);
                setDashboardData({
                    kpis: {
                        totalTasks: 0,
                        completionRate: "0%",
                        avgTaskDuration: "0h 00m",
                        avgDistancePerAgent: "0 km",
                        totalAlerts: 0,
                        subscription: "Inactif"
                    },
                    charts: {
                        tasksOverTime: { type: 'line', labels: [], data: [] },
                        taskCompletion: { type: 'doughnut', labels: [], data: [] },
                        agentPunctuality: { type: 'bar', labels: [], data: [] },
                        averageResponseTime: { type: 'bar', labels: [], data: [] }
                    },
                    tasksHistory: []
                });
            }
        } catch (err) {
            setError('Erreur lors du chargement du dashboard');
            setDashboardData({
                kpis: {
                    totalTasks: 0,
                    completionRate: "0%",
                    avgTaskDuration: "0h 00m",
                    avgDistancePerAgent: "0 km",
                    totalAlerts: 0,
                    subscription: "Inactif"
                },
                charts: {
                    tasksOverTime: { type: 'line', labels: [], data: [] },
                    taskCompletion: { type: 'doughnut', labels: [], data: [] },
                    agentPunctuality: { type: 'bar', labels: [], data: [] },
                    averageResponseTime: { type: 'bar', labels: [], data: [] }
                },
                tasksHistory: []
            });
        } finally {
            setIsLoading(false);
        }

        return { success: !error, data: dashboardData };
    }, [error, dashboardData]);

    return {
        dashboardData,
        pagination,
        isLoading,
        error,
        fetchDashboard,
    };
};