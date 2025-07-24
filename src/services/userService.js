import apiClient from '../config/api';

export const userService = {
    // Récupérer le profil utilisateur courant
    getProfile: async () => {
        const { data } = await apiClient.get('/user/profile');
        return data;
    },
    // Mettre à jour le profil (nom, email, téléphone...)
    updateProfile: async (profile) => {
        const { data } = await apiClient.put('/user/profile', profile);
        return data;
    },
    // Mettre à jour l’avatar (upload image)
    updateAvatar: async (avatarFile) => {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const { data } = await apiClient.post('/user/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data;
    }
};