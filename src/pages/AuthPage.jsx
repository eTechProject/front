import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/logo128-U.png";
import BackButton from "../shared/BackButton.jsx";
import InputField from "../shared/InputField.jsx";
import { useAuth } from '../hooks/useAuth';

// Constants for validation
const VALIDATION_RULES = {
    username: {
        required: true,
        minLength: 4,
        maxLength: 20,
        message: "Le nom d'utilisateur"
    },
    email: {
        required: true,
        regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "L'email"
    },
    password: {
        required: true,
        minLength: 8,
        maxLength: 20,
        message: "Le mot de passe"
    },
    phone: {
        regex: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
        message: "Le numéro de téléphone"
    }
};

const AuthPage = () => {
    const navigate = useNavigate();
    const { login, register, isLoading, error, clearError } = useAuth();
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    // Form states
    const [registerForm, setRegisterForm] = useState({
        username: '',
        email: '',
        password: '',
        phone: ''
    });

    const [registerErrors, setRegisterErrors] = useState({});
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [loginErrors, setLoginErrors] = useState({});

    // Show notification when error changes
    useEffect(() => {
        if (error) {
            showNotification('error', error);
        }
    }, [error]);

    // Handle window resize with debounce
    useEffect(() => {
        let timeoutId;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIsMobileView(window.innerWidth < 768);
            }, 100);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, []);

    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        const timer = setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
            clearError();
        }, 5000);
        return () => clearTimeout(timer);
    };

    // Generic validation function
    const validateField = useCallback((name, value) => {
        const rules = VALIDATION_RULES[name];
        if (!rules) return '';

        if (rules.required && !value.trim()) {
            return `${rules.message} est requis`;
        }

        if (rules.minLength && value.length < rules.minLength) {
            return `${rules.message} doit contenir au moins ${rules.minLength} caractères`;
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            return `${rules.message} doit contenir moins de ${rules.maxLength} caractères`;
        }

        if (rules.regex && value && !rules.regex.test(value)) {
            return `${rules.message} n'est pas valide`;
        }

        return '';
    }, []);

    // Form change handlers
    const handleRegisterChange = useCallback((e) => {
        const { name, value } = e.target;
        setRegisterForm(prev => ({ ...prev, [name]: value }));
        setRegisterErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        clearError();
    }, [validateField, clearError]);

    const handleLoginChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;
        setLoginForm(prev => ({ ...prev, [name]: fieldValue }));

        if (type !== 'checkbox') {
            setLoginErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
        clearError();
    }, [validateField, clearError]);

    // Form submission handlers
    const handleRegisterSubmit = useCallback(async (e) => {
        e.preventDefault();
        const errors = {};
        let hasErrors = false;

        Object.keys(registerForm).forEach(key => {
            if (key !== 'phone' || registerForm[key]) {
                errors[key] = validateField(key, registerForm[key]);
                if (errors[key]) hasErrors = true;
            }
        });

        setRegisterErrors(errors);
        if (hasErrors) return;

        const result = await register({
            name: registerForm.username,
            email: registerForm.email,
            password: registerForm.password,
            phone: registerForm.phone || null
        });

        if (result.success) {
            showNotification('success', `Inscription réussie pour ${registerForm.username}!`);
            setTimeout(() => navigate('/dashboard'), 1500);
        } else if (result.details) {
            setRegisterErrors(prev => ({ ...prev, ...result.details }));
        }
    }, [registerForm, register, navigate, validateField]);

    const handleLoginSubmit = useCallback(async (e) => {
        e.preventDefault();
        const errors = {};
        let hasErrors = false;

        Object.keys(loginForm).forEach(key => {
            if (key !== 'rememberMe') {
                errors[key] = validateField(key, loginForm[key]);
                if (errors[key]) hasErrors = true;
            }
        });

        setLoginErrors(errors);
        if (hasErrors) return;

        const result = await login(loginForm);
        if (result.success) {
            showNotification('success', `Connexion réussie avec ${loginForm.email}!`);
            setTimeout(() => navigate('/dashboard'), 1500);
        } else if (result.details) {
            setLoginErrors(prev => ({ ...prev, ...result.details }));
        }
    }, [loginForm, login, navigate, validateField]);

    // Toggle between login/register on mobile
    const togglePanel = useCallback(() => {
        setIsRightPanelActive(!isRightPanelActive);
        setRegisterErrors({});
        setLoginErrors({});
        clearError();
    }, [isRightPanelActive, clearError]);

    // Common button props
    const authButtonProps = {
        className: "bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-12 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-300 hover:from-orange-600 hover:to-orange-700 active:scale-95 mb-6 shadow-lg disabled:opacity-50 w-full max-w-xs",
        disabled: isLoading
    };

    // Common input props
    const inputProps = {
        disabled: isLoading,
        required: true,
        onChange: isRightPanelActive ? handleRegisterChange : handleLoginChange
    };

    return (
        <>
            <BackButton />
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {/* Notification */}
                {notification.show && (
                    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center animate-fade-in ${
                        notification.type === 'error'
                            ? 'bg-red-100 border border-red-400 text-red-700'
                            : 'bg-green-100 border border-green-400 text-green-700'
                    }`}>
                        <span>{notification.message}</span>
                        <button
                            onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                            className="ml-4 text-current hover:opacity-70"
                            aria-label="Close notification"
                        >
                            ×
                        </button>
                    </div>
                )}

                <div className={`relative overflow-hidden w-full max-w-5xl min-h-[34rem] bg-white rounded-3xl shadow-2xl transition-all duration-600 ${isRightPanelActive ? 'right-panel-active' : ''}`}>
                    {/* Desktop View - Two Panels */}
                    {!isMobileView && (
                        <>
                            {/* Login Form */}
                            <div className={`absolute top-0 h-full w-1/2 transition-all duration-600 ease-in-out ${isRightPanelActive ? 'transform translate-x-full opacity-0 z-0' : 'opacity-100 z-10'}`}>
                                <form onSubmit={handleLoginSubmit} className="bg-white flex flex-col items-center justify-center h-full px-8 py-8 text-center">
                                    <h1 className="text-3xl font-bold mb-8 text-orange-800">Connectez-vous ici</h1>

                                    <InputField
                                        type="email"
                                        name="email"
                                        value={loginForm.email}
                                        placeholder="Adresse email"
                                        error={loginErrors.email}
                                        {...inputProps}
                                    />

                                    <InputField
                                        type="password"
                                        name="password"
                                        value={loginForm.password}
                                        placeholder="Mot de passe"
                                        error={loginErrors.password}
                                        {...inputProps}
                                    />

                                    <div className="flex justify-between items-center w-full mb-8">
                                        <label className="flex items-center text-sm text-gray-600">
                                            <input
                                                type="checkbox"
                                                name="rememberMe"
                                                checked={loginForm.rememberMe}
                                                onChange={handleLoginChange}
                                                className="mr-2"
                                                disabled={isLoading}
                                            />
                                            Se souvenir de moi
                                        </label>
                                        <button
                                            type="button"
                                            className="text-sm text-orange-600 hover:text-orange-800 underline"
                                            disabled={isLoading}
                                            onClick={() => navigate('/forgot-password')}
                                        >
                                            Mot de passe oublié ?
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        {...authButtonProps}
                                    >
                                        {isLoading ? 'Connexion...' : 'Se connecter'}
                                    </button>

                                    <span className="text-sm text-orange-600">ou créez un nouveau compte</span>
                                </form>
                            </div>

                            {/* Register Form */}
                            <div className={`absolute top-0 right-0 h-full w-1/2 transition-all duration-600 ease-in-out ${isRightPanelActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                                <form onSubmit={handleRegisterSubmit} className="bg-white flex flex-col items-center justify-center h-full px-8 py-8 text-center">
                                    <h1 className="text-3xl font-bold mb-8 text-orange-800">Inscrivez-vous ici</h1>

                                    <InputField
                                        type="text"
                                        name="username"
                                        value={registerForm.username}
                                        placeholder="Nom d'utilisateur"
                                        error={registerErrors.username}
                                        {...inputProps}
                                    />

                                    <InputField
                                        type="email"
                                        name="email"
                                        value={registerForm.email}
                                        placeholder="Adresse email"
                                        error={registerErrors.email}
                                        {...inputProps}
                                    />

                                    <InputField
                                        type="password"
                                        name="password"
                                        value={registerForm.password}
                                        placeholder="Mot de passe"
                                        error={registerErrors.password}
                                        {...inputProps}
                                    />

                                    <InputField
                                        type="tel"
                                        name="phone"
                                        value={registerForm.phone}
                                        placeholder="Téléphone (optionnel)"
                                        error={registerErrors.phone}
                                        required={false}
                                        disabled={isLoading}
                                        onChange={handleRegisterChange}
                                    />

                                    <button
                                        type="submit"
                                        {...authButtonProps}
                                    >
                                        {isLoading ? 'Inscription...' : 'S\'inscrire'}
                                    </button>

                                    <span className="text-sm text-orange-600">ou utilisez votre compte existant</span>
                                </form>
                            </div>

                            {/* Overlay Panel */}
                            <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-600 ease-in-out z-50 ${isRightPanelActive ? 'transform -translate-x-full' : ''}`}>
                                <div className={`relative -left-full h-full w-[200%] transition-transform duration-600 ease-in-out ${isRightPanelActive ? 'transform translate-x-1/2' : 'transform translate-x-0'}`}
                                     style={{
                                         background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.9) 0%, rgba(249, 115, 22, 0.9) 100%)'
                                     }}
                                >
                                    <OverlayPanel
                                        isActive={!isRightPanelActive}
                                        title="Un dernier pas et c'est bon"
                                        description="Si vous avez un compte, connectez-vous ici et amusez-vous"
                                        buttonText="Se connecter"
                                        onClick={() => setIsRightPanelActive(false)}
                                        isLoading={isLoading}
                                        logo={logo}
                                    />

                                    <OverlayPanel
                                        isActive={isRightPanelActive}
                                        title="Commencez votre voyage maintenant"
                                        description="Si vous n'avez pas encore de compte, rejoignez-nous et commencez votre voyage"
                                        buttonText="S'inscrire"
                                        onClick={() => setIsRightPanelActive(true)}
                                        isLoading={isLoading}
                                        logo={logo}
                                        isRight
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Mobile View - Single Panel */}
                    {isMobileView && (
                        <div className="relative h-full w-full">
                            {!isRightPanelActive ? (
                                <form onSubmit={handleLoginSubmit} className="bg-white flex flex-col items-center justify-center h-full px-6 py-8 text-center">
                                    <h1 className="text-2xl font-bold mb-6 text-orange-800">Connectez-vous ici</h1>

                                    <InputField
                                        type="email"
                                        name="email"
                                        value={loginForm.email}
                                        placeholder="Adresse email"
                                        error={loginErrors.email}
                                        {...inputProps}
                                    />

                                    <InputField
                                        type="password"
                                        name="password"
                                        value={loginForm.password}
                                        placeholder="Mot de passe"
                                        error={loginErrors.password}
                                        {...inputProps}
                                    />

                                    <div className="flex justify-between items-center w-full mb-6">
                                        <label className="flex items-center text-sm text-gray-600">
                                            <input
                                                type="checkbox"
                                                name="rememberMe"
                                                checked={loginForm.rememberMe}
                                                onChange={handleLoginChange}
                                                className="mr-2"
                                                disabled={isLoading}
                                            />
                                            Se souvenir de moi
                                        </label>
                                        <button
                                            type="button"
                                            className="text-sm text-orange-600 hover:text-orange-800 underline"
                                            disabled={isLoading}
                                            onClick={() => navigate('/forgot-password')}
                                        >
                                            Mot de passe oublié ?
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        {...authButtonProps}
                                    >
                                        {isLoading ? 'Connexion...' : 'Se connecter'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={togglePanel}
                                        className="text-sm text-orange-600 hover:text-orange-800 transition-colors duration-300 underline"
                                    >
                                        Pas de compte ? S'inscrire
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleRegisterSubmit} className="bg-white flex flex-col items-center justify-center h-full px-6 py-8 text-center">
                                    <h1 className="text-2xl font-bold mb-6 text-orange-800">Inscrivez-vous ici</h1>

                                    <InputField
                                        type="text"
                                        name="username"
                                        value={registerForm.username}
                                        placeholder="Nom d'utilisateur"
                                        error={registerErrors.username}
                                        {...inputProps}
                                    />

                                    <InputField
                                        type="email"
                                        name="email"
                                        value={registerForm.email}
                                        placeholder="Adresse email"
                                        error={registerErrors.email}
                                        {...inputProps}
                                    />

                                    <InputField
                                        type="password"
                                        name="password"
                                        value={registerForm.password}
                                        placeholder="Mot de passe"
                                        error={registerErrors.password}
                                        {...inputProps}
                                    />

                                    <InputField
                                        type="tel"
                                        name="phone"
                                        value={registerForm.phone}
                                        placeholder="Téléphone (optionnel)"
                                        error={registerErrors.phone}
                                        required={false}
                                        disabled={isLoading}
                                        onChange={handleRegisterChange}
                                    />

                                    <button
                                        type="submit"
                                        {...authButtonProps}
                                    >
                                        {isLoading ? 'Inscription...' : 'S\'inscrire'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={togglePanel}
                                        className="text-sm text-orange-600 hover:text-orange-800 transition-colors duration-300 underline"
                                    >
                                        Déjà un compte ? Se connecter
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

// Extracted Overlay Panel Component
const OverlayPanel = ({ isActive, title, description, buttonText, onClick, isLoading, logo, isRight = false }) => (
    <div className={`absolute top-0 ${isRight ? 'right-0' : 'left-0'} flex flex-col items-center justify-center h-full w-1/2 px-10 text-center text-white transition-transform duration-600 ease-in-out ${isActive ? 'transform translate-x-0' : isRight ? 'transform translate-x-1/5' : 'transform -translate-x-1/5'}`}>
        <div className="bg-white z-20 w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <img src={logo} alt="Guard logo" className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold mb-4 leading-tight">
            {title}
        </h1>
        <p className="text-sm mb-6 leading-relaxed">
            {description}
        </p>
        <button
            type="button"
            onClick={onClick}
            disabled={isLoading}
            className="bg-transparent border-2 border-white text-white py-3 px-12 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-300 hover:tracking-widest hover:bg-white hover:text-orange-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 disabled:opacity-50"
        >
            {buttonText}
        </button>
    </div>
);

export default React.memo(AuthPage);