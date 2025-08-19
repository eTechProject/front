import React, { useState, useEffect, useCallback } from 'react';
import { Edit, Camera, Mail, User, Phone, CheckCircle2, Lock, Info, AlertCircle } from 'lucide-react';
import {useAuth} from "@/context/AuthContext.jsx";
import {authService} from "@/services/auth/authService.js";
import {userService} from "@/services/features/user/userService.js";

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

const ValidationErrors = ({ errors }) => {
    if (!errors || Object.keys(errors).length === 0) return null;

    return (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Erreurs de validation :</span>
            </div>
            <ul className="space-y-1">
                {Object.entries(errors).map(([field, fieldErrors]) => (
                    <li key={field} className="text-sm text-red-700">
                        <span className="font-medium capitalize">{field}:</span>{' '}
                        {Array.isArray(fieldErrors) ? fieldErrors.join(', ') : fieldErrors}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ProfileField = ({ label, value, onChange, name, type = "text", disabled, placeholder, hasError }) => (
    <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full px-3 py-2 text-sm border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-600 ${
                hasError
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
            }`}
        />
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

    const [localUserData, setLocalUserData] = useState(null);

    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        avatarUrl: null
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordValidations, setPasswordValidations] = useState(
        PASSWORD_REQUIREMENTS.map(req => ({ ...req, isValid: false }))
    );

    // États pour les erreurs serveur
    const [profileErrors, setProfileErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});

    const currentUser = localUserData || user;

    useEffect(() => {
        if (user) {
            setLocalUserData(user);
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                avatarUrl: user.avatar || null
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
        // Nettoyer les erreurs pour ce champ quand l'utilisateur tape
        if (profileErrors[name]) {
            setProfileErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [profileErrors]);

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

        // Nettoyer les erreurs pour ce champ quand l'utilisateur tape
        if (passwordErrors[name] || passwordErrors[name === 'currentPassword' ? 'current_password' : name]) {
            setPasswordErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                delete newErrors[name === 'currentPassword' ? 'current_password' : name];
                return newErrors;
            });
        }
    }, [passwordErrors]);

    const handleAvatarUpload = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onload = (evt) => {
                setFormData(prev => ({ ...prev, avatarUrl: evt.target.result }));
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleSave = useCallback(async () => {
        if (!user?.userId) {
            showNotification('error', 'Utilisateur non identifié');
            return;
        }

        setIsLoading(true);
        setProfileErrors({});

        try {
            // Update profile data using userService directly
            const profileResult = await userService.updateProfile(user.userId, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            });

            if (!profileResult.success) {
                // Afficher les erreurs de validation détaillées
                if (profileResult.details && Object.keys(profileResult.details).length > 0) {
                    setProfileErrors(profileResult.details);
                }
                showNotification('error', profileResult.error || 'Échec de la mise à jour du profil');
                return;
            }

            // Mise à jour instantanée avec les données du serveur
            if (profileResult.data) {
                setLocalUserData(prev => ({
                    ...prev,
                    ...profileResult.data,
                    userId: prev?.userId || user.userId,
                    role: prev?.role || user.role,
                    verified: prev?.verified || user.verified,
                    createdAt: prev?.createdAt || user.createdAt,
                    avatar: prev?.avatar // L'avatar sera mis à jour séparément si nécessaire
                }));
            }

            // Update avatar if a new file was selected
            let avatarResult = { success: true };
            if (avatarFile) {
                avatarResult = await userService.updateAvatar(avatarFile);
                if (!avatarResult.success) {
                    showNotification('error', avatarResult.error || 'Échec de la mise à jour de l\'avatar');
                    return;
                }

                if (avatarResult.data && avatarResult.data.avatarUrl) {
                    setLocalUserData(prev => ({
                        ...prev,
                        avatar: avatarResult.data.avatarUrl
                    }));
                    setFormData(prev => ({
                        ...prev,
                        avatarUrl: avatarResult.data.avatarUrl
                    }));
                }
            }

            // Refresh user data
            const refreshResult = await authService.refreshUserData(user.userId);

            setIsEditing(false);
            setAvatarFile(null);
            setProfileErrors({});
            showNotification('success', 'Profil mis à jour avec succès !');
        } catch(error) {
            console.log(error)
            showNotification('error', 'Erreur lors de la mise à jour');
        } finally {
            setIsLoading(false);
        }
    }, [formData, avatarFile, user, showNotification]);

    const handlePasswordSubmit = useCallback(async () => {
        console.log('handlePasswordSubmit called')
        if (!user?.userId) {
            showNotification('error', 'Utilisateur non identifié');
            return;
        }

        if (!passwordData.currentPassword) {
            showNotification('error', 'Veuillez entrer votre mot de passe actuel');
            return;
        }

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
        setPasswordErrors({});

        try {
            const result = await userService.updatePassword(user.userId, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            if (result.success) {
                showNotification('success', 'Mot de passe mis à jour avec succès');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setPasswordErrors({});
                setShowPasswordForm(false);

            } else {
                if (result.details && Object.keys(result.details).length > 0) {
                    setPasswordErrors(result.details);
                }
                showNotification('error', result.error || 'Échec de la mise à jour du mot de passe');
            }
        } catch {
            showNotification('error', 'Erreur lors de la mise à jour du mot de passe');
        } finally {
            setIsLoading(false);
        }
    }, [passwordData, passwordValidations, user, showNotification]);

    const formattedDate = currentUser && currentUser.createdAt
        ? new Date(currentUser.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Inconnue';

    if (!currentUser) {
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
                            {formData.avatarUrl ? (
                                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white font-bold">
                                    {formData.name?.charAt(0)?.toUpperCase() || currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
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
                                {currentUser.name || 'Nom non défini'}
                            </h2>
                            <span className={`px-2 py-1 text-xs rounded font-medium border ${currentUser.role === 'admin' ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                                {currentUser.role?.charAt(0).toUpperCase() + currentUser.role?.slice(1) || "Rôle"}
                            </span>
                            {currentUser.verified && (
                                <span className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded">
                                    <CheckCircle2 className="w-4 h-4" /> Vérifié
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-gray-500 mt-2 text-sm items-center">
                            <div className="flex capitalize items-center gap-1">
                                <Mail className="w-4 h-4" />
                                <span>{currentUser.email}</span>
                            </div>
                            {(currentUser.phone || formData.phone) && (
                                <div className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    <span>{currentUser.phone || formData.phone}</span>
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
                                hasError={profileErrors.name}
                            />
                            <ProfileField
                                label="Adresse email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                placeholder="Votre email"
                                hasError={profileErrors.email}
                            />
                            <ProfileField
                                label="Téléphone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                placeholder="Votre numéro de téléphone"
                                hasError={profileErrors.phone}
                            />

                            {/* Afficher les erreurs de validation du profil */}
                            <ValidationErrors errors={profileErrors} />

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors duration-200 disabled:opacity-50"
                                >
                                    {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setAvatarFile(null);
                                        setProfileErrors({});
                                        setFormData(prev => ({ ...prev, avatarUrl: currentUser.avatar || null }));
                                    }}
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
                                <span className="block font-medium text-gray-900">{currentUser.name || <span className="text-gray-400">Non défini</span>}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-400 mb-1">Adresse email</span>
                                <span className="block font-medium text-gray-900">{currentUser.email || <span className="text-gray-400">Non défini</span>}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-400 mb-1">Téléphone</span>
                                <span className="block font-medium text-gray-900">{currentUser.phone || <span className="text-gray-400">Non défini</span>}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Password Change Section */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-orange-400" />
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
                                    label="Mot de passe actuel"
                                    name="currentPassword"
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    disabled={isLoading}
                                    placeholder="Entrez votre mot de passe actuel"
                                    hasError={passwordErrors.current_password}
                                />
                            </div>
                            <div>
                                <ProfileField
                                    label="Nouveau mot de passe"
                                    name="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    disabled={isLoading}
                                    placeholder="Entrez votre nouveau mot de passe"
                                    hasError={passwordErrors.new_password}
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

                            {/* Afficher les erreurs de validation du mot de passe */}
                            <ValidationErrors errors={passwordErrors} />

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handlePasswordSubmit}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors duration-200 disabled:opacity-50"
                                >
                                    {isLoading ? 'Enregistrement...' : 'Mettre à jour le mot de passe'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPasswordForm(false);
                                        setPasswordErrors({});
                                        setPasswordData({
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: ''
                                        });
                                    }}
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