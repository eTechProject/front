import React, { useState } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle } from 'lucide-react';

export default function OrdersContent() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Mock orders data
    const orders = [
        { id: 'ORD-2023-001', customer: 'John Doe', date: '2023-07-15', total: 249.99, status: 'Delivered' },
        { id: 'ORD-2023-002', customer: 'Jane Smith', date: '2023-07-18', total: 124.50, status: 'Processing' },
        { id: 'ORD-2023-003', customer: 'Robert Johnson', date: '2023-07-20', total: 799.99, status: 'Shipped' },
        { id: 'ORD-2023-004', customer: 'Emily Davis', date: '2023-07-22', total: 349.95, status: 'Pending' },
        { id: 'ORD-2023-005', customer: 'Michael Brown', date: '2023-07-25', total: 89.99, status: 'Delivered' },
    ];

    const statuses = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    const filteredOrders = orders.filter(order =>
        (statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase()) &&
        (order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
            </div>

            <div className="bg-white shadow-sm rounded-xl overflow-hidden">
                <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Filter className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value.toLowerCase())}
                        >
                            {statuses.map(status => (
                                <option key={status} value={status.toLowerCase()}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-blue-600">{order.id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{order.customer}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{order.date}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">${order.total.toFixed(2)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'Pending' ? 'bg-purple-100 text-purple-800' :
                                    'bg-red-100 text-red-800'}`}>
                      {order.status}
                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <button className="p-1 text-blue-600 hover:text-blue-900 rounded-full hover:bg-blue-50">
                                            <Eye size={16} />
                                        </button>
                                        <button className="p-1 text-green-600 hover:text-green-900 rounded-full hover:bg-green-50">
                                            <CheckCircle size={16} />
                                        </button>
                                        <button className="p-1 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50">
                                            <XCircle size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Showing <span className="font-medium">{filteredOrders.length}</span> of <span className="font-medium">{orders.length}</span> orders
                    </div>
                    <div className="flex space-x-2">
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                            Previous
                        </button>
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}