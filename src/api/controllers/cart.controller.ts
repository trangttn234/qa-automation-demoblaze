import { APIRequestContext, APIResponse } from '@playwright/test';
import { CartEndpoints } from '../../../common/models/order.model';

export class CartController {constructor(private request: APIRequestContext) {}

    async addToCart(cookie: string, productId: number): Promise<void> {
        await this.request.post(CartEndpoints.addToCart, {
            data: {
                id: `${cookie}${productId}`,
                cookie: cookie,
                prod_id: productId,
                flag: false,
            },
        });
    }

    async viewCart(cookie: string): Promise<any[]> {
        const response = await this.request.post(CartEndpoints.viewCart, {
            data: { cookie: cookie, flag: false },
        });
        const body = await response.json();
        return body.Items || [];
    }

    async deleteCart(username: string): Promise<APIResponse> {
        return this.request.post(CartEndpoints.deleteCart, {
            data: { cookie: username },
        });
    }

    async waitForEmptyCart(username: string, maxRetries = 3): Promise<void> {
        for (let i = 0; i < maxRetries; i++) {
            const response = await this.request.post(CartEndpoints.viewCart, {
                data: { cookie: username, flag: true },
            });
            const body = await response.json();
            if (!body.Items || body.Items.length === 0) return;
            await new Promise((r) => setTimeout(r, 300));
        }
    }
}