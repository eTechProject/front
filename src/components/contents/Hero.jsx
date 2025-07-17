import React, { useState, useEffect, useMemo } from 'react';
import InteractiveButton from "../../shared/InteractiveButton.jsx";

const Hero = () => {
    const [activeAgents, setActiveAgents] = useState(12);
    const totalAgents = 15;

    // Memoisation du style du gradient pour éviter les re-renders
    const gradientStyle = useMemo(() => ({
        background: 'linear-gradient(to right, #FF8C00, #ff9933)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    }), []);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveAgents(prevActiveAgents => {
                const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
                let newValue = prevActiveAgents + change;
                if (newValue < 8) newValue = 8; // Min active agents
                if (newValue > totalAgents) newValue = totalAgents; // Max active agents
                return newValue;
            });
        }, 4000); // Update every 4 seconds as in original script
        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [totalAgents]);

    // Données mockées pour les agents (évite la duplication dans le JSX)
    const personnelData = useMemo(() => [
        { name: "Agent Tonny", status: "En Service", statusClass: "active" },
        { name: "Agent Aneliot", status: "Patrouille", statusClass: "patrol" },
        { name: "Agent Larion", status: "Pause", statusClass: "break" },
        { name: "Agent Lova", status: "Poste Fixe", statusClass: "active" }
    ], []);

    // Données des cartes de statut
    const statusCards = useMemo(() => [
        { label: "Agents Actifs", value: `${activeAgents}/${totalAgents}`, indicator: "" },
        { label: "Alertes", value: "2", indicator: "alert" },
        { label: "Rondes OK", value: "98%", indicator: "" },
        { label: "Connectivité", value: "100%", indicator: "" }
    ], [activeAgents, totalAgents]);

    return (
        <section className="hero-bg pt-32 pb-20 px-4 sm:px-6 lg:px-16">
            <div className="mx-auto mb-10 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
                    <div className="md:text-left md:ml-12 z-10">
                        <h1 className="text-[2.5rem] md:text-6xl font-bold mb-6 leading-tight">
                            <span className="gradient-text" style={gradientStyle}>
                                Révolutionnez
                            </span> votre gestion <br />de sécurité
                        </h1>
                        <p className="text-lg md:text-xl text-gray-700 my-16 max-w-lg">
                            Global Unified Automated Defense est la plateforme intelligente qui automatise et optimise la gestion de vos équipes de
                            sécurité. Gain de temps, réduction des coûts et contrôle total.
                        </p>
                        <div className="flex flex-col md:ml-2 gap-4 justify-center md:justify-start">
                            <InteractiveButton href="#features">En savoir plus</InteractiveButton>
                            <span className="ml-3 text-sm text-gray-400">+10 entreprises nous font confiance</span>
                        </div>
                    </div>
                    <div className="hero-visual relative">
                        <div className="floating-card floating-card-1">
                            <div className="card-icon"><i className="fa fa-mobile"></i></div>
                            <div className="card-title">Transmission GSM</div>
                            <div className="card-subtitle">Communication en temps réel avec vos équipes sur le terrain</div>
                            <div className="gsm-indicator">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="gsm-signal"></div>
                                ))}
                                <span style={{ fontSize: '11px', color: '#10b981', marginLeft: '6px', fontWeight: '600' }}>
                                    Signal Fort
                                </span>
                            </div>
                        </div>
                        <div className="floating-card floating-card-2">
                            <div className="card-icon"><i className="fa fa-map"></i></div>
                            <div className="card-title">Géolocalisation</div>
                            <div className="card-subtitle">Suivi GPS précis de tous vos agents avec historique des rondes</div>
                        </div>
                        <div className="dashboard-3d">
                            <div className="dashboard-header">
                                <div className="dashboard-title">Tableau de Bord</div>
                                <div className="dashboard-tabs">
                                    <div className="dashboard-tab">Temps Réel</div>
                                    <div className="dashboard-tab">Historique</div>
                                </div>
                            </div>
                            <div className="status-grid">
                                {statusCards.map((card, index) => (
                                    <div key={index} className="status-card">
                                        <div className="status-label">
                                            <span className={`status-indicator ${card.indicator}`}></span>
                                            {card.label}
                                        </div>
                                        <div className="status-value">{card.value}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="personnel-list">
                                {personnelData.map((person, index) => (
                                    <div key={index} className="personnel-item">
                                        <span className="personnel-name">👤 {person.name}</span>
                                        <span className={`personnel-status ${person.statusClass}`}>{person.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;