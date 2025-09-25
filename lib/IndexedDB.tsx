export function connectToIndexedDB(
  dbName: string,
  version: number,
  storeName: string,
) {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        console.log(`Objeto "${storeName}" creado en IndexedDB "${dbName}" version ${version}.`);
      }
    };

    request.onsuccess = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log(`conectando a IndexedDB "${dbName}" version ${version}.`);
      resolve(db);
    };

    request.onerror = (event: IDBVersionChangeEvent) => {
      console.error('Error al conectar a IndexedDB:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    }

});
}