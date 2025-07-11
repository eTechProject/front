import React from 'react';

const CTA = () => {
    return (
        <section id="demo" className="py-20 bg-gradient-to-br from-[#0a0a1a] to-[#0f172a] px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 font-orbitron">
                    Prêt à <span className="gradient-text">transformer</span> votre gestion de sécurité ?
                </h2>
                <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
                    Essayez GUARD gratuitement pendant 14 jours. Aucune carte de crédit requise.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="#contact"
                       className="px-8 py-4 rounded-lg text-lg font-medium bg-gradient-to-r from-[#00f0ff] to-[#0066ff] text-white hover:opacity-90 transition duration-300 transform hover:scale-105">
                        Démarrer l'essai gratuit <i className="fas fa-arrow-right ml-2"></i>
                    </a>
                    <a href="#contact"
                       className="px-8 py-4 rounded-lg text-lg font-medium border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff] hover:bg-opacity-10 transition duration-300 transform hover:scale-105">
                        Parler à un expert
                    </a>
                </div>
            </div>
        </section>
    );
};

export default CTA;
