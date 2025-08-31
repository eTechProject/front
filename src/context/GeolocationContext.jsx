import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { locationService } from '@/services/features/agent/locationService.js';
import { useAuth } from '@/context/AuthContext.jsx';
import { useZone } from '@/hooks/features/zone/useZone.js';

// eslint-disable-next-line react-refresh/only-export-components
export const GeolocationContext = createContext(undefined);

export const GeolocationProvider = ({ children }) => {
    const { user } = useAuth();
    const { getZoneByAgent } = useZone();
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [watchId, setWatchId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const intervalRef = useRef(null);
    const lastLocationRef = useRef(null);
    const isFirstLocationRef = useRef(true); // Track if this is the first location after starting

    // Function to get current task for the agent
    const getCurrentTask = useCallback(async () => {
        if (!user?.userId) return null;

        try {
            const result = await getZoneByAgent(user.userId);

            if (result.success && result.data) {
                // Check if there's an assignedTask directly in the data
                if (result.data.assignedTask?.id) {
                    return { id: result.data.assignedTask.id };
                }

                // Fallback: check assignedAgents array
                if (result.data.assignedAgents?.length > 0) {
                    const currentAgentAssignment = result.data.assignedAgents.find(
                        assignment => assignment.agent?.user?.userId === user.userId
                    );

                    if (currentAgentAssignment?.task?.id) {
                        return currentAgentAssignment.task;
                    }

                    if (currentAgentAssignment?.assignedTask?.id) {
                        return { id: currentAgentAssignment.assignedTask.id };
                    }
                }
            }

            return null;
        } catch (error) {
            console.error('Error fetching current task:', error);
            return null;
        }
    }, [user?.userId, getZoneByAgent]);

    // Function to send location data to the server
    const sendLocationToServer = useCallback(async (coords, isEnd = false) => {
        if (!user?.userId || !coords) {
            return;
        }

        setIsUploading(true);

        try {
            // Get battery level if available, otherwise default to 85%
            let batteryLevel = 85.0;
            try {
                if ('getBattery' in navigator) {
                    const battery = await navigator.getBattery();
                    batteryLevel = battery.level * 100;
                }
            } catch (e) {
                // Battery API not supported, use default value
            }

            // Get fresh task data each time to ensure we have the latest task ID
            const freshTask = await getCurrentTask();
            const taskId = freshTask?.id;

            if (!taskId || taskId === "") {
                setIsUploading(false);
                return;
            }

            // Determine isSignificant and reason based on the state
            let isSignificant, reason;

            if (isEnd) {
                // End of task
                isSignificant = true;
                reason = "end_task";
            } else if (isFirstLocationRef.current) {
                // First location after starting tracking
                isSignificant = true;
                reason = "start_task";
                isFirstLocationRef.current = false;
            } else {
                // Middle of task
                isSignificant = false;
                reason = "manual_report";
            }

            const locationData = {
                longitude: coords.longitude,
                latitude: coords.latitude,
                accuracy: coords.accuracy || 10.0,
                speed: coords.speed || 0.0,
                batteryLevel: batteryLevel,
                isSignificant: isSignificant,
                reason: reason,
                taskId: taskId
            };

            const result = await locationService.sendLocation(user.userId, locationData);

            if (!result.success) {
                console.error('Error sending location:', result.error);
            }

            // Keep indicator visible for at least 1 second
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error('Error sending location:', error);
        } finally {
            setIsUploading(false);
        }
    }, [user?.userId, getCurrentTask]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    const toggleTracking = useCallback(async () => {
        if (isActive) {
            // Stop tracking - send end location if we have one
            if (lastLocationRef.current) {
                await sendLocationToServer(lastLocationRef.current, true); // isEnd = true
            }

            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
                setWatchId(null);
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setIsActive(false);
            setError(null);
            setLocation(null);
            setCurrentTask(null);
            lastLocationRef.current = null;
            isFirstLocationRef.current = true; // Reset for next session
        } else {
            // Start tracking
            if (!navigator.geolocation) {
                setError("Géolocalisation non supportée");
                return;
            }

            // Fetch current task before starting tracking
            const task = await getCurrentTask();
            setCurrentTask(task);

            setIsActive(true);
            setError(null);
            isFirstLocationRef.current = true; // Reset flag when starting

            const id = navigator.geolocation.watchPosition(
                (position) => {
                    const coords = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        speed: position.coords.speed,
                        timestamp: new Date().toISOString()
                    };
                    setLocation(coords);
                    lastLocationRef.current = coords;
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

            // Start interval to send location every 5 seconds
            intervalRef.current = setInterval(async () => {
                if (lastLocationRef.current && user?.userId) {
                    await sendLocationToServer(lastLocationRef.current, false); // isEnd = false
                }
            }, 5000);
        }
    }, [geoOptions, isActive, watchId, getCurrentTask, user?.userId, sendLocationToServer]);

    useEffect(() => {
        return () => {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return (
        <GeolocationContext.Provider value={{
            location,
            error,
            isActive,
            isUploading,
            currentTask,
            toggleTracking
        }}>
            {children}
        </GeolocationContext.Provider>
    );
};
