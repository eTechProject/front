import React from 'react';

const ZonePanelToggle = ({ show, onClick }) => (
    <button
        className="absolute right-40 top-2 z-[1000] bg-white hover:bg-gray-100 shadow-md rounded-lg p-2 flex items-center text-sm font-medium"
        onClick={onClick}
    >
        {show ? 'Masquer la zone' : 'Afficher la zone'}
    </button>
);

export default ZonePanelToggle;