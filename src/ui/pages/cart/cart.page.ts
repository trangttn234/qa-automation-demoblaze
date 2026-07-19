import { type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { WaitHelper } from '../../utils/helpers/wait.helper';
import { TableHelper } from '../../utils/helpers/table.helper';
import { CartElements } from './cart.elements';
import { CartTableColumn, CartTableAction } from '../../utils/enums';
import { OrderData } from '../../../common/models/order.model';
import { CartItem } from '../../../common/models/cart.model';

export class CartPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    async navigate(): Promise<void> {
        await this.page.goto('/cart.html');
        await WaitHelper.forPageLoad(this.page);
    }

    async deleteItem(productName: string): Promise<void> {
        const row = this.page.locator(CartElements.cartRows).filter({ hasText: productName });
        await row.getByRole('link', { name: CartTableAction.Delete }).click();
        await WaitHelper.forDetached(row);
    }

    async placeOrder(order: OrderData): Promise<void> {
        await this.page.locator(CartElements.placeOrderButton).click();
        await WaitHelper.forVisible(this.page.locator(CartElements.orderModal));
        await this.page.locator(CartElements.orderName).fill(order.name);
        await this.page.locator(CartElements.orderCountry).fill(order.country);
        await this.page.locator(CartElements.orderCity).fill(order.city);
        await this.page.locator(CartElements.orderCard).fill(order.creditCard);
        await this.page.locator(CartElements.orderMonth).fill(order.month);
        await this.page.locator(CartElements.orderYear).fill(order.year);
    }

    async clickPurchase(): Promise<string | null> {
        return this.clickAndAwaitDialog(this.page.locator(CartElements.purchaseButton));
    }

    async confirmPurchase(): Promise<void> {
        await this.page.locator(CartElements.confirmOkButton).click();
        await WaitHelper.forHidden(this.page.locator(CartElements.confirmationModal));
    }

    async cancelOrder(): Promise<void> {
        await this.page.locator(CartElements.closeOrderButton).click();
        await WaitHelper.forHidden(this.page.locator(CartElements.orderModal));
    }

    async getCartItems(): Promise<CartItem[]> {
        await WaitHelper.forAttached(this.page.locator(CartElements.cartRows).first()).catch(() => {});
        const rows = await TableHelper.getRows(this.page, CartElements.cartBody);
        return rows.map((row) => ({
            title: row[CartTableColumn.Title],
            price: parseInt(row[CartTableColumn.Price]),
        }));
    }

    async getTotal(): Promise<number> {
        const totalLocator = this.page.locator(CartElements.totalPrice);
        await WaitHelper.forVisible(totalLocator).catch(() => {});
        const totalPrice = await totalLocator.textContent() ?? '0';
        return parseInt(totalPrice);
    }

    async getConfirmationHeading(): Promise<string> {
        await WaitHelper.forVisible(this.page.locator(CartElements.confirmationModal));
        return (await this.page.locator(CartElements.confirmationHeading).textContent()) ?? '';
    }

    async getConfirmationDetails(): Promise<string> {
        await WaitHelper.forVisible(this.page.locator(CartElements.confirmationModal));
        return (await this.page.locator(CartElements.confirmationDetails).textContent()) ?? '';
    }

    async isCartEmpty(): Promise<boolean> {
        const count = await this.page.locator(CartElements.cartRows).count();
        return count === 0;
    }
}