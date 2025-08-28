import { useState } from "react";
import { Siren, AlertTriangle, Shield, Zap, Check, X } from "lucide-react";
import { useAlert } from "@/hooks/features/alert/useAlert.js";
import { useLocalStorageState } from "@/hooks/listener/useLocalStorageState.js";

const PanicButton = ({ userId, onClose }) => {
    const { createAlert, isLoading, error } = useAlert();
    const [alertType, setAlertType] = useState("danger");
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [isAlertActive, setIsAlertActive] = useLocalStorageState('isAlertActive', false);

    const handlePanic = async () => {
        try {
            // Mettre à jour isAlertActive via le hook pour déclencher l'événement
            console.log('[PanicButton] Setting isAlertActive to true');
            setIsAlertActive(true);

            const response = await createAlert({
                userId: userId,
                type: alertType
            });

            if (response.success) {
                console.log('[PanicButton] Alert created successfully');
                setSubmitSuccess(true);
                setTimeout(() => {
                    onClose();
                }, 2000);
            }
        } catch (err) {
            console.error('[PanicButton] Error sending alert:', err);
        }
    };

    const alertOptions = [
        {
            value: "danger",
            label: "Danger Immédiat",
            icon: AlertTriangle,
            color: "red",
            description: "Situation critique nécessitant une intervention immédiate"
        },
        {
            value: "incident",
            label: "Incident de Sécurité",
            icon: Shield,
            color: "orange",
            description: "Événement nécessitant une attention particulière"
        },
        {
            value: "urgence",
            label: "Urgence Médicale",
            icon: Zap,
            color: "purple",
            description: "Assistance médicale requise"
        }
    ];

    const selectedAlert = alertOptions.find(opt => opt.value === alertType);
    const IconComponent = selectedAlert?.icon || Siren;

    const getColorClasses = (color) => {
        const colors = {
            red: {
                bg: "bg-red-500",
                hover: "hover:bg-red-600",
                ring: "focus:ring-red-300",
                border: "border-red-300",
                text: "text-red-600"
            },
            orange: {
                bg: "bg-orange-500",
                hover: "hover:bg-orange-600",
                ring: "focus:ring-orange-300",
                border: "border-orange-300",
                text: "text-orange-600"
            },
            purple: {
                bg: "bg-purple-500",
                hover: "hover:bg-purple-600",
                ring: "focus:ring-purple-300",
                border: "border-purple-300",
                text: "text-purple-600"
            }
        };
        return colors[color] || colors.red;
    };

    const colorClasses = getColorClasses(selectedAlert?.color);

    if (submitSuccess) {
        return (
            <div className="flex flex-col items-center space-y-6 p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold text-gray-900">Alerte envoyée !</h3>
                    <p className="text-gray-600">Votre alerte a été transmise avec succès aux équipes de sécurité.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${colorClasses.bg} bg-opacity-10`}>
                        <Siren className={`w-6 h-6 ${colorClasses.text}`} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Bouton d'Alerte</h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Fermer"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm font-medium flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        {error}
                    </p>
                </div>
            )}

            {/* Alert Type Selection */}
            <div className="space-y-4 mb-6">
                <label className="block text-sm font-semibold text-gray-700">
                    Type d'alerte
                </label>
                <div className="space-y-3">
                    {alertOptions.map((option) => {
                        const OptionIcon = option.icon;
                        const optionColors = getColorClasses(option.color);
                        const isSelected = alertType === option.value;

                        return (
                            <button
                                key={option.value}
                                onClick={() => setAlertType(option.value)}
                                disabled={isLoading}
                                className={`
                                    w-full p-4 rounded-lg border-2 text-left transition-all duration-200
                                    ${isSelected
                                    ? `${optionColors.border} bg-opacity-5 ${optionColors.bg}`
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }
                                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
                                `}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className={`
                                        p-2 rounded-lg 
                                        ${isSelected ? `${optionColors.bg} bg-opacity-20` : 'bg-gray-100'}
                                    `}>
                                        <OptionIcon className={`
                                            w-5 h-5 
                                            ${isSelected ? optionColors.text : 'text-gray-600'}
                                        `} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-semibold ${isSelected ? optionColors.text : 'text-gray-900'}`}>
                                            {option.label}
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {option.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Action Button */}
            <div className="flex flex-col space-y-3">
                <button
                    onClick={handlePanic}
                    disabled={isLoading}
                    className={`
                        w-full px-6 py-4 text-white font-bold text-lg rounded-lg
                        transition-all duration-300 shadow-lg hover:shadow-xl
                        transform hover:scale-105 active:scale-95
                        ${colorClasses.bg} ${colorClasses.hover} ${colorClasses.ring}
                        focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed
                        ${isLoading ? 'cursor-wait' : ''}
                    `}
                >
                    <span className="flex items-center justify-center">
                        <IconComponent className="w-6 h-6 mr-3" />
                        Activer l'alerte {selectedAlert?.label}
                    </span>
                </button>
            </div>

        </div>
    );
};

export default PanicButton;