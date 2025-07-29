import React from 'react';
import {Trash2} from 'lucide-react';

const ZonePanel = ({drawnZones, onZoneClick, onZoneDelete}) => (
    <div
        className="absolute left-2 bottom-2 z-[1000] bg-white shadow-lg rounded-lg overflow-hidden w-72 border border-gray-200">
        <div
            className="p-3 bg-orange-50 border-b border-orange-100 font-medium text-orange-800 flex justify-between items-center">
            <span>Votre zone de surveillance</span>
        </div>
        <div className="max-h-64 overflow-y-auto">
            {drawnZones.map(zone => (
                <div
                    key={zone.id}
                    className="flex items-center justify-between py-3 px-3 hover:bg-gray-50 border-b"
                >
                    <div
                        className="flex-1 cursor-pointer"
                        onClick={() => onZoneClick(zone)}
                    >
                        <div className="font-medium text-sm">{zone.name}</div>
                        <div className="text-xs text-gray-500">Type: {zone.type}</div>
                        {zone.description && (
                            <div className="text-xs mt-1 text-gray-600">{zone.description}</div>
                        )}
                    </div>
                    <button
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                        onClick={() => onZoneDelete(zone.id)}
                        title="Supprimer cette zone"
                    >
                        <Trash2 size={16}/>
                    </button>
                </div>
            ))}
        </div>
        <div className="p-3 text-xs text-gray-600 bg-gray-50 border-t">
            <p>Vous pouvez modifier ou supprimer cette zone avec les outils de dessin en haut à droite.</p>
        </div>
    </div>
);

export default ZonePanel;