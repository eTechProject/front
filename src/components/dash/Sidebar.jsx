import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from "../../assets/logo48.png";
import {
    Map, Settings,
    LayoutDashboard, MessageSquareMore
} from 'lucide-react';

import DashboardContent from './contents/DashboardContent';
import MapContent from './contents/MapContent';
import StatsContent from './contents/StatsContent';
import MessagesContent from './contents/MessagesContent';
import SettingsContent from './contents/SettingsContent';
import ProfileContent from './contents/ProfileContent';
import NotificationsPopover from "./contents/NotificationsPopover.jsx";

export default function Sidebar({ user, logout }) {
    const [activeItem, setActiveItem] = useState(() => {
        return localStorage.getItem('activeSidebarItem') || 'dashboard';
    });
    const [indicatorStyle, setIndicatorStyle] = useState({});
    const itemsRef = useRef({});

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'map', label: 'Map', icon: Map },
        { id: 'messages', label: 'Messages', icon: MessageSquareMore },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    useEffect(() => {
        const element = itemsRef.current[activeItem];
        if (element) {
            const { offsetTop, offsetHeight } = element;
            setIndicatorStyle({
                top: `${offsetTop + offsetHeight / 2 - 16}px`,
                opacity: 1,
                transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            });
        }
    }, [activeItem]);

    const handleItemClick = (itemId) => {
        setActiveItem(itemId);
        localStorage.setItem('activeSidebarItem', itemId);
    };

    const Tooltip = ({ children, text, className = "" }) => (
        <div className={`relative z-[999] group ${className}`}>
            {children}
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 pointer-events-none z-50 group-hover:opacity-100 opacity-0 transition-all duration-200 ease-out">
                <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl whitespace-nowrap relative">
                    {text}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                </div>
            </div>
        </div>
    );

    const MenuItem = ({ item }) => {
        const Icon = item.icon;
        const isActive = activeItem === item.id;
        return (
            <div className="relative" ref={el => (itemsRef.current[item.id] = el)}>
                <Tooltip text={item.label}>
                    <button
                        onClick={() => handleItemClick(item.id)}
                        className={`
              w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 relative
              ${isActive
                            ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/25 scale-105'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 hover:scale-105'
                        }
            `}
                    >
                        <Icon size={20} />
                    </button>
                </Tooltip>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeItem) {
            case 'dashboard': return <DashboardContent user={user} />;
            case 'map': return <MapContent />;
            case 'messages': return <MessagesContent />;
            case 'settings': return <SettingsContent />;
            case 'profile': return <ProfileContent user={user} />;
            default: return <DashboardContent user={user} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-20 bg-white shadow-sm border-r border-gray-100 flex flex-col items-center py-6 relative z-30">
                {/* Animated active indicator */}
                <div
                    className="absolute -left-4 w-1 h-10 bg-gradient-to-b from-orange-400 to-orange-500 rounded-r-full"
                    style={{
                        ...indicatorStyle,
                        left: '0',
                        transform: 'translateY(-10%)',
                    }}
                />

                <Link to={""} className="mb-8">
                    <img src={logo} alt="Guard logo" width={20} height={20} />
                </Link>

                {/* Navigation */}
                <nav className="flex-1 flex flex-col items-center space-y-4">
                    {menuItems.slice(0, -1).map(item => (
                        <MenuItem key={item.id} item={item} />
                    ))}
                </nav>

                {/* Bottom items */}
                <div className="flex flex-col items-center space-y-4">
                    {/* Settings */}
                    <MenuItem item={menuItems[menuItems.length - 1]} />
                    <Tooltip text="Déconnexion">
                        <button
                            onClick={logout}
                            className="w-12 h-12 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-gray-50 transition-all duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </Tooltip>
                    {/* Profile */}
                    <div
                        className="relative"
                        ref={el => (itemsRef.current['profile'] = el)}
                    >
                        <Tooltip text={`${user?.name || 'Utilisateur'} - Profile`}>
                            <button
                                onClick={() => handleItemClick('profile')}
                                className={`
                  w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 relative overflow-hidden
                  ${activeItem === 'profile'
                                    ? 'ring-2 ring-orange-500 ring-offset-2 scale-105'
                                    : 'hover:ring-2 hover:ring-gray-200 hover:ring-offset-2 hover:scale-105'
                                }
                `}
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-inner">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-8">
                <div className="bg-white rounded-2xl shadow-sm h-full p-8 relative overflow-hidden">
                    {renderContent()}
                </div>
            </div>
            {/* Notifications popover flottant, hors du sidebar pour rester fixe */}
            <NotificationsPopover />
        </div>
    );
}