import React from "react";

const MapSkeleton = () => (
    <div className="w-full h-full relative bg-gray-100 rounded-lg overflow-hidden min-h-[480px]">
        {/* Animation de chargement avec gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"></div>

        {/* Simulations d'éléments de carte */}
        <div className="absolute inset-0 p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="h-8 w-32 bg-gray-300 rounded animate-pulse"></div>
                <div className="flex space-x-2">
                    <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
                </div>
            </div>
            {/* Contrôles de zoom simulés */}
            <div className="absolute bottom-20 right-4 space-y-2">
                <div className="w-10 h-10 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-10 h-10 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Chargement de la carte...</p>
                </div>
            </div>
        </div>
    </div>
);

export default MapSkeleton;