import { type Page } from '@playwright/test';

interface TableRow {
  [column: string]: string;
}

export class TableHelper {
  private static async getHeaders(page: Page): Promise<string[]> {
    const rawHeaders = await page.locator('thead th').allTextContents();
    return rawHeaders.map((text) => text.trim().toLowerCase());
  }

  static async getRows(
    page: Page,
    tbodySelector: string
  ): Promise<TableRow[]> {
    const headers = await TableHelper.getHeaders(page);
    const rows = await page.locator(`${tbodySelector} tr`).all();

    const results: TableRow[] = [];

    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      const record: TableRow = {};

      for (let i = 0; i < headers.length; i++) {
        record[headers[i]] = cells[i]?.trim() || '';
      }

      results.push(record);
    }

    return results;
  }
}