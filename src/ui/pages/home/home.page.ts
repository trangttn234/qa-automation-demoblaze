import { type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { WaitHelper } from '../../utils/helpers/wait.helper';
import { ProductHelper } from '../../../common/models/product.model';
import { HomeElements } from './home.elements';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await super.navigate('/');
  }

  private async clickCategory(category: string): Promise<void> {
    await this.page
      .locator(HomeElements.categoryList, { hasText: category })
      .click();

    await WaitHelper.forDomReady(this.page);
  }

  async clickProduct(productName: string): Promise<void> {
    const category = ProductHelper.getCategory(productName);

    await this.clickCategory(category);

    await this.page
      .locator(HomeElements.productTitle, { hasText: productName })
      .first()
      .click();

    await WaitHelper.forDomReady(this.page);
  }

  get welcomeText() {
    return this.page.locator(HomeElements.welcomeText);
  }

  get logoutLink() {
    return this.page.locator(HomeElements.logoutLink);
  }

  get loginLink() {
    return this.page.locator(HomeElements.loginLink);
  }
}