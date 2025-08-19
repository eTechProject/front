import React, { useEffect } from "react";
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from "@/components/layout/headers/Navbar.jsx";
import Hero from "@/components/features/landing/Hero.jsx";
import Features from "@/components/features/landing/Features.jsx";
import HowItWorks from "@/components/features/landing/HowItWorks.jsx";
import Stats from "@/components/features/landing/Stats.jsx";
import Pricing from "@/components/features/landing/Pricing.jsx";
import FAQ from "@/components/features/landing/FAQ.jsx";
import Footer from "@/components/features/landing/Footer.jsx";
import Clients from "@/components/features/landing/Clients.jsx";
import BackToTopButton from "@/components/common/navigation/BackToTopButton.jsx";


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