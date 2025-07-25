import React, { useState, useRef } from 'react';
import { ChevronLeft, Menu, Info, X } from 'lucide-react';
import EmployeeCard from "./MapContent/EmployeeCard.jsx";
import MapView from "./MapContent/Map/MapView.jsx";
import EmployeeList from "./MapContent/EmployeeList.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";

const MapContent = () => {
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [filterText, setFilterText] = useState('');
    const [showEmployeeCard, setShowEmployeeCard] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [cardPosition, setCardPosition] = useState({ x: 40, y: 40 });
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [showInstructions, setShowInstructions] = useState(false);
    const mapRef = useRef(null);
    const { user } = useAuth();

    const employees = [
        {
            id: 1,
            name: 'Millie Fernandez',
            hours: '7h-18h',
            avatar: 'MF',
            position: { lat: -18.9146, lng: 47.5309 }, // Antananarivo coordinates
            route: [
                [-18.9146, 47.5309],
                [-18.9120, 47.5350],
                [-18.9100, 47.5380]
            ],
            routeColor: '#10b981',
            status: 'Pause',
            distance: '2.3 km',
            phone: '+1 234 567 8901',
            role: 'Technicien de terrain'
        },
        {
            id: 2,
            name: 'Riley Cooper',
            hours: '7h-18h',
            avatar: 'RC',
            position: { lat: -18.9200, lng: 47.5400 },
            route: [
                [-18.9200, 47.5400],
                [-18.9180, 47.5420],
                [-18.9160, 47.5450]
            ],
            routeColor: '#3b82f6',
            status: 'Disponible',
            distance: '1.8 km',
            phone: '+1 234 567 8902',
            role: 'Agent de service'
        },
        {
            id: 3,
            name: 'Nawf El Azam',
            hours: '7h-18h',
            avatar: 'NA',
            position: { lat: -18.9080, lng: 47.5250 },
            route: [],
            routeColor: '#ef4444',
            status: 'Occupé',
            distance: '0 km',
            phone: '+1 234 567 8903',
            role: 'Superviseur'
        }
    ];

    const formatDate = (date) => {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pause': return 'bg-green-500';
            case 'working': return 'bg-blue-500';
            case 'disponible': return 'bg-green-400';
            case 'break': return 'bg-yellow-500';
            case 'completed': return 'bg-gray-500';
            case 'transit': return 'bg-orange-500';
            case 'occupé': return 'bg-red-500';
            default: return 'bg-gray-400';
        }
    };

    const handleEmployeeClick = (employee) => {
        setSelectedEmployee(employee);
        setShowEmployeeCard(true);
    };

    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
    };

    const toggleInstructions = () => {
        setShowInstructions(!showInstructions);
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);

        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        e.preventDefault();
        const container = document.getElementById('map-container');
        const containerRect = container.getBoundingClientRect();

        let newX = e.clientX - containerRect.left - dragOffset.x;
        let newY = e.clientY - containerRect.top - dragOffset.y;

        // Constrain to container bounds
        const cardWidth = 320;
        const cardHeight = 400;
        newX = Math.max(0, Math.min(newX, containerRect.width - cardWidth));
        newY = Math.max(0, Math.min(newY, containerRect.height - cardHeight));

        setCardPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Filter employees based on search text
    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <div className="flex h-full">
            <div className={`${sidebarVisible ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden bg-white`}>
                <EmployeeList
                    employees={filteredEmployees}
                    filterText={filterText}
                    setFilterText={setFilterText}
                    handleEmployeeClick={handleEmployeeClick}
                    selectedEmployee={selectedEmployee}
                    formatDate={formatDate}
                />
            </div>

            {/* Main Map Area */}
            <div id="map-container" className="flex-1 relative overflow-hidden">
                <button
                    onClick={toggleSidebar}
                    className="absolute top-20 left-2 z-20 bg-white backdrop-blur-sm hover:bg-gray-50 rounded-lg p-2 border transition-colors"
                    title={sidebarVisible ? "Masquer le panneau" : "Afficher le panneau"}
                >
                    {sidebarVisible ? (
                        <ChevronLeft size={20} className="text-gray-600" />
                    ) : (
                        <Menu size={20} className="text-gray-600" />
                    )}
                </button>

                {/* Instructions pour le dessin avec icône d'info */}
                {user.role === "client" && (
                    <div className="absolute top-32 left-2 transform z-[900] flex items-center">
                        {showInstructions ? (
                            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md text-sm flex items-center space-x-2">
                                <span>Utilisez les outils en haut à droite pour dessiner des zones</span>
                                <button
                                    onClick={toggleInstructions}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={toggleInstructions}
                                className="bg-white/90 backdrop-blur-sm rounded-full p-2"
                                title="Afficher les instructions"
                            >
                                <Info size={18} className="text-gray-700 hover:text-orange-500" />
                            </button>
                        )}
                    </div>
                )}

                {/* Contenu de la carte */}
                <div className="w-full border relative z-10 h-full rounded-lg overflow-hidden">
                    <MapView
                        mapRef={mapRef}
                        employees={employees}
                        handleEmployeeClick={handleEmployeeClick}
                        selectedEmployee={selectedEmployee}
                        sidebarVisible={sidebarVisible}
                    />
                </div>

                {/* Selected Employee Detail Card */}
                {showEmployeeCard && selectedEmployee && (
                    <EmployeeCard
                        employee={selectedEmployee}
                        onClose={() => setShowEmployeeCard(false)}
                        position={cardPosition}
                        isDragging={isDragging}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        getStatusColor={getStatusColor}
                    />
                )}
            </div>
        </div>
    );
};

export default MapContent;