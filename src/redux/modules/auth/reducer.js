import {
  USER_LOGOUT,
  USER_LOGIN_FAILED,
  USER_LOGGED_IN_SUCCESSFUL,
  CLEAR_ERRORS,
  USER_RESET_AUTH,
  NETWORK_STATUS_CHANGED, SOCKET_CONNECTED,
  SOCKET_DISCONNECTED, USER_MAGIC_LOGIN,
  MAGIC_LOGIN_EMAIL_SENT,
  REGISTER_DEEPLINK,
  DE_REGISTER_DEEPLINK, USER_ONBOARDED,
} from './actions';
import {PROFILE_UPDATED} from '../profile/actions';

export const DEFAULT = {
    isAuthenticated: false,
    codeVerified: false,
    isLoading: false,
    data: [],
    networkConnected: true,
    socketConnected: true,
    otpSuccessful: false,
    error: null,
    errorMsg: null,
    meta: null
};

export default function authReducer(state = DEFAULT, action = {}) {
    const {type, payload} = action;
    switch (type) {
      case REGISTER_DEEPLINK: {
        return {
          ...state,
          deepLink: true,
          contentSlug: payload.contentSlug,
          name: payload.name,
          formUrl: payload.formUrl,
          appointment: payload.appointment
        };
      }
      case PROFILE_UPDATED: {
          return {
            ...state,
            meta: {
              ...state.meta,
              nickname: payload.fullName ? payload.fullName : state.meta.nickname
            }
          }
      }
      case DE_REGISTER_DEEPLINK: {
        return {
          ...state,
          deepLink: false,
          contentSlug: '',
          name: '',
          formUrl: '',
          appointment: '',
        };
      }
      case SOCKET_CONNECTED: {
        return {
          ...state,
          socketConnected: true,
        };
      }

      case SOCKET_DISCONNECTED: {
        return {
          ...state,
          socketConnected: false,
        };
      }
      case NETWORK_STATUS_CHANGED: {
        return {
          ...state,
          networkConnected: payload.isConnected,
        };
      }
      case USER_MAGIC_LOGIN: {
        return {
          ...state,
          isLoading: true,
        };
      }

      case MAGIC_LOGIN_EMAIL_SENT: {
        return {
          ...state,
          isLoading: false,
        };
      }
      case USER_LOGIN_FAILED: {
        return {
          ...state,
          isAuthenticated: false,
          error: true,
          isLoading: false,
          data: null,
          errorMsg: action.errorMsg,
        };
      }
      case USER_LOGGED_IN_SUCCESSFUL: {
        return {
          ...state,
          // data: action.data,
          isAuthenticated: true,
          isLoading: false,
          error: false,
          errorMsg: null,
          meta: {
            userId: action.data.userId,
            nickname: action.data.nickName,
          },
        };
      }
      case USER_ONBOARDED: {
        return {
          ...state,
          meta: {
            userId: payload?.userId,
            nickname: payload?.nickName,
          },
        };
      }
      case CLEAR_ERRORS: {
        return {
          ...state,
          errorMsg: null,
          error: false,
        };
      }
      case USER_RESET_AUTH:
      case USER_LOGOUT: {
        return DEFAULT;
      }
      default: {
        return state;
      }
    }
}
