import {call, cancel, cancelled, delay, fork, put, take, select} from "redux-saga/effects";
import {END, eventChannel} from "redux-saga";
import {
    CHAT_ADD_MESSAGE,
    CHAT_AUTO_REPLY_REGISTERED,
    CHAT_EXIT, CHAT_FETCH_NEXT_MSG,
    CHAT_HIDE_SINGLE_CHOICES,
    CHAT_INIT_FAILED,
    CHAT_INIT_SUCCESSFUL,
    CHAT_INITIALIZING,
    CHAT_LOAD_EARLIER,
    CHAT_LOADED_EARLIER,
    CHAT_LOADING_EARLIER, CHAT_PAUSE,
    CHAT_REQUEST_INITIALIZE, CHAT_RESUME,
    CHAT_SEND_MESSAGE,
    CHAT_SEND_MESSAGE_FAILED,
    CHAT_SEND_MESSAGE_IN_PROGRESS,
    CHAT_SEND_MESSAGE_SUCCESSFUL,
    CHAT_TOKEN_EXPIRED,
    CHAT_TYPING_DETECTED,
    CHAT_UPDATE_CONNECTION_STATUS
} from "./actions";
import ConversationService from "../../../services/Conversation.service";
import {ConnectionStatus} from "botframework-directlinejs";
import {ContentfulClient} from "ch-mobile-shared";
import uuid from "uuid";
import moment from "moment";
import {DirectLineClient} from "../../../lib/directline/DirectLineClient";
import {NETWORK_STATUS_CHANGED} from '../auth/actions';
import {FETCH_BOT_PROGRESS} from '../connections/actions';
let chatPaused = false;
let pendingSendActions = [];
const botMessageToGiftedMessage = botMessage => {
    const contentType =
        botMessage.type &&
        botMessage.attachments &&
        botMessage.attachments.length &&
        botMessage.attachments[0].contentType;

    if (
        (contentType === "message" ||
            contentType === "provider-message" ||
            contentType === "text-input" ||
            // contentType === "education" ||
            contentType === "single-message") &&
        !botMessage.text
    ) {
        botMessage.type = contentType;
        botMessage.text =
            botMessage.attachments &&
            botMessage.attachments.length &&
            botMessage.attachments[0].content.label;

    }
    if(contentType==='text-input') {
        botMessage.attachments[0].dataType = botMessage.attachments[0].content.dataType
    }
    if (contentType === 'education') {
        botMessage.type = contentType;
    }

    if (contentType === "single-select" || contentType === "multi-select") {
        botMessage.type = contentType;
        botMessage.quickReplies = {
            type: contentType === "single-select" ? "radio" : "checkbox",
            keepIt: false,
            values: []
        };

        for (const choice of botMessage.attachments[0].content.choices) {
            const value = choice.value || choice;
            botMessage.quickReplies.values.push({title: value, value: value});
        }
    }
    if (contentType === 'rating-scale') {
        botMessage.type = contentType;
        const ratingBlock = botMessage.attachments[0].content;
        botMessage.ratingScale = ratingBlock.ratingScale;
    }

    botMessage._id = botMessage.id;
    botMessage.createdAt = botMessage.timestamp;
    botMessage.timestamp = new Date(botMessage.timestamp).toLocaleString(
        "en-US",
        {hour: "numeric", minute: "numeric", hour12: true}
    );

    botMessage.user = {
        _id: botMessage.from.id,
        name: botMessage.from.name,
        avatar:
            "https://0.gravatar.com/avatar/c124d114e21b520e7d301505cca4b95e?s=32&d=identicon&r=G"
    };
    return botMessage;
};

const delayedEmitter = (response, defaultEmitter) => {
    setTimeout(() => {
        defaultEmitter(response);
    });
};

const createConnectionStatusChannel = () => {
    return eventChannel(emit => {
        const connectionStatusStream = DirectLineClient.getInstance().connectionStatus$;

        connectionStatusStream.subscribe(
            status => {
                delayedEmitter(status, emit);
            },
            error => {
                console.log(error);
                delayedEmitter(END, emit);
            },
            () => {
                delayedEmitter(END, emit);
            }
        );

        return () => {
            connectionStatusStream.unsubscribe();
        };
    });
};

const connectionStatusHandler = function* (action) {
    const statusChannel = yield call(createConnectionStatusChannel);
    try {
        while (true) {
            let status = yield take(statusChannel);
            yield put({
                type: CHAT_UPDATE_CONNECTION_STATUS,
                payload: {
                    status: status,
                    watermark: DirectLineClient.getInstance().watermark
                },
                meta: action.meta
            });
            if (status === ConnectionStatus.ExpiredToken) {
                console.log('DirectLine Token Expired. Dispatching EXPIRED Action to Refresh');
                yield put({
                    type: CHAT_TOKEN_EXPIRED
                });
                break;
            }
        }
    } catch (error) {
        console.log("Connection status handler threw an error...");
        console.log(error);
    } finally {
        console.log("Connection Status Handler terminated...");
        if (yield cancelled()) {
            //statusChannel.close();
        }
    }
};

const createActivityChannel = (conversationContextId) => {
    console.log('Creating new activity channel for directline');
    return eventChannel(emit => {
        const activityStream = DirectLineClient.getInstance().activity$;

        activityStream
            .filter(activity => {
                activity.watermark = DirectLineClient.getInstance().watermark;
                return (
                    activity.type !== "event" &&
                    activity.from.id !== conversationContextId
                );
            })
            .subscribe(
                activity => {
                    delayedEmitter(botMessageToGiftedMessage(activity), emit);
                },
                error => {
                    console.log(error);
                    delayedEmitter(END, emit);
                },
                () => {
                    delayedEmitter(END, emit);
                }
            );

        return () => {
            activityStream.unsubscribe();
        };
    });
};

const activityHandler = function* (
    action,
    conversationContextId
) {
    const activityChannel = yield call(
        createActivityChannel,
        conversationContextId
    );

    try {
        while (true) {
            let activity = yield take(activityChannel);
            const contentType =
                activity.type &&
                activity.attachments &&
                activity.attachments.length &&
                activity.attachments[0].contentType;

            //Set Avatar
            activity.user.avatar = action.meta.contact.profilePicture;

            if (activity.type === "typing") {
                yield put({
                    type: CHAT_TYPING_DETECTED,
                    payload: activity,
                    meta: action.meta
                });
            } else {
                if (contentType === "education") {
                    activity.attachments = yield call(
                        getContentfulData,
                        activity.attachments[0].content.educationContentSlug
                    );
                }
                const lastMessage = yield select(state => state.chat.chatMessages[0]);
                if(lastMessage) {
                    if(lastMessage._id!==activity._id) {
                        yield fork(function* () {
                            yield delay(1000);
                            yield put({
                                type: CHAT_ADD_MESSAGE,
                                payload: activity,
                                meta: action.meta
                            });
                        });
                    }
                } else {
                    yield fork(function* () {
                        yield delay(1000);
                        yield put({
                            type: CHAT_ADD_MESSAGE,
                            payload: activity,
                            meta: action.meta
                        });
                    });
                }


            }
        }
    } catch (error) {
        console.log("Activity Handler threw an error");
        console.log(error);
    } finally {
        console.log("Activity Handler terminated...");
        if (yield cancelled()) {
            console.log('Closing Activity Channel');
            activityChannel.close();
        }
    }
};

async function getContentfulData(slug) {
    const educationalContent = await ContentfulClient.getEntries({
        'content_type': 'educationalContent',
        'sys.id': slug
    });
    return [
        {
            contentType: "education",
            content: {
                educationContentSlug: slug,
                contentfulData:
                    educationalContent.total === 1 && educationalContent.items.length > 0
                        ? educationalContent.items[0].fields
                        : {}
            }
        }
    ];
}

function sendMessage(payload) {
    return DirectLineClient.getInstance().postActivity(payload).toPromise();
}

const sendMessageHandler = function* (action, delayAmount) {
    yield put({
        type: CHAT_SEND_MESSAGE_IN_PROGRESS,
        payload: action.payload,
        meta: action.meta
    });
    yield put({
        type: CHAT_HIDE_SINGLE_CHOICES,
    });
    try {
        /**
         * We need to put some delay if message is coming from Auto Reply worker
         */
        if (delayAmount !== 0) {
            console.log("Yielding delay of " + delayAmount);
            yield delay(delayAmount); // Removed Delay Time on QA
        }
        const response = yield call(sendMessage, action.payload);
        yield put({
            type: CHAT_SEND_MESSAGE_SUCCESSFUL,
            payload: {
                ...action.payload,
                response: response
            },
            meta: action.meta
        });
    } catch (error) {
        console.warn(error);
        yield put({
            type: CHAT_SEND_MESSAGE_FAILED,
            payload: {
                ...action.payload,
                response: error
            },
            meta: action.meta
        });
    } finally {
        console.log("exiting sender message handler...");
    }
};
const autoReplyHandler = function* (conversationContext) {
    try {
        while (true) {
            const {payload, meta} = yield take(CHAT_ADD_MESSAGE);
            if(chatPaused) {
                yield take(CHAT_RESUME);
                chatPaused = false;
            }
            /**
             * Auto Reply is only meant to register if last message was provider-message
             */
            if (
                (payload.type === "provider-message" || payload.type === "education"
                    || (payload.attachments && payload.attachments[0].contentType === 'provider-prompt')) &&
                payload.from.id !== conversationContext.patientId + "," + conversationContext.contactId
            ) {
                yield put({
                    type: CHAT_AUTO_REPLY_REGISTERED,
                    payload: payload,
                    meta: meta
                });

                const delayAmount = Math.round(payload.text.trim().split(/\s+/).length / 6) * 1000;
                yield fork(
                    sendMessageHandler,
                    {
                        type: CHAT_SEND_MESSAGE,
                        payload: {
                            from: {
                                id: conversationContext.patientId + "," + conversationContext.contactId,
                                name: "User" //TODO repalce when sender user name
                            },
                            type: "event",
                            text: payload._id,
                            userData: "event"
                        },
                        meta: meta
                    },
                    delayAmount
                );
                console.log("auto reply successful...");
            }
        }
    } catch (error) {
        console.log("Auto reply handler threw an error...");
        console.log(error);
    } finally {
        console.log("Auto reply handler exiting...");
    }
};

const loadEarlierHandler = function* () {
    while (true) {
        const {payload, meta} = yield take(CHAT_LOAD_EARLIER);
        yield put({type: CHAT_LOADING_EARLIER, payload: {}, meta: meta});
        try {
            let conversationHistory = yield call(
                ConversationService.getConversationHistory,
                meta.contact.connectionId,
                payload.watermark
            );

            if (!conversationHistory.errors) {
                conversationHistory = yield call(
                    processConversationHistory,
                    conversationHistory,
                    meta.contact
                );
                yield put({
                    type: CHAT_LOADED_EARLIER,
                    payload: {
                        conversationHistory: conversationHistory
                    },
                    meta: meta
                });
            }
        } catch (e) {
            yield put({
                type: CHAT_LOADED_EARLIER,
                payload: {
                    conversationHistory: []
                },
                meta: meta
            });
            console.log(e);
        }
    }
};

async function processConversationHistory(conversationHistory, contact, isFirstCall = false) {
    for (let message of conversationHistory) {
        message._id = uuid.v4();
        message.createdAt = message.timestamp;
        message.timestamp = moment(message.timestamp).format("LT");
        message.user = {
            _id:
                message.from === contact.connectionId
                    ? contact.connectionId
                    : message.from + "," + contact.connectionId,
            name: message.from === contact.connectionId ? contact.name : "User",
            avatar: message.from === contact.connectionId ? contact.profilePicture : ""
        };

        if (message.educationSlug) {
            message.type = "education";
            message.attachments = await getContentfulData(
                message.educationSlug
            );
        }
        if (message.type === "provider-prompt") {
            message.text = "Here is the list of providers";
            message.attachments = [
                {
                    contentType: "provider-prompt",
                    content: {}
                }
            ];
        }
        if (message.type === "telehealth-services") {
            message.text = "Learn more about our clinical services";
            message.attachments = [
                {
                    contentType: "telehealth-services",
                    content: {}
                }
            ];
        }
        if (message.type === "filtered-providers") {
            message.text = "Our coaches are available to meet with you";
            message.attachments = [
                {
                    contentType: "filtered-providers",
                    content: {popupText:message.popupText}
                }
            ];
        }
        if (isFirstCall) {
            if (message.type === "single-select") {
                if (message.choices && message.choices.length > 0) {
                    message.attachments = [
                        {
                            contentType: message.type,
                            content: {
                                choices: message.choices
                            }
                        }
                    ];
                }
            }
            if (message.type === 'multi-select') {
                if (message.choices && message.choices.length > 0) {
                    const choices = message.choices;
                    message.attachments = [
                        {
                            contentType: message.type,
                            content: {
                                choices
                            }
                        }
                    ];
                }
            }
            if (message.type === 'rating-scale') {
                message.attachments = [
                    {
                        contentType: message.type,
                    }
                ];
            }
            if (message.type === 'text-input') {
                console.log('Found');
                message.attachments = [
                    {
                        contentType: message.type,
                        dataType:message.dataType
                    }
                ];
            }
            if(message.type === 'activity') {
                message.attachments = [
                    {
                        contentType: message.type,
                        content: {
                            choices: message.choices,
                            activity: message.activity
                        }
                    }
                ];
            }
            if(message.type === 'payment') {
                message.attachments = [
                    {
                        content: {
                            type: 'payment'
                        },
                        contentType: message.type,
                    }
                ];
            }
        }

    }
    if (conversationHistory && conversationHistory.length > 0 && isFirstCall && !contact.archived) {
        if (conversationHistory[0].type === 'provider-message'
            || conversationHistory[0].type === 'provider-prompt'
            || conversationHistory[0].type === 'filtered-providers'
            || conversationHistory[0].type === 'telehealth-services'
        ) {
            const singleSelect = {};
            singleSelect._id = uuid.v4();
            singleSelect.user = {
                _id: contact.connectionId,
                name: contact.name,
                avatar: contact.profilePicture
            };
            singleSelect.text = 'We noticed you left the chat in the middle of a conversation. Let’s pickup where we left off.';
            singleSelect.type = 'single-select';
            singleSelect.attachments = [
                {
                    contentType: 'single-select',
                    content: {
                        choices: ['Get Started']
                    }
                }
            ];
            conversationHistory = [singleSelect, ...conversationHistory];
        }
    }

    return conversationHistory;
}


/**
 * Does the following
 * 1. Initialize chat flow, get conversation context, directline token etc
 * 2. Subscribe to connection status updates
 * 3. Subscribe to incoming activity stream & register auto reply for provider-message content block
 * 4. Attach sendMessage Handler
 * 5. Handle CHAT_EXIT actions to clean up chat and destroy everything
 */
export function* chatFlowHandler(action) {
    let {
        isConnectedBefore,
        watermark,
        conversationContext,
        pendingAutoReply
    } = action.payload;
    yield put({
        type: CHAT_INITIALIZING,
        payload: {},
        meta: action.meta
    });

    try {
        conversationContext = yield call(
            ConversationService.getChatToken,
            action.meta.contact.connectionId
        );

        if (conversationContext.errors) {
            throw new Error(
                "Error retreiving conversation context: " +
                JSON.stringify(conversationContext)
            );
        }

        DirectLineClient.createInstance(conversationContext.token);
        let conversationHistory = yield call(
            ConversationService.getConversationHistory,
            action.meta.contact.connectionId,
            watermark
        );
        conversationHistory = yield call(
            processConversationHistory,
            conversationHistory,
            action.meta.contact,
            true
        );


        // if (conversationHistory && conversationHistory.length > 0) {
        //     if (conversationHistory[0].type === 'provider-prompt' || conversationHistory[0].type === 'education') {
        //         yield fork(
        //             sendMessageHandler,
        //             {
        //                 type: CHAT_SEND_MESSAGE,
        //                 payload: {
        //                     from: {
        //                         id: conversationContext.patientId + "," + conversationContext.contactId,
        //                         name: "User" //TODO repalce when sender user name
        //                     },
        //                     type: "event",
        //                     text: 'Custom-random-id',
        //                     userData: "event"
        //                 },
        //                 meta: action.meta
        //             },
        //             0
        //         );
        //         console.log("auto reply successful...");
        //     }
        // }


        const connectionStatusWatcherTask = yield fork(
            connectionStatusHandler,
            action
        );

        const activityWatcherTask = yield fork(
            activityHandler,
            action,
            conversationContext.patientId + "," + conversationContext.contactId
        );

        // const autoReplyTask = yield fork(
        //     autoReplyHandler,
        //     conversationContext
        // );

        const nextMsgHandler = yield fork(getNextMessage, conversationContext);

        const directLineTokenRefreshTask = yield fork(directLineTokenRefreshHandler, conversationContext, action, connectionStatusWatcherTask, activityWatcherTask)

        const loadEarlierTask = yield fork(loadEarlierHandler);

        yield put({
            type: CHAT_INIT_SUCCESSFUL,
            payload: {
                conversationContext: conversationContext,
                connectionStatus: ConnectionStatus.Uninitialized,
                contact: action.payload.contact,
                watermark: conversationHistory.length,
                isConnectedBefore: true,
                conversationHistory: conversationHistory
            },
            meta: action.meta
        });
        const activeConnections = yield select(state=>state.connections.activeConnections);
        const currentConnection = activeConnections.find(connection=>connection.connectionId===action.meta.contact.connectionId);
        if (conversationHistory.length === 0 || (currentConnection && currentConnection.progress && currentConnection.progress.percentage === 0)) {
            console.log('1st message auto triggering');
            pendingAutoReply = true;
        }
        if (pendingAutoReply) {
            yield call(
                sendMessageHandler,
                {
                    type: CHAT_SEND_MESSAGE,
                    payload: {
                        from: {
                            id: conversationContext.patientId + "," + conversationContext.contactId,
                            name: action.meta.contact.name
                        },
                        type: "event",
                        text: "Ping"
                    },
                    meta: action.meta
                }, 0
            );
        }

        while (true) {
            const action = yield take(CHAT_SEND_MESSAGE);
            const networkConnected = yield select(state=>state.auth.networkConnected);
            if(networkConnected) {
                yield fork(sendMessageHandler, action, 0);
            } else {
                pendingSendActions.push(action);
            }

        }
    } catch (error) {
        yield put({
            type: CHAT_INIT_FAILED,
            payload: error,
            meta: action.meta
        });
    } finally {
        if (yield cancelled()) {
            console.log("ChatFlow closing...");
        }
    }
}

function* getNextMessage(conversationContext) {
    while(true) {
        const {payload, meta} = yield take(CHAT_FETCH_NEXT_MSG);
        const action = {
            type: CHAT_SEND_MESSAGE,
            payload: {
                from: {
                    id: conversationContext.patientId + "," + conversationContext.contactId,
                    name: "User" //TODO repalce when sender user name
                },
                type: "event",
                text: payload._id,
                userData: "event"
            },
            meta: meta
        };
        const networkConnected = yield select(state=>state.auth.networkConnected);
        if(networkConnected) {
            yield fork(sendMessageHandler, action, 0);
        } else {
            console.log('Going to pending');
            pendingSendActions.push(action);
        }
    }

}

function* directLineTokenRefreshHandler(conversationContext, action, connectionStatusWatcherTask, activityWatcherTask) {
    while (true) {
        yield take(CHAT_TOKEN_EXPIRED);
        // yield cancel([connectionStatusWatcherTask, activityWatcherTask]);
        const response = yield call(ConversationService.refreshDirectLineToken);
        if (response.errors) {
            console.log('Error refreshing token');
            console.log(response.errors);
        } else {
            console.log('Directline token refreshed');
            // DirectLineClient.getInstance().end();
            DirectLineClient.createInstance(conversationContext.token);
            yield put({
                type: CHAT_UPDATE_CONNECTION_STATUS,
                payload: {
                    status: ConnectionStatus.Online,
                }
            });
            // connectionStatusWatcherTask = yield fork(
            //     connectionStatusHandler,
            //     action
            // );
            //
            // activityWatcherTask = yield fork(
            //     activityHandler,
            //     action,
            //     conversationContext.patientId + "," + conversationContext.contactId
            // );

            // autoReplyTask = yield fork(
            //     autoReplyHandler,
            //     conversationContext
            // );
        }
    }
}

function* chatPausedHandler(){
    while(true) {
        yield take(CHAT_PAUSE);
        chatPaused = true;
    }
}

function* botNetworkReInitializer() {
    while(true) {
        yield take(NETWORK_STATUS_CHANGED);
        const isConnected = yield select(state=>state.auth.networkConnected);
        if(isConnected) {
            yield put({
                type: CHAT_TOKEN_EXPIRED
            });
            if(pendingSendActions.length>0) {
                for(let action of pendingSendActions) {
                    yield fork(sendMessageHandler, action, 0);

                }
                pendingSendActions = [];
            }
        }
    }
}

export default function* chatSaga() {
    while (true) {
        const action = yield take(CHAT_REQUEST_INITIALIZE);
        const chatFlowHandle = yield fork(chatFlowHandler, action);
        const chatPauseHandle = yield fork(chatPausedHandler, action);
        const networkHandler = yield fork(botNetworkReInitializer, action);
        const nextAction = yield take([CHAT_EXIT, CHAT_INIT_FAILED]);
        if (nextAction.type === CHAT_EXIT) {
            try {
                yield cancel(chatFlowHandle);
                yield cancel(chatPauseHandle);
                yield cancel(networkHandler);
                yield put({
                    type: FETCH_BOT_PROGRESS,
                    payload: action.meta.contact.connectionId
                })
                chatPaused = false;
            } catch (error) {
                console.log(error);
            }
        }
    }
}
