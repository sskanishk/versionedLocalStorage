class VersionedLocalStorage {
    constructor(namespace = 'versioned') {
        this.namespace = namespace;
        this.versionKey = `${namespace}_versions`;
        this.init();

        // Initialize the Web Worker for handling expiration
        this.worker = new Worker('worker.js');

        // Listen for messages from the worker about expired keys
        this.worker.addEventListener('message', (event) => {
            if (event.data.expired) {
                this.del(event.data.key);
            }
        });
    }
    

    // Initialize the version storage if not present
    init() {
        if (!localStorage.getItem(this.versionKey)) {
            localStorage.setItem(this.versionKey, JSON.stringify({}));
        }
    }


    // Save a new version of the key
    _saveVersion(key, value) {
        const versions = JSON.parse(localStorage.getItem(this.versionKey)) || {};
        if (!versions[key]) {
            versions[key] = [];
        }
        const timestamp = new Date().toISOString();
        versions[key].push({ timestamp, value });
        localStorage.setItem(this.versionKey, JSON.stringify(versions));
    }


    // Parse value in json only if it is string 
    _parseIfString(value) {
        let checkValue = typeof value === 'string' ? JSON.parse(value) : value;
        console.log("checkValue", checkValue)
        if(typeof value === 'string') {
            return JSON.parse(value)
        } else {
            return value
        }
    }


    _isKeyExpired(key, storedItem) {
        if (storedItem.ttl && Date.now() > storedItem.ttl) {
            // console.log("here")
            this.del(key);  // Remove the expired key
            return true;
        } else {
            return false;
        }
    }


    // Set a new key with versioning and TTL
    set(key, value, ttl=null) {
        const versionedValue = {
            value: JSON.stringify(value), 
            timestamp: new Date().toISOString(),
            ttl: ttl ? Date.now() + ttl * 1000 : null
        };
        localStorage.setItem(key, JSON.stringify(versionedValue));
        this._saveVersion(key, versionedValue);

        // Send a message to the worker to track TTL if provided
        if (ttl) {
            this.worker.postMessage({ key, ttl });
        }
    }


    // Get the latest version of the key
    get(key) {
        const storedItemJSON = localStorage.getItem(key);
        if (!storedItemJSON) return null;
        const storedItem = JSON.parse(storedItemJSON) || {};
        if (this._isKeyExpired(key, storedItem)) return null;
        const { value } = storedItem;
        return JSON.parse(value);
    }


    // Delete a key
    del(key) {
        console.log("Here Del")
        localStorage.removeItem(key);
        const versions = JSON.parse(localStorage.getItem(this.versionKey)) || {};
        if(versions[key]) {
            delete versions[key];
            localStorage.setItem(this.versionKey, JSON.stringify(versions));
            return true;
        } else {
            return false;
        }
    }


    // Get the version history of a particular key
    _getVersionHistory(key) {
        const versions = JSON.parse(localStorage.getItem(this.versionKey)) || {};
        return versions[key] || [];
    }


    // Get the all versions history of a particular key
    getAllVersions(key) {
        const history = this._getVersionHistory(key)
        if (history.length > 0) {
            return history.map(version => ({
                value: this._parseIfString(version.value),
                timestamp: version.timestamp,
                ttl: version.ttl,
            }));
        }
        return [];
    }


    // Rollback to a specific version based on timestamp
    rollback(key, timestamp) {
        const history = this._getVersionHistory(key);
        // console.log("history ", history);
        const version = history.find(v => v.timestamp === timestamp);
        // console.log("version ", version);
        if (version) {
            const value = this._parseIfString(version.value);
            this.set(key, value);
            return value;
        } else {
            throw new Error('Version not found.');
        }
    }
}