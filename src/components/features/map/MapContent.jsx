import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, Menu, Info, X, Check } from 'lucide-react';
import { useAuth } from "@/context/AuthContext.jsx";
import { useZone } from "@/hooks/features/zone/useZone.js";
import EmployeeCard from "@/components/features/map/ui/EmployeeCard.jsx";
import MapView from "@/components/features/map/contents/MapView.jsx";
import EmployeeList from "@/components/features/map/contents/EmployeeList.jsx";
import useMercureSubscription from "@/hooks/features/messaging/useMercureSubscription.js";
import { messageService } from "@/services/features/messaging/messageService.js";

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
    const { getAvailableAgent, sendAssignment, getZone, getZoneByAgent, isLoading, error, success } = useZone();

    // Mercure configuration
    const MERCURE_URL = import.meta.env.VITE_MERCURE_URL || 'http://localhost:3000/.well-known/mercure';
    const [mercureToken, setMercureToken] = useState(null);
    const [locationTopic, setLocationTopic] = useState(null);

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
        const coordMatch = text.match(/\[([-\d.]+),\s*([-\d.]+)]/);
        if (coordMatch && coordMatch.length >= 3) {
            return {
                lat: parseFloat(coordMatch[1]),
                lng: parseFloat(coordMatch[2])
            };
        }
        return null;
    };

    // Handle real-time location updates from Mercure
    const handleLocationUpdate = useCallback((data) => {
        try {
            console.log('🔄 Received real-time location update:', data);
            
            // Extract location data from the payload
            const { agent_id, latitude, longitude, accuracy, speed, battery_level, recorded_at, is_significant, reason } = data;
            
            if (!agent_id || latitude === undefined || longitude === undefined) {
                console.warn('❌ Invalid location data received:', data);
                return;
            }

            console.log(`📍 Processing location update for agent ID: ${agent_id}`);
            console.log('📍 New position:', { latitude, longitude });
            
            let agentUpdated = false;
            
            // Update the assigned employees list with new position
            setAssignedEmployees(prevEmployees => {
                const updatedEmployees = prevEmployees.map(employee => {
                    // Match by encrypted agent ID (agent_id from Mercure = employee.id from backend)
                    if (employee.id === agent_id) {
                        const newPosition = {
                            lat: parseFloat(latitude),
                            lng: parseFloat(longitude)
                        };

                        console.log(`✅ Updating position for agent ${employee.name} (Encrypted ID: ${employee.id}):`, newPosition);
                        agentUpdated = true;

                        return {
                            ...employee,
                            position: newPosition,
                            lastLocationUpdate: recorded_at,
                            accuracy: accuracy,
                            speed: speed,
                            batteryLevel: battery_level,
                            isSignificant: is_significant,
                            locationReason: reason
                        };
                    }
                    return employee;
                });
                
                return updatedEmployees;
            });

            // Also update zone assigned agents if needed
            setZoneAssignedAgents(prevAgents => {
                const updatedAgents = prevAgents.map(agent => {
                    if (agent.id === agent_id) {
                        console.log(`✅ Updating zone agent position for ${agent.name}`);
                        agentUpdated = true;
                        return {
                            ...agent,
                            position: {
                                lat: parseFloat(latitude),
                                lng: parseFloat(longitude)
                            },
                            lastLocationUpdate: recorded_at
                        };
                    }
                    return agent;
                });
                
                return updatedAgents;
            });

            if (!agentUpdated) {
                console.log(`⚠️ No agent found with ID ${agent_id} to update`);
            } else {
                console.log(`🎯 Successfully processed location update for agent ID: ${agent_id}`);
            }

        } catch (error) {
            console.error('❌ Error handling location update:', error);
        }
    }, []); // No dependencies needed since we use functional state updates

    // Load available agents from API (client only)
    useEffect(() => {
        if (user?.role !== "client") return;
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
                    position: agent.currentPosition,
                    phone: agent.user.phone || 'Non renseigné',
                }));

                setUnassignedEmployees(formattedAgents);
            } else {
                console.log("Aucun agent disponible n'a été trouvé via l'API");
            }
        };

        fetchAgents();
    }, [user?.role]);

    // Load zone data from API
    useEffect(() => {
        const loadZoneData = async () => {
            if (!user?.userId || zoneLoaded) return;

            setZoneLoaded(true);

            let result;
            if (user.role === "client") {
                result = await getZone(user.userId);
            } else if (user.role === "agent") {
                result = await getZoneByAgent(user.userId);
            }

            if (result.success && result.data) {
                console.log('Zone data received:', result.data);
                setZoneData(result.data);

                // Format assigned agents if available
                if (result.data.assignedAgents?.length > 0) {
                    console.log('Assigned agents from API:', result.data.assignedAgents);
                    const formattedZoneAgents = result.data.assignedAgents
                        .filter(assignedAgent => assignedAgent.agent?.user)
                        .map(assignedAgent => {
                            const agent = assignedAgent.agent;
                            const userObj = agent.user;
                            const name = userObj.name || "Agent inconnu";
                            const initials = name.split(' ').map(n => n[0]).join('');

                            // Get position from task or current position
                            let position = null;
                            if (assignedAgent.currentPosition && 
                                typeof assignedAgent.currentPosition === 'object' &&
                                assignedAgent.currentPosition.latitude !== undefined && 
                                assignedAgent.currentPosition.longitude !== undefined) {
                                    position = {
                                        lat: assignedAgent.currentPosition.latitude,
                                        lng: assignedAgent.currentPosition.longitude,
                                };
                            } else  if (assignedAgent.task?.assignPosition &&
                                Array.isArray(assignedAgent.task.assignPosition) &&
                                assignedAgent.task.assignPosition.length === 2) {
                                position = {
                                    lat: assignedAgent.task.assignPosition[0],
                                    lng: assignedAgent.task.assignPosition[1]
                                };
                            } else if (assignedAgent.task?.description) {
                                position = extractCoordinates(assignedAgent.task.description);
                            }

                            return {
                                id: agent.agentId, // This is already encrypted (from backend)
                                assignmentId: assignedAgent.id,
                                name: name,
                                avatar: initials,
                                email: userObj.email,
                                role: 'Agent assigné',
                                status: assignedAgent.status || assignedAgent.task?.status || 'Inactif',
                                routeColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
                                position: position,
                                task: assignedAgent.task,
                                taskDescription: assignedAgent.task?.description || '',
                                phone: userObj.phone || 'Non renseigné',
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

                    setAssignedEmployees(assignedAgentsFromAPI);

                    // Remove assigned agents from unassigned list (client only)
                    if (user.role === "client") {
                        const assignedIds = assignedAgentsFromAPI.map(agent => agent.id);
                        setUnassignedEmployees(prev => prev.filter(emp => !assignedIds.includes(emp.id)));
                    }
                }
            }
        };

        loadZoneData();
    }, [user?.userId, user?.role]);

    // Setup Mercure token and location topic
    useEffect(() => {
        const setupMercureSubscription = async () => {
            if (!zoneData?.serviceOrder?.id) return;

            const orderId = zoneData.serviceOrder.id;
            const expectedTopic = `order/${orderId}/agents/location`;

            // Skip if we already have the correct token and topic for this order
            if (locationTopic === expectedTopic && mercureToken) {
                console.log('Mercure subscription already set up for this order');
                return;
            }

            try {
                // Get Mercure token
                const tokenResult = await messageService.getMercureToken();
                if (tokenResult.success) {
                    setMercureToken(tokenResult.token);
                    setLocationTopic(expectedTopic);
                    
                    console.log(`Setting up location tracking for topic: ${expectedTopic}`);
                    console.log('Zone service order data:', zoneData.serviceOrder);
                    console.log('Current assigned employees:', assignedEmployees.map(emp => ({ id: emp.id, name: emp.name })));
                    console.log('Current zone assigned agents:', zoneAssignedAgents.map(agent => ({ id: agent.id, name: agent.name })));
                } else {
                    console.error('Failed to get Mercure token:', tokenResult.error);
                }
            } catch (error) {
                console.error('Error setting up Mercure subscription:', error);
            }
        };

        setupMercureSubscription();
    }, [zoneData?.serviceOrder?.id, locationTopic, mercureToken]); // Include current state to avoid redundant calls

    // Subscribe to location updates via Mercure
    useMercureSubscription({
        topic: locationTopic,
        mercureUrl: MERCURE_URL,
        token: mercureToken,
        onMessage: handleLocationUpdate,
        reconnectDelay: 3000
    });

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

    // Start employee drag onto map (client only)
    const handleDragStart = (employee) => {
        if (user.role === "client") setDraggingEmployee(employee);
    };

    // End employee drag (client only)
    const handleDragEnd = () => {
        if (user.role === "client") setDraggingEmployee(null);
    };

    // Handle employee drop on map (client only)
    const handleEmployeeDrop = (employee, position, zoneInfo) => {
        if (user.role !== "client") return;

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

    // Confirm all pending assignments (client only)
    const confirmAssignments = async () => {
        if (user.role !== "client") return;
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

    // Cancel all pending assignments (client only)
    const cancelAssignments = () => {
        if (user.role !== "client") return;
        setPendingAssignments([]);
        setShowPendingAssignments(false);
    };

    // Handle map click for employee drop (client only)
    const handleMapClick = (position, zoneInfo) => {
        if (user.role === "client" && draggingEmployee) {
            handleEmployeeDrop(draggingEmployee, position, zoneInfo);
        }
    };

    return (
        <div className="flex h-full">
            {/* Employee sidebar */}
            <div className={`${sidebarVisible ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out bg-white`}>
                <EmployeeList
                    employees={assignedEmployees}
                    unassignedEmployees={user.role === "client" ? unassignedEmployees : []}
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

                {draggingEmployee && user.role === "client" && (
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
                    <div className="absolute top-2 z-[1000] left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-2xl w-full">
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
                        <div className="mt-3 text-xs capitalize text-gray-500 text-right">
                            {user?.name}{' '}, {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
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
                        draggingEmployee={user.role === "client" ? draggingEmployee : null}
                        onEmployeeDrop={user.role === "client" ? handleEmployeeDrop : undefined}
                        onMapClick={handleMapClick}
                        zoneData={zoneData}
                        zoneAssignedAgents={zoneAssignedAgents}
                        userRole={user.role}
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