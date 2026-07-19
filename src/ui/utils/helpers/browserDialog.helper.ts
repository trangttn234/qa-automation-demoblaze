import { type Page, type Locator, type Dialog } from '@playwright/test';
import { TimeoutConfig } from '../../../common/config/timeoutConfig';

export class BrowserDialog {
  static async clickAndAccept(page: Page, locator: Locator): Promise<string> {
    const dialogPromise = BrowserDialog.waitForDialog(page);
    await locator.click();
    return dialogPromise;
  }

  static async clickAndAwaitDialog(page: Page, locator: Locator, timeoutMs: number = TimeoutConfig.dialog.awaitPresence): 
  Promise<string | null> {
    const dialogPromise = BrowserDialog.waitForDialog(page, timeoutMs);
    await locator.click();
    return dialogPromise;
  }

  private static waitForDialog(page: Page): Promise<string>;
  private static waitForDialog(page: Page, timeoutMs: number): Promise<string | null>;
  private static waitForDialog(page: Page, timeoutMs?: number): Promise<string | null> {
    return new Promise((resolve) => {
      let timer: ReturnType<typeof setTimeout> | null = null;

      const handler = async (dialog: Dialog) => {
        if (timer) clearTimeout(timer);
        resolve(dialog.message());
        await dialog.accept();
      };

      if (timeoutMs !== undefined) {
        timer = setTimeout(() => {
          page.removeListener('dialog', handler);
          resolve(null);
        }, timeoutMs);
      }

      page.once('dialog', handler);
    });
  }
}