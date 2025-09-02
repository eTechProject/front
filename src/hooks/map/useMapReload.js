import {useCallback, useEffect} from 'react';
import {useZone} from '@/hooks/features/zone/useZone.js';
import {useAuth} from '@/context/AuthContext.jsx';
import {mapReloadService} from "@/services/map/mapReloadService.js";

export const useMapReload = (setZoneData, setZoneAssignedAgents, setAssignedEmployees, setUnassignedEmployees, setZoneLoaded) => {
    const { user, userRole } = useAuth();
    const { getZone, getZoneByAgent, getAvailableAgent } = useZone();

    // Fonction pour extraire les coordonnées depuis une description
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

    // Fonction pour recharger les données
    const reloadMapData = useCallback(async () => {
        console.log('🔄 Reloading MapContent data...');
        setZoneLoaded(false);
        setAssignedEmployees([]);
        setUnassignedEmployees([]);
        setZoneAssignedAgents([]);

        if (!user?.userId) return;
        let result;
        if (userRole === 'client') {
            result = await getZone(user.userId);
        } else if (userRole === 'agent') {
            result = await getZoneByAgent(user.userId);
        }
        if (result.success && result.data) {
            console.log('Zone data reloaded:', result.data);
            setZoneData(result.data);
            if (result.data.assignedAgents?.length > 0) {
                const formattedZoneAgents = result.data.assignedAgents
                    .filter(assignedAgent => assignedAgent.agent?.user)
                    .map(assignedAgent => {
                        const agent = assignedAgent.agent;
                        const userObj = agent.user;
                        const name = userObj.name || 'Agent inconnu';
                        const initials = name.split(' ').map(n => n[0]).join('');
                        let position = null;
                        if (
                            assignedAgent.currentPosition &&
                            typeof assignedAgent.currentPosition === 'object' &&
                            assignedAgent.currentPosition.latitude !== undefined &&
                            assignedAgent.currentPosition.longitude !== undefined
                        ) {
                            position = {
                                lat: assignedAgent.currentPosition.latitude,
                                lng: assignedAgent.currentPosition.longitude,
                            };
                        } else if (
                            assignedAgent.task?.assignPosition &&
                            Array.isArray(assignedAgent.task.assignPosition) &&
                            assignedAgent.task.assignPosition.length === 2
                        ) {
                            position = {
                                lat: assignedAgent.task.assignPosition[0],
                                lng: assignedAgent.task.assignPosition[1],
                            };
                        } else if (assignedAgent.task?.description) {
                            position = extractCoordinates(assignedAgent.task.description);
                        }
                        return {
                            id: agent.agentId,
                            assignmentId: assignedAgent.id,
                            name: name,
                            avatar: initials,
                            email: userObj.email,
                            role: userObj.role,
                            routeColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                            position: position,
                            task: assignedAgent.task,
                            phone: userObj.phone || 'Non renseigné',
                            address: agent.address,
                            sexe: agent.sexe,
                            serviceOrder: result.data.serviceOrder,
                        };
                    });
                setZoneAssignedAgents(formattedZoneAgents);
                const assignedAgentsFromAPI = formattedZoneAgents.map(agent => ({
                    ...agent,
                    route: [],
                }));
                setAssignedEmployees(assignedAgentsFromAPI);
                if (userRole === 'client') {
                    const assignedIds = assignedAgentsFromAPI.map(agent => agent.id);
                    setUnassignedEmployees(prev => prev.filter(emp => !assignedIds.includes(emp.id)));
                }
            }
            setZoneLoaded(true);
        }

        if (userRole === 'client') {
            const result = await getAvailableAgent();
            if (result.success && result.data?.length > 0) {
                const formattedAgents = result.data.map(agent => ({
                    id: agent.agentId,
                    name: agent.user.name,
                    avatar: agent.user.name.split(' ').map(n => n[0]).join(''),
                    email: agent.user.email,
                    role: agent.user.role,
                    routeColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                    position: agent.currentPosition,
                    phone: agent.user.phone || 'Non renseigné',
                    task: null,
                    serviceOrder: null,
                }));
                setUnassignedEmployees(formattedAgents);
            } else {
                console.log('Aucun agent disponible trouvé via l\'API');
            }
        }
    }, [user?.userId, userRole, getZone, getZoneByAgent, getAvailableAgent, setZoneData, setZoneAssignedAgents, setAssignedEmployees, setUnassignedEmployees, setZoneLoaded]);

    // S'abonner aux événements de rechargement
    useEffect(() => {
        return mapReloadService.subscribe((eventData) => {
            console.log('apContent reload event received:', eventData);
            reloadMapData().then();
        });
    }, [reloadMapData]);

    return { reloadMapData };
};