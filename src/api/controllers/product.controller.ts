import { APIRequestContext } from '@playwright/test';
import { ProductEndpoints } from '../../common/models/product.model';

export class ProductController {
    constructor(private request: APIRequestContext) {}

    async getAll(): Promise<any[]> {
        const response = await this.request.get(ProductEndpoints.entries);
        const body = await response.json();
        return body.Items || [];
    }

    async getByCategory(category: string): Promise<any[]> {
        const response = await this.request.post(ProductEndpoints.byCategory, {
            data: { cat: category },
        });
        const body = await response.json();
        return body.Items || [];
    }
}