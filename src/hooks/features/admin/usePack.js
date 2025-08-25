import { useState, useCallback } from 'react';
import { adminPackService } from '@/services/features/admin/adminPackService.js';

export const usePack = () => {
    const [packs, setPacks] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pages: 1,
        limit: 20,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPacks = useCallback(async (params = {}) => {
        setIsLoading(true);
        setError(null);

        const result = await adminPackService.getAll(params);

        if (result.success) {
            setPacks(result.data);
            setPagination(result.pagination || {
                total: result.data.length,
                page: 1,
                pages: 1,
                limit: 20,
            });
            setError(null);
        } else {
            setPacks([]);
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    const fetchPackById = useCallback(async (id) => {
        setIsLoading(true);
        setError(null);

        const result = await adminPackService.getById(id);

        if (result.success) {
            setError(null);
            setIsLoading(false);
            return result;
        } else {
            setError(result.error);
            setIsLoading(false);
            return result;
        }
    }, []);

    const createPack = useCallback(async (packData) => {
        setIsLoading(true);
        setError(null);

        const result = await adminPackService.create(packData);

        if (result.success) {
            setPacks(prev => [...prev, result.data]);
        } else {
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    const updatePack = useCallback(async (id, packData) => {
        setIsLoading(true);
        setError(null);

        const result = await adminPackService.update(id, packData);

        if (result.success) {
            setPacks(prev =>
                prev.map(pack =>
                    pack.id === id ? { ...pack, ...result.data } : pack
                )
            );
        } else {
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    const removePack = useCallback(async (id) => {
        setIsLoading(true);
        setError(null);

        const result = await adminPackService.remove(id);

        if (result.success) {
            setPacks(prev => prev.filter(pack => pack.id !== id));
        } else {
            setError(result.error);
        }
        setIsLoading(false);
        return result;
    }, []);

    return {
        packs,
        pagination,
        isLoading,
        error,
        fetchPacks,
        fetchPackById,
        createPack,
        updatePack,
        removePack,
    };
};