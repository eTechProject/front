import {useState} from "react";

const PasswordInputField = ({ value, error, disabled, onChange, placeholder, name, required = true }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={`w-full relative mb-6`}>
            <div className={`relative flex items-center rounded-md border px-4 py-3 transition-all duration-200  ${disabled ? 'bg-gray-100' : 'bg-white'}`}>
                {required && (
                    <span className="text-red-500 mr-1">*</span>
                )}

                <input
                    type={showPassword ? 'text' : 'password'}
                    name={name}
                    id={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full bg-transparent outline-none pr-8 ${disabled ? 'text-gray-500' : 'text-gray-800'}`}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${name}-error` : undefined}
                    aria-required={required}
                />

                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={disabled}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 disabled:opacity-50 flex-shrink-0"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                    {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    )}
                </button>

                <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${value ? 'w-full' : 'w-0'}`}
                    style={{ transformOrigin: 'left center' }}
                ></span>
            </div>

            {error && (
                <small
                    id={`${name}-error`}
                    className="text-red-500 text-left ml-6 text-xs mt-1 block"
                    role="alert"
                >
                    {error}
                </small>
            )}

            <label
                htmlFor={name}
                className="sr-only"
                aria-hidden="true"
            >
                {placeholder}
            </label>
        </div>
    );
};
export default PasswordInputField;