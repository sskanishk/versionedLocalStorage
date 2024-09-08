// worker.js

// Store expirations in memory within the Web Worker
const expirationTimers = {};

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
    const { key, ttl } = event.data;

    // If TTL is provided, set up a timeout for expiration
    if (ttl) {
        const expirationTime = Date.now() + ttl * 1000;
        expirationTimers[key] = expirationTime;

        setTimeout(() => {
            self.postMessage({ key, expired: true });
            delete expirationTimers[key]; // Clean up after expiration
        }, ttl * 1000);
    }
});

// Handle requests for checking expirations
setInterval(() => {
    const now = Date.now();
    Object.keys(expirationTimers).forEach(key => {
        if (expirationTimers[key] < now) {
            self.postMessage({ key, expired: true });
            delete expirationTimers[key]; // Clean up expired timers
        }
    });
}, 1000);
