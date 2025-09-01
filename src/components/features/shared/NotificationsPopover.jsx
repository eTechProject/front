import React, { useState, useRef, useEffect,useCallback, useMemo } from "react";
import { Bell, X, Move } from "lucide-react";
import { useAuth } from "@/context/AuthContext.jsx";
import {useInfiniteScroll} from "@/hooks/features/messaging/useInfiniteScroll.js";
import { useNotifications } from "@/hooks/features/notification/useNotification.js";
import generateNotifTopic from "@/utils/generateNotifTopic.js";
import useMercureSubscription from "@/hooks/features/notification/useMercureNotificationSubscription.js";
import "./notificationsPopover.css"

const MERCURE_URL = import.meta.env.VITE_MERCURE_URL || 'http://localhost:8000/.well-known/mercure';
const TOKEN_REFRESH_BUFFER = 60;
const NOTIF_LIMIT = 5;

export default function DraggableNotificationsPopover() {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ x: window.innerWidth - 88, y: window.innerHeight - 88 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
    const [popoverHeight, setPopoverHeight] = useState(320);
    const [mercureToken, setMercureToken] = useState(null);

    const popoverRef = useRef(null);
    const buttonRef = useRef(null);
    const dragRef = useRef({
        isDragging: false,
        startX: 0,
        startY: 0,
    });

    const { user } = useAuth();
    const {
        isLoading,
        error,
        success,
        notifications,
        isLoadingMore,
        hasMoreNotifications,
        currentPage,
        loadMoreNotifications,
        resetNotifications,
        getNotifications,
        getMercureToken,
        addMercureNotification,
    } = useNotifications();

     const { containerRef, scrollToBottom } = useInfiniteScroll(
            loadMoreNotifications,
            hasMoreNotifications,
            isLoadingMore,
            [notifications.length]
    );

     const addMercureNotificationRef = useRef();

        useEffect(() => {
            addMercureNotificationRef.current = addMercureNotification;
        }, [addMercureNotification]);


    useEffect(() => {

        // Réinitialiser la conversation avant de charger les nouveaux messages
        resetNotifications();

        getNotifications(
            user.userId,
            { page: 1, limit: NOTIF_LIMIT }
        ).then((result) => {
            if (result.success) {
                setTimeout(() => scrollToBottom('auto'), 100);
            }
        });
    }, [user?.userId]);

    const notificationTopic = useMemo(() => {
        return generateNotifTopic(
            user.userId,
        );
    }, [ user?.userId]);

    // Gestion du token Mercure
    useEffect(() => {
        if (!notificationTopic || mercureToken) return;

        const fetchToken = async () => {
            try {
                const result = await getMercureToken();
                if (result.success) {
                    setMercureToken(result.token);

                    if (result.expires_in) {
                        const refreshTime = (result.expires_in - TOKEN_REFRESH_BUFFER) * 1000;
                        setTimeout(() => {
                            setMercureToken(null);
                        }, refreshTime);
                    }
                }
            } catch (err) {
                console.error('Erreur lors de la récupération du token Mercure:', err);
            }
        };

        fetchToken().then();
    }, [notificationTopic, mercureToken]);

    // Gestionnaire des messages Mercure
    const handleNotification = useCallback((data) => {
        if (!data.data.titre || !addMercureNotificationRef.current) return;

        const notificationWithUserInfo = {
            ...data
        };
        addMercureNotificationRef.current(notificationWithUserInfo);
    }, []);

    // Abonnement Mercure
    useMercureSubscription({
        topic: notificationTopic,
        mercureUrl: MERCURE_URL,
        token: mercureToken,
        onNotification: handleNotification
    });

    // Utilitaire pour obtenir les coordonnées (souris ou touch)
    const getEventCoordinates = (e) => {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        if (e.changedTouches && e.changedTouches.length > 0) {
            return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    };

    // Fonction pour calculer la position optimale du popover avec hauteur dynamique
    const calculatePopoverPosition = (buttonX, buttonY) => {
        const popoverWidth = 288;
        const margin = 16;
        const buttonSize = 48;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculer la hauteur disponible et ajuster la hauteur du popover
        const maxAvailableHeight = viewportHeight - 2 * margin;
        const adjustedHeight = Math.min(popoverHeight, maxAvailableHeight);

        // Calculer les espaces disponibles
        const spaceRight = viewportWidth - buttonX - buttonSize;
        const spaceLeft = buttonX;
        const spaceTop = buttonY;
        const spaceBottom = viewportHeight - buttonY - buttonSize;

        let finalX, finalY;

        // Déterminer la position horizontale
        if (spaceRight >= popoverWidth + margin) {
            finalX = buttonX + buttonSize + 8;
        } else if (spaceLeft >= popoverWidth + margin) {
            finalX = buttonX - popoverWidth - 8;
        } else {
            if (buttonX + popoverWidth/2 > viewportWidth - margin) {
                finalX = viewportWidth - popoverWidth - margin;
            } else if (buttonX - popoverWidth/2 < margin) {
                finalX = margin;
            } else {
                finalX = buttonX - popoverWidth/2 + buttonSize/2;
            }
        }

        // Déterminer la position verticale avec la hauteur ajustée
        if (spaceBottom >= adjustedHeight + margin) {
            finalY = buttonY;
        } else if (spaceTop >= adjustedHeight + margin) {
            finalY = buttonY - adjustedHeight + buttonSize;
        } else {
            if (buttonY + adjustedHeight/2 > viewportHeight - margin) {
                finalY = viewportHeight - adjustedHeight - margin;
            } else if (buttonY - adjustedHeight/2 < margin) {
                finalY = margin;
            } else {
                finalY = buttonY - adjustedHeight/2 + buttonSize/2;
            }
        }

        // S'assurer que le popover reste dans les limites
        finalX = Math.max(margin, Math.min(finalX, viewportWidth - popoverWidth - margin));
        finalY = Math.max(margin, Math.min(finalY, viewportHeight - adjustedHeight - margin));

        return { x: finalX, y: finalY, height: adjustedHeight };
    };

    // Gestion du clic pour ouvrir/fermer le popover
    const handleClick = () => {
        if (!open) {
            const result = calculatePopoverPosition(position.x, position.y);
            setPopoverPosition({ x: result.x, y: result.y });
            setPopoverHeight(result.height);
        }
        setOpen(!open);
    };

    // Gestion du début du drag (souris et touch)
    const handlePointerDown = (e) => {
        if (open) return;
        if (e.target.closest('.popover-content')) return;

        e.preventDefault();
        setIsDragging(true);

        const coords = getEventCoordinates(e);
        const rect = buttonRef.current.getBoundingClientRect();

        setDragOffset({
            x: coords.x - rect.left - 24,
            y: coords.y - rect.top - 24,
        });

        dragRef.current = {
            isDragging: true,
            startX: coords.x,
            startY: coords.y,
        };
    };

    // Gestion du mouvement (souris et touch)
    const handlePointerMove = (e) => {
        if (!dragRef.current.isDragging || open) return;

        e.preventDefault();

        const coords = getEventCoordinates(e);
        const newX = coords.x - dragOffset.x - 24;
        const newY = coords.y - dragOffset.y - 24;

        const margin = 24;
        const maxX = window.innerWidth - 48 - margin;
        const maxY = window.innerHeight - 48 - margin;

        const constrainedX = Math.max(margin, Math.min(maxX, newX));
        const constrainedY = Math.max(margin, Math.min(maxY, newY));

        requestAnimationFrame(() => {
            setPosition({ x: constrainedX, y: constrainedY });
        });
    };

    // Gestion de la fin du drag (souris et touch)
    const handlePointerUp = (e) => {
        if (dragRef.current.isDragging) {
            const coords = getEventCoordinates(e);
            const distance = Math.sqrt(
                Math.pow(coords.x - dragRef.current.startX, 2) +
                Math.pow(coords.y - dragRef.current.startY, 2)
            );

            if (distance < 10) { // Seuil plus élevé pour mobile
                handleClick();
            }
        }

        setIsDragging(false);
        dragRef.current.isDragging = false;
    };

    // Recalculer la position du popover lors du redimensionnement de la fenêtre
    useEffect(() => {
        const handleResize = () => {
            if (open) {
                const result = calculatePopoverPosition(position.x, position.y);
                setPopoverPosition({ x: result.x, y: result.y });
                setPopoverHeight(result.height);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [open, position.x, position.y]);

    // Gestionnaires d'événements avec support mobile
    useEffect(() => {
        if (isDragging && !open) {
            const handleMove = (e) => handlePointerMove(e);
            const handleUp = (e) => handlePointerUp(e);

            // Événements souris
            document.addEventListener('mousemove', handleMove, { passive: false });
            document.addEventListener('mouseup', handleUp);

            // Événements tactiles
            document.addEventListener('touchmove', handleMove, { passive: false });
            document.addEventListener('touchend', handleUp);
            document.addEventListener('touchcancel', handleUp);

            // Styles pour empêcher la sélection
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';
            document.body.style.touchAction = 'none';
            document.body.style.cursor = 'grabbing';

            return () => {
                // Nettoyage événements souris
                document.removeEventListener('mousemove', handleMove);
                document.removeEventListener('mouseup', handleUp);

                // Nettoyage événements tactiles
                document.removeEventListener('touchmove', handleMove);
                document.removeEventListener('touchend', handleUp);
                document.removeEventListener('touchcancel', handleUp);

                // Restaurer les styles
                document.body.style.userSelect = '';
                document.body.style.webkitUserSelect = '';
                document.body.style.touchAction = '';
                document.body.style.cursor = '';
            };
        }
    }, [isDragging, open, dragOffset]);

    // Fermer le popover en cliquant à l'extérieur
    useEffect(() => {
        function handleClickOutside(e) {
            if (popoverRef.current && !popoverRef.current.contains(e.target) &&
                buttonRef.current && !buttonRef.current.contains(e.target)) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
                document.removeEventListener("touchstart", handleClickOutside);
            };
        }
    }, [open]);

    return (
        <div className="absolute">
            <button
                ref={buttonRef}
                className={`
                    relative bg-white shadow-md w-12 h-12 rounded-full flex items-center justify-center 
                    transition-all duration-200 z-[50] group will-change-transform border border-gray-200
                    touch-none select-none
                    ${isDragging && !open ? 'shadow-lg scale-110' : ''}
                    ${!isDragging && !open ? 'hover:shadow-lg hover:scale-105 active:scale-110' : ''}
                    ${open ? 'ring-2 ring-blue-200 ring-opacity-50 shadow-lg border-blue-200' : ''}
                `}
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: isDragging && !open ? 'translateZ(0)' : 'none',
                    cursor: open ? 'pointer' : (isDragging ? 'grabbing' : 'grab')
                }}
                onMouseDown={handlePointerDown}
                onTouchStart={handlePointerDown}
                onClick={(e) => {
                    e.preventDefault();
                    if (!open && !isDragging) {
                        handleClick();
                    }
                }}
                aria-label="Notifications draggables"
            >
                <Bell size={20} className="text-gray-600 transition-colors group-hover:text-gray-800 pointer-events-none" />
                {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1.5 font-medium min-w-[18px] h-[18px] flex items-center justify-center pointer-events-none">
                        {notifications.length}
                    </span>
                )}

                {!open && (
                    <div className={`
                        absolute -bottom-1 -right-1 w-3 h-3 bg-gray-500 rounded-full flex items-center justify-center
                        transition-all duration-200 pointer-events-none
                        ${isDragging ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-60 group-active:opacity-100 scale-75'}
                    `}>
                        <Move size={8} className="text-white" />
                    </div>
                )}
            </button>

            {open && (
                <div
                    ref={popoverRef}
                    className="popover-content w-72 max-w-[95vw] bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 animate-notif-pop fixed z-[1000] will-change-transform"
                    style={{
                        left: `${popoverPosition.x}px`,
                        top: `${popoverPosition.y}px`,
                        height: `${popoverHeight}px`,
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
                        <div className="flex items-center space-x-2">
                            <Bell size={16} className="text-gray-600" />
                            <span className="font-medium text-gray-800 text-sm">Notifications</span>
                        </div>
                        <button
                            className="text-gray-400 hover:text-gray-600 active:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-100 active:bg-gray-200 touch-manipulation"
                            onClick={() => setOpen(false)}
                            aria-label="Fermer"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Content */}
                    <div
                        className="overflow-y-auto flex-1 overscroll-contain"
                        style={{
                            height: `${popoverHeight - 120}px`
                        }}
                    >
                        {notifications.length === 0 ? (
                            <div className="p-6 text-gray-400 text-center">
                                <Bell size={28} className="mx-auto mb-2 opacity-40" />
                                <p className="text-sm">Aucune notification</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="flex items-start space-x-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer group touch-manipulation"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0 group-hover:bg-red-600 transition-colors" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {notification.titre}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {notification.createdAt}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex-shrink-0">
                            <button className="text-sm text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium transition-colors touch-manipulation">
                                Marquer toutes comme lues
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}