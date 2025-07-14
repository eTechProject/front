import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/logo128-U.png";
import BackButton from "../shared/BackButton.jsx";
import InputField from "../shared/InputField.jsx";
import { useAuth } from '../hooks/useAuth';

const AuthPage = () => {
    const navigate = useNavigate();
    const { login, register, isLoading, error, clearError } = useAuth();
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

    // États pour le formulaire d'inscription
    const [registerForm, setRegisterForm] = useState({
        username: '',
        email: '',
        password: '',
        phone: ''
    });

    const [registerErrors, setRegisterErrors] = useState({
        username: '',
        email: '',
        password: '',
        phone: ''
    });

    // États pour le formulaire de connexion
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const [loginErrors, setLoginErrors] = useState({
        email: '',
        password: ''
    });

    // Gestion du redimensionnement de la fenêtre
    React.useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);
    const phoneRegex = useMemo(() => /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, []);

    // Fonctions de validation
    const validateEmail = useCallback((email) => emailRegex.test(email), [emailRegex]);
    const validatePhone = useCallback((phone) => phone ? phoneRegex.test(phone) : true, [phoneRegex]);

    const validateUsername = useCallback((username) => {
        if (username.length < 4) return '*Le nom d\'utilisateur doit contenir au moins 4 caractères.';
        if (username.length > 20) return '*Le nom d\'utilisateur doit contenir moins de 20 caractères.';
        return '';
    }, []);

    const validatePassword = useCallback((password) => {
        if (password.length < 8) return '*Le mot de passe doit contenir au moins 8 caractères.';
        if (password.length > 20) return '*Le mot de passe doit contenir moins de 20 caractères.';
        return '';
    }, []);

    const handleRegisterChange = useCallback((e) => {
        const { name, value } = e.target;
        setRegisterForm(prev => ({ ...prev, [name]: value }));
        clearError();

        let error = '';
        switch (name) {
            case 'username':
                error = validateUsername(value);
                break;
            case 'email':
                error = validateEmail(value) ? '' : '*L\'email n\'est pas valide';
                break;
            case 'password':
                error = validatePassword(value);
                break;
            case 'phone':
                error = validatePhone(value) ? '' : '*Numéro de téléphone invalide';
                break;
            default:
                break;
        }

        setRegisterErrors(prev => ({ ...prev, [name]: error }));
    }, [validateUsername, validateEmail, validatePassword, validatePhone, clearError]);

    const handleLoginChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;
        setLoginForm(prev => ({ ...prev, [name]: fieldValue }));
        clearError();

        if (type !== 'checkbox') {
            let error = '';
            switch (name) {
                case 'email':
                    error = validateEmail(value) ? '' : '*L\'email n\'est pas valide';
                    break;
                case 'password':
                    error = validatePassword(value);
                    break;
                default:
                    break;
            }
            setLoginErrors(prev => ({ ...prev, [name]: error }));
        }
    }, [validateEmail, validatePassword, clearError]);

    const handleRegisterSubmit = useCallback(async () => {
        const newErrors = {};
        if (!registerForm.username.trim()) newErrors.username = '*Le nom d\'utilisateur est requis';
        if (!registerForm.email.trim()) newErrors.email = '*L\'email est requis';
        if (!registerForm.password.trim()) newErrors.password = '*Le mot de passe est requis';

        setRegisterErrors(prev => ({ ...prev, ...newErrors }));

        const hasValidationErrors = Object.values(registerErrors).some(error => error !== '');
        const hasRequiredFieldErrors = Object.keys(newErrors).length > 0;

        if (!hasValidationErrors && !hasRequiredFieldErrors) {
            const userData = {
                name: registerForm.username,
                email: registerForm.email,
                password: registerForm.password,
                phone: registerForm.phone || null
            };

            const result = await register(userData);

            if (result.success) {
                alert(`Inscription réussie pour ${userData.name}!`);
                navigate('/dashboard');
            } else {
                if (result.details) {
                    setRegisterErrors(prev => ({ ...prev, ...result.details }));
                }
            }
        }
    }, [registerForm, registerErrors, register, navigate]);

    const handleLoginSubmit = useCallback(async () => {
        const newErrors = {};
        if (!loginForm.email.trim()) newErrors.email = '*Veuillez saisir votre email';
        if (!loginForm.password.trim()) newErrors.password = '*Veuillez saisir votre mot de passe';

        setLoginErrors(prev => ({ ...prev, ...newErrors }));

        const hasValidationErrors = Object.values(loginErrors).some(error => error !== '');
        const hasRequiredFieldErrors = Object.keys(newErrors).length > 0;

        if (!hasValidationErrors && !hasRequiredFieldErrors) {
            const credentials = {
                email: loginForm.email,
                password: loginForm.password,
                rememberMe: loginForm.rememberMe
            };

            const result = await login(credentials);

            if (result.success) {
                alert(`Connexion réussie avec ${loginForm.email}!`);
                navigate('/dashboard');
            } else {
                if (result.details) {
                    setLoginErrors(prev => ({ ...prev, ...result.details }));
                }
            }
        }
    }, [loginForm, loginErrors, login, navigate]);

    // Fonction pour basculer entre les panneaux sur mobile
    const togglePanel = useCallback(() => {
        setIsRightPanelActive(!isRightPanelActive);
    }, [isRightPanelActive]);

    return (
        <>
            <BackButton/>
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <div className={`relative overflow-hidden w-full max-w-5xl min-h-[650px] bg-white rounded-3xl shadow-2xl transition-all duration-600 ${isRightPanelActive ? 'right-panel-active' : ''}`}>

                    {/* Message d'erreur global */}
                    {error && (
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg z-50 max-w-[90%]">
                            {error}
                        </div>
                    )}

                    {/* Version desktop - deux panneaux */}
                    {!isMobileView && (
                        <>
                            {/* Formulaire de connexion */}
                            <div className={`absolute top-0 h-full w-1/2 transition-all duration-600 ease-in-out ${isRightPanelActive ? 'transform translate-x-full opacity-0 z-0' : 'opacity-100 z-10'}`}>
                                <div className="bg-white flex flex-col items-center justify-center h-full px-8 py-8 text-center">
                                    <h1 className="text-3xl font-bold mb-8 text-orange-800">Connectez-vous ici</h1>

                                    <InputField
                                        type="email"
                                        name="email"
                                        value={loginForm.email}
                                        placeholder="Adresse email"
                                        onChange={handleLoginChange}
                                        error={loginErrors.email}
                                        borderColor="border-gray-300"
                                        required={true}
                                        disabled={isLoading}
                                    />

                                    <div className="w-full relative mb-6">
                                        <InputField
                                            type="password"
                                            name="password"
                                            value={loginForm.password}
                                            placeholder="Mot de passe"
                                            onChange={handleLoginChange}
                                            error={loginErrors.password}
                                            borderColor="border-gray-300"
                                            required={true}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="flex justify-between items-center w-full mb-8">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="rememberMe"
                                                id="rememberMe"
                                                checked={loginForm.rememberMe}
                                                onChange={handleLoginChange}
                                                className="w-3 h-3 mr-2 accent-orange-500"
                                                disabled={isLoading}
                                            />
                                            <label htmlFor="rememberMe" className="text-sm text-orange-700">
                                                Se souvenir de moi
                                            </label>
                                        </div>
                                        <button
                                            type="button"
                                            className="text-sm text-orange-600 hover:text-orange-800 transition-colors duration-300 underline"
                                            disabled={isLoading}
                                        >
                                            Mot de passe oublié ?
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleLoginSubmit}
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-20 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-300 hover:tracking-widest hover:from-orange-600 hover:to-orange-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 mb-6 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Connexion...' : 'Se connecter'}
                                    </button>

                                    <span className="text-sm text-orange-600">ou créez un nouveau compte</span>
                                </div>
                            </div>

                            {/* Formulaire d'inscription */}
                            <div className={`absolute top-0 right-0 h-full w-1/2 transition-all duration-600 ease-in-out ${isRightPanelActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                                <div className="bg-white flex flex-col items-center justify-center h-full px-8 py-8 text-center">
                                    <h1 className="text-3xl font-bold mb-8 text-orange-800">Inscrivez-vous ici</h1>

                                    <InputField
                                        type="text"
                                        name="username"
                                        value={registerForm.username}
                                        placeholder="Nom d'utilisateur"
                                        onChange={handleRegisterChange}
                                        error={registerErrors.username}
                                        required={true}
                                        disabled={isLoading}
                                    />

                                    <InputField
                                        type="email"
                                        name="email"
                                        value={registerForm.email}
                                        placeholder="Adresse email"
                                        onChange={handleRegisterChange}
                                        error={registerErrors.email}
                                        required={true}
                                        disabled={isLoading}
                                    />

                                    <InputField
                                        type="password"
                                        name="password"
                                        value={registerForm.password}
                                        placeholder="Mot de passe"
                                        onChange={handleRegisterChange}
                                        error={registerErrors.password}
                                        required={true}
                                        disabled={isLoading}
                                    />

                                    <InputField
                                        type="tel"
                                        name="phone"
                                        value={registerForm.phone}
                                        placeholder="Téléphone"
                                        onChange={handleRegisterChange}
                                        error={registerErrors.phone}
                                        disabled={isLoading}
                                    />

                                    <button
                                        type="button"
                                        onClick={handleRegisterSubmit}
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-20 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-300 hover:tracking-widest hover:from-orange-600 hover:to-orange-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 mb-6 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Inscription...' : 'S\'inscrire'}
                                    </button>

                                    <span className="text-sm text-orange-600">ou utilisez votre compte existant</span>
                                </div>
                            </div>

                            {/* Overlay avec animations */}
                            <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-600 ease-in-out z-50 ${isRightPanelActive ? 'transform -translate-x-full' : ''}`}>
                                <div
                                    className={`relative -left-full h-full w-[200%] transition-transform duration-600 ease-in-out ${isRightPanelActive ? 'transform translate-x-1/2' : 'transform translate-x-0'}`}
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.9) 0%, rgba(249, 115, 22, 0.9) 100%)',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                >
                                    <div className={`absolute top-0 flex flex-col items-center justify-center h-full w-1/2 px-10 text-center text-white transition-transform duration-600 ease-in-out ${isRightPanelActive ? 'transform translate-x-0' : 'transform -translate-x-1/5'}`}>
                                        <div className="bg-white z-20 w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg">
                                            <img src={logo} alt="Guard logo" className="w-10 h-10"/>
                                        </div>
                                        <h1 className="text-4xl font-bold mb-4 leading-tight">
                                            Un dernier pas <br />
                                            et c'est bon
                                        </h1>
                                        <p className="text-sm mb-6 leading-relaxed">
                                            Si vous avez un compte, connectez-vous ici et amusez-vous
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setIsRightPanelActive(false)}
                                            disabled={isLoading}
                                            className="bg-transparent border-2 border-white text-white py-3 px-12 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-300 hover:tracking-widest hover:bg-white hover:text-orange-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 disabled:opacity-50"
                                        >
                                            Se connecter
                                        </button>
                                    </div>

                                    <div className={`absolute top-0 right-0 flex flex-col items-center justify-center h-full w-1/2 px-10 text-center text-white transition-transform duration-600 ease-in-out ${isRightPanelActive ? 'transform translate-x-1/5' : 'transform translate-x-0'}`}>
                                        <div className="bg-white z-20 w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg">
                                            <img src={logo} alt="Guard logo" className="w-10 h-10"/>
                                        </div>
                                        <h1 className="text-4xl font-bold mb-4 leading-tight">
                                            Commencez votre <br />
                                            voyage maintenant
                                        </h1>
                                        <p className="text-sm mb-6 leading-relaxed">
                                            Si vous n'avez pas encore de compte, rejoignez-nous et commencez votre voyage
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setIsRightPanelActive(true)}
                                            disabled={isLoading}
                                            className="bg-transparent border-2 border-white text-white py-3 px-12 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-300 hover:tracking-widest hover:bg-white hover:text-orange-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 disabled:opacity-50"
                                        >
                                            S'inscrire
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Version mobile - un seul panneau à la fois */}
                    {isMobileView && (
                        <div className="relative h-full w-full">
                            {!isRightPanelActive ? (
                                <div className="bg-white flex flex-col items-center justify-center h-full px-6 py-8 text-center">
                                    <h1 className="text-2xl font-bold mb-6 text-orange-800">Connectez-vous ici</h1>

                                    <InputField
                                        type="email"
                                        name="email"
                                        value={loginForm.email}
                                        placeholder="Adresse email"
                                        onChange={handleLoginChange}
                                        error={loginErrors.email}
                                        borderColor="border-gray-300"
                                        required={true}
                                        disabled={isLoading}
                                    />

                                    <div className="w-full relative mb-4">
                                        <InputField
                                            type="password"
                                            name="password"
                                            value={loginForm.password}
                                            placeholder="Mot de passe"
                                            onChange={handleLoginChange}
                                            error={loginErrors.password}
                                            borderColor="border-gray-300"
                                            required={true}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="flex justify-between items-center w-full mb-6">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="rememberMe"
                                                id="rememberMe"
                                                checked={loginForm.rememberMe}
                                                onChange={handleLoginChange}
                                                className="w-3 h-3 mr-2 accent-orange-500"
                                                disabled={isLoading}
                                            />
                                            <label htmlFor="rememberMe" className="text-sm text-orange-700">
                                                Se souvenir
                                            </label>
                                        </div>
                                        <button
                                            type="button"
                                            className="text-sm text-orange-600 hover:text-orange-800 transition-colors duration-300 underline"
                                            disabled={isLoading}
                                        >
                                            Mot de passe oublié ?
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleLoginSubmit}
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-12 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-300 hover:from-orange-600 hover:to-orange-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 mb-6 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-xs"
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
                                </div>
                            ) : (
                                <div className="bg-white flex flex-col items-center justify-center h-full px-6 py-8 text-center">
                                    <h1 className="text-2xl font-bold mb-6 text-orange-800">Inscrivez-vous ici</h1>

                                    <InputField
                                        type="text"
                                        name="username"
                                        value={registerForm.username}
                                        placeholder="Nom d'utilisateur"
                                        onChange={handleRegisterChange}
                                        error={registerErrors.username}
                                        required={true}
                                        disabled={isLoading}
                                    />

                                    <InputField
                                        type="email"
                                        name="email"
                                        value={registerForm.email}
                                        placeholder="Adresse email"
                                        onChange={handleRegisterChange}
                                        error={registerErrors.email}
                                        required={true}
                                        disabled={isLoading}
                                    />

                                    <InputField
                                        type="password"
                                        name="password"
                                        value={registerForm.password}
                                        placeholder="Mot de passe"
                                        onChange={handleRegisterChange}
                                        error={registerErrors.password}
                                        required={true}
                                        disabled={isLoading}
                                    />

                                    <InputField
                                        type="tel"
                                        name="phone"
                                        value={registerForm.phone}
                                        placeholder="Téléphone"
                                        onChange={handleRegisterChange}
                                        error={registerErrors.phone}
                                        disabled={isLoading}
                                    />

                                    <button
                                        type="button"
                                        onClick={handleRegisterSubmit}
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-12 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-300 hover:from-orange-600 hover:to-orange-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 mb-6 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-xs"
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
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AuthPage;