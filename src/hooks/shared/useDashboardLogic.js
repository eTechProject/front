import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export const useDashboardLogic = (fetchFunction, userId = null) => {
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
                        choice: selectedFilter,
                        page: currentPage,
                        limit: limit
                    };
            }

            if (Object.keys(params).length > 0) {
                if (userId) {
                    await fetchFunction(userId, params);
                } else {
                    await fetchFunction(params);
                }
            }
        };

        fetchData();
    }, [selectedFilter, startDate, endDate, currentPage, userId]);

    return {
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
    };
};