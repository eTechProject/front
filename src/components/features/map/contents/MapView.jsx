import React, { useEffect, useRef, useState, useImperativeHandle } from 'react';
import { useAuth } from "@/context/AuthContext.jsx";
import { useZone } from "@/hooks/features/zone/useZone.js";
import ZoneForm from "@/components/features/map/ui/ZoneForm.jsx";
import ZonePanel from "@/components/features/map/ui/ZonePanel.jsx";
import ZonePanelToggle from "@/components/features/map/ui/ZonePanelToggle.jsx";
import { isPointInPolygon } from "@/utils/geoUtils.js";
import { useLocalStorageState } from "@/hooks/listener/useLocalStorageState.js";

const MapView = React.forwardRef(({
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
                                  }, ref) => {
    // Références
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const zoneAgentMarkersRef = useRef([]);
    const drawControlRef = useRef(null);
    const drawnItemsRef = useRef(null);
    const baseMapsRef = useRef({});
    const userLocationMarkerRef = useRef(null);

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
    const [tempAssignedAgents, setTempAssignedAgents] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [geolocationError, setGeolocationError] = useState(null);
    const [isAlertActive, setIsAlertActive] = useLocalStorageState('isAlertActive', false);

    const { user } = useAuth();
    const { sendZone, isLoading, error, success } = useZone();

    // Configuration
    const MAX_ZOOM = 19;
    const INITIAL_ZOOM = 13;
    const INITIAL_CENTER = [-18.9146, 47.5309]; // Antananarivo

    // Exposer les méthodes utiles via la ref
    useImperativeHandle(ref, () => ({
        convertScreenToLatLng: (screenX, screenY) => {
            if (!mapInstanceRef.current) return null;
            try {
                const mapContainer = mapRef.current;
                if (!mapContainer) return null;
                const rect = mapContainer.getBoundingClientRect();
                const containerX = screenX - rect.left;
                const containerY = screenY - rect.top;
                const point = window.L.point(containerX, containerY);
                const latLng = mapInstanceRef.current.containerPointToLatLng(point);
                console.log('🗺️ Screen to LatLng conversion:', {
                    screen: { x: screenX, y: screenY },
                    container: { x: containerX, y: containerY },
                    latLng: { lat: latLng.lat, lng: latLng.lng }
                });
                return { lat: latLng.lat, lng: latLng.lng };
            } catch (error) {
                console.error('Erreur lors de la conversion des coordonnées:', error);
                return null;
            }
        },
        getMap: () => mapInstanceRef.current,
        fitBounds: (bounds) => {
            if (mapInstanceRef.current && bounds) {
                mapInstanceRef.current.fitBounds(bounds);
            }
        }
    }), []);

    // Ajouter les styles d'animation pour les marqueurs et la zone
    useEffect(() => {
        if (!document.getElementById('map-animations')) {
            const style = document.createElement('style');
            style.id = 'map-animations';
            style.textContent = `
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                    100% { transform: scale(1); }
                }
                .marker-updating {
                    animation: pulse 1s ease-in-out;
                }
                @keyframes blink-zone {
                    0%, 100% { fill: #ef4444; fill-opacity: 0.4; }
                    50% { fill: #ef4444; fill-opacity: 0.1; }
                }
                .zone-alert {
                    animation: blink-zone 2s ease-in-out infinite;
                }
            `;
            document.head.appendChild(style);
        }
    }, []);

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

    // Gestion de la géolocalisation
    const handleGeolocation = () => {
        if (!navigator.geolocation) {
            setGeolocationError("La géolocalisation n'est pas supportée par ce navigateur.");
            return;
        }

        setGeolocationError(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newPosition = { lat: latitude, lng: longitude };
                setUserLocation(newPosition);

                if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([latitude, longitude], 16);

                    if (userLocationMarkerRef.current) {
                        mapInstanceRef.current.removeLayer(userLocationMarkerRef.current);
                    }

                    const userIcon = window.L.divIcon({
                        html: `
                            <div style="
                                background-color: #3b82f6;
                                width: 24px; 
                                height: 24px; 
                                border-radius: 50%;
                                border: 2px solid white;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 24 24">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7  locksmith 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                            </div>
                        `,
                        className: '',
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    });

                    userLocationMarkerRef.current = window.L.marker([latitude, longitude], { icon: userIcon })
                        .addTo(mapInstanceRef.current)
                        .bindPopup('Votre position actuelle')
                        .openPopup();
                }
            },
            (error) => {
                let errorMessage = "Impossible d'obtenir votre position.";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Permission de géolocalisation refusée.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Position indisponible.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Délai d'attente dépassé pour la géolocalisation.";
                        break;
                }
                setGeolocationError(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    // Fonction pour désactiver l'alerte
    const handleDisableAlert = () => {
        console.log('[MapView] Disabling alert, setting isAlertActive to false');
        setIsAlertActive(false);
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
                console.log('🗺️ Map clicked at:', e.latlng);

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
                    shapeOptions: {
                        color: isAlertActive ? '#ef4444' : '#3388ff',
                        fillOpacity: isAlertActive ? 0.4 : 0.2
                    }
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

        console.log('[MapView] Initializing draw control with isAlertActive:', isAlertActive);
        drawControlRef.current = new window.L.Control.Draw(drawOptions);
        mapInstanceRef.current.addControl(drawControlRef.current);

        mapInstanceRef.current.on(window.L.Draw.Event.CREATED, (e) => {
            if (drawnZones.length > 0) return;
            const layer = e.layer;
            drawnItemsRef.current.addLayer(layer);
            setCurrentLayer(layer);

            // Appliquer la classe zone-alert si nécessaire
            if (isAlertActive && layer.getElement) {
                setTimeout(() => {
                    const element = layer.getElement();
                    if (element) {
                        element.classList.add('zone-alert');
                    }
                }, 0);
            }

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

                // Mettre à jour la classe zone-alert
                if (layer.getElement) {
                    const element = layer.getElement();
                    element.classList.remove('zone-alert');
                    if (isAlertActive) {
                        element.classList.add('zone-alert');
                    }
                }
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
                {
                    color: isAlertActive ? '#ef4444' : '#3388ff',
                    fillOpacity: isAlertActive ? 0.4 : 0.2
                }
            );

            // Appliquer la classe zone-alert si nécessaire
            if (isAlertActive) {
                setTimeout(() => {
                    const element = layer.getElement && layer.getElement();
                    if (element) {
                        element.classList.add('zone-alert');
                    }
                }, 0);
            }

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
            console.log('[MapView] Existing zone drawn:', { zoneData, isAlertActive });
        } catch (error) {
            console.error("Erreur lors du tracé de la zone:", error);
        }
    };

    // Ajout des agents de zone à la carte
    const addZoneAgentsToMap = () => {
        if (!mapInstanceRef.current) return;

        const allAgents = getAllZoneAgents();
        const currentAgentIds = new Set(allAgents.map(agent => agent.id || agent.tempId));

        zoneAgentMarkersRef.current = zoneAgentMarkersRef.current.filter(markerData => {
            if (!currentAgentIds.has(markerData.agentId)) {
                if (mapInstanceRef.current.hasLayer(markerData.marker)) {
                    mapInstanceRef.current.removeLayer(markerData.marker);
                }
                return false;
            }
            return true;
        });

        const existingMarkers = new Map(
            zoneAgentMarkersRef.current.map(markerData => [markerData.agentId, markerData])
        );

        allAgents.forEach(agent => {
            try {
                if (!agent?.name || !agent.position) return;

                const agentId = agent.id || agent.tempId;
                const position = [agent.position.lat, agent.position.lng];
                const agentColor = agent.routeColor || '#' + Math.floor(Math.random() * 16777215).toString(16);

                const existingMarkerData = existingMarkers.get(agentId);

                if (existingMarkerData) {
                    const currentLatLng = existingMarkerData.marker.getLatLng();
                    const newLatLng = window.L.latLng(position[0], position[1]);

                    const hasPositionChanged = Math.abs(currentLatLng.lat - newLatLng.lat) > 0.0001 ||
                        Math.abs(currentLatLng.lng - newLatLng.lng) > 0.0001;

                    if (hasPositionChanged) {
                        animateMarkerToPosition(existingMarkerData.marker, newLatLng);
                        console.log(`📍 Position updated for agent ${agent.name}:`, position);
                    }

                    existingMarkerData.agent = agent;
                    updateMarkerPopup(existingMarkerData.marker, agent);
                } else {
                    const customIcon = window.L.divIcon({
                        html: `<div style="
                            background-color: ${agentColor};
                            width: 32px; height: 32px; border-radius: 50%;
                            display: flex; align-items: center; justify-content: center;
                            color: white; font-weight: bold; font-size: 12px;
                            border: 2px solid white;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                            ${agent.isTemporary ? 'opacity: 0.8; border-color: #fbbf24;' : ''}
                            transition: all 0.3s ease;
                        ">${agent.avatar}</div>`,
                        className: '',
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });

                    const marker = window.L.marker(position, { icon: customIcon })
                        .addTo(mapInstanceRef.current);

                    updateMarkerPopup(marker, agent);

                    marker.on('click', () => {
                        if (handleEmployeeClick) {
                            handleEmployeeClick(agent);
                        }
                    });

                    zoneAgentMarkersRef.current.push({
                        agentId: agentId,
                        marker: marker,
                        agent: agent
                    });

                    console.log(`✨ New marker created for agent ${agent.name}:`, position);
                }
            } catch (error) {
                console.error("Erreur lors de l'ajout de l'agent sur la carte:", error);
            }
        });
    };

    // Animation des marqueurs
    const animateMarkerToPosition = (marker, newLatLng, duration = 1000) => {
        const startLatLng = marker.getLatLng();
        const startTime = Date.now();

        const markerElement = marker.getElement();
        if (markerElement) {
            const iconDiv = markerElement.querySelector('div');
            if (iconDiv) {
                iconDiv.classList.add('marker-updating');
            }
        }

        const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            if (progress < 1) {
                const easedProgress = easeInOutQuad(progress);
                const currentLat = startLatLng.lat + (newLatLng.lat - startLatLng.lat) * easedProgress;
                const currentLng = startLatLng.lng + (newLatLng.lng - startLatLng.lng) * easedProgress;

                marker.setLatLng([currentLat, currentLng]);
                requestAnimationFrame(animate);
            } else {
                marker.setLatLng(newLatLng);

                setTimeout(() => {
                    if (markerElement) {
                        const iconDiv = markerElement.querySelector('div');
                        if (iconDiv) {
                            iconDiv.classList.remove('marker-updating');
                        }
                    }
                }, 500);
            }
        };

        requestAnimationFrame(animate);
    };

    // Mise à jour du popup des marqueurs
    const updateMarkerPopup = (marker, agent) => {
        const statusLabel = agent.isTemporary ? 'En cours d\'assignation...' : agent.status;
        const statusColor = agent.isTemporary ? '#fbbf24' : getStatusColorHex(agent.status);

        const popupContent = `
            <div style="text-align: center; padding: 8px;">
                <strong>${agent.name}</strong><br>
                <small>${agent.role || 'Agent assigné'}</small><br>
                <span style="
                    background: ${statusColor};
                    color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;
                ">${statusLabel}</span>
                ${agent.taskDescription ? `<br><small class="text-gray-500">${agent.taskDescription}</small>` : ''}
                ${agent.isTemporary ? '<br><small class="text-orange-600">⏳ Assignation en cours</small>' : ''}
                ${agent.lastLocationUpdate ? `<br><small class="text-gray-400">Dernière mise à jour: ${new Date(agent.lastLocationUpdate).toLocaleTimeString()}</small>` : ''}
            </div>
        `;

        marker.bindPopup(popupContent);
    };

    // Ajout des marqueurs d'employés
    const addEmployeeMarkers = () => {
        if (!window.L || !mapInstanceRef.current) return;

        const currentEmployeeIds = new Set(employees.map(employee => employee.id).filter(Boolean));

        markersRef.current = markersRef.current.filter(markerData => {
            if (!currentEmployeeIds.has(markerData.employeeId)) {
                if (mapInstanceRef.current.hasLayer(markerData.marker)) {
                    mapInstanceRef.current.removeLayer(markerData.marker);
                }
                return false;
            }
            return true;
        });

        const existingMarkers = new Map(
            markersRef.current.map(markerData => [markerData.employeeId, markerData])
        );

        employees.forEach(employee => {
            if (!employee.position) return;

            const existingMarkerData = existingMarkers.get(employee.id);

            if (existingMarkerData) {
                const currentLatLng = existingMarkerData.marker.getLatLng();
                const newLatLng = window.L.latLng(employee.position.lat, employee.position.lng);

                const hasPositionChanged = Math.abs(currentLatLng.lat - newLatLng.lat) > 0.0001 ||
                    Math.abs(currentLatLng.lng - newLatLng.lng) > 0.0001;

                if (hasPositionChanged) {
                    animateMarkerToPosition(existingMarkerData.marker, newLatLng);
                    console.log(`📍 Position updated for employee ${employee.name}:`, [employee.position.lat, employee.position.lng]);
                }

                existingMarkerData.employee = employee;
                updateEmployeeMarkerPopup(existingMarkerData.marker, employee);
            } else {
                const customIcon = window.L.divIcon({
                    html: `<div style="
                        background-color: ${employee.routeColor || '#888'};
                        width: 32px; height: 32px; border-radius: 50%;
                        display: flex; align-items: center; justify-content: center;
                        color: white; font-weight: bold; font-size: 12px;
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        transition: all 0.3s ease;
                    ">${employee.avatar || ''}</div>`,
                    className: '',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                });

                const marker = window.L.marker(
                    [employee.position.lat, employee.position.lng],
                    { icon: customIcon }
                ).addTo(mapInstanceRef.current);

                updateEmployeeMarkerPopup(marker, employee);

                marker.on('click', () => {
                    handleEmployeeClick(employee);
                });

                markersRef.current.push({
                    employeeId: employee.id,
                    marker: marker,
                    employee: employee
                });

                console.log(`✨ New marker created for employee ${employee.name}:`, [employee.position.lat, employee.position.lng]);
            }
        });
    };

    // Mise à jour du popup des employés
    const updateEmployeeMarkerPopup = (marker, employee) => {
        const popupContent = `
            <div style="text-align: center; padding: 8px;">
                <strong>${employee.name}</strong><br>
                <small>${employee.role}</small><br>
                <span style="
                    background: ${getStatusColorHex(employee.status)};
                    color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;
                ">${employee.status}</span>
                ${employee.lastLocationUpdate ? `<br><small class="text-gray-400">Dernière mise à jour: ${new Date(employee.lastLocationUpdate).toLocaleTimeString()}</small>` : ''}
            </div>
        `;

        marker.bindPopup(popupContent);
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
                const tempAgent = {
                    ...employeeToAssign,
                    position: { lat: point.lat, lng: point.lng },
                    isTemporary: true,
                    tempId: Date.now()
                };

                setTempAssignedAgents(prev => [...prev, tempAgent]);

                if (onEmployeeDrop) {
                    try {
                        await onEmployeeDrop(employeeToAssign, point, zoneInfo);
                        setTempAssignedAgents(prev =>
                            prev.filter(agent => agent.tempId !== tempAgent.tempId)
                        );
                    } catch (error) {
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

    // Mettre à jour le style de la zone lorsque isAlertActive change
    useEffect(() => {
        console.log('[MapView] Updating zone style:', {
            isAlertActive,
            hasDrawnZones: drawnZones.length > 0,
            hasCurrentLayer: !!currentLayer
        });
        if (drawnZones.length > 0 && currentLayer) {
            try {
                // Supprimer la classe existante pour éviter les conflits
                const element = currentLayer.getElement && currentLayer.getElement();
                if (element) {
                    element.classList.remove('zone-alert');
                    if (isAlertActive) {
                        element.classList.add('zone-alert');
                    }
                }

                // Mettre à jour le style de la couche
                currentLayer.setStyle({
                    color: isAlertActive ? '#ef4444' : '#3388ff',
                    fillOpacity: isAlertActive ? 0.4 : 0.2
                });

                // Forcer un redraw de la couche
                currentLayer.eachLayer(layer => {
                    layer.redraw();
                });

                console.log('[MapView] Zone style updated successfully');
            } catch (error) {
                console.error('[MapView] Error updating zone style:', error);
            }
        } else {
            console.warn('[MapView] Cannot update zone style: no drawn zones or current layer');
        }
    }, [isAlertActive, drawnZones, currentLayer]);

    return (
        <div
            className={`relative w-full h-full ${isDragOver ? 'bg-blue-50' : ''}`}
            onDragOver={userRole === "client" ? handleDragOver : undefined}
            onDragLeave={userRole === "client" ? handleDragLeave : undefined}
            onDrop={userRole === "client" ? handleDrop : undefined}
        >
            <div ref={mapRef} className="w-full h-full"></div>

            {/* Boutons de contrôle */}
            <div className="absolute top-3 right-16 flex gap-2 z-[999]">
                <button
                    onClick={handleGeolocation}
                    className="bg-white p-2 rounded hover:bg-gray-100 flex items-center shadow-md"
                    title="Localiser ma position"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                </button>
                {isZoneLocked && (
                    <button
                        onClick={unlockView}
                        className="bg-white p-2 rounded hover:bg-gray-100 flex items-center shadow-md"
                        title="Déverrouiller la vue"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
                {isAlertActive && drawnZones.length > 0 && (
                    <button
                        onClick={handleDisableAlert}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center shadow-md transition-transform transform hover:scale-105"
                        title="Désactiver l'alerte"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm0-14a1 1 0 011 1v4.586l2.707 2.707a1 1 0 01-1.414 1.414L12 13.414V7a1 1 0 011-1z"/>
                        </svg>
                        Désactiver l'alerte
                    </button>
                )}
            </div>

            {/* Affichage des erreurs de géolocalisation */}
            {geolocationError && (
                <div className="absolute top-16 right-16 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded z-[1000]">
                    {geolocationError}
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
                            className="w-12 h-12 rounded-full mx-auto flex items-center justify-content text-white font-bold mb-2"
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
});

MapView.displayName = 'MapView';
export default MapView;