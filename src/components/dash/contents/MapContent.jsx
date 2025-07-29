import React, {useState, useRef} from 'react';
import {ChevronLeft, Menu, Info, X} from 'lucide-react';
import EmployeeCard from "./MapContent/EmployeeCard.jsx";
import MapView from "./MapContent/Map/MapView.jsx";
import EmployeeList from "./MapContent/EmployeeList.jsx";
import {useAuth} from "../../../context/AuthContext.jsx";

/**
 * Composant principal qui orchestre la vue de gestion des agents et de la carte.
 * - Contrôle l'affichage de la sidebar, du panneau employé, de la carte, du drag & drop.
 * - Gère la logique d'assignation/déplacement d'agents sur la carte.
 */
const MapContent = () => {
    // États globaux
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [filterText, setFilterText] = useState('');
    const [showEmployeeCard, setShowEmployeeCard] = useState(false);
    const [dragOffset, setDragOffset] = useState({x: 0, y: 0});
    const [isDragging, setIsDragging] = useState(false);
    const [cardPosition, setCardPosition] = useState({x: 40, y: 40});
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [showInstructions, setShowInstructions] = useState(false);
    const mapRef = useRef(null);
    const {user} = useAuth();

    // État pour suivre l'employé en cours de glissement (drag & drop)
    const [draggingEmployee, setDraggingEmployee] = useState(null);

    const [assignedEmployees, setAssignedEmployees] = useState([
        {
            id: 1,
            name: 'Millie Fernandez',
            hours: '7h-18h',
            avatar: 'MF',
            position: {lat: -18.9146, lng: 47.5309}, // Antananarivo coordinates
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
            position: {lat: -18.9200, lng: 47.5400},
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
            position: {lat: -18.9080, lng: 47.5250},
            route: [],
            routeColor: '#ef4444',
            status: 'Occupé',
            distance: '0 km',
            phone: '+1 234 567 8903',
            role: 'Superviseur'
        }
    ]);

    const [unassignedEmployees, setUnassignedEmployees] = useState([
        {
            id: 4,
            name: 'Jean Dupont',
            avatar: 'JD',
            routeColor: '#f59e0b',
            role: 'Technicien de terrain',
            status: 'Disponible',
            phone: '+1 234 567 8904',
            hours: '8h-17h'
        },
        {
            id: 5,
            name: 'Marie Durand',
            avatar: 'MD',
            routeColor: '#8b5cf6',
            role: 'Agent de service',
            status: 'Disponible',
            phone: '+1 234 567 8905',
            hours: '9h-18h'
        }
    ]);

    /**
     * Formate la date au format français.
     */
    const formatDate = (date) =>
        date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

    /**
     * Retourne la couleur CSS d'un statut.
     */
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pause':
                return 'bg-green-500';
            case 'working':
                return 'bg-blue-500';
            case 'disponible':
                return 'bg-green-400';
            case 'break':
                return 'bg-yellow-500';
            case 'completed':
                return 'bg-gray-500';
            case 'transit':
                return 'bg-orange-500';
            case 'occupé':
                return 'bg-red-500';
            default:
                return 'bg-gray-400';
        }
    };

    /**
     * Affiche la fiche détaillée d'un employé.
     */
    const handleEmployeeClick = (employee) => {
        setSelectedEmployee(employee);
        setShowEmployeeCard(true);
    };

    const toggleSidebar = () => setSidebarVisible(!sidebarVisible);
    const toggleInstructions = () => setShowInstructions(!showInstructions);

    // Drag n drop fiche agent
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({x: e.clientX - rect.left, y: e.clientY - rect.top});
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
        setCardPosition({x: newX, y: newY});
    };
    const handleMouseUp = () => setIsDragging(false);

    // Drag n drop agent sur la carte
    const handleDragStart = (employee) => setDraggingEmployee(employee);
    const handleDragEnd = () => setDraggingEmployee(null);

    /**
     * Gère le drop d'un agent sur la carte (depuis la liste).
     */
    const handleEmployeeDrop = (employee, position) => {
        // Si l'employé vient de la liste des non-assignés
        if (!employee.position) {
            const assignedEmployee = {
                ...employee,
                position: {lat: position.lat, lng: position.lng},
                status: 'Disponible',
                distance: '0 km',
                route: []
            };
            setAssignedEmployees([...assignedEmployees, assignedEmployee]);
            setUnassignedEmployees(unassignedEmployees.filter(emp => emp.id !== employee.id));
        } else {
            // Si l'employé est déjà assigné, on met à jour sa position
            setAssignedEmployees(assignedEmployees.map(emp => {
                if (emp.id === employee.id) {
                    return {...emp, position: {lat: position.lat, lng: position.lng}};
                }
                return emp;
            }));
        }
        setDraggingEmployee(null);
    };

    /**
     * Gère le clic direct sur la carte (dépose rapide d’un agent).
     */
    const handleMapClick = (position) => {
        if (draggingEmployee) {
            handleEmployeeDrop(draggingEmployee, position);
        }
    };
    return (
        <div className="flex h-full">
            <div className={`${sidebarVisible ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out bg-white`}>
                <EmployeeList
                    employees={assignedEmployees}
                    unassignedEmployees={unassignedEmployees}
                    filterText={filterText}
                    setFilterText={setFilterText}
                    handleEmployeeClick={handleEmployeeClick}
                    selectedEmployee={selectedEmployee}
                    formatDate={formatDate}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
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
                        <ChevronLeft size={20} className="text-gray-600"/>
                    ) : (
                        <Menu size={20} className="text-gray-600"/>
                    )}
                </button>
                {draggingEmployee && (
                    <div
                        className="absolute top-2  left-[40%] z-50 bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm shadow-md">
                        Déposez {draggingEmployee.name} sur la carte
                    </div>
                )}

                {user.role === "client" && (
                    <div className="absolute top-32 left-2 transform z-[900] flex items-center">
                        {showInstructions ? (
                            <div
                                className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md text-sm flex items-center space-x-2">
                                <span>Utilisez les outils en haut à droite pour dessiner des zones</span>
                                <button onClick={toggleInstructions} className="text-gray-500 hover:text-gray-700">
                                    <X size={16}/>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={toggleInstructions}
                                className="bg-white/90 backdrop-blur-sm rounded-full p-2"
                                title="Afficher les instructions"
                            >
                                <Info size={18} className="text-gray-700 hover:text-orange-500"/>
                            </button>
                        )}
                    </div>
                )}
                {/* Carte */}
                <div className="w-full border relative z-10 h-full rounded-lg overflow-hidden">
                    <MapView
                        mapRef={mapRef}
                        employees={assignedEmployees}
                        handleEmployeeClick={handleEmployeeClick}
                        selectedEmployee={selectedEmployee}
                        sidebarVisible={sidebarVisible}
                        draggingEmployee={draggingEmployee}
                        onEmployeeDrop={handleEmployeeDrop}
                        onMapClick={handleMapClick}
                    />
                </div>
                {/* Fiche agent flottante */}
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