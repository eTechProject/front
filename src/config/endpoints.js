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
        GET_BY_CLIENT: (clientId) => `/service-orders/client/${clientId}`,
    },
    PASSWORD: {
        REQUEST_RESET: '/public/request-reset-password',
        RESET: '/public/reset-password',
    },
    AUTH: {
        REGISTER: '/register',
        LOGIN: '/login_check',
    }
};

export default ENDPOINTS;