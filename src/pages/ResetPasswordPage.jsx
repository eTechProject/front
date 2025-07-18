import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePasswordReset } from "../hooks/usePasswordReset.js";
import { Key, CheckCircle } from "lucide-react";
import PasswordInputField from "../shared/PasswordInputField.jsx";

const ResetPasswordPage = () => {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const { isLoading, error, success, resetPassword } = usePasswordReset();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            alert('Token invalide ou expiré');
            navigate('/forgot-password');
        }
    }, [token, navigate]);

    const validatePassword = (value) => {
        if (value.length < 8) {
            return 'Le mot de passe doit contenir au moins 8 caractères';
        }
        if (!/[A-Z]/.test(value)) {
            return 'Le mot de passe doit contenir au moins une majuscule';
        }
        if (!/[0-9]/.test(value)) {
            return 'Le mot de passe doit contenir au moins un chiffre';
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
            return 'Le mot de passe doit contenir au moins un caractère spécial';
        }
        return '';
    };

    const handlePasswordChange = (value) => {
        setPassword(value);
        setPasswordError(validatePassword(value));

        // Valider la confirmation si les deux champs sont remplis
        if (confirmPassword && value !== confirmPassword) {
            setConfirmError('Les mots de passe ne correspondent pas');
        } else {
            setConfirmError('');
        }
    };

    const handleConfirmChange = (value) => {
        setConfirmPassword(value);
        if (password !== value) {
            setConfirmError('Les mots de passe ne correspondent pas');
        } else {
            setConfirmError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const passwordValidation = validatePassword(password);
        if (passwordValidation) {
            setPasswordError(passwordValidation);
            return;
        }

        if (password !== confirmPassword) {
            setConfirmError('Les mots de passe ne correspondent pas');
            return;
        }

        await resetPassword(token, password);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
            <div className="bg-white  p-8 w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center'>
                        {success ? (
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        ) : (
                            <Key className="w-8 h-8 text-orange-500" />
                        )}
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-center text-orange-800 mb-6">
                    {success ? 'Réinitialisation réussie' : 'Nouveau mot de passe'}
                </h1>

                {success ? (
                    <div className="text-center">
                        <p className="mb-6 text-gray-600">
                            Votre mot de passe a été réinitialisé avec succès.
                        </p>
                        <button
                            onClick={() => navigate('/auth')}
                            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition"
                        >
                            Se connecter
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} noValidate>
                        <PasswordInputField
                            name="password"
                            value={password}
                            placeholder="Nouveau mot de passe"
                            disabled={isLoading}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            error={passwordError}
                            showStrengthIndicator
                        />

                        <PasswordInputField
                            name="confirmPassword"
                            value={confirmPassword}
                            placeholder="Confirmez le mot de passe"
                            disabled={isLoading}
                            onChange={(e) => handleConfirmChange(e.target.value)}
                            error={confirmError}
                        />

                        {error && (
                            <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || passwordError || confirmError}
                            className={`w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition ${
                                isLoading || passwordError || confirmError ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
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