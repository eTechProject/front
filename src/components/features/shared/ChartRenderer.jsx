import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
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

// S'assurer que tous les éléments nécessaires sont enregistrés
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const createGradient = (ctx, chartArea) => {
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, 'rgba(54, 162, 235, 0.8)');
    gradient.addColorStop(1, 'rgba(75, 192, 192, 0.6)');
    return gradient;
};

const ChartRenderer = ({ chartData, title, type }) => {
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
    };

    if (type === 'doughnut') {
        const statusColors = {
            pending: '#FFCE56',
            in_progress: '#36A2EB',
            completed: '#4BC0C0',
            cancelled: '#FF6384'
        };

        const data = {
            labels: chartData.labels || [],
            datasets: [{
                data: chartData.data || [],
                backgroundColor: chartData.labels?.map(label => statusColors[label] || '#6B7280') || [],
                borderColor: '#fff',
                borderWidth: 2,
                hoverOffset: 10,
            }],
        };

        return (
            <Doughnut
                data={data}
                options={commonOptions}
                className="w-full h-64"
            />
        );
    } else {
        // Configuration spécifique pour les graphiques en barres
        const barOptions = {
            ...commonOptions,
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

        // Créer le gradient de manière plus sûre
        const data = {
            labels: chartData.labels || [],
            datasets: [{
                label: title,
                data: chartData.data || [],
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;

                    if (!chartArea) {
                        return 'rgba(54, 162, 235, 0.8)';
                    }

                    return createGradient(ctx, chartArea);
                },
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                borderRadius: 5,
                barThickness: 40,
                hoverBackgroundColor: 'rgba(59, 130, 246, 0.8)',
            }],
        };

        return (
            <Bar
                data={data}
                options={barOptions}
                className="w-full h-64"
            />
        );
    }
};

export default ChartRenderer;