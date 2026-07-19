import { APIRequestContext } from '@playwright/test';
import { AccountController } from './account.controller';
import { CartController } from './cart.controller';
import { ProductController } from './product.controller';
import { UserCredentials } from '../../../common/models/user.model';

export class ApiHelper {
    readonly account: AccountController;
    readonly cart: CartController;
    readonly product: ProductController;

    constructor(request: APIRequestContext) {
        this.account = new AccountController(request);
        this.cart = new CartController(request);
        this.product = new ProductController(request);
    }

    async signup(user: UserCredentials): Promise<void> {
        await this.account.signup(user);
    }

    async login(user: UserCredentials): Promise<string> {
        return this.account.login(user);
    }

    async deleteCart(username: string): Promise<void> {
        await this.cart.deleteCart(username);
        await this.cart.waitForEmptyCart(username);
    }
}

export { AccountController } from './account.controller';
export { CartController } from './cart.controller';
export { ProductController } from './product.controller';