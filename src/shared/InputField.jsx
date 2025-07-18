import React from "react";

const InputField = ({
                        type = "text",
                        name,
                        value,
                        placeholder,
                        onChange,
                        error,
                        required = false,
                        disabled = false,
                        className = '',
                        ...props
                    }) => {
    return (
        <div className={`w-full relative mb-6 ${className}`}>
            <div className={`relative flex items-center border rounded-md  px-4 py-3 transition-all duration-200  ${disabled ? 'bg-gray-100' : 'bg-white'}`}>
                {required && (
                    <span className="text-red-500 mr-1">*</span>
                )}

                <input
                    type={type}
                    name={name}
                    id={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full bg-transparent outline-none ${disabled ? 'text-gray-500' : 'text-gray-800'}`}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${name}-error` : undefined}
                    aria-required={required}
                    {...props}
                />

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

export default InputField;