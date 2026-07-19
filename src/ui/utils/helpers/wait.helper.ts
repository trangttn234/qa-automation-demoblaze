import { type Page, type Locator } from '@playwright/test';

export class WaitHelper {
  static async forDomReady(page: Page): Promise<void> {
    await page.waitForLoadState('domcontentloaded');
  }

  static async forPageLoad(page: Page): Promise<void> {
    await page.waitForLoadState('load');
  }

  static async forVisible(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({
      state: 'visible',
      ...(timeout && { timeout }),
    });
  }

  static async forHidden(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({
      state: 'hidden',
      ...(timeout && { timeout }),
    });
  }

  static async forAttached(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({
      state: 'attached',
      ...(timeout && { timeout }),
    });
  }

  static async forDetached(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({
      state: 'detached',
      ...(timeout && { timeout }),
    });
  }
}