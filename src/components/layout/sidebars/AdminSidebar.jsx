import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo48.png';
import './sidebar.css';
import {
    LayoutDashboard,
    ShieldUser,
    UserRound,
    Wallet,
    BarChart2,
    Settings,
    LogOut,
    ChartNoAxesGantt,
    X, Package,History
} from 'lucide-react';
import DashboardContent from "@/components/features/dashboard/admin/DashboardContent.jsx";
import AgentsContent from "@/components/features/dashboard/admin/AgentsContent.jsx";
import ClientsContent from "@/components/features/dashboard/admin/ClientsContent.jsx";
import SettingsContent from "@/components/features/shared/SettingsContent.jsx";
import ProfileContent from "@/components/features/shared/ProfileContent.jsx";
import Tooltip from "@/components/common/ui/Tooltip.jsx";
import PackContent from "@/components/features/dashboard/admin/PackContent.jsx";
import SubscriptionContent from "@/components/features/dashboard/admin/SubscriptionContent.jsx";
import PaymentContent from "@/components/features/dashboard/admin/PaymentContent.jsx";


export default function AdminSidebar({ user, logout }) {
    const [activeItem, setActiveItem] = useState(() => {
        return localStorage.getItem('activeAdminSidebarItem') || 'dashboard';
    });
    const [indicatorStyle, setIndicatorStyle] = useState({});
    const [isFabOpen, setIsFabOpen] = useState(false);
    const itemsRef = useRef({});

    const menuItems = [
        { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { id: 'agents', label: 'Agents', icon: ShieldUser },
        { id: 'clients', label: 'Clients', icon: UserRound },
        { id: 'subs', label: 'Abonnements', icon: Wallet },
        { id: 'histories', label: 'Historiques', icon: History },
        { id: 'packs', label: 'Packs', icon: Package },
        { id: 'settings', label: 'Paramètres', icon: Settings },
    ];

    useEffect(() => {
        const element = itemsRef.current[activeItem];
        if (element) {
            const { offsetTop, offsetHeight } = element;
            setIndicatorStyle({
                top: `${offsetTop + offsetHeight / 2 - 16}px`,
                opacity: 1,
                transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            });
        }
    }, [activeItem]);

    const handleItemClick = (itemId) => {
        setActiveItem(itemId);
        localStorage.setItem('activeAdminSidebarItem', itemId);
        setIsFabOpen(false);
    };


    const MenuItem = ({ item }) => {
        const Icon = item.icon;
        const isActive = activeItem === item.id;
        return (
            <div className="relative" ref={(el) => (itemsRef.current[item.id] = el)}>
                <Tooltip text={item.label}>
                    <button
                        onClick={() => handleItemClick(item.id)}
                        className={`
              w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 relative
              ${
                            isActive
                                ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/25 scale-105'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 hover:scale-105'
                        }
            `}
                    >
                        <Icon
                            size={20}
                            className="transition-transform duration-300 group-hover:scale-110"
                        />
                    </button>
                </Tooltip>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeItem) {
            case 'dashboard':
                return <DashboardContent user={user} />;
            case 'agents':
                return <AgentsContent />;
            case 'clients':
                return <ClientsContent />;
            case 'subs':
                return <SubscriptionContent />;
            case 'histories':
                return <PaymentContent />;
            case 'settings':
                return <SettingsContent />;
            case 'packs':
                return <PackContent />
            case 'profile':
                return <ProfileContent user={user} />;
            default:
                return <DashboardContent user={user} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex w-20 bg-white shadow-sm border-r border-gray-100 flex-col items-center py-6 relative z-40 flex-shrink-0">
                <div
                    className="absolute -left-4 w-1 h-10 bg-gradient-to-b from-orange-400 to-orange-500 rounded-r-full"
                    style={{
                        ...indicatorStyle,
                        left: '0',
                        transform: 'translateY(-10%)',
                    }}
                />

                <Link
                    to="/admin"
                    className="mb-8 transform hover:scale-110 transition-transform duration-300"
                >
                    <img
                        src={logo}
                        alt="Logo Admin"
                        width={20}
                        height={20}
                        className="transition-transform duration-300 hover:rotate-12"
                    />
                </Link>

                <nav className="flex-1 flex flex-col items-center space-y-4">
                    {menuItems.slice(0, -1).map((item) => (
                        <MenuItem key={item.id} item={item} />
                    ))}
                </nav>

                <div className="flex flex-col items-center space-y-4">
                    <MenuItem item={menuItems[menuItems.length - 1]} />
                    <Tooltip text="Déconnexion">
                        <button
                            onClick={logout}
                            className="w-12 h-12 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-gray-50 transition-all duration-300 hover:scale-105"
                        >
                            <LogOut
                                size={20}
                                className="transition-transform duration-300 hover:scale-110"
                            />
                        </button>
                    </Tooltip>
                    <div className="relative" ref={(el) => (itemsRef.current['profile'] = el)}>
                        <Tooltip text={`${user?.name || 'Administrateur'} - Profil`}>
                            <button
                                onClick={() => handleItemClick('profile')}
                                className={`
                  w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 relative overflow-hidden
                  ${
                                    activeItem === 'profile'
                                        ? 'ring-2 ring-orange-500 ring-offset-2 scale-105'
                                        : 'hover:ring-2 hover:ring-gray-200 hover:ring-offset-2 hover:scale-105'
                                }
                `}
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-inner transition-transform duration-300 hover:scale-105">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                </div>
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 bg-white rounded-2xl shadow-sm m-4 lg:m-8 relative overflow-hidden content-transition">
                    <div className="h-full w-full p-4 lg:p-8 overflow-auto">
                        {renderContent()}
                    </div>
                </div>
            </div>

            {/* Mobile FAB */}
            <div className="lg:hidden fixed bottom-6 left-6 z-50">
                <div
                    className={`
            absolute bottom-16 right-1 space-y-3 transition-all duration-300 origin-bottom-right
            ${isFabOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
          `}
                >
                    <button
                        onClick={() => handleItemClick('profile')}
                        className={`
              w-10 h-10 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center
              ${
                            activeItem === 'profile'
                                ? 'ring-2 ring-orange-500 ring-offset-2 scale-110'
                                : 'bg-white hover:bg-gray-50 hover:scale-110'
                        }
            `}
                        style={{
                            animationName: isFabOpen ? 'slideUp' : undefined,
                            animationDuration: '0.3s',
                            animationTimingFunction: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)',
                            animationDelay: '0ms',
                            animationFillMode: 'both',
                        }}
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm transition-transform duration-300 hover:scale-110">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                    </button>

                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = activeItem === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleItemClick(item.id)}
                                className={`
                  w-10 h-10 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center
                  ${
                                    isActive
                                        ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white scale-110'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 hover:scale-110'
                                }
                `}
                                style={{
                                    animationName: isFabOpen ? 'slideUp' : undefined,
                                    animationDuration: '0.3s',
                                    animationTimingFunction: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)',
                                    animationDelay: `${(index + 1) * 50}ms`,
                                    animationFillMode: 'both',
                                }}
                            >
                                <Icon
                                    size={18}
                                    className="transition-transform duration-300 hover:scale-125"
                                />
                            </button>
                        );
                    })}

                    <button
                        onClick={logout}
                        className="w-10 h-10 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all duration-300 flex items-center justify-center hover:scale-110"
                        style={{
                            animationName: isFabOpen ? 'slideUp' : undefined,
                            animationDuration: '0.3s',
                            animationTimingFunction: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)',
                            animationDelay: `${(menuItems.length + 1) * 50}ms`,
                            animationFillMode: 'both',
                        }}
                    >
                        <LogOut
                            size={18}
                            className="transition-transform duration-300 hover:scale-125"
                        />
                    </button>
                </div>

                <button
                    onClick={() => setIsFabOpen(!isFabOpen)}
                    className={`
            w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full shadow-xl 
            flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95
            ${isFabOpen ? 'rotate-90 bg-gradient-to-br from-orange-600 to-orange-700' : 'rotate-0'}
          `}
                >
                    {isFabOpen ? (
                        <X size={24} className="transition-transform duration-300" />
                    ) : (
                        <ChartNoAxesGantt
                            size={24}
                            className="transition-transform duration-300"
                        />
                    )}
                </button>
            </div>
        </div>
    );
}