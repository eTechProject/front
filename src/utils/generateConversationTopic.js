/**
 * Generates a consistent conversation topic for Mercure
 * by sorting user IDs to ensure same topic regardless of order
 *
 * @param {string} currentUserId - ID of the current user
 * @param {string} otherUserId - ID of the other user
 * @returns {string} The formatted topic string
 */
export default function generateConversationTopic(currentUserId, otherUserId) {
    if (!currentUserId || !otherUserId) {
        console.error('Missing user IDs for conversation topic generation');
        return null;
    }

    console.log('Generating topic with IDs:', { currentUserId, otherUserId });

    // Sort IDs to ensure consistent topic regardless of user order
    const userIds = [currentUserId, otherUserId].sort();

    // Return formatted topic
    const topic = `chat/conversation/${userIds[0]}-${userIds[1]}`;
    console.log('Generated topic:', topic);
    return topic;
}