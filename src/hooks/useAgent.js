import { useState, useCallback } from 'react';
import { agentService } from '../services/agentService';

export const useAgent = () => {
    const [agents, setAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Charger tous les agents
    const fetchAgents = useCallback(async (params = {}) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await agentService.getAll(params);
            setAgents(data);
            return { success: true, data };
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des agents');
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Création
    const createAgent = useCallback(async (agent) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await agentService.create(agent);
            setAgents(prev => [...prev, data]);
            return { success: true, data };
        } catch (err) {
            setError(err.message || 'Erreur lors de la création');
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Edition
    const updateAgent = useCallback(async (id, agent) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await agentService.update(id, agent);
            setAgents(prev => prev.map(a => (a.id === id ? data : a)));
            return { success: true, data };
        } catch (err) {
            setError(err.message || 'Erreur lors de la modification');
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Suppression
    const removeAgent = useCallback(async (id) => {
        setIsLoading(true);
        setError(null);
        try {
            await agentService.remove(id);
            setAgents(prev => prev.filter(a => a.id !== id));
            return { success: true };
        } catch (err) {
            setError(err.message || 'Erreur lors de la suppression');
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
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