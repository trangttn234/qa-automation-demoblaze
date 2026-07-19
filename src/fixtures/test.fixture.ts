import { test as base, type Page } from '@playwright/test';
import { EnvManager } from '../common/config/envManager';
import { ApiHelper } from '../api/controllers';
import { UserCredentials } from '../common/models/user.model';
import accountsData from '../common/data/accounts.json';
import { HomePage } from '../ui/pages/home/home.page';
import { LoginPage } from '../ui/pages/login/login.page';
import { ProductPage } from '../ui/pages/product/product.page';
import { CartPage } from '../ui/pages/cart/cart.page';

const config = EnvManager.getInstance();
const accounts = accountsData.workers;

interface WorkerFixtures {
    workerCredentials: UserCredentials;
    apiHelper: ApiHelper;
}

interface UIFixtures {
    homePage: HomePage;
    loginPage: LoginPage;
    productPage: ProductPage;
    cartPage: CartPage;
}

export async function injectAuthSession(page: Page, apiHelper: ApiHelper, credentials: UserCredentials): Promise<void> {
    const token = await apiHelper.login(credentials);
    await page.goto(config.baseURL);
    await page.evaluate((t) => localStorage.setItem('tokenp', t), token);
    await page.evaluate((u) => localStorage.setItem('user', u), credentials.username);
    await page.reload();
}

export const test = base.extend<UIFixtures, WorkerFixtures>({
    apiHelper: [async ({ playwright }, use) => {
        const request = await playwright.request.newContext({
            baseURL: config.apiURL,
        });

        await use(new ApiHelper(request));
        await request.dispose();
    }, { scope: 'worker' }],

    workerCredentials: [async ({ apiHelper }, use, workerInfo) => {
        const projectName = workerInfo.project.name as keyof typeof accounts;
        const account = accounts[projectName] || accounts['default'];
        const uniqueUsername = `${account.username}_w${workerInfo.workerIndex}`;
        const credentials = new UserCredentials(uniqueUsername, account.password);
        await apiHelper.signup(credentials);
        await use(credentials);
    }, { scope: 'worker' }],

    homePage: async ({ page }, use) => {
        await use(new HomePage(page));
    },

    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    productPage: async ({ page }, use) => {
        await use(new ProductPage(page));
    },

    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },
});

export { expect } from '@playwright/test';