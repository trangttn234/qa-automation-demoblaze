import { type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { ProductElements } from './product.elements';
import { CartEndpoints } from '../../../common/models/order.model';

export class ProductPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async addToCart(): Promise<string> {
    const [alertMessage] = await Promise.all([
      this.clickAndAcceptAlert(
        this.page.locator(ProductElements.addToCartButton)
      ),
      this.page.waitForResponse(
        (res) =>
          res.url().includes(CartEndpoints.addToCart) && res.ok()
      ),
    ]);

    return alertMessage;
  }
}