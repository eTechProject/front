import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from "../pages/LandingPage.jsx";
import AuthPage from "../pages/AuthPage.jsx";
import NotFound from "../useTools/NotFound.jsx";

const RouterConfig = () => {

    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default RouterConfig;