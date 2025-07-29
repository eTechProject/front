import React from 'react';
import { BarChart, DollarSign, Users, ShoppingBag } from 'lucide-react';

export default function DashboardContent({ user }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <div className="text-sm text-gray-500">Welcome, {user?.name || 'Administrator'}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue"
                    value="$24,350"
                    change="+12.5%"
                    icon={<DollarSign className="h-6 w-6 text-green-500" />}
                    positive={true}
                />
                <StatCard
                    title="Total Users"
                    value="1,253"
                    change="+5.2%"
                    icon={<Users className="h-6 w-6 text-blue-500" />}
                    positive={true}
                />
                <StatCard
                    title="Products"
                    value="452"
                    change="+8.1%"
                    icon={<ShoppingBag className="h-6 w-6 text-purple-500" />}
                    positive={true}
                />
                <StatCard
                    title="Pending Orders"
                    value="25"
                    change="-3.4%"
                    icon={<BarChart className="h-6 w-6 text-orange-500" />}
                    positive={false}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 bg-gray-50 rounded-xl">
                    <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                    <Users className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">New user registered</div>
                                    <div className="text-xs text-gray-500">2 hours ago</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-xl">
                    <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <button className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                            Add New User
                        </button>
                        <button className="w-full p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
                            Add New Product
                        </button>
                        <button className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                            View Orders
                        </button>
                        <button className="w-full p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, icon, positive }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm">{title}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
            </div>
            <div className={`mt-4 text-sm ${positive ? 'text-green-500' : 'text-red-500'}`}>
                {change} <span className="text-gray-400">this month</span>
            </div>
        </div>
    );
}