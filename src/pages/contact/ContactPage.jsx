import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo128.png";
import BackButtonHome from "@/components/common/navigation/BackHomeButton.jsx";

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });
    const [result, setResult] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setResult("Envoi en cours...");

        const formDataToSend = new FormData();
        formDataToSend.append("access_key", "d10b68c3-ac7f-4fe1-b93d-6c4c1bca19a6");
        formDataToSend.append("name", formData.name);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("phone", formData.phone);
        formDataToSend.append("subject", formData.subject);
        formDataToSend.append("message", formData.message);

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formDataToSend,
            });

            const data = await response.json();

            if (data.success) {
                setResult("Message envoyé avec succès !");
                setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
                setTimeout(() => navigate("/"), 2000);
            } else {
                setResult(data.message || "Une erreur s'est produite. Veuillez réessayer.");
            }
        } catch (error) {
            console.error("Error:", error);
            setResult("Erreur de connexion. Veuillez réessayer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-screen flex flex-col justify-between">
            <BackButtonHome />
            <section className="bg-white text-white py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Section - Contact Info */}
                        <div className="p-6 bg-gray-50 rounded-lg">
                            <h3 className="text-4xl font-bold text-black mb-6">Nous contacter</h3>
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-px bg-[#FF8C00] mr-4"></div>
                                <p className="mt-4 max-w-2xl mx-auto text-md text-gray-600">
                                    Nous sommes ravis d'avoir de vos nouvelles et de commencer quelque chose de spécial ensemble.
                                </p>
                            </div>
                            <div className="space-y-4 text-sm text-gray-600">
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
                                    <p
                                        className="text-[#FF8C00] cursor-pointer hover:underline"
                                        onClick={() => window.open("https://maps.google.com", "_blank")}
                                    >
                                        Voir sur Google Maps ↗
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6">
                                <h4 className="font-semibold text-black mb-4">N'hésitez pas à nous dire bonjour !</h4>
                            </div>
                        </div>
                        {/* Right Section - Form */}
                        <div className="p-6 bg-gray-50 rounded-lg">
                            <h3 className="text-5xl font-bold text-black mb-6">Envoyez-nous un message</h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Nom"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-transparent border-b border-gray-300 pb-2 text-black placeholder-gray-400 focus:border-[#FF8C00] focus:outline-none transition-colors"
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-transparent border-b border-gray-300 pb-2 text-black placeholder-gray-400 focus:border-[#FF8C00] focus:outline-none transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Téléphone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full bg-transparent border-b border-gray-300 pb-2 text-black placeholder-gray-400 focus:border-[#FF8C00] focus:outline-none transition-colors"
                                    />
                                    <input
                                        type="text"
                                        name="subject"
                                        placeholder="Sujet"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        className="w-full bg-transparent border-b border-gray-300 pb-2 text-black placeholder-gray-400 focus:border-[#FF8C00] focus:outline-none transition-colors"
                                    />
                                </div>
                                <textarea
                                    name="message"
                                    placeholder="Parlez-nous de ce qui vous intéresse"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    rows={4}
                                    className="w-full bg-transparent border-b border-gray-300 pb-2 text-black placeholder-gray-400 focus:border-[#FF8C00] focus:outline-none transition-colors resize-none"
                                ></textarea>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#FF8C00] text-white py-3 rounded-full font-bold hover:bg-[#E67E00] transition duration-300 disabled:opacity-70"
                                >
                                    {isSubmitting ? "Envoi en cours..." : "Nous envoyer"}
                                </button>
                                {result && (
                                    <p className={`text-center ${result.includes("succès") ? "text-green-600" : "text-red-600"}`}>
                                        {result}
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </section>
            <footer className="bg-zinc-950 border-t border-zinc-800 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-2">
                            <div className="flex items-center mb-4 w-24">
                                <img src={logo} alt="Guard logo" />
                            </div>
                            <p className="text-gray-400 mb-6">
                                La solution ultime pour une gestion autonome et optimisée de vos équipes de sécurité.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-400 hover:text-[#00f0ff] transition duration-300">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-[#00f0ff] transition duration-300">
                                    <i className="fab fa-linkedin-in"></i>
                                </a>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg text-white font-semibold mb-4">Légal</h3>
                            <ul className="space-y-2">
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-[#00f0ff] transition duration-300">
                                        Politique de confidentialité
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 mb-4 md:mb-0">
                            &copy; 2025 GUARD. Tous droits réservés.
                        </p>
                        <div className="flex space-x-6">
                            <a href="#" className="text-gray-400 hover:text-[#00f0ff] transition duration-300 text-sm">
                                Cookies
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ContactPage;