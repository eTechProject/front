import React, { useEffect } from "react";
import AOS from 'aos';
import 'aos/dist/aos.css';

import Hero from "../components/contents/Hero.jsx";
import Clients from "../components/contents/Clients.jsx";
import Features from "../components/contents/Features.jsx";
import HowItWorks from "../components/contents/HowItWorks.jsx";
import Stats from "../components/contents/Stats.jsx";
import Pricing from "../components/contents/Pricing.jsx";
import FAQ from "../components/contents/FAQ.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/contents/Footer.jsx";
import BackToTopButton from "../shared/BackToTopButton.jsx";

function LandingPage() {
    useEffect(() => {
        // Initialiser AOS
        AOS.init({
            duration: 700,
            easing: 'ease-in-out',
            once: true,
            offset: 80,
        });

        // Nettoyer AOS lors du démontage du composant
        return () => {
            AOS.refresh();
        };
    }, []);

    return (
        <>
            <Navbar />
            <main>
                    <Hero />
                <div data-aos="fade-up" data-aos-delay="200">
                    <Clients />
                </div>
                <div data-aos="fade-up" data-aos-delay="200">
                    <Features />
                </div>
                <div data-aos="fade-up" data-aos-delay="200">
                    <HowItWorks />
                </div>
                <div data-aos="fade-up" data-aos-delay="300">
                    <Stats />
                </div>
                <Pricing />
                <FAQ />
            </main>
            <Footer data-aos="fade-up" />
            <BackToTopButton />
        </>
    );
}

export default LandingPage;