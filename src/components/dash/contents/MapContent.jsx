import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Menu, Info, X, Check } from 'lucide-react';
import EmployeeCard from "./MapContent/EmployeeCard.jsx";
import MapView from "./MapContent/Map/MapView.jsx";
import EmployeeList from "./MapContent/EmployeeList.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useZone } from "../../../hooks/useZone.js";

const MapContent = () => {
    // États pour l'interface utilisateur
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [filterText, setFilterText] = useState('');
    const [showEmployeeCard, setShowEmployeeCard] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [showInstructions, setShowInstructions] = useState(false);

    // États pour le drag & drop de la fiche employé
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [cardPosition, setCardPosition] = useState({ x: 40, y: 40 });

    // États pour les affectations en attente
    const [pendingAssignments, setPendingAssignments] = useState([]);
    const [showPendingAssignments, setShowPendingAssignments] = useState(false);

    // État pour le drag & drop des employés sur la carte
    const [draggingEmployee, setDraggingEmployee] = useState(null);

    // Référence à la carte et contexte d'authentification
    const mapRef = useRef(null);
    const { user } = useAuth();

    // Données des employés
    const [assignedEmployees, setAssignedEmployees] = useState([]);
    const [unassignedEmployees, setUnassignedEmployees] = useState([]);

    // Hook pour les opérations sur les zones
    const { getAvailableAgent, sendAssignment, isLoading, error, success } = useZone();

    // Formatte une date au format français
    const formatDate = (date) => date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Retourne la couleur CSS selon le statut d'un employé
    const getStatusColor = (status) => {
        const statusLower = status?.toLowerCase();
        return {
            'pause': 'bg-green-500', 'working': 'bg-blue-500', 'disponible': 'bg-green-400',
            'break': 'bg-yellow-500', 'completed': 'bg-gray-500', 'transit': 'bg-orange-500',
            'occupé': 'bg-red-500'
        }[statusLower] || 'bg-gray-400';
    };

    // Charge les agents disponibles depuis l'API ou utilise les données fictives
    useEffect(() => {
        const fetchAgents = async () => {
            const result = await getAvailableAgent();

            if (result.success && result.data && result.data.length > 0) {
                // Formatage des données de l'API
                const formattedAgents = result.data.map(agent => ({
                    id: agent.agentId,
                    name: agent.user.name,
                    avatar: agent.user.name.split(' ').map(n => n[0]).join(''),
                    email: agent.user.email,
                    role: 'Agent de terrain',
                    status: 'Disponible',
                    routeColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
                    position: null // Non assigné par défaut
                }));

                setUnassignedEmployees(formattedAgents);
            } else {
                // Fallback sur les données fictives si l'API ne retourne rien
                console.log("Utilisation des données fictives car l'API n'a retourné aucun agent");
                setAssignedEmployees([
                    { id: 1, name: 'Millie Fernandez', hours: '7h-18h', avatar: 'MF', position: { lat: -18.9146, lng: 47.5309 }, route: [[-18.9146, 47.5309], [-18.9120, 47.5350], [-18.9100, 47.5380]], routeColor: '#10b981', status: 'Pause', distance: '2.3 km', phone: '+1 234 567 8901', role: 'Technicien de terrain' },
                    { id: 2, name: 'Riley Cooper', hours: '7h-18h', avatar: 'RC', position: { lat: -18.9200, lng: 47.5400 }, route: [[-18.9200, 47.5400], [-18.9180, 47.5420], [-18.9160, 47.5450]], routeColor: '#3b82f6', status: 'Disponible', distance: '1.8 km', phone: '+1 234 567 8902', role: 'Agent de service' },
                    { id: 3, name: 'Nawf El Azam', hours: '7h-18h', avatar: 'NA', position: { lat: -18.9080, lng: 47.5250 }, route: [], routeColor: '#ef4444', status: 'Occupé', distance: '0 km', phone: '+1 234 567 8903', role: 'Superviseur' }
                ]);
                setUnassignedEmployees([
                    { id: 4, name: 'Jean Dupont', avatar: 'JD', routeColor: '#f59e0b', role: 'Technicien de terrain', status: 'Disponible', phone: '+1 234 567 8904', hours: '8h-17h' },
                    { id: 5, name: 'Marie Durand', avatar: 'MD', routeColor: '#8b5cf6', role: 'Agent de service', status: 'Disponible', phone: '+1 234 567 8905', hours: '9h-18h' }
                ]);
            }
        };

        fetchAgents();
    }, []);

    // Affiche la fiche détaillée d'un employé sélectionné
    const handleEmployeeClick = (employee) => {
        setSelectedEmployee(employee);
        setShowEmployeeCard(true);
    };

    // Bascule la visibilité de la sidebar
    const toggleSidebar = () => setSidebarVisible(prev => !prev);

    // Bascule l'affichage des instructions pour le client
    const toggleInstructions = () => setShowInstructions(prev => !prev);

    // Gère le début du déplacement de la fiche employé (drag)
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    // Met à jour la position de la fiche employé pendant le déplacement
    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const container = document.getElementById('map-container');
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const newX = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, rect.width - 320));
        const newY = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, rect.height - 400));
        setCardPosition({ x: newX, y: newY });
    };

    // Termine le déplacement de la fiche employé
    const handleMouseUp = () => setIsDragging(false);

    // Initialise le drag & drop d'un employé sur la carte
    const handleDragStart = (employee) => setDraggingEmployee(employee);

    // Termine le drag & drop d'un employé
    const handleDragEnd = () => setDraggingEmployee(null);

    // Gère le dépôt d'un employé sur la carte et crée une affectation en attente
    const handleEmployeeDrop = (employee, position, zoneInfo) => {
        const newAssignment = {
            id: Date.now(),
            employeeId: employee.id,
            employeeName: employee.name,
            employeeAvatar: employee.avatar,
            employeeColor: employee.routeColor,
            coordinates: { lat: position.lat, lng: position.lng },
            timestamp: new Date().toISOString(),
            zoneInfo: zoneInfo || null,
            isNewAssignment: !employee.position,
            previousPosition: employee.position
        };
        setPendingAssignments(prev => [...prev, newAssignment]);
        setShowPendingAssignments(true);
        setDraggingEmployee(null);
    };

    // Confirme toutes les affectations en attente et met à jour les états
    const confirmAssignments = async () => {
        if (!pendingAssignments.length) return console.log('Aucune affectation à confirmer');

        const orderId = pendingAssignments[0].zoneInfo?.serviceOrderId;
        if (!orderId) return console.log('Order ID non trouvé');

        const agentAssignments = pendingAssignments.map(({ employeeId, coordinates }) => ({
            agentId: employeeId.toString(),
            coordinates: [parseFloat(coordinates.lat.toFixed(6)), parseFloat(coordinates.lng.toFixed(6))]
        }));

        const assignmentData = {
            orderId,
            agentAssignments
        };

        console.log('Données à envoyer:', JSON.stringify(assignmentData, null, 2));

        // Envoi des affectations à l'API
        const result = await sendAssignment(assignmentData);

        if (result.success) {
            console.log('Affectations confirmées avec succès:', result.data);

            // Mise à jour locale des employés
            pendingAssignments.forEach(assignment => {
                if (assignment.isNewAssignment) {
                    const employee = unassignedEmployees.find(emp => emp.id === assignment.employeeId);
                    setAssignedEmployees(prev => [...prev, {
                        ...employee,
                        position: assignment.coordinates,
                        status: 'Disponible',
                        distance: '0 km',
                        route: []
                    }]);
                    setUnassignedEmployees(prev => prev.filter(emp => emp.id !== assignment.employeeId));
                } else {
                    setAssignedEmployees(prev => prev.map(emp =>
                        emp.id === assignment.employeeId ? { ...emp, position: assignment.coordinates } : emp
                    ));
                }
            });

            setPendingAssignments([]);
            setShowPendingAssignments(false);
        } else {
            console.error('Erreur lors de la confirmation des affectations:', result.error);
        }
    };

    // Annule toutes les affectations en attente
    const cancelAssignments = () => {
        setPendingAssignments([]);
        setShowPendingAssignments(false);
    };

    // Gère un clic sur la carte pour déposer un employé en drag
    const handleMapClick = (position, zoneInfo) => {
        if (draggingEmployee) handleEmployeeDrop(draggingEmployee, position, zoneInfo);
    };

    return (
        <div className="flex h-full">
            {/* Sidebar des employés */}
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

            {/* Zone principale avec la carte */}
            <div id="map-container" className="flex-1 relative overflow-hidden">
                <button
                    onClick={toggleSidebar}
                    className="absolute top-20 left-2 z-20 bg-white backdrop-blur-sm hover:bg-gray-50 rounded-lg p-2 border transition-colors"
                    title={sidebarVisible ? "Masquer le panneau" : "Afficher le panneau"}
                >
                    {sidebarVisible ? <ChevronLeft size={20} className="text-gray-600" /> : <Menu size={20} className="text-gray-600" />}
                </button>

                {draggingEmployee && (
                    <div className="absolute top-2 left-[40%] z-50 bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm shadow-md">
                        Déposez {draggingEmployee.name} sur la carte
                    </div>
                )}

                {user.role === "client" && (
                    <div className="absolute top-32 left-2 z-[900] flex items-center">
                        {showInstructions ? (
                            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md text-sm flex items-center space-x-2">
                                <span>Utilisez les outils en haut à droite pour dessiner des zones</span>
                                <button onClick={toggleInstructions} className="text-gray-500 hover:text-gray-700">
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <button onClick={toggleInstructions} className="bg-white/90 backdrop-blur-sm rounded-full p-2" title="Afficher les instructions">
                                <Info size={18} className="text-gray-700 hover:text-orange-500" />
                            </button>
                        )}
                    </div>
                )}

                {showPendingAssignments && pendingAssignments.length > 0 && (
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-2xl w-full">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">Affectations en attente ({pendingAssignments.length})</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={confirmAssignments}
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Envoi...' : (
                                        <>
                                            <Check size={16} /> Confirmer
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={cancelAssignments}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm flex items-center gap-1"
                                    disabled={isLoading}
                                >
                                    <X size={16} /> Annuler
                                </button>
                            </div>
                        </div>
                        {error && (
                            <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">
                                Erreur: {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-3 p-2 bg-green-100 text-green-700 rounded text-sm">
                                Affectations envoyées avec succès!
                            </div>
                        )}
                        <div className="max-h-60 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {pendingAssignments.map(assignment => (
                                    <tr key={assignment.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: assignment.employeeColor }}>
                                                    {assignment.employeeAvatar}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{assignment.employeeName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                            {assignment.coordinates.lat.toFixed(5)}, {assignment.coordinates.lng.toFixed(5)}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                            {assignment.zoneInfo?.zoneName || 'Non spécifiée'}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${assignment.isNewAssignment ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {assignment.isNewAssignment ? 'Nouvelle affectation' : 'Déplacement'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

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