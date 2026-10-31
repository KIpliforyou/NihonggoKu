const DB_NAME = 'nihonggoku-db';
const DB_VERSION = 1;

// Store names
export const STORES = {
  BUNPOU: 'bunpou',
  KOTOBA: 'kotoba',
  NOTES: 'notes',
  FLASHCARD_STATE: 'flashcardState',
  PROGRESS: 'progress',
  SETTINGS: 'settings',
} as const;

let db: IDBDatabase | null = null;

export async function openDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Bunpou store
      if (!database.objectStoreNames.contains(STORES.BUNPOU)) {
        const bunpouStore = database.createObjectStore(STORES.BUNPOU, { keyPath: 'id' });
        bunpouStore.createIndex('createdAt', 'createdAt', { unique: false });
        bunpouStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        bunpouStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
      }

      // Kotoba store
      if (!database.objectStoreNames.contains(STORES.KOTOBA)) {
        const kotobaStore = database.createObjectStore(STORES.KOTOBA, { keyPath: 'id' });
        kotobaStore.createIndex('createdAt', 'createdAt', { unique: false });
        kotobaStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        kotobaStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
      }

      // Notes store
      if (!database.objectStoreNames.contains(STORES.NOTES)) {
        const notesStore = database.createObjectStore(STORES.NOTES, { keyPath: 'id' });
        notesStore.createIndex('createdAt', 'createdAt', { unique: false });
        notesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        notesStore.createIndex('category', 'category', { unique: false });
      }

      // Flashcard state store
      if (!database.objectStoreNames.contains(STORES.FLASHCARD_STATE)) {
        database.createObjectStore(STORES.FLASHCARD_STATE, { keyPath: 'id' });
      }

      // Progress store
      if (!database.objectStoreNames.contains(STORES.PROGRESS)) {
        database.createObjectStore(STORES.PROGRESS, { keyPath: 'id' });
      }

      // Settings store
      if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
        database.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
      }

      // Content version store
      if (!database.objectStoreNames.contains('contentVersion')) {
        database.createObjectStore('contentVersion', { keyPath: 'key' });
      }

      // Overrides store
      if (!database.objectStoreNames.contains('overrides')) {
        database.createObjectStore('overrides', { keyPath: 'id' });
      }

      // Deletion records store
      if (!database.objectStoreNames.contains('deletions')) {
        database.createObjectStore('deletions', { keyPath: 'id' });
      }
    };
  });
}

export async function closeDB() {
  if (db) {
    db.close();
    db = null;
  }
}

// Generic CRUD operations
export async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function get<T>(storeName: string, id: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function add<T>(storeName: string, item: T): Promise<string> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);

    request.onsuccess = () => resolve(request.result as string);
    request.onerror = () => reject(request.error);
  });
}

export async function put<T>(storeName: string, item: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Alias for update (used in components)
export const update = put;

export async function deleteItem(storeName: string, id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearStore(storeName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// IndexedDB-specific search
export async function searchByIndex<T>(
  storeName: string,
  indexName: string,
  value: string
): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
