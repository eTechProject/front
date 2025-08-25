const ENDPOINTS = {
    USER: {
        PROFILE: (userId) => `/users/${userId}`,
        UPDATE_PROFILE: (userId) => `/users/${userId}`,
        UPDATE_PASSWORD: (userId) => `/users/${userId}/password`,
        AVATAR: '/users/upload-picture',
    },
    AGENT: {
        GET_TASKS_MESSAGE: (agentId) => `/agent/${agentId}/assigned-tasks`,
        LOCATIONS: (agentId) => `/agent/${agentId}/locations`,
    },
    ZONE: {
        SEND: '/client/service-orders',
        GET_BY_CLIENT: (clientId) => `/client/${clientId}/map-data`,
        GET_BY_AGENT: (agentId) => `/agent/${agentId}/map-data`,
    },
    PASSWORD: {
        REQUEST_RESET: '/public/request-reset-password',
        RESET: '/public/reset-password',
    },
    AUTH: {
        REGISTER: '/register',
        LOGIN: '/login_check',
    },
    ADMIN: {
        AGENTS: {
            LIST: '/admin/agents',
            DETAIL: id => `/admin/agents/${id}`,
            CREATE: '/admin/agents',
            SEARCH: '/admin/agents/search',
            AGENT_TASKS: id => `/admin/agent-tasks/${id}`,
        },
        CLIENTS: {
            LIST: '/admin/clients',
            DETAIL: id => `/admin/clients/${id}`,
            CREATE: '/admin/clients',
            SEARCH: '/admin/clients-search',
        },
        PACKS: {
            LIST: '/public/pack',
            DETAIL: id => `/admin/pack/${id}`,
            PUBLIC_DETAIL: id => `/public/pack/${id}`,
            CREATE: '/admin/pack',
        },
        PAYMENTS: {
            LIST: '/admin/payments',
            DETAIL: id => `/admin/payments/${id}`,
            UPDATE_STATUS: id => `/admin/payment/${id}/status`,
        },
        PAYMENT_HISTORY: {
            LIST: '/admin/payment-history',
        },
    },
    ASSIGNMENT: {
        ASSIGN_AGENT: '/client/assign-agents',
        GET_AVAILABLE_AGENTS: 'client/available-agents',
    },
    MESSAGE: {
        SEND: '/messages',
        GET: encryptedOrderId => `/messages/${encryptedOrderId}`,
        SEND_GROUP: '/messages/multi',
        CONVERSATION: (senderId, receiverId) =>
            `/messages/conversation?sender_id=${senderId}&receiver_id=${receiverId}`,
        MERCURE_TOKEN: '/messages/mercure-token',
    },
    CLIENT: {
        DASHBOARD: (clientId) => `/client/${clientId}/dashboard`,
    },
};

export default ENDPOINTS;