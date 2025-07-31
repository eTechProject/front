import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import "./App.css";
import SmoothScroll from "./useTools/SmoothScroll.jsx";
import RouterConfig from "./routes/Router.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import {Toaster} from "react-hot-toast";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Toaster position="top" reverseOrder={false} />
                <SmoothScroll />
                <RouterConfig />
            </Router>
        </AuthProvider>
    );
}

export default App;