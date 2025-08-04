import React, {useState, useCallback} from 'react';
import {
    Search,
    User,
    Users,
    ToggleLeft,
    ToggleRight,
    GripHorizontal,
    MapPin,
    Calendar,
    ChevronDown
} from 'lucide-react';

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
                      }) => {
    const [showUnassigned, setShowUnassigned] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    const filteredEmployees = useCallback(() =>
            employees.filter(emp => emp.name.toLowerCase().includes(filterText.toLowerCase())),
        [employees, filterText]
    );

    const filteredUnassignedEmployees = useCallback(() =>
            unassignedEmployees.filter(emp => emp.name.toLowerCase().includes(filterText.toLowerCase())),
        [unassignedEmployees, filterText]
    );

    const handleDragStart = useCallback((e, employee) => {
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

    const currentEmployees = showUnassigned ? filteredUnassignedEmployees() : filteredEmployees();

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
                        aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
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
                {/* View Toggle */}
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

                {/* Instruction Banner */}
                {showUnassigned && (
                    <div className="px-4 py-2 bg-blue-50 text-blue-600 text-xs border-b border-blue-100">
                        <p>Glissez un agent sur la carte pour l'affecter à une mission</p>
                    </div>
                )}

                {/* Employee List */}
                <div className="p-2 space-y-2 overflow-y-auto">
                    {currentEmployees.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            {showUnassigned ? 'Aucun agent disponible' : 'Aucun agent en mission'}
                        </div>
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
                                draggable={showUnassigned}
                                onDragStart={showUnassigned ? (e) => handleDragStart(e, employee) : undefined}
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
                                    rounded-full whitespace-nowrap hover:scale-105 transition-transform duration-150">
                                        En mission
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

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