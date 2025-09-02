import React, { useState, useEffect, useMemo } from "react";
import { Search, Eye, Edit, Loader2, X, Filter, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { useSubscription } from "@/hooks/features/admin/useSubscription.js";

function Modal({ open, onClose, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative">
                <button
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10"
                    onClick={onClose}
                >
                    <X size={20} />
                </button>
                {children}
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const statusColors = {
        actif: "bg-green-100 text-green-800",
        non_paye: "bg-red-100 text-red-800",
        default: "bg-gray-100 text-gray-800"
    };

    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-md ${statusColors[status] || statusColors.default}`}>
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : "N/A"}
        </span>
    );
}

export default function SubscriptionContent() {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [modals, setModals] = useState({ details: false, status: false });
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [statusForm, setStatusForm] = useState("actif");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Filtres et tri
    const [filters, setFilters] = useState({ status: "" });
    const [sort, setSort] = useState({ key: "startDate", order: "desc" });

    const { subscriptions, pagination, isLoading, error, fetchSubscriptions, fetchSubscriptionById, updateSubscriptionStatus } = useSubscription();
    const limit = 20;
    const isSearchMode = debouncedSearchTerm.length >= 3;

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.length >= 3 || searchTerm.length === 0) {
                setDebouncedSearchTerm(searchTerm);
                setCurrentPage(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        if (debouncedSearchTerm.length >= 3) {
            fetchSubscriptions({ search: debouncedSearchTerm }).then();
        } else {
            fetchSubscriptions({ page: currentPage, limit }).then();
        }
    }, [fetchSubscriptions, currentPage, debouncedSearchTerm]);

    // Filtres et tri côté client
    const filteredSortedSubscriptions = useMemo(() => {
        let arr = [...subscriptions];
        if (filters.status) arr = arr.filter(s => s.status === filters.status);

        arr.sort((a, b) => {
            let valA, valB;
            switch (sort.key) {
                case "startDate":
                    valA = a.startDate || "";
                    valB = b.startDate || "";
                    break;
                case "endDate":
                    valA = a.endDate || "";
                    valB = b.endDate || "";
                    break;
                case "status":
                    valA = a.status || "";
                    valB = b.status || "";
                    break;
                default:
                    valA = a[sort.key] || "";
                    valB = b[sort.key] || "";
            }
            if (valA < valB) return sort.order === "asc" ? -1 : 1;
            if (valA > valB) return sort.order === "asc" ? 1 : -1;
            return 0;
        });
        return arr;
    }, [subscriptions, filters, sort]);

    const toggleModal = (modalName, state = null) => {
        setModals(prev => ({ ...prev, [modalName]: state ?? !prev[modalName] }));
    };

    const openDetailsModal = async (subscription) => {
        setSelectedSubscription(subscription);
        const result = await fetchSubscriptionById(subscription.id);
        if (result.success) {
            setSelectedSubscription(result.data);
            toggleModal("details", true);
        } else {
            toast.error(result.error || "Erreur lors du chargement des détails");
        }
    };

    const openStatusModal = (subscription) => {
        setSelectedSubscription(subscription);
        setStatusForm(subscription.status);
        toggleModal("status", true);
    };

    const handleStatusSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await updateSubscriptionStatus(selectedSubscription.id, statusForm);
            if (result.success) {
                toast.success("Statut mis à jour !");
                toggleModal("status", false);
            } else {
                toast.error(result.error || "Erreur lors de la mise à jour du statut");
            }
        } catch {
            toast.error("Erreur inattendue");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(pagination.pages, prev + 1));

    const ActionButtons = ({ subscription, isMobile = false }) => (
        <div className={`flex ${isMobile ? 'space-x-1' : 'justify-end space-x-2'}`}>
            <button
                className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-colors"
                onClick={() => openDetailsModal(subscription)}
                title="Voir les détails"
            >
                <Eye size={16} />
            </button>
            <button
                className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-colors"
                onClick={() => openStatusModal(subscription)}
                title="Modifier le statut"
            >
                <Edit size={16} />
            </button>
        </div>
    );

    const EmptyState = ({ colSpan }) => (
        <tr>
            <td colSpan={colSpan} className="px-6 py-12 text-center text-gray-400">
                <div className="flex flex-col items-center">
                    <Search size={48} className="text-gray-300 mb-4" />
                    <p className="text-lg font-medium">Aucun abonnement trouvé</p>
                    <p className="text-sm">Essayez de modifier vos critères de recherche</p>
                </div>
            </td>
        </tr>
    );

    return (
        <div className="w-full h-full p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
                        Gestion des abonnements
                    </h1>
                </div>

                {/* Filtres & tri - Version améliorée */}
                <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                                    placeholder="ID client ou pack..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer par</label>
                                <div className="flex gap-2">
                                    <select
                                        className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                                        value={filters.status}
                                        onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                                    >
                                        <option value="">Statut</option>
                                        <option value="actif">Actif</option>
                                        <option value="non_paye">Non payé</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
                                <div className="flex gap-2">
                                    <select
                                        className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                                        value={sort.key}
                                        onChange={e => setSort(s => ({ ...s, key: e.target.value }))}
                                    >
                                        <option value="startDate">Date de début</option>
                                        <option value="endDate">Date de fin</option>
                                        <option value="status">Statut</option>
                                    </select>

                                    <select
                                        className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                                        value={sort.order}
                                        onChange={e => setSort(s => ({ ...s, order: e.target.value }))}
                                    >
                                        <option value="desc">↓ Desc</option>
                                        <option value="asc">↑ Asc</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Indicateurs de filtres actifs */}
                {(filters.status) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {filters.status && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Statut: {filters.status === "actif" ? "Actif" : "Non payé"}
                                <button
                                    type="button"
                                    className="ml-1.5 inline-flex text-purple-400 hover:text-purple-600"
                                    onClick={() => setFilters(f => ({ ...f, status: "" }))}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {filters.status && (
                            <button
                                className="text-xs text-gray-500 hover:text-gray-700 underline"
                                onClick={() => setFilters({ status: "" })}
                            >
                                Réinitialiser les filtres
                            </button>
                        )}
                    </div>
                )}

                {/* Version mobile améliorée */}
                <div className="lg:hidden space-y-3">
                    <button
                        className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm font-medium bg-gray-50 w-full"
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                    >
                        <Filter className="h-4 w-4" />
                        <span>Filtres et tri</span>
                        <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
                    </button>

                    {showMobileFilters && (
                        <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Recherche</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="ID client ou pack..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Statut</label>
                                    <select
                                        className="w-full border rounded-md px-3 py-2 text-sm"
                                        value={filters.status}
                                        onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                                    >
                                        <option value="">Tous</option>
                                        <option value="actif">Actif</option>
                                        <option value="non_paye">Non payé</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Trier par</label>
                                    <select
                                        className="w-full border rounded-md px-3 py-2 text-sm"
                                        value={sort.key}
                                        onChange={e => setSort(s => ({ ...s, key: e.target.value }))}
                                    >
                                        <option value="startDate">Date début</option>
                                        <option value="endDate">Date fin</option>
                                        <option value="status">Statut</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Ordre</label>
                                    <select
                                        className="w-full border rounded-md px-3 py-2 text-sm"
                                        value={sort.order}
                                        onChange={e => setSort(s => ({ ...s, order: e.target.value }))}
                                    >
                                        <option value="desc">Descendant</option>
                                        <option value="asc">Ascendant</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {error && <div className="p-8 text-center text-red-400">{error}</div>}

                {/* Table Desktop */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Abonnement</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pack ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de début</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de fin</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSortedSubscriptions.map((subscription) => (
                            <tr key={subscription.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscription.id.slice(0, 8)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscription.client?.slice(0, 8) || "N/A"}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscription.pack.slice(0, 8)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={subscription.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(subscription.startDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <ActionButtons subscription={subscription} />
                                </td>
                            </tr>
                        ))}
                        {filteredSortedSubscriptions.length === 0 && !isLoading && <EmptyState colSpan={7} />}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden">
                    {filteredSortedSubscriptions.map((subscription) => (
                        <div key={subscription.id} className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start space-x-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                Abonnement #{subscription.id.slice(0, 8)}
                                            </h3>
                                            <p className="text-sm text-gray-500 truncate">Client: {subscription.client?.slice(0, 8) || "N/A"}</p>
                                            <p className="text-xs text-gray-400 truncate mt-1">Pack: {subscription.pack.slice(0, 8)}</p>
                                        </div>
                                        <ActionButtons subscription={subscription} isMobile />
                                    </div>
                                    <div className="flex space-x-2 mt-3">
                                        <StatusBadge status={subscription.status} />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Début: {new Date(subscription.startDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Fin: {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredSortedSubscriptions.length === 0 && !isLoading && (
                        <div className="p-8 text-center text-gray-400">
                            <div className="flex flex-col items-center">
                                <Search size={48} className="text-gray-300 mb-4" />
                                <p className="text-lg font-medium">Aucun abonnement trouvé</p>
                                <p className="text-sm">Essayez de modifier vos critères de recherche</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="px-4 sm:px-6 py-4 border-t bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                        <div className="text-sm text-gray-500 text-center sm:text-left">
                            Page <span className="font-medium">{pagination.page}</span> sur <span className="font-medium">{pagination.pages}</span> —
                            <span className="block sm:inline"> Affichage de <span className="font-medium">{filteredSortedSubscriptions.length}</span> sur <span className="font-medium">{pagination.total}</span> abonnement(s)</span>
                        </div>
                        <div className="flex justify-center space-x-2">
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                onClick={handlePrevPage}
                                disabled={pagination.page <= 1 || isSearchMode}
                            >
                                Précédent
                            </button>
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                onClick={handleNextPage}
                                disabled={pagination.page >= pagination.pages || isSearchMode}
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            <Modal open={modals.details} onClose={() => toggleModal("details", false)}>
                {selectedSubscription && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold mb-2 pr-8">Détails de l'abonnement</h2>
                        <div className="space-y-2">
                            <div><strong>ID Abonnement:</strong> {selectedSubscription.id}</div>
                            <div><strong>Client ID:</strong> {selectedSubscription.client || "N/A"}</div>
                            <div><strong>Pack ID:</strong> {selectedSubscription.pack}</div>
                            <div className="flex items-center gap-2">
                                <strong>Statut:</strong>
                                <StatusBadge status={selectedSubscription.status} />
                            </div>
                            <div><strong>Date de début:</strong> {new Date(selectedSubscription.startDate).toLocaleString()}</div>
                            <div><strong>Date de fin:</strong> {selectedSubscription.endDate ? new Date(selectedSubscription.endDate).toLocaleString() : "N/A"}</div>
                            <div><strong>Créé le:</strong> {selectedSubscription.createdAt ? new Date(selectedSubscription.createdAt).toLocaleString() : "N/A"}</div>
                            <div><strong>Mis à jour le:</strong> {selectedSubscription.updatedAt ? new Date(selectedSubscription.updatedAt).toLocaleString() : "N/A"}</div>
                        </div>
                        <div className="mt-6">
                            <h3 className="font-medium mb-2">Historique des paiements</h3>
                            {selectedSubscription.histories?.length > 0 ? (
                                <div className="border rounded-lg divide-y">
                                    {selectedSubscription.histories.map(history => (
                                        <div key={history.id} className="p-3 hover:bg-gray-50">
                                            <div className="font-medium">Paiement #{history.id.slice(0, 8)}</div>
                                            <div className="text-sm text-gray-500">Montant: {history.amount} €</div>
                                            <div className="flex justify-between items-center mt-2">
                                                <div className="text-xs text-gray-400">
                                                    <div>Date: {new Date(history.date).toLocaleString()}</div>
                                                    <div>Fournisseur: {history.provider}</div>
                                                </div>
                                                <StatusBadge status={history.status} />
                                            </div>
                                            {history.providerResponse && (
                                                <div className="mt-2 text-xs bg-gray-100 p-2 rounded">
                                                    <strong>Réponse:</strong>
                                                    <pre className="mt-1 overflow-auto">
                                                        {(() => {
                                                            try {
                                                                return JSON.stringify(JSON.parse(history.providerResponse), null, 2);
                                                            } catch (e) {
                                                                return history.providerResponse;
                                                            }
                                                        })()}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    Aucun historique de paiement
                                </div>
                            )}
                        </div>
                        <button
                            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors mt-4"
                            onClick={() => toggleModal("details", false)}
                        >
                            Fermer
                        </button>
                    </div>
                )}
            </Modal>

            {/* Status Update Modal */}
            <Modal open={modals.status} onClose={() => toggleModal("status", false)}>
                <form onSubmit={handleStatusSubmit} className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4 pr-8">Modifier le statut de l'abonnement</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                        <select
                            value={statusForm}
                            onChange={(e) => setStatusForm(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                        >
                            <option value="actif">Actif</option>
                            <option value="non_paye">Non payé</option>
                        </select>
                    </div>
                    <div className="pt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                        <button
                            type="button"
                            className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            onClick={() => toggleModal("status", false)}
                            disabled={isSubmitting}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Loader2 className="animate-spin h-4 w-4" />}
                            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}