import { useState } from 'react';
import { zoneService as assignmentService, zoneService } from '../services/zoneService';

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

    const getZone = async (clientId) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        const result = await zoneService.getZone(clientId);
        setIsLoading(false);
        setSuccess(result.success);
        if (!result.success) setError(result.error);
        return result;
    };

    const getZoneByAgent = async (agentId) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        const result = await zoneService.getZoneByAgent(agentId);
        setIsLoading(false);
        setSuccess(result.success);
        if (!result.success) setError(result.error);
        return result;
    };

    const getAvailableAgent = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        const result = await zoneService.getAvailableAgent();
        setIsLoading(false);
        setSuccess(result.success);
        if (!result.success) setError(result.error);
        return result;
    };

    const sendAssignment = async (dataAssignment) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        const result = await assignmentService.sendAssignment(dataAssignment);
        setIsLoading(false);
        setSuccess(result.success);
        if (!result.success) setError(result.error);
        return result;
    };

    return {
        isLoading,
        error,
        success,
        sendZone,
        getZone,
        getZoneByAgent,
        getAvailableAgent,
        sendAssignment
    };
};