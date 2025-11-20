import React, { useEffect, useState } from 'react';
import { X, MessageCircle, AlertCircle, Info, CheckCircle } from 'lucide-react';

const NotificationToast = ({ notification, onClose, duration = 10000 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        setTimeout(() => setIsVisible(true), 10);

        // Auto-dismiss after duration
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const getIcon = () => {
        switch (notification.type) {
            case 'message':
                return <MessageCircle className="w-6 h-6 text-blue-500" />;
            case 'alert':
            case 'error':
                return <AlertCircle className="w-6 h-6 text-red-500" />;
            case 'success':
                return <CheckCircle className="w-6 h-6 text-green-500" />;
            case 'info':
            default:
                return <Info className="w-6 h-6 text-blue-500" />;
        }
    };

    const getBackgroundColor = () => {
        switch (notification.type) {
            case 'alert':
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'message':
                return 'bg-blue-50 border-blue-200';
            case 'info':
            default:
                return 'bg-white border-gray-200';
        }
    };

    return (
        <div
            className={`
                ${getBackgroundColor()}
                border-l-4 rounded-lg shadow-lg p-4 mb-3 
                transform transition-all duration-300 ease-out
                ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
                max-w-md w-full
            `}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                    {getIcon()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {notification.title && (
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                            {notification.title}
                        </h4>
                    )}
                    <p className="text-sm text-gray-700 break-words">
                        {notification.message}
                    </p>
                    {notification.timestamp && (
                        <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    )}
                </div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-full transition-colors"
                    aria-label="Fermer"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full ${
                        notification.type === 'error' || notification.type === 'alert'
                            ? 'bg-red-500'
                            : notification.type === 'success'
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                    }`}
                    style={{
                        animation: `progress ${duration}ms linear forwards`
                    }}
                />
            </div>

            <style jsx>{`
                @keyframes progress {
                    from {
                        width: 100%;
                    }
                    to {
                        width: 0%;
                    }
                }
            `}</style>
        </div>
    );
};

export default NotificationToast;
