import React, { useEffect, useRef } from 'react';

const MapView = ({
                     mapRef,
                     employees,
                     handleEmployeeClick,
                     selectedEmployee,
                     sidebarVisible
                 }) => {
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    const getStatusColorHex = (status) => {
        switch (status.toLowerCase()) {
            case 'on the way': return '#10b981';
            case 'working': return '#3b82f6';
            case 'available': return '#22c55e';
            case 'break': return '#eab308';
            case 'completed': return '#6b7280';
            case 'transit': return '#f97316';
            case 'off duty': return '#ef4444';
            default: return '#9ca3af';
        }
    };

    const initializeMap = () => {
        if (mapRef.current && window.L && !mapInstanceRef.current) {
            // Initialize map centered on Antananarivo
            mapInstanceRef.current = window.L.map(mapRef.current).setView([-18.9146, 47.5309], 13);

            // Add OpenStreetMap tiles
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapInstanceRef.current);

            // Add employee markers
            addEmployeeMarkers();
        }
    };

    const addEmployeeMarkers = () => {
        if (!window.L || !mapInstanceRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => {
            if (marker && mapInstanceRef.current.hasLayer(marker)) {
                mapInstanceRef.current.removeLayer(marker);
            }
        });
        markersRef.current = [];

        employees.forEach(employee => {
            // Create custom icon
            const customIcon = window.L.divIcon({
                html: `
          <div style="
            background-color: ${employee.routeColor}; 
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
          ">${employee.avatar}</div>
        `,
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            // Add marker
            const marker = window.L.marker([employee.position.lat, employee.position.lng], {
                icon: customIcon
            }).addTo(mapInstanceRef.current);

            // Add popup
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

            // Add click event
            marker.on('click', () => {
                handleEmployeeClick(employee);
            });

            // Add route if exists
            if (employee.route.length > 0) {
                const polyline = window.L.polyline(employee.route, {
                    color: employee.routeColor,
                    weight: 4,
                    opacity: 0.7,
                    dashArray: employee.status === 'Working' ? null : '10, 10'
                }).addTo(mapInstanceRef.current);

                markersRef.current.push(polyline);
            }

            markersRef.current.push(marker);
        });

        // Add sample location pin
        const locationIcon = window.L.divIcon({
            html: `
        <div style="
          background-color: #2563eb; 
          width: 24px; 
          height: 24px; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">📍</div>
      `,
            className: '',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        const locationMarker = window.L.marker([-18.9100, 47.5200], {
            icon: locationIcon
        }).addTo(mapInstanceRef.current);

        locationMarker.bindPopup('<div style="text-align: center;"><strong>12 One Tree Hill</strong></div>');
        markersRef.current.push(locationMarker);
    };

    // Initialize Leaflet map
    useEffect(() => {
        // Only initialize if not already initialized
        if (mapInstanceRef.current) return;

        // Check if Leaflet CSS is already loaded
        if (!document.querySelector('link[href*="leaflet.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
            document.head.appendChild(link);
        }

        // Check if Leaflet JS is already loaded
        if (!window.L) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
            script.onload = initializeMap;
            document.head.appendChild(script);
        } else {
            initializeMap();
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update map size when sidebar visibility changes
    useEffect(() => {
        if (mapInstanceRef.current) {
            // Small delay to ensure DOM has updated
            setTimeout(() => {
                mapInstanceRef.current.invalidateSize();
            }, 300);
        }
    }, [sidebarVisible]);

    // Center map on selected employee
    useEffect(() => {
        if (selectedEmployee && mapInstanceRef.current) {
            mapInstanceRef.current.setView(
                [selectedEmployee.position.lat, selectedEmployee.position.lng],
                15
            );
        }
    }, [selectedEmployee]);

    return <div ref={mapRef} className="w-full h-full"></div>;
};

export default MapView;