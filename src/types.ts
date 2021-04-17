import { AWSCognitoAuthState } from "./enums";
import { ICognitoStorage, CognitoUserAttribute, CognitoUser } from "amazon-cognito-identity-js";

export interface AWSCognitoAuthProps {
    state: AWSCognitoAuthState;
    authError: string | null;
    login: (username: string, password: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AWSCognitoAuthStorage extends ICognitoStorage {}

export interface AWSCognitoAuthPoolInfo {
    poolId: string;
    clientId: string;
    region: string;
}

export type AWSCognitoAuthLoginResponse =
    | { RequirePasswordChange: false }
    | {
          RequirePasswordChange: true;
          SessionUserAttributes: CognitoUserAttribute[];
          CognitoUser: CognitoUser;
      };
