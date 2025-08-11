import { useEffect, useRef, useCallback } from 'react';

        /**
         * Hook optimisé pour s'abonner aux événements Mercure
         * @param {Object} params - Paramètres de l'abonnement
         * @param {string} params.topic - Le topic à écouter
         * @param {string} params.mercureUrl - URL du hub Mercure
         * @param {string} params.token - Token JWT pour les topics privés
         * @param {Function} params.onMessage - Callback pour les messages reçus
         * @param {number} [params.reconnectDelay=3000] - Délai de reconnexion en ms
         */
        export default function useMercureSubscription({
            topic,
            mercureUrl,
            token,
            onMessage,
            reconnectDelay = 3000
        }) {
            const eventSourceRef = useRef(null);
            const reconnectTimeoutRef = useRef(null);

            // Callback stabilisé pour la gestion des messages
            const handleMessage = useCallback((event) => {
                try {
                    const data = JSON.parse(event.data);
                    onMessage?.(data);
                } catch (error) {
                    console.error('Erreur lors du parsing du message Mercure:', error);
                }
            }, [onMessage]);

            // Fonction de nettoyage
            const cleanup = useCallback(() => {
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
                if (eventSourceRef.current) {
                    eventSourceRef.current.close();
                    eventSourceRef.current = null;
                }
            }, []);

            useEffect(() => {
                // Validation des paramètres requis
                if (!topic || !mercureUrl || !onMessage) {
                    console.log('Abonnement Mercure ignoré: paramètres manquants');
                    return cleanup;
                }

                cleanup();

                try {
                    const url = new URL(mercureUrl);
                    url.searchParams.append('topic', topic);

                    console.log(`Connexion Mercure au topic: ${topic}`);

                    // Options EventSource avec authentification si nécessaire
                    const options = token ? {
                        headers: { 'Authorization': `Bearer ${token}` }
                    } : undefined;

                    const eventSource = new EventSource(url, options);

                    // Gestionnaires d'événements
                    eventSource.onopen = () => console.log('Connexion Mercure établie');
                    eventSource.onmessage = handleMessage;
                    eventSource.onerror = (error) => {
                        console.error('Erreur de connexion Mercure:', error);

                        // Tentative de reconnexion après délai
                        reconnectTimeoutRef.current = setTimeout(() => {
                            if (eventSourceRef.current === eventSource) {
                                console.log('Tentative de reconnexion Mercure...');
                                cleanup();
                            }
                        }, reconnectDelay);
                    };

                    eventSourceRef.current = eventSource;

                } catch (error) {
                    console.error('Erreur lors de la création de la connexion Mercure:', error);
                }

                return cleanup;
            }, [topic, mercureUrl, token, handleMessage, cleanup, reconnectDelay]);

            // Nettoyage au démontage
            useEffect(() => cleanup, [cleanup]);
        }