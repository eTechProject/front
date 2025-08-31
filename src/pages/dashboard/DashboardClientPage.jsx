import { Link } from "react-router-dom";
import {useAuth} from "@/context/AuthContext.jsx";
import SidebarClient from "@/components/layout/sidebars/SidebarClient.jsx";
import Loader from "@/components/common/ui/Loader.jsx";

export default function DashboardClientPage() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
            <Loader/>
        </div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center p-8 bg-white rounded-xl shadow-sm max-w-md">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h2>
                    <p className="text-gray-600 mb-6">Connectez-vous pour accéder à cette page.</p>
                    <Link to="auth" className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm font-medium shadow-md inline-block">
                        Se connecter
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <SidebarClient user={user} logout={logout} />
        </>
    );
}