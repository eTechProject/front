import React, { useEffect, useState } from "react";
import { AlertCircle, Users, Clock, MapPin, AlertTriangle, DollarSign } from "lucide-react";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useClientDashboard } from "@/hooks/features/client/dashboard/useClientDashboard.js";
import { useAuth } from "@/context/AuthContext.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

const IndicatorsSkeleton = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <Skeleton className="h-6 w-1/4" />
        <div className="space-y-4">
            <div>
                <Skeleton className="h-5 w-1/5 mb-2" />
                <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                    ))}
                </div>
            </div>
            <div>
                <Skeleton className="h-5 w-1/5 mb-2" />
                <div className="space-y-2">
                    {[...Array(2)].map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                    ))}
                </div>
            </div>
            <div>
                <Skeleton className="h-5 w-1/5 mb-2" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        </div>
    </div>
);

export default function DashboardContent() {
    const { dashboardData, isLoading, error, fetchDashboard } = useClientDashboard();
    const { user } = useAuth();
    const [selectedFilter, setSelectedFilter] = useState("today");
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    // Predefined filter options
    const filterOptions = [
        { label: "Aujourd'hui", value: "today" },
        { label: "Cette semaine", value: "week" },
        { label: "Ce mois", value: "month" },
        { label: "Cette année", value: "year" },
        { label: "Personnalisé", value: "custom" },
    ];

    // Handle filter selection
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
                params = {};
        }

        console.log("Selected Filter:", { filter, params });
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
                        return; // Skip fetch if custom dates are not set
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

        fetchData();
    }, [fetchDashboard, user.userId, selectedFilter, startDate, endDate]);

    const { kpis, charts, indicators } = dashboardData;

    const renderChart = (chartData, title) => {
        const data = {
            labels: chartData.labels,
            datasets: [
                {
                    label: title,
                    data: chartData.data,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                },
            ],
        };

        const options = {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: title },
            },
            scales: {
                y: { beginAtZero: true },
            },
        };

        return <Bar data={data} options={options} className="w-full h-64" />;
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

                {/* Filter Section */}
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
                        <IndicatorsSkeleton />
                    </>
                ) : (
                    !error && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                <KPIBox icon={Users} label="Agents actifs" value={kpis.activeAgents} />
                                <KPIBox icon={Clock} label="Tâches" value={kpis.tasks} />
                                <KPIBox icon={Clock} label="Durée totale" value={kpis.duration} unit="h" />
                                <KPIBox icon={MapPin} label="Distance totale" value={kpis.distance} unit="km" />
                                <KPIBox icon={AlertTriangle} label="Incidents" value={kpis.incidents} />
                                <KPIBox icon={DollarSign} label="Abonnement" value={kpis.subscription ? "Actif" : "Inactif"} />
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {charts.tasks.labels.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        {renderChart(charts.tasks, "Tâches par mois")}
                                    </div>
                                )}
                                {charts.incidents.labels.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        {renderChart(charts.incidents, "Incidents par période")}
                                    </div>
                                )}
                                {charts.performance.labels.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        {renderChart(charts.performance, "Performance des agents")}
                                    </div>
                                )}
                                {charts.financial.labels.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        {renderChart(charts.financial, "Données financières")}
                                    </div>
                                )}
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Indicateurs clés</h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-600">Top agents</h3>
                                        {Object.keys(indicators.topAgents).length > 0 ? (
                                            <ul className="mt-2 space-y-2">
                                                {Object.entries(indicators.topAgents).map(([agent, count]) => (
                                                    <li key={agent} className="flex justify-between text-sm">
                                                        <span>{agent}</span>
                                                        <span className="font-medium">{count} tâche(s)</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500">Aucun top agent disponible</p>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-600">Jours productifs</h3>
                                        {indicators.productiveDays.length > 0 ? (
                                            <ul className="mt-2 space-y-2">
                                                {indicators.productiveDays.map((day, index) => (
                                                    <li key={index} className="text-sm">{day}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500">Aucun jour productif enregistré</p>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-600">Ponctualité</h3>
                                        <p className="text-sm text-gray-500">
                                            Taux de ponctualité: {indicators.punctuality.punctualityRate !== null ? `${indicators.punctuality.punctualityRate}%` : 'N/A'}
                                        </p>
                                        <p className="text-sm text-gray-500">Total des tâches: {indicators.punctuality.totalTasks}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                )}
            </div>
        </div>
    );
}