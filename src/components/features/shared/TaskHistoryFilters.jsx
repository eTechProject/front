import React from 'react';
import { Search, Filter, X } from 'lucide-react';

const TaskHistoryFilters = ({ 
    searchTerm, 
    onSearchChange, 
    statusFilter, 
    onStatusChange,
    typeFilter,
    onTypeChange,
    agentFilter,
    onAgentChange,
    agents = [],
    onClearFilters
}) => {
    const statusOptions = [
        { value: '', label: 'Tous les statuts' },
        { value: 'completed', label: 'Terminée' },
        { value: 'pending', label: 'En attente' },
        { value: 'in_progress', label: 'En cours' },
        { value: 'cancelled', label: 'Annulée' }
    ];

    const typeOptions = [
        { value: '', label: 'Tous les types' },
        { value: 'patrouille', label: 'Patrouille' },
        { value: 'intervention', label: 'Intervention' },
        { value: 'surveillance', label: 'Surveillance' }
    ];

    const hasActiveFilters = searchTerm || statusFilter || typeFilter || agentFilter;

    return (
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
                <Filter className="h-5 w-5 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">Filtrer les tâches</h3>
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="ml-auto flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <X className="h-3 w-3" />
                        Réinitialiser
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search by name and description */}
                <div className="relative">
                    <label htmlFor="search" className="block text-xs font-medium text-gray-700 mb-1">
                        Rechercher (nom ou description)
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            id="search"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Rechercher..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Filter by status */}
                <div>
                    <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-1">
                        Statut
                    </label>
                    <select
                        id="status"
                        value={statusFilter}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Filter by type */}
                <div>
                    <label htmlFor="type" className="block text-xs font-medium text-gray-700 mb-1">
                        Type
                    </label>
                    <select
                        id="type"
                        value={typeFilter}
                        onChange={(e) => onTypeChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {typeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Filter by agent */}
                <div>
                    <label htmlFor="agent" className="block text-xs font-medium text-gray-700 mb-1">
                        Agent
                    </label>
                    <select
                        id="agent"
                        value={agentFilter}
                        onChange={(e) => onAgentChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Tous les agents</option>
                        {agents.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                                {agent.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default TaskHistoryFilters;
