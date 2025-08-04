import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from "../../../../../context/AuthContext.jsx";
import ZonePanel from './ZonePanel';
import ZonePanelToggle from './ZonePanelToggle';
import ZoneForm from './ZoneForm';
import { useZone } from "../../../../../hooks/useZone.js";

/**
 * Composant principal de la carte.
 * - Affiche les employés sur la carte (Leaflet)
 * - Permet de créer/éditer/supprimer des zones (clients uniquement)
 * - Permet de placer des employés sur la carte via drag & drop (agents non assignés)
 * - Gère l'affichage du panneau des zones et du formulaire de zone
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
                     zoneData,
                     zoneAssignedAgents = [],
                 }) => {
    // Références et états pour la carte
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const zoneAgentMarkersRef = useRef([]);
    const drawControlRef = useRef(null);
    const drawnItemsRef = useRef(null);
    const baseMapsRef = useRef({});
    const [mapIsReady, setMapIsReady] = useState(false);

    // États pour les zones
    const [drawnZones, setDrawnZones] = useState([]);
    const [showZonePanel, setShowZonePanel] = useState(true);
    const [showZoneForm, setShowZoneForm] = useState(false);
    const [currentLayer, setCurrentLayer] = useState(null);
    const [currentZoneInfo, setCurrentZoneInfo] = useState(null);

    // États pour le drag & drop
    const [isDragOver, setIsDragOver] = useState(false);
    const [dropPosition, setDropPosition] = useState(null);

    // Authentification et hooks API
    const { user } = useAuth();
    const { sendZone, isLoading, error, success } = useZone();

    // État pour le formulaire de zone
    const [zoneFormData, setZoneFormData] = useState({
        name: '',
        description: '',
        clientId: user?.userId,
        coordinates: [],
        type: 'Polygone',
    });

    // Configuration de la carte
    const MAX_ZOOM = 19;
    const INITIAL_ZOOM = 13;
    const INITIAL_CENTER = [-18.9146, 47.5309]; // Antananarivo

    /**
     * Renvoie une couleur hexadécimale en fonction du statut de l'employé.
     */
    const getStatusColorHex = (status) => {
        const statusMap = {
            'inactif': '#ef4444',
            'occupé': '#ef4444',
            'actif': '#3b82f6',
            'en mission': '#3b82f6',
            'disponible': '#22c55e',
            'pending': '#eab308'
        };

        return statusMap[status?.toLowerCase()] || '#eab308';
    };

    /**
     * Affiche les agents assignés à la zone directement sur la carte
     */
    const addZoneAgentsToMap = () => {
        if (!mapInstanceRef.current) return;

        // Nettoyer les marqueurs existants
        zoneAgentMarkersRef.current.forEach(marker => {
            if (mapInstanceRef.current.hasLayer(marker)) {
                mapInstanceRef.current.removeLayer(marker);
            }
        });
        zoneAgentMarkersRef.current = [];

        // Ajouter les nouveaux marqueurs pour chaque agent
        zoneAssignedAgents.forEach(agent => {
            try {
                if (!agent?.name) {
                    console.warn("Agent mal formé:", agent);
                    return;
                }

                if (!agent.position) {
                    console.warn(`Agent ${agent.name} n'a pas de position définie`);
                    return;
                }

                const position = [agent.position.lat, agent.position.lng];
                const agentColor = agent.routeColor ||
                    '#' + Math.floor(Math.random()*16777215).toString(16);

                // Créer l'icône personnalisée
                const customIcon = window.L.divIcon({
                    html: `<div style="
                        background-color: ${agentColor};
                        width: 32px; height: 32px; border-radius: 50%;
                        display: flex; align-items: center; justify-content: center;
                        color: white; font-weight: bold; font-size: 12px; 
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    ">${agent.avatar}</div>`,
                    className: '',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                });

                // Créer le marqueur et l'ajouter à la carte
                const marker = window.L.marker(position, {icon: customIcon})
                    .addTo(mapInstanceRef.current);

                // Ajouter une popup avec les informations de l'agent
                marker.bindPopup(`
                    <div style="text-align: center; padding: 8px;">
                        <strong>${agent.name}</strong><br>
                        <small>${agent.role || 'Agent assigné'}</small><br>
                        <span style="
                            background: ${getStatusColorHex(agent.status)};
                            color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;
                        ">${agent.status}</span>
                        ${agent.taskDescription ?
                    `<br><small class="text-gray-500">${agent.taskDescription}</small>` : ''}
                    </div>
                `);

                // Configurer l'événement de clic
                marker.on('click', () => {
                    if (handleEmployeeClick) {
                        handleEmployeeClick(agent);
                    }
                });

                // Stocker le marqueur pour le nettoyage ultérieur
                zoneAgentMarkersRef.current.push(marker);
            } catch (error) {
                console.error("Erreur lors de l'ajout de l'agent sur la carte:", error);
            }
        });
    };

    // Mettre à jour les marqueurs des agents assignés quand les données changent
    useEffect(() => {
        if (mapIsReady && zoneAssignedAgents.length > 0) {
            addZoneAgentsToMap();
        }
    }, [zoneAssignedAgents, mapIsReady]);

    /**
     * Gère le survol de la carte lors d'un drag d'employé
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
     * Réinitialise l'état du drag quand on quitte la carte
     */
    const handleDragLeave = () => {
        setIsDragOver(false);
        setDropPosition(null);
    };

    /**
     * Gère le dépôt d'un employé sur la carte
     */
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);

        if (!mapInstanceRef.current) return;

        // Récupérer les coordonnées où l'employé est déposé
        const rect = mapRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const point = mapInstanceRef.current.containerPointToLatLng([x, y]);
        const zoneInfo = currentZoneInfo || null;

        try {
            // Essayer de récupérer l'employé des données de transfert
            const data = e.dataTransfer.getData('application/json');
            if (data) {
                const employee = JSON.parse(data);
                if (onEmployeeDrop) {
                    onEmployeeDrop(employee, point, zoneInfo);
                }
            } else if (draggingEmployee && onEmployeeDrop) {
                onEmployeeDrop(draggingEmployee, point, zoneInfo);
            }
        } catch (err) {
            console.error("Erreur lors du traitement du drop:", err);
        }

        setDropPosition(null);
    };

    /**
     * Initialise Leaflet et les outils de dessin
     */
    const initializeMap = () => {
        if (mapRef.current && window.L && !mapInstanceRef.current) {
            // Créer l'instance de la carte
            mapInstanceRef.current = window.L.map(mapRef.current, {
                maxZoom: MAX_ZOOM,
                minZoom: 3,
                zoomControl: true
            }).setView(INITIAL_CENTER, INITIAL_ZOOM);

            // Ajouter les fonds de carte
            const osmLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: MAX_ZOOM
            });

            const satelliteLayer = window.L.tileLayer(
                'https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg',
                {
                    minZoom: 0,
                    maxZoom: MAX_ZOOM,
                    attribution: '&copy; Stadia Maps &copy; OpenMapTiles &copy; OpenStreetMap contributors'
                }
            );

            osmLayer.addTo(mapInstanceRef.current);
            baseMapsRef.current = {
                "Vue Classique (OSM)": osmLayer,
                "Vue Satellite": satelliteLayer
            };

            window.L.control.layers(baseMapsRef.current, {}, {position: 'topright'})
                .addTo(mapInstanceRef.current);

            // Initialiser le groupe de dessin
            drawnItemsRef.current = new window.L.FeatureGroup();
            mapInstanceRef.current.addLayer(drawnItemsRef.current);

            // Localisation des outils de dessin en français
            if (window.L.drawLocal) {
                window.L.drawLocal.draw.toolbar.buttons.polygon = 'Dessiner une zone';
                window.L.drawLocal.draw.toolbar.buttons.rectangle = 'Dessiner un rectangle';
                window.L.drawLocal.draw.toolbar.buttons.circle = 'Dessiner un cercle';
            }

            // Outils de dessin uniquement pour les clients
            if (user?.role === 'client') {
                initializeDrawControl();
            }

            // Gestion du clic sur la carte
            mapInstanceRef.current.on('click', (e) => {
                if (onMapClick) {
                    onMapClick(e.latlng, currentZoneInfo);
                }
            });

            // Ajouter les marqueurs d'employés
            addEmployeeMarkers();

            // Marquer la carte comme prête
            setMapIsReady(true);

            // Dessiner la zone si les données sont disponibles
            if (zoneData && drawnZones.length === 0) {
                drawExistingZone(zoneData);
            }

            // Ajouter les agents assignés sur la carte
            if (zoneAssignedAgents.length > 0) {
                addZoneAgentsToMap();
            }
        }
    };

    /**
     * Dessine une zone existante sur la carte à partir de ses coordonnées
     */
    const drawExistingZone = (zoneData) => {
        if (!mapInstanceRef.current || !drawnItemsRef.current) {
            console.warn("Map ou groupe de dessins non initialisés");
            return;
        }

        if (!zoneData.securedZone?.coordinates) {
            console.error("Format de zone invalide:", zoneData);
            return;
        }

        try {
            // Stocker les informations de la zone courante
            setCurrentZoneInfo({
                serviceOrderId: zoneData.serviceOrder?.id,
                securedZoneId: zoneData.securedZone.securedZoneId || "unknown",
                zoneName: zoneData.securedZone.name
            });

            const coordinates = zoneData.securedZone.coordinates;

            // Tracer un polygone avec les coordonnées
            const layer = window.L.polygon(
                coordinates.map(coord => [coord[0], coord[1]]),
                {
                    color: '#3388ff',
                    fillOpacity: 0.2
                }
            );

            drawnItemsRef.current.addLayer(layer);

            // Mettre à jour l'état des zones dessinées
            setDrawnZones([{
                id: zoneData.userId || Date.now(),
                name: zoneData.securedZone.name,
                description: zoneData.description || '',
                layer: layer,
                type: 'Polygone',
                coordinates: coordinates,
                serviceOrderId: zoneData.serviceOrder?.id,
                securedZoneId: zoneData.securedZone.securedZoneId
            }]);

            // Ajouter une popup à la zone
            layer.bindPopup(
                `<b>${zoneData.securedZone.name}</b><br>
                ${zoneData.description || ''}<br>
                <small class="text-gray-500">Zone ID: ${zoneData.securedZone.securedZoneId}</small><br>
                <small class="text-gray-500">Service ID: ${zoneData.serviceOrder?.id}</small>`
            );

            // Mettre à jour le formulaire avec les données de la zone
            setZoneFormData({
                name: zoneData.securedZone.name,
                description: zoneData.description || '',
                clientId: user.userId,
                coordinates: coordinates,
                type: 'Polygone'
            });
            setCurrentLayer(layer);

            // Centrer la carte sur la zone
            const bounds = window.L.latLngBounds(coordinates.map(coord => [coord[0], coord[1]]));
            mapInstanceRef.current.fitBounds(bounds, {maxZoom: 18});
        } catch (error) {
            console.error("Erreur lors du tracé de la zone:", error);
        }
    };

    // Dessiner la zone avec les données reçues quand la carte est prête
    useEffect(() => {
        if (zoneData && mapIsReady && drawnZones.length === 0) {
            drawExistingZone(zoneData);
        }
    }, [zoneData, mapIsReady]);

    /**
     * Initialise les outils de dessin Leaflet Draw
     */
    const initializeDrawControl = () => {
        if (!window.L.drawLocal) {
            console.warn("Leaflet Draw not loaded yet");
            return;
        }

        // Supprimer le contrôle existant s'il y en a un
        if (drawControlRef.current) {
            mapInstanceRef.current.removeControl(drawControlRef.current);
            drawControlRef.current = null;
        }

        const hasZone = drawnZones.length > 0;

        // Options pour les outils de dessin
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
                circle: false,
                rectangle: false,
                polygon: {
                    allowIntersection: false,
                    showArea: true,
                    shapeOptions: {color: '#3388ff', fillOpacity: 0.2}
                },
                marker: false,
                circlemarker: false,
            },
            edit: {
                featureGroup: drawnItemsRef.current,
                edit: hasZone,
                remove: hasZone
            }
        };

        // Créer et ajouter le contrôle de dessin
        drawControlRef.current = new window.L.Control.Draw(drawOptions);
        mapInstanceRef.current.addControl(drawControlRef.current);

        // Gestion de l'événement de création de zone
        mapInstanceRef.current.on(window.L.Draw.Event.CREATED, (e) => {
            if (drawnZones.length > 0) return;

            const layer = e.layer;
            drawnItemsRef.current.addLayer(layer);
            setCurrentLayer(layer);

            // Extraire les coordonnées du polygone
            const latLngs = layer.getLatLngs()[0];
            const coordinates = latLngs.map(point => [point.lat, point.lng]);

            // Mettre à jour le formulaire
            setZoneFormData({
                name: 'Zone 1',
                description: '',
                clientId: user.userId,
                coordinates: coordinates,
                type: 'Polygone'
            });
            setShowZoneForm(true);
        });

        // Gestion de l'événement d'édition de zone
        mapInstanceRef.current.on(window.L.Draw.Event.EDITED, (e) => {
            const layers = e.layers;
            layers.eachLayer((layer) => {
                const zone = drawnZones[0];
                if (!zone) return;

                // Mettre à jour les coordonnées après édition
                const latLngs = layer.getLatLngs()[0];
                const coordinates = latLngs.map(point => [point.lat, point.lng]);

                setZoneFormData(prev => ({...prev, coordinates: coordinates}));
                setDrawnZones([{...zone, coordinates: coordinates}]);
            });
        });

        // Gestion de l'événement de suppression de zone
        mapInstanceRef.current.on(window.L.Draw.Event.DELETED, () => {
            setDrawnZones([]);
            setZoneFormData({
                name: '',
                description: '',
                clientId: '',
                coordinates: [],
                type: 'Polygone'
            });
        });
    };

    // Réinitialiser les outils de dessin quand nécessaire
    useEffect(() => {
        if (mapInstanceRef.current && user?.role === "client") {
            initializeDrawControl();
        }
    }, [drawnZones.length, user?.role]);

    /**
     * Sauvegarde la zone via l'API
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
            type: 'Polygone',
            coordinates: zoneFormData.coordinates
        }]);

        setShowZoneForm(false);

        if (currentLayer) {
            currentLayer.bindPopup(
                `<b>${zoneFormData.name}</b><br>${zoneFormData.description || ''}`
            );
        }
    };

    /**
     * Annule la création de la zone
     */
    const cancelZoneCreation = () => {
        if (currentLayer) {
            drawnItemsRef.current.removeLayer(currentLayer);
        }
        setShowZoneForm(false);
        setZoneFormData({
            name: '',
            description: '',
            clientId: '',
            coordinates: [],
            type: 'Polygone'
        });
    };

    /**
     * Supprime une zone existante
     */
    const deleteZone = (zoneId) => {
        const zoneToDelete = drawnZones.find(zone => zone.id === zoneId);
        if (zoneToDelete?.layer) {
            drawnItemsRef.current.removeLayer(zoneToDelete.layer);
            setDrawnZones([]);
        }
    };

    /**
     * Ajoute les marqueurs pour chaque employé assigné sur la carte
     */
    const addEmployeeMarkers = () => {
        if (!window.L || !mapInstanceRef.current) return;

        // Nettoyer les marqueurs existants
        markersRef.current.forEach(marker => {
            if (marker && mapInstanceRef.current.hasLayer(marker)) {
                mapInstanceRef.current.removeLayer(marker);
            }
        });
        markersRef.current = [];

        // Ajouter les nouveaux marqueurs
        employees.forEach(employee => {
            if (!employee.position) return;

            // Créer une icône personnalisée
            const customIcon = window.L.divIcon({
                html: `<div style="
                    background-color: ${employee.routeColor || '#888'};
                    width: 32px; height: 32px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    color: white; font-weight: bold; font-size: 12px; 
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">${employee.avatar || ''}</div>`,
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            // Créer et ajouter le marqueur
            const marker = window.L.marker(
                [employee.position.lat, employee.position.lng],
                {icon: customIcon}
            ).addTo(mapInstanceRef.current);

            // Ajouter une popup
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

            // Configurer l'événement de clic
            marker.on('click', () => {
                handleEmployeeClick(employee);
            });

            markersRef.current.push(marker);
        });
    };

    // Mettre à jour les marqueurs quand les employés changent
    useEffect(() => {
        if (mapInstanceRef.current) {
            addEmployeeMarkers();
        }
    }, [employees]);

    // Charger dynamiquement Leaflet et ses dépendances
    useEffect(() => {
        if (mapInstanceRef.current) return;

        // Ajouter les feuilles de style si nécessaire
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

        // Charger les scripts de Leaflet
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

        // Chargement séquentiel des bibliothèques
        loadLeaflet()
            .then(loadLeafletDraw)
            .then(() => {
                setTimeout(initializeMap, 100);
            });

        // Nettoyage à la désinscription du composant
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Mettre à jour la taille de la carte quand la sidebar change
    useEffect(() => {
        if (mapInstanceRef.current) {
            setTimeout(() => {
                mapInstanceRef.current.invalidateSize();
            }, 300);
        }
    }, [sidebarVisible]);

    // Centrer la carte sur l'employé sélectionné
    useEffect(() => {
        if (selectedEmployee?.position && mapInstanceRef.current) {
            mapInstanceRef.current.setView(
                [selectedEmployee.position.lat, selectedEmployee.position.lng],
                Math.min(16, MAX_ZOOM)
            );
        }
    }, [selectedEmployee]);

    /**
     * Centre la carte sur la zone sélectionnée
     */
    const handleZoneClick = (zone) => {
        if (!mapInstanceRef.current) return;
        const bounds = window.L.latLngBounds(
            zone.coordinates.map(coord => [coord[0], coord[1]])
        );
        mapInstanceRef.current.fitBounds(bounds, {maxZoom: 18});
    };

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
                <div
                    className="absolute z-[1000] pointer-events-none"
                    style={{left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}
                >
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
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-md shadow-md z-50 text-xs text-gray-700">
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
                </div>
            )}

            {/* Panneau des zones */}
            {drawnZones.length > 0 && (
                <ZonePanelToggle
                    show={showZonePanel}
                    onClick={() => setShowZonePanel(!showZonePanel)}
                />
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

            {/* Attribution */}
            <div className="absolute bottom-1 right-1 text-xs text-gray-500 bg-white/50 px-1 rounded z-[400]">
                Tonnyjoh - 2025-08-01 18:31:33
            </div>
        </div>
    );
};

export default MapView;