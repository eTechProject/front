import React from 'react';
import { Search, User } from 'lucide-react';

const EmployeeList = ({
                          employees,
                          filterText,
                          setFilterText,
                          handleEmployeeClick,
                          selectedEmployee,
                          formatDate
                      }) => {
    return (
        <div className=" flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-center w-full">
                        <div className="font-semibold text-gray-600">
                            {formatDate(new Date()).split(',')[0]}
                            <span className="text-sm text-gray-800">
                                {formatDate(new Date()).split(',')[1]}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    />
                </div>
            </div>

            {/* Employee List */}
            <div className="flex-1">
                {/* Unassigned Header */}
                <div className="px-4 py-3 border-b bg-gray-50 ">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                            <User size={12} className="text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-700">Liste des agents</span>
                        <span className="text-xs text-gray-500 ml-auto">{employees.length}</span>
                    </div>
                </div>

                {employees.map((employee) => (
                    <div
                        key={employee.id}
                        className={`flex items-center gap-3  border-white p-3 cursor-pointer hover:bg-gray-50 border-l-4 transition-all 
                         ${selectedEmployee?.id === employee.id ? 'bg-blue-100' : ''}`}
                        onClick={() => handleEmployeeClick(employee)}
                    >
                        <div className="relative">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: employee.routeColor }}
                            >
                                {employee.avatar}
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">{employee.name}</div>
                            <div className="text-xs text-gray-500">{employee.status}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmployeeList;