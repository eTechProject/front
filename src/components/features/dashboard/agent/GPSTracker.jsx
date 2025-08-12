import React, { useContext } from 'react';
import { MapPin } from 'lucide-react';
import { GeolocationContext } from '@/context/GeolocationContext.jsx';

const GPSTracker = () => {
    const { location, error, isActive, toggleTracking } = useContext(GeolocationContext);

    return (
        <div className="h-full flex items-center justify-center p-8">
            <style>
                {`
                    @keyframes ping {
                        75%, 100% {
                            transform: scale(2);
                            opacity: 0;
                        }
                    }
                    .animate-ping {
                        animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                    }
                `}
            </style>
            <div className="flex flex-col items-center space-y-8">
                {/* Bouton principal avec effets */}
                <div className="relative">
                    {/* Ondes de pulse */}
                    {isActive && (
                        <>
                            <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-ping"
                                 style={{ animationDuration: '2s' }}></div>
                            <div className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping"
                                 style={{ animationDuration: '1.5s', animationDelay: '0.5s' }}></div>
                        </>
                    )}

                    {/* Bouton */}
                    <button
                        onClick={toggleTracking}
                        className={`relative w-24 h-24 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                            isActive
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-red-500 hover:bg-red-600'
                        }`}
                    >
                        <MapPin className="w-8 h-8 text-white mx-auto" />
                    </button>
                </div>

                {/* État */}
                <div className="text-center">
                    <div className={`text-sm font-medium ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                        {isActive ? 'TRACKING' : 'STOPPED'}
                    </div>

                    {location && isActive && (
                        <div className="text-xs text-gray-500 mt-2 space-y-1">
                            <div>{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</div>
                            <div>±{location.accuracy?.toFixed(0)}m</div>
                        </div>
                    )}
                </div>

                {/* Erreur */}
                {error && (
                    <div className="text-xs text-red-500 text-center max-w-xs">
                        {error}
                    </div>
                )}

                <div className="text-xs text-gray-400 text-center max-w-xs">
                    Cliquez pour démarrer/arrêter le suivi GPS
                    <br />
                    <span className="text-gray-300">Coordonnées visibles dans la console</span>
                </div>
            </div>
        </div>
    );
};

export default GPSTracker;