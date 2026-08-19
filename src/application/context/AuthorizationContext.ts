export interface AuthorizationContext {
    userId : string,
    roles : string[],
    permissions: string[],
}