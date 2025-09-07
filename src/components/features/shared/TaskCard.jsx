import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const TaskCard = ({ task, onOpenMap }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'patrouille':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed':
                return 'Terminée';
            case 'pending':
                return 'En attente';
            case 'in_progress':
                return 'En cours';
            case 'cancelled':
                return 'Annulée';
            default:
                return status;
        }
    };

    return (
        <div
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => onOpenMap(task)}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                        {task.description || 'Tâche sans description'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                        {task.orderDescription || 'Aucune description'}
                    </p>
                </div>
                <div className="flex flex-col space-y-1">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(task.status)}`}>
                        {getStatusText(task.status)}
                    </span>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getTypeColor(task.type)}`}>
                        {task.type}
                    </span>
                </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>
                        {format(new Date(task.startDate), 'dd/MM/yyyy HH:mm')} -
                        {format(new Date(task.endDate), 'dd/MM/yyyy HH:mm')}
                    </span>
                </div>

                {task.assignPosition && (
                    <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-600 font-medium">
                            Cliquer pour voir la localisation
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskCard;