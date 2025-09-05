import React, { useEffect, useState } from "react";
import { AlertCircle, Clock, MapPin, AlertTriangle, DollarSign, CheckCircle, Target, ChevronLeft, ChevronRight } from "lucide-react";
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { useClientDashboard } from "@/hooks/features/client/dashboard/useClientDashboard.js";
import { useAuth } from "@/context/AuthContext.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import TaskMapModal from "@/components/features/shared/TaskMapModal.jsx";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement);

const createGradient = (ctx, chartArea) => {
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, 'rgba(54, 162, 235, 0.8)'); // Start color (light blue)
    gradient.addColorStop(1, 'rgba(75, 192, 192, 0.6)'); // End color (teal)
    return gradient;
};

const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

const KPISkeleton = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
        </div>
    </div>
);

const ChartSkeleton = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-64 w-full" />
    </div>
);

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

export default function DashboardContent() {
    const { dashboardData, pagination, isLoading, error, fetchDashboard } = useClientDashboard();
    const { user } = useAuth();
    const [selectedFilter, setSelectedFilter] = useState("today");
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedTask, setSelectedTask] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const limit = 10;

    const filterOptions = [
        { label: "Aujourd'hui", value: "today" },
        { label: "7 derniers jours", value: "last7days" },
        { label: "Cette semaine", value: "week" },
        { label: "Ce mois", value: "thisMonth" },
        { label: "30 derniers jours", value: "last30days" },
        { label: "Cette année", value: "thisYear" },
        { label: "Personnalisé", value: "custom" },
    ];

    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
        setCurrentPage(1);
    };

    const handleOpenMap = (task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    const handlePrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(pagination.pages, prev + 1));

    useEffect(() => {
        const fetchData = async () => {
            let params = {};

            switch (selectedFilter) {
                case "today":
                case "last7days":
                case "week":
                case "thisMonth":
                case "last30days":
                case "thisYear":
                    params = {
                        choice: selectedFilter,
                        page: currentPage,
                        limit: limit
                    };
                    break;
                case "custom":
                    if (startDate && endDate) {
                        params = {
                            dateStart: format(startDate, "yyyy-MM-dd"),
                            dateEnd: format(endDate, "yyyy-MM-dd"),
                            page: currentPage,
                            limit: limit
                        };
                    } else {
                        return;
                    }
                    break;
                default:
                    params = {
                        choice: "today",
                        page: currentPage,
                        limit: limit
                    };
            }

            if (Object.keys(params).length > 0) {
                const response = await fetchDashboard(user.userId, params);
                console.log("Dashboard Data:", response.data);
            }
        };

        fetchData().then();
    }, [user.userId, selectedFilter, startDate, endDate, currentPage]);

    const { kpis, charts, tasksHistory } = dashboardData;

    const renderChart = (chartData, title, type) => {
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 14 },
                        color: '#333',
                        boxWidth: 20,
                        padding: 10,
                    },
                },
                title: {
                    display: true,
                    text: title,
                    font: { size: 18, weight: 'bold' },
                    color: '#2d3748',
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 12 },
                    padding: 10,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#4a5568', font: { size: 12 } },
                    grid: { color: 'rgba(0, 0, 0, 0.1)' },
                },
                x: {
                    ticks: { color: '#4a5568', font: { size: 12 } },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                },
            },
        };

        const ctx = document.createElement('canvas').getContext('2d');
        const chartArea = { top: 0, bottom: 200 }; // Approximate chart area for gradient

        if (type === 'doughnut') {
            const orderedLabels = ["pending", "in_progress", "completed", "cancelled"];
            const orderedData = [
                chartData.data[chartData.labels.indexOf("pending")] || 0,
                chartData.data[chartData.labels.indexOf("in_progress")] || 0,
                chartData.data[chartData.labels.indexOf("completed")] || 0,
                chartData.data[chartData.labels.indexOf("cancelled")] || 0,
            ];

            const data = {
                labels: orderedLabels,
                datasets: [{
                    data: orderedData,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'], // Red, Blue, Yellow, Teal
                    borderColor: '#fff',
                    borderWidth: 2,
                    hoverOffset: 10,
                }],
            };

            return <Doughnut data={data} options={commonOptions} className="w-full h-64" />;
        } else {
            const data = {
                labels: chartData.labels || [],
                datasets: [{
                    label: title,
                    data: chartData.data || [],
                    backgroundColor: createGradient(ctx, chartArea),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    borderRadius: 5,
                    barThickness: 40,
                }],
            };

            return <Bar data={data} options={commonOptions} className="w-full h-64" />;
        }
    };

    const KPIBox = ({ icon: Icon, label, value, unit = '' }) => (
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4">
            <Icon className="h-8 w-8 text-orange-500" />
            <div>
                <p className="text-sm text-gray-600">{label}</p>
                <p className="text-lg font-semibold text-gray-900">{value}{unit}</p>
            </div>
        </div>
    );

    return (
        <div className="w-full h-full p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Tableau de bord</h1>

                <div className="mb-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {filterOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleFilterChange(option.value)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    selectedFilter === option.value
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {selectedFilter === "custom" && (
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="text-sm font-medium text-gray-600 mb-2">Plage de dates personnalisée</h3>
                            <DatePicker
                                selectsRange
                                startDate={startDate}
                                endDate={endDate}
                                onChange={(update) => {
                                    setDateRange(update);
                                    if (update[0] && update[1]) {
                                        console.log({
                                            filter: "custom",
                                            params: {
                                                dateStart: format(update[0], "yyyy-MM-dd"),
                                                dateEnd: format(update[1], "yyyy-MM-dd"),
                                            },
                                        });
                                    }
                                }}
                                isClearable
                                placeholderText="Sélectionnez une plage de dates"
                                className="w-full p-2 border rounded-lg text-sm"
                                dateFormat="dd/MM/yyyy"
                            />
                        </div>
                    )}
                </div>

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
                                <KPIBox icon={MapPin} label="Distance moyenne par agent" value={kpis.avgDistancePerAgent} unit="" />
                                <KPIBox icon={AlertTriangle} label="Alerts" value={kpis.totalAlerts} />
                                <KPIBox icon={DollarSign} label="Abonnement" value={kpis.subscription} />
                            </div>

                            {/* Charts - Conversion line en bar, garde doughnut */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {charts.tasksOverTime && charts.tasksOverTime.labels && charts.tasksOverTime.labels.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        {renderChart(charts.tasksOverTime, "Tâches dans le temps", "bar")}
                                    </div>
                                )}
                                {charts.taskCompletion && charts.taskCompletion.labels && charts.taskCompletion.labels.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        {renderChart(charts.taskCompletion, "Statut des tâches", "doughnut")}
                                    </div>
                                )}
                                {charts.agentPunctuality && charts.agentPunctuality.labels && charts.agentPunctuality.labels.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        {renderChart(charts.agentPunctuality, "Ponctualité agents (%)", "bar")}
                                    </div>
                                )}
                                {charts.averageResponseTime && charts.averageResponseTime.labels && charts.averageResponseTime.labels.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        {renderChart(charts.averageResponseTime, "Temps de réponse moyen (minutes)", "bar")}
                                    </div>
                                )}
                            </div>

                            {/* Tasks History avec pagination */}
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                        {tasksHistory.map((task) => (
                                            <TaskCard
                                                key={task.taskId}
                                                task={task}
                                                onOpenMap={handleOpenMap}
                                            />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    <div className="px-4 sm:px-6 py-4 border-t bg-gray-50 rounded-b-lg">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                                            <div className="text-sm text-gray-500 text-center sm:text-left">
                                                Page <span className="font-medium">{pagination.page}</span> sur <span className="font-medium">{pagination.pages}</span> —
                                                <span className="block sm:inline"> Affichage de <span className="font-medium">{tasksHistory.length}</span> sur <span className="font-medium">{pagination.total}</span> tâche(s)</span>
                                            </div>
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    onClick={handlePrevPage}
                                                    disabled={pagination.page <= 1}
                                                >
                                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                                    Précédent
                                                </button>

                                                {/* Affichage des numéros de page */}
                                                <div className="hidden sm:flex space-x-1">
                                                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                                        let pageNum;
                                                        if (pagination.pages <= 5) {
                                                            pageNum = i + 1;
                                                        } else if (pagination.page <= 3) {
                                                            pageNum = i + 1;
                                                        } else if (pagination.page >= pagination.pages - 2) {
                                                            pageNum = pagination.pages - 4 + i;
                                                        } else {
                                                            pageNum = pagination.page - 2 + i;
                                                        }

                                                        return (
                                                            <button
                                                                key={pageNum}
                                                                onClick={() => setCurrentPage(pageNum)}
                                                                className={`px-3 py-2 border text-sm rounded-md transition-colors ${
                                                                    pagination.page === pageNum
                                                                        ? 'bg-zinc-600 text-white'
                                                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                <button
                                                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    onClick={handleNextPage}
                                                    disabled={pagination.page >= pagination.pages}
                                                >
                                                    Suivant
                                                    <ChevronRight className="h-4 w-4 ml-1" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
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
                />
            </div>
        </div>
    );
}