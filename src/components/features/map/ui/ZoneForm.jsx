import React from 'react';
import { X, Save } from 'lucide-react';

const ZoneForm = ({
                      zoneFormData,
                      onChange,
                      onCancel,
                      onSave
                  }) => (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1001] bg-white shadow-xl rounded-lg w-96 border border-gray-200">
        <div className="p-4 bg-orange-50 border-b border-orange-100 font-medium text-orange-800 flex justify-between items-center">
            <span>Définir votre zone de surveillance</span>
            <button
                className="text-gray-500 hover:text-gray-700"
                onClick={onCancel}
            >
                <X size={20} />
            </button>
        </div>
        <div className="p-4">
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la zone <span className="text-red-500"> *</span>
                </label>
                <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={zoneFormData.name}
                    onChange={e => onChange({ ...zoneFormData, name: e.target.value })}
                    placeholder="Ex: Zone Bâtiment Principal"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (facultative)
                </label>
                <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={zoneFormData.description}
                    onChange={e => onChange({ ...zoneFormData, description: e.target.value })}
                    placeholder="Ex: Surveillance de nuit pour le bâtiment principal"
                    rows={3}
                />
            </div>
            <input
                type="hidden"
                name="clientId"
                value={zoneFormData.clientId}
            />
            <div className="flex justify-end space-x-2">
                <button
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    onClick={onCancel}
                >
                    Annuler
                </button>
                <button
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center space-x-1"
                    onClick={onSave}
                >
                    <Save size={16} />
                    <span>Enregistrer</span>
                </button>
            </div>
        </div>
    </div>
);

export default ZoneForm;