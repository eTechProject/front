import React, { useEffect, useRef } from 'react';
import { X, FileBarChart } from 'lucide-react';

const TaskMapModal = ({
                          task,
                          isOpen,
                          onClose,
                          source = 'unknown' // 'client-dashboard' ou 'agent-dashboard'
                      }) => {
    const modalRef = useRef(null);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.keyCode === 27) {
                onClose();
            }
        };

        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Get task coordinates
    const getTaskCoordinates = () => {
        if (!task?.assignPosition || !Array.isArray(task.assignPosition) || task.assignPosition.length < 2) {
            return null;
        }
        return {
            lat: task.assignPosition[0],
            lng: task.assignPosition[1]
        };
    };

    // Initialize map
    const initializeMap = () => {
        const coordinates = getTaskCoordinates();
        if (!mapRef.current || !window.L || mapInstanceRef.current || !coordinates) return;

        const { lat, lng } = coordinates;

        // Create map instance
        mapInstanceRef.current = window.L.map(mapRef.current, {
            maxZoom: 19,
            minZoom: 3,
            zoomControl: true,
            bounceAtZoomLimits: false,
            worldCopyJump: false,
        }).setView([lat, lng], 16);

        // Add tile layer
        const osmLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        });

        const satelliteLayer = window.L.tileLayer(
            'https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg',
            {
                minZoom: 0,
                maxZoom: 19,
                attribution: '&copy; Stadia Maps &copy; OpenMapTiles &copy; OpenStreetMap contributors',
            }
        );

        osmLayer.addTo(mapInstanceRef.current);

        // Add layer control
        const baseMaps = {
            "Vue Classique (OSM)": osmLayer,
            "Vue Satellite": satelliteLayer,
        };

        window.L.control.layers(baseMaps, {}, { position: 'topright' })
            .addTo(mapInstanceRef.current);

        // Add marker for task location
        const taskIcon = window.L.divIcon({
            html: `<div style="
                background-color: #ef4444;
                width: 32px; 
                height: 32px; 
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                animation: pulse 2s infinite;
            ">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
            </div>`,
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });

        markerRef.current = window.L.marker([lat, lng], { icon: taskIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(`
                <div style="text-align: center; padding: 8px;">
                    <strong>Localisation de la tâche</strong><br>
                    <small>${task.description || 'Tâche'}</small><br>
                    <span style="background: #ef4444; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">
                        ${task.status}
                    </span><br>
                    <small class="text-gray-500">Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}</small>
                </div>
            `)
            .openPopup();

        // Add CSS for pulse animation if not already present
        if (!document.getElementById('pulse-animation')) {
            const style = document.createElement('style');
            style.id = 'pulse-animation';
            style.textContent = `
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    };

    // Load Leaflet dependencies and initialize map
    useEffect(() => {
        const coordinates = getTaskCoordinates();
        if (!isOpen || !coordinates) return;

        const loadLeafletCSS = () => {
            if (!document.querySelector('link[href*="leaflet.css"]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
                document.head.appendChild(link);
            }
        };

        const loadLeaflet = () => new Promise((resolve) => {
            if (window.L) return resolve();
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });

        loadLeafletCSS();
        loadLeaflet().then(() => {
            setTimeout(initializeMap, 100);
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
    }, [isOpen, task]);

    // Resize map when modal opens
    useEffect(() => {
        const coordinates = getTaskCoordinates();
        if (isOpen && mapInstanceRef.current && coordinates) {
            setTimeout(() => {
                mapInstanceRef.current.invalidateSize();
                mapInstanceRef.current.setView([coordinates.lat, coordinates.lng], 16);
            }, 300);
        }
    }, [isOpen, task]);

    if (!isOpen || !task) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'patrouille':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleGenerateReport = () => {
        alert(`Rapport généré!\n\nSource: ${source}\nTâche: ${task.taskId?.substring(0, 8)}\nStatut: ${task.status}`);
    };

    const coordinates = getTaskCoordinates();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
                ref={modalRef}
                className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 mb-1">
                            Localisation de la tâche
                        </h2>
                        <p className="text-sm text-gray-600">
                            {task.description || 'Aucune description'}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {/* Bouton de rapport */}
                        <button
                            onClick={handleGenerateReport}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            title="Générer un rapport"
                        >
                            <FileBarChart className="h-4 w-4 mr-2" />
                            Rapport
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col lg:flex-row h-[70vh]">
                    {/* Task Info Panel */}
                    <div className="lg:w-1/3 p-6 border-r border-gray-200 overflow-y-auto">
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">Informations de la tâche</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Source:</span>
                                        <span className="text-xs text-blue-600 font-medium">
                                            {source === 'client-dashboard' ? '👔 Client' : source === 'agent-dashboard' ? '👤 Agent' : '❓ Inconnue'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">ID Tâche:</span>
                                        <span className="text-xs text-gray-500 font-mono">
                                            {task.taskId?.substring(0, 8)}...
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Statut:</span>
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(task.status)}`}>
                                            {task.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Type:</span>
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getTypeColor(task.type)}`}>
                                            {task.type}
                                        </span>
                                    </div>
                                    {task.startDate && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Début:</span>
                                            <span className="text-sm text-gray-900">
                                                {new Date(task.startDate).toLocaleString('fr-FR')}
                                            </span>
                                        </div>
                                    )}
                                    {task.endDate && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Fin:</span>
                                            <span className="text-sm text-gray-900">
                                                {new Date(task.endDate).toLocaleString('fr-FR')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {task.orderDescription && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Description de l'ordre</h4>
                                    <p className="text-sm text-gray-600">{task.orderDescription}</p>
                                </div>
                            )}

                            {task.orderId && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">ID Ordre</h4>
                                    <p className="text-xs text-gray-500 font-mono break-all">
                                        {task.orderId}
                                    </p>
                                </div>
                            )}

                            {coordinates && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Coordonnées</h4>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <div>Latitude: {coordinates.lat.toFixed(6)}</div>
                                        <div>Longitude: {coordinates.lng.toFixed(6)}</div>
                                    </div>
                                </div>
                            )}

                            {/* Info sur le rapport */}
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-1 text-sm flex items-center">
                                    <FileBarChart className="h-4 w-4 mr-1" />
                                    Rapport disponible
                                </h4>
                                <p className="text-xs text-blue-700">
                                    Cliquez sur "Rapport" pour générer un rapport de cette consultation.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Map Panel */}
                    <div className="lg:w-2/3 relative">
                        {coordinates ? (
                            <div ref={mapRef} className="w-full h-full" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <div className="text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune localisation</h3>
                                    <p className="mt-1 text-sm text-gray-500">Cette tâche n'a pas de coordonnées assignées.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskMapModal;