import React from 'react';
import "./Clients.css";
const Clients = () => {
    const testimonials = [
        {
            id: 1,
            name: "Marie Dubois",
            role: "Directrice Marketing",
            company: "TechFlow Solutions",
            content: "Une solution qui a transformé notre efficacité opérationnelle. ROI visible dès le premier trimestre.",
        },
        {
            id: 2,
            name: "Thomas Laurent",
            role: "CEO",
            company: "InnovCorp",
            content: "Interface intuitive et support technique exceptionnel. Nos équipes ont adopté l'outil immédiatement.",
        },
        {
            id: 3,
            name: "Sophie Chen",
            role: "Product Manager",
            company: "Digital Nexus",
            content: "Fonctionnalités robustes et intégration parfaite avec notre infrastructure existante.",
        },
        {
            id: 4,
            name: "Alexandre Martin",
            role: "CTO",
            company: "Future Labs",
            content: "Sécurité de niveau entreprise et performances exceptionnelles. Exactement ce que nous cherchions.",
        },
        {
            id: 5,
            name: "Camille Rousseau",
            role: "Chef de Projet",
            company: "Quantum Systems",
            content: "Déploiement sans accroc et formation efficace. L'équipe support est très professionnelle.",
        },
        {
            id: 6,
            name: "David Wilson",
            role: "Operations Director",
            company: "Vertex Group",
            content: "Amélioration significative de nos processus métier. Un investissement stratégique rentable.",
        }
    ];

    return (
        <section className="py-16 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative">
                    <div className="flex overflow-hidden">
                        <div className="flex gap-6 animate-scroll">
                            {/* Premier set */}
                            {testimonials.map((testimonial) => (
                                <div
                                    key={`set1-${testimonial.id}`}
                                    className="flex-shrink-0 w-72 bg-white rounded-lg border border-slate-200 p-6 hover:border-orange-200 hover:shadow-md transition-all duration-300"
                                >
                                    {/* Content */}
                                    <p className="text-slate-700 mb-4 text-sm leading-relaxed">
                                        "{testimonial.content}"
                                    </p>

                                    {/* Author */}
                                    <div className="border-t border-slate-100 pt-4">
                                        <div className="font-semibold text-slate-900 text-sm">{testimonial.name}</div>
                                        <div className="text-xs text-slate-500">{testimonial.role}</div>
                                        <div className="text-xs text-orange-600 font-medium">{testimonial.company}</div>
                                    </div>
                                </div>
                            ))}

                            {/* Duplication pour effet infini */}
                            {testimonials.map((testimonial) => (
                                <div
                                    key={`set2-${testimonial.id}`}
                                    className="flex-shrink-0 w-72 bg-white rounded-lg border border-slate-200 p-6 hover:border-orange-200 hover:shadow-md transition-all duration-300"
                                >
                                    {/* Rating */}
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-4 h-4 text-orange-400 fill-current" viewBox="0 0 20 20">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                            </svg>
                                        ))}
                                    </div>

                                    {/* Content */}
                                    <p className="text-slate-700 mb-4 text-sm leading-relaxed">
                                        "{testimonial.content}"
                                    </p>

                                    {/* Author */}
                                    <div className="border-t border-slate-100 pt-4">
                                        <div className="font-semibold text-slate-900 text-sm">{testimonial.name}</div>
                                        <div className="text-xs text-slate-500">{testimonial.role}</div>
                                        <div className="text-xs text-orange-600 font-medium">{testimonial.company}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fade masks */}
                    <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none"></div>
                    <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
                </div>

                {/* Simple stats */}
                <div className="mt-12 flex justify-center gap-12">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900">4.9/5</div>
                        <div className="text-sm text-slate-600">Note moyenne</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900">500+</div>
                        <div className="text-sm text-slate-600">Entreprises</div>
                    </div>
                    <div className="thttps://1c411a145e7f.ngrok-free.app/ext-center">
                        <div className="text-2xl font-bold text-slate-900">98%</div>
                        <div className="text-sm text-slate-600">Satisfaction</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Clients;