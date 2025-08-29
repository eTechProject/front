class MapReloadService {
    constructor() {
        this.listeners = [];
        this.lastReloadTimestamp = 0;
        this.debounceTimeout = null;
        this.DEBOUNCE_DELAY = 500;
    }

    // Déclencher un événement de rechargement
    triggerReload(action = 'generic') {
        const timestamp = Date.now();
        // Vérifier si le dernier rechargement est récent
        if (timestamp - this.lastReloadTimestamp < this.DEBOUNCE_DELAY) {
            console.log('Reload ignored due to debounce');
            return;
        }

        // Débouncer l'événement
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        this.debounceTimeout = setTimeout(() => {
            try {
                const eventData = { timestamp, action };
                localStorage.setItem('mapContentReload', JSON.stringify(eventData));
                window.dispatchEvent(new CustomEvent('mapContentReload', {
                    detail: { key: 'mapContentReload', value: eventData }
                }));
                this.lastReloadTimestamp = timestamp;
                console.log('MapContent reload triggered:', eventData);
            } catch (error) {
                console.warn('Error dispatching reload event:', error);
            }
        }, this.DEBOUNCE_DELAY);
    }

    // S'abonner aux événements de rechargement
    subscribe(callback) {
        const listener = (e) => {
            if (e.detail && e.detail.key === 'mapContentReload') {
                callback(e.detail.value);
            }
        };
        window.addEventListener('mapContentReload', listener);

        // Gérer les événements inter-onglets
        const storageListener = (e) => {
            if (e.key === 'mapContentReload') {
                try {
                    const newValue = e.newValue ? JSON.parse(e.newValue) : null;
                    if (newValue && newValue.timestamp > this.lastReloadTimestamp) {
                        callback(newValue);
                        this.lastReloadTimestamp = newValue.timestamp;
                    }
                } catch (error) {
                    console.warn('Error parsing storage event value:', error);
                }
            }
        };
        window.addEventListener('storage', storageListener);

        // Stocker le listener pour nettoyage
        this.listeners.push({ callback, listener, storageListener });
        return () => {
            window.removeEventListener('mapContentReload', listener);
            window.removeEventListener('storage', storageListener);
            this.listeners = this.listeners.filter(l => l.callback !== callback);
        };
    }
}

export const mapReloadService = new MapReloadService();