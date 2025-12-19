
export interface TrendyolOrder {
    id: string;
    orderNumber: string;
    customerFirstName: string;
    customerLastName: string;
    customerPhoneNumber: string;
    totalPrice: number;
    orderDate: number;
    packageStatus: string;
    lines: {
        id: string;
        productName: string;
        quantity: number;
        price: number;
        merchantId: string;
        sku: string;
    }[];
}

const TRENDYOL_BASE_URL = 'https://apigw.trendyol.com/integration/order/sellers';

export class TrendyolClient {
    private sellerId: string;
    private token: string;

    constructor() {
        this.sellerId = process.env.TRENDYOL_SELLER_ID || '';
        this.token = process.env.TRENDYOL_TOKEN || '';
    }

    async getOrders(status = 'Created', size = 50) {
        if (!this.sellerId || !this.token) {
            console.warn('Trendyol credentials missing in env');
            return { content: [] };
        }

        const url = `${TRENDYOL_BASE_URL}/${this.sellerId}/orders?status=${status}&size=${size}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Basic ${this.token}`,
                    'User-Agent': 'NoccaCoffee-Integration/1.0',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Trendyol API Error: ${JSON.stringify(errorData)}`);
            }

            return await response.json();
        } catch (error: any) {
            console.error('Trendyol Fetch Orders Error:', error.message);
            throw error;
        }
    }

    async updateOrderStatus(packageId: string, status: 'Confirmed' | 'Preparing' | 'Delivered' | 'Cancelled') {
        if (!this.sellerId || !this.token) return;

        const url = `${TRENDYOL_BASE_URL}/${this.sellerId}/orders/${packageId}/status`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Basic ${this.token}`,
                    'User-Agent': 'NoccaCoffee-Integration/1.0',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Trendyol API Update Status Error: ${JSON.stringify(errorData)}`);
            }

            return true;
        } catch (error: any) {
            console.error('Trendyol Update Status Error:', error.message);
            throw error;
        }
    }
}

export const trendyol = new TrendyolClient();
