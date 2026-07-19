export const UserEndpoints = {
  signup: '/signup',
  login: '/login',
} as const;

export class UserCredentials {
  constructor(
    public readonly username: string,
    public readonly password: string,
  ) {}
}