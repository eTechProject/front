import React, { useState, useEffect } from 'react';
import InteractiveButton from "../../shared/InteractiveButton.jsx";

const Hero = () => {
    const [activeAgents, setActiveAgents] = useState(12);
    const totalAgents = 15;

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
    }, []);

    return (
        <section className="hero-bg pt-32 pb-20 px-4 sm:px-6 lg:px-16">
            <div className="mx-auto  mb-10 mt-12" >
                <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
                    <div className="md:text-left md:ml-12 z-10">
                        <h1 className="text-[2.5rem] md:text-6xl font-bold mb-6 leading-tight">
                            <span className="gradient-text" style={{ background: 'linear-gradient(to right, #FF8C00,  #ff9933)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Révolutionnez
                            </span> votre gestion <br />de sécurité
                        </h1>
                        <p className="text-lg md:text-xl text-gray-700 my-16 max-w-lg">
                            Global Unified Automated Defense est la plateforme intelligente qui automatise et optimise la gestion de vos équipes de
                            sécurité. Gain de temps, réduction des coûts et contrôle total.
                        </p>
                        <div className="flex flex-col md:ml-2 gap-4 justify-center md:justify-start">
                            <InteractiveButton href={"#features"} children="En savoir plus"/>
                            <span className="ml-3 text-sm text-gray-400">+10 entreprises nous font confiance</span>
                        </div>
                    </div>
                    <div className="hero-visual relative">
                        <div className="floating-card floating-card-1">
                            <div className="card-icon"><i className="fa fa-mobile"></i></div>
                            <div className="card-title">Transmission GSM</div>
                            <div className="card-subtitle">Communication en temps réel avec vos équipes sur le terrain</div>
                            <div className="gsm-indicator">
                                <div className="gsm-signal"></div>
                                <div className="gsm-signal"></div>
                                <div className="gsm-signal"></div>
                                <div className="gsm-signal"></div>
                                <span style={{ fontSize: '11px', color: '#10b981', marginLeft: '6px', fontWeight: '600' }}>Signal Fort</span>
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
                                <div className="status-card">
                                    <div className="status-label">
                                        <span className="status-indicator"></span>
                                        Agents Actifs
                                    </div>
                                    <div className="status-value">{activeAgents}/{totalAgents}</div>
                                </div>
                                <div className="status-card">
                                    <div className="status-label">
                                        <span className="status-indicator alert"></span>
                                        Alertes
                                    </div>
                                    <div className="status-value">2</div>
                                </div>
                                <div className="status-card">
                                    <div className="status-label">
                                        <span className="status-indicator"></span>
                                        Rondes OK
                                    </div>
                                    <div className="status-value">98%</div>
                                </div>
                                <div className="status-card">
                                    <div className="status-label">
                                        <span className="status-indicator"></span>
                                        Connectivité
                                    </div>
                                    <div className="status-value">100%</div>
                                </div>
                            </div>
                            <div className="personnel-list">
                                <div className="personnel-item">
                                    <span className="personnel-name">👤 Agent Tonny</span>
                                    <span className="personnel-status active">En Service</span>
                                </div>
                                <div className="personnel-item">
                                    <span className="personnel-name">👤 Agent Aneliot</span>
                                    <span className="personnel-status patrol">Patrouille</span>
                                </div>
                                <div className="personnel-item">
                                    <span className="personnel-name">👤 Agent Larion</span>
                                    <span className="personnel-status break">Pause</span>
                                </div>
                                <div className="personnel-item">
                                    <span className="personnel-name">👤 Agent Lova</span>
                                    <span className="personnel-status active">Poste Fixe</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
