import { useEffect, useRef } from 'react';

/**
 * Hook for subscribing to Mercure events
 * @param {Object} params - Parameters for the subscription
 * @param {string} params.topic - The topic to subscribe to
 * @param {string} params.mercureUrl - The Mercure hub URL
 * @param {string} params.token - JWT token for private topics
 * @param {Function} params.onMessage - Callback for received messages
 */
export default function useMercureSubscription({ topic, mercureUrl, token, onMessage }) {
    const eventSourceRef = useRef(null);

    useEffect(() => {
        // Don't create a subscription if any required parameter is missing
        if (!topic || !mercureUrl || !onMessage) {
            console.log('Mercure subscription skipped: missing parameters');
            return;
        }

        // Close any existing connection before creating a new one
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        // Build the URL with the topic
        const url = new URL(mercureUrl);
        url.searchParams.append('topic', topic);

        console.log('Starting Mercure subscription to:', topic);

        // Create EventSource with authorization header if token is provided
        const eventSourceOptions = token ? { headers: { 'Authorization': `Bearer ${token}` } } : undefined;
        const eventSource = new EventSource(url, eventSourceOptions);

        // Handle incoming messages
        eventSource.onmessage = (event) => {
            console.log('Mercure message received');
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (e) {
                console.error('Error parsing Mercure message:', e);
            }
        };

        // Handle connection opened
        eventSource.onopen = () => {
            console.log('Mercure connection established');
        };

        // Handle errors
        eventSource.onerror = (err) => {
            console.error('Mercure connection error:', err);

            // Try to reconnect after a delay in case of error
            setTimeout(() => {
                if (eventSourceRef.current === eventSource) {
                    console.log('Attempting to reconnect to Mercure...');
                    eventSource.close();
                    eventSourceRef.current = null;
                }
            }, 3000);
        };

        // Store the reference
        eventSourceRef.current = eventSource;

        // Cleanup function
        return () => {
            console.log('Closing Mercure connection');
            eventSourceRef.current?.close();
            eventSourceRef.current = null;
        };
    }, [topic, mercureUrl, token, onMessage]);
}