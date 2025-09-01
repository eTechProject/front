import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook pour s'abonner aux notifications Mercure
 * @param {Object} params - Paramètres de l'abonnement
 * @param {string} params.topic - Le topic à écouter (ex: /users/:userId/notification)
 * @param {string} params.mercureUrl - URL du hub Mercure
 * @param {string} params.token - Token JWT pour les topics privés
 * @param {Function} params.onNotification - Callback pour les notifications reçues
 * @param {number} [params.reconnectDelay=3000] - Délai de reconnexion en ms
 */
export default function useMercureNotificationSubscription({
    topic,
    mercureUrl,
    token,
    onNotification,
    reconnectDelay = 3000
}) {
    const eventSourceRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const isConnectingRef = useRef(false);

    // Callback stabilisé pour la gestion des notifications
    const handleNotification = useCallback((event) => {
        console.log('🔔 Notification Mercure reçue:', event);
        try {
            const data = JSON.parse(event.data);
            console.log('🔔 Données notification parsées:', data);
            onNotification?.(data);
        } catch (error) {
            console.error('Erreur lors du parsing de la notification Mercure:', error);
        }
    }, [onNotification]);

    useEffect(() => {
        if (!topic || !mercureUrl || !onNotification) {
            console.log('Abonnement Mercure notification ignoré: paramètres manquants');
            return;
        }
        if (isConnectingRef.current) {
            return;
        }
        const cleanup = () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            isConnectingRef.current = false;
        };
        const connect = () => {
            if (isConnectingRef.current) return;
            isConnectingRef.current = true;
            cleanup();
            try {
                const url = new URL(mercureUrl);
                url.searchParams.append('topic', topic);
                console.log(`Connexion Mercure notification au topic: ${topic}`);
                console.log('Token utilisé:', token ? 'Oui' : 'Non');
                console.log('URL complète:', url.toString());
                const options = token ? {
                    headers: { 'Authorization': `Bearer ${token}` }
                } : undefined;
                const eventSource = new EventSource(url, options);
                eventSource.onopen = () => {
                    console.log('Connexion Mercure notification établie');
                    isConnectingRef.current = false;
                };
                eventSource.onmessage = handleNotification;
                eventSource.onerror = (error) => {
                    console.error('Erreur de connexion Mercure notification:', error);
                    isConnectingRef.current = false;
                    if (eventSourceRef.current === eventSource) {
                        eventSource.close();
                        eventSourceRef.current = null;
                    }
                    if (!reconnectTimeoutRef.current) {
                        reconnectTimeoutRef.current = setTimeout(() => {
                            reconnectTimeoutRef.current = null;
                            console.log('Tentative de reconnexion Mercure notification...');
                            connect();
                        }, reconnectDelay);
                    }
                };
                eventSourceRef.current = eventSource;
            } catch (error) {
                console.error('Erreur lors de la création de la connexion Mercure notification:', error);
                isConnectingRef.current = false;
            }
        };
        connect();
        return cleanup;
    }, [topic, mercureUrl, token, handleNotification, reconnectDelay]);
}
