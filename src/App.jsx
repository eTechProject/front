import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import "@/App.css"
import SmoothScroll from "@/components/common/navigation/SmoothScroll.jsx";
import RouterConfig from "@/routes/Router.jsx";
import { AuthProvider } from "@/context/AuthContext.jsx";
import NotificationToastContainer from "@/components/common/messaging/NotificationToastContainer.jsx";
import { useNotifications } from "@/context/NotificationContext.jsx";

import {Toaster} from "react-hot-toast";
import {GeolocationProvider} from "@/context/GeolocationContext.jsx";
import {NotificationProvider} from "@/context/NotificationContext.jsx";

function AppContent() {
    const { toasts, removeToast } = useNotifications();

    return (
        <Router>
            <Toaster position="top" reverseOrder={false} />
            
            {/* Global Toast Notifications */}
            <NotificationToastContainer toasts={toasts} onRemoveToast={removeToast} />
            
            <SmoothScroll />
            <RouterConfig />
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <NotificationProvider>
                <GeolocationProvider>
                    <AppContent />
                </GeolocationProvider>
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App;