import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, Edit, Search,Eye, User, X, UserCog } from "lucide-react";
import toast from "react-hot-toast";
import { useAdmin } from "../../../../hooks/useAdmin.js";

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

function Avatar({ agent, size = "h-10 w-10" }) {
    return agent.profilePictureUrl ? (
        <img
            src={agent.profilePictureUrl}
            alt="profile"
            className={`${size} rounded-full object-cover`}
        />
    ) : (
        <div className={`${size} rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium`}>
            <User size={size.includes("12") ? 24 : 20} />
        </div>
    );
}

function StatusBadge({ status }) {
    const statusColors = {
        actif: "bg-green-100 text-green-800",
        inactif: "bg-red-100 text-red-800",
        default: "bg-gray-100 text-gray-800"
    };

    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-md ${statusColors[status] || statusColors.default}`}>
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : "N/A"}
        </span>
    );
}

export default function AgentsContent() {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // États des modales
    const [modals, setModals] = useState({
        form: false,
        delete: false,
        details: false
    });

    const [modalMode, setModalMode] = useState("ajouter");
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [form, setForm] = useState({ nom: "", email: "", sexe: "M", address: "" });
    const [formErrors, setFormErrors] = useState({});
    const [imageUrl, setImageUrl] = useState("");

    const {
        agents,
        pagination,
        isLoading,
        error,
        fetchAgents,
        searchAgents,
        createAgent,
        updateAgent,
        removeAgent,
    } = useAdmin();

    const limit = 10;
    const isSearchMode = debouncedSearchTerm.length >= 3;

    // Debounce pour la recherche
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.length >= 3 || searchTerm.length === 0) {
                setDebouncedSearchTerm(searchTerm);
                setCurrentPage(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch agents
    useEffect(() => {
        if (debouncedSearchTerm.length >= 3) {
            searchAgents({name: debouncedSearchTerm}).then();
        } else {
            fetchAgents({ page: currentPage, limit }).then();
        }
    }, [fetchAgents, searchAgents, currentPage, debouncedSearchTerm]);

    const toggleModal = (modalName, state = null) => {
        setModals(prev => ({ ...prev, [modalName]: state ?? !prev[modalName] }));
    };

    const resetForm = () => {
        setForm({ nom: "", email: "", sexe: "M", address: "" });
        setImageUrl("");
        setFormErrors({});
        setSelectedAgent(null);
    };

    const openAddModal = () => {
        setModalMode("ajouter");
        resetForm();
        toggleModal("form", true);
    };

    const openEditModal = (agent) => {
        setModalMode("editer");
        setForm({
            nom: agent.user?.name || "",
            email: agent.user?.email || "",
            sexe: agent.sexe || "M",
            address: agent.address || ""
        });
        setImageUrl(agent.profilePictureUrl || "");
        setFormErrors({});
        setSelectedAgent(agent);
        toggleModal("form", true);
    };

    const openDeleteModal = (agent) => {
        setSelectedAgent(agent);
        toggleModal("delete", true);
    };

    const openDetailsModal = (agent) => {
        setSelectedAgent(agent);
        toggleModal("details", true);
    };

    // Handlers des formulaires
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageUrl(URL.createObjectURL(file));
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});

        const payload = {
            name: form.nom,
            email: form.email,
            sexe: form.sexe,
            address: form.address,
            profilePictureUrl: imageUrl || null,
        };

        try {
            const res = modalMode === "ajouter"
                ? await createAgent(payload)
                : await updateAgent(selectedAgent.agentId, payload);

            if (res.success) {
                toast.success(modalMode === "ajouter" ? "Agent ajouté !" : "Modifications enregistrées !");
                toggleModal("form", false);
            } else {
                if (res.details) setFormErrors(res.details);
                toast.error(res.error || "Erreur lors de l'enregistrement");
            }
        } catch {
            toast.error("Erreur inattendue");
        }
    };

    const handleDelete = async () => {
        try {
            const res = await removeAgent(selectedAgent.agentId);
            if (res.success) {
                toast.success("Agent supprimé !");
                toggleModal("delete", false);
            } else {
                toast.error(res.error || "Erreur lors de la suppression");
            }
        } catch {
            toast.error("Erreur inattendue");
        }
    };

    // Handlers de pagination
    const handlePrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(pagination.pages, prev + 1));

    // Composant des actions
    const ActionButtons = ({ agent, isMobile = false }) => (
        <div className={`flex ${isMobile ? 'space-x-1' : 'justify-end space-x-2'}`}>
            <button
                className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-colors"
                onClick={() => openEditModal(agent)}
                title="Modifier l'agent"
            >
                <Edit size={16} />
            </button>
            <button
                className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-colors"
                onClick={() => openDetailsModal(agent)}
                title="Voir les détails"
            >
                <Eye size={16} />
            </button>
            <button
                className="p-2 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50 transition-colors"
                onClick={() => openDeleteModal(agent)}
                title="Supprimer l'agent"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );

    // État vide
    const EmptyState = ({ colSpan }) => (
        <tr>
            <td colSpan={colSpan} className="px-6 py-12 text-center text-gray-400">
                <div className="flex flex-col items-center">
                    <UserCog size={48} className="text-gray-300 mb-4" />
                    <p className="text-lg font-medium">Aucun agent trouvé</p>
                    <p className="text-sm">Essayez de modifier vos critères de recherche</p>
                </div>
            </td>
        </tr>
    );

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gestion des agents</h1>
                    <button
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors w-full sm:w-auto"
                        onClick={openAddModal}
                    >
                        <PlusCircle size={18} />
                        <span>Ajouter un agent</span>
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

                    {/* États d'erreur et de chargement */}
                    {error && <div className="p-8 text-center text-red-400">{error}</div>}


                    {/* Table Desktop */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sexe</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {agents.map((agent) => (
                                <tr key={agent.agentId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Avatar agent={agent} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{agent.user?.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{agent.user?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500 max-w-xs truncate">{agent.address}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-md bg-gray-100 text-gray-800">
                                                {agent.sexe === "M" ? "Homme" : agent.sexe === "F" ? "Femme" : ""}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={agent.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <ActionButtons agent={agent} />
                                    </td>
                                </tr>
                            ))}
                            {agents.length === 0 && !isLoading && <EmptyState colSpan={7} />}
                            </tbody>
                        </table>
                    </div>

                    {/* Vue Mobile */}
                    <div className="lg:hidden">
                        {agents.map((agent) => (
                            <div key={agent.agentId} className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start space-x-4">
                                    <Avatar agent={agent} size="h-12 w-12" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">{agent.user?.name}</h3>
                                                <p className="text-sm text-gray-500 truncate">{agent.user?.email}</p>
                                                <p className="text-xs text-gray-400 truncate mt-1">{agent.address}</p>
                                            </div>
                                            <ActionButtons agent={agent} isMobile />
                                        </div>
                                        <div className="flex space-x-2 mt-3">
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                                {agent.sexe === "M" ? "Homme" : agent.sexe === "F" ? "Femme" : ""}
                                            </span>
                                            <StatusBadge status={agent.status} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {agents.length === 0 && !isLoading && (
                            <div className="p-8 text-center text-gray-400">
                                <div className="flex flex-col items-center">
                                    <UserCog size={48} className="text-gray-300 mb-4" />
                                    <p className="text-lg font-medium">Aucun agent trouvé</p>
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
                                <span className="block sm:inline"> Affichage de <span className="font-medium">{agents.length}</span> sur <span className="font-medium">{pagination.total}</span> agent(s)</span>
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

            {/* Modale Ajout/Édition */}
            <Modal open={modals.form} onClose={() => toggleModal("form", false)}>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4 pr-8">
                        {modalMode === "ajouter" ? "Ajouter un agent" : "Modifier l'agent"}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                            <input
                                name="nom"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                                value={form.nom}
                                onChange={(e) => setForm({ ...form, nom: e.target.value })}
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

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                            <input
                                name="address"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                required
                            />
                            {formErrors.address && <div className="text-xs text-red-500 mt-1">{formErrors.address}</div>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
                            <select
                                name="sexe"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                                value={form.sexe}
                                onChange={(e) => setForm({ ...form, sexe: e.target.value })}
                                required
                            >
                                <option value="M">Homme</option>
                                <option value="F">Femme</option>
                            </select>
                            {formErrors.sexe && <div className="text-xs text-red-500 mt-1">{formErrors.sexe}</div>}
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <User size={18} />
                            Photo de profil
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 transition-colors"
                        />
                        {imageUrl && (
                            <div className="mt-3 flex justify-center">
                                <img src={imageUrl} alt="Aperçu" className="h-20 w-20 object-cover rounded-full border-2 border-gray-200" />
                            </div>
                        )}
                    </div>

                    {modalMode === "editer" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                            <input
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-600"
                                value={selectedAgent?.status ? selectedAgent.status.charAt(0).toUpperCase() + selectedAgent.status.slice(1) : "N/A"}
                                disabled
                                readOnly
                            />
                        </div>
                    )}

                    <div className="pt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                        <button
                            type="button"
                            className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            onClick={() => toggleModal("form", false)}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            {modalMode === "ajouter" ? "Ajouter" : "Enregistrer"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modale Détails */}
            <Modal open={modals.details} onClose={() => toggleModal("details", false)}>
                {selectedAgent && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold mb-2 pr-8">Détails de l'agent</h2>
                        <div className="flex justify-center">
                            <img
                                src={selectedAgent.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAgent.user?.name || "")}`}
                                alt="Profile"
                                className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <div><strong>Nom :</strong> {selectedAgent.user?.name}</div>
                            <div><strong>Email :</strong> {selectedAgent.user?.email}</div>
                            <div><strong>Adresse :</strong> {selectedAgent.address}</div>
                            <div><strong>Sexe :</strong> {selectedAgent.sexe === "M" ? "Homme" : "Femme"}</div>
                            <div className="flex items-center gap-2">
                                <strong>Statut :</strong>
                                <StatusBadge status={selectedAgent.status} />
                            </div>
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

            {/* Modale Suppression */}
            <Modal open={modals.delete} onClose={() => toggleModal("delete", false)}>
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-2 text-red-600 pr-8">Supprimer l'agent</h2>
                    <p className="text-gray-700">
                        Êtes-vous sûr de vouloir supprimer{" "}
                        <span className="font-bold text-gray-900">{selectedAgent?.user?.name}</span> ?
                    </p>
                    <p className="text-sm text-gray-500">Cette action est irréversible.</p>
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                        <button
                            className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            onClick={() => toggleModal("delete", false)}
                        >
                            Annuler
                        </button>
                        <button
                            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            onClick={handleDelete}
                        >
                            Supprimer
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}