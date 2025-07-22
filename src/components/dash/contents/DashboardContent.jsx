import React from 'react';
import { BarChart3, Activity, FileText } from 'lucide-react';

const DashboardContent = ({ user }) => {
    return (
        <>
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Bonjour, {user?.name || 'utilisateur'} !
                    </h1>
                    <p className="text-gray-500 text-lg">
                        Bienvenue sur votre tableau de bord
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                        <BarChart3 className="text-white" size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Statistiques</h3>
                    <p className="text-gray-600 text-sm mb-4">Visualisez vos données</p>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-orange-600">24.5k</span>
                        <div className="text-xs text-orange-500 font-medium">+15% ce mois</div>
                    </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                        <Activity className="text-white" size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Activité</h3>
                    <p className="text-gray-600 text-sm mb-4">Suivez vos performances</p>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-blue-600">+12%</span>
                        <div className="text-xs text-blue-500 font-medium">vs semaine passée</div>
                    </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                        <FileText className="text-white" size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Documents</h3>
                    <p className="text-gray-600 text-sm mb-4">Gérez vos fichiers</p>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-green-600">127</span>
                        <div className="text-xs text-green-500 font-medium">5 ajoutés today</div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardContent;