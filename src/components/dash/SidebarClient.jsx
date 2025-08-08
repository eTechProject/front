import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo48.png';
import {
    Map,
    Settings,
    MessageSquareMore,
    ChartNoAxesGantt,
    X,
} from 'lucide-react';

import MapContent from './contents/MapContent/MapContent.jsx';
import MessagesContent from './contents/client/MessagesContent.jsx';
import SettingsContent from './contents/SettingsContent';
import ProfileContent from './contents/ProfileContent';
import NotificationsPopover from './contents/NotificationsPopover.jsx';

// Move CSS to a separate file or inline styles
const sidebarStyles = `
  .content-transition {
    animation-name: fadeIn;
    animation-duration: 0.4s;
    animation-timing-function: ease-out;
    animation-fill-mode: forwards;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export default function SidebarClient({ user, logout }) {
    const [activeItem, setActiveItem] = useState(() => {
        return localStorage.getItem('activeSidebarItem') || 'map';
    });
    const [indicatorStyle, setIndicatorStyle] = useState({});
    const [isFabOpen, setIsFabOpen] = useState(false);
    const itemsRef = useRef({});

    const menuItems = [
        { id: 'map', label: 'Map', icon: Map },
        { id: 'messages', label: 'Messages', icon: MessageSquareMore },
        { id: 'settings', label: 'Paramètres', icon: Settings },
    ];

    useEffect(() => {
        const element = itemsRef.current[activeItem];
        if (element) {
            const { offsetTop, offsetHeight } = element;
            setIndicatorStyle({
                top: `${offsetTop + offsetHeight / 2 - 16}px`,
                opacity: 1,
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            });
        }
    }, [activeItem]);

    const handleItemClick = (itemId) => {
        setActiveItem(itemId);
        localStorage.setItem('activeSidebarItem', itemId);
        setIsFabOpen(false);
    };

    const Tooltip = ({ children, text, className = '' }) => (
        <div className={`relative z-[999] group ${className}`}>
            {children}
            <div
                className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 pointer-events-none z-50 group-hover:opacity-100 opacity-0 transition-all duration-300 ease-out hidden lg:block"
            >
                <div
                    className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl whitespace-nowrap relative transition-all duration-200 transform group-hover:translate-x-0 -translate-x-1"
                >
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
            case 'map':
                return <MapContent />;
            case 'messages':
                return <MessagesContent />;
            case 'settings':
                return <SettingsContent />;
            case 'profile':
                return <ProfileContent user={user} />;
            default:
                return <MapContent />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Inject CSS */}
            <style>{sidebarStyles}</style>

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex w-20 bg-white shadow-sm border-r border-gray-100 flex-col items-center py-6 relative z-30">
                <div
                    className="absolute -left-4 w-1 h-10 bg-gradient-to-b from-orange-400 to-orange-500 rounded-r-full"
                    style={{
                        ...indicatorStyle,
                        left: '0',
                        transform: 'translateY(-10%)',
                    }}
                />

                <Link
                    to=""
                    className="mb-8 transform hover:scale-110 transition-transform duration-300"
                >
                    <img
                        src={logo}
                        alt="Guard logo"
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
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 transition-transform duration-300 hover:scale-110"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                        </button>
                    </Tooltip>
                    <div className="relative" ref={(el) => (itemsRef.current['profile'] = el)}>
                        <Tooltip text={`${user?.name || 'Utilisateur'} - Profile`}>
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
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-4 lg:p-8">
                <div className="bg-white rounded-2xl shadow-sm h-full p-4 lg:p-8 relative overflow-auto content-transition">
                    {renderContent()}
                </div>
            </div>

            {/* Mobile FAB */}
            <div className="lg:hidden fixed bottom-6 left-6 z-50">
                {/* Menu Items */}
                <div
                    className={`
            absolute bottom-16 right-1 space-y-3 transition-all duration-300 origin-bottom-right
            ${isFabOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
          `}
                >
                    {/* Profile */}
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
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    </button>

                    {/* Menu Items */}
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

                    {/* Logout */}
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
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 transition-transform duration-300 hover:scale-125"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                        </svg>
                    </button>
                </div>

                {/* Main FAB */}
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

            <NotificationsPopover />
        </div>
    );
}