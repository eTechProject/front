import React, { useState, useEffect, useMemo } from "react";
import { Search, Loader2, X, Filter, ChevronDown } from "lucide-react";
import { usePayment } from "@/hooks/features/admin/usePayment.js";

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
        pending: "bg-yellow-100 text-yellow-800",
        completed: "bg-green-100 text-green-800",
        failed: "bg-red-100 text-red-800",
        default: "bg-gray-100 text-gray-800"
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-md ${statusColors[status] || statusColors.default}`}>
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : "N/A"}
        </span>
    );
}

export default function PaymentContent() {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Filtres et tri
    const [filters, setFilters] = useState({ status: "" });
    const [sort, setSort] = useState({ key: "date", order: "desc" });

    const { paymentHistories, pagination, isLoading, error, fetchPaymentHistories } = usePayment();
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
            fetchPaymentHistories({ search: debouncedSearchTerm }).then();
        } else {
            fetchPaymentHistories({ page: currentPage, limit }).then();
        }
    }, [fetchPaymentHistories, currentPage, debouncedSearchTerm]);

    // Filtres et tri côté client
    const filteredSortedPayments = useMemo(() => {
        let arr = [...paymentHistories];
        if (filters.status) arr = arr.filter(p => p.status === filters.status);

        arr.sort((a, b) => {
            let valA, valB;
            switch (sort.key) {
                case "date":
                    valA = a.date || "";
                    valB = b.date || "";
                    break;
                case "amount":
                    valA = a.amount || 0;
                    valB = b.amount || 0;
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
    }, [paymentHistories, filters, sort]);

    const handlePrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(pagination.pages, prev + 1));

    const EmptyState = ({ colSpan }) => (
        <tr>
            <td colSpan={colSpan} className="px-6 py-12 text-center text-gray-400">
                <div className="flex flex-col items-center">
                    <Search size={48} className="text-gray-300 mb-4" />
                    <p className="text-lg font-medium">Aucun paiement trouvé</p>
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
                        Historique des paiements
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
                                        <option value="completed">Succès</option>
                                        <option value="pending">En attente</option>
                                        <option value="failed">Échoué</option>
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
                                        <option value="date">Date</option>
                                        <option value="amount">Montant</option>
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
                                Statut: {filters.status === "completed" ? "Succès" : filters.status === "pending" ? "En attente" : "Échoué"}
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
                                        <option value="completed">Succès</option>
                                        <option value="pending">En attente</option>
                                        <option value="failed">Échoué</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Trier par</label>
                                    <select
                                        className="w-full border rounded-md px-3 py-2 text-sm"
                                        value={sort.key}
                                        onChange={e => setSort(s => ({ ...s, key: e.target.value }))}
                                    >
                                        <option value="date">Date</option>
                                        <option value="amount">Montant</option>
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Paiement</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pack ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSortedPayments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.paymentId.slice(0, 8)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.clientId.slice(0, 8)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.packId.slice(0, 8)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.amount} €</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={payment.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.provider}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(payment.date).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {filteredSortedPayments.length === 0 && !isLoading && <EmptyState colSpan={7} />}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden">
                    {filteredSortedPayments.map((payment) => (
                        <div key={payment.id} className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start space-x-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                            Paiement #{payment.paymentId.slice(0, 8)}
                                        </h3>
                                        <p className="text-sm text-gray-500 truncate">Client: {payment.clientId.slice(0, 8)}</p>
                                        <p className="text-xs text-gray-400 truncate mt-1">Pack: {payment.packId.slice(0, 8)}</p>
                                    </div>
                                    <div className="flex space-x-2 mt-3">
                                        <StatusBadge status={payment.status} />
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                            {payment.provider}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(payment.date).toLocaleDateString()} | {payment.amount} €
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredSortedPayments.length === 0 && !isLoading && (
                        <div className="p-8 text-center text-gray-400">
                            <div className="flex flex-col items-center">
                                <Search size={48} className="text-gray-300 mb-4" />
                                <p className="text-lg font-medium">Aucun paiement trouvé</p>
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
                            <span className="block sm:inline"> Affichage de <span className="font-medium">{filteredSortedPayments.length}</span> sur <span className="font-medium">{pagination.total}</span> paiement(s)</span>
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
        </div>
    );
}