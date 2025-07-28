import React, {useEffect, useRef, useState} from 'react';
import {useAuth} from "../../../../../context/AuthContext.jsx";
import ZonePanel from './ZonePanel';
import ZonePanelToggle from './ZonePanelToggle';
import ZoneForm from './ZoneForm';
import {useZone} from "../../../../../hooks/useZone.js";

/**
 * Composant principal de la carte.
 * - Affiche les employés sur la carte (Leaflet)
 * - Permet de créer/éditer/supprimer des zones (clients uniquement)
 * - Permet de placer des employés sur la carte via drag & drop (agents non assignés)
 * - Gère l’affichage du panneau des zones et du formulaire de zone
 */
const MapView = ({
                     mapRef,
                     employees,
                     handleEmployeeClick,
                     selectedEmployee,
                     sidebarVisible,
                     draggingEmployee,
                     onEmployeeDrop,
                     onMapClick,
                 }) => {
    // Références et états internes
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const drawControlRef = useRef(null);
    const drawnItemsRef = useRef(null);
    const baseMapsRef = useRef({});
    const [drawnZones, setDrawnZones] = useState([]);
    const [showZonePanel, setShowZonePanel] = useState(true);
    const [showZoneForm, setShowZoneForm] = useState(false);
    const {user} = useAuth();
    const [zoneFormData, setZoneFormData] = useState({
        name: '',
        description: '',
        clientId: user?.userId,
        coordinates: [],
        type: '',
    });
    const [currentLayer, setCurrentLayer] = useState(null);
    const [zoneLoaded, setZoneLoaded] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dropPosition, setDropPosition] = useState(null);
    const [currentZoneInfo, setCurrentZoneInfo] = useState(null);

    // Hook custom pour gérer les zones (API)
    const {sendZone, getZone, isLoading, error, success} = useZone();

    // Configuration de la carte
    const MAX_ZOOM = 19;
    const INITIAL_ZOOM = 13;
    const INITIAL_CENTER = [-18.9146, 47.5309]; // Antananarivo

    /**
     * Renvoie une couleur en fonction du statut de l'employé.
     */
    const getStatusColorHex = (status) => {
        switch (status?.toLowerCase()) {
            case 'on the way':
            case 'pause':
                return '#10b981';
            case 'working':
                return '#3b82f6';
            case 'available':
            case 'disponible':
                return '#22c55e';
            case 'break':
                return '#eab308';
            case 'completed':
                return '#6b7280';
            case 'transit':
                return '#f97316';
            case 'off duty':
            case 'occupé':
                return '#ef4444';
            default:
                return '#9ca3af';
        }
    };

    /**
     * Gère le survol de la carte lors d'un drag d'employé (drag & drop).
     */
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
        // Calcule la position de dépôt sur la carte
        if (mapRef.current && mapInstanceRef.current) {
            const rect = mapRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const point = mapInstanceRef.current.containerPointToLatLng([x, y]);
            setDropPosition(point);
        }
    };

    /**
     * Remet l'état du drag à zéro lorsqu'on quitte la carte.
     */
    const handleDragLeave = () => {
        setIsDragOver(false);
        setDropPosition(null);
    };

    /**
     * Gère le drop d'un employé sur la carte.
     */
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (!mapInstanceRef.current) return;
        // Récupérer les coordonnées où l'employé est déposé
        const rect = mapRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // Convertir les coordonnées de l'écran en coordonnées géographiques
        const point = mapInstanceRef.current.containerPointToLatLng([x, y]);
        // Obtenir des informations sur la zone
        const zoneInfo = currentZoneInfo || {
            serviceOrderId: "uHkV_q2GbjDkHAdf1s_-Vw",
            securedZoneId: "shuo_c3aQVmqC0T60hPuNg"
        };

        // Afficher les informations complètes dans la console
        console.log('Affectation agent:', {
            agentId: draggingEmployee?.id || 'Non identifié',
            coordinates: {
                lat: point.lat.toFixed(6),
                lng: point.lng.toFixed(6),
            },
            serviceOrderId: zoneInfo.serviceOrderId,
            securedZoneId: zoneInfo.securedZoneId,
            timestamp: "2025-07-28 17:09:58",
            action: 'assignment',
            employee: draggingEmployee?.name || 'Non identifié'
        });

        try {
            // Essayer de récupérer l'employé des données de transfert
            const data = e.dataTransfer.getData('application/json');
            if (data) {
                const employee = JSON.parse(data);
                if (onEmployeeDrop) {
                    onEmployeeDrop(employee, point);
                }
            } else if (draggingEmployee && onEmployeeDrop) {
                onEmployeeDrop(draggingEmployee, point);
            }
        } catch (err) {
            console.error("Erreur lors du traitement du drop:", err);
        }
        setDropPosition(null);
    };

    /**
     * Initialise Leaflet et les outils de dessin (draw control).
     * Ne s’exécute qu’une fois.
     */
    const initializeMap = () => {
        if (mapRef.current && window.L && !mapInstanceRef.current) {
            mapInstanceRef.current = window.L.map(mapRef.current, {maxZoom: MAX_ZOOM, minZoom: 3, zoomControl: true})
                .setView(INITIAL_CENTER, INITIAL_ZOOM);

            // Ajout des fonds de carte
            const osmLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors', maxZoom: MAX_ZOOM
            });
            const satelliteLayer = window.L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg', {
                minZoom: 0, maxZoom: MAX_ZOOM,
                attribution: '&copy; Stadia Maps &copy; OpenMapTiles &copy; OpenStreetMap contributors'
            });
            osmLayer.addTo(mapInstanceRef.current);
            baseMapsRef.current = {"Vue Classique (OSM)": osmLayer, "Vue Satellite": satelliteLayer};
            window.L.control.layers(baseMapsRef.current, {}, {position: 'topright'}).addTo(mapInstanceRef.current);

            drawnItemsRef.current = new window.L.FeatureGroup();
            mapInstanceRef.current.addLayer(drawnItemsRef.current);

            // Localisation des outils de dessin en français
            if (window.L.drawLocal) {
                window.L.drawLocal.draw.toolbar.buttons.polygon = 'Dessiner une zone';
                window.L.drawLocal.draw.toolbar.buttons.rectangle = 'Dessiner un rectangle';
                window.L.drawLocal.draw.toolbar.buttons.circle = 'Dessiner un cercle';
                // ... autres labels si besoin ...
            }

            // Outils de dessin uniquement pour les clients
            if (user?.role === 'client') {
                initializeDrawControl();
            }

            // Gère le clic sur la carte (pour placer un employé)
            mapInstanceRef.current.on('click', (e) => {
                if (onMapClick) {
                    onMapClick(e.latlng);
                }
            });

            // Ajoute les marqueurs d'employés
            addEmployeeMarkers();

            // Charger les zones du client après l'initialisation de la carte
            if (user?.role === 'client' && !zoneLoaded) {
                loadClientZones();
            }
        }
    };

    /**
     * Dessine une zone existante sur la carte à partir de ses coordonnées.
     */
    const drawExistingZone = (zoneData) => {
        if (!mapInstanceRef.current || !drawnItemsRef.current) return;
        if (!zoneData.securedZone || !zoneData.securedZone.coordinates) {
            console.error("Format de zone invalide:", zoneData);
            return;
        }

        // Stocker les informations de la zone courante pour l'affectation des agents
        setCurrentZoneInfo({
            serviceOrderId: zoneData.serviceOrderId,
            securedZoneId: zoneData.securedZone.securedZoneId || "unknown",
            zoneName: zoneData.securedZone.name
        });

        const coordinates = zoneData.securedZone.coordinates;
        let layer;
        let zoneType = 'Polygone';

        if (coordinates.length === 4) {
            // Rectangle
            zoneType = 'Rectangle';
            const bounds = window.L.latLngBounds(coordinates.map(coord => [coord[0], coord[1]]));
            layer = window.L.rectangle(bounds, {color: '#3388ff', fillOpacity: 0.2});
        } else if (coordinates.length >= 30) {
            // Cercle
            zoneType = 'Cercle';
            const center = coordinates.reduce((acc, point) => {
                acc.lat += point[0] / coordinates.length;
                acc.lng += point[1] / coordinates.length;
                return acc;
            }, {lat: 0, lng: 0});
            const firstPoint = coordinates[0];
            const radius = window.L.latLng(center.lat, center.lng)
                .distanceTo(window.L.latLng(firstPoint[0], firstPoint[1]));
            layer = window.L.circle([center.lat, center.lng], {radius, color: '#3388ff', fillOpacity: 0.2});
        } else {
            // Polygone
            layer = window.L.polygon(coordinates.map(coord => [coord[0], coord[1]]), {
                color: '#3388ff',
                fillOpacity: 0.2
            });
        }

        drawnItemsRef.current.addLayer(layer);
        setDrawnZones([{
            id: zoneData.userId || Date.now(),
            name: zoneData.securedZone.name,
            description: zoneData.description || '',
            layer: layer,
            type: zoneType,
            coordinates: coordinates,
            serviceOrderId: zoneData.serviceOrderId,
            securedZoneId: zoneData.securedZone.securedZoneId
        }]);

        layer.bindPopup(
            `<b>${zoneData.securedZone.name}</b><br>
      ${zoneData.description || ''}<br>
      <small class="text-gray-500">Zone ID: ${zoneData.securedZone.securedZoneId}</small><br>
      <small class="text-gray-500">Service ID: ${zoneData.serviceOrderId}</small>`
        );

        setZoneFormData({
            name: zoneData.securedZone.name,
            description: zoneData.description || '',
            clientId: user.userId,
            coordinates: coordinates,
            type: zoneType
        });
        setCurrentLayer(layer);

        // Centrer la carte sur la zone
        if (zoneType === 'Cercle') {
            const center = coordinates.reduce((acc, point) => {
                acc.lat += point[0] / coordinates.length;
                acc.lng += point[1] / coordinates.length;
                return acc;
            }, {lat: 0, lng: 0});
            mapInstanceRef.current.setView([center.lat, center.lng], 15);
        } else {
            const bounds = window.L.latLngBounds(coordinates.map(coord => [coord[0], coord[1]]));
            mapInstanceRef.current.fitBounds(bounds, {maxZoom: 18});
        }
    };

    /**
     * Charge les zones du client depuis l'API (1ère zone seulement).
     */
    const loadClientZones = async () => {
        if (!user?.encryptedId) return;

        try {
            setZoneLoaded(true); // Marquer comme chargé pour éviter les appels multiples
            const result = await getZone(user.encryptedId);

            if (result.success && result.data && Array.isArray(result.data)) {
                // Récupérer la première zone (pour l'instant on ne gère qu'une seule zone)
                if (result.data.length > 0) {
                    console.log("Zone trouvée:", result.data[0]);
                    drawExistingZone(result.data[0]);
                }
            }
        } catch (error) {
            console.error("Erreur lors du chargement des zones:", error);
        }
    };

    // Charge les zones du client lors du montage ou changement de rôle/utilisateur
    useEffect(() => {
        if (mapInstanceRef.current && user?.role === 'client' && !zoneLoaded) {
            loadClientZones();
        }
    }, [mapInstanceRef.current, user?.userId, user?.role, zoneLoaded]);

    /**
     * Initialise les outils de dessin (Leaflet Draw).
     * - Permet de créer, éditer, supprimer UNE zone à la fois (client uniquement)
     */
    const initializeDrawControl = () => {
        if (!window.L.drawLocal) {
            console.warn("Leaflet Draw not loaded yet");
            return;
        }
        if (drawControlRef.current) {
            mapInstanceRef.current.removeControl(drawControlRef.current);
            drawControlRef.current = null;
        }
        const hasZone = drawnZones.length > 0;
        const drawOptions = {
            position: 'topright',
            draw: hasZone ? {
                polygon: false,
                rectangle: false,
                circle: false,
                marker: false,
                polyline: false,
                circlemarker: false
            } : {
                polyline: false,
                circle: {shapeOptions: {color: '#3388ff', fillOpacity: 0.2}},
                rectangle: {shapeOptions: {color: '#3388ff', fillOpacity: 0.2}},
                polygon: {allowIntersection: false, showArea: true, shapeOptions: {color: '#3388ff', fillOpacity: 0.2}},
                marker: false,
                circlemarker: false,
            },
            edit: {
                featureGroup: drawnItemsRef.current,
                edit: hasZone,
                remove: hasZone
            }
        };
        drawControlRef.current = new window.L.Control.Draw(drawOptions);
        mapInstanceRef.current.addControl(drawControlRef.current);

        // Événement création de zone
        mapInstanceRef.current.on(window.L.Draw.Event.CREATED, (e) => {
            if (drawnZones.length > 0) return;
            const layer = e.layer;
            drawnItemsRef.current.addLayer(layer);
            setCurrentLayer(layer);

            let coordinates = [];
            let layerType = e.layerType;
            if (layerType === 'circle') {
                // Approximation du cercle par 32 points
                const center = layer.getLatLng();
                const radius = layer.getRadius();
                const points = 32;
                for (let i = 0; i < points; i++) {
                    const angle = (i / points) * (2 * Math.PI);
                    const lat = center.lat + (radius / 111111) * Math.cos(angle);
                    const lng = center.lng + (radius / (111111 * Math.cos(center.lat * (Math.PI / 180)))) * Math.sin(angle);
                    coordinates.push([lat, lng]);
                }
            } else if (layerType === 'rectangle') {
                const bounds = layer.getBounds();
                coordinates = [
                    [bounds.getNorthWest().lat, bounds.getNorthWest().lng],
                    [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
                    [bounds.getSouthEast().lat, bounds.getSouthEast().lng],
                    [bounds.getSouthWest().lat, bounds.getSouthWest().lng]
                ];
            } else {
                const latLngs = layer.getLatLngs()[0];
                coordinates = latLngs.map(point => [point.lat, point.lng]);
            }
            setZoneFormData({
                name: 'Zone 1',
                description: '',
                clientId: user.userId,
                coordinates: coordinates,
                type: layerType === 'circle' ? 'Cercle' : layerType === 'rectangle' ? 'Rectangle' : 'Polygone'
            });
            setShowZoneForm(true);
        });

        // Événement édition de zone
        mapInstanceRef.current.on(window.L.Draw.Event.EDITED, (e) => {
            const layers = e.layers;
            layers.eachLayer((layer) => {
                let coordinates = [];
                const zone = drawnZones[0];
                if (!zone) return;
                if (zone.type === 'Cercle') {
                    // Recalcule les points du cercle
                    const center = layer.getLatLng();
                    const radius = layer.getRadius();
                    const points = 32;
                    for (let i = 0; i < points; i++) {
                        const angle = (i / points) * (2 * Math.PI);
                        const lat = center.lat + (radius / 111111) * Math.cos(angle);
                        const lng = center.lng + (radius / (111111 * Math.cos(center.lat * (Math.PI / 180)))) * Math.sin(angle);
                        coordinates.push([lat, lng]);
                    }
                } else if (zone.type === 'Rectangle') {
                    const bounds = layer.getBounds();
                    coordinates = [
                        [bounds.getNorthWest().lat, bounds.getNorthWest().lng],
                        [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
                        [bounds.getSouthEast().lat, bounds.getSouthEast().lng],
                        [bounds.getSouthWest().lat, bounds.getSouthWest().lng]
                    ];
                } else {
                    const latLngs = layer.getLatLngs()[0];
                    coordinates = latLngs.map(point => [point.lat, point.lng]);
                }
                setZoneFormData(prev => ({...prev, coordinates: coordinates}));
                setDrawnZones([{...zone, coordinates: coordinates}]);
            });
        });

        // Événement suppression de zone
        mapInstanceRef.current.on(window.L.Draw.Event.DELETED, () => {
            setDrawnZones([]);
            setZoneFormData({name: '', description: '', clientId: '', coordinates: [], type: ''});
        });
    };

    // Réinitialise les outils de dessin à chaque modification de zone ou de rôle
    useEffect(() => {
        if (mapInstanceRef.current && user?.role === "client") initializeDrawControl();
    }, [drawnZones.length, user?.role]);

    /**
     * Sauvegarde la zone (API)
     */
    const saveZone = async () => {
        if (!zoneFormData.name) return;
        const zoneData = {
            description: zoneFormData.description,
            clientId: zoneFormData.clientId,
            securedZone: {
                name: zoneFormData.name,
                coordinates: zoneFormData.coordinates
            }
        };
        await sendZone(zoneData);
        setDrawnZones([{
            id: Date.now(),
            name: zoneFormData.name,
            description: zoneFormData.description,
            layer: currentLayer,
            type: zoneFormData.type,
            coordinates: zoneFormData.coordinates
        }]);
        setShowZoneForm(false);
        if (currentLayer) {
            currentLayer.bindPopup(`<b>${zoneFormData.name}</b><br>${zoneFormData.description || ''}`);
        }
    };

    /**
     * Annule la création de la zone.
     */
    const cancelZoneCreation = () => {
        if (currentLayer) {
            drawnItemsRef.current.removeLayer(currentLayer);
        }
        setShowZoneForm(false);
        setZoneFormData({name: '', description: '', clientId: '', coordinates: [], type: ''});
    };

    /**
     * Supprime une zone existante.
     */
    const deleteZone = (zoneId) => {
        const zoneToDelete = drawnZones.find(zone => zone.id === zoneId);
        if (zoneToDelete && zoneToDelete.layer) {
            drawnItemsRef.current.removeLayer(zoneToDelete.layer);
            setDrawnZones([]);
        }
    };

    /**
     * Ajoute les marqueurs pour chaque employé assigné sur la carte.
     */
    const addEmployeeMarkers = () => {
        if (!window.L || !mapInstanceRef.current) return;
        markersRef.current.forEach(marker => {
            if (marker && mapInstanceRef.current.hasLayer(marker)) {
                mapInstanceRef.current.removeLayer(marker);
            }
        });
        markersRef.current = [];
        employees.forEach(employee => {
            if (!employee.position) return;
            const customIcon = window.L.divIcon({
                html: `<div style="
          background-color: ${employee.routeColor || '#888'};
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: bold; font-size: 12px; border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">${employee.avatar || ''}</div>`,
                className: '', iconSize: [32, 32], iconAnchor: [16, 16]
            });
            const marker = window.L.marker([employee.position.lat, employee.position.lng], {icon: customIcon})
                .addTo(mapInstanceRef.current);
            marker.bindPopup(`
        <div style="text-align: center; padding: 8px;">
          <strong>${employee.name}</strong><br>
          <small>${employee.role}</small><br>
          <span style="
            background: ${getStatusColorHex(employee.status)};
            color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;
          ">${employee.status}</span>
        </div>
      `);
            marker.on('click', () => {
                handleEmployeeClick(employee);
            });
            markersRef.current.push(marker);
        });
    };

    // Met à jour les marqueurs à chaque changement d'employés
    useEffect(() => {
        if (mapInstanceRef.current) {
            addEmployeeMarkers();
        }
    }, [employees]);

    // Charge les librairies Leaflet et Draw dynamiquement au montage
    useEffect(() => {
        if (mapInstanceRef.current) return;
        if (!document.querySelector('link[href*="leaflet.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
            document.head.appendChild(link);
        }
        if (!document.querySelector('link[href*="leaflet.draw.css"]')) {
            const drawLink = document.createElement('link');
            drawLink.rel = 'stylesheet';
            drawLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css';
            document.head.appendChild(drawLink);
        }
        const loadLeaflet = () => new Promise((resolve) => {
            if (window.L) {
                resolve();
            } else {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
                script.onload = resolve;
                document.head.appendChild(script);
            }
        });
        const loadLeafletDraw = () => new Promise((resolve) => {
            if (window.L && window.L.Draw) {
                resolve();
            } else {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js';
                script.onload = resolve;
                document.head.appendChild(script);
            }
        });
        loadLeaflet().then(loadLeafletDraw).then(() => {
            setTimeout(initializeMap, 100);
        });
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Invalide la taille de la carte si la sidebar change
    useEffect(() => {
        if (mapInstanceRef.current) {
            setTimeout(() => {
                mapInstanceRef.current.invalidateSize();
            }, 300);
        }
    }, [sidebarVisible]);

    // Centre la carte si un employé est sélectionné
    useEffect(() => {
        if (selectedEmployee && mapInstanceRef.current && selectedEmployee.position) {
            mapInstanceRef.current.setView(
                [selectedEmployee.position.lat, selectedEmployee.position.lng],
                Math.min(16, MAX_ZOOM)
            );
        }
    }, [selectedEmployee]);

    /**
     * Centre la carte sur la zone sélectionnée (depuis le panneau).
     */
    const handleZoneClick = (zone) => {
        if (zone.type === 'Cercle') {
            const center = zone.coordinates.reduce((acc, point) => {
                acc.lat += point[0] / zone.coordinates.length;
                acc.lng += point[1] / zone.coordinates.length;
                return acc;
            }, {lat: 0, lng: 0});
            mapInstanceRef.current.setView([center.lat, center.lng], Math.min(16, MAX_ZOOM));
        } else {
            const bounds = window.L.latLngBounds(zone.coordinates.map(coord => [coord[0], coord[1]]));
            mapInstanceRef.current.fitBounds(bounds, {maxZoom: 18});
        }
    };

    // --- RENDU ---
    return (
        <div
            className={`relative w-full h-full ${isDragOver ? 'bg-blue-50' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div ref={mapRef} className="w-full h-full"></div>

            {/* Indicateur visuel de la position de dépôt */}
            {isDragOver && dropPosition && (
                <div className="absolute z-[1000] pointer-events-none"
                     style={{left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}>
                    <div className="bg-white p-3 rounded-lg shadow-lg text-center">
                        <div
                            className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-white font-bold mb-2"
                            style={{backgroundColor: draggingEmployee?.routeColor || '#4B5563'}}
                        >
                            {draggingEmployee?.avatar || '?'}
                        </div>
                        <p className="text-sm font-medium">Déposer ici</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {dropPosition?.lat.toFixed(6)}, {dropPosition?.lng.toFixed(6)}
                        </p>
                        {currentZoneInfo && (
                            <p className="text-xs text-blue-600 mt-1">
                                Zone: {currentZoneInfo.zoneName}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Coordonnées en bas à droite lors d'un drag */}
            {isDragOver && dropPosition && (
                <div
                    className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-md shadow-md z-50 text-xs text-gray-700">
                    <div className="font-medium">Affectation d'agent</div>
                    <div>Lat: {dropPosition.lat.toFixed(6)}, Lng: {dropPosition.lng.toFixed(6)}</div>
                    <div className="mt-1 text-gray-500">
                        Agent: {draggingEmployee?.name || 'Non assigné'} (ID: {draggingEmployee?.id})
                    </div>
                    {currentZoneInfo && (
                        <>
                            <div className="mt-1 text-blue-600">
                                Service ID: {currentZoneInfo.serviceOrderId}
                            </div>
                            <div className="text-blue-600">
                                Zone ID: {currentZoneInfo.securedZoneId}
                            </div>
                        </>
                    )}
                    <div className="mt-1 text-gray-400 text-[10px]">Tonnyjoh - 2025-07-28 17:09:58</div>
                </div>
            )}

            {/* Panneau des zones */}
            {drawnZones.length > 0 && (
                <ZonePanelToggle show={showZonePanel} onClick={() => setShowZonePanel(!showZonePanel)}/>
            )}
            {drawnZones.length > 0 && showZonePanel && (
                <ZonePanel
                    drawnZones={drawnZones}
                    onZoneClick={handleZoneClick}
                    onZoneDelete={deleteZone}
                />
            )}

            {/* Formulaire création/édition de zone (client uniquement) */}
            {showZoneForm && user?.role === "client" && (
                <ZoneForm
                    zoneFormData={zoneFormData}
                    onChange={setZoneFormData}
                    onCancel={cancelZoneCreation}
                    onSave={saveZone}
                    isLoading={isLoading}
                    error={error}
                    success={success}
                />
            )}
        </div>
    );
};

export default MapView;