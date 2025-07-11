import React from "react";
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

function LandingPage(){
    return (
        <>
            <Navbar />
            <main>
                <Hero />
                <Clients />
                <Features />
                <HowItWorks />
                <Stats />
                <Pricing />
                <FAQ />
            </main>
            <Footer />
            <BackToTopButton />
        </>
    );
}
export default LandingPage;