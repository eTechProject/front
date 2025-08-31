import React, { useState, useCallback } from 'react';
import {
    Search,
    User,
    Users,
    ToggleLeft,
    ToggleRight,
    GripHorizontal,
    MapPin,
    Calendar,
    ChevronDown,
    RefreshCw,
    AlertCircle
} from 'lucide-react';

/**
 * Liste des employés/agents (affectés et non affectés, selon les props)
 * Le drag&drop n'est actif que pour les agents non affectés (mode client)
 */
const EmployeeList = ({
                          employees = [],
                          unassignedEmployees = [],
                          filterText = '',
                          setFilterText = () => {},
                          handleEmployeeClick = () => {},
                          selectedEmployee = null,
                          formatDate = (date) => date.toLocaleDateString('fr-FR'),
                          onDragStart = () => {},
                          onDragEnd = () => {},
                          onReloadData = () => {},
                          isAgentMode = false
                      }) => {
    const [showUnassigned, setShowUnassigned] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    // Auto-basculement vers les agents assignés quand plus d'agents non affectés
    React.useEffect(() => {
        if (showUnassigned && filteredUnassignedEmployees().length === 0 && unassignedEmployees.length === 0) {
            setShowUnassigned(false);
        }
    }, [unassignedEmployees, showUnassigned]);

    // Filtrer la recherche
    const filteredEmployees = useCallback(() =>
            employees.filter(emp => emp.name.toLowerCase().includes(filterText.toLowerCase())),
        [employees, filterText]
    );

    const filteredUnassignedEmployees = useCallback(() =>
            unassignedEmployees.filter(emp => emp.name.toLowerCase().includes(filterText.toLowerCase())),
        [unassignedEmployees, filterText]
    );

    // Si pas d'unassignedEmployees, le toggle n'affiche que les agents en mission (mode agent)
    const currentEmployees = showUnassigned ? filteredUnassignedEmployees() : filteredEmployees();

    // Dragstart personnalisé pour drag&drop natif HTML
    const handleDragStartInternal = useCallback((e, employee) => {
        // Crée un petit preview drag
        const dragPreview = document.createElement('div');
        dragPreview.className = 'absolute opacity-90 pointer-events-none';
        dragPreview.innerHTML = `
            <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg" 
                 style="background-color: ${employee.routeColor || '#9CA3AF'}">
                ${employee.avatar}
            </div>
        `;
        document.body.appendChild(dragPreview);
        e.dataTransfer.setDragImage(dragPreview, 24, 24);
        e.dataTransfer.setData('application/json', JSON.stringify(employee));
        if (onDragStart) onDragStart(employee);
        setTimeout(() => document.body.removeChild(dragPreview), 0);
    }, [onDragStart]);

    const EmployeeListSkeleton = () => (
        <div className="p-2 space-y-2 overflow-hidden">
            {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center p-3 rounded-lg border border-gray-100 animate-pulse">
                    <div className="relative mr-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-200"></div>
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                        <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-5 w-16 bg-gray-200 rounded-full ml-2"></div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-sm">
            {/* Header Section */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <Calendar className="text-gray-500" size={18}/>
                        <span className="text-sm font-medium text-gray-700">
                            {formatDate(new Date())}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                        aria-label={isExpanded ? "Réduire le panneau" : "Développer le panneau"}
                    >
                        <ChevronDown
                            size={18}
                            className={`transform transition-transform duration-200 ${isExpanded ? '' : 'rotate-180'}`}
                        />
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16}/>
                    <input
                        type="text"
                        placeholder="Rechercher un agent..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            transition-all duration-200"
                    />
                </div>
            </div>
            {/* Content */}
            <div className={`flex-1 overflow-hidden transition-all duration-300 ${
                isExpanded ? 'opacity-100' : 'opacity-0 max-h-0'
            }`}>
                {/* View Toggle - affiché uniquement si des non affectés existent et en mode client */}
                {!isAgentMode && unassignedEmployees.length > 0 && (
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <button
                            onClick={() => setShowUnassigned(!showUnassigned)}
                            className="flex items-center justify-between w-full text-left hover:bg-gray-100
                                -mx-2 px-2 py-1 rounded-md transition-colors duration-150"
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`p-1.5 rounded-full transition-colors duration-200 ${
                                    showUnassigned ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {showUnassigned ? <Users size={16}/> : <User size={16}/>}
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    {showUnassigned ? 'Agents non affectés' : 'Agents en mission'}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-xs font-medium px-2 py-1 bg-white rounded-full">
                                    {currentEmployees.length}
                                </span>
                                <div className={`transition-colors duration-200 ${
                                    showUnassigned ? 'text-blue-600' : 'text-gray-400'
                                }`}>
                                    {showUnassigned ? <ToggleRight size={18}/> : <ToggleLeft size={18}/>}
                                </div>
                            </div>
                        </button>
                    </div>
                )}

                {/* Instruction Banner - affiché uniquement en mode client */}
                {showUnassigned && !isAgentMode && (
                    <div className="px-4 py-2 bg-blue-50 text-blue-600 text-xs border-b border-blue-100">
                        <p>Glissez un agent sur la carte pour l'affecter à une mission</p>
                    </div>
                )}

                {/* Employee List */}
                <div className="p-2 space-y-2 overflow-y-auto">
                    {currentEmployees.length === 0 ? (
                        showUnassigned && unassignedEmployees.length === 0 && !isAgentMode ? (
                            // Tous les agents ont été assignés (mode client)
                            <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                    <Users className="text-green-600" size={24} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Tous les agents ont été affectés !
                                    </h3>
                                    <p className="text-sm text-gray-500 max-w-xs">
                                        Parfait ! Tous vos agents sont maintenant assignés à leurs missions.
                                    </p>
                                </div>
                                {onReloadData && (
                                    <button
                                        onClick={onReloadData}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white
                                            rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                                    >
                                        <RefreshCw size={16} />
                                        <span>Recharger les données</span>
                                    </button>
                                )}
                            </div>
                        ) : !showUnassigned && employees.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                    <AlertCircle className="text-gray-500" size={24} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {isAgentMode ? 'Vous n\'êtes assigné à aucune zone' : 'Aucun agent sur le terrain'}
                                    </h3>
                                    <p className="text-sm text-gray-500 max-w-xs">
                                        {isAgentMode
                                            ? 'Vous n\'avez actuellement aucune mission assignée.'
                                            : 'Aucun agent n\'est actuellement assigné à une mission.'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <EmployeeListSkeleton />
                        )
                    ) : (
                        currentEmployees.map((employee, index) => (
                            <div
                                key={employee.id}
                                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200
                                    hover:shadow-sm hover:scale-[1.01] active:scale-[0.99]
                                    ${
                                    selectedEmployee?.id === employee.id
                                        ? 'bg-blue-50 border-l-4 border-blue-500'
                                        : 'bg-white border border-gray-100 hover:bg-gray-50'
                                }`}
                                style={{animationDelay: `${index * 50}ms`}}
                                draggable={showUnassigned && !isAgentMode} // Drag-and-drop désactivé en mode agent
                                onDragStart={showUnassigned && !isAgentMode ? (e) => handleDragStartInternal(e, employee) : undefined}
                                onDragEnd={onDragEnd}
                                onClick={() => handleEmployeeClick(employee)}
                            >
                                <div className="relative mr-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm
                                            font-semibold shadow-inner hover:scale-105 transition-transform duration-150"
                                        style={{backgroundColor: employee.routeColor}}
                                    >
                                        {employee.avatar}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center 
                                            justify-center shadow-sm transition-transform duration-150 hover:scale-110 ${
                                        showUnassigned ? 'bg-blue-500' : 'bg-green-500'
                                    }`}>
                                        {showUnassigned ? (
                                            <GripHorizontal className="text-white" size={10}/>
                                        ) : (
                                            <MapPin className="text-white" size={10}/>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{employee.name}</p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {employee.role}
                                    </p>
                                </div>
                                {!showUnassigned && (
                                    <div className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium
                                        rounded-md whitespace-nowrap hover:scale-105 transition-transform duration-150">
                                        En mission
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Success notification quand basculement automatique */}
            {unassignedEmployees.length === 0 && employees.length > 0 && !showUnassigned && !isAgentMode && (
                <div className="px-4 py-2 bg-green-50 border-t border-green-100">
                    <div className="flex items-center space-x-2 text-green-700 text-xs">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Tous les agents ont été affectés avec succès</span>
                    </div>
                </div>
            )}
            <style>
                {`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                `}
            </style>
        </div>
    );
};

export default EmployeeList;