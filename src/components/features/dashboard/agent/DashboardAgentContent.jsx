import React from "react";
import { AlertCircle, Clock, MapPin, Target, CheckCircle, Users } from "lucide-react";
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
import { useAgentDashboard } from "@/hooks/features/agent/useAgentDashboard.js";
import { useDashboardLogic } from "@/hooks/shared/useDashboardLogic.js";
import TaskMapModal from "@/components/features/shared/TaskMapModal.jsx";
import DateFilter from "@/components/features/shared/DateFilter.jsx";
import {ChartSkeleton, KPISkeleton} from "@/components/features/shared/DashboardSkeleton.jsx";
import KPIBox from "@/components/features/shared/KPIBox.jsx";
import ChartRenderer from "@/components/features/shared/ChartRenderer.jsx";
import TaskCard from "@/components/features/shared/TaskCard.jsx";
import Pagination from "@/components/features/shared/Pagination.jsx";


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

export default function AgentDashboard() {
    const { dashboardData, pagination, isLoading, error, fetchDashboard } = useAgentDashboard();

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
    } = useDashboardLogic(fetchDashboard);

    const { kpis, charts, tasks } = dashboardData;

    return (
        <div className="w-full h-full p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Tableau de bord Agent</h1>

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
                            {[...Array(5)].map((_, i) => (
                                <KPISkeleton key={i} />
                            ))}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {[...Array(2)].map((_, i) => (
                                <ChartSkeleton key={i} />
                            ))}
                        </div>
                    </>
                ) : (
                    !error && (
                        <>
                            {/* KPIs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                                <KPIBox icon={Target} label="Total Tâches" value={kpis?.totalTasks || 0} />
                                <KPIBox icon={CheckCircle} label="Taux de completion" value={kpis?.completionRate || '0%'} />
                                <KPIBox icon={Clock} label="Durée moyenne" value={kpis?.avgTaskDuration || '0h 00m'} />
                                <KPIBox icon={MapPin} label="Distance moyenne" value={kpis?.avgDistance || '0 km'} />
                                <KPIBox icon={Users} label="Ponctualité" value={kpis?.agentPunctuality || '0%'} />
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {charts?.tasksOverTime && charts.tasksOverTime.labels && charts.tasksOverTime.labels.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <ChartRenderer
                                            key={`tasksOverTime-${selectedFilter}-${currentPage}`}
                                            chartData={charts.tasksOverTime}
                                            title="Tâches dans le temps"
                                            type="bar"
                                        />
                                    </div>
                                )}
                                {charts?.taskCompletion && charts.taskCompletion.labels && charts.taskCompletion.labels.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <ChartRenderer
                                            key={`taskCompletion-${selectedFilter}-${currentPage}`}
                                            chartData={charts.taskCompletion}
                                            title="Statut des tâches"
                                            type="doughnut"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Tasks List */}
                            {tasks && tasks.length > 0 && (
                                <div className="bg-white p-6 rounded-lg shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            Historique des tâches ({pagination.total})
                                            <span className="text-sm font-normal text-gray-600 ml-2">
                                                - Cliquez sur une tâche pour voir sa localisation
                                            </span>
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                        {tasks.map((task) => (
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
                                        itemsLength={tasks.length}
                                    />
                                </div>
                            )}

                            {/* Message si aucune tâche */}
                            {tasks && tasks.length === 0 && (
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
                    source="agent-dashboard"
                    reportingEnabled={true}
                />
            </div>
        </div>
    );
}