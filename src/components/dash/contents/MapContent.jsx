import React, { useState, useRef } from 'react';
import { ChevronLeft, Menu } from 'lucide-react';
import EmployeeCard from "./MapContent/EmployeeCard.jsx";
import MapView from "./MapContent/Map/MapView.jsx";
import EmployeeList from "./MapContent/EmployeeList.jsx";

const MapContent = () => {
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [filterText, setFilterText] = useState('');
    const [showEmployeeCard, setShowEmployeeCard] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [cardPosition, setCardPosition] = useState({ x: 40, y: 40 });
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const mapRef = useRef(null);

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
        <div className="flex h-screen bg-gray-50">
            {/* Left Sidebar */}
            <div className={`${sidebarVisible ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden`}>
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
            <div id="map-container" className="flex-1 rounded-md z-30 relative">
                {/* Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute top-20 left-2 z-[1000] bg-white hover:bg-gray-50 shadow-lg rounded-lg p-2 border transition-colors"
                    title={sidebarVisible ? "Masquer le panneau" : "Afficher le panneau"}
                >
                    {sidebarVisible ? (
                        <ChevronLeft size={20} className="text-gray-600" />
                    ) : (
                        <Menu size={20} className="text-gray-600" />
                    )}
                </button>

                {/* Instructions pour le dessin */}
                <div className="absolute top-2 left-1/3 transform -translate-x-1/2 z-[1000] bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 max-w-sm text-sm text-center">
                    Utilisez les outils en haut à droite pour dessiner des zones
                </div>

                <MapView
                    mapRef={mapRef}
                    employees={employees}
                    handleEmployeeClick={handleEmployeeClick}
                    selectedEmployee={selectedEmployee}
                    sidebarVisible={sidebarVisible}
                />

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