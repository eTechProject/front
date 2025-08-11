import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import  {Mail} from "lucide-react";
import {usePasswordReset} from "@/hooks/auth/usePasswordReset.js";
import InputField from "@/components/common/ui/InputField.jsx";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const { isLoading, error, success, requestReset } = usePasswordReset();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await requestReset(email);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
            <div className="bg-white   p-8 w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className={'w-16 h-16 bg-gray-100 rounded-full items-center flex justify-center'}>
                        <Mail className="w-8 h-8 text-orange-500"     />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-center text-orange-800 mb-6">
                    {success ? 'Email envoyé' : 'Mot de passe oublié ?'}
                </h1>

                {success ? (
                    <div className="text-center">
                        <p className="mb-6 text-gray-600">
                            Si un compte existe avec cette adresse email, vous recevrez un lien de réinitialisation.
                        </p>
                        <button
                            onClick={() => navigate('/auth')}
                            className="w-full bg-orange-500 text-white py-3 rounded hover:bg-orange-600 transition"
                        >
                            Retour à la connexion
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-600 text-center mb-6">
                            Entrez votre adresse email pour recevoir un lien de réinitialisation
                        </p>

                        <form onSubmit={handleSubmit}>
                            <InputField
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Votre adresse email"
                                required
                                disabled={isLoading}
                            />

                            {error && (
                                <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-orange-500 text-white py-3 rounded hover:bg-orange-600 transition disabled:opacity-50 mt-4"
                            >
                                {isLoading ? 'Envoi en cours...' : 'Envoyer le lien'}
                            </button>
                        </form>

                        <button
                            type="button"
                            onClick={() => navigate('/auth')}
                            className="w-full mt-4 text-orange-500 hover:text-orange-700 transition"
                            disabled={isLoading}
                        >
                            Retour à la connexion
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;