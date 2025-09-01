import React, { useEffect, useRef, useState, useImperativeHandle } from 'react';
import { useAuth } from "@/context/AuthContext.jsx";
import { useZone } from "@/hooks/features/zone/useZone.js";
import ZoneForm from "@/components/features/map/ui/ZoneForm.jsx";
import ZonePanel from "@/components/features/map/ui/ZonePanel.jsx";
import ZonePanelToggle from "@/components/features/map/ui/ZonePanelToggle.jsx";
import { isPointInPolygon } from "@/utils/geoUtils.js";
import { useLocalStorageState } from "@/hooks/listener/useLocalStorageState.js";
import {mapReloadService} from "@/services/map/mapReloadService.js";
import {useAlert} from "@/hooks/features/alert/useAlert.js";

/**
 * Main map component.
 * - Displays employees on a Leaflet map
 * - Allows clients to create/edit/delete zones
 * - Supports drag-and-drop employee placement (clients only)
 * - Manages zone panel and zone form display
 * - Includes geolocation functionality
 * - Supports alert system with visual feedback
 */
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
    // References
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]); // Structure: [{employeeId, marker, employee}, ...]
    const zoneAgentMarkersRef = useRef([]); // Structure: [{agentId, marker, agent}, ...]
    const drawControlRef = useRef(null);
    const drawnItemsRef = useRef(null);
    const baseMapsRef = useRef({});
    const userLocationMarkerRef = useRef(null);

    // States
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
    const { cancelAlert } = useAlert();
    // Configuration
    const MAX_ZOOM = 19;
    const INITIAL_ZOOM = 13;
    const INITIAL_CENTER = [-18.9146, 47.5309]; // Antananarivo

    // Expose map methods via ref
    useImperativeHandle(ref, () => ({
        convertScreenToLatLng: (screenX, screenY) => {
            if (!mapInstanceRef.current || !mapRef.current) return null;
            try {
                const rect = mapRef.current.getBoundingClientRect();
                const point = window.L.point(screenX - rect.left, screenY - rect.top);
                const latLng = mapInstanceRef.current.containerPointToLatLng(point);
                return { lat: latLng.lat, lng: latLng.lng };
            } catch (error) {
                console.error('Error converting coordinates:', error);
                return null;
            }
        },
        getMap: () => mapInstanceRef.current,
        fitBounds: (bounds) => {
            if (mapInstanceRef.current && bounds) {
                mapInstanceRef.current.fitBounds(bounds);
            }
        },
    }), []);

    // Add animation styles for markers and zones
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

    // Zone form state
    const [zoneFormData, setZoneFormData] = useState({
        name: '',
        description: '',
        clientId: user?.userId || '',
        coordinates: [],
        type: 'Polygone',
    });

    // Combine official and temporary agents
    const getAllZoneAgents = () => [...zoneAssignedAgents, ...tempAssignedAgents];

    // Map status to colors
    const getStatusColorHex = (status) => {
        const statusMap = {
            inactif: '#ef4444',
            occupé: '#ef4444',
            actif: '#3b82f6',
            'en mission': '#3b82f6',
            disponible: '#22c55e',
            pending: '#eab308',
        };
        return statusMap[status?.toLowerCase()] || '#eab308';
    };

    // Handle geolocation
    const handleGeolocation = () => {
        if (!navigator.geolocation) {
            setGeolocationError("Geolocation is not supported by this browser.");
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
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                            </div>
                        `,
                        className: '',
                        iconSize: [24, 24],
                        iconAnchor: [12, 12],
                    });

                    userLocationMarkerRef.current = window.L.marker([latitude, longitude], { icon: userIcon })
                        .addTo(mapInstanceRef.current)
                        .bindPopup('Your current position')
                        .openPopup();
                }
            },
            (error) => {
                let errorMessage = "Unable to retrieve your position.";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Geolocation permission denied.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Position unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Geolocation request timed out.";
                        break;
                }
                setGeolocationError(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    // Disable alert
    const handleDisableAlert = async () => {
        const alertId = localStorage.getItem("alertId");
        if (alertId) {
            try {
                const response = await cancelAlert(alertId);
                if (response.success) {
                    setIsAlertActive(false);
                    localStorage.removeItem("alertId");
                }
            } catch (err) {
                console.error('[handleDisableAlert] Error cancelling alert:', err);
            }
        }
    };

    // Initialize map
    const initializeMap = () => {
        if (!mapRef.current || !window.L || mapInstanceRef.current) return;

        mapInstanceRef.current = window.L.map(mapRef.current, {
            maxZoom: MAX_ZOOM,
            minZoom: 3,
            zoomControl: true,
            bounceAtZoomLimits: false,
            worldCopyJump: false,
        }).setView(INITIAL_CENTER, INITIAL_ZOOM);

        const osmLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: MAX_ZOOM,
        });

        const satelliteLayer = window.L.tileLayer(
            'https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg',
            {
                minZoom: 0,
                maxZoom: MAX_ZOOM,
                attribution: '&copy; Stadia Maps &copy; OpenMapTiles &copy; OpenStreetMap contributors',
            }
        );

        osmLayer.addTo(mapInstanceRef.current);
        baseMapsRef.current = {
            "Classic View (OSM)": osmLayer,
            "Satellite View": satelliteLayer,
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
    };

    // Initialize draw controls
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
                circlemarker: false,
            } : {
                polyline: false,
                circle: false,
                rectangle: false,
                polygon: {
                    allowIntersection: false,
                    showArea: true,
                    shapeOptions: {
                        color: isAlertActive ? '#ef4444' : '#3388ff',
                        fillOpacity: isAlertActive ? 0.4 : 0.2,
                    },
                },
                marker: false,
                circlemarker: false,
            },
            edit: {
                featureGroup: drawnItemsRef.current,
                edit: hasZone,
                remove: hasZone,
            },
        };

        drawControlRef.current = new window.L.Control.Draw(drawOptions);
        mapInstanceRef.current.addControl(drawControlRef.current);

        mapInstanceRef.current.on(window.L.Draw.Event.CREATED, (e) => {
            if (drawnZones.length > 0) return;
            const layer = e.layer;
            drawnItemsRef.current.addLayer(layer);
            setCurrentLayer(layer);

            if (isAlertActive && layer.getElement) {
                setTimeout(() => {
                    const element = layer.getElement();
                    if (element) element.classList.add('zone-alert');
                }, 0);
            }

            const latLngs = layer.getLatLngs()[0];
            const coordinates = latLngs.map(point => [point.lat, point.lng]);

            setZoneFormData({
                name: 'Zone 1',
                description: '',
                clientId: user?.userId || '',
                coordinates,
                type: 'Polygone',
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

                setZoneFormData(prev => ({ ...prev, coordinates }));
                setDrawnZones([{ ...zone, coordinates }]);
                lockViewToZone(coordinates);

                if (layer.getElement) {
                    const element = layer.getElement();
                    element.classList.remove('zone-alert');
                    if (isAlertActive) element.classList.add('zone-alert');
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
                type: 'Polygone',
            });
        });
    };

    // Lock view to zone
    const lockViewToZone = (coordinates) => {
        if (!mapInstanceRef.current || !coordinates?.length) return;
        const bounds = window.L.latLngBounds(coordinates.map(coord => [coord[0], coord[1]]));
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
        mapInstanceRef.current.setMaxBounds(bounds.pad(0.5));
        mapInstanceRef.current.setMinZoom(mapInstanceRef.current.getZoom() - 2);
        setIsZoneLocked(true);
    };

    // Unlock view
    const unlockView = () => {
        if (!mapInstanceRef.current) return;
        mapInstanceRef.current.setMaxBounds(null);
        mapInstanceRef.current.setMinZoom(3);
        setIsZoneLocked(false);
    };

    // Draw existing zone
    const drawExistingZone = (zoneData) => {
        if (!mapInstanceRef.current || !drawnItemsRef.current || !zoneData?.securedZone?.coordinates) {
            console.error("Invalid zone data:", zoneData);
            return;
        }

        try {
            setCurrentZoneInfo({
                serviceOrderId: zoneData.serviceOrder?.id,
                securedZoneId: zoneData.securedZone.securedZoneId || "unknown",
                zoneName: zoneData.securedZone.name,
            });

            const coordinates = zoneData.securedZone.coordinates;
            const layer = window.L.polygon(
                coordinates.map(coord => [coord[0], coord[1]]),
                {
                    color: isAlertActive ? '#ef4444' : '#3388ff',
                    fillOpacity: isAlertActive ? 0.4 : 0.2,
                }
            );

            if (isAlertActive && layer.getElement) {
                setTimeout(() => {
                    const element = layer.getElement();
                    if (element) element.classList.add('zone-alert');
                }, 0);
            }

            drawnItemsRef.current.addLayer(layer);
            setDrawnZones([{
                id: zoneData.userId || Date.now(),
                name: zoneData.securedZone.name,
                description: zoneData.description || '',
                layer,
                type: 'Polygone',
                coordinates,
                serviceOrderId: zoneData.serviceOrder?.id,
                securedZoneId: zoneData.securedZone.securedZoneId,
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
                clientId: user?.userId || '',
                coordinates,
                type: 'Polygone',
            });

            setCurrentLayer(layer);
            lockViewToZone(coordinates);
        } catch (error) {
            console.error("Error drawing zone:", error);
        }
    };

    // Add zone agents to map
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
            if (!agent?.name || !agent.position) return;

            const agentId = agent.id || agent.tempId;
            const position = [agent.position.lat, agent.position.lng];
            const agentColor = agent.routeColor || `#${Math.floor(Math.random() * 16777215).toString(16)}`;

            const existingMarkerData = existingMarkers.get(agentId);

            if (existingMarkerData) {
                const currentLatLng = existingMarkerData.marker.getLatLng();
                const newLatLng = window.L.latLng(position[0], position[1]);

                if (Math.abs(currentLatLng.lat - newLatLng.lat) > 0.0001 ||
                    Math.abs(currentLatLng.lng - newLatLng.lng) > 0.0001) {
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
                    iconAnchor: [16, 16],
                });

                const marker = window.L.marker(position, { icon: customIcon })
                    .addTo(mapInstanceRef.current);

                updateMarkerPopup(marker, agent);

                marker.on('click', () => {
                    handleEmployeeClick?.(agent);
                });

                zoneAgentMarkersRef.current.push({
                    agentId,
                    marker,
                    agent,
                });
                console.log(`✨ New marker created for agent ${agent.name}:`, position);
            }
        });
    };

    // Animate marker to new position
    const animateMarkerToPosition = (marker, newLatLng, duration = 1000) => {
        const startLatLng = marker.getLatLng();
        const startTime = Date.now();

        const markerElement = marker.getElement();
        if (markerElement) {
            const iconDiv = markerElement.querySelector('div');
            if (iconDiv) iconDiv.classList.add('marker-updating');
        }

        const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

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
                        if (iconDiv) iconDiv.classList.remove('marker-updating');
                    }
                }, 500);
            }
        };

        requestAnimationFrame(animate);
    };

    // Update marker popup
    const updateMarkerPopup = (marker, agent) => {
        const statusLabel = agent.isTemporary ? 'Pending assignment...' : agent.status;
        const statusColor = agent.isTemporary ? '#fbbf24' : getStatusColorHex(agent.status);

        const popupContent = `
            <div style="text-align: center; padding: 8px;">
                <strong>${agent.name}</strong><br>
                <small>${agent.role || 'Assigned agent'}</small><br>
                <span style="
                    background: ${statusColor};
                    color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;
                ">${statusLabel}</span>
                ${agent.taskDescription ? `<br><small class="text-gray-500">${agent.taskDescription}</small>` : ''}
                ${agent.isTemporary ? '<br><small class="text-orange-600">⏳ Pending assignment</small>' : ''}
                ${agent.lastLocationUpdate ? `<br><small class="text-gray-400">Last updated: ${new Date(agent.lastLocationUpdate).toLocaleTimeString()}</small>` : ''}
            </div>
        `;

        marker.bindPopup(popupContent);
    };

    // Add employee markers
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

                if (Math.abs(currentLatLng.lat - newLatLng.lat) > 0.0001 ||
                    Math.abs(currentLatLng.lng - newLatLng.lng) > 0.0001) {
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
                    iconAnchor: [16, 16],
                });

                const marker = window.L.marker(
                    [employee.position.lat, employee.position.lng],
                    { icon: customIcon }
                ).addTo(mapInstanceRef.current);

                updateEmployeeMarkerPopup(marker, employee);

                marker.on('click', () => {
                    handleEmployeeClick?.(employee);
                });

                markersRef.current.push({
                    employeeId: employee.id,
                    marker,
                    employee,
                });
                console.log(`✨ New marker created for employee ${employee.name}:`, [employee.position.lat, employee.position.lng]);
            }
        });
    };

    // Update employee marker popup
    const updateEmployeeMarkerPopup = (marker, employee) => {
        const popupContent = `
            <div style="text-align: center; padding: 8px;">
                <strong>${employee.name}</strong><br>
                <small>${employee.role}</small><br>
            </div>
        `;

        marker.bindPopup(popupContent);
    };

    // Handle drag & drop
    const handleDragOver = (e) => {
        if (userRole !== "client") return;
        e.preventDefault();

        if (!mapInstanceRef.current || !drawnZones.length) return;

        const rect = mapRef.current.getBoundingClientRect();
        const point = mapInstanceRef.current.containerPointToLatLng([
            e.clientX - rect.left,
            e.clientY - rect.top,
        ]);

        const currentZone = drawnZones[0];
        const isInsideZone = isPointInPolygon({ lat: point.lat, lng: point.lng }, currentZone.coordinates);

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
        const point = mapInstanceRef.current.containerPointToLatLng([
            e.clientX - rect.left,
            e.clientY - rect.top,
        ]);

        const currentZone = drawnZones[0];
        const isInsideZone = isPointInPolygon({ lat: point.lat, lng: point.lng }, currentZone.coordinates);

        if (!isInsideZone) {
            setDropPosition(null);
            setIsValidDropLocation(false);
            return;
        }

        let employeeToAssign = null;
        try {
            const data = e.dataTransfer.getData('application/json');
            employeeToAssign = data ? JSON.parse(data) : draggingEmployee;

            if (employeeToAssign) {
                const tempAgent = {
                    ...employeeToAssign,
                    position: { lat: point.lat, lng: point.lng },
                    isTemporary: true,
                    tempId: Date.now(),
                };

                setTempAssignedAgents(prev => [...prev, tempAgent]);

                if (onEmployeeDrop) {
                    try {
                        await onEmployeeDrop(employeeToAssign, point, currentZoneInfo);
                        setTimeout(() => {
                            setTempAssignedAgents(prev => prev.filter(agent => agent.tempId !== tempAgent.tempId));
                        }, 1000);
                    } catch (error) {
                        setTempAssignedAgents(prev => prev.filter(agent => agent.tempId !== tempAgent.tempId));
                        console.error("Error during employee drop:", error);
                    }
                }
            }
        } catch (err) {
            console.error("Error processing drop:", err);
        }

        setDropPosition(null);
        setIsValidDropLocation(true);
    };

    // Save zone
    const saveZone = async () => {
        if (!zoneFormData.name) return;
        const zoneDataToSend = {
            description: zoneFormData.description,
            clientId: zoneFormData.clientId,
            securedZone: {
                name: zoneFormData.name,
                coordinates: zoneFormData.coordinates,
            },
        };

        try {
            await sendZone(zoneDataToSend);
            setDrawnZones([{
                id: Date.now(),
                name: zoneFormData.name,
                description: zoneFormData.description,
                layer: currentLayer,
                type: 'Polygone',
                coordinates: zoneFormData.coordinates,
            }]);
            setShowZoneForm(false);
            mapReloadService.triggerReload()

            if (currentLayer) {
                currentLayer.bindPopup(`<b>${zoneFormData.name}</b><br>${zoneFormData.description || ''}`);
            }
        } catch (error) {
            console.error("Error saving zone:", error);
        }
    };

    // Cancel zone creation
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
            type: 'Polygone',
        });
        unlockView();
    };

    // Delete zone
    const deleteZone = (zoneId) => {
        const zoneToDelete = drawnZones.find(zone => zone.id === zoneId);
        if (zoneToDelete?.layer) {
            drawnItemsRef.current.removeLayer(zoneToDelete.layer);
            setDrawnZones([]);
            unlockView();
        }
    };

    // Handle zone click
    const handleZoneClick = (zone) => {
        if (!mapInstanceRef.current) return;
        lockViewToZone(zone.coordinates);
    };

    // Effects
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
            if (window.L) return resolve();
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
            script.onload = resolve;
            document.head.appendChild(script);
            document.head.appendChild(script);
        });

        const loadLeafletDraw = () => new Promise((resolve) => {
            if (window.L && window.L.Draw) return resolve();
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });

        loadLeaflet()
            .then(loadLeafletDraw)
            .then(() => setTimeout(initializeMap, 100));

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (mapInstanceRef.current) {
            setTimeout(() => mapInstanceRef.current.invalidateSize(), 300);
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
            console.log('🗺️ Zone agents changed, updating map markers:', zoneAssignedAgents.length, 'agents');
            addZoneAgentsToMap();
        }
    }, [zoneAssignedAgents, tempAssignedAgents, mapIsReady]);

    useEffect(() => {
        if (mapInstanceRef.current) {
            console.log('🗺️ Employees changed, updating map markers:', employees.length, 'employees');
            addEmployeeMarkers();
        }
    }, [employees]);

    useEffect(() => {
        if (mapInstanceRef.current && userRole === "client") {
            initializeDrawControl();
        }
    }, [drawnZones.length, userRole, isAlertActive]);

    useEffect(() => {
        if (zoneData && mapIsReady && drawnZones.length === 0) {
            drawExistingZone(zoneData);
        }
    }, [zoneData, mapIsReady]);

    useEffect(() => {
        if (zoneAssignedAgents.length > 0) {
            setTempAssignedAgents(prev =>
                prev.filter(tempAgent => !zoneAssignedAgents.some(officialAgent => officialAgent.id === tempAgent.id))
            );
        }
    }, [zoneAssignedAgents]);

    useEffect(() => {
        if (drawnZones.length > 0 && currentLayer) {
            try {
                const element = currentLayer.getElement?.();
                if (element) {
                    element.classList.remove('zone-alert');
                    if (isAlertActive) element.classList.add('zone-alert');
                }

                currentLayer.setStyle({
                    color: isAlertActive ? '#ef4444' : '#3388ff',
                    fillOpacity: isAlertActive ? 0.4 : 0.2,
                });
            } catch (error) {
                console.error('Error updating zone style:', error);
            }
        }
    }, [isAlertActive, drawnZones, currentLayer]);

    return (
        <div
            className={`relative w-full h-full ${isDragOver ? 'bg-blue-50' : ''}`}
            onDragOver={userRole === "client" ? handleDragOver : undefined}
            onDragLeave={userRole === "client" ? handleDragLeave : undefined}
            onDrop={userRole === "client" ? handleDrop : undefined}
        >
            <div ref={mapRef} className="w-full h-full" />

            {/* Control buttons */}
            <div className="absolute top-3 right-16 flex gap-2 z-[999]">
                <button
                    onClick={handleGeolocation}
                    className="bg-white p-2 rounded hover:bg-gray-100 flex items-center shadow-md"
                    title="Locate my position"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                </button>
                {isZoneLocked && (
                    <button
                        onClick={unlockView}
                        className="bg-white p-2 rounded hover:bg-gray-100 flex items-center shadow-md"
                        title="Unlock view"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
                {isAlertActive && drawnZones.length > 0 && userRole === "client" && (
                    <button
                        onClick={handleDisableAlert}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center shadow-md transition-transform transform hover:scale-105"
                        title="Disable alert"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm0-14a1 1 0 011 1v4.586l2.707 2.707a1 1 0 01-1.414 1.414L12 13.414V7a1 1 0 011-1z"/>
                        </svg>
                        Désactiver l'alerte
                    </button>
                )}
            </div>

            {/* Geolocation error display */}
            {geolocationError && (
                <div className="absolute top-16 right-16 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded z-[1000]">
                    {geolocationError}
                </div>
            )}

            {/* Drag-and-drop feedback */}
            {isDragOver && dropPosition && (
                <div
                    className="absolute z-[1000] pointer-events-none"
                    style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                >
                    <div className={`p-3 rounded-lg shadow-lg text-center ${
                        isValidDropLocation ? 'bg-white border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'
                    }`}>
                        <div
                            className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-white font-bold mb-2"
                            style={{ backgroundColor: draggingEmployee?.routeColor || '#4B5563' }}
                        >
                            {draggingEmployee?.avatar || '?'}
                        </div>
                        <p className="text-sm font-medium">
                            {isValidDropLocation ? 'Drop here' : 'Outside zone - Not allowed'}
                        </p>
                    </div>
                </div>
            )}

            {/* Zone panel toggle */}
            {drawnZones.length > 0 && (
                <ZonePanelToggle
                    show={showZonePanel}
                    onClick={() => setShowZonePanel(!showZonePanel)}
                />
            )}

            {/* Zone panel */}
            {drawnZones.length > 0 && showZonePanel && (
                <ZonePanel
                    drawnZones={drawnZones}
                    onZoneClick={handleZoneClick}
                    onZoneDelete={deleteZone}
                />
            )}

            {/* Zone form */}
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