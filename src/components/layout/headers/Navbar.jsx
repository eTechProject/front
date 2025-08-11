import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";
import logo from "../../../assets/logo128.png";
import "./NavBar.css";

const Navbar = () => {
    const [isActive, setIsActive] = useState(false);
    const { isAuthenticated } = useAuth(); // Récupérez l'état d'authentification

    const toggleMenu = () => {
        setIsActive(!isActive);
    };

    return (
        <nav className="fixed w-full z-50 bg-white bg-opacity-90 backdrop-blur-sm shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 lg:h-20">

                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center">
                            <img src={logo} alt="Guard logo"/>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex md:items-center md:space-x-6 lg:space-x-8">
                        <a href="#features" className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-sm lg:text-base font-medium transition duration-200">
                            Fonctionnalités
                        </a>
                        <a href="#how-it-works" className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-sm lg:text-base font-medium transition duration-200">
                            Fonctionnement
                        </a>
                        <a href="#pricing" className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-sm lg:text-base font-medium transition duration-200">
                            Tarifs
                        </a>
                    </div>

                    {/* Desktop Action Button - Conditionnel selon l'authentification */}
                    <div className="hidden md:flex md:items-center md:space-x-3 lg:space-x-4">
                        {isAuthenticated ? (
                            <Link
                                to="/dashboard"
                                className="px-4 py-2 rounded-md text-sm font-medium border border-orange-400 bg-orange-400 text-white hover:bg-orange-500 transition duration-200"
                            >
                                Tableau de bord
                            </Link>
                        ) : (
                            <Link
                                to="/auth"
                                className="px-4 py-2 rounded-md text-sm font-medium border border-orange-400 bg-orange-400 text-white hover:bg-orange-500 transition duration-200"
                            >
                                Connexion
                            </Link>
                        )}
                    </div>

                    {/* Bouton hamburger animé en noir */}
                    <button
                        onClick={toggleMenu}
                        className={`md:hidden navTrigger ${isActive ? 'active' : ''}`}
                        aria-label="Menu"
                    >
                        <svg viewBox="0 0 64 48">
                            <path d="M19,15 L45,15 C70,15 58,-2 49.0177126,7 L19,37"></path>
                            <path d="M19,24 L45,24 C61.2371586,24 57,49 41,33 L32,24"></path>
                            <path d="M45,33 L19,33 C-8,33 6,-2 22,14 L45,37"></path>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Menu mobile avec animation */}
            <div className={`navMenu ${isActive ? 'active' : ''}`}>
                <ul>
                    <li>
                        <a href="#features" onClick={toggleMenu} className="text-black">Fonctionnalités</a>
                    </li>
                    <li>
                        <a href="#how-it-works" onClick={toggleMenu} className="text-black">Fonctionnement</a>
                    </li>
                    <li>
                        <a href="#pricing" onClick={toggleMenu} className="text-black">Tarifs</a>
                    </li>
                    <li>
                        {isAuthenticated ? (
                            <Link
                                to="/dashboard"
                                onClick={toggleMenu}
                                className="bg-orange-400 text-white hover:bg-orange-500 px-4 py-2 rounded-md"
                            >
                                Tableau de bord
                            </Link>
                        ) : (
                            <Link
                                to="/auth"
                                onClick={toggleMenu}
                                className="bg-orange-400 text-white hover:bg-orange-500 px-4 py-2 rounded-md"
                            >
                                Connexion
                            </Link>
                        )}
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;