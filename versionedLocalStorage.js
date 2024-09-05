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
    saveVersion(key, value) {
        const versions = JSON.parse(localStorage.getItem(this.versionKey)) || {};
        if (!versions[key]) {
            versions[key] = [];
        }

        const timestamp = new Date().toISOString();
        versions[key].push({ timestamp, value });

        localStorage.setItem(this.versionKey, JSON.stringify(versions));
    }

    // Set a new key with versioning
    set(key, value) {
        const versionedValue = {
            value: JSON.stringify(value), 
            timestamp: new Date().toISOString(),
        };

        localStorage.setItem(key, JSON.stringify(versionedValue));
        this.saveVersion(key, versionedValue);
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
    getVersionHistory(key) {
        const versions = JSON.parse(localStorage.getItem(this.versionKey)) || {};
        return versions[key] || [];
    }

    // Get the all versions history of a particular key
    getAllVersions(key) {
        const history = this.getVersionHistory(key)
        if (history.length > 0) {
            return history.map(version => ({
                value: typeof version.value === 'string' ? JSON.parse(version.value) : version.value,
                timestamp: version.timestamp
            }));
        }
        return [];
    }
}