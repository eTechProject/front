import { useState, useCallback } from 'react';
import { agentService } from '@/services/features/agent/agentService.js';

export const useAgentDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        kpis: {
            totalTasks: 0,
            completionRate: '0%',
            avgTaskDuration: '0h 00m',
            avgDistance: '0 km',
            agentPunctuality: '0%'
        },
        charts: {
            tasksOverTime: { labels: [], data: [] },
            taskCompletion: { labels: [], data: [] }
        },
        tasks: []
    });

    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 1
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDashboard = useCallback(async (params = {}) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await agentService.getTasksHistory(params);

            if (result.success) {
                setDashboardData({
                    kpis: result.data?.kpis || {
                        totalTasks: 0,
                        completionRate: '0%',
                        avgTaskDuration: '0h 00m',
                        avgDistance: '0 km',
                        agentPunctuality: '0%'
                    },
                    charts: result.data?.charts || {
                        tasksOverTime: { labels: [], data: [] },
                        taskCompletion: { labels: [], data: [] }
                    },
                    tasks: result.data?.tasks || []
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
                        completionRate: '0%',
                        avgTaskDuration: '0h 00m',
                        avgDistance: '0 km',
                        agentPunctuality: '0%'
                    },
                    charts: {
                        tasksOverTime: { labels: [], data: [] },
                        taskCompletion: { labels: [], data: [] }
                    },
                    tasks: []
                });
            }
        } catch (err) {
            setError('Erreur lors du chargement du dashboard');
            setDashboardData({
                kpis: {
                    totalTasks: 0,
                    completionRate: '0%',
                    avgTaskDuration: '0h 00m',
                    avgDistance: '0 km',
                    agentPunctuality: '0%'
                },
                charts: {
                    tasksOverTime: { labels: [], data: [] },
                    taskCompletion: { labels: [], data: [] }
                },
                tasks: []
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