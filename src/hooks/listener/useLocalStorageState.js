import { useState, useEffect } from 'react';

export const useLocalStorageState = (key, defaultValue) => {
    const [value, setValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return defaultValue;
        }
    });

    // Fonction pour mettre à jour la valeur
    const setStoredValue = (newValue) => {
        try {
            setValue(newValue);
            localStorage.setItem(key, JSON.stringify(newValue));

            // Dispatch un événement personnalisé pour notifier les autres composants
            window.dispatchEvent(new CustomEvent('localStorageChange', {
                detail: { key, value: newValue }
            }));
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    };

    // Écouter les changements de localStorage
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.detail && e.detail.key === key) {
                setValue(e.detail.value);
            }
        };

        // Écouter les événements personnalisés
        window.addEventListener('localStorageChange', handleStorageChange);

        // Écouter les événements storage natifs (autres onglets)
        const handleNativeStorageChange = (e) => {
            if (e.key === key) {
                try {
                    const newValue = e.newValue ? JSON.parse(e.newValue) : defaultValue;
                    setValue(newValue);
                } catch (error) {
                    console.warn('Error parsing storage event value:', error);
                }
            }
        };

        window.addEventListener('storage', handleNativeStorageChange);

        return () => {
            window.removeEventListener('localStorageChange', handleStorageChange);
            window.removeEventListener('storage', handleNativeStorageChange);
        };
    }, [key, defaultValue]);

    return [value, setStoredValue];
};