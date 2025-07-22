import React, { useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import "./App.css";
import SmoothScroll from "./useTools/SmoothScroll.jsx";
import RouterConfig from "./routes/Router.jsx";
import {AuthProvider} from "./context/AuthContext.jsx";

function App() {
    // Refs pour éviter les fuites mémoire
    const observerRef = useRef(null);
    const styleRef = useRef(null);
    const fontAwesomeLinkRef = useRef(null);
    const particlesContainerRef = useRef(null);

    // Callback memoïsé pour la création des animations fadeIn
    const setupFadeInAnimations = useCallback(() => {
        if (styleRef.current) return;

        const style = document.createElement("style");
        style.innerHTML = `
            .animate-fadeIn {
                animation: fadeIn 1s cubic-bezier(.4,0,.1,1) both;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(5px); }
                to { opacity: 1; transform: none; }
            }
        `;
        document.head.appendChild(style);
        styleRef.current = style;

        // Observer pour les animations au scroll
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("animate-fadeIn");
                        observerRef.current.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        // Observer tous les éléments à animer
        document.querySelectorAll("section, .project-card").forEach((el) =>
            observerRef.current.observe(el)
        );
    }, []);

    // Callback memoïsé pour la création des particules
    const setupParticles = useCallback(() => {
        const particlesContainerId = 'particles-js-bg';
        let particlesContainer = document.getElementById(particlesContainerId);

        if (!particlesContainer) {
            particlesContainer = document.createElement('div');
            particlesContainer.id = particlesContainerId;

            // Styles des particules
            Object.assign(particlesContainer.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                zIndex: '-1',
                pointerEvents: 'none'
            });

            document.body.insertBefore(particlesContainer, document.body.firstChild);
            particlesContainerRef.current = particlesContainer;
        }

        // Création des particules avec une approche plus performante
        const createParticles = () => {
            if (!particlesContainer || !document.getElementById(particlesContainerId)) return;

            const fragment = document.createDocumentFragment();
            const particleCount = 50;

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';

                // Styles des particules
                Object.assign(particle.style, {
                    position: 'absolute',
                    left: Math.random() * 100 + '%',
                    top: Math.random() * 100 + '%',
                    width: `${Math.random() * 2 + 1}px`,
                    height: `${Math.random() * 2 + 1}px`,
                    animationDelay: Math.random() * 10 + 's',
                    animationDuration: (Math.random() * 5 + 10) + 's'
                });

                fragment.appendChild(particle);
            }

            particlesContainer.appendChild(fragment);
        };

        createParticles();
    }, []);

    // Callback memoïsé pour les animations au scroll
    const setupScrollAnimations = useCallback(() => {
        const elementsToAnimate = document.querySelectorAll('.fade-in, .feature-card, .gradient-border');

        const handleScrollAnimations = () => {
            elementsToAnimate.forEach(element => {
                const elementPosition = element.getBoundingClientRect().top;
                const screenPosition = window.innerHeight / 1.2;

                if (elementPosition < screenPosition) {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }
            });
        };

        // Initialisation des styles pour tous les éléments
        elementsToAnimate.forEach(el => {
            Object.assign(el.style, {
                opacity: '0',
                transform: 'translateY(20px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease'
            });
        });

        // Utilisation de requestAnimationFrame pour de meilleures performances
        let ticking = false;
        const optimizedScrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScrollAnimations();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
        handleScrollAnimations(); // Appel initial

        return () => {
            window.removeEventListener('scroll', optimizedScrollHandler);
        };
    }, []);

    // Effet principal d'initialisation
    useEffect(() => {
        setupFadeInAnimations();
        setupParticles();
        const cleanupScrollAnimations = setupScrollAnimations();

        // Fonction de nettoyage
        return () => {
            // Nettoyage des observateurs
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }

            // Nettoyage des styles
            if (styleRef.current && document.head.contains(styleRef.current)) {
                document.head.removeChild(styleRef.current);
                styleRef.current = null;
            }

            // Nettoyage des particules
            if (particlesContainerRef.current && document.body.contains(particlesContainerRef.current)) {
                particlesContainerRef.current.remove();
                particlesContainerRef.current = null;
            }

            // Nettoyage de Font Awesome
            if (fontAwesomeLinkRef.current && document.head.contains(fontAwesomeLinkRef.current)) {
                document.head.removeChild(fontAwesomeLinkRef.current);
                fontAwesomeLinkRef.current = null;
            }

            // Nettoyage des animations de scroll
            if (cleanupScrollAnimations) {
                cleanupScrollAnimations();
            }
        };
    }, [setupFadeInAnimations, setupParticles, setupScrollAnimations]);

    return (
        <AuthProvider>
            <Router>
                <SmoothScroll />
                <RouterConfig />
            </Router>
        </AuthProvider>

    );
}

export default App;