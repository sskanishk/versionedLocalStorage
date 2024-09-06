# Versioned LocalStorage
A simple JavaScript library that adds version control and optional TTL (Time-to-Live) for key-value pairs in the browser's localStorage. It allows you to store multiple versions of a key, roll back to previous versions, and expire keys after a specified time.

## Features
- **Versioned Storage:** Keeps track of changes to each key.
- **TTL Support:** Set an expiration time for keys, deleting them once expired.
- **Rollback:** Roll back to any previous version of a key by specifying a timestamp.
- **Simple API:** Provides intuitive methods for setting, getting, and deleting keys with versioning.

## Installation
Simply include the JavaScript file in your project:

`<script src="versionedLocalStorage.js"></script>`


## Usage
### Basic Setup
First, initialize the VersionedLocalStorage:

`const versionedStore = new VersionedLocalStorage();`


### Storing Data with Optional TTL
You can store a key-value pair in localStorage using the set method. Optionally, you can specify a TTL (in seconds), after which the key will expire.

`versionedStore.set('myKey', { name: 'Alice', age: 30 }, 60);  // Expires in 60 Seconds`

If no TTL is provided, the key will remain in localStorage indefinitely (until manually deleted).

### Retrieving Data
You can retrieve a key using the get method. If the key has expired, it will return null and remove it from localStorage.

```
const value = versionedStore.get('myKey');
console.log(value);  // { name: 'Alice', age: 30 }
```

### Rolling Back to a Previous Version
To roll back a key to a previous version, use the rollback method by specifying the key and the version’s timestamp.

```
const timestamp = '2023-09-01T10:30:00.000Z';  // Example timestamp
versionedStore.rollback('myKey', timestamp);
```
This will restore the value of the key to the version stored at the given timestamp.

### Retrieving Version History
You can view all versions of a key using the getAllVersions method:

```
const versions = versionedStore.getAllVersions('myKey');
console.log(versions);
/* 
[
    { value: { name: 'Alice', age: 29 }, timestamp: '2023-09-01T10:30:00.000Z' },
    { value: { name: 'Alice', age: 30 }, timestamp: '2023-09-02T12:00:00.000Z' }
]
*/
```

### Deleting Keys
To delete a key and all of its version history, use the del method:

`versionedStore.del('myKey');`

## Methods
`set(key, value, ttl = null)`
 Stores a key-value pair in localStorage with an optional TTL.
- key: The name of the key.
- value: The value to store (can be an object, string, etc.).
- ttl: Optional. The time-to-live for the key, in seconds.


`get(key)`
 Retrieves the latest value of a key. If the key has expired, it returns null and deletes the key.
- key: The name of the key to retrieve.

`getAllVersions(key)`
 Returns an array of all versions of the key.
- key: The name of the key.

`rollback(key, timestamp)`
 Restores the key's value to the version at the specified timestamp.
- key: The name of the key.
- timestamp: The timestamp of the version to restore.

`del(key)`
 Deletes the key and its version history from localStorage.
- key: The name of the key to delete.

## Contributing
Contributions are welcome! If you have any ideas or find bugs, feel free to open an issue or submit a pull request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

