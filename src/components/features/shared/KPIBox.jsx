import React from 'react';

const KPIBox = ({ icon: Icon, label, value, unit = '', color = 'text-orange-500' }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4">
        <Icon className={`h-8 w-8 ${color}`} />
        <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-lg font-semibold text-gray-900">{value}{unit}</p>
        </div>
    </div>
);

export default KPIBox;