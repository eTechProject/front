import React, { useState, useEffect } from "react";
import { CreditCard, Shield, CheckCircle, XCircle, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BackButtonHome from "@/components/common/navigation/BackHomeButton.jsx";
import { useAuth } from "@/context/AuthContext.jsx";
import { usePack } from "@/hooks/features/admin/usePack.js";
import { paymentService } from "@/services/features/client/dashboard/clientPaymentService.js";

const PaymentSkeleton = () => {
    return (
        <div className="min-h-screen flex justify-center items-center bg-zinc-900 py-12 px-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
            `,
                        backgroundSize: "50px 50px",
                    }}
                ></div>
            </div>
            <div className="absolute inset-0 opacity-5">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
                        backgroundSize: "25px 25px",
                    }}
                ></div>
            </div>
            <div className="absolute top-10 left-10 w-32 h-32 border border-[#FF8C00] opacity-10 rotate-12"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 border border-zinc-600 opacity-10 -rotate-12"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div>
                            <div className="h-8 w-64 bg-zinc-700 rounded animate-pulse mb-2"></div>
                            <div className="h-5 w-48 bg-zinc-700 rounded animate-pulse"></div>
                        </div>
                        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
                            <div className="h-6 w-32 bg-zinc-700 rounded animate-pulse mb-4"></div>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <div className="h-4 w-40 bg-zinc-700 rounded animate-pulse"></div>
                                    <div className="h-4 w-20 bg-zinc-700 rounded animate-pulse"></div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="h-4 w-40 bg-zinc-700 rounded animate-pulse"></div>
                                    <div className="h-4 w-20 bg-zinc-700 rounded animate-pulse"></div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="h-4 w-40 bg-zinc-700 rounded animate-pulse"></div>
                                    <div className="h-4 w-20 bg-zinc-700 rounded animate-pulse"></div>
                                </div>
                                <div className="border-t border-zinc-600 pt-3">
                                    <div className="flex justify-between">
                                        <div className="h-5 w-32 bg-zinc-700 rounded animate-pulse"></div>
                                        <div className="h-5 w-24 bg-zinc-700 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-5 w-48 bg-zinc-700 rounded animate-pulse"></div>
                                <div className="h-4 w-64 bg-zinc-700 rounded animate-pulse"></div>
                                <div className="h-4 w-64 bg-zinc-700 rounded animate-pulse"></div>
                                <div className="h-4 w-64 bg-zinc-700 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8">
                        <div className="flex items-center justify-center mb-8">
                            <div className="h-6 w-6 bg-zinc-700 rounded animate-pulse mr-3"></div>
                            <div className="h-6 w-32 bg-zinc-700 rounded animate-pulse"></div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <div className="h-4 w-24 bg-zinc-700 rounded animate-pulse mb-2"></div>
                                <div className="h-10 w-full bg-zinc-700 rounded-lg animate-pulse"></div>
                            </div>
                            <div>
                                <div className="h-4 w-24 bg-zinc-700 rounded animate-pulse mb-2"></div>
                                <div className="h-10 w-full bg-zinc-700 rounded-lg animate-pulse"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="h-4 w-24 bg-zinc-700 rounded animate-pulse mb-2"></div>
                                    <div className="h-10 w-full bg-zinc-700 rounded-lg animate-pulse"></div>
                                </div>
                                <div>
                                    <div className="h-4 w-24 bg-zinc-700 rounded animate-pulse mb-2"></div>
                                    <div className="h-10 w-full bg-zinc-700 rounded-lg animate-pulse"></div>
                                </div>
                            </div>
                            <div className="h-12 w-full bg-zinc-700 rounded-full animate-pulse"></div>
                            <div className="text-center space-y-2">
                                <div className="h-4 w-40 bg-zinc-700 rounded animate-pulse mx-auto"></div>
                                <div className="h-4 w-48 bg-zinc-700 rounded animate-pulse mx-auto"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PaymentPage = () => {
    const [currentStep, setCurrentStep] = useState("payment");
    const { user } = useAuth();
    const [paymentData, setPaymentData] = useState({
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        customerEmail: user?.email || "",
        amount: 0,
        currency: "EUR",
        description: "Achat produit - Guard",
        packId: ""
    });
    const [showCvv, setShowCvv] = useState(false);
    const [paymentResponse, setPaymentResponse] = useState(null);
    const [paymentError, setPaymentError] = useState(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { fetchPackById, isLoading, error: fetchError } = usePack();
    const [selectedPack, setSelectedPack] = useState(null);
    const [fetchStatus, setFetchStatus] = useState("loading");

    useEffect(() => {
        const loadPack = async () => {
            setFetchStatus("loading");
            const planId = searchParams.get("plan");
            if (!planId) {
                setFetchStatus("error");
                return;
            }

            try {
                const result = await fetchPackById(planId);
                if (result.success) {
                    setSelectedPack(result.data);
                    const totalPrice = calculateTTC(result.data.prix);
                    setPaymentData(prev => ({
                        ...prev,
                        amount: Math.round(parseFloat(totalPrice) * 100) / 100, // Ensure proper rounding
                        packId: planId
                    }));
                    setFetchStatus("success");
                } else {
                    setFetchStatus("error");
                }
            } catch (err) {
                console.error("Error fetching pack:", err);
                setFetchStatus("error");
            }
        };
        loadPack().then();
    }, [searchParams, fetchPackById]);

    const handlePayment = async () => {
        setIsProcessingPayment(true);
        setCurrentStep("processing");
        setPaymentError(null);
        
        try {
            // Format card number to remove spaces
            const formattedCardNumber = paymentData.cardNumber.replace(/\s/g, '');
            
            // Validate required fields
            if (!formattedCardNumber || !paymentData.expiryMonth || !paymentData.expiryYear || !paymentData.cvv || !paymentData.customerEmail) {
                throw new Error("Tous les champs sont requis");
            }
            
            // Prepare payment data in the required format
            const paymentPayload = {
                amount: paymentData.amount,
                currency: paymentData.currency,
                cardNumber: formattedCardNumber,
                expiryMonth: parseInt(paymentData.expiryMonth),
                expiryYear: parseInt(paymentData.expiryYear),
                cvv: paymentData.cvv,
                customerEmail: paymentData.customerEmail,
                description: paymentData.description,
                packId: paymentData.packId
            };
            
            console.log("Sending payment data:", paymentPayload);
            
            const result = await paymentService.sendPayment(paymentPayload);
            
            if (result.success) {
                setPaymentResponse(result.data);
                setCurrentStep("success");
            } else {
                setPaymentError(result.error);
                setCurrentStep("error");
            }
        } catch (error) {
            console.error("Payment error:", error);
            setPaymentError(error.message || "Une erreur est survenue lors du traitement du paiement");
            setCurrentStep("error");
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const formatExpiryDate = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
        }
        return v;
    };

    const parseExpiryDate = (expiryDate) => {
        const [month, year] = expiryDate.split('/');
        return {
            month: month ? parseInt(month, 10) : '',
            year: year ? parseInt(`20${year}`, 10) : ''
        };
    };

    const calculateTTC = (price) => {
        const parsedPrice = parseFloat(price || 0); // Parse string to number, fallback to 0
        return (parsedPrice * 1.2).toFixed(2);
    };

    if (isLoading || fetchStatus === "loading") {
        return <PaymentSkeleton />;
    }

    if (currentStep === "processing") {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
              `,
                            backgroundSize: "50px 50px",
                        }}
                    ></div>
                </div>
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-12 text-center max-w-md relative z-10">
                    <div className="animate-spin w-12 h-12 border-2 border-[#FF8C00] border-t-transparent rounded-full mx-auto mb-6"></div>
                    <h2 className="text-xl font-bold text-white mb-3">Traitement du paiement</h2>
                    <p className="text-zinc-400 text-sm">Connexion sécurisée avec Stripe...</p>
                </div>
            </div>
        );
    }

    if (currentStep === "success") {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
              `,
                            backgroundSize: "50px 50px",
                        }}
                    ></div>
                </div>
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-12 text-center max-w-lg relative z-10">
                    <CheckCircle className="w-16 h-16 text-[#FF8C00] mx-auto mb-6" />
                    <h2 className="text-xl font-bold text-white mb-3">Paiement confirmé</h2>
                    <p className="text-zinc-400 text-sm mb-6">
                        Votre pack {selectedPack?.name || 'Inconnu'} est maintenant actif.
                    </p>
                    
                    {paymentResponse && (
                        <div className="bg-zinc-700 border border-zinc-600 rounded-lg p-4 mb-6 text-left">
                            <h3 className="text-white font-medium mb-3">Détails du paiement</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">ID Transaction:</span>
                                    <span className="text-white font-mono">{paymentResponse.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Montant:</span>
                                    <span className="text-white">€{paymentResponse.amount} {paymentResponse.currency}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Statut:</span>
                                    <span className="text-green-400 capitalize">{paymentResponse.status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Méthode:</span>
                                    <span className="text-white capitalize">
                                        {paymentResponse.paymentMethod?.brand} **** {paymentResponse.paymentMethod?.last4}
                                    </span>
                                </div>
                                {paymentResponse.receiptUrl && (
                                    <div className="pt-2">
                                        <a 
                                            href={paymentResponse.receiptUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-[#FF8C00] hover:text-[#E67E00] text-sm underline"
                                        >
                                            Télécharger le reçu
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full bg-[#FF8C00] text-white py-3 rounded-full font-medium hover:bg-[#E67E00] transition-colors"
                    >
                        Accéder au dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (currentStep === "error") {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
              `,
                            backgroundSize: "50px 50px",
                        }}
                    ></div>
                </div>
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-12 text-center max-w-md relative z-10">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h2 className="text-xl font-bold text-white mb-3">Échec du paiement</h2>
                    <p className="text-zinc-400 text-sm mb-6">
                        {paymentError || "Une erreur est survenue lors du traitement de votre paiement."}
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                setCurrentStep("payment");
                                setPaymentError(null);
                                setPaymentResponse(null);
                            }}
                            className="w-full bg-[#FF8C00] text-white py-3 rounded-full font-medium hover:bg-[#E67E00] transition-colors"
                        >
                            Réessayer
                        </button>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="w-full bg-transparent border border-zinc-600 text-zinc-300 py-3 rounded-full font-medium hover:bg-zinc-700 transition-colors"
                        >
                            Retour au dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen flex justify-center items-center bg-zinc-900 py-12 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
              `,
                            backgroundSize: "50px 50px",
                        }}
                    ></div>
                </div>
                <div className="absolute inset-0 opacity-5">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
              `,
                            backgroundSize: "25px 25px",
                        }}
                    ></div>
                </div>
                <div className="absolute top-10 left-10 w-32 h-32 border border-[#FF8C00] opacity-10 rotate-12"></div>
                <div className="absolute bottom-20 right-20 w-24 h-24 border border-zinc-600 opacity-10 -rotate-12"></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <BackButtonHome />
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-2">Finaliser votre commande</h1>
                                <p className="text-zinc-400">Pack {selectedPack?.name || 'Inconnu'} sélectionné</p>
                            </div>
                            {fetchStatus === "error" || fetchError ? (
                                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 flex items-center">
                                    <XCircle className="w-6 h-6 text-red-500 mr-3" />
                                    <p className="text-red-300 text-sm">
                                        {fetchError || "Plan non trouvé. Veuillez sélectionner un autre plan."}
                                    </p>
                                </div>
                            ) : null}
                            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
                                <div className="absolute inset-0 opacity-5 rounded-lg overflow-hidden">
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            backgroundImage: `
                        linear-gradient(rgba(255, 140, 0, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 140, 0, 0.1) 1px, transparent 1px)
                      `,
                                            backgroundSize: "20px 20px",
                                        }}
                                    ></div>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-4 relative z-10">
                                    Pack {selectedPack?.name || 'Inconnu'}
                                </h3>
                                <div className="space-y-3 mb-6 relative z-10">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">Nombre d'agents</span>
                                        <span className="text-white font-medium">{selectedPack?.nbAgents || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">Prix mensuel HT</span>
                                        <span className="text-white font-medium">€{selectedPack?.prix || '0'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">TVA (20%)</span>
                                        <span className="text-white font-medium">€{(parseFloat(selectedPack?.prix || 0) * 0.2).toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-zinc-600 pt-3">
                                        <div className="flex justify-between">
                                            <span className="text-white font-medium">Total TTC</span>
                                            <span className="text-[#FF8C00] font-bold text-lg">€{calculateTTC(selectedPack?.prix)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 relative z-10">
                                    <h4 className="text-white font-medium mb-3">Fonctionnalités incluses :</h4>
                                    {(selectedPack?.description || '').split(", ").map((feature, index) => (
                                        <div key={index} className="flex items-center text-sm">
                                            <span className="text-[#FF8C00] mr-2">✓</span>
                                            <span className="text-zinc-300">{feature || 'N/A'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-8 relative">
                            <div className="absolute inset-0 opacity-5 rounded-lg overflow-hidden">
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        backgroundImage: `
                      linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                    `,
                                        backgroundSize: "20px 20px",
                                    }}
                                ></div>
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-center mb-8">
                                    <Shield className="w-6 h-6 text-[#FF8C00] mr-3" />
                                    <h2 className="text-xl font-bold text-white">Paiement sécurisé</h2>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                                            Email du client *
                                        </label>
                                        <input
                                            type="email"
                                            value={paymentData.customerEmail}
                                            onChange={(e) => setPaymentData({ ...paymentData, customerEmail: e.target.value })}
                                            className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition-colors"
                                            placeholder="votre.email@example.com"
                                            disabled={fetchStatus === "error" || fetchError || isProcessingPayment}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                                            Numéro de carte *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={paymentData.cardNumber}
                                                onChange={(e) => {
                                                    const formatted = formatCardNumber(e.target.value);
                                                    setPaymentData({ ...paymentData, cardNumber: formatted });
                                                }}
                                                className="w-full px-4 py-3 pl-12 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition-colors"
                                                placeholder="1234 5678 9012 3456"
                                                maxLength="19"
                                                disabled={fetchStatus === "error" || fetchError || isProcessingPayment}
                                                required
                                            />
                                            <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                                Mois *
                                            </label>
                                            <select
                                                value={paymentData.expiryMonth}
                                                onChange={(e) => setPaymentData({ ...paymentData, expiryMonth: e.target.value })}
                                                className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition-colors"
                                                disabled={fetchStatus === "error" || fetchError || isProcessingPayment}
                                                required
                                            >
                                                <option value="">MM</option>
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                                    <option key={month} value={month.toString().padStart(2, '0')}>
                                                        {month.toString().padStart(2, '0')}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                                Année *
                                            </label>
                                            <select
                                                value={paymentData.expiryYear}
                                                onChange={(e) => setPaymentData({ ...paymentData, expiryYear: e.target.value })}
                                                className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition-colors"
                                                disabled={fetchStatus === "error" || fetchError || isProcessingPayment}
                                                required
                                            >
                                                <option value="">AAAA</option>
                                                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                                    <option key={year} value={year}>
                                                        {year}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                                CVV *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showCvv ? "text" : "password"}
                                                    value={paymentData.cvv}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                        setPaymentData({ ...paymentData, cvv: value });
                                                    }}
                                                    className="w-full px-4 py-3 pr-12 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent transition-colors"
                                                    placeholder="123"
                                                    maxLength="4"
                                                    disabled={fetchStatus === "error" || fetchError || isProcessingPayment}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCvv(!showCvv)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                                >
                                                    {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-zinc-700 border border-zinc-600 rounded-lg p-4">
                                        <h4 className="text-white font-medium mb-2">Récapitulatif du paiement</h4>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-zinc-400">Montant:</span>
                                                <span className="text-white">€{paymentData.amount} {paymentData.currency}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-400">Description:</span>
                                                <span className="text-white">{paymentData.description}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handlePayment}
                                        className="w-full bg-[#FF8C00] text-white py-4 rounded-full font-medium text-lg hover:bg-[#E67E00] transition-colors flex items-center justify-center disabled:bg-zinc-600 disabled:cursor-not-allowed"
                                        disabled={
                                            fetchStatus === "error" || 
                                            fetchError || 
                                            isProcessingPayment ||
                                            !paymentData.cardNumber ||
                                            !paymentData.expiryMonth ||
                                            !paymentData.expiryYear ||
                                            !paymentData.cvv ||
                                            !paymentData.customerEmail
                                        }
                                    >
                                        <Lock className="w-5 h-5 mr-2" />
                                        {isProcessingPayment ? "Traitement..." : `Payer €${paymentData.amount}`}
                                    </button>
                                    <div className="text-center">
                                        <p className="text-xs text-zinc-500">Paiement sécurisé par Stripe</p>
                                        <p className="text-xs text-zinc-500 mt-1">Vos données sont chiffrées SSL 256-bit</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentPage;