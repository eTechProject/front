import React, { useState, useRef, useEffect } from 'react';

const Features = () => {
    const [hoveredCard, setHoveredCard] = useState(null);
    const cardRefs = useRef([]);

    const TILT_INTENSITY = 8;

    const features = [
        {
            id: 1,
            icon: "fas fa-user-shield",
            title: "Gestion du personnel",
            description: "Suivi complet des agents : planning, compétences, certifications, évaluations et disponibilités en temps réel."
        },
        {
            id: 2,
            icon: "fas fa-calendar-alt",
            title: "Planification intelligente",
            description: "Algorithmes d'optimisation pour créer automatiquement les plannings en fonction des besoins et contraintes."
        },
        {
            id: 3,
            icon: "fas fa-map-marked-alt",
            title: "Géolocalisation",
            description: "Suivi en temps réel des agents sur le terrain avec historique des déplacements et alertes de zone."
        },
        {
            id: 4,
            icon: "fas fa-bell",
            title: "Alertes en temps réel",
            description: "Système d'alerte intelligent pour incidents, retards ou situations anormales avec notifications push."
        },
        {
            id: 5,
            icon: "fas fa-chart-line",
            title: "Analytics avancés",
            description: "Tableaux de bord personnalisables avec indicateurs clés pour mesurer l'efficacité de vos équipes."
        },
        {
            id: 6,
            icon: "fas fa-mobile-alt",
            title: "Application mobile",
            description: "Accès complet depuis smartphone pour les agents et managers avec fonctionnalités hors ligne."
        }
    ];

    const normalize = ({ value, min = 0, max = 100, scale = 1 }) => {
        let v = (value - min) / (max + min);
        v = Math.floor(v * scale);
        return v;
    };

    const handleMouseMove = (e, cardId) => {
        const cardEl = cardRefs.current[cardId];
        if (!cardEl) return;

        const rect = cardEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const width = rect.width;
        const height = rect.height;
        const origin = { x: width / 2, y: height / 2 };
        const position = { x: -(origin.x - x), y: origin.y - y };

        const Xtilt = normalize({
            value: Math.abs(position.y),
            min: 0,
            max: Math.floor(height / 2),
            scale: TILT_INTENSITY
        });

        const Ytilt = normalize({
            value: Math.abs(position.x),
            min: 0,
            max: Math.floor(width / 2),
            scale: TILT_INTENSITY
        });

        let translations = [];

        if (position.y > 0) {
            translations.push(`rotateX(${Xtilt}deg)`);
        } else {
            translations.push(`rotateX(-${Xtilt}deg)`);
        }

        if (position.x > 0) {
            translations.push(`rotateY(${Ytilt}deg)`);
        } else {
            translations.push(`rotateY(-${Ytilt}deg)`);
        }

        translations.push("scale(1.02)");
        cardEl.style.transform = translations.join(" ");
    };

    const handleMouseLeave = (cardId) => {
        const cardEl = cardRefs.current[cardId];
        if (cardEl) {
            cardEl.style.transform = "none";
        }
        setHoveredCard(null);
    };

    useEffect(() => {
        cardRefs.current = new Array(features.length);
    }, [features.length]);

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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" style={{ perspective: '1000px' }}>
                    {features.map((feature, index) => (
                        <div
                            key={feature.id}
                            ref={el => cardRefs.current[feature.id] = el}
                            className={`group relative bg-white p-6 md:p-8 rounded-lg border transition-all duration-300 cursor-pointer ${
                                hoveredCard === feature.id
                                    ? 'border-gray-400 shadow-lg'
                                    : 'border-gray-200 shadow-sm hover:shadow-md'
                            }`}
                            onMouseEnter={() => setHoveredCard(feature.id)}
                            onMouseMove={(e) => handleMouseMove(e, feature.id)}
                            onMouseLeave={() => handleMouseLeave(feature.id)}
                            style={{
                                transformStyle: 'preserve-3d',
                                transition: 'transform 0.3s ease-out, box-shadow 0.3s ease, border-color 0.3s ease'
                            }}
                        >
                            {/* Subtle background overlay */}
                            <div className={`absolute inset-0 bg-gray-50 rounded-lg opacity-0 transition-opacity duration-300 ${
                                hoveredCard === feature.id ? 'opacity-100' : 'group-hover:opacity-50'
                            }`}></div>

                            {/* Content */}
                            <div className="relative z-10">
                                {/* Icon container */}
                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-4 md:mb-6 transition-all duration-300 ${
                                    hoveredCard === feature.id
                                        ? 'bg-gray-900 shadow-sm'
                                        : 'bg-gray-100 group-hover:bg-gray-200'
                                }`}>
                                    <i className={`${feature.icon} text-xl md:text-2xl transition-colors duration-300 ${
                                        hoveredCard === feature.id ? 'text-white' : 'text-gray-600'
                                    }`}></i>
                                </div>

                                {/* Title */}
                                <h3 className={`text-lg md:text-xl font-bold mb-2 md:mb-3 transition-colors duration-300 ${
                                    hoveredCard === feature.id ? 'text-gray-900' : 'text-gray-800'
                                }`}>
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className={`text-sm md:text-base transition-colors duration-300 ${
                                    hoveredCard === feature.id ? 'text-gray-700' : 'text-gray-600'
                                }`}>
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;