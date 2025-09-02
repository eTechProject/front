import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import "@/App.css"
import SmoothScroll from "@/components/common/navigation/SmoothScroll.jsx";
import RouterConfig from "@/routes/Router.jsx";
import { AuthProvider } from "@/context/AuthContext.jsx";

import {Toaster} from "react-hot-toast";
import {GeolocationProvider} from "@/context/GeolocationContext.jsx";
import {NotificationProvider} from "@/context/NotificationContext.jsx";

function App() {
    return (
        <AuthProvider>
            <NotificationProvider>
                <GeolocationProvider>
                <Router>
                    <Toaster position="top" reverseOrder={false} />
                    <SmoothScroll />
                    <RouterConfig />
                </Router>
                </GeolocationProvider>
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App;