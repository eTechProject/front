import React, { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import globeImg from "../../../assets/equi-globe.png";
import ContactModalForm from "../../common/forms/ContactModalForm.jsx";

const faqData = [
    {
        question: "Combien de temps prend la mise en place ?",
        answer: "La plupart de nos clients sont opérationnels en moins de 48 heures. Notre équipe vous accompagne pas à pas dans l'import de vos données et la configuration initiale."
    },
    {
        question: "Puis-je essayer avant de m'engager ?",
        answer: "Absolument ! Nous offrons une période d'essai de 14 jours sans engagement. Vous pourrez tester toutes les fonctionnalités avec des données fictives ou réelles."
    },
    {
        question: "Qu'en est-il de la sécurité des données ?",
        answer: "Vos données sont hébergées sur des serveurs sécurisés en France, avec chiffrement AES-256. Nous sommes certifiés ISO 27001 et conformes au RGPD."
    },
    {
        question: "Puis-je intégrer SecuriManager avec d'autres systèmes ?",
        answer: "Oui, notre solution propose des API ouvertes pour intégrer vos systèmes RH, de paie ou de gestion des accès. Nous avons également des connecteurs prêts à l'emploi pour les solutions les plus courantes."
    },
    {
        question: "Quel support technique est disponible ?",
        answer: "Nous offrons un support par email, chat et téléphone selon votre formule. Notre temps de réponse moyen est inférieur à 2 heures pour les questions urgentes."
    },
    {
        question: "Existe-t-il une application mobile ?",
        answer: "Oui, des applications natives sont disponibles pour iOS et Android, permettant à vos agents de consulter leur planning, signaler des incidents et communiquer en temps réel."
    }
];

const N = 20;
const arcsData = [...Array(N).keys()].map(() => ({
    startLat: (Math.random() - 0.5) * 180,
    startLng: (Math.random() - 0.5) * 360,
    endLat: (Math.random() - 0.5) * 180,
    endLng: (Math.random() - 0.5) * 360,
    color: [['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)], ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]],
}));

const FaqItem = ({ item, isOpen, onClick }) => {
    return (
        <div className={`bg-zinc-800 p-4 rounded-xl border ${isOpen ? 'border-[#FF8C00]' : 'border-gray-800'} transition-all duration-300 hover:border-[#FF8C00]/50`}>
            <dt
                className="text-lg font-medium text-white cursor-pointer flex items-start"
                onClick={onClick}
            >
                <span className={`flex-shrink-0 mr-3 mt-0.5 text-[#FF8C00] ${isOpen ? 'transform rotate-90' : ''} transition-transform duration-200`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </span>
                <span className="flex-1">{item.question}</span>
            </dt>
            <div
                className={`mt-4 text-gray-400 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="pl-5 pb-2">
                    {item.answer}
                </div>
            </div>
        </div>
    );
};



const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const globeEl = useRef();

    useEffect(() => {
        if (globeEl.current) {
            // Configuration du globe
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.5;
            globeEl.current.controls().enableZoom = false;
            globeEl.current.pointOfView({ lat: 48.8566, lng: 2.3522, altitude: 2 });
        }
    }, []);

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleContactClick = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    return (
        <>
            <section id="faq" className="py-12 md:py-20 bg-zinc-900 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12 md:mb-16">
                        <span className="text-sm font-semibold tracking-wider uppercase text-[#FF8C00]">FAQ</span>
                        <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                            Questions <span className="text-[#FF8C00]">fréquentes</span>
                        </h2>
                        <p className="mt-3 max-w-2xl mx-auto text-base md:text-lg text-gray-400">
                            Trouvez rapidement les réponses à vos questions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                        <div className="hidden lg:flex justify-center items-center h-full">
                            <div className="w-full absolute max-w-md h-80 mx-auto relative">
                                <div className="relative -top-2/3">
                                    <Globe
                                        ref={globeEl}
                                        globeImageUrl={globeImg}
                                        backgroundColor="rgba(0,0,0,0)"
                                        arcsData={arcsData}
                                        arcColor={'color'}
                                        arcDashLength={() => Math.random()}
                                        arcDashGap={() => Math.random()}
                                        arcDashAnimateTime={() => Math.random() * 4000 + 500}
                                        width={500}
                                        height={550}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section FAQ */}
                        <div className="space-y-3 md:space-y-4">
                            {faqData.map((item, index) => (
                                <FaqItem
                                    key={index}
                                    item={item}
                                    isOpen={openIndex === index}
                                    onClick={() => handleToggle(index)}
                                />
                            ))}

                            <div className="mt-6 md:mt-8 text-center">
                                <p className="text-gray-400 mb-3 md:mb-4">
                                    Vous ne trouvez pas la réponse à votre question ?
                                </p>
                                <button
                                    onClick={handleContactClick}
                                    className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 border border-transparent text-sm md:text-base font-medium rounded-md text-white bg-gradient-to-r from-[#FF8C00] to-[#ff9933] hover:opacity-90 transition duration-300"
                                >
                                    Contactez notre équipe
                                    <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <ContactModalForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default FAQ;