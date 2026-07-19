import { type Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { WaitHelper } from '../../utils/helpers/wait.helper';
import { TimeoutConfig } from '../../../common/config/timeoutConfig';
import { LoginElements } from './login.elements';
import { UserCredentials } from '../../../common/models/user.model';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async openModal(): Promise<void> {
    await this.page.locator(LoginElements.navLoginLink).click();
    await WaitHelper.forVisible(this.page.locator(LoginElements.modal));
  }

  async login(credentials: UserCredentials): Promise<string | null> {
    await this.page
      .locator(LoginElements.usernameInput)
      .fill(credentials.username);

    await this.page
      .locator(LoginElements.passwordInput)
      .fill(credentials.password);

    return this.clickAndAwaitDialog(
      this.page.locator(LoginElements.loginButton),
      TimeoutConfig.dialog.slowResponse
    );
  }

  async loginExpectingError(credentials: UserCredentials): Promise<string> {
    await this.page
      .locator(LoginElements.usernameInput)
      .fill(credentials.username);

    await this.page
      .locator(LoginElements.passwordInput)
      .fill(credentials.password);

    return this.clickAndAcceptAlert(
      this.page.locator(LoginElements.loginButton)
    );
  }

  async clearFields(): Promise<void> {
    await this.page.locator(LoginElements.usernameInput).clear();
    await this.page.locator(LoginElements.passwordInput).clear();
  }
}