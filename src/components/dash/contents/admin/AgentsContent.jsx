import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, Edit, UserCog, Search, Image as LucideImage, X } from "lucide-react";
import { useAgent } from "../../../../hooks/useAgent.js";

// Valeurs par défaut à utiliser si le backend ne renvoie aucun agent
const EXAMPLE_AGENTS = [
    {
        encryptedId: "EXAMPLE123",
        address: null,
        sexe: "F",
        profilePictureUrl: "https://randomuser.me/api/portraits/women/44.jpg",
        statut: "Actif",
        user: {
            userId: "EXAMPLE-USER-1",
            email: "example.user1@email.com",
            name: "Exemple Agent",
            role: "agent"
        }
    }
];

// Composant de modal simple
function Modal({ open, onClose, children }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
                <button
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                >
                    <X size={20} />
                </button>
                {children}
            </div>
        </div>
    );
}

export default function AgentsContent() {
    const [searchTerm, setSearchTerm] = useState("");
    const {
        agents,
        isLoading,
        error,
        fetchAgents,
        createAgent,
        updateAgent,
        removeAgent,
    } = useAgent();

    // Modals & form states
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("ajouter");
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Image (URL) pour le formulaire
    const [imageUrl, setImageUrl] = useState("");
    const [form, setForm] = useState({ nom: "", email: "", sexe: "M" });

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    // Ajout d'une image au formulaire (upload = URL uniquement)
    const handleImageChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            // Pour la démo, on affiche un aperçu local
            const url = URL.createObjectURL(file);
            setImageUrl(url);
            // Si tu veux envoyer l'image côté backend, convertis le fichier en base64 ou FormData ici
        }
    };

    // Ouvre la modale d'ajout
    const openAddModal = () => {
        setModalMode("ajouter");
        setForm({ nom: "", email: "", sexe: "M" });
        setImageUrl("");
        setModalOpen(true);
        setSelectedAgent(null);
    };

    // Ouvre la modale d'édition
    const openEditModal = (agent) => {
        setModalMode("editer");
        setForm({
            nom: agent.user?.name || "",
            email: agent.user?.email || "",
            sexe: agent.sexe || "M"
        });
        setImageUrl(agent.profilePictureUrl || "");
        setModalOpen(true);
        setSelectedAgent(agent);
    };

    // Ouvre la modale suppression
    const openDeleteModal = (agent) => {
        setSelectedAgent(agent);
        setDeleteModalOpen(true);
    };

    // Ferme les modales
    const closeModal = () => setModalOpen(false);
    const closeDeleteModal = () => setDeleteModalOpen(false);

    // Gestion du formulaire
    const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // Soumission du formulaire (pas de statut, pas de rôle)
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            name: form.nom,
            email: form.email,
            sexe: form.sexe,
            profilePictureUrl: imageUrl || null, // facultatif
        };
        try {
            if (modalMode === "ajouter") {
                await createAgent(payload);
            } else if (modalMode === "editer") {
                await updateAgent(selectedAgent.encryptedId, payload);
            }
            setModalOpen(false);
        } catch (err) {}
    };

    // Suppression d'agent
    const handleDelete = async () => {
        try {
            await removeAgent(selectedAgent.encryptedId);
            setDeleteModalOpen(false);
        } catch (err) {}
    };

    // Recherche et filtrage (par nom ou email uniquement)
    const agentsToDisplay = (agents && agents.length > 0 ? agents : EXAMPLE_AGENTS).filter((agent) => {
        const nom = agent.user?.name || "";
        const email = agent.user?.email || "";
        return (
            nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <>
            <div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Gestion des agents</h1>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        onClick={openAddModal}
                    >
                        <PlusCircle size={18} />
                        <span>Ajouter un agent</span>
                    </button>
                </div>

                <div className="bg-white shadow-sm rounded-xl overflow-hidden">
                    <div className="p-4 border-b flex flex-col md:flex-row gap-4 md:gap-8">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Rechercher par nom ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {isLoading && (
                        <div className="p-8 text-center text-blue-400">Chargement...</div>
                    )}
                    {error && (
                        <div className="p-8 text-center text-red-400">{error}</div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sexe</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {agentsToDisplay.map((agent) => (
                                <tr key={agent.encryptedId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {agent.profilePictureUrl ? (
                                                <img
                                                    src={agent.profilePictureUrl}
                                                    alt="profile"
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                                    <LucideImage size={20} />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{agent.user?.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{agent.user?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                {agent.sexe === "M" ? "Homme" : agent.sexe === "F" ? "Femme" : ""}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                ${agent.statut === "Actif"
                                                ? "bg-green-100 text-green-800"
                                                : agent.statut === "Inactif"
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-gray-100 text-gray-800"}`}>
                                                {agent.statut || "N/A"}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                className="p-1 text-blue-600 hover:text-blue-900 rounded-full hover:bg-blue-50"
                                                onClick={() => openEditModal(agent)}
                                                title="Modifier l'agent"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="p-1 text-indigo-600 hover:text-indigo-900 rounded-full hover:bg-indigo-50"
                                                onClick={() => openEditModal(agent)}
                                                title="Voir les paramètres"
                                            >
                                                <UserCog size={16} />
                                            </button>
                                            <button
                                                className="p-1 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50"
                                                onClick={() => openDeleteModal(agent)}
                                                title="Supprimer l'agent"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {agentsToDisplay.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                        Aucun agent trouvé.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 border-t flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Affichage de <span className="font-medium">{agentsToDisplay.length}</span> sur <span className="font-medium">{(agents && agents.length > 0 ? agents.length : EXAMPLE_AGENTS.length)}</span> agent(s)
                        </div>
                        <div className="flex space-x-2">
                            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50" disabled>
                                Précédent
                            </button>
                            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50" disabled>
                                Suivant
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modale Ajout / Édition */}
            <Modal open={modalOpen} onClose={closeModal}>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <h2 className="text-xl font-semibold mb-2">
                        {modalMode === "ajouter" ? "Ajouter un agent" : "Modifier l'agent"}
                    </h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom</label>
                        <input
                            name="nom"
                            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                            value={form.nom}
                            onChange={handleFormChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            name="email"
                            type="email"
                            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                            value={form.email}
                            onChange={handleFormChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sexe</label>
                        <select
                            name="sexe"
                            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                            value={form.sexe}
                            onChange={handleFormChange}
                            required
                        >
                            <option value="M">Homme</option>
                            <option value="F">Femme</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                            <LucideImage size={18} />
                            Photo de profil (URL ou fichier)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                        />
                        {imageUrl && (
                            <img src={imageUrl} alt="Aperçu" className="mt-2 h-20 w-20 object-cover rounded-full border" />
                        )}
                    </div>
                    {modalMode === "editer" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Statut</label>
                            <input
                                className="mt-1 block w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50"
                                value={selectedAgent?.statut || "N/A"}
                                disabled
                                readOnly
                            />
                        </div>
                    )}
                    <div className="pt-3 flex justify-end space-x-2">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                            onClick={closeModal}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                        >
                            {modalMode === "ajouter" ? "Ajouter" : "Enregistrer"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modale suppression */}
            <Modal open={deleteModalOpen} onClose={closeDeleteModal}>
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-2 text-red-600">Supprimer l'agent</h2>
                    <p>
                        Êtes-vous sûr de vouloir supprimer{" "}
                        <span className="font-bold">{selectedAgent?.user?.name}</span> ?
                    </p>
                    <div className="flex justify-end space-x-2">
                        <button
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                            onClick={closeDeleteModal}
                        >
                            Annuler
                        </button>
                        <button
                            className="px-4 py-2 bg-red-600 text-white rounded-lg"
                            onClick={handleDelete}
                        >
                            Supprimer
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}