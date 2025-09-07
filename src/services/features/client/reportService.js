import ENDPOINTS from "@/services/config/endpoints.js";
import apiClient from "@/services/config/api.js";

export const reportService = {
    generateTaskReport: async (taskId) => {
        try {
            const response = await apiClient.post(ENDPOINTS.CLIENT.REPORT(taskId), {}, {
                responseType: 'blob', 
            });
            
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error('Error generating task report:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Erreur lors de la génération du rapport',
            };
        }
    },
    
    downloadPDF: (blob, filename = 'rapport-tache') => {
        try {
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}.pdf`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
    
            window.URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Error downloading PDF:', error);
            return false;
        }
    }
};
