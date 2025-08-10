import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

const ZonePanelToggle = ({ show, onClick }) => (
    <button
        className="absolute left-2 top-44 z-[900] bg-white/90 hover:bg-gray-100 backdrop-blur-sm rounded-full p-2 flex items-center justify-center text-gray-700 hover:text-orange-500 transition-colors"
        onClick={onClick}
        title={show ? "Masquer la zone" : "Afficher la zone"}
    >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
);

export default ZonePanelToggle;