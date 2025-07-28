import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, Edit, UserCog, Search, Filter, X } from "lucide-react";
import {useAgent} from "../../../../hooks/useAgent.js";

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

const roles = ["Tous", "Administrateur", "Éditeur", "Lecteur"];

export default function AgentContent() {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("Tous");

    // Utilisation du hook agent
    const {
        agents,
        isLoading,
        error,
        fetchAgents,
        createAgent,
        updateAgent,
        removeAgent,
    } = useAgent();

    // Pour la modale
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("ajouter"); // ou "editer"
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Formulaire local
    const [form, setForm] = useState({ nom: "", email: "", role: "Lecteur", statut: "Actif" });

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    // Ouvrir modale ajout
    const openAddModal = () => {
        setModalMode("ajouter");
        setForm({ nom: "", email: "", role: "Lecteur", statut: "Actif" });
        setModalOpen(true);
        setSelectedAgent(null);
    };

    // Ouvrir modale édition
    const openEditModal = (agent) => {
        setModalMode("editer");
        setForm({ ...agent });
        setModalOpen(true);
        setSelectedAgent(agent);
    };

    // Ouvrir modale suppression
    const openDeleteModal = (agent) => {
        setSelectedAgent(agent);
        setDeleteModalOpen(true);
    };

    // Fermer modales
    const closeModal = () => setModalOpen(false);
    const closeDeleteModal = () => setDeleteModalOpen(false);

    // Gérer formulaire
    const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // Soumission formulaire
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (modalMode === "ajouter") {
            await createAgent(form);
        } else if (modalMode === "editer") {
            await updateAgent(selectedAgent.id, form);
        }
        setModalOpen(false);
    };

    // Suppression
    const handleDelete = async () => {
        await removeAgent(selectedAgent.id);
        setDeleteModalOpen(false);
    };

    // Filtrage recherche + rôle
    const filteredAgents = agents.filter((agent) => {
        const matchRecherche =
            (agent.nom || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (agent.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (agent.role || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = roleFilter === "Tous" || agent.role === roleFilter;
        return matchRecherche && matchRole;
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
                        <div className="relative w-full md:w-2/3">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Rechercher par nom, email ou rôle..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative w-full md:w-1/3">
              <span className="absolute left-2 top-2 text-gray-400">
                <Filter size={18} />
              </span>
                            <select
                                className="pl-8 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                {roles.map((r) => (
                                    <option key={r}>{r}</option>
                                ))}
                            </select>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAgents.map((agent) => (
                                <tr key={agent.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                                    {(agent.nom || "A").charAt(0)}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{agent.nom}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{agent.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${agent.role === "Administrateur"
                          ? "bg-purple-100 text-purple-800"
                          : agent.role === "Éditeur"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                      }`}>
                        {agent.role}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${agent.statut === "Actif"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"}`}>
                        {agent.statut}
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
                                                title="Changer le rôle ou les paramètres"
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
                            {filteredAgents.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        Aucun agent trouvé.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 border-t flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Affichage de <span className="font-medium">{filteredAgents.length}</span> sur <span className="font-medium">{agents.length}</span> agent(s)
                        </div>
                        <div className="flex space-x-2">
                            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                                Précédent
                            </button>
                            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
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
                        <label className="block text-sm font-medium text-gray-700">Rôle</label>
                        <select
                            name="role"
                            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                            value={form.role}
                            onChange={handleFormChange}
                            required
                        >
                            <option value="Administrateur">Administrateur</option>
                            <option value="Éditeur">Éditeur</option>
                            <option value="Lecteur">Lecteur</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Statut</label>
                        <select
                            name="statut"
                            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                            value={form.statut}
                            onChange={handleFormChange}
                            required
                        >
                            <option value="Actif">Actif</option>
                            <option value="Inactif">Inactif</option>
                        </select>
                    </div>
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
                        <span className="font-bold">{selectedAgent?.nom}</span> ?
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