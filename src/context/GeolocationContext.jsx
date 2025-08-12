import React, { createContext, useState, useEffect, useCallback } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const GeolocationContext = createContext(undefined);

export const GeolocationProvider = ({ children }) => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [watchId, setWatchId] = useState(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    const toggleTracking = useCallback(() => {
        if (isActive) {
            // Stop tracking
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
                setWatchId(null);
            }
            setIsActive(false);
            setError(null);
            setLocation(null);
            console.log('GPS Tracker arrêté');
        } else {
            // Start tracking
            if (!navigator.geolocation) {
                setError("Géolocalisation non supportée");
                return;
            }

            setIsActive(true);
            setError(null);

            const id = navigator.geolocation.watchPosition(
                (position) => {
                    const coords = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date().toISOString()
                    };
                    setLocation(coords);
                    console.log('Position GPS:', coords);
                },
                (err) => {
                    let errorMessage = '';
                    switch (err.code) {
                        case err.PERMISSION_DENIED:
                            errorMessage = "Permission refusée";
                            break;
                        case err.POSITION_UNAVAILABLE:
                            errorMessage = "Position non disponible";
                            break;
                        case err.TIMEOUT:
                            errorMessage = "Timeout GPS";
                            break;
                        default:
                            errorMessage = "Erreur GPS";
                            break;
                    }
                    setError(errorMessage);

                },
                geoOptions
            );

            setWatchId(id);
            console.log('GPS Tracker démarré');
        }
    }, [geoOptions, isActive, watchId]);

    useEffect(() => {
        return () => {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [watchId]);

    return (
        <GeolocationContext.Provider value={{
            location,
            error,
            isActive,
            toggleTracking
        }}>
            {children}
        </GeolocationContext.Provider>
    );
};