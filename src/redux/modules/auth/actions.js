import { createAction } from "redux-actions";

export const USER_LOGGED_IN_SUCCESSFUL = 'auth/LOGIN_SUCCESSFUL';
export const USER_ONBOARDED = 'auth/USER_ONBOARDED';
export const USER_LOGOUT = 'auth/LOGOUT';
export const USER_LOGIN_FAILED = 'auth/LOGIN_FAILED';
export const USER_MAGIC_LOGIN = 'auth/MAGIC_LOGIN';
export const MAGIC_LOGIN_EMAIL_SENT = 'auth/MAGIC_LOGIN_EMAIL_SENT';
export const REGISTER_TOKEN_REFRESH_TASK = 'auth/REGISTER_TOKEN_REFRESH_TASK';
export const CLEAR_ERRORS = 'auth/CLEAR_ERRORS';
export const NETWORK_STATUS_CHANGED = 'auth/NETWORK_STATUS_CHANGED';
export const USER_RESET_AUTH = 'auth/USER_RESET_AUTH';
export const SOCKET_CONNECTED='auth/SOCKET_CONNECTED';
export const SOCKET_DISCONNECTED='auth/SOCKET_DISCONNECTED';
export const REGISTER_DEEPLINK='auth/REGISTER_DEEPLINK';
export const DE_REGISTER_DEEPLINK='auth/DEREGISTER_DEEPLINK';
export const authActionCreators = {
    loginWithMagic: createAction(USER_MAGIC_LOGIN),
    logout: createAction(USER_LOGOUT),
    clearErrors : createAction(CLEAR_ERRORS),
    resetAuth: createAction(USER_RESET_AUTH),
    updateNetworkStatus: createAction(NETWORK_STATUS_CHANGED),
    registerDeeplink: createAction(REGISTER_DEEPLINK),
    deRegisterDeeplink: createAction(DE_REGISTER_DEEPLINK),
    onUserOnboarded: createAction(USER_ONBOARDED)

};
