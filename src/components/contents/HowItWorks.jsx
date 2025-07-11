import React from 'react';
import {Link} from "react-router-dom";

const HowItWorks = () => {
    return (
        <section id="how-it-works" className="py-16 md:py-20 bg-white px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 md:mb-16">
                    <span className="text-sm font-semibold tracking-wider uppercase text-[#FF8C00]">FONCTIONNEMENT</span>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Comment <span className="text-[#FF8C00]">GUARD</span> transforme votre gestion
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                        Une intégration simple pour des résultats immédiats et durables.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Step 1 */}
                    <div className="relative">
                        <div className="absolute -top-1 -left-1 w-8 h-8 bg-[#FF8C00] rounded-full flex items-center justify-center font-bold text-white">
                            1
                        </div>
                        <div className="pt-8 pl-8 h-full bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <h3 className="text-xl font-bold mb-3 text-gray-900">Configuration initiale</h3>
                            <p className="text-gray-600 mb-4">
                                Notre équipe vous accompagne pour importer vos données et configurer la plateforme selon vos besoins spécifiques.
                            </p>
                            <div className="flex justify-end">
                                <i className="fas fa-cog text-4xl opacity-20 text-[#FF8C00]"></i>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative">
                        <div className="absolute -top-1 -left-1 w-8 h-8 bg-[#FF8C00] rounded-full flex items-center justify-center font-bold text-white">
                            2
                        </div>
                        <div className="pt-8 pl-8 h-full bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <h3 className="text-xl font-bold mb-3 text-gray-900">Formation</h3>
                            <p className="text-gray-600 mb-4">
                                Sessions de formation en ligne ou sur site pour vos équipes afin de maîtriser rapidement toutes les fonctionnalités.
                            </p>
                            <div className="flex justify-end">
                                <i className="fas fa-graduation-cap text-4xl opacity-20 text-[#FF8C00]"></i>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative">
                        <div className="absolute -top-1 -left-1 w-8 h-8 bg-[#FF8C00] rounded-full flex items-center justify-center font-bold text-white">
                            3
                        </div>
                        <div className="pt-8 pl-8 h-full bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <h3 className="text-xl font-bold mb-3 text-gray-900">Déploiement</h3>
                            <p className="text-gray-600 mb-4">
                                Mise en production avec support continu pendant les premières semaines pour garantir une transition en douceur.
                            </p>
                            <div className="flex justify-end">
                                <i className="fas fa-rocket text-4xl opacity-20 text-[#FF8C00]"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 md:mt-16 text-center">
                    <Link to="auth"
                       className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-[#FF8C00] to-[#ff9933] hover:opacity-90 transition duration-300">
                        Essayer maintenant
                        <i className="fas fa-arrow-right ml-2"></i>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;