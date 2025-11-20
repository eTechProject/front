// File constraints and validation utilities for message attachments
export const FILE_CONSTRAINTS = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10, // Maximum files per message
    allowedMimeTypes: [
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'image/gif', 
        'image/webp',
        'application/pdf', 
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ],
    allowedExtensions: [
        '.jpg', '.jpeg', '.png', '.gif', '.webp',
        '.pdf', '.doc', '.docx', '.txt'
    ]
};

export const FILE_TYPES = {
    image: {
        mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
        maxSize: '10MB'
    },
    document: {
        mimeTypes: [
            'application/pdf', 
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ],
        extensions: ['.pdf', '.doc', '.docx', '.txt'],
        maxSize: '10MB'
    }
};

/**
 * Validate a single file against constraints
 * @param {File} file - The file to validate
 * @returns {Object} - {isValid: boolean, error: string}
 */
export const validateFile = (file) => {
    if (!file) {
        return { isValid: false, error: 'No file provided' };
    }

    // Check file size
    if (file.size > FILE_CONSTRAINTS.maxFileSize) {
        return { 
            isValid: false, 
            error: `File size exceeds ${formatFileSize(FILE_CONSTRAINTS.maxFileSize)} limit`,
            code: 'FILE_TOO_LARGE'
        };
    }

    // Check MIME type
    if (!FILE_CONSTRAINTS.allowedMimeTypes.includes(file.type)) {
        return { 
            isValid: false, 
            error: 'File type not supported',
            code: 'INVALID_FILE_TYPE'
        };
    }

    // Check file extension
    const fileExtension = getFileExtension(file.name);
    if (!FILE_CONSTRAINTS.allowedExtensions.includes(fileExtension)) {
        return { 
            isValid: false, 
            error: 'File extension not supported',
            code: 'INVALID_FILE_EXTENSION'
        };
    }

    return { isValid: true };
};

/**
 * Validate multiple files
 * @param {FileList} files - The files to validate
 * @returns {Object} - {validFiles: Array, errors: Array}
 */
export const validateFiles = (files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const errors = [];

    // Check maximum number of files
    if (fileArray.length > FILE_CONSTRAINTS.maxFiles) {
        return {
            validFiles: [],
            errors: [{
                error: `Maximum ${FILE_CONSTRAINTS.maxFiles} files allowed`,
                code: 'TOO_MANY_FILES'
            }]
        };
    }

    fileArray.forEach((file) => {
        const validation = validateFile(file);
        if (validation.isValid) {
            validFiles.push(file);
        } else {
            errors.push({
                file: file.name,
                ...validation
            });
        }
    });

    return { validFiles, errors };
};

/**
 * Get file extension from filename
 * @param {string} filename 
 * @returns {string}
 */
export const getFileExtension = (filename) => {
    return filename.toLowerCase().substring(filename.lastIndexOf('.'));
};

/**
 * Format file size to human readable format
 * @param {number} bytes 
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get attachment type based on MIME type
 * @param {string} mimeType 
 * @returns {string}
 */
export const getAttachmentType = (mimeType) => {
    if (FILE_TYPES.image.mimeTypes.includes(mimeType)) {
        return 'image';
    }
    if (FILE_TYPES.document.mimeTypes.includes(mimeType)) {
        return 'document';
    }
    return 'unknown';
};

/**
 * Check if file is an image
 * @param {string} mimeType 
 * @returns {boolean}
 */
export const isImageFile = (mimeType) => {
    return FILE_TYPES.image.mimeTypes.includes(mimeType);
};

/**
 * Create file preview URL
 * @param {File} file 
 * @returns {string}
 */
export const createFilePreview = (file) => {
    if (isImageFile(file.type)) {
        return URL.createObjectURL(file);
    }
    return null;
};

/**
 * Clean up file preview URL
 * @param {string} url 
 */
export const revokeFilePreview = (url) => {
    if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
};