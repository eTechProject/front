const ENDPOINTS = {
    USER: {
        PROFILE: '/user/profile',
        AVATAR: '/user/avatar',
    },
    AGENT: {
        GET_TASKS_MESSAGE: (agentId) => `/agent/${agentId}/assigned-tasks`,
    },
    ZONE: {
        SEND: '/service-orders',
        GET_BY_CLIENT: (clientId) => `/client/${clientId}/map-data`,
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
            LIST: 'admin/agents',
            DETAIL: id => `admin/agents/${id}`,
            CREATE: 'admin/agents',
            SEARCH: 'admin/agents/search'
        }
    },
    ASSIGNMENT: {
        ASSIGN_AGENT: '/client/assign-agents',
        GET_AVAILABLE_AGENTS: 'client/available-agents',
    },
    MESSAGE: {
        SEND: '/messages',
        GET: encryptedOrderId => `/messages/${encryptedOrderId}`,
        CONVERSATION: (senderId, receiverId) =>
            `/messages/conversation?sender_id=${senderId}&receiver_id=${receiverId}`,
        MERCURE_TOKEN: '/messages/mercure-token',
    }

};

export default ENDPOINTS;