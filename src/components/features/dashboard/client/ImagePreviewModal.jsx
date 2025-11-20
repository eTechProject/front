import React, { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { messageService } from '@/services/features/messaging/messageService.js';

/**
 * Image preview modal with zoom and download functionality
 */
export const ImagePreviewModal = ({ attachment, isOpen, onClose }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        if (isOpen && attachment) {
            loadImage();
        } else {
            // Clean up when modal closes
            if (imageUrl && imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(imageUrl);
            }
            setImageUrl(null);
            setScale(1);
            setRotation(0);
            setError(null);
        }
    }, [isOpen, attachment]);

    const loadImage = async () => {
        if (!attachment) return;

        setLoading(true);
        setError(null);

        try {
            const result = await messageService.downloadAttachment(attachment.id);
            
            if (result.success) {
                const blob = new Blob([result.data], { type: attachment.mimeType });
                const url = URL.createObjectURL(blob);
                setImageUrl(url);
            } else {
                setError('Erreur lors du chargement de l\'image');
            }
        } catch (err) {
            console.error('Error loading image:', err);
            setError('Erreur lors du chargement de l\'image');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!attachment) return;

        try {
            const result = await messageService.downloadAttachment(attachment.id);
            
            if (result.success) {
                const blob = new Blob([result.data], { type: attachment.mimeType });
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = attachment.originalFilename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Error downloading image:', err);
        }
    };

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev * 1.2, 3));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev / 1.2, 0.5));
    };

    const handleRotate = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    const handleReset = () => {
        setScale(1);
        setRotation(0);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-6xl max-h-full w-full h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 text-white">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold truncate">
                            {attachment?.originalFilename}
                        </h3>
                        <span className="text-sm text-gray-300">
                            {attachment?.formattedFileSize}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Controls */}
                        <button
                            onClick={handleZoomOut}
                            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition"
                            title="Zoom arrière"
                        >
                            <ZoomOut className="w-5 h-5" />
                        </button>
                        
                        <span className="text-sm text-gray-300 min-w-[4rem] text-center">
                            {Math.round(scale * 100)}%
                        </span>
                        
                        <button
                            onClick={handleZoomIn}
                            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition"
                            title="Zoom avant"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>
                        
                        <button
                            onClick={handleRotate}
                            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition"
                            title="Rotation"
                        >
                            <RotateCw className="w-5 h-5" />
                        </button>
                        
                        <button
                            onClick={handleReset}
                            className="px-3 py-1 text-sm text-white hover:bg-white hover:bg-opacity-20 rounded transition"
                            title="Réinitialiser"
                        >
                            Reset
                        </button>
                        
                        <div className="w-px h-6 bg-gray-500 mx-2" />
                        
                        <button
                            onClick={handleDownload}
                            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition"
                            title="Télécharger"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        
                        <button
                            onClick={onClose}
                            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition"
                            title="Fermer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Image Container */}
                <div className="flex-1 flex items-center justify-center overflow-hidden">
                    {loading && (
                        <div className="text-white text-center">
                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p>Chargement de l'image...</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="text-white text-center">
                            <p className="text-red-400">{error}</p>
                            <button
                                onClick={loadImage}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                Réessayer
                            </button>
                        </div>
                    )}
                    
                    {imageUrl && !loading && !error && (
                        <img
                            src={imageUrl}
                            alt={attachment?.originalFilename}
                            className="max-w-full max-h-full object-contain cursor-move select-none"
                            style={{
                                transform: `scale(${scale}) rotate(${rotation}deg)`,
                                transition: 'transform 0.2s ease'
                            }}
                            onDoubleClick={handleReset}
                            draggable={false}
                        />
                    )}
                </div>
                
                {/* Footer */}
                <div className="p-4 text-center text-gray-400 text-sm">
                    Double-clic pour réinitialiser • Utilisez les contrôles pour zoomer et faire pivoter
                </div>
            </div>

            {/* Click outside to close */}
            <div 
                className="absolute inset-0 -z-10" 
                onClick={onClose}
            />
        </div>
    );
};