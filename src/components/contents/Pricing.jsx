import React from 'react';

const Pricing = () => {
    return (
        <section id="pricing" className="py-20 bg-zinc-900 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Grille d'arrière-plan principale */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                }}></div>
            </div>

            {/* Grille secondaire plus fine */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '25px 25px'
                }}></div>
            </div>

            {/* Éléments de grille décoratifs */}
            <div className="absolute top-10 left-10 w-32 h-32 border border-[#FF8C00] opacity-20 rotate-12"></div>
            <div className="absolute top-20 right-20 w-24 h-24 border border-white opacity-10 rotate-45"></div>
            <div className="absolute bottom-20 left-20 w-40 h-40 border border-[#FF8C00] opacity-15 -rotate-12"></div>
            <div className="absolute bottom-10 right-10 w-28 h-28 border border-white opacity-10 rotate-45"></div>

            {/* Grille avec effet de perspective */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 transform perspective-1000 rotateX-5" style={{
                    backgroundImage: `
                        linear-gradient(rgba(255, 140, 0, 0.3) 2px, transparent 2px),
                        linear-gradient(90deg, rgba(255, 140, 0, 0.3) 2px, transparent 2px)
                    `,
                    backgroundSize: '100px 100px'
                }}></div>
            </div>

            {/* Lignes diagonales */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        repeating-linear-gradient(
                            45deg,
                            transparent,
                            transparent 35px,
                            rgba(255, 140, 0, 0.1) 35px,
                            rgba(255, 140, 0, 0.1) 36px
                        )
                    `
                }}></div>
            </div>

            {/* Cercles de grille */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#FF8C00] rounded-full opacity-30"></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full opacity-20"></div>
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-[#FF8C00] rounded-full opacity-25"></div>
            <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-white rounded-full opacity-20"></div>

            {/* Gradient overlay pour adoucir les grilles */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-zinc-900/50 to-transparent"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <span className="text-sm font-semibold tracking-wider uppercase text-[#FF8C00]">TARIFS</span>
                    <h2 className="mt-2 text-white text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Des offres adaptées à <span className="text-[#FF8C00]">vos besoins</span>
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
                        Choisissez la formule qui correspond à la taille de votre structure et à vos exigences.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Plan Starter */}
                    <div className="relative bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-2xl p-8 border border-zinc-700 hover:border-zinc-500 transition-all duration-300 backdrop-blur-sm">
                        {/* Grille interne de la carte */}
                        <div className="absolute inset-0 opacity-5 rounded-2xl overflow-hidden">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `
                                    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                                `,
                                backgroundSize: '20px 20px'
                            }}></div>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-6 relative z-10">Starter</h3>
                        <div className="text-4xl font-bold text-white mb-2 relative z-10">49€<span className="text-lg text-zinc-400">/mois</span></div>
                        <ul className="space-y-3 mb-8 relative z-10">
                            <li className="flex items-center text-zinc-300">
                                <span className="text-[#FF8C00] mr-2">✓</span> Jusqu'à 5 agents
                            </li>
                            <li className="flex items-center text-zinc-300">
                                <span className="text-[#FF8C00] mr-2">✓</span> Géolocalisation
                            </li>
                            <li className="flex items-center text-zinc-300">
                                <span className="text-[#FF8C00] mr-2">✓</span> Alertes basiques
                            </li>
                            <li className="flex items-center text-zinc-300">
                                <span className="text-[#FF8C00] mr-2">✓</span> Support email
                            </li>
                        </ul>
                        <button className="w-full bg-white text-zinc-900 py-3 rounded-full font-bold hover:bg-zinc-200 transition duration-300 relative z-10">
                            Choisir
                        </button>
                    </div>

                    {/* Plan Pro (Featured) */}
                    <div className="relative bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-2xl p-8 border-2 border-[#FF8C00] transform scale-105 z-10 backdrop-blur-sm">
                        {/* Grille interne plus marquée pour la carte populaire */}
                        <div className="absolute inset-0 opacity-10 rounded-2xl overflow-hidden">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `
                                    linear-gradient(rgba(255, 140, 0, 0.2) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(255, 140, 0, 0.2) 1px, transparent 1px)
                                `,
                                backgroundSize: '15px 15px'
                            }}></div>
                        </div>

                        <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#FF8C00] text-black px-4 py-1 rounded-full text-xs font-bold z-20">
                            Populaire
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-6 relative z-10">Professionnel</h3>
                        <div className="text-4xl font-bold text-white mb-2 relative z-10">99€<span className="text-lg text-zinc-400">/mois</span></div>
                        <ul className="space-y-3 mb-8 relative z-10">
                            <li className="flex items-center text-zinc-300">
                                <span className="text-[#FF8C00] mr-2">✓</span> Jusqu'à 10 agents
                            </li>
                            <li className="flex items-center text-zinc-300">
                                <span className="text-[#FF8C00] mr-2">✓</span> Géolocalisation
                            </li>
                            <li className="flex items-center text-zinc-300">
                                <span className="text-[#FF8C00] mr-2">✓</span> Alertes intelligentes
                            </li>
                            <li className="flex items-center text-zinc-300">
                                <span className="text-[#FF8C00] mr-2">✓</span> Reporting complet
                            </li>
                            <li className="flex items-center text-zinc-300">
                                <span className="text-[#FF8C00] mr-2">✓</span> Support prioritaire
                            </li>
                        </ul>
                        <button className="w-full bg-[#FF8C00] text-white py-3 rounded-full font-bold hover:bg-[#E67E00] transition duration-300 relative z-10">
                            Choisir
                        </button>
                    </div>

                    {/* Plan Enterprise */}
                    <div className="relative bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-2xl p-8 border border-zinc-700 hover:border-zinc-500 transition-all duration-300 backdrop-blur-sm">
                        {/* Grille interne de la carte */}
                        <div className="absolute inset-0 opacity-5 rounded-2xl overflow-hidden">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `
                                    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                                `,
                                backgroundSize: '20px 20px'
                            }}></div>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-6 relative z-10">Enterprise</h3>
                        <div className="text-4xl font-bold text-white mb-2 relative z-10">Sur mesure</div>
                        <ul className="space-y-3 mb-8 relative z-10">
                            <li className="flex items-center text-zinc-300">
                                <span className="text-[#FF8C00] mr-2">✓</span> Nombre illimité d'agents
                            </li>
                            <li className="flex items-center text-zinc-300">
                                <span className="text-[#FF8C00] mr-2">✓</span> Toutes les fonctionnalités Pro
                            </li>
                            <li className="flex items-center text-zinc-300">
                                <span className="text-[#FF8C00] mr-2">✓</span> Intégrations personnalisées
                            </li>
                            <li className="flex items-center text-zinc-300">
                                <span className="text-[#FF8C00] mr-2">✓</span> Formation dédiée
                            </li>
                            <li className="flex items-center text-zinc-300">
                                <span className="text-[#FF8C00] mr-2">✓</span> Support 24/7
                            </li>
                        </ul>
                        <button className="w-full bg-white text-zinc-900 py-3 rounded-full font-bold hover:bg-zinc-200 transition duration-300 relative z-10">
                            Contact
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Pricing;