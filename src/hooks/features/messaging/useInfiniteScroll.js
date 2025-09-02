import {useCallback, useEffect, useRef} from 'react';

/**
 * Hook personnalisé pour gérer l'infinite scroll dans la messagerie
 * @param {function} loadMore - Fonction à appeler pour charger plus de contenu
 * @param {boolean} hasMore - Indique s'il y a encore du contenu à charger
 * @param {boolean} isLoading - Indique si un chargement est en cours
 * @param {Array} dependencies - Dépendances pour réinitialiser le scroll
 * @param {number} threshold - Distance du haut en pixels pour déclencher le chargement (défaut: 50)
 */
export const useInfiniteScroll = (loadMore, hasMore, isLoading, dependencies = [], threshold = 50) => {
    const containerRef = useRef(null);
    const previousScrollHeightRef = useRef(0);
    const isLoadingRef = useRef(false);

    const handleLoadMore = useCallback(async () => {
        if (!hasMore || isLoading || isLoadingRef.current) {
            return;
        }

        isLoadingRef.current = true;
        const container = containerRef.current;

        if (container) {
            previousScrollHeightRef.current = container.scrollHeight - container.scrollTop;
        }

        try {
            await loadMore();
        } finally {
            isLoadingRef.current = false;
        }
    }, [loadMore, hasMore, isLoading]);

    // Maintenir la position après le chargement
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !previousScrollHeightRef.current) {
            return;
        }
        container.scrollTop = container.scrollHeight - previousScrollHeightRef.current;

        // Réinitialiser
        previousScrollHeightRef.current = 0;
    }, [dependencies]);

    // Gestionnaire de scroll
    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container || !hasMore || isLoading || isLoadingRef.current) {
            return;
        }

        if (container.scrollTop <= threshold) {
            handleLoadMore().then();
        }
    }, [hasMore, isLoading, threshold, handleLoadMore]);

    // Attacher l'écouteur de scroll
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    // Fonction pour scroller vers le bas (nouveau message)
    const scrollToBottom = useCallback((behavior = 'smooth') => {
        const container = containerRef.current;
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior
            });
        }
    }, []);

    return {
        containerRef,
        scrollToBottom,
        loadMore: handleLoadMore
    };
};