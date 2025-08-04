const ENDPOINTS = {
    USER: {
        PROFILE: '/user/profile',
        AVATAR: '/user/avatar',
    },
    AGENT: {
        LIST: '/public/agents',
        DETAIL: id => `/public/agents/${id}`, // GET, PUT, DELETE pour un agent
        CREATE: '/public/agents',
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
    }
};

export default ENDPOINTS;