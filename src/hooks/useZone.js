import { useState } from 'react';
import { zoneService } from '../services/zoneService';

export const useZone = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const sendZone = async (zoneData) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        const result = await zoneService.sendZone(zoneData);
        setIsLoading(false);
        setSuccess(result.success);
        if (!result.success) setError(result.error);
        return result;
    };
    const getZone= async (clientId) => {
        setIsLoading(true);
        setError(null);
        setSuccess(true);
        const result = await zoneService.getZone(clientId);
        setIsLoading(false);
        setSuccess(result.success);
        if (!result.success) setError(result.error);
        return result;
    }
    return {
        isLoading,
        error,
        success,
        sendZone,
        getZone,
    };
};