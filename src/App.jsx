import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "./App.css"
import SmoothScroll from "./useTools/SmoothScroll.jsx";
import AuthPage from './pages/AuthPage';
import LandingPage from "./pages/LandingPage.jsx";
import RouterConfig from "./routes/Router.jsx";

function App() {
    useEffect(() => {
        // Animation fadeIn
        const style = document.createElement("style");
        style.innerHTML = `
      .animate-fadeIn {
        animation: fadeIn 1s cubic-bezier(.4,0,.1,1) both;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(5px);}
        to { opacity: 1; transform: none;}
      }
    `;
        document.head.appendChild(style);
        // Fade-in sur scroll
        const observer = new window.IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("animate-fadeIn");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );
        document.querySelectorAll("section, .project-card").forEach((el) => observer.observe(el));
        return () => {
            document.head.removeChild(style);
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        // Particle Creation (simplified)
        const particlesContainerId = 'particles-js-bg';
        let particlesContainer = document.getElementById(particlesContainerId);
        if (!particlesContainer) {
            particlesContainer = document.createElement('div');
            particlesContainer.id = particlesContainerId;
            particlesContainer.style.position = 'fixed';
            particlesContainer.style.top = '0';
            particlesContainer.style.left = '0';
            particlesContainer.style.width = '100%';
            particlesContainer.style.height = '100%';
            particlesContainer.style.zIndex = '-1';
            particlesContainer.style.pointerEvents = 'none';
            document.body.insertBefore(particlesContainer, document.body.firstChild);
        }

        const createParticles = () => {
            if (!document.getElementById(particlesContainerId)) return;
            const particleCount = 50;
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.position = 'absolute';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.width = `${Math.random() * 2 + 1}px`;
                particle.style.height = particle.style.width;
                particle.style.animationDelay = Math.random() * 10 + 's';
                particle.style.animationDuration = (Math.random() * 5 + 10) + 's';
                if (document.getElementById(particlesContainerId)) {
                    document.getElementById(particlesContainerId).appendChild(particle);
                }
            }
        };
        createParticles();

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

        elementsToAnimate.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });

        window.addEventListener('scroll', handleScrollAnimations);
        handleScrollAnimations();

        const fontAwesomeLink = document.createElement('link');
        fontAwesomeLink.rel = 'stylesheet';
        fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fontAwesomeLink);

        return () => {
            window.removeEventListener('scroll', handleScrollAnimations);
            if (document.getElementById(particlesContainerId)) {
                document.getElementById(particlesContainerId).remove();
            }
            document.head.removeChild(fontAwesomeLink);
        };
    }, []);

    return (
        <Router>
            <SmoothScroll/>
            <RouterConfig/>
        </Router>
    );
}

export default App;