import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import "@/App.css"
import SmoothScroll from "@/components/common/navigation/SmoothScroll.jsx";
import RouterConfig from "@/routes/Router.jsx";
import { AuthProvider } from "@/context/AuthContext.jsx";

import {Toaster} from "react-hot-toast";
import {GeolocationProvider} from "@/context/GeolocationContext.jsx";

function App() {
    return (
        <AuthProvider>
            <GeolocationProvider>
            <Router>
                <Toaster position="top" reverseOrder={false} />
                <SmoothScroll />
                <RouterConfig />
            </Router>
            </GeolocationProvider>
        </AuthProvider>
    );
}

export default App;