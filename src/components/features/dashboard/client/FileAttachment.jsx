import React, { useState, useRef } from 'react';
import { Paperclip, X, Image, FileText, Download } from 'lucide-react';
import { 
    validateFiles, 
    formatFileSize, 
    createFilePreview, 
    revokeFilePreview, 
    isImageFile 
} from '@/utils/fileValidation.js';

/**
 * File attachment input component with preview
 */
export const FileAttachmentInput = ({ onFilesChange, disabled = false }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState({});
    const [errors, setErrors] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const { validFiles, errors: validationErrors } = validateFiles(files);
        
        setErrors(validationErrors);
        
        if (validFiles.length > 0) {
            // Create previews for images
            const newPreviews = {};
            validFiles.forEach((file, index) => {
                const previewUrl = createFilePreview(file);
                if (previewUrl) {
                    newPreviews[`${file.name}-${index}`] = previewUrl;
                }
            });

            setSelectedFiles(prev => [...prev, ...validFiles]);
            setPreviews(prev => ({ ...prev, ...newPreviews }));
            onFilesChange([...selectedFiles, ...validFiles]);
        }

        // Clear input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (fileIndex) => {
        const fileToRemove = selectedFiles[fileIndex];
        const previewKey = `${fileToRemove.name}-${fileIndex}`;
        
        // Clean up preview URL
        if (previews[previewKey]) {
            revokeFilePreview(previews[previewKey]);
        }

        const newFiles = selectedFiles.filter((_, index) => index !== fileIndex);
        const newPreviews = { ...previews };
        delete newPreviews[previewKey];

        setSelectedFiles(newFiles);
        setPreviews(newPreviews);
        onFilesChange(newFiles);
    };

    const clearAllFiles = () => {
        // Clean up all preview URLs
        Object.values(previews).forEach(url => revokeFilePreview(url));
        
        setSelectedFiles([]);
        setPreviews({});
        setErrors([]);
        onFilesChange([]);
    };

    // Clean up on unmount
    React.useEffect(() => {
        return () => {
            Object.values(previews).forEach(url => revokeFilePreview(url));
        };
    }, []);

    return (
        <div className="space-y-3">
            {/* File Input Button */}
            <div className="flex items-center gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    disabled={disabled}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Paperclip className="w-4 h-4" />
                    <span className="text-sm">Joindre des fichiers</span>
                </button>
                
                {selectedFiles.length > 0 && (
                    <button
                        type="button"
                        onClick={clearAllFiles}
                        disabled={disabled}
                        className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                        Tout supprimer
                    </button>
                )}
            </div>

            {/* Validation Errors */}
            {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-800 mb-2">Erreurs de validation :</p>
                    <ul className="text-sm text-red-700 space-y-1">
                        {errors.map((error, index) => (
                            <li key={index} className="flex items-start gap-1">
                                <span>•</span>
                                <span>
                                    {error.file && <strong>{error.file}:</strong>} {error.error}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* File Previews */}
            {selectedFiles.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                            {selectedFiles.length} fichier{selectedFiles.length > 1 ? 's' : ''} sélectionné{selectedFiles.length > 1 ? 's' : ''}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedFiles.map((file, index) => {
                            const previewKey = `${file.name}-${index}`;
                            const previewUrl = previews[previewKey];
                            
                            return (
                                <FilePreviewCard
                                    key={previewKey}
                                    file={file}
                                    previewUrl={previewUrl}
                                    onRemove={() => removeFile(index)}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Individual file preview card
 */
const FilePreviewCard = ({ file, previewUrl, onRemove }) => {
    const isImage = isImageFile(file.type);

    return (
        <div className="relative bg-white border border-gray-200 rounded-lg p-3 group">
            <div className="flex items-start gap-3">
                {/* File Icon/Preview */}
                <div className="flex-shrink-0">
                    {isImage && previewUrl ? (
                        <img
                            src={previewUrl}
                            alt={file.name}
                            className="w-12 h-12 object-cover rounded border"
                        />
                    ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                            {isImage ? (
                                <Image className="w-6 h-6 text-gray-400" />
                            ) : (
                                <FileText className="w-6 h-6 text-gray-400" />
                            )}
                        </div>
                    )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                    </p>
                </div>

                {/* Remove Button */}
                <button
                    type="button"
                    onClick={onRemove}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 rounded transition opacity-0 group-hover:opacity-100"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

/**
 * Component to display attachments in messages
 */
export const MessageAttachments = ({ attachments, onImageClick }) => {
    if (!attachments || attachments.length === 0) {
        return null;
    }

    // Separate images from other files - check multiple possible fields
    const images = attachments.filter(att => {
        return att.attachmentType === 'image' || 
               att.mimeType?.startsWith('image/') ||
               att.type?.startsWith('image/') ||
               att.contentType?.startsWith('image/');
    });
    
    const otherFiles = attachments.filter(att => {
        const isImage = att.attachmentType === 'image' || 
                       att.mimeType?.startsWith('image/') ||
                       att.type?.startsWith('image/') ||
                       att.contentType?.startsWith('image/');
        return !isImage;
    });

    return (
        <div className="mt-2 space-y-2">
            {/* Display images directly */}
            {images.map((attachment) => (
                <ImageAttachment 
                    key={attachment.id} 
                    attachment={attachment}
                    onImageClick={onImageClick}
                />
            ))}
            
            {/* Display other files as clickable items */}
            {otherFiles.map((attachment) => (
                <AttachmentItem 
                    key={attachment.id} 
                    attachment={attachment}
                    onImageClick={onImageClick}
                />
            ))}
        </div>
    );
};

// Global cache for loaded images to prevent reloading
const imageCache = new Map();

/**
 * Component to display images directly in messages
 */
const ImageAttachment = ({ attachment, onImageClick }) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageSrc, setImageSrc] = React.useState(() => {
        // Check cache first
        return imageCache.get(attachment.id) || null;
    });
    
    const handleClick = () => {
        if (onImageClick) {
            onImageClick(attachment);
        }
    };

    // Create proper image URL with base API URL and authorization - only run once per attachment
    React.useEffect(() => {
        // Check if we already have this image in cache
        const cachedImage = imageCache.get(attachment.id);
        if (cachedImage) {
            setImageSrc(cachedImage);
            return;
        }

        // Only load if we don't have an image yet and there's no error
        if (imageSrc || imageError) {
            return;
        }

        const loadImage = async () => {
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173/api';
                const token = localStorage.getItem('token');
                
                // Build the full URL
                let imageUrl;
                if (attachment.downloadUrl) {
                    imageUrl = attachment.downloadUrl.startsWith('http') 
                        ? attachment.downloadUrl 
                        : `${API_BASE_URL}${attachment.downloadUrl}`;
                } else {
                    imageUrl = `${API_BASE_URL}/messages/attachments/${attachment.id}`;
                }

                // Fetch the image with proper authorization
                const response = await fetch(imageUrl, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                    }
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const objectUrl = URL.createObjectURL(blob);
                    
                    // Cache the image
                    imageCache.set(attachment.id, objectUrl);
                    setImageSrc(objectUrl);
                } else {
                    setImageError(true);
                }
            } catch (error) {
                setImageError(true);
            }
        };

        loadImage();
    }, [attachment.id]); // Only depend on attachment ID - this won't change for the same message

    // No cleanup needed since we're caching globally

    if (imageError) {
        return (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg cursor-pointer"
                 onClick={handleClick}>
                <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                    <Image className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-red-700">Impossible de charger l'image</p>
                    <p className="text-xs text-red-600">{attachment.originalFilename || attachment.filename || 'Image'}</p>
                </div>
                <Download className="w-4 h-4 text-red-500" />
            </div>
        );
    }

    if (!imageSrc) {
        return (
            <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">Chargement de l'image...</p>
                    <p className="text-xs text-gray-500">{attachment.originalFilename || attachment.filename || 'Image'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-1 max-w-sm">
            <img
                src={imageSrc}
                alt={attachment.originalFilename || attachment.filename || 'Image'}
                className="rounded-lg cursor-pointer hover:opacity-90 transition-opacity max-w-full h-auto border border-gray-200 shadow-sm"
                onClick={handleClick}
                onError={(e) => {
                    console.error('❌ Failed to display image blob');
                    setImageError(true);
                }}
                onLoad={() => {
                    console.log('✅ Successfully displayed image');
                }}
                style={{ maxHeight: '300px', objectFit: 'contain' }}
            />
            <p className="text-xs text-gray-500 mt-1">
                {attachment.originalFilename || attachment.filename || 'Image'}
            </p>
        </div>
    );
};

/**
 * Individual attachment item
 */
const AttachmentItem = ({ attachment, onImageClick }) => {
    const isImage = attachment.attachmentType === 'image';

    const handleClick = () => {
        if (isImage && onImageClick) {
            onImageClick(attachment);
        } else {
            // Download file
            window.open(attachment.downloadUrl, '_blank');
        }
    };

    return (
        <div 
            className={`flex items-center gap-2 p-2 bg-black bg-opacity-5 rounded-lg border cursor-pointer hover:bg-opacity-10 transition ${
                isImage ? 'hover:border-blue-300' : 'hover:border-gray-300'
            }`}
            onClick={handleClick}
        >
            {/* File Icon/Thumbnail */}
            <div className="flex-shrink-0">
                {isImage ? (
                    <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center">
                        <Image className="w-5 h-5 text-gray-600" />
                    </div>
                ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center">
                        <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">
                    {attachment.originalFilename}
                </p>
                <p className="text-xs text-gray-600">
                    {attachment.formattedFileSize}
                </p>
            </div>

            {/* Download Icon */}
            <div className="flex-shrink-0">
                <Download className="w-4 h-4 text-gray-500" />
            </div>
        </div>
    );
};