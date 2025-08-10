import React from 'react';

const Testimonials = () => {
    return (
        <section id="testimonials" className="py-16 md:py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 md:mb-16">
                    <span className="text-sm font-semibold tracking-wider uppercase text-[#FF8C00]">TÉMOIGNAGES</span>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Ce que disent nos <span className="text-[#FF8C00]">clients</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* Testimonial 1 */}
                    <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-4 md:mb-6">
                            <img className="w-10 h-10 md:w-12 md:h-12 rounded-full mr-4"
                                 src="https://randomuser.me/api/portraits/men/32.jpg"
                                 alt="Jean Dupont" />
                            <div>
                                <h4 className="font-bold text-gray-900">Jean Dupont</h4>
                                <p className="text-gray-500 text-sm">Directeur, Sécurité Plus</p>
                            </div>
                        </div>
                        <p className="text-gray-600 italic mb-4 md:mb-6">
                            "GUARD a révolutionné notre gestion des équipes. Ce qui nous prenait des heures se fait maintenant en quelques clics. La planification automatique est un vrai bijou technologique."
                        </p>
                        <div className="flex text-[#FF8C00]">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star ml-1"></i>
                            <i className="fas fa-star ml-1"></i>
                            <i className="fas fa-star ml-1"></i>
                            <i className="fas fa-star ml-1"></i>
                        </div>
                    </div>

                    {/* Testimonial 2 */}
                    <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-4 md:mb-6">
                            <img className="w-10 h-10 md:w-12 md:h-12 rounded-full mr-4"
                                 src="https://randomuser.me/api/portraits/women/44.jpg"
                                 alt="Marie Lambert" />
                            <div>
                                <h4 className="font-bold text-gray-900">Marie Lambert</h4>
                                <p className="text-gray-500 text-sm">Responsable RH, Garde & Protect</p>
                            </div>
                        </div>
                        <p className="text-gray-600 italic mb-4 md:mb-6">
                            "L'interface est intuitive et le support réactif. Nos agents adorent l'application mobile qui simplifie leurs démarches. Les alertes en temps réel nous ont permis de réagir plus vite à plusieurs incidents."
                        </p>
                        <div className="flex text-[#FF8C00]">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star ml-1"></i>
                            <i className="fas fa-star ml-1"></i>
                            <i className="fas fa-star ml-1"></i>
                            <i className="fas fa-star ml-1"></i>
                        </div>
                    </div>

                    {/* Testimonial 3 */}
                    <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-4 md:mb-6">
                            <img className="w-10 h-10 md:w-12 md:h-12 rounded-full mr-4"
                                 src="https://randomuser.me/api/portraits/men/75.jpg"
                                 alt="Thomas Leroy" />
                            <div>
                                <h4 className="font-bold text-gray-900">Thomas Leroy</h4>
                                <p className="text-gray-500 text-sm">Directeur des Opérations, Vigilance Group</p>
                            </div>
                        </div>
                        <p className="text-gray-600 italic mb-4 md:mb-6">
                            "Après avoir testé plusieurs solutions, GUARD s'est imposé par sa complétude et sa fiabilité. L'équipe a su s'adapter à nos besoins spécifiques avec des développements sur mesure."
                        </p>
                        <div className="flex text-[#FF8C00]">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star ml-1"></i>
                            <i className="fas fa-star ml-1"></i>
                            <i className="fas fa-star ml-1"></i>
                            <i className="fas fa-star-half-alt ml-1"></i>
                        </div>
                    </div>

                    {/* Testimonial 4 */}
                    <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center mb-4 md:mb-6">
                            <img className="w-10 h-10 md:w-12 md:h-12 rounded-full mr-4"
                                 src="https://randomuser.me/api/portraits/women/68.jpg"
                                 alt="Sophie Martin" />
                            <div>
                                <h4 className="font-bold text-gray-900">Sophie Martin</h4>
                                <p className="text-gray-500 text-sm">Chef de service, Urban Sécurité</p>
                            </div>
                        </div>
                        <p className="text-gray-600 italic mb-4 md:mb-6">
                            "Les tableaux de bord analytiques nous donnent une visibilité inédite sur nos opérations. Nous avons réduit nos coûts de gestion de 30% tout en améliorant notre couverture terrain."
                        </p>
                        <div className="flex text-[#FF8C00]">
                            <i className="fas fa-star"></i>
                            <i className="fas fa-star ml-1"></i>
                            <i className="fas fa-star ml-1"></i>
                            <i className="fas fa-star ml-1"></i>
                            <i className="fas fa-star ml-1"></i>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;