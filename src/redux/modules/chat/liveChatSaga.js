import {call, cancel, fork, put, select, take} from 'redux-saga/effects';
import {
    LIVE_CHAT_ADD_MESSAGE,
    LIVE_CHAT_EXIT,
    LIVE_CHAT_INIT_FAILED,
    LIVE_CHAT_INITIALIZE,
    LIVE_CHAT_INITIALIZING,
    LIVE_CHAT_MARK_AS_READ, LIVE_CHAT_MEDIA_SENT, LIVE_CHAT_MEDIA_UPLOADED,
    LIVE_CHAT_MESSAGE_RECEIVED,
    LIVE_CHAT_READY, LIVE_CHAT_SEND_ATTACHMENT,
    LIVE_CHAT_SEND_MESSAGE,
} from './actions';
import {eventChannel} from 'redux-saga';
import {AlertUtil, SendBirdAction, SendBirdChatEvent, uuid4} from 'ch-mobile-shared';
import {UPDATED_CHANNEL_URL} from '../connections/actions';
import ConversationService from '../../../services/Conversation.service';
import NavigationService from '../../../services/NavigationService';
import {Screens} from '../../../constants/Screens';
import Sendbird from 'sendbird';
const connectionStatus = {
    connecting: 0,
    connected: 1,
    fetchingMessages: 2,
    promptRequired: 3,
    readyToChat: 4,
    failedToConnect: 5,
    closed: 6,
};

const mapMessageToGiftedChat = (message) => {
    const giftedMessage = {
        _id: message.messageId,
        text: message.message,
        createdAt: message.createdAt,
        type: message.messageType,
        fileMeta: message.messageType === 'file' ? {
            url: message.url,
            type: message.type,
        } : null,
        system: message.messageType && message.messageType === 'admin',

    };
    if (giftedMessage.system) {
        giftedMessage.user = {
            _id: message.messageId,
            name: 'System',
        };
    } else {
        giftedMessage.user = {
            _id: message.sender.userId,
            name: message.sender.nickname,
            avatar: message.sender.profileUrl,
        };
    }
    return giftedMessage;
};

export const getArtificialLoadingMediaMessage = (message, meta) => {
    const giftedMessage = {
        _id: message._id,
        text: null,
        createdAt: new Date().getTime(),
        type: 'file',
        fileMeta: {
            url: message.file.uri,
            type: message.file.type,
            loading: true,
            progress: 0
        },
        system: false,

    };
    if (giftedMessage.system) {
        giftedMessage.user = {
            _id: message.messageId,
            name: 'System',
        };
    } else {
        giftedMessage.user = {
            _id: meta.userId,
            name: meta.nickname,
        };
    }
    return giftedMessage;
};

function* silentChatRefresher(action, dispatch) {
    const {provider} = action.payload;
    let {channelUrl,connectionId} = provider;
    const sendBirdAction = yield call(SendBirdAction.getInstance);
    const sendBirdChannel = yield call(getSBChannel, channelUrl, connectionId);
    let chatMessages = yield call(sendBirdAction.getMessageList, sendBirdChannel, true);
    if (chatMessages) {
        chatMessages = chatMessages.map(mapMessageToGiftedChat);
        let connectionStatusFlag = connectionStatus.readyToChat;
        yield call(markMessagesAsRead, channelUrl, sendBirdAction, sendBirdChannel);
        yield put({
            type: LIVE_CHAT_READY,
            payload: {
                connectionStatus: connectionStatusFlag,
                chatMessages,
                channelUrl,
            },
        });
    }
    yield fork(messageSenderTask, sendBirdAction, sendBirdChannel, dispatch, provider);
    yield fork(mediaSenderTask, sendBirdAction, sendBirdChannel, dispatch, provider);


}

function* getSBChannel(channelUrl,userId) {
    let sendBirdChannel = null;
    const sendBirdAction = yield call(SendBirdAction.getInstance);
    if (channelUrl) {
        sendBirdChannel = yield call(sendBirdAction.getChannel, channelUrl, false);
    } else {
        const channel = yield call(ConversationService.getChannelUrl, userId);
        if (channel.errors || channel.channelUrl === null) {
            console.log(channel.errors);
            AlertUtil.showErrorMessage('Chat service is unavailable at the moment. Please try again later.');
            yield put({
                type: LIVE_CHAT_INITIALIZING,
                payload: {
                    connectionStatus: connectionStatus.failedToConnect,
                },
            });
            yield put({
                type: LIVE_CHAT_EXIT,
            });
        } else {
            channelUrl = channel.channelUrl;
            yield put({
                type: UPDATED_CHANNEL_URL,
                payload: {
                    connectionId: userId,
                    channelUrl,
                },
            });
            sendBirdChannel = yield call(sendBirdAction.getChannel, channelUrl, false);
        }
    }
    return sendBirdChannel;
}

function* liveChatFlowHandler(action, dispatch) {
    yield put({
        type: LIVE_CHAT_INITIALIZING,
        payload: {
            connectionStatus: connectionStatus.connecting,
        },
    });
    const {provider} = action.payload;
    let {channelUrl} = provider;
    const meta = yield select(state => state.auth.meta);
    const sendBirdAction = yield call(SendBirdAction.getInstance);
    let sendBirdChannel = null;
    let newChannel = false;
    try {
        sendBirdChannel = yield call(getSBChannel, channelUrl, provider.connectionId);
    } catch (error) {
        console.log(error);
        sendBirdChannel = null;
        // if (error.code === 400201) {
        //         console.log('Channel not found So creating a new channel');
        //     sendBirdChannel = yield call(sendBirdAction.createGroupChannel, channelName, channelUrl, provider.connectionId, meta.userId);
        //         newChannel = true;
        //     }
    }
    if (sendBirdChannel) {
        console.log('LiveChat Channel Initialized');
        if (newChannel) {

            yield put({
                type: LIVE_CHAT_READY,
                payload: {
                    connectionStatus: connectionStatus.readyToChat,
                    chatMessages: [],
                    channelUrl,
                },
            });
        } else {
            yield put({
                type: LIVE_CHAT_INITIALIZING,
                payload: {
                    connectionStatus: connectionStatus.fetchingMessages,
                },
            });
            let chatMessages = yield call(sendBirdAction.getMessageList, sendBirdChannel, true);
            if (chatMessages) {
                chatMessages = chatMessages.map(mapMessageToGiftedChat);
                let connectionStatusFlag = connectionStatus.readyToChat;
                yield call(markMessagesAsRead, channelUrl, sendBirdAction, sendBirdChannel);
                yield put({
                    type: LIVE_CHAT_READY,
                    payload: {
                        connectionStatus: connectionStatusFlag,
                        chatMessages,
                        channelUrl,
                    },
                });
            }
        }
        // yield fork(dataSharePromptHandler, provider, patient);
        yield fork(messageSenderTask, sendBirdAction, sendBirdChannel, dispatch, provider);
        yield fork(mediaSenderTask, sendBirdAction, sendBirdChannel, dispatch, provider);
    } else {
        console.log('Unable to initialize sendbird channel');
        yield put({
            type: LIVE_CHAT_INIT_FAILED,
            payload: {
                connectionStatus: connectionStatus.failedToConnect,
            },
        });
    }
}

function* markMessagesAsRead(channelUrl, sendBirdAction, sendBirdChannel) {
    if (!sendBirdAction) {
        console.log('No channel supplied. Getting channel instance');
        sendBirdAction = SendBirdAction.getInstance();
        sendBirdChannel = yield call(sendBirdAction.getChannel, channelUrl, false);
    }
    console.log('Marking all Messages as read');
    yield call(sendBirdAction.markAsRead, sendBirdChannel);
    yield call(dispatchMarkAsReadAction, channelUrl);
}

function* dispatchMarkAsReadAction(channelUrl) {
    yield put({
        type: LIVE_CHAT_MARK_AS_READ,
        payload: {
            channelUrl,
        },
    });
}

const createChatEventChannel = (channelEvent) => {
    return eventChannel(emit => {
        channelEvent.onMessageReceived = (channel, message) => {
            emit({message, channelUrl: channel.url, type: 'MessageReceived', isDistinct: channel.isDistinct});
        };
        channelEvent.onMessageUpdated = (channel, message) => {
            // if (connectedChannel.url === channel.url) {
            //     emit({message, type: 'MessageUpdated'});
            // }
        };
        return () => {
            // connectionStatusStream.unsubscribe();
        };
    });
};


function* sendBirdFileSender(sbAction, payload, channel, provider, dispatch) {
    const handlerCB = (success, error) => {
        if (success) {
            dispatch({
                type: LIVE_CHAT_MEDIA_SENT,
                payload: {
                    _id: payload._id,
                    channelUrl: channel.url,
                    location: payload.location,
                }, meta: {
                    contact: {
                        provider,
                    },
                },
            });
        } else {
            console.log('Sendbird error sending media');
            console.log(error);
        }
    };
    try {
        const sb = Sendbird.getInstance();
        const params = new sb.FileMessageParams();
        params.fileUrl = payload.location;             // Or .fileUrl  = FILE_URL (You can also send a file message with a file URL.)
        params.mimeType = payload.type;
        const requestPayload = {
            channel: channel,
            file: params,
            handler: handlerCB,
        };
        yield call(sbAction.sendFileMessage, requestPayload);
    } catch (e) {
        console.log('Sendbird error sending media');
        console.log(e);
    }
}

function* mediaSenderTask(sendBirdAction, connectedChannel, dispatch, provider) {
    while (true) {
        const {payload} = yield take(LIVE_CHAT_MEDIA_UPLOADED);
        yield fork(sendBirdFileSender, sendBirdAction, payload, connectedChannel, provider, dispatch);
    }
}

function* messageSenderTask(sendBirdAction, connectedChannel, dispatch, provider) {
    try {
        while (true) {
            const action = yield take(LIVE_CHAT_SEND_MESSAGE);
            if (action.payload.message.hasFile) {

                const attachment = {
                    channel: {
                        channelUrl: connectedChannel.url,
                    },
                    file: action.payload.message.fileData,
                };
                const meta = yield select(state => state.auth.meta);

                yield put({
                    type: LIVE_CHAT_SEND_ATTACHMENT,
                    payload: {
                        ...attachment,
                        _id: uuid4(),
                        meta,
                    },
                });


            } else {

                let acceptInvitationAttempted = false;
                const originalMessage = action.payload.message;
                const handlerCallback = function (sentMessage, error) {
                    if (sentMessage) {
                        if (sentMessage.errorCode === 900023) {
                            connectedChannel.acceptInvitation((response, error) => {
                                if (!acceptInvitationAttempted) {
                                    acceptInvitationAttempted = true;
                                    if (error) {
                                        return;
                                    }
                                    sendBirdAction.sendUserMessage({
                                        channel: connectedChannel,
                                        message: originalMessage.text,
                                        handler: handlerCallback,
                                    });
                                } else {
                                    AlertUtil.showErrorMessage('Unable to send messages. Your invitation status is still pending');
                                }
                            });
                        } else {
                            dispatch({
                                type: LIVE_CHAT_ADD_MESSAGE,
                                payload: {
                                    message: originalMessage,
                                    channelUrl: connectedChannel.url,
                                }, meta: {
                                    contact: {
                                        provider,
                                    },
                                },
                            });
                        }
                    } else {
                        console.log(error);
                    }
                };
                const requestPayload = {
                    channel: connectedChannel,
                    message: originalMessage.text,
                    handler: handlerCallback,
                };
                yield call(sendBirdAction.sendUserMessage, requestPayload);
            }
        }
    } catch (e) {
        console.log('Message Sender Task threw an error');
        console.log(e);
    }
}

export function* incomingMessageHandler() {
    const chatEvent = yield call(SendBirdChatEvent.getInstance);
    const chatEventChannel = yield call(createChatEventChannel, chatEvent);
    console.log('SendBird Receiver Initialized');
    try {
        while (true) {
            const {message, channelUrl, isDistinct} = yield take(chatEventChannel);
            yield put({
                type: LIVE_CHAT_MESSAGE_RECEIVED,
                payload: {
                    message: mapMessageToGiftedChat(message),
                    channelUrl,
                    isDistinct,
                },
            });
            const currentNavParams = NavigationService.getCurrentRouteParams();
            if (currentNavParams.routeName === Screens.LIVE_CHAT_WINDOW_SCREEN) {
                const {connection} = currentNavParams.params;
                if (connection.channelUrl === channelUrl) {
                    console.log('Chat for this channel is open');
                    yield call(markMessagesAsRead, channelUrl);
                }
            }
        }
    } catch (e) {
        console.log('ChatEventChannel threw an error');
        console.log(e);
    }
}

export default function* liveChatSaga(store) {
    let chatFlowHandle;
    while (true) {
        const action = yield take(LIVE_CHAT_INITIALIZE);
        if (chatFlowHandle) {
            try {
                yield cancel(chatFlowHandle);
            } catch (error) {
                console.log(error);
            }
        }
        if (action.payload.provider.messages) {
            yield put({
                type: LIVE_CHAT_READY,
                payload: {
                    connectionStatus: connectionStatus.readyToChat,
                    chatMessages: action.payload.provider.messages,
                    channelUrl: action.payload.provider.channelUrl,
                },
            });
            chatFlowHandle = yield fork(silentChatRefresher, action, store.dispatch);
        } else {
            chatFlowHandle = yield fork(liveChatFlowHandler, action, store.dispatch);
        }

        // const nextAction = yield take([LIVE_CHAT_INIT_FAILED, LIVE_CHAT_EXIT]);
        // if (nextAction.type === LIVE_CHAT_EXIT) {
        //     try {
        //         yield cancel(chatFlowHandle);
        //     } catch (error) {
        //         console.log(error);
        //     }
        // }
    }
}
