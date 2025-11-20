import React from "react";
import { AlertCircle, Clock, MapPin, AlertTriangle, DollarSign, CheckCircle, Target } from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { useClientDashboard } from "@/hooks/features/client/dashboard/useClientDashboard.js";
import { useAuth } from "@/context/AuthContext.jsx";
import { useDashboardLogic } from "@/hooks/shared/useDashboardLogic.js";
import DateFilter from "@/components/features/shared/DateFilter.jsx";
import {ChartSkeleton, KPISkeleton} from "@/components/features/shared/DashboardSkeleton.jsx";
import KPIBox from "@/components/features/shared/KPIBox.jsx";
import ChartRenderer from "@/components/features/shared/ChartRenderer.jsx";
import TaskCard from "@/components/features/shared/TaskCard.jsx";
import Pagination from "@/components/features/shared/Pagination.jsx";
import TaskMapModal from "@/components/features/shared/TaskMapModal.jsx";
import TaskHistoryFilters from "@/components/features/shared/TaskHistoryFilters.jsx";

// Enregistrer les composants Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function DashboardContent() {
    const { dashboardData, pagination, isLoading, error, fetchDashboard } = useClientDashboard();
    const { user } = useAuth();

    const {
        selectedFilter,
        dateRange,
        setDateRange,
        currentPage,
        setCurrentPage,
        selectedTask,
        isModalOpen,
        filterOptions,
        handleFilterChange,
        handleOpenMap,
        handleCloseModal,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        typeFilter,
        setTypeFilter,
        agentFilter,
        setAgentFilter,
        handleClearFilters,
    } = useDashboardLogic(fetchDashboard, user.userId);

    const { kpis, charts, tasksHistory } = dashboardData;

    // Extract unique agents from tasks
    const agents = React.useMemo(() => {
        if (!tasksHistory || tasksHistory.length === 0) return [];
        const agentMap = new Map();
        tasksHistory.forEach(task => {
            if (task.agentId && task.agentName) {
                agentMap.set(task.agentId, { id: task.agentId, name: task.agentName });
            }
        });
        return Array.from(agentMap.values());
    }, [tasksHistory]);

    // Filter tasks based on search term (name/description), status, type, and agent
    const filteredTasks = React.useMemo(() => {
        if (!tasksHistory) return [];
        
        return tasksHistory.filter(task => {
            const matchesSearch = !searchTerm || 
                task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.orderDescription?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = !statusFilter || task.status === statusFilter;
            const matchesType = !typeFilter || task.type === typeFilter;
            const matchesAgent = !agentFilter || task.agentId === agentFilter;
            
            return matchesSearch && matchesStatus && matchesType && matchesAgent;
        });
    }, [tasksHistory, searchTerm, statusFilter, typeFilter, agentFilter]);

    return (
        <div className="w-full h-full p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Tableau de bord</h1>

                <DateFilter
                    selectedFilter={selectedFilter}
                    onFilterChange={handleFilterChange}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    filterOptions={filterOptions}
                />

                {error && (
                    <div className="bg-red-50 p-4 rounded-lg mb-6 flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {isLoading ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {[...Array(6)].map((_, i) => (
                                <KPISkeleton key={i} />
                            ))}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {[...Array(4)].map((_, i) => (
                                <ChartSkeleton key={i} />
                            ))}
                        </div>
                    </>
                ) : (
                    !error && (
                        <>
                            {/* KPIs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                <KPIBox icon={Target} label="Total Tâches" value={kpis.totalTasks} />
                                <KPIBox icon={CheckCircle} label="Taux de completion" value={kpis.completionRate} />
                                <KPIBox icon={Clock} label="Durée moyenne des tâches" value={kpis.avgTaskDuration} />
                                <KPIBox icon={MapPin} label="Distance moyenne par agent" value={kpis.avgDistancePerAgent} />
                                <KPIBox icon={AlertTriangle} label="Alerts" value={kpis.totalAlerts} />
                                <KPIBox icon={DollarSign} label="Abonnement" value={kpis.subscription} />
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {charts.tasksOverTime && charts.tasksOverTime.labels && charts.tasksOverTime.labels.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <ChartRenderer
                                            key={`tasksOverTime-${selectedFilter}-${currentPage}`}
                                            chartData={charts.tasksOverTime}
                                            title="Tâches dans le temps"
                                            type="bar"
                                        />
                                    </div>
                                )}
                                {charts.taskCompletion && charts.taskCompletion.labels && charts.taskCompletion.labels.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <ChartRenderer
                                            key={`taskCompletion-${selectedFilter}-${currentPage}`}
                                            chartData={charts.taskCompletion}
                                            title="Statut des tâches"
                                            type="doughnut"
                                        />
                                    </div>
                                )}
                                {charts.agentPunctuality && charts.agentPunctuality.labels && charts.agentPunctuality.labels.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <ChartRenderer
                                            key={`agentPunctuality-${selectedFilter}-${currentPage}`}
                                            chartData={charts.agentPunctuality}
                                            title="Ponctualité agents (%)"
                                            type="bar"
                                        />
                                    </div>
                                )}
                                {charts.averageResponseTime && charts.averageResponseTime.labels && charts.averageResponseTime.labels.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <ChartRenderer
                                            key={`averageResponseTime-${selectedFilter}-${currentPage}`}
                                            chartData={charts.averageResponseTime}
                                            title="Temps de réponse moyen (minutes)"
                                            type="bar"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Tasks History */}
                            {tasksHistory && tasksHistory.length > 0 && (
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            Historique des tâches ({pagination.total})
                                            <span className="text-sm font-normal text-gray-600 ml-2">
                                                - Cliquez sur une tâche pour voir sa localisation
                                            </span>
                                        </h2>
                                    </div>

                                    <TaskHistoryFilters
                                        searchTerm={searchTerm}
                                        onSearchChange={setSearchTerm}
                                        statusFilter={statusFilter}
                                        onStatusChange={setStatusFilter}
                                        typeFilter={typeFilter}
                                        onTypeChange={setTypeFilter}
                                        agentFilter={agentFilter}
                                        onAgentChange={setAgentFilter}
                                        agents={agents}
                                        onClearFilters={handleClearFilters}
                                    />

                                    {filteredTasks.length > 0 ? (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                                {filteredTasks.map((task) => (
                                                    <TaskCard
                                                        key={task.taskId}
                                                        task={task}
                                                        onOpenMap={handleOpenMap}
                                                    />
                                                ))}
                                            </div>
                                            <Pagination
                                                pagination={pagination}
                                                currentPage={currentPage}
                                                setCurrentPage={setCurrentPage}
                                                itemsLength={filteredTasks.length}
                                            />
                                        </>
                                    ) : (
                                        <div className="bg-gray-50 p-8 rounded-lg text-center">
                                            <p className="text-gray-600">Aucune tâche ne correspond aux critères de recherche.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Message si aucune tâche */}
                            {tasksHistory && tasksHistory.length === 0 && (
                                <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                                    <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche trouvée</h3>
                                    <p className="text-gray-500">Il n'y a pas de tâches pour la période sélectionnée.</p>
                                </div>
                            )}
                        </>
                    )
                )}

                <TaskMapModal
                    task={selectedTask}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    source="client-dashboard"
                    reportingEnabled={true}
                />
            </div>
        </div>
    );
}