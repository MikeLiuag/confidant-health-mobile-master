import {
    CHAT_ADD_MESSAGE,
    CHAT_AUTO_REPLY_REGISTERED,
    CHAT_EXIT,
    CHAT_HIDE_SINGLE_CHOICES,
    CHAT_INIT_SUCCESSFUL,
    CHAT_LOAD_EARLIER,
    CHAT_LOADED_EARLIER,
    CHAT_PAUSE,
    CHAT_REQUEST_INITIALIZE,
    CHAT_RESUME,
    CHAT_SEND_MESSAGE,
    CHAT_SEND_MESSAGE_FAILED,
    CHAT_SEND_MESSAGE_IN_PROGRESS,
    CHAT_SEND_MESSAGE_SUCCESSFUL,
    CHAT_TYPING_DETECTED,
    CHAT_UPDATE_CONNECTION_STATUS,
    LIVE_CHAT_ADD_MESSAGE,
    LIVE_CHAT_EXIT,
    LIVE_CHAT_INITIALIZING,
    LIVE_CHAT_MEDIA_SENT,
    LIVE_CHAT_MEDIA_UPLOAD_PROGRESS,
    LIVE_CHAT_MESSAGE_RECEIVED,
    LIVE_CHAT_READY,
    LIVE_CHAT_SEND_ATTACHMENT,
    SENDBIRD_CONNECT_FAILED,
    SENDBIRD_CONNECTED,
    SENDBIRD_CONNECTING,
    SENDBIRD_RECONNECTING,
    UPDATE_SESSION_DETAILS,
} from './actions';
import {USER_LOGOUT} from "../auth/actions";
import {getArtificialLoadingMediaMessage} from './liveChatSaga';

export const DEFAULT_CHAT_LOCAL_CONTEXT = {
    contact: null,
    from: null,
    connectionStatus: 0,
    chatMessages: [],
    liveChatMessages: null,
    conversationContext: null,
    typingText: null,
    initTyping: null,
    sendingMessage: false,
    isConnectedBefore: false,
    pendingAutoReply: null,
    watermark: 0,
    loadEarlier: true,
    isLoadingEarlier: false,
    sessionId: null,
    providerId: null,
    providerName: null,
    channelUrl: null,
    chatPaused: false,
    sendbirdStatus: 0
};


export default function chatReducer(
    state = DEFAULT_CHAT_LOCAL_CONTEXT,
    action
) {
    const {type, payload} = action;
    switch (type) {
        case SENDBIRD_CONNECTED: {
            return {
                ...state,
                sendbirdStatus: 2
            }
        }
        case SENDBIRD_CONNECT_FAILED: {
            return {
                ...state,
                sendbirdStatus: 0
            }
        }
        case SENDBIRD_RECONNECTING: {
            return {
                ...state,
                sendbirdStatus: 3
            }
        }
        case SENDBIRD_CONNECTING: {
            return {
                ...state,
                sendbirdStatus: 1
            }
        }
        case CHAT_INIT_SUCCESSFUL: {
            return {
                ...state,
                connectionStatus: payload.connectionStatus,
                conversationContext: payload.conversationContext,
                contact: payload.contact,
                isConnectedBefore: payload.isConnectedBefore,
                watermark: payload.watermark,
                loadEarlier: payload.conversationHistory.length >= 10,
                chatMessages: payload.conversationHistory,
                initTyping: payload.conversationHistory.length === 0 ? "Typing..." : null
            };
        }
        case CHAT_PAUSE: {
            return {
                ...state,
                chatPaused: true
            }
        }
        case CHAT_RESUME: {
            return {
                ...state,
                chatPaused: false
            }
        }

        case LIVE_CHAT_MEDIA_SENT: {
            let {liveChatMessages} = state;
            let updated = false;
            liveChatMessages = liveChatMessages.map(message=>{
                if(message._id===payload._id) {
                    message.fileMeta.loading = false;
                    message.fileMeta.url = payload.location;
                    updated = true;
                }
                return message;
            });
            if(!updated) {
                const message = getArtificialLoadingMediaMessage(payload,payload.meta);
                message.fileMeta.loading = false;
                message.fileMeta.url = payload.location;
                liveChatMessages = [message, ...liveChatMessages]
            }
            return {
                ...state,
                liveChatMessages: liveChatMessages,
            };
        }

        case LIVE_CHAT_SEND_ATTACHMENT: {
            const giftedMessage = getArtificialLoadingMediaMessage(payload, payload.meta);
            return {
                ...state,
                liveChatMessages: [giftedMessage, ...state.liveChatMessages],
            };
        }

        case LIVE_CHAT_MEDIA_UPLOAD_PROGRESS: {
            let {liveChatMessages} = state;
            let updated =false;
            liveChatMessages = liveChatMessages.map(message=>{
                if(message._id===payload._id) {
                    message.fileMeta.progress = payload.progress;
                    updated = true;
                }
                return message;
            });
            if(!updated) {
                const message = getArtificialLoadingMediaMessage(payload,payload.meta);
                message.fileMeta.progress=payload.progress;
                liveChatMessages = [message, ...liveChatMessages]
            }
            return {
                ...state,
                liveChatMessages
            }
        }

        case LIVE_CHAT_INITIALIZING: {
            return {
                ...state,
                liveChatConnectionStatus: payload.connectionStatus,
                liveChatMessages: []
            }
        }
        case LIVE_CHAT_ADD_MESSAGE:
        case LIVE_CHAT_MESSAGE_RECEIVED: {
            const {channelUrl} = payload;
            if (state.channelUrl && state.channelUrl === channelUrl) {
                return {
                    ...state,
                    liveChatMessages: [payload.message, ...state.liveChatMessages]
                }
            } else {
                return state;
            }
        }
        case LIVE_CHAT_READY: {
            return {
                ...state,
                liveChatConnectionStatus: payload.connectionStatus,
                liveChatMessages: payload.chatMessages || [],
                channelUrl: payload.channelUrl
            }
        }
        case CHAT_UPDATE_CONNECTION_STATUS: {
            return {
                ...state,
                connectionStatus: payload.status
                //watermark: payload.watermark
            };
        }
        case CHAT_TYPING_DETECTED: {
            return {
                ...state,
                chatMessages: [payload, ...state.chatMessages],
                typingText: "Typing...",
                initTyping: null
            };
        }
        case CHAT_ADD_MESSAGE: {
            const watermark = payload.watermark ? payload.watermark : state.watermark;
            return {
                ...state,
                typingText: null,
                initTyping: null,
                chatMessages: [payload, ...state.chatMessages],
                watermark: state.watermark + 1
            };
        }
        case CHAT_HIDE_SINGLE_CHOICES: {
            if (state.chatMessages.length > 0) {
                state.chatMessages.forEach(msg => {
                    if (msg.attachments &&
                        msg.attachments.length &&
                        msg.attachments[0].contentType && msg.attachments[0].contentType === 'single-select') {
                        msg.attachments[0].content.choices = [];
                    }
                });
            }


            return {
                ...state,
                chatMessages: [...state.chatMessages]
            };
        }
        case CHAT_SEND_MESSAGE: {
            return {
                ...state,
                typingText: null,
                initTyping: null,
                chatMessages: [payload, ...state.chatMessages]
            };
        }
        case CHAT_SEND_MESSAGE_IN_PROGRESS: {
            /**
             * Update sendingMessage status and also clear auto pending auto reply if needed
             */
            let pendingAutoReply = state.pendingAutoReply;
            if (
                state.pendingAutoReply !== null &&
                payload.text === state.pendingAutoReply._id
            ) {
                pendingAutoReply = null;
            }
            return {
                ...state,
                sendingMessage: true,
                pendingAutoReply: pendingAutoReply
            };
        }
        case CHAT_SEND_MESSAGE_SUCCESSFUL: {
            return {
                ...state,
                sendingMessage: false
            };
        }
        case CHAT_AUTO_REPLY_REGISTERED: {
            return {
                ...state,
                pendingAutoReply: payload
            };
        }
        case CHAT_SEND_MESSAGE_FAILED: {
            //TODO, push this message to pendingAutoReply for replaying
            return {
                ...state,
                sendingMessage: false
            };
        }
        case CHAT_LOAD_EARLIER: {
            return {
                ...state,
                isLoadingEarlier: true
            };
        }
        case CHAT_LOADED_EARLIER: {
            return {
                ...state,
                loadEarlier: payload.conversationHistory.length === 10,
                watermark: state.watermark + payload.conversationHistory.length,
                isLoadingEarlier: false,
                chatMessages: [...state.chatMessages, ...payload.conversationHistory]
            };
        }
        case CHAT_EXIT:
        case CHAT_REQUEST_INITIALIZE: {
            return {
                ...DEFAULT_CHAT_LOCAL_CONTEXT,
                sendbirdStatus: state.sendbirdStatus
            }
        }
        case USER_LOGOUT: {
            return DEFAULT_CHAT_LOCAL_CONTEXT;
        }
        case LIVE_CHAT_EXIT: {
            return {
                ...state,
                liveChatMessages: [],
                liveChatConnectionStatus: 0,
                channelUrl: null
            }
        }
        case UPDATE_SESSION_DETAILS: {
            return {
                ...state,
                sessionId: payload.sessionId,
                providerId: payload.providerId,
                providerName: payload.providerName
            }
        }
        default:
            return state;
    }
}
