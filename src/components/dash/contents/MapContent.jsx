import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Menu, Info, X, Check } from 'lucide-react';
import EmployeeCard from "./MapContent/EmployeeCard.jsx";
import MapView from "./MapContent/Map/MapView.jsx";
import EmployeeList from "./MapContent/EmployeeList.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useZone } from "../../../hooks/useZone.js";

const MapContent = () => {
    // UI States
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [filterText, setFilterText] = useState('');
    const [showEmployeeCard, setShowEmployeeCard] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [showInstructions, setShowInstructions] = useState(false);

    // Employee card drag states
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [cardPosition, setCardPosition] = useState({ x: 40, y: 40 });

    // Assignment states
    const [pendingAssignments, setPendingAssignments] = useState([]);
    const [showPendingAssignments, setShowPendingAssignments] = useState(false);
    const [draggingEmployee, setDraggingEmployee] = useState(null);

    // References and context
    const mapRef = useRef(null);
    const { user } = useAuth();

    // Zone data states
    const [zoneData, setZoneData] = useState(null);
    const [zoneLoaded, setZoneLoaded] = useState(false);
    const [zoneAssignedAgents, setZoneAssignedAgents] = useState([]);

    // Employee data states
    const [assignedEmployees, setAssignedEmployees] = useState([]);
    const [unassignedEmployees, setUnassignedEmployees] = useState([]);

    // Zone operations hook
    const { getAvailableAgent, sendAssignment, getZone, isLoading, error, success } = useZone();

    // Format date to French locale
    const formatDate = (date) => date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Get CSS color class based on employee status
    const getStatusColor = (status) => {
        const statusLower = status?.toLowerCase() || '';
        const statusMap = {
            'pause': 'bg-green-500',
            'working': 'bg-blue-500',
            'disponible': 'bg-green-400',
            'break': 'bg-yellow-500',
            'completed': 'bg-gray-500',
            'transit': 'bg-orange-500',
            'occupé': 'bg-red-500',
            'inactif': 'bg-gray-400',
            'actif': 'bg-green-500',
            'en mission': 'bg-blue-500',
            'pending': 'bg-yellow-500'
        };

        return statusMap[statusLower] || 'bg-gray-400';
    };

    // Extract coordinates from text like "[-18.123, 47.456]"
    const extractCoordinates = (text) => {
        if (!text) return null;
        const coordMatch = text.match(/\[([-\d.]+),\s*([-\d.]+)\]/);
        if (coordMatch && coordMatch.length >= 3) {
            return {
                lat: parseFloat(coordMatch[1]),
                lng: parseFloat(coordMatch[2])
            };
        }
        return null;
    };

    // Load available agents from API
    useEffect(() => {
        const fetchAgents = async () => {
            const result = await getAvailableAgent();

            if (result.success && result.data?.length > 0) {
                const formattedAgents = result.data.map(agent => ({
                    id: agent.agentId,
                    name: agent.user.name,
                    avatar: agent.user.name.split(' ').map(n => n[0]).join(''),
                    email: agent.user.email,
                    role: 'Agent de terrain',
                    status: 'Disponible',
                    routeColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
                    position: null,
                    phone: agent.user.phone || 'Non renseigné',
                }));

                setUnassignedEmployees(formattedAgents);
            } else {
                console.log("Aucun agent disponible n'a été trouvé via l'API");
            }
        };

        fetchAgents().then();
    }, []);

    // Load zone data from API
    useEffect(() => {
        const loadZoneData = async () => {
            if (!user?.userId || zoneLoaded) return;

            try {
                setZoneLoaded(true);
                const result = await getZone(user.userId);

                if (result.success && result.data) {
                    console.log("Zone chargée:", result.data);
                    setZoneData(result.data);

                    // Format assigned agents if available
                    if (result.data.assignedAgents?.length > 0) {
                        const formattedZoneAgents = result.data.assignedAgents
                            .filter(assignedAgent => assignedAgent.agent?.user)
                            .map(assignedAgent => {
                                const agent = assignedAgent.agent;
                                const user = agent.user;
                                const name = user.name || "Agent inconnu";
                                const initials = name.split(' ').map(n => n[0]).join('');

                                // Get position from task or current position
                                let position = null;

                                // First check if task has assignPosition
                                if (assignedAgent.task?.assignPosition &&
                                    Array.isArray(assignedAgent.task.assignPosition) &&
                                    assignedAgent.task.assignPosition.length === 2) {
                                    position = {
                                        lat: assignedAgent.task.assignPosition[0],
                                        lng: assignedAgent.task.assignPosition[1]
                                    };
                                }
                                // If not, try extracting from description
                                else if (assignedAgent.task?.description) {
                                    position = extractCoordinates(assignedAgent.task.description);
                                }
                                // Lastly, check currentPosition
                                else if (assignedAgent.currentPosition &&
                                    Array.isArray(assignedAgent.currentPosition) &&
                                    assignedAgent.currentPosition.length === 2) {
                                    position = {
                                        lat: assignedAgent.currentPosition[0],
                                        lng: assignedAgent.currentPosition[1]
                                    };
                                }

                                return {
                                    id: agent.agentId,
                                    assignmentId: assignedAgent.id, // Store the assignment ID
                                    name: name,
                                    avatar: initials,
                                    email: user.email,
                                    role: 'Agent assigné',
                                    status: assignedAgent.status || assignedAgent.task?.status || 'Inactif',
                                    routeColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
                                    position: position,
                                    task: assignedAgent.task,
                                    taskDescription: assignedAgent.task?.description || '',
                                    phone: user.phone || 'Non renseigné',
                                    address: agent.address,
                                    sexe: agent.sexe
                                };
                            });

                        setZoneAssignedAgents(formattedZoneAgents);

                        // Add to assigned employees list with additional UI-specific data
                        const assignedAgentsFromAPI = formattedZoneAgents.map(agent => ({
                            ...agent,
                            distance: '0 km',
                            route: []
                        }));

                        // Update assigned employees without duplicates
                        setAssignedEmployees(prev => {
                            const existingIds = prev.map(emp => emp.id);
                            const newAgents = assignedAgentsFromAPI.filter(agent => !existingIds.includes(agent.id));
                            return [...prev, ...newAgents];
                        });

                        // Remove these agents from unassigned list
                        const assignedIds = assignedAgentsFromAPI.map(agent => agent.id);
                        setUnassignedEmployees(prev => prev.filter(emp => !assignedIds.includes(emp.id)));
                    }
                }
            } catch (error) {
                console.error("Erreur lors du chargement des zones:", error);
            }
        };

        loadZoneData().then();
    }, [user?.userId]);

    // Show employee details card
    const handleEmployeeClick = (employee) => {
        setSelectedEmployee(employee);
        setShowEmployeeCard(true);
    };

    // Toggle sidebar visibility
    const toggleSidebar = () => setSidebarVisible(prev => !prev);

    // Toggle instructions display
    const toggleInstructions = () => setShowInstructions(prev => !prev);

    // Handle employee card drag start
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    // Update employee card position during drag
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

    // End employee card drag
    const handleMouseUp = () => setIsDragging(false);

    // Start employee drag onto map
    const handleDragStart = (employee) => setDraggingEmployee(employee);

    // End employee drag
    const handleDragEnd = () => setDraggingEmployee(null);

    // Handle employee drop on map
    const handleEmployeeDrop = (employee, position, zoneInfo) => {
        const zoneInfoToUse = zoneInfo || (zoneData ? {
            serviceOrderId: zoneData.serviceOrder?.id,
            securedZoneId: zoneData.securedZone?.securedZoneId,
            zoneName: zoneData.securedZone?.name
        } : null);

        if (!zoneInfoToUse) {
            console.warn("Pas d'information de zone disponible pour l'affectation");
            return;
        }

        const newAssignment = {
            id: Date.now(),
            employeeId: employee.id,
            employeeName: employee.name,
            employeeAvatar: employee.avatar,
            employeeColor: employee.routeColor,
            coordinates: { lat: position.lat, lng: position.lng },
            timestamp: new Date().toISOString(),
            zoneInfo: zoneInfoToUse,
            isNewAssignment: !employee.position,
            previousPosition: employee.position
        };

        setPendingAssignments(prev => [...prev, newAssignment]);
        setShowPendingAssignments(true);
        setDraggingEmployee(null);
    };

    // Confirm all pending assignments
    const confirmAssignments = async () => {
        if (!pendingAssignments.length) {
            console.log('Aucune affectation à confirmer');
            return;
        }

        const orderId = pendingAssignments[0].zoneInfo?.serviceOrderId;
        if (!orderId) {
            console.log('Order ID non trouvé');
            return;
        }

        const agentAssignments = pendingAssignments.map(({ employeeId, coordinates }) => ({
            agentId: employeeId.toString(),
            coordinates: [
                parseFloat(coordinates.lat.toFixed(6)),
                parseFloat(coordinates.lng.toFixed(6))
            ]
        }));

        const assignmentData = { orderId, agentAssignments };
        console.log('Données à envoyer:', JSON.stringify(assignmentData, null, 2));

        const result = await sendAssignment(assignmentData);

        if (result.success) {
            console.log('Affectations confirmées avec succès:', result.data);

            // Update local employee states
            pendingAssignments.forEach(assignment => {
                if (assignment.isNewAssignment) {
                    const employee = unassignedEmployees.find(emp => emp.id === assignment.employeeId);
                    if (employee) {
                        setAssignedEmployees(prev => [...prev, {
                            ...employee,
                            position: assignment.coordinates,
                            status: 'En mission',
                            distance: '0 km',
                            route: []
                        }]);
                        setUnassignedEmployees(prev =>
                            prev.filter(emp => emp.id !== assignment.employeeId)
                        );
                    }
                } else {
                    setAssignedEmployees(prev => prev.map(emp =>
                        emp.id === assignment.employeeId
                            ? { ...emp, position: assignment.coordinates }
                            : emp
                    ));
                }
            });

            setPendingAssignments([]);
            setShowPendingAssignments(false);
        } else {
            console.error('Erreur lors de la confirmation des affectations:', result.error);
        }
    };

    // Cancel all pending assignments
    const cancelAssignments = () => {
        setPendingAssignments([]);
        setShowPendingAssignments(false);
    };

    // Handle map click for employee drop
    const handleMapClick = (position, zoneInfo) => {
        if (draggingEmployee) {
            handleEmployeeDrop(draggingEmployee, position, zoneInfo);
        }
    };

    return (
        <div className="flex h-full">
            {/* Employee sidebar */}
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

            {/* Main map area */}
            <div id="map-container" className="flex-1 relative overflow-hidden">
                <button
                    onClick={toggleSidebar}
                    className="absolute top-20 left-2 z-20 bg-white backdrop-blur-sm hover:bg-gray-50 rounded-lg p-2 border transition-colors"
                    title={sidebarVisible ? "Masquer le panneau" : "Afficher le panneau"}
                >
                    {sidebarVisible ?
                        <ChevronLeft size={20} className="text-gray-600" /> :
                        <Menu size={20} className="text-gray-600" />
                    }
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
                                                <div
                                                    className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white"
                                                    style={{ backgroundColor: assignment.employeeColor }}
                                                >
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
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    assignment.isNewAssignment
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {assignment.isNewAssignment ? 'Nouvelle affectation' : 'Déplacement'}
                                                </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-3 text-xs text-gray-500 text-right">
                            Tonnyjoh - 2025-08-01 18:20:43
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
                        zoneData={zoneData}
                        zoneAssignedAgents={zoneAssignedAgents}
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