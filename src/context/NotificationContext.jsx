import React, { createContext, useContext, useCallback, useEffect, useState, useRef } from 'react';
import useMercureSubscription from '@/hooks/features/messaging/useMercureSubscription.js';
import { useAuth } from '@/context/AuthContext.jsx';
import { playNotificationSound } from '@/utils/notificationSound.js';

const MERCURE_URL = import.meta.env.VITE_MERCURE_URL || 'http://localhost:8000/.well-known/mercure';
const TOKEN_REFRESH_BUFFER = 60;

const NotificationContext = createContext({});

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const [permission, setPermission] = useState(Notification.permission);
    const [mercureToken, setMercureToken] = useState(null);
    const [isEnabled, setIsEnabled] = useState(true);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [latestMessage, setLatestMessage] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [toasts, setToasts] = useState([]);

    const userRef = useRef(user);
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    const globalTopic = user?.userId ? `chat/${user.userId}` : null;

    const isTabVisible = useCallback(() => {
        return !document.hidden && document.visibilityState === 'visible';
    }, []);

    useEffect(() => {
        if (isEnabled && permission === 'default') {
            Notification.requestPermission().then(setPermission);
        }
    }, [isEnabled, permission]);

    const getMercureToken = useCallback(async () => {
        if (!user?.userId) return null;

        try {
            const response = await fetch('/api/mercure/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    topics: [`chat/${user.userId}`]
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erreur lors de la récupération du token Mercure global:', error);
            return null;
        }
    }, [user?.userId, user?.token]);

    useEffect(() => {
        if (!globalTopic || mercureToken) return;

        const fetchToken = async () => {
            const result = await getMercureToken();
            if (result?.token) {
                setMercureToken(result.token);

                if (result.expires_in) {
                    const refreshTime = (result.expires_in - TOKEN_REFRESH_BUFFER) * 1000;
                    setTimeout(() => {
                        setMercureToken(null);
                    }, refreshTime);
                }
            }
        };

        fetchToken().then();
    }, [globalTopic, mercureToken, getMercureToken]);

    const showToast = useCallback((notification) => {
        const toastId = notification.id || Date.now();
        const toast = {
            id: toastId,
            type: notification.type || 'info',
            title: notification.title,
            message: notification.message,
            timestamp: new Date(),
            duration: notification.duration || 10000
        };

        setToasts(prev => [...prev, toast]);

        // Play notification sound
        playNotificationSound();
    }, []);

    const removeToast = useCallback((toastId) => {
        setToasts(prev => prev.filter(t => t.id !== toastId));
    }, []);

    const handleGlobalMercureMessage = useCallback((data) => {
        const currentUser = userRef.current;
        if (!data || !currentUser) return;

        if (data.sender_id && data.content) {
            const isFromCurrentUser = String(data.sender_id) === String(currentUser.userId);
            if (isFromCurrentUser) return;

            const newNotification = {
                id: data.id || Date.now(),
                type: 'message',
                timestamp: new Date(),
                data: data,
                senderName: data.sender_name || 'Quelqu\'un',
                read: false
            };

            setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
            setUnreadMessages(prev => prev + 1);
            setLatestMessage(newNotification);

            // Show toast notification
            showToast({
                id: newNotification.id,
                type: 'message',
                title: `Nouveau message de ${data.sender_name || 'Quelqu\'un'}`,
                message: data.content.length > 100 ? `${data.content.substring(0, 100)}...` : data.content,
                duration: 10000
            });

            // Show browser notification only if tab is not visible
            if (permission === 'granted' && isEnabled && !isTabVisible()) {
                const senderName = data.sender_name || 'Quelqu\'un';
                const title = `Nouveau message de ${senderName}`;
                const body = data.content.length > 100 ? `${data.content.substring(0, 100)}...` : data.content;

                const notification = new Notification(title, {
                    body,
                    icon: '/favicon.ico',
                    tag: `message-${data.id}`,
                    silent: false
                });

                notification.onclick = () => {
                    window.focus();
                    window.dispatchEvent(new CustomEvent('navigateToMessages'));
                    notification.close();
                };

                setTimeout(() => notification.close(), 5000);
            }
        }
    }, [permission, isEnabled, isTabVisible, showToast]);

    useMercureSubscription({
        topic: globalTopic,
        mercureUrl: MERCURE_URL,
        token: mercureToken,
        onMessage: handleGlobalMercureMessage
    });

    const requestPermission = useCallback(() => {
        return Notification.requestPermission().then(setPermission);
    }, []);

    const toggleNotifications = useCallback(() => {
        setIsEnabled(prev => !prev);
    }, []);

    const markMessagesAsRead = useCallback(() => {
        setUnreadMessages(0);
        setLatestMessage(null);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
        setUnreadMessages(0);
        setLatestMessage(null);
    }, []);

    const addNotification = useCallback((notification) => {
        const newNotif = {
            id: notification.id || Date.now(),
            type: notification.type || 'info',
            timestamp: new Date(),
            data: notification.data,
            title: notification.title,
            message: notification.message,
            read: false
        };

        setNotifications(prev => [newNotif, ...prev.slice(0, 49)]);
        setUnreadMessages(prev => prev + 1);

        // Show toast
        showToast({
            id: newNotif.id,
            type: newNotif.type,
            title: newNotif.title,
            message: newNotif.message,
            duration: notification.duration || 10000
        });
    }, [showToast]);

    const contextValue = {
        permission,
        isEnabled,
        isTabVisible,
        requestPermission,
        toggleNotifications,
        unreadMessages,
        latestMessage,
        notifications,
        toasts,
        markMessagesAsRead,
        clearNotifications,
        addNotification,
        showToast,
        removeToast
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
}