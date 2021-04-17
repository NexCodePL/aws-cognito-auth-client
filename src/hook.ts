import { useState, useRef, useEffect } from "react";
import {
    AuthenticationDetails,
    CognitoUser,
    CognitoUserAttribute,
    CognitoUserPool,
    CognitoUserSession,
} from "amazon-cognito-identity-js";

import { AWSCognitoAuthState } from "./enums";
import { AWSCognitoAuthProps, AWSCognitoAuthStorage, AWSCognitoAuthPoolInfo } from "./types";

export function useAWSCognitoAuth(
    poolInfo: AWSCognitoAuthPoolInfo,
    customStorage?: () => AWSCognitoAuthStorage
): AWSCognitoAuthProps {
    if (!customStorage) customStorage = () => window.localStorage;
    const cognitoUserPoolRef = useRef<CognitoUserPool>(
        new CognitoUserPool({ UserPoolId: poolInfo.poolId, ClientId: poolInfo.clientId, Storage: customStorage() })
    );
    const cognitoUserRef = useRef<CognitoUser | null>(null);

    const [authState, setAuthState] = useState<AWSCognitoAuthState>(AWSCognitoAuthState.SessionChecking);
    const [authError, setAuthError] = useState<string | null>(null);
    const [passwordChangeUserAttributes, setPasswordChangeUserAttributes] = useState<CognitoUserAttribute[] | null>(
        null
    );

    useEffect(() => {
        checkAuth();
    }, []);

    return {
        state: authState,
        authError,
        login,
    };

    async function checkAuth() {
        try {
            setAuthState(AWSCognitoAuthState.SessionChecking);
            const session = await getSession(cognitoUserPoolRef.current);

            if (session?.isValid()) {
                setAuthState(AWSCognitoAuthState.Authorized);
            } else {
                setAuthState(AWSCognitoAuthState.NotAuthorized);
            }
        } catch (e) {
            console.log(e);
            setAuthState(AWSCognitoAuthState.NotAuthorized);
        }
    }

    async function login(username: string, password: string) {
        setAuthState(AWSCognitoAuthState.Authorizing);
        cognitoUserRef.current = new CognitoUser({
            Username: username,
            Pool: cognitoUserPoolRef.current,
        });
        cognitoUserRef.current.authenticateUser(
            new AuthenticationDetails({
                Username: username,
                Password: password,
            }),
            {
                onSuccess: () => {
                    setAuthState(AWSCognitoAuthState.Authorized);
                },
                onFailure: error => {
                    setAuthState(AWSCognitoAuthState.AuthorizingError);
                    console.error(error);
                    // setAuthError(error);
                },
                newPasswordRequired: (userAttributes: CognitoUserAttribute[]) => {
                    setAuthState(AWSCognitoAuthState.PasswordChangeRequired);
                    setPasswordChangeUserAttributes(userAttributes);
                },
            }
        );
    }
}

async function getSession(cognitoUserPool: CognitoUserPool): Promise<CognitoUserSession | null> {
    const user = cognitoUserPool.getCurrentUser();
    if (!user) return null;
    return new Promise((resolve, reject) => {
        user.getSession((error: any, session: CognitoUserSession) => {
            if (error) {
                reject(error);
                return;
            }
            if (session) {
                resolve(session);
                return;
            }
            resolve(null);
        });
    });
}
