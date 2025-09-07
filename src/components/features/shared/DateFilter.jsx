import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateFilter = ({
                        selectedFilter,
                        onFilterChange,
                        dateRange,
                        setDateRange,
                        filterOptions
                    }) => {
    const [startDate, endDate] = dateRange;

    return (
        <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
                {filterOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => onFilterChange(option.value)}
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
                        }}
                        isClearable
                        placeholderText="Sélectionnez une plage de dates"
                        className="w-full p-2 border rounded-lg text-sm"
                        dateFormat="dd/MM/yyyy"
                    />
                </div>
            )}
        </div>
    );
};

export default DateFilter;