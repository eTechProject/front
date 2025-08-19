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
            const isConnectingRef = useRef(false);

            // Callback stabilisé pour la gestion des messages
            const handleMessage = useCallback((event) => {
                console.log('📨 Message Mercure reçu:', event);
                try {
                    const data = JSON.parse(event.data);
                    console.log('📨 Données parsées:', data);
                    onMessage?.(data);
                } catch (error) {
                    console.error('Erreur lors du parsing du message Mercure:', error);
                }
            }, [onMessage]);

            useEffect(() => {
                // Validation des paramètres requis
                if (!topic || !mercureUrl || !onMessage) {
                    console.log('Abonnement Mercure ignoré: paramètres manquants');
                    return;
                }

                // Éviter les connexions multiples
                if (isConnectingRef.current) {
                    return;
                }

                // Fonction de nettoyage locale
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

                // Fonction de connexion
                const connect = () => {
                    if (isConnectingRef.current) return;
                    
                    isConnectingRef.current = true;
                    cleanup();

                    try {
                        const url = new URL(mercureUrl);
                        url.searchParams.append('topic', topic);

                        console.log(`Connexion Mercure au topic: ${topic}`);
                        console.log('Token utilisé:', token ? 'Oui' : 'Non');
                        console.log('URL complète:', url.toString());

                        // Options EventSource avec authentification si nécessaire
                        const options = token ? {
                            headers: { 'Authorization': `Bearer ${token}` }
                        } : undefined;

                        const eventSource = new EventSource(url, options);

                        // Gestionnaires d'événements
                        eventSource.onopen = () => {
                            console.log('Connexion Mercure établie');
                            isConnectingRef.current = false;
                        };
                        
                        eventSource.onmessage = handleMessage;
                        
                        eventSource.onerror = (error) => {
                            console.error('Erreur de connexion Mercure:', error);
                            isConnectingRef.current = false;

                            // Fermer la connexion défaillante
                            if (eventSourceRef.current === eventSource) {
                                eventSource.close();
                                eventSourceRef.current = null;
                            }

                            // Tentative de reconnexion après délai
                            if (!reconnectTimeoutRef.current) {
                                reconnectTimeoutRef.current = setTimeout(() => {
                                    reconnectTimeoutRef.current = null;
                                    console.log('Tentative de reconnexion Mercure...');
                                    connect();
                                }, reconnectDelay);
                            }
                        };

                        eventSourceRef.current = eventSource;

                    } catch (error) {
                        console.error('Erreur lors de la création de la connexion Mercure:', error);
                        isConnectingRef.current = false;
                    }
                };

                connect();

                return cleanup;
            }, [topic, mercureUrl, token, handleMessage, reconnectDelay]);
        }