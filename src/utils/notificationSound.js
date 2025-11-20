// Notification sound utility
let notificationAudio = null;

// Initialize audio element
const initNotificationSound = () => {
    if (!notificationAudio) {
        // Using a data URL for a simple notification beep sound
        // This is a pleasant notification sound (440Hz for 0.1s + 550Hz for 0.1s)
        notificationAudio = new Audio();
        
        // Create a simple beep using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        return {
            play: () => {
                const oscillator1 = audioContext.createOscillator();
                const oscillator2 = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator1.connect(gainNode);
                oscillator2.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // First tone (440 Hz - A4)
                oscillator1.frequency.value = 440;
                oscillator1.type = 'sine';
                
                // Second tone (554 Hz - C#5) for harmony
                oscillator2.frequency.value = 554;
                oscillator2.type = 'sine';
                
                // Volume envelope
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                
                oscillator1.start(audioContext.currentTime);
                oscillator2.start(audioContext.currentTime);
                oscillator1.stop(audioContext.currentTime + 0.2);
                oscillator2.stop(audioContext.currentTime + 0.2);
            }
        };
    }
    return notificationAudio;
};

export const playNotificationSound = () => {
    try {
        const sound = initNotificationSound();
        sound.play();
    } catch (error) {
        console.warn('Could not play notification sound:', error);
    }
};

// Alternative: Use a simple notification sound from a public CDN or create your own
export const playNotificationSoundFromURL = (url) => {
    try {
        const audio = new Audio(url);
        audio.volume = 0.5;
        audio.play().catch(err => console.warn('Could not play sound:', err));
    } catch (error) {
        console.warn('Could not play notification sound:', error);
    }
};
