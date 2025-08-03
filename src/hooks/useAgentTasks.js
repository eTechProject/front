import { useState, useCallback } from 'react';
import { agentService } from '../services/agentService';

export const useAgentTasks = (agentId) => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAssignedTasks = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const result = await agentService.getAssignedTasks(agentId);

        if (result.success) {
            setTasks(result.data || []);
            setError(null);
        } else {
            setTasks([]);
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, [agentId]);

    return {
        tasks,
        isLoading,
        error,
        fetchAssignedTasks,
    };
};