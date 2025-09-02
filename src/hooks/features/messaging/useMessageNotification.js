import { useCallback } from 'react';
import { useNotifications } from '@/context/NotificationContext.jsx';

export default function useMessageNotification() {
    const { showSystemNotification } = useNotifications();

    const showMessageNotification = useCallback((messageData, senderName) => {
        return showSystemNotification(messageData, {
            title: `Message de ${senderName || 'Utilisateur'}`,
            body: messageData.content?.length > 100
                ? `${messageData.content.substring(0, 100)}...`
                : messageData.content,
            tag: `message-${messageData.id}`,
            onClick: () => {
                window.location.hash = '#/messages';
            }
        });
    }, [showSystemNotification]);

    return {
        showMessageNotification
    };
}