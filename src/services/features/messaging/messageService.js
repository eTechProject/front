import ENDPOINTS from "@/services/config/endpoints.js";
import apiClient from "@/services/config/api.js";

export const messageService = {
    sendMessage: async (messageData, files = []) => {
        try {
            let response;
            
            // If there are files, use multipart/form-data
            if (files && files.length > 0) {
                console.log('📁 Sending message with files:', {
                    fileCount: files.length,
                    files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
                    messageData
                });
                
                const formData = new FormData();
                
                // Add message data fields
                Object.keys(messageData).forEach(key => {
                    if (messageData[key] !== undefined && messageData[key] !== null) {
                        formData.append(key, messageData[key]);
                        console.log(`📝 Added field: ${key} = ${messageData[key]}`);
                    }
                });
                
                // Add files
                files.forEach((file, index) => {
                    formData.append('files[]', file);
                    console.log(`📎 Added file ${index}: ${file.name} (${file.size} bytes, ${file.type})`);
                });
                
                // Debug FormData contents
                console.log('📋 FormData entries:');
                for (let [key, value] of formData.entries()) {
                    if (value instanceof File) {
                        console.log(`  ${key}: File(${value.name}, ${value.size}B, ${value.type})`);
                    } else {
                        console.log(`  ${key}: ${value}`);
                    }
                }
                
                // Complete FormData structure for regular messages
                console.log('📋 COMPLETE REGULAR MESSAGE FORMDATA STRUCTURE:');
                console.log(formData);
                
                response = await apiClient.post(ENDPOINTS.MESSAGE.SEND, formData);
                console.log('✅ Response from server:', response.data);
                
                // Check if response has attachments
                if (response.data && response.data.attachments) {
                    console.log('📎 Attachments in response:', response.data.attachments);
                } else {
                    console.warn('⚠️ No attachments found in response. Response structure:', Object.keys(response.data || {}));
                }
            } else {
                // Traditional JSON request
                console.log('💬 Sending text-only message:', messageData);
                response = await apiClient.post(ENDPOINTS.MESSAGE.SEND, messageData);
                console.log('✅ Response from server:', response.data);
            }
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                statusCode: error.response?.status,
                error: error.response?.data?.error || 'Erreur lors de l\'envoi du message'
            };
        }
    },

    sendGroupMessage: async (messageData, files = []) => {
        try {
            let response;
            
            console.log('👥 Sending group message:', { messageData, files: files?.length || 0 });
            
            // Validate group message data
            if (!messageData.receiver_ids || !Array.isArray(messageData.receiver_ids) || messageData.receiver_ids.length === 0) {
                console.error('❌ Group message missing receiver_ids array');
                return {
                    success: false,
                    error: 'Group message must have receiver_ids array'
                };
            }
            
            if (!messageData.content?.trim() && (!files || files.length === 0)) {
                console.error('❌ Group message has no content and no files');
                return {
                    success: false,
                    error: 'Group message must have either text content or file attachments'
                };
            }
            
            // If there are files, use multipart/form-data
            if (files && files.length > 0) {
                console.log('📁 Sending group message with files:', {
                    fileCount: files.length,
                    files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
                    messageData
                });
                
                const formData = new FormData();
                
                // Add message data fields
                Object.keys(messageData).forEach(key => {
                    if (messageData[key] !== undefined && messageData[key] !== null) {
                        // Handle array fields (like receiver_ids)
                        if (Array.isArray(messageData[key])) {
                            messageData[key].forEach((item, index) => {
                                formData.append(`${key}[${index}]`, String(item));
                                console.log(`📝 Added array field: ${key}[${index}] = ${item}`);
                            });
                        } else {
                            formData.append(key, String(messageData[key]));
                            console.log(`📝 Added field: ${key} = ${messageData[key]}`);
                        }
                    }
                });
                
                // Add files
                files.forEach((file, index) => {
                    formData.append('files[]', file);
                    console.log(`📎 Added file ${index}: ${file.name} (${file.size} bytes, ${file.type})`);
                });
                
                // Debug FormData contents
                console.log('📋 Group FormData entries:');
                let entryCount = 0;
                for (let [key, value] of formData.entries()) {
                    entryCount++;
                    if (value instanceof File) {
                        console.log(`  ${key}: File(${value.name}, ${value.size}B, ${value.type})`);
                    } else {
                        console.log(`  ${key}: ${value}`);
                    }
                }
                
                console.log(`📊 Total FormData entries: ${entryCount}`);
                console.log(`🔧 FormData instanceof FormData: ${formData instanceof FormData}`);
                
                if (entryCount === 0) {
                    console.error('❌ GROUP MESSAGE FormData is empty! This will cause empty request body error');
                    return {
                        success: false,
                        error: 'FormData is empty - no data to send'
                    };
                }
                
                console.log('🚀 About to send GROUP MESSAGE FormData request to:', ENDPOINTS.MESSAGE.SEND_GROUP);
                
                // Complete FormData structure
                console.log('📋 COMPLETE GROUP FORMDATA STRUCTURE:');
                console.log(formData);
                
                response = await apiClient.post(ENDPOINTS.MESSAGE.SEND_GROUP, formData);
                console.log('✅ Group message response:', response.data);
            } else {
                // Traditional JSON request
                console.log('💬 Sending text-only group message:', messageData);
                response = await apiClient.post(ENDPOINTS.MESSAGE.SEND_GROUP, messageData);
                console.log('✅ Group message response:', response.data);
            }
            
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                statusCode: error.response?.status,
                error: error.response?.data?.error || 'Erreur lors de l\'envoi du message groupé'
            };
        }
    },

    getMessages: async (encryptedOrderId, params = {}) => {
        try {
            const url = ENDPOINTS.MESSAGE.GET(encryptedOrderId);
            const response = await apiClient.get(url, { params });
            return {
                success: true,
                messages: response.data,
                ...response.pagination,
            };
        } catch (error) {
            return {
                success: false,
                statusCode: error.response?.status,
                error: error.response?.data?.error || 'Erreur lors de la récupération des messages'
            };
        }
    },
    getConversationMessages: async (senderId, receiverId, params = {}) => {
        try {
            const url = ENDPOINTS.MESSAGE.CONVERSATION(senderId, receiverId);
            const response = await apiClient.get(url, { params });
            return {
                success: true,
                messages: response.data,
                ...response.pagination,
            };
        } catch (error) {
            return {
                success: false,
                statusCode: error.response?.status,
                error: error.response?.data?.error || 'Erreur lors de la récupération des messages de la conversation'
            };
        }
    },
    getMercureToken: async () => {
        try {
            const response = await apiClient.get(ENDPOINTS.MESSAGE.MERCURE_TOKEN);
            return {
                success: true,
                token: response.data.mercureToken,
                topics: response.data.topics,
                expires_in: response.data.expires_in,
            };
        } catch (error) {
            return {
                success: false,
                statusCode: error.response?.status,
                error: error.response?.data?.error || 'Erreur lors de la récupération du token Mercure'
            };
        }
    },

    downloadAttachment: async (attachmentId) => {
        try {
            const response = await apiClient.get(
                `/messages/attachments/${attachmentId}`,
                {
                    responseType: 'blob',
                }
            );
            return {
                success: true,
                data: response.data,
                headers: response.headers,
            };
        } catch (error) {
            return {
                success: false,
                statusCode: error.response?.status,
                error: error.response?.data?.error || 'Erreur lors du téléchargement du fichier'
            };
        }
    }
};