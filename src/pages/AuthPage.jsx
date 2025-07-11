import React, { useState, useCallback, useMemo } from 'react';
import logo from "../assets/logo128-U.png";
import BackButton from "../shared/BackButton.jsx";

const AuthPage = () => {
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);

    // États pour le formulaire d'inscription
    const [registerForm, setRegisterForm] = useState({
        username: '',
        email: '',
        password: ''
    });

    const [registerErrors, setRegisterErrors] = useState({
        username: '',
        email: '',
        password: ''
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

    // Regex pour validation email (mémorisée)
    const emailRegex = useMemo(() =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []
    );

    // Fonction pour valider l'email
    const validateEmail = useCallback((email) => {
        return emailRegex.test(email);
    }, [emailRegex]);

    // Fonction pour valider le nom d'utilisateur
    const validateUsername = useCallback((username) => {
        if (username.length < 4) {
            return '*Le nom d\'utilisateur doit contenir au moins 4 caractères.';
        }
        if (username.length > 20) {
            return '*Le nom d\'utilisateur doit contenir moins de 20 caractères.';
        }
        return '';
    }, []);

    // Fonction pour valider le mot de passe
    const validatePassword = useCallback((password) => {
        if (password.length < 8) {
            return '*Le mot de passe doit contenir au moins 8 caractères.';
        }
        if (password.length > 20) {
            return '*Le mot de passe doit contenir moins de 20 caractères.';
        }
        return '';
    }, []);

    // Gestion des changements dans le formulaire d'inscription
    const handleRegisterChange = useCallback((e) => {
        const { name, value } = e.target;
        setRegisterForm(prev => ({ ...prev, [name]: value }));

        // Validation en temps réel
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
            default:
                break;
        }

        setRegisterErrors(prev => ({ ...prev, [name]: error }));
    }, [validateUsername, validateEmail, validatePassword]);

    // Gestion des changements dans le formulaire de connexion
    const handleLoginChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;
        setLoginForm(prev => ({ ...prev, [name]: fieldValue }));

        // Validation en temps réel pour les champs non-checkbox
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
    }, [validateEmail, validatePassword]);

    // Soumission du formulaire d'inscription
    const handleRegisterSubmit = useCallback(() => {
        // Vérification des champs requis
        const newErrors = {};
        if (!registerForm.username.trim()) {
            newErrors.username = '*Le nom d\'utilisateur est requis';
        }
        if (!registerForm.email.trim()) {
            newErrors.email = '*L\'email est requis';
        }
        if (!registerForm.password.trim()) {
            newErrors.password = '*Le mot de passe est requis';
        }

        setRegisterErrors(prev => ({ ...prev, ...newErrors }));

        // Vérification des erreurs de validation existantes
        const hasValidationErrors = Object.values(registerErrors).some(error => error !== '');
        const hasRequiredFieldErrors = Object.keys(newErrors).length > 0;

        // Si pas d'erreurs, traiter l'inscription
        if (!hasValidationErrors && !hasRequiredFieldErrors) {
            console.log('Inscription:', registerForm);
            // Ici vous pouvez ajouter la logique d'inscription
            alert('Inscription réussie !');
        }
    }, [registerForm, registerErrors]);

    // Soumission du formulaire de connexion
    const handleLoginSubmit = useCallback(() => {
        // Vérification des champs requis
        const newErrors = {};
        if (!loginForm.email.trim()) {
            newErrors.email = '*Veuillez saisir votre email dans ce champ';
        }
        if (!loginForm.password.trim()) {
            newErrors.password = '*Veuillez saisir votre mot de passe dans ce champ';
        }

        setLoginErrors(prev => ({ ...prev, ...newErrors }));

        // Vérification des erreurs de validation existantes
        const hasValidationErrors = Object.values(loginErrors).some(error => error !== '');
        const hasRequiredFieldErrors = Object.keys(newErrors).length > 0;

        // Si pas d'erreurs, traiter la connexion
        if (!hasValidationErrors && !hasRequiredFieldErrors) {
            console.log('Connexion:', loginForm);
            // Ici vous pouvez ajouter la logique de connexion
            alert('Connexion réussie !');
        }
    }, [loginForm, loginErrors]);

    // Composant InputField pour éviter la duplication
    const InputField = ({
                            type,
                            name,
                            value,
                            placeholder,
                            onChange,
                            error,
                            borderColor = 'border-orange-200',
                            focusColor = 'focus:border-orange-500'
                        }) => (
        <div className="w-full relative mb-4">
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-transparent border-none border-b-2 ${borderColor} py-3 px-0 outline-none ${focusColor} transition-colors duration-300`}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? `${name}-error` : undefined}
            />
            <span className={`absolute bottom-0 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${value ? 'w-full' : 'w-0'}`}></span>
            {error && (
                <small
                    id={`${name}-error`}
                    className="text-red-500 text-xs absolute -bottom-5 left-0"
                    role="alert"
                >
                    {error}
                </small>
            )}
        </div>
    );

    return (
        <>
            <BackButton/>
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <div className={`relative overflow-hidden w-full max-w-4xl min-h-[500px] bg-white rounded-3xl shadow-2xl transition-all duration-600 ${isRightPanelActive ? 'right-panel-active' : ''}`}>

                    {/* Formulaire de connexion - Panel gauche par défaut */}
                    <div className={`absolute top-0 h-full w-1/2 transition-all duration-600 ease-in-out ${isRightPanelActive ? 'transform translate-x-full opacity-0 z-0' : 'opacity-100 z-10'}`}>
                        <div className="bg-white flex flex-col items-center justify-center h-full px-12 text-center">
                            <h1 className="text-3xl font-bold mb-6 text-orange-800">Connectez-vous ici</h1>

                            <InputField
                                type="email"
                                name="email"
                                value={loginForm.email}
                                placeholder="Adresse email"
                                onChange={handleLoginChange}
                                error={loginErrors.email}
                                borderColor="border-gray-300"
                                focusColor="focus:border-blue-500"
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
                                    focusColor="focus:border-blue-500"
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
                                    />
                                    <label htmlFor="rememberMe" className="text-sm text-orange-700">
                                        Se souvenir de moi
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    className="text-sm text-orange-600 hover:text-orange-800 transition-colors duration-300 underline"
                                    onClick={() => console.log('Mot de passe oublié cliqué')}
                                >
                                    Mot de passe oublié ?
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={handleLoginSubmit}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-20 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-300 hover:tracking-widest hover:from-orange-600 hover:to-orange-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 mb-4 shadow-lg"
                            >
                                Se connecter
                            </button>

                            <span className="text-sm text-orange-600 mt-4">ou créez un nouveau compte</span>
                        </div>
                    </div>

                    {/* Formulaire d'inscription - Panel droit */}
                    <div className={`absolute top-0 right-0 h-full w-1/2 transition-all duration-600 ease-in-out ${isRightPanelActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                        <div className="bg-white flex flex-col items-center justify-center h-full px-12 text-center">
                            <h1 className="text-3xl font-bold mb-6 text-orange-800">Inscrivez-vous ici</h1>

                            <InputField
                                type="text"
                                name="username"
                                value={registerForm.username}
                                placeholder="Nom d'utilisateur"
                                onChange={handleRegisterChange}
                                error={registerErrors.username}
                            />

                            <InputField
                                type="email"
                                name="email"
                                value={registerForm.email}
                                placeholder="Adresse email"
                                onChange={handleRegisterChange}
                                error={registerErrors.email}
                            />

                            <div className="w-full relative mb-8">
                                <InputField
                                    type="password"
                                    name="password"
                                    value={registerForm.password}
                                    placeholder="Mot de passe"
                                    onChange={handleRegisterChange}
                                    error={registerErrors.password}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleRegisterSubmit}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-20 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-300 hover:tracking-widest hover:from-orange-600 hover:to-orange-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 mb-4 shadow-lg"
                            >
                                S'inscrire
                            </button>

                            <span className="text-sm text-orange-600 mt-4">ou utilisez votre compte existant</span>
                        </div>
                    </div>

                    {/* Overlay avec animations */}
                    <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-600 ease-in-out z-50 ${isRightPanelActive ? 'transform -translate-x-full' : ''}`}>
                        <div
                            className={`relative -left-full h-full w-[200%] transition-transform duration-600 ease-in-out ${isRightPanelActive ? 'transform translate-x-1/2' : 'transform translate-x-0'}`}
                            style={{
                                background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.9) 0%, rgba(249, 115, 22, 0.9) 100%), url("https://images.unsplash.com/photo-1621360841013-c7683c659ec6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80")',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            {/* Panel gauche - Invite à se connecter */}
                            <div className={`absolute top-0 flex flex-col items-center justify-center h-full w-1/2 px-10 text-center text-white transition-transform duration-600 ease-in-out ${isRightPanelActive ? 'transform translate-x-0' : 'transform -translate-x-1/5'}`}>
                                <div className="bg-white z-20 relative -left-1/2 -top-20 w-12 pl-3 pr-3 pt-2 pb-2 rounded-full">
                                    <img src={logo} alt="Guard logo"/>
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
                                    className="bg-transparent border-2 border-white text-white py-3 px-12 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-300 hover:tracking-widest hover:bg-white hover:text-orange-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                                >
                                    Se connecter
                                </button>
                            </div>

                            {/* Panel droit - Invite à s'inscrire */}
                            <div className={`absolute top-0 right-0 flex flex-col items-center justify-center h-full w-1/2 px-10 text-center text-white transition-transform duration-600 ease-in-out ${isRightPanelActive ? 'transform translate-x-1/5' : 'transform translate-x-0'}`}>
                                <div className="bg-white z-20 relative -right-1/2 -top-16 w-12 pl-3 pr-3 pt-2 pb-2 rounded-full">
                                    <img src={logo} alt="Guard logo"/>
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
                                    className="bg-transparent border-2 border-white text-white py-3 px-12 rounded-full font-bold text-sm uppercase tracking-wide transition-all duration-300 hover:tracking-widest hover:bg-white hover:text-orange-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                                >
                                    S'inscrire
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthPage;