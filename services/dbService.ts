// A simple IndexedDB wrapper service
const DB_NAME = 'NexusAI-Memory';
const DB_VERSION = 1;
export const STORES = ['appState', 'tools', 'toolchains', 'behaviors', 'archivedTraces', 'constitutions', 'systemDirectives', 'userKeywords'];

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const dbInstance = (event.target as IDBOpenDBRequest).result;
            STORES.forEach(storeName => {
                if (!dbInstance.objectStoreNames.contains(storeName)) {
                    // Use 'id' as the keyPath for all stores. For single-item stores like 'appState', we'll use a fixed 'id'.
                    dbInstance.createObjectStore(storeName, { keyPath: 'id' });
                }
            });
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        request.onerror = (event) => {
            console.error("IndexedDB error:", (event.target as IDBOpenDBRequest).error);
            reject("Error opening IndexedDB.");
        };
    });
};

const put = <T>(storeName: string, item: T & { id: any }): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        const dbInstance = await initDB();
        const transaction = dbInstance.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};


const get = <T>(storeName: string, id: any): Promise<T | undefined> => {
    return new Promise(async (resolve, reject) => {
        const dbInstance = await initDB();
        const transaction = dbInstance.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};


const getAll = <T>(storeName: string): Promise<T[]> => {
    return new Promise(async (resolve, reject) => {
        const dbInstance = await initDB();
        const transaction = dbInstance.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const deleteItem = (storeName: string, id: any): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        const dbInstance = await initDB();
        const transaction = dbInstance.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};


const clearStore = (storeName: string): Promise<void> => {
     return new Promise(async (resolve, reject) => {
        const dbInstance = await initDB();
        const transaction = dbInstance.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};


export const dbService = {
    initDB,
    put,
    get,
    getAll,
    deleteItem,
    clearStore
};