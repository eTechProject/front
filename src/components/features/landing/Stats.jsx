import React from 'react';

const Stats = () => {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div
                className="max-w-7xl mx-auto bg-gradient-to-br from-[#0a0a1a] to-[#0f172a] rounded-2xl p-8 md:p-12 border border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-6">
                        <div className="text-5xl font-bold mb-2 gradient-text">+85%</div>
                        <p className="text-gray-400">Réduction du temps de planification</p>
                    </div>
                    <div className="p-6 border-t md:border-t-0 md:border-l border-gray-800">
                        <div className="text-5xl font-bold mb-2 gradient-text">24/7</div>
                        <p className="text-gray-400">Disponibilité et support continu</p>
                    </div>
                    <div className="p-6 border-t md:border-t-0 md:border-l border-gray-800">
                        <div className="text-5xl font-bold mb-2 gradient-text">99.9%</div>
                        <p className="text-gray-400">Taux de satisfaction client</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Stats;
