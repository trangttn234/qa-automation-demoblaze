import * as fs from 'fs';
import * as path from 'path';

export default function globalSetup(): void {
  if (!process.env.CI) return;

  const allureResults = path.resolve(
    process.cwd(),
    'reports/allure/results'
  );

  fs.rmSync(allureResults, {
    recursive: true,
    force: true,
  });
}