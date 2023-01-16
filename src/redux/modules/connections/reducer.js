import {USER_LOGOUT} from '../auth/actions';
import {
    ARCHIVE_CONNECTION,
    ARCHIVE_CONNECTION_FAILED,
    BOT_PROGRESS_UPDATED,
    CONNECT,
    CONNECTION_FAILED,
    CONNECTIONS_FETCHED,
    DISCONNECT,
    DISCONNECTING,
    FETCH_CHATBOTS,
    FETCH_CHATBOTS_FAILURE,
    FETCH_CHATBOTS_SUCCESS,
    GET_CONNECTIONS,
    GET_CONNECTIONS_FAILED,
    GROUP_CALL_ACTIVE,
    NEW_CHAT_GROUP_CREATED,
    REFRESH_CHAT_TIMESTAMPS,
    RESTART_CHATBOT,
    RESTART_CHATBOT_FAILED,
    RESTART_CHATBOT_SUCCESS,
    SPECIFIC_CONNECTION_FETCHED,
    UPDATED_CHANNEL_URL,
    FETCH_PENDING_CONNECTIONS,
    PENDING_CONNECTIONS_FAILED,
    PENDING_CONNECTIONS_FETCHED,
    FETCH_LIST_APPOINTMENT_ELIGIBLE_PROVIDERS,
    LIST_APPOINTMENT_ELIGIBLE_PROVIDERS_FAILED,
    LIST_APPOINTMENT_ELIGIBLE_PROVIDERS_FETCHED,
    FETCH_ALL_GROUPS,
    ALL_GROUPS_FAILED,
    ALL_GROUPS_FETCHED,
} from './actions';
import {
    CHAT_ADD_MESSAGE,
    CHAT_GROUP_UPDATED,
    LIVE_CHAT_ADD_MESSAGE, LIVE_CHAT_ATTACHMENT_SENT,
    LIVE_CHAT_MARK_AS_READ, LIVE_CHAT_MEDIA_SENT,
    LIVE_CHAT_MESSAGE_RECEIVED, LIVE_CHAT_READY, LIVE_CHAT_SEND_ATTACHMENT,
} from '../chat/actions';
import {getArtificialLoadingMediaMessage} from '../chat/liveChatSaga';

export const sortConnections = connections => {
    connections = connections.sort((contact1, contact2) => {
        let timestamp1 = contact1.lastMessageTimestamp;
        if (!timestamp1) {
            timestamp1 = 0;
        }
        let timestamp2 = contact2.lastMessageTimestamp;
        if (!timestamp2) {
            timestamp2 = 0;
        }
        const result = timestamp2 - timestamp1;
        if (result < 0) {
            return -1;
        } else {
            return 1;
        }
    });
    return connections;
};

export const DEFAULT = {
    isLoading: false,
    activeConnections: [],
    pastConnections: [],
    requestedConnections: [],
    pendingConnections : [],
    error: null,
    connectionsFetchedFor: null,
    errorMsg: null,
    chatbotsLoading: false,
    chatbotList : []

};

export default function connectionsReducer(state = DEFAULT, action = {}) {
    const {type, payload} = action;
    switch (type) {

        case LIVE_CHAT_SEND_ATTACHMENT: {
            const giftedMessage = getArtificialLoadingMediaMessage(payload, payload.meta);
            let {activeConnections} = state;
            activeConnections = activeConnections.map(connection => {
                if (connection.channelUrl === payload.channel.channelUrl) {
                    return {
                        ...connection,
                        lastMessage: 'Attachment',
                        lastMessageTimestamp: new Date().getTime(),
                        messages: connection.messages? [giftedMessage, ...connection.messages]:[giftedMessage]
                    };
                }
                return connection;
            });
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
            };
        }

        case LIVE_CHAT_MEDIA_SENT: {
            let {activeConnections} = state;
            activeConnections = activeConnections.map(connection => {
                if (connection.channelUrl === payload.channelUrl) {
                    let messages = connection.messages;
                    if(messages) {
                        messages = messages.map(message=>{
                            if(message._id===payload._id) {
                                message.fileMeta.loading=false;
                                message.fileMeta.url = payload.location;
                            }
                            return message;
                        })
                    }
                    return {
                        ...connection,
                        sendingAttachment: false,
                        messages: messages
                    };
                }
                return connection;
            });
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
            };
        }

        case LIVE_CHAT_ATTACHMENT_SENT: {
            let {activeConnections} = state;
            activeConnections = activeConnections.map(connection => {
                if (connection.channelUrl === payload.channelUrl) {
                    return {
                        ...connection,
                        sendingAttachment: false,
                    };
                }
                return connection;
            });
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
            };
        }

        case RESTART_CHATBOT: {
            let {activeConnections} = state;
            activeConnections = activeConnections.map(connection => {
                if (connection.connectionId === payload) {
                    return {
                        ...connection,
                        archived: false,
                        wasArchived: connection.archived,
                        restartInProgress: true,
                        progress: {
                            percentage: 100,
                            completed: true
                        }
                    };
                }
                return connection;
            });
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
            };
        }
        case RESTART_CHATBOT_SUCCESS: {

            let {activeConnections} = state;
            activeConnections = activeConnections.map(connection => {
                if (connection.connectionId === payload) {
                    return {
                        ...connection,
                        archived: false,
                        restartInProgress: false
                    };
                }
                return connection;
            });
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
            };
        }

        case RESTART_CHATBOT_FAILED: {
            let {activeConnections} = state;
            activeConnections = activeConnections.map(connection => {
                if (connection.connectionId === payload) {
                    return {
                        ...connection,
                        archived: connection.wasArchived,
                        restartInProgress: false,
                        progress: {
                            percentage: 100,
                            completed: true
                        }
                    };
                }
                return connection;
            });
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
            };
        }

        case ARCHIVE_CONNECTION: {
            let {activeConnections} = state;
            activeConnections = activeConnections.map(connection => {
                if (connection.connectionId === payload) {
                    return {
                        ...connection,
                        archived: true
                    };
                }
                return connection;
            });
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
            };
        }

        case ARCHIVE_CONNECTION_FAILED: {
            let {activeConnections} = state;
            activeConnections = activeConnections.map(connection => {
                if (connection.connectionId === payload) {
                    return {
                        ...connection,
                        archived: false
                    };
                }
                return connection;
            });
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
            };
        }

        case BOT_PROGRESS_UPDATED: {
            let {activeConnections} = state;
            const {contactId, ...progress} = payload;
            activeConnections = activeConnections.map(connection => {
                if (connection.connectionId === contactId) {
                    return {
                        ...connection,
                        progress
                    };
                }
                return connection;
            });
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
            };
        }

        case GET_CONNECTIONS: {
            return {
                ...state,
                isLoading: true,
            };
        }
        case DISCONNECTING: {
            return {
                ...state,
                isLoading: true,
            };
        }
        case NEW_CHAT_GROUP_CREATED: {
            const {activeConnections} = state;
            const date = new Date();
            const chatGroup = {
                connectionId: payload.channelUrl,
                name: payload.groupName,
                profilePicture: payload.profilePicture,
                lastModified: date.toISOString(),
                type: 'CHAT_GROUP',
                lastMessage: null,
                lastMessageTimestamp: date.getTime(),
                lastMessageUnread: false,
                channelUrl: payload.channelUrl,
            };
            activeConnections.push(chatGroup);
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
            };
        }
        case UPDATED_CHANNEL_URL: {
            const {connectionId, channelUrl} = payload;
            let {activeConnections} = state;
            activeConnections = activeConnections.map(connection => {
                if (connection.connectionId === connectionId) {
                    return {
                        ...connection,
                        channelUrl: channelUrl,
                    };
                }
                return connection;
            });
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
            };

        }

        case LIVE_CHAT_READY: {
            let {activeConnections} = state;
            activeConnections = activeConnections.map(connection=>{
                if(connection.channelUrl===payload.channelUrl) {
                    connection.messages = payload.chatMessages
                }
                return connection;
            });

            return {
                ...state,
                activeConnections: sortConnections(activeConnections)
            };
        }

        case SPECIFIC_CONNECTION_FETCHED: {
            let {requestedConnections, activeConnections, pastConnections} = state;
            delete payload['isActive'];
            const mapper = (connections) => {
                return connections.map(connection => {
                    if (connection.connectionId === payload.connectionId) {
                        return {
                            ...payload,
                            messages: connection.messages
                        };
                    }
                    return connection;
                });
            };
            requestedConnections = mapper(requestedConnections);
            pastConnections = mapper(pastConnections);
            activeConnections = mapper(activeConnections);
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
                pastConnections: sortConnections(pastConnections),
                requestedConnections,
            };
        }
        case GROUP_CALL_ACTIVE: {
            let {activeConnections} = state;
            activeConnections = activeConnections.map(connection => {
                if (connection.connectionId === payload.channelUrl && connection.type === 'CHAT_GROUP') {
                    return {
                        ...connection,
                        groupCallActive: payload.active,
                    };
                }
                return connection;
            });
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
            };
        }
        case GET_CONNECTIONS_FAILED: {
            return {
                ...state,
                isLoading: false,
                error: true,
                errorMsg: payload.errorMsg,
                connectionsFetchedFor: null
            };
        }
        case CONNECT:
        case DISCONNECT: {
            return {
                ...state,
                isLoading: true,
            };
        }
        case CONNECTION_FAILED: {
            return {
                ...state,
                isLoading: false,
            };
        }
        case CONNECTIONS_FETCHED: {
            let {activeConnections} = state;
            let newActive = payload.activeConnections;
            if(state.connectionsFetchedFor!==null) {
                activeConnections.forEach(connection=>{
                    newActive = payload.activeConnections.map(activeConnection=>{
                        if(connection.connectionId===activeConnection.connectionId) {
                            activeConnection.messages = connection.messages;
                            if(connection.progress) {
                                activeConnection.progress = connection.progress;
                            }
                        }

                        return activeConnection;
                    })
                })
            }
            return {
                ...state,
                isLoading: false,
                error: null,
                errorMsg: null,
                activeConnections: sortConnections(newActive),
                pastConnections: sortConnections(payload.pastConnections),
                requestedConnections: payload.requestedConnections,
                connectionsFetchedFor: payload.userId
            };
        }
        case CHAT_ADD_MESSAGE: {
            if (payload.type === 'typing') {
                return state;
            }
            const result = state.activeConnections.map(connection => {
                if (connection.connectionId === action.meta.contact.connectionId) {
                    return {
                        ...connection,
                        lastMessage: payload.text,
                        lastMessageTimestamp: new Date(payload.createdAt).getTime(),
                        lastMessageUnread: false,
                    };
                }
                return connection;
            });

            return {
                ...state,
                activeConnections: sortConnections(result),
            };
        }
        case LIVE_CHAT_ADD_MESSAGE: {
            let {activeConnections} = state;
            const {channelUrl} = action.payload;

            activeConnections = activeConnections.map(connection => {
                if (connection.channelUrl === channelUrl) {
                    return {
                        ...connection,
                        lastMessage: payload.message.text,
                        lastMessageTimestamp: payload.message.createdAt,
                        lastMessageUnread: false,
                    };
                }
                return connection;
            });
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
            };
        }
        case LIVE_CHAT_MARK_AS_READ: {
            let {activeConnections} = state;
            const {channelUrl} = payload;
            activeConnections = activeConnections.map(connection => {
                if (connection.channelUrl === channelUrl) {
                    return {
                        ...connection,
                        lastMessageUnread: false,
                    };
                }
                return connection;
            });
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
            };
        }
        case LIVE_CHAT_MESSAGE_RECEIVED: {
            let {activeConnections} = state;
            const {channelUrl, message, isDistinct} = action.payload;
            const isFile = message.type === 'file';
            if (isDistinct) {
                activeConnections = activeConnections.map(connection => {
                    if (channelUrl === connection.channelUrl) {
                        return {
                            ...connection,
                            lastMessage: isFile ? 'Attachment' : payload.message.text,
                            lastMessageTimestamp: payload.message.createdAt,
                            lastMessageUnread: true,
                        };
                    }
                    if (message.user._id === connection.connectionId) {
                        return {
                            ...connection,
                            lastMessage: isFile ? 'Attachment' : payload.message.text,
                            lastMessageTimestamp: payload.message.createdAt,
                            lastMessageUnread: true,
                            channelUrl: channelUrl,
                        };
                    }
                    return connection;
                });
            } else {
                activeConnections = activeConnections.map(connection => {
                    if (channelUrl === connection.channelUrl) {
                        return {
                            ...connection,
                            lastMessage: isFile ? 'Attachment' : payload.message.text,
                            lastMessageTimestamp: payload.message.createdAt,
                            lastMessageUnread: true,
                        };
                    }
                    return connection;
                });
            }
            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
            };
        }
        case CHAT_GROUP_UPDATED: {
            let {activeConnections, pastConnections} = state;
            const {channelUrl, groupName, profilePicture} = payload;
            activeConnections = activeConnections.map(connection => {
                if (connection.type === 'CHAT_GROUP' && channelUrl === connection.channelUrl) {
                    return {
                        ...connection,
                        name: groupName,
                        profilePicture: profilePicture,
                    };
                }
                return connection;
            });
            pastConnections = pastConnections.map(connection => {
                if (connection.type === 'CHAT_GROUP' && channelUrl === connection.channelUrl) {
                    return {
                        ...connection,
                        name: groupName,
                        profilePicture: profilePicture,
                    };
                }
                return connection;
            });

            return {
                ...state,
                activeConnections: sortConnections(activeConnections),
                pastConnections: sortConnections(pastConnections),
            };
        }
        case REFRESH_CHAT_TIMESTAMPS: {
            return {
                ...state,
                activeConnections: state.activeConnections,
                pastConnections: state.pastConnections,
            };
        }
        case USER_LOGOUT: {
            return DEFAULT;
        }

        case FETCH_CHATBOTS: {
            return {
                ...state,
                chatbotsLoading: true,
            };
        }
        case FETCH_CHATBOTS_FAILURE: {
            return {
                ...state,
                chatbotsLoading: false,
            };
        }
        case FETCH_CHATBOTS_SUCCESS: {
            return {
                ...state,
                chatbotsLoading: false,
                chatbotList: payload
            };
        }
        case FETCH_PENDING_CONNECTIONS: {
            return {
                ...state,
                isLoading: true
            };
        }
        case PENDING_CONNECTIONS_FAILED: {
            return {
                ...state,
                isLoading: false,
                error: true,
                errorMsg: payload.errorMsg,
            };
        }
        case PENDING_CONNECTIONS_FETCHED: {
            return {
                ...state,
                isLoading: false,
                pendingConnections: payload
            };
        }
        case FETCH_LIST_APPOINTMENT_ELIGIBLE_PROVIDERS: {
            return {
                ...state,
                isLoading: true
            };
        }
        case LIST_APPOINTMENT_ELIGIBLE_PROVIDERS_FAILED: {
            return {
                ...state,
                isLoading: false,
                error: true,
                errorMsg: payload.errorMsg,
            };
        }
        case LIST_APPOINTMENT_ELIGIBLE_PROVIDERS_FETCHED: {
            return {
                ...state,
                eligibleProviders: payload,
                isLoading: false
            };
        }
        case FETCH_ALL_GROUPS: {
            return {
                ...state,
                isLoading: true
            };
        }
        case ALL_GROUPS_FAILED: {
            return {
                ...state,
                isLoading: false,
                error: true,
                errorMsg: payload.errorMsg,
            };
        }
        case ALL_GROUPS_FETCHED: {
            return {
                ...state,
                allGroups: payload,
                isLoading: false
            };
        }
        default: {
            return state;
        }
    }
}
