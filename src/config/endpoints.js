const ENDPOINTS = {
    USER: {
        PROFILE: '/user/profile',
        AVATAR: '/user/avatar',
    },
    AGENT: {
        LIST: '/public/agents',
        DETAIL: id => `/public/agents/${id}`,
        CREATE: '/public/agents',
    },
    ZONE: {
        SEND: '/service-orders',
        GET_BY_CLIENT: (clientId) => `/service-orders/client/${clientId}`,
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
    }
};

export default ENDPOINTS;