/**
 * Generates a consistent conversation topic for Mercure
 * by sorting user IDs to ensure same topic regardless of order
 *
 * @param {string} currentUserEncryptedId - ID of the current user
 * @param {string} otherUserEncryptedId - ID of the other user
 * @returns {string} The formatted topic string
 */
export default function generateConversationTopic(currentUserEncryptedId, otherUserEncryptedId) {
    if (!currentUserEncryptedId || !otherUserEncryptedId) {
        console.error('Missing user IDs for conversation topic generation');
        return null;
    }

    // Sort IDs to ensure consistent topic regardless of user order
    const encryptedIds = [currentUserEncryptedId, otherUserEncryptedId].sort();

    // Return formatted topic
    return `chat/conversation/${encryptedIds[0]}-${encryptedIds[1]}`;
}