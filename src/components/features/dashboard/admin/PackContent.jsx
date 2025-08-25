import React, { useState } from "react";
import { PlusCircle, Trash2, Edit, Eye, Package, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { usePack } from "@/hooks/features/admin/usePack.js";

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

function Avatar({ size = "h-10 w-10" }) {
    return (
        <div className={`${size} rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium`}>
            <Package size={size.includes("12") ? 24 : 20} />
        </div>
    );
}

export default function PackContent() {
    const [currentPage, setCurrentPage] = useState(1);
    const [modals, setModals] = useState({
        form: false,
        delete: false,
        details: false,
    });
    const [modalMode, setModalMode] = useState("ajouter");
    const [selectedPack, setSelectedPack] = useState(null);
    const [form, setForm] = useState({
        nbAgents: "",
        prix: "",
        descriptions: [""],
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const {
        packs,
        pagination,
        isLoading,
        error,
        fetchPacks,
        createPack,
        updatePack,
        removePack,
    } = usePack();

    const limit = 20;

    React.useEffect(() => {
        fetchPacks({ page: currentPage, limit }).then();
    }, [fetchPacks, currentPage]);

    const toggleModal = (modalName, state = null) => {
        setModals(prev => ({ ...prev, [modalName]: state ?? !prev[modalName] }));
    };

    const resetForm = () => {
        setForm({ nbAgents: "", prix: "", descriptions: [""] });
        setFormErrors({});
        setSelectedPack(null);
    };

    const openAddModal = () => {
        setModalMode("ajouter");
        resetForm();
        toggleModal("form", true);
    };

    const openEditModal = (pack) => {
        setModalMode("editer");
        setForm({
            nbAgents: pack.nbAgents || "",
            prix: pack.prix || "",
            descriptions: pack.description ? pack.description.split(", ") : [""],
        });
        setFormErrors({});
        setSelectedPack(pack);
        toggleModal("form", true);
    };

    const openDeleteModal = (pack) => {
        setSelectedPack(pack);
        toggleModal("delete", true);
    };

    const openDetailsModal = (pack) => {
        setSelectedPack(pack);
        toggleModal("details", true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});
        setIsSubmitting(true);
        const payload = {
            nbAgents: parseInt(form.nbAgents) || null,
            prix: parseFloat(form.prix) || null,
            description: form.descriptions.filter(d => d.trim() !== "").join(", "),
        };
        try {
            const res = modalMode === "ajouter"
                ? await createPack(payload)
                : await updatePack(selectedPack.id, payload);
            if (res.success) {
                toast.success(modalMode === "ajouter" ? "Pack ajouté !" : "Modifications enregistrées !");
                toggleModal("form", false);
                fetchPacks({ page: currentPage, limit });
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
            const res = await removePack(selectedPack.id);
            if (res.success) {
                toast.success("Pack supprimé !");
                toggleModal("delete", false);
                fetchPacks({ page: currentPage, limit });
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

    const ActionButtons = ({ pack, isMobile = false }) => (
        <div className={`flex ${isMobile ? 'space-x-1' : 'justify-end space-x-2'}`}>
            <button
                className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-colors"
                onClick={() => openEditModal(pack)}
                title="Modifier le pack"
            >
                <Edit size={16} />
            </button>
            <button
                className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-colors"
                onClick={() => openDetailsModal(pack)}
                title="Voir les détails"
            >
                <Eye size={16} />
            </button>
            <button
                className="p-2 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50 transition-colors"
                onClick={() => openDeleteModal(pack)}
                title="Supprimer le pack"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );

    const EmptyState = ({ colSpan }) => (
        <tr>
            <td colSpan={colSpan} className="px-6 py-12 text-center text-gray-400">
                <div className="flex flex-col items-center">
                    <Package size={48} className="text-gray-300 mb-4" />
                    <p className="text-lg font-medium">Aucun pack trouvé</p>
                </div>
            </td>
        </tr>
    );

    return (
        <div className="w-full h-full p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gestion des packs</h1>
                    <button
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors w-full sm:w-auto"
                        onClick={openAddModal}
                    >
                        <PlusCircle size={18} />
                        <span>Ajouter un pack</span>
                    </button>
                </div>
                <div className="bg-white shadow-sm rounded-xl overflow-hidden">
                    {error && <div className="p-8 text-center text-red-400">{error}</div>}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icône</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre d'agents</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de création</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {packs.map((pack) => (
                                <tr key={pack.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Avatar pack={pack} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{pack.nbAgents}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{pack.prix || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500 line-clamp-2">
                                            {pack.description?.split(", ").map((item, i) => (
                                                <span key={i}>
                                                        {i > 0 && ", "}
                                                    {item}
                                                    </span>
                                            )) || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{new Date(pack.dateCreation).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <ActionButtons pack={pack} />
                                    </td>
                                </tr>
                            ))}
                            {packs.length === 0 && !isLoading && <EmptyState colSpan={6} />}
                            </tbody>
                        </table>
                    </div>
                    <div className="lg:hidden">
                        {packs.map((pack) => (
                            <div key={pack.id} className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start space-x-4">
                                    <Avatar pack={pack} size="h-12 w-12" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">{pack.nbAgents} agents</h3>
                                                <p className="text-sm text-gray-500 truncate">{pack.prix || 'N/A'}</p>
                                                <p className="text-xs text-gray-500 line-clamp-2">
                                                    {pack.description?.split(", ").map((item, i) => (
                                                        <span key={i}>
                                                            {i > 0 && ", "}
                                                            {item}
                                                        </span>
                                                    )) || 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-500">{new Date(pack.dateCreation).toLocaleDateString()}</p>
                                            </div>
                                            <ActionButtons pack={pack} isMobile />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {packs.length === 0 && !isLoading && (
                            <div className="p-8 text-center text-gray-400">
                                <div className="flex flex-col items-center">
                                    <Package size={48} className="text-gray-300 mb-4" />
                                    <p className="text-lg font-medium">Aucun pack trouvé</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="px-4 sm:px-6 py-4 border-t bg-gray-50">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                            <div className="text-sm text-gray-500 text-center sm:text-left">
                                Page <span className="font-medium">{pagination.page}</span> sur <span className="font-medium">{pagination.pages}</span> —
                                <span className="block sm:inline"> Affichage de <span className="font-medium">{packs.length}</span> sur <span className="font-medium">{pagination.total}</span> pack(s)</span>
                            </div>
                            <div className="flex justify-center space-x-2">
                                <button
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    onClick={handlePrevPage}
                                    disabled={pagination.page <= 1}
                                >
                                    Précédent
                                </button>
                                <button
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    onClick={handleNextPage}
                                    disabled={pagination.page >= pagination.pages}
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
                        {modalMode === "ajouter" ? "Ajouter un pack" : "Modifier le pack"}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'agents</label>
                            <input
                                name="nbAgents"
                                type="number"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                                value={form.nbAgents}
                                onChange={(e) => setForm({ ...form, nbAgents: e.target.value })}
                                required
                            />
                            {formErrors.nbAgents && <div className="text-xs text-red-500 mt-1">{formErrors.nbAgents}</div>}
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
                            <input
                                name="prix"
                                type="number"
                                step="0.01"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                                value={form.prix}
                                onChange={(e) => setForm({ ...form, prix: e.target.value })}
                                required
                            />
                            {formErrors.prix && <div className="text-xs text-red-500 mt-1">{formErrors.prix}</div>}
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descriptions (une par ligne)
                            </label>
                            <div className="space-y-2">
                                <AnimatePresence>
                                    {form.descriptions.map((desc, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex gap-2"
                                        >
                                            <input
                                                type="text"
                                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                                                value={desc}
                                                onChange={(e) => {
                                                    const newDescriptions = [...form.descriptions];
                                                    newDescriptions[index] = e.target.value;
                                                    setForm({ ...form, descriptions: newDescriptions });
                                                }}
                                                placeholder={`Description ${index + 1}`}
                                            />
                                            {form.descriptions.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="p-2 text-red-500 hover:text-red-700"
                                                    onClick={() => {
                                                        const newDescriptions = form.descriptions.filter((_, i) => i !== index);
                                                        setForm({ ...form, descriptions: newDescriptions });
                                                    }}
                                                    title="Supprimer cette description"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                            <button
                                type="button"
                                className="mt-2 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                                onClick={() => setForm({ ...form, descriptions: [...form.descriptions, ""] })}
                            >
                                <PlusCircle size={16} />
                                Ajouter une autre description
                            </button>
                            {formErrors.descriptions && (
                                <div className="text-xs text-red-500 mt-1">{formErrors.descriptions}</div>
                            )}
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
                {selectedPack && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold mb-2 pr-8">Détails du pack</h2>
                        <div className="flex justify-center">
                            <Avatar pack={selectedPack} size="h-24 w-24" />
                        </div>
                        <div className="space-y-2">
                            <div><strong>Nombre d'agents :</strong> {selectedPack.nbAgents}</div>
                            <div><strong>Prix :</strong> {selectedPack.prix || 'N/A'}</div>
                            <div>
                                <strong>Descriptions :</strong>
                                <ul className="list-disc pl-5 mt-1 space-y-1">
                                    {selectedPack.description?.split(", ").map((item, i) => (
                                        <li key={i}>{item}</li>
                                    )) || <li>N/A</li>}
                                </ul>
                            </div>
                            <div><strong>Date de création :</strong> {new Date(selectedPack.dateCreation).toLocaleDateString()}</div>
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
                    <h2 className="text-xl font-semibold mb-2 text-red-600 pr-8">Supprimer le pack</h2>
                    <p className="text-gray-700">
                        Êtes-vous sûr de vouloir supprimer le pack avec{" "}
                        <span className="font-bold text-gray-900">{selectedPack?.nbAgents} agents</span> ?
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