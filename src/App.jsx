import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import "./App.css";
import SmoothScroll from "./useTools/SmoothScroll.jsx";
import RouterConfig from "./routes/Router.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

function App() {
    return (
        <AuthProvider>
            <Router>
                <SmoothScroll />
                <RouterConfig />
            </Router>
        </AuthProvider>
    );
}

export default App;