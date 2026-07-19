import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export class EnvManager {
  private static instance: EnvManager;

  readonly baseURL: string;
  readonly apiURL: string;

  private constructor() {
    this.baseURL =
      process.env.BASE_URL || 'https://www.demoblaze.com';
    this.apiURL =
      process.env.API_URL || 'https://api.demoblaze.com';
  }

  static getInstance(): EnvManager {
    if (!EnvManager.instance) {
      EnvManager.instance = new EnvManager();
    }

    return EnvManager.instance;
  }
}