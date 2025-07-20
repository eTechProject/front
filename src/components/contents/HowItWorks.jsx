import React from 'react';
import './HowItWorks.css';
import { Link } from 'react-router-dom';
const HowItWorks = () => {
    return (
        <section id="how-it-works" className="py-16 md:py-20 bg-white px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 md:mb-16">
                    <span className="text-sm font-semibold tracking-wider uppercase text-orange-600">FONCTIONNEMENT</span>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Comment <span className="text-orange-600">GUARD</span> transforme votre gestion
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                        Une intégration simple pour des résultats immédiats et durables.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

                    <div className="relative">
                        <div className="absolute -top-1 -left-1 w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center font-bold text-white z-10">
                            1
                        </div>
                        <div className="animated-card pt-8 pl-8 h-full p-6">
                            <div className="card-content">
                                <div className="icon-container"></div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">Configuration initiale</h3>
                                <p className="text-gray-600">
                                    Notre équipe vous accompagne pour importer vos données et configurer la plateforme selon vos besoins spécifiques.
                                </p>
                            </div>
                            <div className="shine"></div>
                            <div className="background">
                                <div className="tiles">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className={`tile tile-${i+1}`}></div>
                                    ))}
                                </div>
                                <div className="line line-1"></div>
                                <div className="line line-2"></div>
                                <div className="line line-3"></div>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -top-1 -left-1 w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center font-bold text-white z-10">
                            2
                        </div>
                        <div className="animated-card pt-8 pl-8 h-full p-6">
                            <div className="card-content">
                                <div className="icon-container"></div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">Formation</h3>
                                <p className="text-gray-600">
                                    Sessions de formation en ligne ou sur site pour vos équipes afin de maîtriser rapidement toutes les fonctionnalités.
                                </p>
                            </div>
                            <div className="shine"></div>
                            <div className="background">
                                <div className="tiles">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className={`tile tile-${i+1}`}></div>
                                    ))}
                                </div>
                                <div className="line line-1"></div>
                                <div className="line line-2"></div>
                                <div className="line line-3"></div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -top-1 -left-1 w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center font-bold text-white z-10">
                            3
                        </div>
                        <div className="animated-card pt-8 pl-8 h-full p-6">
                            <div className="card-content">
                                <div className="icon-container"></div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">Déploiement</h3>
                                <p className="text-gray-600">
                                    Mise en production avec support continu pendant les premières semaines pour garantir une transition en douceur.
                                </p>
                            </div>
                            <div className="shine"></div>
                            <div className="background">
                                <div className="tiles">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className={`tile tile-${i+1}`}></div>
                                    ))}
                                </div>
                                <div className="line line-1"></div>
                                <div className="line line-2"></div>
                                <div className="line line-3"></div>
                            </div>
                        </div>
                    </div>


                </div>

                <div className="mt-12 md:mt-16 text-center">
                    <Link to="auth" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-orange-600 to-orange-400 hover:opacity-90 transition duration-300">
                        Essayer maintenant
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;