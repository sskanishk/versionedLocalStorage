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
}