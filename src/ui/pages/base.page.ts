import { type Page, type Locator } from '@playwright/test';
import { WaitHelper } from '../utils/helpers/wait.helper';
import { BrowserDialog } from '../utils/helpers/browserDialog.helper';
import { TimeoutConfig } from '../../common/config/timeoutConfig';

export abstract class BasePage {
  constructor(protected page: Page) {}

  async navigate(path: string = '/'): Promise<void> {
    await this.page.goto(path);
    await WaitHelper.forDomReady(this.page);
  }

  protected async clickAndAcceptAlert(
    locator: Locator
  ): Promise<string> {
    return BrowserDialog.clickAndAccept(this.page, locator);
  }

  protected async clickAndAwaitDialog(
    locator: Locator,
    timeoutMs: number = TimeoutConfig.dialog.awaitPresence
  ): Promise<string | null> {
    return BrowserDialog.clickAndAwaitDialog(
      this.page,
      locator,
      timeoutMs
    );
  }
}