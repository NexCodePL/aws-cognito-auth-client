export enum AWSCognitoAuthState {
    NotAuthorized = 1,
    Authorized,
    SessionOutdated,
    SessionRefreshing,
    SessionChecking,
    Authorizing,
    AuthorizingError,
    Registering,
    RegisteringError,
    PasswordChangeRequired
}
