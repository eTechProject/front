import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, Edit, Search, Eye, User, X, Users, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {useClient} from "@/hooks/features/admin/useClient.js";

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

function Avatar({ client, size = "h-10 w-10" }) {
    return (
        <div className={`${size} rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium`}>
            <User size={size.includes("12") ? 24 : 20} />
        </div>
    );
}
export default function ClientsContent() {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [modals, setModals] = useState({
        form: false,
        delete: false,
        details: false
    });
    const [modalMode, setModalMode] = useState("ajouter");
    const [selectedClient, setSelectedClient] = useState(null);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: ""
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const {
        clients,
        pagination,
        isLoading,
        error,
        fetchClients,
        searchClients,
        createClient,
        updateClient,
        removeClient,
    } = useClient();

    const limit = 10;
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
            searchClients({ name: debouncedSearchTerm });
        } else {
            fetchClients({ page: currentPage, limit });
        }
    }, [fetchClients, searchClients, currentPage, debouncedSearchTerm]);

    const toggleModal = (modalName, state = null) => {
        setModals(prev => ({ ...prev, [modalName]: state ?? !prev[modalName] }));
    };

    const resetForm = () => {
        setForm({ name: "", email: "", phone: "" });
        setFormErrors({});
        setSelectedClient(null);
    };

    const openAddModal = () => {
        setModalMode("ajouter");
        resetForm();
        toggleModal("form", true);
    };

    const openEditModal = (client) => {
        setModalMode("editer");
        setForm({
            name: client.name || "",
            email: client.email || "",
            phone: client.phone || ""
        });
        setFormErrors({});
        setSelectedClient(client);
        toggleModal("form", true);
    };

    const openDeleteModal = (client) => {
        setSelectedClient(client);
        toggleModal("delete", true);
    };

    const openDetailsModal = (client) => {
        setSelectedClient(client);
        toggleModal("details", true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});
        setIsSubmitting(true);

        const payload = {
            name: form.name,
            email: form.email,
            phone: form.phone || null
        };

        try {
            const res = modalMode === "ajouter"
                ? await createClient(payload)
                : await updateClient(selectedClient.userId, payload);

            if (res.success) {
                toast.success(modalMode === "ajouter" ? "Client ajouté !" : "Modifications enregistrées !");
                toggleModal("form", false);
            } else {
                if (res.details) setFormErrors(res.details);
                toast.error(res.error || "Erreur lors de l'enregistrement");
            }
        } catch {
            toast.error("Erreur inattendue");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await removeClient(selectedClient.userId);
            if (res.success) {
                toast.success("Client supprimé !");
                toggleModal("delete", false);
            } else {
                toast.error(res.error || "Erreur lors de la suppression");
            }
        } catch {
            toast.error("Erreur inattendue");
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(pagination.pages, prev + 1));

    const ActionButtons = ({ client, isMobile = false }) => (
        <div className={`flex ${isMobile ? 'space-x-1' : 'justify-end space-x-2'}`}>
            <button
                className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-colors"
                onClick={() => openEditModal(client)}
                title="Modifier le client"
            >
                <Edit size={16} />
            </button>
            <button
                className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-colors"
                onClick={() => openDetailsModal(client)}
                title="Voir les détails"
            >
                <Eye size={16} />
            </button>
            <button
                className="p-2 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50 transition-colors"
                onClick={() => openDeleteModal(client)}
                title="Supprimer le client"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );

    const EmptyState = ({ colSpan }) => (
        <tr>
            <td colSpan={colSpan} className="px-6 py-12 text-center text-gray-400">
                <div className="flex flex-col items-center">
                    <Users size={48} className="text-gray-300 mb-4" />
                    <p className="text-lg font-medium">Aucun client trouvé</p>
                    <p className="text-sm">Essayez de modifier vos critères de recherche</p>
                </div>
            </td>
        </tr>
    );

    return (
        <div className="w-full h-full p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gestion des clients</h1>
                    <button
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors w-full sm:w-auto"
                        onClick={openAddModal}
                    >
                        <PlusCircle size={18} />
                        <span>Ajouter un client</span>
                    </button>
                </div>

                <div className="bg-white shadow-sm rounded-xl overflow-hidden">
                    <div className="p-4 sm:p-6">
                        <div className="relative w-full max-w-md">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-100 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                                placeholder="Rechercher par nom ou email... (min. 3 caractères)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm.length > 0 && searchTerm.length < 3 && (
                                <div className="absolute top-full left-0 mt-1 text-xs text-gray-500">
                                    Tapez au moins 3 caractères pour rechercher
                                </div>
                            )}
                        </div>
                    </div>

                    {error && <div className="p-8 text-center text-red-400">{error}</div>}

                    <div className="hidden lg:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {clients.map((client) => (
                                <tr key={client.userId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Avatar client={client} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{client.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{client.phone || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <ActionButtons client={client} />
                                    </td>
                                </tr>
                            ))}
                            {clients.length === 0 && !isLoading && <EmptyState colSpan={5} />}
                            </tbody>
                        </table>
                    </div>

                    <div className="lg:hidden">
                        {clients.map((client) => (
                            <div key={client.userId} className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start space-x-4">
                                    <Avatar client={client} size="h-12 w-12" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">{client.name}</h3>
                                                <p className="text-sm text-gray-500 truncate">{client.email}</p>
                                                <p className="text-xs text-gray-500 truncate">{client.phone || 'N/A'}</p>
                                            </div>
                                            <ActionButtons client={client} isMobile />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {clients.length === 0 && !isLoading && (
                            <div className="p-8 text-center text-gray-400">
                                <div className="flex flex-col items-center">
                                    <Users size={48} className="text-gray-300 mb-4" />
                                    <p className="text-lg font-medium">Aucun client trouvé</p>
                                    <p className="text-sm">Essayez de modifier vos critères de recherche</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="px-4 sm:px-6 py-4 border-t bg-gray-50">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                            <div className="text-sm text-gray-500 text-center sm:text-left">
                                Page <span className="font-medium">{pagination.page}</span> sur <span className="font-medium">{pagination.pages}</span> —
                                <span className="block sm:inline"> Affichage de <span className="font-medium">{clients.length}</span> sur <span className="font-medium">{pagination.total}</span> client(s)</span>
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

            <Modal open={modals.form} onClose={() => toggleModal("form", false)}>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4 pr-8">
                        {modalMode === "ajouter" ? "Ajouter un client" : "Modifier le client"}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                            <input
                                name="name"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                            {formErrors.name && <div className="text-xs text-red-500 mt-1">{formErrors.name}</div>}
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                name="email"
                                type="email"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                            {formErrors.email && <div className="text-xs text-red-500 mt-1">{formErrors.email}</div>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                            <input
                                name="phone"
                                type="tel"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                            {formErrors.phone && <div className="text-xs text-red-500 mt-1">{formErrors.phone}</div>}
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                        <button
                            type="button"
                            className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            onClick={() => toggleModal("form", false)}
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
                            {modalMode === "ajouter" ? (isSubmitting ? "Ajout..." : "Ajouter") : (isSubmitting ? "Enregistrement..." : "Enregistrer")}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal open={modals.details} onClose={() => toggleModal("details", false)}>
                {selectedClient && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold mb-2 pr-8">Détails du client</h2>
                        <div className="flex justify-center">
                            <Avatar client={selectedClient} size="h-24 w-24" />
                        </div>
                        <div className="space-y-2">
                            <div><strong>Nom :</strong> {selectedClient.name}</div>
                            <div><strong>Email :</strong> {selectedClient.email}</div>
                            <div><strong>Téléphone :</strong> {selectedClient.phone || 'N/A'}</div>
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

            <Modal open={modals.delete} onClose={() => toggleModal("delete", false)}>
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-2 text-red-600 pr-8">Supprimer le client</h2>
                    <p className="text-gray-700">
                        Êtes-vous sûr de vouloir supprimer{" "}
                        <span className="font-bold text-gray-900">{selectedClient?.name}</span> ?
                    </p>
                    <p className="text-sm text-gray-500">Cette action est irréversible.</p>
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                        <button
                            className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            onClick={() => toggleModal("delete", false)}
                            disabled={isDeleting}
                        >
                            Annuler
                        </button>
                        <button
                            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting && <Loader2 className="animate-spin h-4 w-4" />}
                            {isDeleting ? "Suppression..." : "Supprimer"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}