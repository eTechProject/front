import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import InputField from "../shared/InputField.jsx";
import {usePasswordReset} from "../hooks/usePasswordReset.js";
import {Key} from "lucide-react";

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { isLoading, error, success, performReset } = usePasswordReset();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Les mots de passe ne correspondent pas');
            return;
        }

        if (!token) {
            alert('Token invalide');
            navigate('/forgot-password');
            return;
        }

        await performReset(token, password);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className={'w-16 h-16 bg-gray-100 rounded-full items-center flex justify-center'}>
                        <Key className="w-8 h-8 text-orange-500"     />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-center text-orange-800 mb-6">
                    {success ? 'Réinitialisation réussie' : 'Créer un nouveau mot de passe'}
                </h1>

                {success ? (
                    <div className="text-center">
                        <p className="mb-6 text-gray-600">
                            Votre mot de passe a été réinitialisé avec succès.
                        </p>
                        <button
                            onClick={() => navigate('/auth')}
                            className="w-full bg-orange-500 text-white py-3 rounded hover:bg-orange-600 transition"
                        >
                            Se connecter
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <InputField
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nouveau mot de passe"
                            required
                            disabled={isLoading}
                        />

                        <InputField
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirmez le mot de passe"
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
                            className="w-full bg-orange-500 text-white py-3 rounded hover:bg-orange-600 transition disabled:opacity-50"
                        >
                            {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;