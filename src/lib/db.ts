
// Simple IndexedDB wrapper for NOCCA POS
const DB_NAME = 'nocca_pos_db';
const DB_VERSION = 2;

export interface OfflineOrder {
    id?: number;
    tempId: string;
    data: any;
    status: 'pending' | 'synced' | 'failed';
    createdAt: number;
}

class NoccaDB {
    private db: IDBDatabase | null = null;

    async init() {
        if (typeof window === 'undefined') return;

        return new Promise<void>((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event: any) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('orders')) {
                    db.createObjectStore('orders', { keyPath: 'tempId' });
                }
                if (!db.objectStoreNames.contains('products')) {
                    db.createObjectStore('products', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('customers')) {
                    db.createObjectStore('customers', { keyPath: 'id' });
                }
            };

            request.onsuccess = (event: any) => {
                this.db = event.target.result;
                resolve();
            };

            request.onerror = (event: any) => {
                reject(event.target.error);
            };
        });
    }

    async saveOrder(order: any, tempId: string) {
        if (!this.db) await this.init();
        return new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction(['orders'], 'readwrite');
            const store = transaction.objectStore('orders');
            const request = store.put({
                tempId,
                data: order,
                status: 'pending',
                createdAt: Date.now()
            });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getPendingOrders(): Promise<OfflineOrder[]> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['orders'], 'readonly');
            const store = transaction.objectStore('orders');
            const request = store.getAll();

            request.onsuccess = () => {
                const all = request.result as OfflineOrder[];
                resolve(all.filter(o => o.status === 'pending'));
            };
            request.onerror = () => reject(request.error);
        });
    }

    async markOrderSynced(tempId: string) {
        if (!this.db) await this.init();
        return new Promise<void>((resolve, reject) => {
            const transaction = this.db!.transaction(['orders'], 'readwrite');
            const store = transaction.objectStore('orders');
            const getRequest = store.get(tempId);

            getRequest.onsuccess = () => {
                const data = getRequest.result;
                if (data) {
                    data.status = 'synced';
                    store.put(data);
                }
                resolve();
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async cacheProducts(products: any[]) {
        if (!this.db) await this.init();
        const transaction = this.db!.transaction(['products'], 'readwrite');
        const store = transaction.objectStore('products');
        products.forEach(p => store.put(p));
    }

    async getCachedProducts(): Promise<any[]> {
        if (!this.db) await this.init();
        return new Promise((resolve) => {
            const transaction = this.db!.transaction(['products'], 'readonly');
            const store = transaction.objectStore('products');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
        });
    }
}

export const noccaDB = new NoccaDB();
