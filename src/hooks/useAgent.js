import { useState, useCallback } from 'react';
import { agentService } from '../services/agentService';

// Utilisation du hook pour gérer les agents
export const useAgent = () => {
    const [agents, setAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Charger tous les agents
    const fetchAgents = useCallback(async (params = {}) => {
        setIsLoading(true);
        setError(null);

        const result = await agentService.getAll(params);

        if (result.success) {
            setAgents(result.data); // result.data est déjà un tableau d'agents
            setError(null);
        } else {
            setAgents([]);
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    // Création
    const createAgent = useCallback(async (agent) => {
        setIsLoading(true);
        setError(null);

        const result = await agentService.create(agent);

        if (result.success) {
            setAgents(prev => [...prev, result.data]);
        } else {
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    // Edition
    const updateAgent = useCallback(async (id, agent) => {
        setIsLoading(true);
        setError(null);

        const result = await agentService.update(id, agent);

        if (result.success) {
            setAgents(prev =>
                prev.map(a =>
                    a.encryptedId === id ? result.data : a
                )
            );
        } else {
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    // Suppression
    const removeAgent = useCallback(async (id) => {
        setIsLoading(true);
        setError(null);

        const result = await agentService.remove(id);

        if (result.success) {
            setAgents(prev => prev.filter(a => a.encryptedId !== id));
        } else {
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    return {
        agents,
        isLoading,
        error,
        fetchAgents,
        createAgent,
        updateAgent,
        removeAgent,
    };
};