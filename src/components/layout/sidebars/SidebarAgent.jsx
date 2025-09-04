import React, {useState, useRef, useEffect, useContext} from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo48.png';
import { Map, MessageSquareMore, Settings, ChartNoAxesGantt, X, MapPinned } from 'lucide-react';

import MapContent from "@/components/features/map/MapContent.jsx";
import ProfileContent from "@/components/features/shared/ProfileContent.jsx";
import SettingsContent from "@/components/features/shared/SettingsContent.jsx";
import MessagesContentAgent from "@/components/features/dashboard/agent/MessagesContentAgent.jsx";
import NotificationsPopover from "@/components/features/shared/NotificationsPopover.jsx";
import './sidebar.css';
import Tooltip from "@/components/common/ui/Tooltip.jsx";
import GPSTracker from "@/components/features/dashboard/agent/GPSTracker.jsx";
import {GeolocationContext} from "@/context/GeolocationContext.jsx";
import { useNotifications } from "@/context/NotificationContext.jsx";

export default function SidebarAgent({ user, logout }) {
    const { unreadMessages, markMessagesAsRead } = useNotifications();
    const [activeItem, setActiveItem] = useState(() => {
        return localStorage.getItem('activeSidebarItem') || 'map';
    });
    const {isActive} = useContext(GeolocationContext);
    const [indicatorStyle, setIndicatorStyle] = useState({});
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [clickedButton, setClickedButton] = useState(null);
    const itemsRef = useRef({});

    const menuItems = [
        { id: 'map', label: 'Map', icon: Map },
        { id: 'locations', label: 'Me localiser', icon: MapPinned },
        {
            id: 'messages',
            label: 'Messages',
            icon: MessageSquareMore,
            hasNotification: unreadMessages > 0,
            notificationCount: unreadMessages
        },
        { id: 'settings', label: 'Paramètres', icon: Settings },
    ];

    const simulateButtonClick = (buttonId) => {
        setClickedButton(buttonId);
        const buttonElement = itemsRef.current[buttonId]?.querySelector('button');
        if (buttonElement) {
            buttonElement.classList.add('animate-pulse', 'scale-95', 'ring-2', 'ring-orange-300');
            setTimeout(() => {
                buttonElement.classList.remove('animate-pulse', 'scale-95', 'ring-2', 'ring-orange-300');
                setClickedButton(null);
            }, 500);
        }
    };

    const handleNotificationNavigation = () => {
        simulateButtonClick('map');
        setTimeout(() => {
            handleItemClick('map');
        }, 250);
    };

    const handleMessageNavigation = () => {
        simulateButtonClick('messages');
        setTimeout(() => {
            handleItemClick('messages');
        }, 250);
    };

    // Écouter l'événement de navigation depuis les notifications du navigateur
    useEffect(() => {
        const handleNavigateToMessages = () => {
            handleItemClick('messages');
        };

        window.addEventListener('navigateToMessages', handleNavigateToMessages);

        return () => {
            window.removeEventListener('navigateToMessages', handleNavigateToMessages);
        };
    }, []);

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

        if (itemId === 'messages') {
            markMessagesAsRead();
        }
    };

    const MenuItem = ({ item }) => {
        const Icon = item.icon;
        const isActive = activeItem === item.id;
        const isClicked = clickedButton === item.id;
        const hasNotification = item.hasNotification;
        const notificationCount = item.notificationCount;

        return (
            <div className="relative" ref={(el) => (itemsRef.current[item.id] = el)}>
                <Tooltip text={item.label}>
                    <button
                        onClick={() => {
                            if (item.id === 'messages' && hasNotification) {
                                handleMessageNavigation();
                            } else {
                                handleItemClick(item.id);
                            }
                        }}
                        className={`
                            w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 relative
                            ${isActive
                            ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/25 scale-105'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 hover:scale-105'
                        }
                            ${isClicked ? 'ring-2 ring-orange-300 animate-pulse' : ''}
                        `}
                    >
                        <Icon size={20} className="transition-transform duration-300 group-hover:scale-110" />

                        {hasNotification && (
                            <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold leading-none">
                                    {notificationCount > 99 ? '99+' : notificationCount}
                                </span>
                                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                            </div>
                        )}

                        {item.id === 'map' && isClicked && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                        )}
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
                return <MessagesContentAgent />;
            case 'settings':
                return <SettingsContent />;
            case 'profile':
                return <ProfileContent user={user} />;
            case 'locations':
                return <GPSTracker />;
            default:
                return <MapContent />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
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
                                    ${activeItem === 'profile'
                                    ? 'ring-2 ring-orange-500 ring-offset-2 scale-105'
                                    : 'hover:ring-2 hover:ring-gray-200 hover:ring-offset-2 hover:scale-105'
                                }
                                `}
                            >
                                {isActive && (
                                    <div className="bg-green-500 w-3 h-3 rounded-full absolute top-0 right-0"></div>
                                )}
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-inner transition-transform duration-300 hover:scale-105">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="bg-white w-screen h-full relative overflow-auto content-transition">
                {renderContent()}
            </div>

            {/* Mobile FAB */}
            <div className="lg:hidden fixed bottom-3 left-3 z-50">
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
                            ${activeItem === 'profile'
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
                        {isActive && (
                            <div className="bg-green-500 w-3 h-3 rounded-full absolute top-0 right-0"></div>
                        )}
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm transition-transform duration-300 hover:scale-110">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    </button>

                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = activeItem === item.id;
                        const isClicked = clickedButton === item.id;
                        const hasNotification = item.hasNotification;
                        const notificationCount = item.notificationCount;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.id === 'messages' && hasNotification) {
                                        handleMessageNavigation();
                                    } else {
                                        handleItemClick(item.id);
                                    }
                                }}
                                className={`
                                    w-10 h-10 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center relative
                                    ${isActive
                                    ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white scale-110'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:scale-110'
                                }
                                    ${isClicked ? 'ring-2 ring-orange-300 animate-pulse' : ''}
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

                                {hasNotification && (
                                    <div className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold leading-none">
                                            {notificationCount > 9 ? '9+' : notificationCount}
                                        </span>
                                        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                                    </div>
                                )}

                                {item.id === 'map' && isClicked && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                                )}
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
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3-3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                        </svg>
                    </button>
                </div>

                <button
                    onClick={() => setIsFabOpen(!isFabOpen)}
                    className={`
                        w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full shadow-xl 
                        flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 relative
                        ${isFabOpen ? 'rotate-90 bg-gradient-to-br from-orange-600 to-orange-700' : 'rotate-0'}
                    `}
                >
                    {unreadMessages > 0 && !isFabOpen && (
                        <div className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold leading-none">
                                {unreadMessages > 9 ? '9+' : unreadMessages}
                            </span>
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                        </div>
                    )}

                    {isFabOpen ? (
                        <X size={20} className="transition-transform duration-300" />
                    ) : (
                        <ChartNoAxesGantt size={20} className="transition-transform duration-300" />
                    )}
                </button>
            </div>

            <NotificationsPopover onNotificationReceived={handleNotificationNavigation} />
        </div>
    );
}