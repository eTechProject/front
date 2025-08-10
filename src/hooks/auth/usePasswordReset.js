import { useState } from 'react';
import { passwordService } from '@/services/auth/password/passwordService.js';

export const usePasswordReset = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const requestReset = async (email) => {
        setIsLoading(true);
        const result = await passwordService.requestReset(email);
        setIsLoading(false);
        setSuccess(result.success);
        if (!result.success) setError(result.error);
        return result;
    };

    const resetPassword = async (token, newPassword) => {
        setIsLoading(true);
        const result = await passwordService.resetPassword(token, newPassword);
        setIsLoading(false);
        setSuccess(result.success);
        if (!result.success) setError(result.error);
        return result;
    };

    return {
        isLoading,
        error,
        success,
        requestReset,
        resetPassword
    };
};