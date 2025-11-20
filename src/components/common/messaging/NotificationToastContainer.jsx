import React from 'react';
import NotificationToast from './NotificationToast.jsx';

const NotificationToastContainer = ({ toasts, onRemoveToast }) => {
    return (
        <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
            <div className="flex flex-col items-end space-y-2 pointer-events-auto">
                {toasts.map((toast) => (
                    <NotificationToast
                        key={toast.id}
                        notification={toast}
                        onClose={() => onRemoveToast(toast.id)}
                        duration={toast.duration || 10000}
                    />
                ))}
            </div>
        </div>
    );
};

export default NotificationToastContainer;
