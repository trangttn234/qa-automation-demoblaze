import { APIRequestContext, APIResponse } from '@playwright/test';
import { UserCredentials, UserEndpoints } from '../../../common/models/user.model';

export class AccountController {
    constructor(private request: APIRequestContext) {}

    async signup(user: UserCredentials): Promise<APIResponse> {
        return this.request.post(UserEndpoints.signup, {
            data: {
                username: user.username,
                password: Buffer.from(user.password).toString('base64'),
            },
        });
    }

    async login(user: UserCredentials): Promise<string> {
        const response = await this.request.post(UserEndpoints.login, {
            data: {
                username: user.username,
                password: Buffer.from(user.password).toString('base64'),
            },
        });

        const body = await response.text();
        return body.replace(/"/g, '');
    }
}