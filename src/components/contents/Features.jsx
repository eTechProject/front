import React from 'react';

const Features = () => {
    return (
        <section id="features" className="features py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 md:mb-16">
                    <span className="text-sm font-semibold tracking-wider uppercase text-[#FF8C00]">FONCTIONNALITÉS</span>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Une solution <span className="text-[#FF8C00]">complète</span> pour vos équipes
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                        GUARD intègre toutes les fonctionnalités nécessaires pour une gestion optimale de votre personnel
                        de sécurité.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Feature 1 */}
                    <div className="feature-card bg-white p-6 md:p-8 rounded-xl border border-gray-200 transition duration-300 hover:border-[#FF8C00] shadow-sm hover:shadow-md">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-[#FFF5E6] rounded-lg flex items-center justify-center mb-4 md:mb-6">
                            <i className="fas fa-user-shield text-xl md:text-2xl text-[#FF8C00]"></i>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-900">Gestion du personnel</h3>
                        <p className="text-gray-600 text-sm md:text-base">Suivi complet des agents : planning, compétences, certifications,
                            évaluations et disponibilités en temps réel.</p>
                        <div className="feature-image-overlay mt-4 rounded-lg overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1470&q=80"
                                 alt="Gestion du personnel" className="w-full h-auto" />
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="feature-card bg-white p-6 md:p-8 rounded-xl border border-gray-200 transition duration-300 hover:border-[#FF8C00] shadow-sm hover:shadow-md">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-[#FFF5E6] rounded-lg flex items-center justify-center mb-4 md:mb-6">
                            <i className="fas fa-calendar-alt text-xl md:text-2xl text-[#FF8C00]"></i>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-900">Planification intelligente</h3>
                        <p className="text-gray-600 text-sm md:text-base">Algorithmes d'optimisation pour créer automatiquement les plannings en
                            fonction des besoins et contraintes.</p>
                        <div className="feature-image-overlay mt-4 rounded-lg overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=1470&q=80"
                                 alt="Planification intelligente" className="w-full h-auto" />
                        </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="feature-card bg-white p-6 md:p-8 rounded-xl border border-gray-200 transition duration-300 hover:border-[#FF8C00] shadow-sm hover:shadow-md">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-[#FFF5E6] rounded-lg flex items-center justify-center mb-4 md:mb-6">
                            <i className="fas fa-map-marked-alt text-xl md:text-2xl text-[#FF8C00]"></i>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-900">Géolocalisation</h3>
                        <p className="text-gray-600 text-sm md:text-base">Suivi en temps réel des agents sur le terrain avec historique des
                            déplacements et alertes de zone.</p>
                        <div className="feature-image-overlay mt-4 rounded-lg overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1470&q=80"
                                 alt="Géolocalisation" className="w-full h-auto" />
                        </div>
                    </div>

                    {/* Feature 4 */}
                    <div className="feature-card bg-white p-6 md:p-8 rounded-xl border border-gray-200 transition duration-300 hover:border-[#FF8C00] shadow-sm hover:shadow-md">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-[#FFF5E6] rounded-lg flex items-center justify-center mb-4 md:mb-6">
                            <i className="fas fa-bell text-xl md:text-2xl text-[#FF8C00]"></i>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-900">Alertes en temps réel</h3>
                        <p className="text-gray-600 text-sm md:text-base">Système d'alerte intelligent pour incidents, retards ou situations
                            anormales avec notifications push.</p>
                        <div className="feature-image-overlay mt-4 rounded-lg overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=1470&q=80"
                                 alt="Alertes en temps réel" className="w-full h-auto" />
                        </div>
                    </div>

                    {/* Feature 5 */}
                    <div className="feature-card bg-white p-6 md:p-8 rounded-xl border border-gray-200 transition duration-300 hover:border-[#FF8C00] shadow-sm hover:shadow-md">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-[#FFF5E6] rounded-lg flex items-center justify-center mb-4 md:mb-6">
                            <i className="fas fa-chart-line text-xl md:text-2xl text-[#FF8C00]"></i>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-900">Analytics avancés</h3>
                        <p className="text-gray-600 text-sm md:text-base">Tableaux de bord personnalisables avec indicateurs clés pour mesurer
                            l'efficacité de vos équipes.</p>
                        <div className="feature-image-overlay mt-4 rounded-lg overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1470&q=80"
                                 alt="Analytics avancés" className="w-full h-auto" />
                        </div>
                    </div>

                    {/* Feature 6 */}
                    <div className="feature-card bg-white p-6 md:p-8 rounded-xl border border-gray-200 transition duration-300 hover:border-[#FF8C00] shadow-sm hover:shadow-md">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-[#FFF5E6] rounded-lg flex items-center justify-center mb-4 md:mb-6">
                            <i className="fas fa-mobile-alt text-xl md:text-2xl text-[#FF8C00]"></i>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-900">Application mobile</h3>
                        <p className="text-gray-600 text-sm md:text-base">Accès complet depuis smartphone pour les agents et managers avec
                            fonctionnalités hors ligne.</p>
                        <div className="feature-image-overlay mt-4 rounded-lg overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1470&q=80"
                                 alt="Application mobile" className="w-full h-auto" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;