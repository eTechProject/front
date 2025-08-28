import React, { useEffect, useState } from 'react';
import { CreditCard, Clock, AlertCircle, Euro, User, Eye, Search } from 'lucide-react';
import {useAuth} from "@/context/AuthContext.jsx";

// Simulation des hooks (remplacez par vos vrais hooks)
const usePayments = () => ({
    isLoading: false,
    error: null,
    success: true,
    payments: {
        active_payments: [
            {
                id: "Wk1WUEloMVEwOTZ0K2p1WmtsblVTZz09",
                pack_id: "Rkt6MUdEUG5CZ2d6dUZxVXRvUStLQT09",
                status: "actif",
                createdAt: "2025-08-27T08:28:46+00:00",
                startDate: "2025-08-27T08:28:46+00:00",
                endDate: null,
                amount: "250.00",
                pack: {
                    id: "Rkt6MUdEUG5CZ2d6dUZxVXRvUStLQT09",
                    name: "Premium",
                    nb_agents: 5,
                    price: "250.00",
                    description: "Pack Premium - Test Postman"
                },
                subscription_status: "actif",
                subscription_start: "2025-08-27T08:28:46+00:00",
                subscription_end: null
            }
        ],
        expired_payments: [
            {
                id: "NzY2OVVMMHFpY3J3ZXJtVU5pWEFqQT09",
                pack_id: "Rkt6MUdEUG5CZ2d6dUZxVXRvUStLQT09",
                status: "expire",
                createdAt: "2025-08-27T08:13:06+00:00",
                startDate: "2025-08-27T08:13:06+00:00",
                endDate: null,
                amount: "100.00",
                pack: {
                    id: "Rkt6MUdEUG5CZ2d6dUZxVXRvUStLQT09",
                    name: "Premium",
                    nb_agents: 5,
                    price: "100.00",
                    description: "Pack Premium - Test Postman"
                },
                subscription_status: "expire",
                subscription_start: "2025-08-27T08:13:06+00:00",
                subscription_end: null
            }
        ],
        other_payments: [
            {
                id: "bGwwZWhuUkY0dlUwSnVMZzNGd2lsUT09",
                pack_id: "Rkt6MUdEUG5CZ2d6dUZxVXRvUStMQT09",
                status: "non_paye",
                createdAt: "2025-08-27T09:10:16+00:00",
                startDate: "2025-08-27T09:10:16+00:00",
                endDate: null,
                amount: "300.00",
                pack: {
                    id: "Rkt6MUdEUG5CZ2d6dUZxVXRvUStLQT09",
                    name: "Premium",
                    nb_agents: 5,
                    price: "300.00",
                    description: "Pack Premium - Test Postman"
                },
                subscription_status: "non_paye",
                subscription_start: "2025-08-27T09:10:16+00:00",
                subscription_end: null
            },
            {
                id: "TGMzcUt1NUZnTzZhYnR2MGNFWlArQT09",
                pack_id: "Rkt6MUdEUG5CZ2d6dUZxVXRvUStLQT09",
                status: "non_paye",
                createdAt: "2025-08-27T08:41:28+00:00",
                startDate: "2025-08-27T08:41:28+00:00",
                endDate: null,
                amount: "275.00",
                pack: {
                    id: "Rkt6MUdEUG5CZ2d6dUZxVXRvUStLQT09",
                    name: "Standard",
                    nb_agents: 3,
                    price: "275.00",
                    description: "Pack Standard - Production"
                },
                subscription_status: "non_paye",
                subscription_start: "2025-08-27T08:41:28+00:00",
                subscription_end: null
            }
        ],
        history: [
            {
                id: "RnJEZ3dGUDZ1Z2x4QVJRM29hbG5Xdz09",
                payment_id: "bGwwZWhuUkY0dlUwSnVMZzNGd2lsUT09",
                amount: "300.00",
                status: "pending",
                createdAt: "2025-08-27T09:10:16+00:00",
                provider: "cybersource",
                provider_response: "{\"sessionId\":\"cs_test_5127f97e0cdc\"}"
            },
            {
                id: "c0gwbG5YdTNWbWVZK2lxa28wSGJUZz09",
                payment_id: "TGMzcUt1NUZnTzZhYnR2MGNFWlArQT09",
                amount: "300.00",
                status: "pending",
                createdAt: "2025-08-27T08:41:28+00:00",
                provider: "cybersource",
                provider_response: "{\"sessionId\":\"cs_test_e1ff696049a5\"}"
            },
            {
                id: "OTg0Q0lJMGZ6b2pDYlc0RFN1SW1uZz09",
                payment_id: "Wk1WUEloMVEwOTZ0K2p1WmtsblVTZz09",
                amount: "250.00",
                status: "completed",
                createdAt: "2025-08-27T08:28:46+00:00",
                provider: "cybersource",
                provider_response: "{\"sessionId\":\"cs_test_aad34d458a76\"}"
            }
        ]
    },
    getPayments: () => Promise.resolve(),
    hasMorePayments: false,
    loadMorePayments: () => Promise.resolve()
});

const StatusBadge = ({ status }) => {
    const statusConfig = {
        actif: { label: 'Actif', color: 'text-green-700 bg-green-50' },
        expire: { label: 'Expiré', color: 'text-gray-600 bg-gray-50' },
        non_paye: { label: 'Non payé', color: 'text-orange-700 bg-orange-50' },
        pending: { label: 'En attente', color: 'text-yellow-700 bg-yellow-50' },
        completed: { label: 'Terminé', color: 'text-blue-700 bg-blue-50' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
    );
};

const TabButton = ({ active, onClick, children, count }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
            active
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500 hover:text-gray-700'
        }`}
    >
        {children} ({count})
    </button>
);

const PaymentRow = ({ payment, type = 'payment', onView }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    };

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4">
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mr-3">
                        <CreditCard className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {payment.pack?.name || 'Pack'}
                        </div>
                        <div className="text-sm text-gray-500">
                            {payment.id.slice(-8)}
                        </div>
                    </div>
                </div>
            </td>

            <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                    {payment.pack?.description || 'N/A'}
                </div>
                {type === 'payment' && payment.pack?.nb_agents && (
                    <div className="text-sm text-gray-500">
                        {payment.pack.nb_agents} agents
                    </div>
                )}
                {type === 'history' && (
                    <div className="text-sm text-gray-500">
                        {payment.provider}
                    </div>
                )}
            </td>

            <td className="px-6 py-4">
                <StatusBadge status={payment.status} />
            </td>

            <td className="px-6 py-4 text-sm text-gray-900">
                {formatDate(payment.startDate || payment.createdAt)}
            </td>

            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {payment.amount ? `${payment.amount} €` : 'N/A'}
            </td>

            <td className="px-6 py-4 text-right">
                <button
                    onClick={() => onView(payment)}
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                    Voir
                </button>
            </td>
        </tr>
    );
};

const DetailModal = ({ payment, isOpen, onClose, type = 'payment' }) => {
    if (!isOpen || !payment) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Détails du paiement</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-xl"
                        >
                            ×
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">ID</label>
                                <p className="text-sm font-mono bg-gray-50 p-2 rounded mt-1">
                                    {payment.id}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Pack</label>
                                <p className="text-sm text-gray-900 mt-1">
                                    {payment.pack?.description || payment.pack?.name || 'N/A'}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Statut</label>
                                <div className="mt-2">
                                    <StatusBadge status={payment.status} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Montant</label>
                                <p className="text-lg font-semibold text-gray-900 mt-1">
                                    {payment.amount ? `${payment.amount} €` : 'N/A'}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">Date de création</label>
                                <p className="text-sm text-gray-900 mt-1">
                                    {new Date(payment.createdAt).toLocaleString('fr-FR')}
                                </p>
                            </div>

                            {type === 'payment' && payment.pack?.nb_agents && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Nombre d'agents</label>
                                    <p className="text-sm text-gray-900 mt-1">{payment.pack.nb_agents}</p>
                                </div>
                            )}

                            {type === 'history' && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Fournisseur</label>
                                    <p className="text-sm text-gray-900 mt-1">{payment.provider}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function PaymentContent() {
    const { user } = useAuth();
    const {
        isLoading,
        error,
        success,
        payments,
        getPayments,
        hasMorePayments,
        loadMorePayments
    } = usePayments(user.id);

    const [activeTab, setActiveTab] = useState('active');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user.id) {
            getPayments({ page: 1, limit: 20 });
        }
    }, [user.id]);

    const handleViewPayment = (payment) => {
        setSelectedPayment(payment);
        setIsModalOpen(true);
    };

    const tabs = [
        { id: 'active', label: 'Actifs', count: payments.active_payments.length, data: payments.active_payments },
        { id: 'pending', label: 'En attente', count: payments.other_payments.length, data: payments.other_payments },
        { id: 'expired', label: 'Expirés', count: payments.expired_payments.length, data: payments.expired_payments },
        { id: 'history', label: 'Historique', count: payments.history.length, data: payments.history }
    ];

    const activeTabData = tabs.find(tab => tab.id === activeTab);
    const filteredData = activeTabData?.data.filter(item =>
        item.pack?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pack?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-6 bg-white rounded border">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                    <p className="text-red-700">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Gestion des Paiements</h1>
                            <p className="mt-1 text-gray-600">Gérez vos abonnements et transactions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Tabs and Search */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex space-x-8 border-b">
                        {tabs.map(tab => (
                            <TabButton
                                key={tab.id}
                                active={activeTab === tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                count={tab.count}
                            >
                                {tab.label}
                            </TabButton>
                        ))}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded focus:outline-none focus:border-orange-500"
                        />
                    </div>
                </div>

                {/* Table */}
                {filteredData.length > 0 ? (
                    <div className="bg-white rounded border overflow-hidden">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Paiement
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Montant
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {filteredData.map(payment => (
                                <PaymentRow
                                    key={payment.id}
                                    payment={payment}
                                    type={activeTab === 'history' ? 'history' : 'payment'}
                                    onView={handleViewPayment}
                                />
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded border">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? 'Aucun résultat' : `Aucun ${activeTabData?.label.toLowerCase()}`}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm
                                ? 'Modifiez votre recherche'
                                : `Pas de ${activeTabData?.label.toLowerCase()} pour le moment`
                            }
                        </p>
                    </div>
                )}

                {/* Load More Button */}
                {hasMorePayments && (
                    <div className="text-center mt-6">
                        <button
                            onClick={loadMorePayments}
                            disabled={isLoading}
                            className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-400"
                        >
                            {isLoading ? 'Chargement...' : 'Charger plus'}
                        </button>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <DetailModal
                payment={selectedPayment}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                type={activeTab === 'history' ? 'history' : 'payment'}
            />
        </div>
    );
}