import {useState} from "react";

export default function ContactModalForm ({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        console.log('Form submitted:', formData);
        alert('Message envoyé avec succès !');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
                    {/* Section gauche - Texte */}
                    <div className="p-8 md:p-12 bg-gray-50 flex flex-col justify-center">
                        <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 leading-tight">
                            Prenons<br />
                            contact
                        </h2>

                        <div className="flex items-center mb-8">
                            <div className="w-12 h-px bg-black mr-4"></div>
                            <p className="text-gray-600 text-sm">
                                Parfait ! Nous sommes ravis d'avoir de vos nouvelles<br />
                                et de commencer quelque chose de spécial ensemble.<br />
                                Appelez-nous pour toute demande.
                            </p>
                        </div>

                        <div className="space-y-4 text-sm text-gray-700">
                            <div>
                                <p className="font-semibold text-black">Téléphone</p>
                                <p>2913</p>
                            </div>

                            <div>
                                <p className="font-semibold text-black">Email</p>
                                <p>contact@guard</p>
                            </div>

                            <div>
                                <p className="font-semibold text-black">Bureau</p>
                                <p>Somewhere in 919</p>
                                <p>Antananarivo</p>
                                <p className="text-orange-600 cursor-pointer hover:underline">Voir sur Google Maps ↗</p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="font-semibold text-black mb-4">N'hésitez pas à nous dire bonjour !</h3>
                        </div>
                    </div>

                    {/* Section droite - Formulaire */}
                    <div className="p-8 md:p-12 bg-zinc-900 text-white">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold">Contact</h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Nom"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full bg-transparent border-b border-gray-600 pb-2 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full bg-transparent border-b border-gray-600 pb-2 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Téléphone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full bg-transparent border-b border-gray-600 pb-2 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        name="subject"
                                        placeholder="Sujet"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        className="w-full bg-transparent border-b border-gray-600 pb-2 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <textarea
                                    name="message"
                                    placeholder="Parlez-nous de ce qui vous intéresse"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full bg-transparent border-b border-gray-600 pb-2 text-white placeholder-gray-400 focus:border-orange-400 focus:outline-none transition-colors resize-none"
                                ></textarea>
                            </div>

                            <button
                                onClick={handleSubmit}
                                className="w-full bg-orange-400 text-black font-bold py-3 px-6 rounded-lg hover:bg-orange-500 transition-colors duration-200"
                            >
                                Nous envoyer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};