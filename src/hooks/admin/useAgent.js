import { useState, useCallback } from 'react';
import { adminAgentService } from '../../services/admin/adminAgentService.js';

export const useAgent = () => {
    const [agents, setAgents] = useState([]);
    const [agentTasks, setAgentTasks] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 1
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Charger tous les agents avec pagination
    const fetchAgents = useCallback(async (params = {}) => {
        setIsLoading(true);
        setError(null);

        const result = await adminAgentService.getAllAgents(params);
        if (result.success) {
            setAgents(result.data);
            if (result.pagination) {
                setPagination(result.pagination);
            }
            setError(null);
        } else {
            setAgents([]);
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    // Rechercher des agents
    const searchAgents = useCallback(async (params = {}) => {
        setIsLoading(true);
        setError(null);

        const result = await adminAgentService.searchAgents(params);

        if (result.success) {
            setAgents(result.data);
            setError(null);
        } else {
            setAgents([]);
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    // Récupérer un agent spécifique
    const getAgent = useCallback(async (id) => {
        setIsLoading(true);
        setError(null);

        const result = await adminAgentService.getAgent(id);
        setIsLoading(false);

        if (!result.success) {
            setError(result.error);
        }

        return result;
    }, []);

    // Création d'un agent
    const createAgent = useCallback(async (agent) => {
        setIsLoading(true);
        setError(null);

        const result = await adminAgentService.createAgent(agent);

        if (result.success) {
            setAgents(prev => [...prev, result.data]);
        } else {
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    // Edition d'un agent
    const updateAgent = useCallback(async (id, agent) => {
        setIsLoading(true);
        setError(null);

        const result = await adminAgentService.updateAgent(id, agent);

        if (result.success) {
            setAgents(prev =>
                prev.map(a =>
                    a.agentId === id ? result.data : a
                )
            );
        } else {
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    // Suppression d'un agent
    const removeAgent = useCallback(async (id) => {
        setIsLoading(true);
        setError(null);

        const result = await adminAgentService.removeAgent(id);

        if (result.success) {
            setAgents(prev => prev.filter(a => a.agentId !== id));
        } else {
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    const getAgentTasks = useCallback(async (agentId) => {
        setIsLoading(true);
        setError(null);
        setAgentTasks([]);

        const result = await adminAgentService.getAgentTasks(agentId);

        if (result.success) {
            setAgentTasks(result.data.tasks);
            setError(null);
        } else {
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    return {
        agents,
        agentTasks,
        pagination,
        isLoading,
        error,
        fetchAgents,
        searchAgents,
        getAgent,
        createAgent,
        updateAgent,
        removeAgent,
        getAgentTasks
    };
};