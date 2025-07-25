import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Camera, Mail, User, Phone, CheckCircle2, Info } from 'lucide-react';
import { useAuth } from "../../../context/AuthContext.jsx";
import { useUser } from "../../../hooks/useUser.js";

const PASSWORD_REQUIREMENTS = [
    { id: 1, text: "Au moins 8 caractères", regex: /.{8,}/ },
    { id: 2, text: "Au moins une majuscule", regex: /[A-Z]/ },
    { id: 3, text: "Au moins un chiffre", regex: /[0-9]/ },
    { id: 4, text: "Au moins un caractère spécial", regex: /[^A-Za-z0-9]/ },
];

const NotificationComponent = ({ notification, onClose }) => {
    if (!notification.show) return null;
    return (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center transition-all duration-300 ${
            notification.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-green-50 border border-green-200 text-green-800'
        }`}>
            <span className="text-sm font-medium">{notification.message}</span>
            <button
                onClick={onClose}
                className="ml-3 text-current hover:opacity-70"
            >
                ×
            </button>
        </div>
    );
};

const ProfileField = ({ label, value, onChange, name, type = "text", disabled, placeholder }) => (
    <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {type === "textarea" ? (
            <textarea
                name={name}
                value={value || ''}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-sm border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-600 border-gray-300 min-h-[60px]"
            />
        ) : (
            <input
                type={type}
                name={name}
                value={value || ''}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-sm border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-600 border-gray-300"
            />
        )}
    </div>
);

const PasswordStrengthIndicator = ({ password, validations }) => {
    if (!password) return null;

    return (
        <div className="mt-2 space-y-2">
            <div className="text-xs text-gray-500">Exigences du mot de passe :</div>
            <ul className="space-y-1">
                {validations.map((req) => (
                    <li key={req.id} className="flex items-center">
                        <span className={`inline-block w-2 h-2 mr-2 rounded-full ${
                            req.isValid ? 'bg-green-600' : 'bg-gray-300'
                        }`}></span>
                        <span className={`text-xs ${
                            req.isValid ? 'text-green-600' : 'text-gray-500'
                        }`}>{req.text}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const PasswordMatchIndicator = ({ password, confirmPassword }) => {
    if (!password || !confirmPassword) return null;

    const isMatch = password === confirmPassword;

    return (
        <div className="mt-2 flex items-center">
            <span className={`inline-block w-4 h-4 mr-2 rounded-full ${
                isMatch ? 'bg-green-500' : 'bg-gray-300'
            }`}></span>
            <span className={`text-xs ${
                isMatch ? 'text-green-600' : 'text-gray-500'
            }`}>
                {isMatch ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
            </span>
        </div>
    );
};

export default function ProfileContent() {
    const { user } = useAuth();
    const { updateProfile, updatePassword } = useUser();

    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        avatar: null,
        bio: ''
    });
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordValidations, setPasswordValidations] = useState(
        PASSWORD_REQUIREMENTS.map(req => ({ ...req, isValid: false }))
    );

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                avatar: user.avatar || null,
                bio: user.bio || ''
            });
        }
    }, [user]);

    const showNotification = useCallback((type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    }, []);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handlePasswordChange = useCallback((e) => {
        const { name, value } = e.target;
        setPasswordData(prev => {
            const newData = { ...prev, [name]: value };

            if (name === 'newPassword') {
                const updatedValidations = PASSWORD_REQUIREMENTS.map(req => ({
                    ...req,
                    isValid: req.regex.test(value)
                }));
                setPasswordValidations(updatedValidations);
            }

            return newData;
        });
    }, []);

    const handleAvatarUpload = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                setFormData(prev => ({ ...prev, avatar: evt.target.result }));
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleSave = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await updateProfile(formData);
            if (result?.success || result === true) {
                setIsEditing(false);
                showNotification('success', 'Profil mis à jour avec succès !');
            } else {
                showNotification('error', 'Échec de la mise à jour');
            }
        } catch {
            showNotification('error', 'Erreur lors de la mise à jour');
        } finally {
            setIsLoading(false);
        }
    }, [formData, updateProfile, showNotification]);

    const handlePasswordSubmit = useCallback(async () => {
        const allValid = passwordValidations.every(req => req.isValid);
        if (!allValid) {
            showNotification('error', 'Le mot de passe ne remplit pas tous les critères requis');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showNotification('error', 'Les nouveaux mots de passe ne correspondent pas');
            return;
        }

        setIsLoading(true);
        try {
            const result = await updatePassword({
                newPassword: passwordData.newPassword
            });

            if (result?.success) {
                showNotification('success', 'Mot de passe mis à jour avec succès');
                setPasswordData({
                    newPassword: '',
                    confirmPassword: ''
                });
                setShowPasswordForm(false);
            } else {
                showNotification('error', result?.message || 'Échec de la mise à jour du mot de passe');
            }
        } catch (error) {
            showNotification('error', 'Erreur lors de la mise à jour du mot de passe');
        } finally {
            setIsLoading(false);
        }
    }, [passwordData, passwordValidations, showNotification, updatePassword]);

    const formattedDate = user && user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Inconnue';

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune donnée utilisateur disponible</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10" style={{ fontFamily: 'Inter, sans-serif' }}>
            <NotificationComponent
                notification={notification}
                onClose={() => setNotification(prev => ({ ...prev, show: false }))}
            />

            <div className="max-w-2xl mx-auto flex flex-col gap-8">
                {/* Profile Card (Header) */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row items-center gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br bg-zinc-900 flex items-center justify-center text-3xl">
                            {formData.avatar ? (
                                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white font-bold">
                                    {formData.name?.charAt(0)?.toUpperCase() || user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            )}
                        </div>
                        {isEditing && (
                            <label className="absolute -bottom-1 -right-1 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full cursor-pointer transition-colors duration-200 shadow">
                                <Camera className="w-4 h-4" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                    disabled={isLoading}
                                />
                            </label>
                        )}
                    </div>
                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-2xl font-semibold capitalize text-gray-900 truncate">
                                {user.name || 'Nom non défini'}
                            </h2>
                            <span className={`px-2 py-1 text-xs rounded font-medium border ${user.role === 'admin' ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || "Rôle"}
                            </span>
                            {user.verified && (
                                <span className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded">
                                    <CheckCircle2 className="w-4 h-4" /> Vérifié
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-gray-500 mt-2 text-sm items-center">
                            <div className="flex capitalize items-center gap-1">
                                <Mail className="w-4 h-4" />
                                <span>{user.email}</span>
                            </div>
                            {(user.phone || formData.phone) && (
                                <div className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    <span>{user.phone || formData.phone}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Info className="w-4 h-4" />
                                <span>Inscrit le {formattedDate}</span>
                            </div>
                        </div>
                    </div>
                    {/* Edit Button */}
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-orange-600 border border-gray-300 hover:border-orange-300 rounded-lg transition-colors duration-200"
                        >
                            <Edit className="w-4 h-4" />
                            Modifier
                        </button>
                    )}
                </div>

                {/* Personal Information Section */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-orange-400" /> Informations personnelles
                    </h3>
                    {isEditing ? (
                        <div className="space-y-4">
                            <ProfileField
                                label="Nom"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                placeholder="Entrez votre nom"
                            />
                            <ProfileField
                                label="Adresse email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                placeholder="Votre email"
                            />
                            <ProfileField
                                label="Téléphone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                placeholder="Votre numéro de téléphone"
                            />
                            <ProfileField
                                label="Bio"
                                name="bio"
                                type="textarea"
                                value={formData.bio}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                placeholder="Décrivez-vous en quelques mots"
                            />
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors duration-200 disabled:opacity-50"
                                >
                                    {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    disabled={isLoading}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8">
                            <div>
                                <span className="block text-xs text-gray-400 mb-1">Nom</span>
                                <span className="block font-medium text-gray-900">{user.name || <span className="text-gray-400">Non défini</span>}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-400 mb-1">Adresse email</span>
                                <span className="block font-medium text-gray-900">{user.email || <span className="text-gray-400">Non défini</span>}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-400 mb-1">Téléphone</span>
                                <span className="block font-medium text-gray-900">{user.phone || <span className="text-gray-400">Non défini</span>}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-400 mb-1">Bio</span>
                                <span className="block font-medium text-gray-900">{user.bio || <span className="text-gray-400">Aucune bio renseignée</span>}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Password Change Section */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            Sécurité du compte
                        </h3>
                        {!showPasswordForm && (
                            <button
                                onClick={() => setShowPasswordForm(true)}
                                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                            >
                                Changer le mot de passe
                            </button>
                        )}
                    </div>

                    {showPasswordForm ? (
                        <div className="space-y-4">
                            <div>
                                <ProfileField
                                    label="Nouveau mot de passe"
                                    name="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    disabled={isLoading}
                                    placeholder="Entrez votre nouveau mot de passe"
                                />
                                <PasswordStrengthIndicator
                                    password={passwordData.newPassword}
                                    validations={passwordValidations}
                                />
                            </div>

                            <div>
                                <ProfileField
                                    label="Confirmer le nouveau mot de passe"
                                    name="confirmPassword"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    disabled={isLoading}
                                    placeholder="Confirmez votre nouveau mot de passe"
                                />
                                <PasswordMatchIndicator
                                    password={passwordData.newPassword}
                                    confirmPassword={passwordData.confirmPassword}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handlePasswordSubmit}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors duration-200 disabled:opacity-50"
                                >
                                    {isLoading ? 'Enregistrement...' : 'Mettre à jour le mot de passe'}
                                </button>
                                <button
                                    onClick={() => setShowPasswordForm(false)}
                                    disabled={isLoading}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">
                            Pour des raisons de sécurité, nous vous recommandons de changer votre mot de passe régulièrement.
                            Votre mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}