import React from 'react';
import {Star, Clock, Phone, Mail, X, User} from 'lucide-react';
import {useOrderService} from '@/hooks/features/task/useOrderService.js';
import toast from 'react-hot-toast';
import {mapReloadService} from '@/services/map/mapReloadService.js';
import {useAuth} from "@/context/AuthContext.jsx";

const EmployeeCard = ({
                          employee, onClose, position, isDragging, onMouseDown, getStatusColor, onMouseMove, onMouseUp,
                      }) => {
    const {cancelTask, isLoading, error} = useOrderService();
    const {userRole} = useAuth();
    const handleCancelTask = async () => {
        if (!employee.task?.id) {
            console.error('No task ID available for cancellation');
            toast.error("Aucun ID de tâche disponible pour l'annulation");
            return;
        }

        const response = await cancelTask(employee.task.id);
        if (response.success) {
            toast.success('Tâche annulée avec succès !');
            console.log('Task cancelled successfully:', response.data);
            onClose();
            // Déclencher le rechargement via le service
            mapReloadService.triggerReload('taskCancelled');
        } else {
            console.error('Failed to cancel task:', response.error);
            toast.error(response.error || "Échec de l'annulation de la tâche");
        }
    };

    return (<div
            className="absolute w-80 bg-white rounded-xl shadow-2xl border overflow-hidden z-[1000] select-none"
            style={{
                left: `${position.x}px`, top: `${position.y}px`, cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={onMouseDown}
            onMouseMove={isDragging ? onMouseMove : null}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
        >
            <div className="relative">
                <div
                    className="h-20 bg-gradient-to-r cursor-grab"
                    style={{
                        background: `linear-gradient(135deg, ${employee.routeColor}, ${employee.routeColor}88)`,
                    }}
                />
                <button
                    className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors"
                    onClick={onClose}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <X size={16} className="text-gray-600"/>
                </button>
                <div className="absolute -bottom-8 left-6">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold border-4 border-white shadow-lg"
                        style={{backgroundColor: employee.routeColor}}
                    >
                        {employee.avatar}
                    </div>
                </div>
            </div>
            <div className="pt-12 px-6 pb-6">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{employee.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                        <User size={14} className="text-gray-500"/>
                        {employee.role}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Mail size={14} className="text-gray-500"/>
                        {employee.email || 'Non spécifié'}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Phone size={14} className="text-gray-500"/>
                        {employee.phone || 'Non spécifié'}
                    </p>
                </div>
                {employee.task && (<div className="border-t pt-4 mt-4 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                            <Clock size={16} className="text-gray-600"/>
                            Détails de la tâche
                        </h4>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Statut:</span>
                            <span
                                className={`px-2 py-1 rounded-lg text-xs font-medium text-white ${getStatusColor(employee.task.status)}`}
                            >
                {employee.task.status || 'N/A'}
              </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Type:</span>
                            <span className="text-sm text-gray-600">{employee.task.type || 'Non spécifié'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Début:</span>
                            <span className="text-sm text-gray-600">
                                {employee.task.startDate ? new Date(employee.task.startDate).toLocaleString('fr-FR') : 'Non spécifié'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Fin:</span>
                            <span className="text-sm text-gray-600">
                                {employee.task.endDate ? new Date(employee.task.endDate).toLocaleString('fr-FR') : 'Non spécifié'}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-700">Description:</span>
                                        <span className="text-sm text-gray-600">
                            {employee.task.description || 'Aucune description'}
                          </span>
                        </div>
                        {
                            userRole==="client"&& (
                                <button
                                    className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                                    onClick={handleCancelTask}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    disabled={isLoading}
                                >
                                    <X size={16}/>
                                    {isLoading ? 'Annulation en cours...' : 'Terminer la tâche'}
                                </button>
                            )
                        }
                        {error && (<p className="text-red-500 text-sm mt-2">{error}</p>)}
                </div>
                )}
            </div>
        </div>);
};

export default EmployeeCard;