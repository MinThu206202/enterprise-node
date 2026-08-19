import { AuthorizationContext } from "../../application/context/AuthorizationContext.js";

export interface IAuthorizationRepository{
    getUserAuthorization(userId : string): Promise<AuthorizationContext>
}