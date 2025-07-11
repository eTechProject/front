import React from 'react';
import logo from "../../assets/logo128.png";
const Footer = () => {
    return (
        <footer className="bg-zinc-950 border-t border-zinc-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                        <div className="flex items-center mb-4 w-24">
                            <img  src={logo} alt="Guard logo"/>
                        </div>
                        <p className="text-gray-400 mb-6">
                            La solution ultime pour une gestion autonome et optimisée de vos équipes de sécurité.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-[#00f0ff] transition duration-300">
                                <i className="fab fa-facebook-f"></i>
                            </a>

                            <a href="#" className="text-gray-400 hover:text-[#00f0ff] transition duration-300">
                                <i className="fab fa-linkedin-in"></i>
                            </a>

                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Navigation</h3>
                        <ul className="space-y-2">
                            <li><a href="#features"
                                   className="text-gray-400 hover:text-[#00f0ff] transition duration-300">Fonctionnalités</a>
                            </li>
                            <li><a href="#how-it-works"
                                   className="text-gray-400 hover:text-[#00f0ff] transition duration-300">Fonctionnement</a>
                            </li>
                            <li><a href="#pricing"
                                   className="text-gray-400 hover:text-[#00f0ff] transition duration-300">Tarifs</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg text-white font-semibold mb-4">Légal</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-400 hover:text-[#00f0ff] transition duration-300">Politique de
                                confidentialité</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-400 mb-4 md:mb-0">
                        &copy; 2025 GUARD. Tous droits réservés.
                    </p>
                    <div className="flex space-x-6">
                        <a href="#" className="text-gray-400 hover:text-[#00f0ff] transition duration-300 text-sm">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
