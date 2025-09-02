// Utility to generate a Mercure topic for notifications for a specific user
// Example: generateNotifTopic(42) => '/users/42/notification'

export default function generateNotifTopic(userId) {
    if (!userId) throw new Error('userId is required');
    return `/users/${userId}/notifications`;
}
