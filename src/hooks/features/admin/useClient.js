import { useState, useCallback } from 'react';
import { adminClientService } from '@/services/features/admin/adminClientService.js';

export const useClient = () => {
    const [clients, setClients] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 1
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Charger tous les clients avec pagination
    const fetchClients = useCallback(async (params = {}) => {
        setIsLoading(true);
        setError(null);

        const result = await adminClientService.getAll(params);

        if (result.success) {
            setClients(result.data);
            setPagination(result.pagination || {
                total: result.data.length,
                page: 1,
                pages: 1
            });
            setError(null);
        } else {
            setClients([]);
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    // Recherche de clients
    const searchClients = useCallback(async (params = {}) => {
        setIsLoading(true);
        setError(null);

        const result = await adminClientService.search(params);

        if (result.success) {
            setClients(result.data);
            setPagination({
                total: result.meta?.total || result.data.length,
                page: 1,
                pages: 1
            });
            setError(null);
        } else {
            setClients([]);
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    // Création d'un client
    const createClient = useCallback(async (clientData) => {
        setIsLoading(true);
        setError(null);

        const result = await adminClientService.create(clientData);

        if (result.success) {
            setClients(prev => [...prev, result.data]);
        } else {
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    // Mise à jour d'un client
    const updateClient = useCallback(async (id, clientData) => {
        setIsLoading(true);
        setError(null);

        const result = await adminClientService.update(id, clientData);

        if (result.success) {
            setClients(prev =>
                prev.map(client =>
                    client.userId === id ? { ...client, ...result.data } : client
                )
            );
        } else {
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    // Suppression d'un client
    const removeClient = useCallback(async (id) => {
        setIsLoading(true);
        setError(null);

        const result = await adminClientService.remove(id);

        if (result.success) {
            setClients(prev => prev.filter(client => client.userId !== id));
        } else {
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    return {
        clients,
        pagination,
        isLoading,
        error,
        fetchClients,
        searchClients,
        createClient,
        updateClient,
        removeClient,
    };
};