class VersionedLocalStorage {
    constructor(namespace = 'versioned') {
        this.namespace = namespace;
        this.versionKey = `${namespace}_versions`;
        this.init();
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

    // Set a new key with versioning
    set(key, value) {
        const versionedValue = {
            value: JSON.stringify(value), 
            timestamp: new Date().toISOString(),
        };

        localStorage.setItem(key, JSON.stringify(versionedValue));
        this._saveVersion(key, versionedValue);
    }

    // Get the latest version of the key
    get(key) {
        const item = localStorage.getItem(key);
        if (!item) return null;
        const { value } = JSON.parse(item);
        return JSON.parse(value);
    }

    // Delete a key
    del(key) {
        localStorage.removeItem(key);
        const versions = JSON.parse(localStorage.getItem(this.versionKey)) || {};
        delete versions[key];
        localStorage.setItem(this.versionKey, JSON.stringify(versions));
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
                timestamp: version.timestamp
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