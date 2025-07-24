import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from "../../../../../context/AuthContext.jsx";
import ZonePanel from './ZonePanel';
import ZonePanelToggle from './ZonePanelToggle';
import ZoneForm from './ZoneForm';
import { useZone } from "../../../../../hooks/useZone.js";

const MapView = ({
                     mapRef,
                     employees,
                     handleEmployeeClick,
                     selectedEmployee,
                     sidebarVisible
                 }) => {
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const drawControlRef = useRef(null);
    const drawnItemsRef = useRef(null);
    const [drawnZones, setDrawnZones] = useState([]);
    const [showZonePanel, setShowZonePanel] = useState(true);
    const [showZoneForm, setShowZoneForm] = useState(false);
    const { user } = useAuth();
    const [zoneFormData, setZoneFormData] = useState({
        name: '',
        description: '',
        clientId: user.encryptedId,
        coordinates: [],
        type: ''
    });
    const [currentLayer, setCurrentLayer] = useState(null);
    const [zoneLoaded, setZoneLoaded] = useState(false);

    const { sendZone, getZone, isLoading, error, success } = useZone();

    const getStatusColorHex = (status) => {
        switch (status?.toLowerCase()) {
            case 'on the way': return '#10b981';
            case 'working': return '#3b82f6';
            case 'available': return '#22c55e';
            case 'break': return '#eab308';
            case 'completed': return '#6b7280';
            case 'transit': return '#f97316';
            case 'off duty': return '#ef4444';
            case 'pause': return '#10b981';
            case 'disponible': return '#22c55e';
            case 'occupé': return '#ef4444';
            default: return '#9ca3af';
        }
    };

    const initializeMap = () => {
        if (mapRef.current && window.L && !mapInstanceRef.current) {
            mapInstanceRef.current = window.L.map(mapRef.current).setView([-18.9146, 47.5309], 13);
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapInstanceRef.current);

            drawnItemsRef.current = new window.L.FeatureGroup();
            mapInstanceRef.current.addLayer(drawnItemsRef.current);

            if (window.L.drawLocal) {
                window.L.drawLocal.draw.toolbar.buttons.polygon = 'Dessiner une zone';
                window.L.drawLocal.draw.toolbar.buttons.rectangle = 'Dessiner un rectangle';
                window.L.drawLocal.draw.toolbar.buttons.circle = 'Dessiner un cercle';
                window.L.drawLocal.draw.handlers.circle.tooltip.start = 'Cliquez et faites glisser pour dessiner un cercle';
                window.L.drawLocal.draw.handlers.rectangle.tooltip.start = 'Cliquez et faites glisser pour dessiner un rectangle';
                window.L.drawLocal.draw.handlers.polygon.tooltip.start = 'Cliquez pour commencer à dessiner une zone';
                window.L.drawLocal.draw.handlers.polygon.tooltip.cont = 'Cliquez pour continuer à dessiner';
                window.L.drawLocal.draw.handlers.polygon.tooltip.end = 'Cliquez sur le premier point pour terminer';
                window.L.drawLocal.edit.toolbar.buttons.edit = 'Modifier les zones';
                window.L.drawLocal.edit.toolbar.buttons.remove = 'Supprimer des zones';
                window.L.drawLocal.edit.handlers.edit.tooltip.text = 'Faites glisser les points pour modifier';
                window.L.drawLocal.edit.handlers.edit.tooltip.subtext = 'Cliquez sur Annuler pour annuler les modifications';
                window.L.drawLocal.edit.handlers.remove.tooltip.text = 'Cliquez sur une zone pour la supprimer';
            }

            // Création de zone UNIQUEMENT pour les clients
            if (user.role === 'client') {
                initializeDrawControl();
            }
            addEmployeeMarkers();

            // Charger les zones du client après l'initialisation de la carte
            if (user.role === 'client' && !zoneLoaded) {
                loadClientZones();
            }
        }
    };

    // Fonction pour dessiner une zone existante sur la carte
    const drawExistingZone = (zoneData) => {
        if (!mapInstanceRef.current || !drawnItemsRef.current) return;

        if (!zoneData.securedZone || !zoneData.securedZone.coordinates) {
            console.error("Format de zone invalide:", zoneData);
            return;
        }

        const coordinates = zoneData.securedZone.coordinates;
        let layer;

        // Détecter le type de zone basé sur le nombre de points ou la forme
        let zoneType = 'Polygone';
        if (coordinates.length === 4) {
            // Si 4 points, c'est probablement un rectangle
            zoneType = 'Rectangle';
            // Créer un rectangle avec les limites définies par les coordonnées
            const bounds = window.L.latLngBounds(
                coordinates.map(coord => [coord[0], coord[1]])
            );
            layer = window.L.rectangle(bounds, {
                color: '#3388ff',
                fillOpacity: 0.2
            });
        } else if (coordinates.length >= 30) {
            // Si beaucoup de points, c'est probablement un cercle
            zoneType = 'Cercle';

            // Calcul du centre et du rayon
            const center = coordinates.reduce((acc, point) => {
                acc.lat += point[0] / coordinates.length;
                acc.lng += point[1] / coordinates.length;
                return acc;
            }, { lat: 0, lng: 0 });

            // Calcul du rayon (distance du centre au premier point)
            const firstPoint = coordinates[0];
            const radius = window.L.latLng(center.lat, center.lng)
                .distanceTo(window.L.latLng(firstPoint[0], firstPoint[1]));

            layer = window.L.circle([center.lat, center.lng], {
                radius,
                color: '#3388ff',
                fillOpacity: 0.2
            });
        } else {
            // Sinon c'est un polygone standard
            layer = window.L.polygon(coordinates.map(coord => [coord[0], coord[1]]), {
                color: '#3388ff',
                fillOpacity: 0.2
            });
        }

        // Ajouter la couche à la carte
        drawnItemsRef.current.addLayer(layer);

        // Mettre à jour l'état
        setDrawnZones([{
            id: zoneData.encryptedId || Date.now(),
            name: zoneData.securedZone.name,
            description: zoneData.description || '',
            layer: layer,
            type: zoneType,
            coordinates: coordinates
        }]);

        // Ajouter un popup
        layer.bindPopup(`<b>${zoneData.securedZone.name}</b><br>${zoneData.description || ''}`);

        // Mettre à jour le formulaire
        setZoneFormData({
            name: zoneData.securedZone.name,
            description: zoneData.description || '',
            clientId: user.encryptedId,
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
            }, { lat: 0, lng: 0 });
            mapInstanceRef.current.setView([center.lat, center.lng], 15);
        } else {
            const bounds = window.L.latLngBounds(coordinates.map(coord => [coord[0], coord[1]]));
            mapInstanceRef.current.fitBounds(bounds);
        }
    };

    // Charger les zones du client
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

    useEffect(() => {
        if (mapInstanceRef.current && user?.role === 'client' && !zoneLoaded) {
            loadClientZones();
        }
    }, [mapInstanceRef.current, user?.encryptedId, user?.role, zoneLoaded]);

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
            draw: hasZone
                ? {
                    polygon: false,
                    rectangle: false,
                    circle: false,
                    marker: false,
                    polyline: false,
                    circlemarker: false
                }
                : {
                    polyline: false,
                    circle: {
                        shapeOptions: {
                            color: '#3388ff',
                            fillOpacity: 0.2
                        }
                    },
                    rectangle: {
                        shapeOptions: {
                            color: '#3388ff',
                            fillOpacity: 0.2
                        }
                    },
                    polygon: {
                        allowIntersection: false,
                        showArea: true,
                        shapeOptions: {
                            color: '#3388ff',
                            fillOpacity: 0.2
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

        drawControlRef.current = new window.L.Control.Draw(drawOptions);
        mapInstanceRef.current.addControl(drawControlRef.current);

        mapInstanceRef.current.on(window.L.Draw.Event.CREATED, (e) => {
            if (drawnZones.length > 0) return;
            const layer = e.layer;
            drawnItemsRef.current.addLayer(layer);
            setCurrentLayer(layer);

            let coordinates = [];
            let layerType = e.layerType;

            if (layerType === 'circle') {
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
                clientId: user.encryptedId,
                coordinates: coordinates,
                type: layerType === 'circle' ? 'Cercle' :
                    layerType === 'rectangle' ? 'Rectangle' : 'Polygone'
            });

            setShowZoneForm(true);
        });

        mapInstanceRef.current.on(window.L.Draw.Event.EDITED, (e) => {
            const layers = e.layers;
            layers.eachLayer((layer) => {
                let coordinates = [];
                const zone = drawnZones[0];
                if (!zone) return;
                if (zone.type === 'Cercle') {
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
                setZoneFormData(prev => ({
                    ...prev,
                    coordinates: coordinates
                }));
                setDrawnZones([{
                    ...zone,
                    coordinates: coordinates
                }]);
            });
        });

        mapInstanceRef.current.on(window.L.Draw.Event.DELETED, () => {
            setDrawnZones([]);
            setZoneFormData({
                name: '',
                description: '',
                clientId: '',
                coordinates: [],
                type: ''
            });
        });
    };

    useEffect(() => {
        if (mapInstanceRef.current && user?.role === "client") initializeDrawControl();
        // eslint-disable-next-line
    }, [drawnZones.length, user?.role]);

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
            type: ''
        });
    };

    const deleteZone = (zoneId) => {
        const zoneToDelete = drawnZones.find(zone => zone.id === zoneId);
        if (zoneToDelete && zoneToDelete.layer) {
            drawnItemsRef.current.removeLayer(zoneToDelete.layer);
            setDrawnZones([]);
        }
    };

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
                html: `
          <div style="
            background-color: ${employee.routeColor || '#888'}; 
            width: 32px; 
            height: 32px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            color: white; 
            font-weight: bold; 
            font-size: 12px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">${employee.avatar || ''}</div>
        `,
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });
            const marker = window.L.marker([employee.position.lat, employee.position.lng], {
                icon: customIcon,
            }).addTo(mapInstanceRef.current);
            marker.bindPopup(`
        <div style="text-align: center; padding: 8px;">
          <strong>${employee.name}</strong><br>
          <small>${employee.role}</small><br>
          <span style="
            background: ${getStatusColorHex(employee.status)};
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
          ">${employee.status}</span>
        </div>
      `);
            marker.on('click', () => {
                handleEmployeeClick(employee);
            });
            markersRef.current.push(marker);
        });
    };

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
        const loadLeaflet = () => {
            return new Promise((resolve) => {
                if (window.L) {
                    resolve();
                } else {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
                    script.onload = resolve;
                    document.head.appendChild(script);
                }
            });
        };
        const loadLeafletDraw = () => {
            return new Promise((resolve) => {
                if (window.L && window.L.Draw) {
                    resolve();
                } else {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js';
                    script.onload = resolve;
                    document.head.appendChild(script);
                }
            });
        };
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
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (mapInstanceRef.current) {
            setTimeout(() => {
                mapInstanceRef.current.invalidateSize();
            }, 300);
        }
    }, [sidebarVisible]);

    useEffect(() => {
        if (selectedEmployee && mapInstanceRef.current && selectedEmployee.position) {
            mapInstanceRef.current.setView(
                [selectedEmployee.position.lat, selectedEmployee.position.lng],
                15
            );
        }
    }, [selectedEmployee]);

    const handleZoneClick = (zone) => {
        if (zone.type === 'Cercle') {
            const center = zone.coordinates.reduce((acc, point) => {
                acc.lat += point[0] / zone.coordinates.length;
                acc.lng += point[1] / zone.coordinates.length;
                return acc;
            }, { lat: 0, lng: 0 });
            mapInstanceRef.current.setView([center.lat, center.lng], 15);
        } else {
            const bounds = window.L.latLngBounds(zone.coordinates.map(coord => [coord[0], coord[1]]));
            mapInstanceRef.current.fitBounds(bounds);
        }
    };

    return (
        <div className="relative w-full h-full">
            <div ref={mapRef} className="w-full h-full"></div>
            {drawnZones.length > 0 && (
                <ZonePanelToggle show={showZonePanel} onClick={() => setShowZonePanel(!showZonePanel)} />
            )}
            {drawnZones.length > 0 && showZonePanel && (
                <ZonePanel
                    drawnZones={drawnZones}
                    onZoneClick={handleZoneClick}
                    onZoneDelete={deleteZone}
                />
            )}
            {/* Montrer le formulaire de zone UNIQUEMENT pour client */}
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