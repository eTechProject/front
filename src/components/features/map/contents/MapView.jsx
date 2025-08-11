import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from "@/context/AuthContext.jsx";
import { useZone } from "@/hooks/features/zone/useZone.js";
import ZoneForm from "@/components/features/map/ui/ZoneForm.jsx";
import ZonePanel from "@/components/features/map/ui/ZonePanel.jsx";
import ZonePanelToggle from "@/components/features/map/ui/ZonePanelToggle.jsx";
import {isPointInPolygon} from "@/utils/geoUtils.js";

/**
 * Composant principal de la carte.
 * - Affiche les employés sur la carte (Leaflet)
 * - Permet de créer/éditer/supprimer des zones (clients uniquement)
 * - Permet de placer des employés sur la carte via drag & drop (clients uniquement)
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
                     userRole,
                 }) => {
    // Références
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const zoneAgentMarkersRef = useRef([]);
    const drawControlRef = useRef(null);
    const drawnItemsRef = useRef(null);
    const baseMapsRef = useRef({});

    // États
    const [mapIsReady, setMapIsReady] = useState(false);
    const [drawnZones, setDrawnZones] = useState([]);
    const [showZonePanel, setShowZonePanel] = useState(true);
    const [showZoneForm, setShowZoneForm] = useState(false);
    const [currentLayer, setCurrentLayer] = useState(null);
    const [currentZoneInfo, setCurrentZoneInfo] = useState(null);
    const [isZoneLocked, setIsZoneLocked] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dropPosition, setDropPosition] = useState(null);
    const [isValidDropLocation, setIsValidDropLocation] = useState(true);
    // État pour les agents temporaires
    const [tempAssignedAgents, setTempAssignedAgents] = useState([]);

    const { user } = useAuth();
    const { sendZone, isLoading, error, success } = useZone();

    // Configuration
    const MAX_ZOOM = 19;
    const INITIAL_ZOOM = 13;
    const INITIAL_CENTER = [-18.9146, 47.5309]; // Antananarivo

    // État pour le formulaire de zone
    const [zoneFormData, setZoneFormData] = useState({
        name: '',
        description: '',
        clientId: user?.userId,
        coordinates: [],
        type: 'Polygone',
    });

    // Fonction pour obtenir tous les agents (officiels + temporaires)
    const getAllZoneAgents = () => {
        return [...zoneAssignedAgents, ...tempAssignedAgents];
    };

    // Helper function pour les couleurs de statut
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

    // Initialisation de la carte
    const initializeMap = () => {
        if (mapRef.current && window.L && !mapInstanceRef.current) {
            mapInstanceRef.current = window.L.map(mapRef.current, {
                maxZoom: MAX_ZOOM,
                minZoom: 3,
                zoomControl: true,
                bounceAtZoomLimits: false,
                worldCopyJump: false
            }).setView(INITIAL_CENTER, INITIAL_ZOOM);

            // Couches de base
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

            window.L.control.layers(baseMapsRef.current, {}, { position: 'topright' })
                .addTo(mapInstanceRef.current);

            drawnItemsRef.current = new window.L.FeatureGroup();
            mapInstanceRef.current.addLayer(drawnItemsRef.current);

            if (userRole === 'client') {
                initializeDrawControl();
            }

            mapInstanceRef.current.on('click', (e) => {
                if (userRole === 'client' && onMapClick) {
                    onMapClick(e.latlng, currentZoneInfo);
                }
            });

            addEmployeeMarkers();
            setMapIsReady(true);

            if (zoneData && drawnZones.length === 0) {
                drawExistingZone(zoneData);
            }

            if (zoneAssignedAgents.length > 0) {
                addZoneAgentsToMap();
            }
        }
    };

    // Initialisation des contrôles de dessin
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
                circle: false,
                rectangle: false,
                polygon: {
                    allowIntersection: false,
                    showArea: true,
                    shapeOptions: { color: '#3388ff', fillOpacity: 0.2 }
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

        drawControlRef.current = new window.L.Control.Draw(drawOptions);
        mapInstanceRef.current.addControl(drawControlRef.current);

        mapInstanceRef.current.on(window.L.Draw.Event.CREATED, (e) => {
            if (drawnZones.length > 0) return;
            const layer = e.layer;
            drawnItemsRef.current.addLayer(layer);
            setCurrentLayer(layer);

            const latLngs = layer.getLatLngs()[0];
            const coordinates = latLngs.map(point => [point.lat, point.lng]);

            setZoneFormData({
                name: 'Zone 1',
                description: '',
                clientId: user.userId,
                coordinates: coordinates,
                type: 'Polygone'
            });

            lockViewToZone(coordinates);
            setShowZoneForm(true);
        });

        mapInstanceRef.current.on(window.L.Draw.Event.EDITED, (e) => {
            const layers = e.layers;
            layers.eachLayer((layer) => {
                const zone = drawnZones[0];
                if (!zone) return;

                const latLngs = layer.getLatLngs()[0];
                const coordinates = latLngs.map(point => [point.lat, point.lng]);

                setZoneFormData(prev => ({ ...prev, coordinates: coordinates }));
                setDrawnZones([{ ...zone, coordinates: coordinates }]);
                lockViewToZone(coordinates);
            });
        });

        mapInstanceRef.current.on(window.L.Draw.Event.DELETED, () => {
            unlockView();
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

    // Verrouillage de la vue sur une zone
    const lockViewToZone = (coordinates) => {
        if (!mapInstanceRef.current || !coordinates || coordinates.length === 0) return;
        const bounds = window.L.latLngBounds(coordinates.map(coord => [coord[0], coord[1]]));
        mapInstanceRef.current.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 18,
        });
        mapInstanceRef.current.setMaxBounds(bounds.pad(0.5));
        mapInstanceRef.current.setMinZoom(mapInstanceRef.current.getZoom() - 2);
        setIsZoneLocked(true);
    };

    // Déverrouillage de la vue
    const unlockView = () => {
        if (!mapInstanceRef.current) return;
        mapInstanceRef.current.setMaxBounds(null);
        mapInstanceRef.current.setMinZoom(3);
        setIsZoneLocked(false);
    };

    // Dessin d'une zone existante
    const drawExistingZone = (zoneData) => {
        if (!mapInstanceRef.current || !drawnItemsRef.current) return;
        if (!zoneData.securedZone?.coordinates) {
            console.error("Format de zone invalide:", zoneData);
            return;
        }

        try {
            setCurrentZoneInfo({
                serviceOrderId: zoneData.serviceOrder?.id,
                securedZoneId: zoneData.securedZone.securedZoneId || "unknown",
                zoneName: zoneData.securedZone.name
            });

            const coordinates = zoneData.securedZone.coordinates;
            const layer = window.L.polygon(
                coordinates.map(coord => [coord[0], coord[1]]),
                { color: '#3388ff', fillOpacity: 0.2 }
            );

            drawnItemsRef.current.addLayer(layer);
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

            layer.bindPopup(`
                <b>${zoneData.securedZone.name}</b><br>
                ${zoneData.description || ''}<br>
                <small class="text-gray-500">Zone ID: ${zoneData.securedZone.securedZoneId}</small><br>
                <small class="text-gray-500">Service ID: ${zoneData.serviceOrder?.id}</small>
            `);

            setZoneFormData({
                name: zoneData.securedZone.name,
                description: zoneData.description || '',
                clientId: user.userId,
                coordinates: coordinates,
                type: 'Polygone'
            });

            setCurrentLayer(layer);
            lockViewToZone(coordinates);
        } catch (error) {
            console.error("Erreur lors du tracé de la zone:", error);
        }
    };

    // Ajout des agents de zone à la carte
    const addZoneAgentsToMap = () => {
        if (!mapInstanceRef.current) return;

        // Nettoyage des marqueurs existants
        zoneAgentMarkersRef.current.forEach(marker => {
            if (mapInstanceRef.current.hasLayer(marker)) {
                mapInstanceRef.current.removeLayer(marker);
            }
        });
        zoneAgentMarkersRef.current = [];

        // Utiliser tous les agents (officiels + temporaires)
        const allAgents = getAllZoneAgents();

        allAgents.forEach(agent => {
            try {
                if (!agent?.name || !agent.position) return;
                const position = [agent.position.lat, agent.position.lng];
                const agentColor = agent.routeColor || '#' + Math.floor(Math.random() * 16777215).toString(16);

                const customIcon = window.L.divIcon({
                    html: `<div style="
                        background-color: ${agentColor};
                        width: 32px; height: 32px; border-radius: 50%;
                        display: flex; align-items: center; justify-content: center;
                        color: white; font-weight: bold; font-size: 12px;
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        ${agent.isTemporary ? 'opacity: 0.8; border-color: #fbbf24;' : ''}
                    ">${agent.avatar}</div>`,
                    className: '',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                });

                const marker = window.L.marker(position, { icon: customIcon })
                    .addTo(mapInstanceRef.current);

                const statusLabel = agent.isTemporary ? 'En cours d\'assignation...' : agent.status;
                const statusColor = agent.isTemporary ? '#fbbf24' : getStatusColorHex(agent.status);

                marker.bindPopup(`
                    <div style="text-align: center; padding: 8px;">
                        <strong>${agent.name}</strong><br>
                        <small>${agent.role || 'Agent assigné'}</small><br>
                        <span style="
                            background: ${statusColor};
                            color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;
                        ">${statusLabel}</span>
                        ${agent.taskDescription ? `<br><small class="text-gray-500">${agent.taskDescription}</small>` : ''}
                        ${agent.isTemporary ? '<br><small class="text-orange-600">⏳ Assignation en cours</small>' : ''}
                    </div>
                `);

                marker.on('click', () => {
                    if (handleEmployeeClick) {
                        handleEmployeeClick(agent);
                    }
                });

                zoneAgentMarkersRef.current.push(marker);
            } catch (error) {
                console.error("Erreur lors de l'ajout de l'agent sur la carte:", error);
            }
        });
    };

    // Ajout des employés à la carte
    const addEmployeeMarkers = () => {
        if (!window.L || !mapInstanceRef.current) return;

        markersRef.current.forEach(marker => {
            if (mapInstanceRef.current.hasLayer(marker)) {
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
                    color: white; font-weight: bold; font-size: 12px;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">${employee.avatar || ''}</div>`,
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            const marker = window.L.marker(
                [employee.position.lat, employee.position.lng],
                { icon: customIcon }
            ).addTo(mapInstanceRef.current);

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

    // Gestion du drag & drop
    const handleDragOver = (e) => {
        if (userRole !== "client") return;
        e.preventDefault();

        if (!mapInstanceRef.current || !drawnZones.length) return;

        const rect = mapRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const point = mapInstanceRef.current.containerPointToLatLng([x, y]);

        const currentZone = drawnZones[0];
        const isInsideZone = isPointInPolygon(
            { lat: point.lat, lng: point.lng },
            currentZone.coordinates
        );

        setIsDragOver(isInsideZone);
        setIsValidDropLocation(isInsideZone);
        setDropPosition(isInsideZone ? point : null);
    };

    const handleDragLeave = () => {
        if (userRole !== "client") return;
        setIsDragOver(false);
        setDropPosition(null);
    };

    const handleDrop = async (e) => {
        if (userRole !== "client") return;
        e.preventDefault();
        setIsDragOver(false);

        if (!mapInstanceRef.current || !drawnZones.length) return;

        const rect = mapRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const point = mapInstanceRef.current.containerPointToLatLng([x, y]);

        const currentZone = drawnZones[0];
        const isInsideZone = isPointInPolygon(
            { lat: point.lat, lng: point.lng },
            currentZone.coordinates
        );

        if (!isInsideZone) {
            setDropPosition(null);
            setIsValidDropLocation(false);
            return;
        }

        const zoneInfo = currentZoneInfo || null;
        let employeeToAssign = null;

        try {
            const data = e.dataTransfer.getData('application/json');
            if (data) {
                employeeToAssign = JSON.parse(data);
            } else if (draggingEmployee) {
                employeeToAssign = draggingEmployee;
            }

            if (employeeToAssign) {
                // Créer un agent temporaire immédiatement visible
                const tempAgent = {
                    ...employeeToAssign,
                    position: { lat: point.lat, lng: point.lng },
                    isTemporary: true,
                    tempId: Date.now()
                };

                setTempAssignedAgents(prev => [...prev, tempAgent]);

                // Appeler la fonction d'assignation du parent
                if (onEmployeeDrop) {
                    try {
                        await onEmployeeDrop(employeeToAssign, point, zoneInfo);

                        // Retirer l'agent temporaire après succès
                        setTimeout(() => {
                            setTempAssignedAgents(prev =>
                                prev.filter(agent => agent.tempId !== tempAgent.tempId)
                            );
                        }, 1000);

                    } catch (error) {
                        // En cas d'erreur, retirer l'agent temporaire
                        setTempAssignedAgents(prev =>
                            prev.filter(agent => agent.tempId !== tempAgent.tempId)
                        );
                    }
                }
            }
        } catch (err) {
            console.error("Erreur lors du traitement du drop:", err);
        }

        setDropPosition(null);
        setIsValidDropLocation(true);
    };

    // Gestion du formulaire de zone
    const saveZone = async () => {
        if (!zoneFormData.name) return;
        const zoneDataToSend = {
            description: zoneFormData.description,
            clientId: zoneFormData.clientId,
            securedZone: {
                name: zoneFormData.name,
                coordinates: zoneFormData.coordinates
            }
        };

        await sendZone(zoneDataToSend);
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
        unlockView();
    };

    const deleteZone = (zoneId) => {
        const zoneToDelete = drawnZones.find(zone => zone.id === zoneId);
        if (zoneToDelete?.layer) {
            drawnItemsRef.current.removeLayer(zoneToDelete.layer);
            setDrawnZones([]);
            unlockView();
        }
    };

    const handleZoneClick = (zone) => {
        if (!mapInstanceRef.current) return;
        lockViewToZone(zone.coordinates);
    };

    // Effets
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

        loadLeaflet()
            .then(loadLeafletDraw)
            .then(() => {
                setTimeout(initializeMap, 100);
            });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (mapInstanceRef.current) {
            setTimeout(() => {
                mapInstanceRef.current.invalidateSize();
            }, 300);
        }
    }, [sidebarVisible]);

    useEffect(() => {
        if (selectedEmployee?.position && mapInstanceRef.current) {
            mapInstanceRef.current.setView(
                [selectedEmployee.position.lat, selectedEmployee.position.lng],
                Math.min(16, MAX_ZOOM)
            );
        }
    }, [selectedEmployee]);

    useEffect(() => {
        if (mapIsReady) {
            addZoneAgentsToMap();
        }
    }, [zoneAssignedAgents, tempAssignedAgents, mapIsReady]);

    useEffect(() => {
        if (mapInstanceRef.current) {
            addEmployeeMarkers();
        }
    }, [employees]);

    useEffect(() => {
        if (mapInstanceRef.current && userRole === "client") {
            initializeDrawControl();
        }
    }, [drawnZones.length, userRole]);

    useEffect(() => {
        if (zoneData && mapIsReady && drawnZones.length === 0) {
            drawExistingZone(zoneData);
        }
    }, [zoneData, mapIsReady]);

    useEffect(() => {
        if (zoneAssignedAgents.length > 0) {
            setTempAssignedAgents(prev =>
                prev.filter(tempAgent =>
                    !zoneAssignedAgents.some(officialAgent =>
                        officialAgent.id === tempAgent.id
                    )
                )
            );
        }
    }, [zoneAssignedAgents]);

    return (
        <div
            className={`relative w-full h-full ${isDragOver ? 'bg-blue-50' : ''}`}
            onDragOver={userRole === "client" ? handleDragOver : undefined}
            onDragLeave={userRole === "client" ? handleDragLeave : undefined}
            onDrop={userRole === "client" ? handleDrop : undefined}
        >
            <div ref={mapRef} className="w-full h-full"></div>

            {isZoneLocked && (
                <div className="absolute top-3 right-16 flex gap-2 z-[999]">
                    <button
                        onClick={unlockView}
                        className="bg-white p-2 rounded hover:bg-gray-100 flex items-center shadow-md"
                        title="Déverrouiller la vue"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            )}

            {isDragOver && dropPosition && (
                <div
                    className="absolute z-[1000] pointer-events-none"
                    style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                >
                    <div className={`p-3 rounded-lg shadow-lg text-center ${
                        isValidDropLocation
                            ? 'bg-white border-2 border-green-500'
                            : 'bg-red-100 border-2 border-red-500'
                    }`}>
                        <div
                            className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-white font-bold mb-2"
                            style={{ backgroundColor: draggingEmployee?.routeColor || '#4B5563' }}
                        >
                            {draggingEmployee?.avatar || '?'}
                        </div>
                        <p className="text-sm font-medium">
                            {isValidDropLocation ? 'Déposer ici' : 'Hors zone - Non autorisé'}
                        </p>
                    </div>
                </div>
            )}

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

            {showZoneForm && userRole === "client" && (
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