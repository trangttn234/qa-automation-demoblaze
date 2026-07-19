import { test, expect } from '../../../src/fixtures/test.fixture';
import { UserCredentials } from '../../../src/common/models/user.model';
import { Messages } from '../../../src/ui/utils/enums';
import accountsData from '../../../src/common/data/accounts.json';

const EMPTY_FIELD = '';
const invalidCredential = accountsData.invalid;

test.describe('Login E2E @login @e2e @regression', () => {
    test.beforeEach(async ({ homePage, loginPage }) => {
        await homePage.navigate();
        await loginPage.openModal();
    });

    test('LGN-001: Verify successful login with valid credentials @smoke @demo', async ({
        homePage,
        loginPage,
        workerCredentials,
    }) => {
        const alertMsg = await test.step('Submit valid credentials', async () => {
            return loginPage.login(workerCredentials);
        });

        await test.step('Verify authenticated state', async () => {
            expect(alertMsg).toBeNull();
            await expect(homePage.welcomeText).toContainText(workerCredentials.username);
            await expect(homePage.logoutLink).toBeVisible();
            await expect(homePage.loginLink).not.toBeVisible();
        });
    });

    test('LGN-002: Verify error message is displayed for invalid credentials', async ({
        loginPage,
        workerCredentials,
    }) => {
        await test.step('Reject valid user with wrong password', async () => {
            const wrongPwdAlert = await loginPage.loginExpectingError(
                new UserCredentials(workerCredentials.username, invalidCredential.wrongPassword),
            );
            expect(wrongPwdAlert).toBe(Messages.MESSAGE_LOGIN_WRONG_PASSWORD);
        });

        await test.step('Reject non-existent user', async () => {
            await loginPage.clearFields();
            const noUserAlert = await loginPage.loginExpectingError(
                new UserCredentials(
                    invalidCredential.nonExistentUser,
                    invalidCredential.randomPassword,
                ),
            );
            expect(noUserAlert).toBe(Messages.MESSAGE_LOGIN_USER_NOT_EXIST);
        });
    });

    test('LGN-003: Verify validation message is displayed when required fields are empty', async ({
        loginPage,
        workerCredentials,
    }) => {
        await test.step('Reject empty username', async () => {
            const noUserAlert = await loginPage.loginExpectingError(
                new UserCredentials(EMPTY_FIELD, workerCredentials.password),
            );
            expect(noUserAlert).toBe(Messages.MESSAGE_LOGIN_EMPTY_FIELDS);
        });

        await test.step('Reject empty password', async () => {
            await loginPage.clearFields();
            const noPwdAlert = await loginPage.loginExpectingError(
                new UserCredentials(workerCredentials.username, EMPTY_FIELD),
            );
            expect(noPwdAlert).toBe(Messages.MESSAGE_LOGIN_EMPTY_FIELDS);
        });

        await test.step('Reject both fields empty', async () => {
            await loginPage.clearFields();
            const bothEmptyAlert = await loginPage.loginExpectingError(
                new UserCredentials(EMPTY_FIELD, EMPTY_FIELD),
            );
            expect(bothEmptyAlert).toBe(Messages.MESSAGE_LOGIN_EMPTY_FIELDS);
        });
    });

    test('LGN-004: Verify login handling of special characters and whitespace inputs', async ({
        loginPage,
        workerCredentials,
    }) => {
        const sqlInjection = `" OR 1=1 --`;

        await test.step('Reject SQL injection input without leaking errors', async () => {
            const specialCharsAlert = await loginPage.loginExpectingError(
                new UserCredentials(sqlInjection, sqlInjection),
            );
            expect(specialCharsAlert).toBe(Messages.MESSAGE_LOGIN_USER_NOT_EXIST);
            expect(specialCharsAlert).not.toContain('SQL');
            expect(specialCharsAlert).not.toContain('error');
        });

        await test.step('Reject credentials padded with whitespace', async () => {
            await loginPage.clearFields();
            const whitespaceAlert = await loginPage.loginExpectingError(
                new UserCredentials(
                    ` ${workerCredentials.username} `,
                    ` ${workerCredentials.password} `,
                ),
            );
            expect(whitespaceAlert).not.toBeNull();
        });
    });
});