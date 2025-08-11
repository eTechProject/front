import React from 'react';
import { Star, Clock, Navigation, Phone, Mail, X, User } from 'lucide-react';

const EmployeeCard = ({
                          employee,
                          onClose,
                          position,
                          isDragging,
                          onMouseDown,
                          getStatusColor,
                          onMouseMove,
                          onMouseUp
                      }) => {
    return (
        <div
            className="absolute w-80 bg-white rounded-xl shadow-2xl border overflow-hidden z-[1000]"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                cursor: isDragging ? 'grabbing' : 'grab'
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
                        background: `linear-gradient(135deg, ${employee.routeColor}, ${employee.routeColor}88)`
                    }}
                ></div>
                <button
                    className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white cursor-pointer"
                    onClick={onClose}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <X size={16} className="text-gray-600" />
                </button>
                <div className="absolute -bottom-8 left-6">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold border-4 border-white shadow-lg"
                        style={{ backgroundColor: employee.routeColor }}
                    >
                        {employee.avatar}
                    </div>
                </div>
            </div>

            <div className="pt-12 p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{employee.name}</h3>
                        <p className="text-sm text-gray-600">{employee.role}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock size={16} className="text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Heures</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">{employee.hours}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Navigation size={16} className="text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Distance</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">{employee.distance}</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(employee.status)}`}>
              {employee.status}
            </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Contact:</span>
                        <div className="">
                            <button
                                className="p-1 flex flex-row justify-center items-center hover:bg-gray-100 rounded cursor-pointer"
                                onMouseDown={(e) => e.stopPropagation()}
                            >
                                <Phone size={14} className="text-gray-600" />
                                {employee.phone}

                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeCard;