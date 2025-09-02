import React, { useEffect, useState } from "react";
import { AlertCircle, Clock, MapPin, AlertTriangle, DollarSign, CheckCircle } from "lucide-react";
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { useClientDashboard } from "@/hooks/features/client/dashboard/useClientDashboard.js";
import { useAuth } from "@/context/AuthContext.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

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

export default function DashboardContent() {
    const { dashboardData, isLoading, error, fetchDashboard } = useClientDashboard();
    const { user } = useAuth();
    const [selectedFilter, setSelectedFilter] = useState("today");
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    const filterOptions = [
        { label: "Aujourd'hui", value: "today" },
        { label: "Cette semaine", value: "week" },
        { label: "Ce mois", value: "month" },
        { label: "Cette année", value: "year" },
        { label: "Personnalisé", value: "custom" },
    ];

    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
        let params = {};

        switch (filter) {
            case "today":
            case "week":
            case "month":
            case "year":
                params = { choice: filter };
                break;
            case "custom":
                if (startDate && endDate) {
                    params = {
                        dateStart: format(startDate, "yyyy-MM-dd"),
                        dateEnd: format(endDate, "yyyy-MM-dd"),
                    };
                }
                break;
            default:
                // eslint-disable-next-line no-unused-vars
                params = {};
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            let params = {};

            switch (selectedFilter) {
                case "today":
                case "week":
                case "month":
                case "year":
                    params = { choice: selectedFilter };
                    break;
                case "custom":
                    if (startDate && endDate) {
                        params = {
                            dateStart: format(startDate, "yyyy-MM-dd"),
                            dateEnd: format(endDate, "yyyy-MM-dd"),
                        };
                    } else {
                        return;
                    }
                    break;
                default:
                    params = {};
            }

            if (Object.keys(params).length > 0) {
                const response = await fetchDashboard(user.userId, params);
                console.log("Dashboard Data:", response.data);
            }
        };

        fetchData().then();
    }, [fetchDashboard, user.userId, selectedFilter, startDate, endDate]);

    const { kpis, charts } = dashboardData;

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
        } else if (type === 'line') {
            const data = {
                labels: chartData.labels || [],
                datasets: [{
                    label: title,
                    data: chartData.data || [],
                    borderColor: createGradient(ctx, chartArea),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: 'rgba(75, 192, 192, 1)',
                    pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
                    pointHoverBorderColor: '#fff',
                    tension: 0.4, // Smooth curves
                }],
            };

            return <Line data={data} options={{ ...commonOptions, scales: { y: { beginAtZero: true } } }} className="w-full h-64" />;
        } else { // bar
            const data = {
                labels: chartData.labels || [],
                datasets: [{
                    label: title,
                    data: chartData.data || [],
                    backgroundColor: createGradient(ctx, chartArea),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    borderRadius: 5,
                    barThickness: 20,
                }],
            };

            return <Bar data={data} options={commonOptions} className="w-full h-64" />;
        }
    };

    const KPIBox = ({ icon: Icon, label, value, unit = '' }) => (
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4">
            <Icon className="h-8 w-8 text-gray-500" />
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                <KPIBox icon={Clock} label="Total Tâches" value={kpis.totalTasks} />
                                <KPIBox icon={CheckCircle} label="Taux de completion" value={kpis.completionRate} />
                                <KPIBox icon={Clock} label="Durée moyenne des tâches" value={kpis.avgTaskDuration} />
                                <KPIBox icon={MapPin} label="Distance moyenne par agent" value={kpis.avgDistancePerAgent} unit="" />
                                <KPIBox icon={AlertTriangle} label="Alerts" value={kpis.totalAlerts} />
                                <KPIBox icon={DollarSign} label="Abonnement" value={kpis.subscription} />
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {charts.tasksOverTime && charts.tasksOverTime.labels && charts.tasksOverTime.labels.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        {renderChart(charts.tasksOverTime, "Tasks Over Time", "bar")}
                                    </div>
                                )}
                                {charts.taskCompletion && charts.taskCompletion.labels && charts.taskCompletion.labels.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        {renderChart(charts.taskCompletion, "Completion Status", charts.taskCompletion.type)}
                                    </div>
                                )}
                                {charts.agentPunctuality && charts.agentPunctuality.labels && charts.agentPunctuality.labels.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        {renderChart(charts.agentPunctuality, "Agent Punctuality (%)", charts.agentPunctuality.type)}
                                    </div>
                                )}
                                {charts.averageResponseTime && charts.averageResponseTime.labels && charts.averageResponseTime.labels.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        {renderChart(charts.averageResponseTime, "Average Response Time (minutes)", charts.averageResponseTime.type)}
                                    </div>
                                )}
                            </div>
                        </>
                    )
                )}
            </div>
        </div>
    );
}