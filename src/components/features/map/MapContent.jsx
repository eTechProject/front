import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Check, ChevronDown, ChevronLeft, ChevronUp, Info, Menu, X} from 'lucide-react';
import {useAuth} from '@/context/AuthContext.jsx';
import {useZone} from '@/hooks/features/zone/useZone.js';
import EmployeeCard from '@/components/features/map/ui/EmployeeCard.jsx';
import MapView from '@/components/features/map/contents/MapView.jsx';
import EmployeeList from '@/components/features/map/contents/EmployeeList.jsx';
import useMercureSubscription from '@/hooks/features/messaging/useMercureSubscription.js';
import {messageService} from '@/services/features/messaging/messageService.js';
import {mapReloadService} from '@/services/map/mapReloadService.js';
import {useMapReload} from "@/hooks/map/useMapReload.js";

const MapContent = () => {
    // UI States
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [filterText, setFilterText] = useState('');
    const [showEmployeeCard, setShowEmployeeCard] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(window.innerWidth >= 1024);
    const [showInstructions, setShowInstructions] = useState(false);

    // Mobile specific states
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false);
    const [touchStartY, setTouchStartY] = useState(null);

    // Employee card drag states
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [cardPosition, setCardPosition] = useState({ x: 40, y: 40 });

    // Assignment states
    const [pendingAssignments, setPendingAssignments] = useState([]);
    const [showPendingAssignments, setShowPendingAssignments] = useState(false);
    const [draggingEmployee, setDraggingEmployee] = useState(null);

    // Touch drag states for mobile
    const [touchDragState, setTouchDragState] = useState({
        isDragging: false,
        employee: null,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
    });
    // Fonction pour mapper les valeurs de 'reason' aux statuts de tâche
    const mapReasonToTaskStatus = (reason) => {
        const reasonStatusMap = {
            'start_task': 'working',
            'end_task': 'completed',
            'manual_report' : 'working',
            'pause_task': 'pause',
            'resume_task': 'working',
            'arrived': 'working',
            'break_start': 'break',
            'break_end': 'working',
            'emergency': 'urgent',
            'offline': 'inactif',
            'online': 'actif',
            'mission_complete': 'completed',
            'returning_to_base': 'transit',
            'waiting_for_instructions': 'pending',
        };

        return reasonStatusMap[reason] || null;
    };
    // References and context
    const mapRef = useRef(null);
    const bottomSheetRef = useRef(null);
    const { user, userRole } = useAuth();

    // Zone data states
    const [zoneData, setZoneData] = useState(null);
    const [zoneLoaded, setZoneLoaded] = useState(false);
    const [zoneAssignedAgents, setZoneAssignedAgents] = useState([]);

    // Employee data states
    const [assignedEmployees, setAssignedEmployees] = useState([]);
    const [unassignedEmployees, setUnassignedEmployees] = useState([]);

    // Zone operations hook
    const { sendAssignment, isLoading, error, success } = useZone();

    // Utiliser le hook de rechargement
    const { reloadMapData } = useMapReload(
        setZoneData,
        setZoneAssignedAgents,
        setAssignedEmployees,
        setUnassignedEmployees,
        setZoneLoaded
    );

    // Mercure configuration
    const MERCURE_URL = import.meta.env.VITE_MERCURE_URL || 'http://localhost:3000/.well-known/mercure';
    const [mercureToken, setMercureToken] = useState(null);
    const [locationTopic, setLocationTopic] = useState(null);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            const desktop = window.innerWidth >= 1024;

            setIsMobile(mobile);

            if (mobile) {
                setSidebarVisible(false);
                setBottomSheetExpanded(false);
            } else if (desktop) {
                setSidebarVisible(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Format date to French locale
    const formatDate = (date) => date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Get CSS color class based on employee status
    const getStatusColor = (status) => {
        const statusLower = status?.toLowerCase() || '';
        const statusMap = {
            pause: 'bg-green-500',
            working: 'bg-blue-500',
            disponible: 'bg-green-400',
            break: 'bg-yellow-500',
            completed: 'bg-gray-500',
            transit: 'bg-orange-500',
            occupé: 'bg-red-500',
            inactif: 'bg-gray-400',
            actif: 'bg-green-500',
            'en mission': 'bg-blue-500',
            pending: 'bg-yellow-500',
        };
        return statusMap[statusLower] || 'bg-gray-400';
    };

    // Handle real-time location updates from Mercure
    const handleLocationUpdate = useCallback((data) => {
        try {
            console.log('🔄 Received real-time location update:', data);

            const { agent_id, latitude, longitude, accuracy, speed, battery_level, recorded_at, is_significant, reason } = data;

            if (!agent_id || latitude === undefined || longitude === undefined) {
                console.warn('❌ Invalid location data received:', data);
                return;
            }

            console.log(`📍 Processing location update for agent ID: ${agent_id}`);
            console.log('📍 New position:', { latitude, longitude });
            console.log('📍 Reason:', reason);

            // Déterminer le nouveau statut basé sur le reason
            const newTaskStatus = mapReasonToTaskStatus(reason);
            if (newTaskStatus) {
                console.log(`📊 Mapping reason "${reason}" to status: ${newTaskStatus}`);
            }

            let agentUpdated = false;

            setAssignedEmployees((prevEmployees) => {
                return prevEmployees.map((employee) => {
                    if (employee.id === agent_id) {
                        const newPosition = {
                            lat: parseFloat(latitude),
                            lng: parseFloat(longitude),
                        };

                        console.log(`✅ Updating position for agent ${employee.name} (Encrypted ID: ${employee.id}):`, newPosition);

                        // Mise à jour du statut de la tâche si un mapping existe
                        let updatedTask = employee.task;
                        if (newTaskStatus && employee.task) {
                            console.log(`📊 Task status updated from "${employee.task.status}" to "${newTaskStatus}" for agent ${employee.name}`);
                            updatedTask = {
                                ...employee.task,
                                status: newTaskStatus,
                                lastStatusUpdate: recorded_at,
                            };
                        }

                        agentUpdated = true;

                        return {
                            ...employee,
                            position: newPosition,
                            task: updatedTask,
                            lastLocationUpdate: recorded_at,
                            accuracy: accuracy,
                            speed: speed,
                            batteryLevel: battery_level,
                            isSignificant: is_significant,
                            locationReason: reason,
                        };
                    }
                    return employee;
                });
            });

            setZoneAssignedAgents((prevAgents) => {
                return prevAgents.map((agent) => {
                    if (agent.id === agent_id) {
                        console.log(`Updating zone agent position for ${agent.name}`);

                        let updatedTask = agent.task;
                        if (newTaskStatus && agent.task) {
                            console.log(`📊 Zone agent task status updated from "${agent.task.status}" to "${newTaskStatus}" for agent ${agent.name}`);
                            updatedTask = {
                                ...agent.task,
                                status: newTaskStatus,
                                lastStatusUpdate: recorded_at,
                            };
                        }

                        agentUpdated = true;
                        return {
                            ...agent,
                            position: {
                                lat: parseFloat(latitude),
                                lng: parseFloat(longitude),
                            },
                            task: updatedTask,
                            lastLocationUpdate: recorded_at,
                            accuracy: accuracy,
                            speed: speed,
                            batteryLevel: battery_level,
                            isSignificant: is_significant,
                            locationReason: reason,
                        };
                    }
                    return agent;
                });
            });

            if (!agentUpdated) {
                console.log(`⚠️ No agent found with ID ${agent_id} to update`);
            } else {
                console.log(`🎯 Successfully processed location update for agent ID: ${agent_id}`);
            }
        } catch (error) {
            console.error('❌ Error handling location update:', error);
        }
    }, []);

    // Load initial data
    useEffect(() => {
        if (!zoneLoaded) {
            reloadMapData().then();
        }
    }, [zoneLoaded]);

    // Setup Mercure token and location topic
    useEffect(() => {
        const setupMercureSubscription = async () => {
            if (!zoneData?.serviceOrder?.id) return;

            const orderId = zoneData.serviceOrder.id;
            const expectedTopic = `order/${orderId}/agents/location`;

            if (locationTopic === expectedTopic && mercureToken) {
                console.log('Mercure subscription already set up for this order');
                return;
            }

            try {
                const tokenResult = await messageService.getMercureToken();
                if (tokenResult.success) {
                    setMercureToken(tokenResult.token);
                    setLocationTopic(expectedTopic);

                    console.log(`Setting up location tracking for topic: ${expectedTopic}`);
                    console.log('Zone service order data:', zoneData.serviceOrder);
                    console.log('Current assigned employees:', assignedEmployees.map((emp) => ({ id: emp.id, name: emp.name })));
                    console.log('Current zone assigned agents:', zoneAssignedAgents.map((agent) => ({ id: agent.id, name: agent.name })));
                } else {
                    console.error('Failed to get Mercure token:', tokenResult.error);
                }
            } catch (error) {
                console.error('Error setting up Mercure subscription:', error);
            }
        };

        setupMercureSubscription().then();
    }, [zoneData?.serviceOrder?.id, locationTopic, mercureToken]);

    // Subscribe to location updates via Mercure
    useMercureSubscription({
        topic: locationTopic,
        mercureUrl: MERCURE_URL,
        token: mercureToken,
        onMessage: handleLocationUpdate,
        reconnectDelay: 3000,
    });

    // Show employee details card
    const handleEmployeeClick = (employee) => {
        setSelectedEmployee(employee);
        setShowEmployeeCard(true);

        if (isMobile) {
            setBottomSheetExpanded(false);
        }
    };

    // Toggle sidebar visibility
    const toggleSidebar = () => {
        if (isMobile) {
            setBottomSheetExpanded(!bottomSheetExpanded);
        } else {
            setSidebarVisible((prev) => !prev);
        }
    };

    // Toggle instructions display
    const toggleInstructions = () => setShowInstructions((prev) => !prev);

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

    // Touch drag handlers for mobile
    const handleTouchStart = (e, employee) => {
        if (userRole !== 'client' || !isMobile) return;

        const touch = e.touches[0];
        setTouchDragState({
            isDragging: true,
            employee,
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY,
        });

        if (navigator.vibrate) {
            navigator.vibrate(50);
        }

        setDraggingEmployee(employee);

        e.preventDefault();
    };

    const handleTouchMove = (e) => {
        if (!touchDragState.isDragging) return;

        const touch = e.touches[0];
        setTouchDragState((prev) => ({
            ...prev,
            currentX: touch.clientX,
            currentY: touch.clientY,
        }));

        e.preventDefault();
    };

    const handleTouchEnd = (e) => {
        if (!touchDragState.isDragging) return;

        const touch = e.changedTouches[0];
        const mapContainer = document.getElementById('map-container');
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);

        if (mapContainer && mapContainer.contains(elementBelow)) {
            if (mapRef.current && mapRef.current.convertScreenToLatLng) {
                const mapPosition = mapRef.current.convertScreenToLatLng(touch.clientX, touch.clientY);

                if (mapPosition) {
                    console.log('Touch converted to map coordinates:', mapPosition);
                    handleEmployeeDrop(touchDragState.employee, mapPosition);
                } else {
                    console.warn('Failed to convert touch coordinates to map position');
                }
            } else {
                console.warn('Map coordinate conversion method not available');
            }
        } else {
            console.log('Touch not on map area');
        }

        setTouchDragState({
            isDragging: false,
            employee: null,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
        });

        setDraggingEmployee(null);
    };

    // Start employee drag onto map (client only)
    const handleDragStart = (employee) => {
        if (userRole === 'client') setDraggingEmployee(employee);
    };

    // End employee drag (client only)
    const handleDragEnd = () => {
        if (userRole === 'client') setDraggingEmployee(null);
    };

    // Bottom sheet touch handlers
    const handleBottomSheetTouchStart = (e) => {
        setTouchStartY(e.touches[0].clientY);
    };

    const handleBottomSheetTouchMove = (e) => {
        if (!touchStartY) return;

        const currentY = e.touches[0].clientY;
        const diff = touchStartY - currentY;

        if (diff > 50 && !bottomSheetExpanded) {
            setBottomSheetExpanded(true);
        } else if (diff < -50 && bottomSheetExpanded) {
            setBottomSheetExpanded(false);
        }
    };

    const handleBottomSheetTouchEnd = () => {
        setTouchStartY(null);
    };

    // Format date to "YYYY-MM-DD HH:mm:ss"
    const formatDateForBackend = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // Handle employee drop on map (client only)
    const handleEmployeeDrop = (employee, position, zoneInfo) => {
        if (userRole !== 'client') return;

        console.log('🎯 Employee drop initiated:', {
            employee: employee.name,
            position,
            zoneInfo,
        });

        const zoneInfoToUse = zoneInfo || (zoneData ? {
            serviceOrderId: zoneData.serviceOrder?.id,
            securedZoneId: zoneData.securedZone?.securedZoneId,
            zoneName: zoneData.securedZone?.name,
        } : null);

        if (!zoneInfoToUse) {
            console.warn("Pas d'information de zone disponible pour l'affectation");
            return;
        }

        const startDate = formatDateForBackend(new Date());
        const endDate = formatDateForBackend(new Date(Date.now() + 2 * 60 * 60 * 1000));
        const assignmentType = 'patrouille';

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
            previousPosition: employee.position,
            startDate,
            endDate,
            type: assignmentType,
            description: null,
        };

        setPendingAssignments((prev) => [...prev, newAssignment]);
        setShowPendingAssignments(true);
        setUnassignedEmployees((prev) => prev.filter((emp) => emp.id !== employee.id));
        setDraggingEmployee(null);
    };

    // Update pending assignment
    const updateAssignment = (id, updatedData) => {
        setPendingAssignments((prev) =>
            prev.map((assignment) =>
                assignment.id === id ? { ...assignment, ...updatedData } : assignment
            )
        );
    };

    // Confirm all pending assignments (client only)
    const confirmAssignments = async () => {
        if (userRole !== 'client') return;
        if (!pendingAssignments.length) {
            console.log('Aucune affectation à confirmer');
            return;
        }
        const orderId = pendingAssignments[0].zoneInfo?.serviceOrderId;
        if (!orderId) {
            console.log('Order ID non trouvé');
            return;
        }
        const agentAssignments = pendingAssignments.map(({ employeeId, coordinates, startDate, endDate, type, description }) => ({
            agentId: employeeId.toString(),
            type,
            description,
            startDate,
            endDate,
            assignPosition: [
                parseFloat(coordinates.lat.toFixed(6)),
                parseFloat(coordinates.lng.toFixed(6)),
            ],
        }));
        const assignmentData = { orderId, agentAssignments };
        console.log('Données à envoyer:', JSON.stringify(assignmentData, null, 2));
        const result = await sendAssignment(assignmentData);
        if (result.success) {
            console.log('Affectations confirmées avec succès:', result.data);
            pendingAssignments.forEach((assignment) => {
                if (assignment.isNewAssignment) {
                    const employee = {
                        id: assignment.employeeId,
                        name: assignment.employeeName,
                        avatar: assignment.employeeAvatar,
                        routeColor: assignment.employeeColor,
                        email: unassignedEmployees.find((emp) => emp.id === assignment.employeeId)?.email || '',
                        role: 'Agent de terrain',
                        phone: unassignedEmployees.find((emp) => emp.id === assignment.employeeId)?.phone || 'Non renseigné',
                        position: assignment.coordinates,
                        datetimeStart: assignment.startDate,
                        datetimeEnd: assignment.endDate,
                    };
                    setAssignedEmployees((prev) => [...prev, {
                        ...employee,
                        route: [],
                    }]);
                } else {
                    setAssignedEmployees((prev) => prev.map((emp) =>
                        emp.id === assignment.employeeId
                            ? {
                                ...emp,
                                position: assignment.coordinates,
                                task: {
                                    id: emp.task?.id || Date.now().toString(),
                                    status: emp.task?.status,
                                    startDate: assignment.startDate,
                                    datetimeEnd: assignment.endDate,
                                    type: assignment.type,
                                    description: assignment.description,
                                },
                                serviceOrder: zoneData?.serviceOrder,
                            }
                            : emp
                    ));
                }
            });
            setPendingAssignments([]);
            setShowPendingAssignments(false);

            // Déclencher le rechargement
            mapReloadService.triggerReload('assignmentsConfirmed');
        } else {
            console.error('Erreur lors de la confirmation des affectations:', result.error);
            const failedAssignments = pendingAssignments.map((assignment) => ({
                id: assignment.employeeId,
                name: assignment.employeeName,
                avatar: assignment.employeeAvatar,
                routeColor: assignment.employeeColor,
                email: unassignedEmployees.find((emp) => emp.id === assignment.employeeId)?.email || '',
                role: 'Agent de terrain',
                phone: unassignedEmployees.find((emp) => emp.id === assignment.employeeId)?.phone || 'Non renseigné',
                position: null,
                task: null,
                serviceOrder: null,
            }));
            setUnassignedEmployees((prev) => [...prev, ...failedAssignments]);
            setPendingAssignments([]);
            setShowPendingAssignments(false);
        }
    };

    // Cancel all pending assignments (client only)
    const cancelAssignments = () => {
        if (userRole !== 'client') return;
        const canceledEmployees = pendingAssignments.map((assignment) => ({
            id: assignment.employeeId,
            name: assignment.employeeName,
            avatar: assignment.employeeAvatar,
            routeColor: assignment.employeeColor,
            email: unassignedEmployees.find((emp) => emp.id === assignment.employeeId)?.email || '',
            role: 'Agent de terrain',
            phone: unassignedEmployees.find((emp) => emp.id === assignment.employeeId)?.phone || 'Non renseigné',
            position: null,
            task: null,
            serviceOrder: null,
        }));
        setUnassignedEmployees((prev) => [...prev, ...canceledEmployees]);
        setPendingAssignments([]);
        setShowPendingAssignments(false);
    };

    // Handle map click for employee drop (client only)
    const handleMapClick = (position, zoneInfo) => {
        if (userRole === 'client' && draggingEmployee) {
            console.log('🗺️ Map click with dragging employee:', {
                employee: draggingEmployee.name,
                position,
                zoneInfo,
            });
            handleEmployeeDrop(draggingEmployee, position, zoneInfo);
        }
    };

    // Pending Assignment Row Component
    const PendingAssignmentRow = ({ assignment, updateAssignment }) => {
        const [editable, setEditable] = useState(false);
        const [formData, setFormData] = useState({
            startDate: assignment.startDate,
            endDate: assignment.endDate,
            type: assignment.type,
            description: assignment.description || '',
        });

        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
        };

        const saveChanges = () => {
            updateAssignment(assignment.id, formData);
            setEditable(false);
        };

        return (
            <tr key={assignment.id} className="hover:bg-gray-50">
                <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                        <div
                            className="flex-shrink-0 h-6 w-6 md:h-8 md:w-8 rounded-full flex items-center justify-center text-white text-xs"
                            style={{ backgroundColor: assignment.employeeColor }}
                        >
                            {assignment.employeeAvatar}
                        </div>
                        <div className="ml-2 md:ml-3">
                            <div className="text-xs md:text-sm font-medium text-gray-900">{assignment.employeeName}</div>
                        </div>
                    </div>
                </td>
                <td className="px-2 md:px-4 py-2 whitespace-nowrap text-xs md:text-sm text-gray-500">
                    {assignment.coordinates.lat.toFixed(5)}, {assignment.coordinates.lng.toFixed(5)}
                </td>
                <td className="px-2 md:px-4 py-2 whitespace-nowrap text-xs md:text-sm text-gray-500">
                    {assignment.zoneInfo?.zoneName || 'Non spécifiée'}
                </td>
                <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {editable ? (
                        <input
                            type="datetime-local"
                            name="startDate"
                            value={formData.startDate.slice(0, 16)}
                            onChange={handleInputChange}
                            className="border rounded px-1 md:px-2 py-1 text-xs md:text-sm w-full"
                        />
                    ) : (
                        <span className="text-xs md:text-sm">
              {new Date(assignment.startDate).toLocaleString('fr-FR')}
            </span>
                    )}
                </td>
                <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {editable ? (
                        <input
                            type="datetime-local"
                            name="endDate"
                            value={formData.endDate.slice(0, 16)}
                            onChange={handleInputChange}
                            className="border rounded px-1 md:px-2 py-1 text-xs md:text-sm w-full"
                        />
                    ) : (
                        <span className="text-xs md:text-sm">
              {new Date(assignment.endDate).toLocaleString('fr-FR')}
            </span>
                    )}
                </td>
                <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {editable ? (
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="border rounded px-1 md:px-2 py-1 text-xs md:text-sm w-full"
                        >
                            <option value="patrouille">Patrouille</option>
                            <option value="intervention">Intervention</option>
                            <option value="surveillance">Surveillance</option>
                            <option value="autre">Autre</option>
                        </select>
                    ) : (
                        <span className="text-xs md:text-sm">{assignment.type}</span>
                    )}
                </td>
                <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {editable ? (
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="border rounded px-1 md:px-2 py-1 text-xs md:text-sm w-full"
                            placeholder="Description (optionnelle)"
                        />
                    ) : (
                        <span className="text-xs md:text-sm">{assignment.description || 'Aucune'}</span>
                    )}
                </td>
                <td className="px-2 md:px-4 py-2 whitespace-nowrap">
                    {editable ? (
                        <button onClick={saveChanges} className="text-green-500 hover:text-green-700">
                            <Check size={16} />
                        </button>
                    ) : (
                        <button onClick={() => setEditable(true)} className="text-blue-500 hover:text-blue-700 text-xs md:text-sm">
                            Modifier
                        </button>
                    )}
                </td>
            </tr>
        );
    };

    return (
        <div className="flex h-full relative">
            <div className={`${isMobile ? 'hidden' : sidebarVisible ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out bg-white`}>
                <EmployeeList
                    employees={assignedEmployees}
                    unassignedEmployees={userRole === 'client' ? unassignedEmployees : []}
                    filterText={filterText}
                    setFilterText={setFilterText}
                    handleEmployeeClick={handleEmployeeClick}
                    selectedEmployee={selectedEmployee}
                    formatDate={formatDate}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    isAgentMode={userRole === 'agent'}
                />
            </div>

            <div id="map-container" className="flex-1 relative overflow-hidden">
                <button
                    onClick={toggleSidebar}
                    className={`absolute ${isMobile ? 'bottom-4 right-4 z-30' : 'top-20 left-2 z-20'} 
          bg-white backdrop-blur-sm hover:bg-gray-50 rounded-lg p-2 md:p-2 border transition-colors shadow-lg`}
                    title={isMobile ? (bottomSheetExpanded ? 'Fermer la liste' : 'Ouvrir la liste') : (sidebarVisible ? 'Masquer le panneau' : 'Afficher le panneau')}
                >
                    {isMobile ? (
                        bottomSheetExpanded ? <ChevronDown size={20} className="text-gray-600" /> : <ChevronUp size={20} className="text-gray-600" />
                    ) : (
                        sidebarVisible ? <ChevronLeft size={20} className="text-gray-600" /> : <Menu size={20} className="text-gray-600" />
                    )}
                </button>

                {(draggingEmployee || touchDragState.isDragging) && userRole === 'client' && (
                    <div className={`absolute ${isMobile ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' : 'top-2 left-[40%]'} 
          z-50 bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm shadow-md`}>
                        {isMobile ? `Glissez ${touchDragState.employee?.name || draggingEmployee?.name} sur la carte` : `Déposez ${draggingEmployee?.name} sur la carte`}
                    </div>
                )}

                {userRole === 'client' && (
                    <div className={`absolute ${isMobile ? 'top-4 right-4' : 'top-32 left-2'} z-[900] flex items-center`}>
                        {showInstructions ? (
                            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md text-sm flex items-center space-x-2 max-w-xs">
                                <span>Utilisez les outils en haut à droite pour dessiner des zones</span>
                                <button onClick={toggleInstructions} className="text-gray-500 hover:text-gray-700">
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={toggleInstructions}
                                className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg"
                                title="Afficher les instructions"
                            >
                                <Info size={18} className="text-gray-700 hover:text-orange-500" />
                            </button>
                        )}
                    </div>
                )}

                {showPendingAssignments && pendingAssignments.length > 0 && (
                    <div className={`absolute top-2 z-[1000] ${isMobile ? 'left-2 right-2' : 'left-1/2 transform -translate-x-1/2'} 
          bg-white rounded-lg shadow-lg border border-gray-200 p-2 md:p-4 ${isMobile ? 'max-h-[70vh] overflow-y-auto' : 'max-w-4xl w-full'}`}>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-base md:text-lg font-semibold text-gray-800">
                                Affectations en attente ({pendingAssignments.length})
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={confirmAssignments}
                                    className="bg-green-500 hover:bg-green-600 text-white px-2 md:px-3 py-1 rounded-md text-xs md:text-sm flex items-center gap-1"
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
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 md:px-3 py-1 rounded-md text-xs md:text-sm flex items-center gap-1"
                                    disabled={isLoading}
                                >
                                    <X size={16} /> Annuler
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-xs md:text-sm">
                                Erreur: {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-3 p-2 bg-green-100 text-green-700 rounded text-xs md:text-sm">
                                Affectations envoyées avec succès!
                            </div>
                        )}

                        <div className={`${isMobile ? 'max-h-60' : 'max-h-60'} overflow-y-auto overflow-x-auto`}>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                                    <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                                    <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                                    <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Début</th>
                                    <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
                                    <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {pendingAssignments.map((assignment) => (
                                    <PendingAssignmentRow
                                        key={assignment.id}
                                        assignment={assignment}
                                        updateAssignment={updateAssignment}
                                    />
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-3 text-xs capitalize text-gray-500 text-right">
                            {user?.name}, {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    </div>
                )}

                <div className="w-full border relative z-10 h-full rounded-lg overflow-hidden">
                    <MapView
                        ref={mapRef}
                        employees={assignedEmployees}
                        handleEmployeeClick={handleEmployeeClick}
                        selectedEmployee={selectedEmployee}
                        sidebarVisible={sidebarVisible}
                        draggingEmployee={userRole === 'client' ? (draggingEmployee || touchDragState.employee) : null}
                        onEmployeeDrop={userRole === 'client' ? handleEmployeeDrop : undefined}
                        onMapClick={handleMapClick}
                        zoneData={zoneData}
                        zoneAssignedAgents={zoneAssignedAgents}
                        userRole={userRole}
                    />
                </div>

                {showEmployeeCard && selectedEmployee && (
                    <EmployeeCard
                        employee={selectedEmployee}
                        onClose={() => setShowEmployeeCard(false)}
                        position={isMobile ? { x: 10, y: 10 } : cardPosition}
                        isDragging={!isMobile && isDragging}
                        onMouseDown={!isMobile ? handleMouseDown : undefined}
                        onMouseMove={!isMobile ? handleMouseMove : undefined}
                        onMouseUp={!isMobile ? handleMouseUp : undefined}
                        getStatusColor={getStatusColor}
                        isMobile={isMobile}
                    />
                )}
            </div>

            {isMobile && (
                <div
                    ref={bottomSheetRef}
                    className={`fixed bottom-0 left-0 right-0 bg-white border-t rounded-t-2xl border-gray-200 z-40 transform transition-transform duration-300 ease-out ${
                        bottomSheetExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-2.5rem)]'
                    }`}
                    style={{ maxHeight: '70vh' }}
                    onTouchStart={handleBottomSheetTouchStart}
                    onTouchMove={handleBottomSheetTouchMove}
                    onTouchEnd={handleBottomSheetTouchEnd}
                >
                    <div className="flex justify-center">
                        <button
                            className="relative -top-4 bg-white bg-opacity-70 rounded-full p-1"
                            onClick={() => setBottomSheetExpanded(!bottomSheetExpanded)}
                        >
                            {bottomSheetExpanded ? <ChevronDown className="text-gray-800" size={30} /> : <ChevronUp className="text-gray-800" size={30} />}
                        </button>
                    </div>

                    <div className="overflow-hidden" style={{ maxHeight: bottomSheetExpanded ? '60vh' : '0' }}>
                        <MobileEmployeeList
                            employees={assignedEmployees}
                            unassignedEmployees={userRole === 'client' ? unassignedEmployees : []}
                            filterText={filterText}
                            setFilterText={setFilterText}
                            handleEmployeeClick={handleEmployeeClick}
                            selectedEmployee={selectedEmployee}
                            formatDate={formatDate}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            touchDragState={touchDragState}
                            userRole={userRole}
                        />
                    </div>
                </div>
            )}

            {touchDragState.isDragging && (
                <div
                    className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                        left: touchDragState.currentX,
                        top: touchDragState.currentY,
                    }}
                >
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg opacity-80"
                        style={{ backgroundColor: touchDragState.employee?.routeColor || '#9CA3AF' }}
                    >
                        {touchDragState.employee?.avatar}
                    </div>
                </div>
            )}
        </div>
    );
};

// Mobile Employee List Component
const MobileEmployeeList = ({
                                employees = [],
                                unassignedEmployees = [],
                                filterText = '',
                                setFilterText = () => {},
                                handleEmployeeClick = () => {},
                                selectedEmployee = null,
                                onTouchStart = () => {},
                                onTouchMove = () => {},
                                onTouchEnd = () => {},
                                touchDragState = {},
                                userRole = 'agent',
                            }) => {
    const [showUnassigned, setShowUnassigned] = useState(false);

    const filteredEmployees = employees.filter((emp) =>
        emp.name.toLowerCase().includes(filterText.toLowerCase())
    );

    const filteredUnassignedEmployees = unassignedEmployees.filter((emp) =>
        emp.name.toLowerCase().includes(filterText.toLowerCase())
    );

    const currentEmployees = showUnassigned ? filteredUnassignedEmployees : filteredEmployees;

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Rechercher un agent..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {unassignedEmployees.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-center space-x-4">
                        <button
                            onClick={() => setShowUnassigned(false)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                !showUnassigned ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            En mission ({filteredEmployees.length})
                        </button>
                        <button
                            onClick={() => setShowUnassigned(true)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                showUnassigned ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Disponibles ({filteredUnassignedEmployees.length})
                        </button>
                    </div>
                </div>
            )}

            {showUnassigned && userRole === 'client' && (
                <div className="px-4 py-2 bg-blue-50 text-blue-600 text-xs text-center border-b border-blue-100">
                    Appuyez et maintenez pour glisser un agent sur la carte
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {currentEmployees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium text-gray-900">
                                {showUnassigned ? 'Aucun agent disponible' : 'Aucun agent en mission'}
                            </h3>
                            <p className="text-sm text-gray-500 max-w-xs">
                                {showUnassigned ? 'Tous les agents ont été affectés à leurs missions.' : 'Aucun agent n\'est actuellement en mission.'}
                            </p>
                        </div>
                    </div>
                ) : (
                    currentEmployees.map((employee) => (
                        <div
                            key={employee.id}
                            className={`flex items-center p-2 rounded-lg transition-all duration-200 ${
                                selectedEmployee?.id === employee.id ? 'bg-blue-50 border-2 border-blue-200' : 'bg-white border border-gray-200'
                            } ${touchDragState.isDragging && touchDragState.employee?.id === employee.id ? 'opacity-50' : ''}`}
                            onClick={() => handleEmployeeClick(employee)}
                            onTouchStart={showUnassigned && userRole === 'client' ? (e) => onTouchStart(e, employee) : undefined}
                            onTouchMove={touchDragState.isDragging ? onTouchMove : undefined}
                            onTouchEnd={touchDragState.isDragging ? onTouchEnd : undefined}
                        >
                            <div className="relative mr-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-inner"
                                    style={{ backgroundColor: employee.routeColor }}
                                >
                                    {employee.avatar}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${
                                    showUnassigned ? 'bg-blue-500' : 'bg-green-500'
                                }`}>
                                    {showUnassigned ? (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                        </svg>
                                    ) : (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{employee.name}</p>
                                <p className="text-xs text-gray-500 truncate">{employee.role}</p>
                            </div>
                            <div className="ml-2">
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    showUnassigned ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                                }`}>
                                    {showUnassigned ? 'Disponible' : 'En mission'}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MapContent;