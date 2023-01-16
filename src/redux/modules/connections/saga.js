import {all, call, cancel, fork, put, select, take} from 'redux-saga/effects';
import {
    ARCHIVE_CONNECTION,
    ARCHIVE_CONNECTION_FAILED,
    BOT_PROGRESS_UPDATED,
    CONNECT,
    CONNECTION_FAILED,
    CONNECTIONS_FETCHED,
    DISCONNECT,
    DISCONNECTED,
    DISCONNECTING,
    FETCH_ALL_BOTS_PROGRESS,
    FETCH_BOT_PROGRESS,
    FETCH_CHATBOTS,
    FETCH_CHATBOTS_FAILURE,
    FETCH_CHATBOTS_SUCCESS,
    GET_CONNECTIONS,
    GET_CONNECTIONS_FAILED,
    GET_CONNECTIONS_SILENT,
    GET_SPECIFIC_CONNECTION,
    FETCH_PENDING_CONNECTIONS,
    PENDING_CONNECTIONS_FAILED,
    PENDING_CONNECTIONS_FETCHED,
    REFRESH_CHAT_TIMESTAMPS,
    RESTART_CHATBOT,
    RESTART_CHATBOT_FAILED,
    SPECIFIC_CONNECTION_FETCHED,
    FETCH_LIST_APPOINTMENT_ELIGIBLE_PROVIDERS,
    LIST_APPOINTMENT_ELIGIBLE_PROVIDERS_FAILED,
    LIST_APPOINTMENT_ELIGIBLE_PROVIDERS_FETCHED,
    FETCH_ALL_SERVICES,
    ALL_SERVICES_FAILED,
    ALL_GROUPS_FETCHED,
    ALL_SERVICES_FETCHED, FETCH_ALL_GROUPS, ALL_GROUPS_FAILED,
} from './actions';
import {APPOINTMENTS_FETCH} from '../appointments/actions';
import ProfileService from '../../../services/Profile.service';
import {incomingMessageHandler} from '../chat/liveChatSaga';
import {eventChannel} from 'redux-saga';
import {AlertUtil, SendBirdAction, SendBirdConnection, SocketClient, AVATAR_COLOR_ARRAY} from 'ch-mobile-shared';
import {USER_TYPE} from '../../../constants/CommonConstants';
import {SOCKET_CONNECTED, SOCKET_DISCONNECTED, USER_LOGGED_IN_SUCCESSFUL, USER_LOGOUT} from '../auth/actions';
import NavigationService from '../../../services/NavigationService';
import {Screens} from '../../../constants/Screens';
import {
    LIVE_CHAT_MARK_AS_READ,
    LIVE_CHAT_MEDIA_UPLOAD_PROGRESS,
    LIVE_CHAT_MEDIA_UPLOADED,
    LIVE_CHAT_SEND_ATTACHMENT,
    SENDBIRD_CONNECT_FAILED,
    SENDBIRD_CONNECTED,
    SENDBIRD_CONNECTING,
    SENDBIRD_RECONNECT,
    SENDBIRD_RECONNECTING,
} from '../chat/actions';
import {S3MediaManager} from '../../../services/S3MediaManager';
import ConversationService from '../../../services/Conversation.service';
import AppointmentService from "../../../services/Appointment.service";
import ScheduleService from "../../../services/ScheduleService";

let msgReceiver, refreshTask;

function* getConnectionsHandler(dispatch) {


    while (true) {
        const {type} = yield take([GET_CONNECTIONS, GET_CONNECTIONS_SILENT]);
        const response = yield call(ProfileService.getConnections);
        if (type === GET_CONNECTIONS) {
            if (msgReceiver) {
                yield cancel(msgReceiver);
            }
            if (refreshTask) {
                yield cancel(refreshTask);
            }
        }

        if (response.errors) {
            yield put({
                type: GET_CONNECTIONS_FAILED, payload: {
                    errorMsg: response.errors[0].endUserMessage,
                },
            });
        } else {
            const meta = yield select(state => state.auth.meta);
            const activeConnections = addColorCode(response.activeConnections);
            const pastConnections = addColorCode(response.pastConnections);

            yield put({
                type: CONNECTIONS_FETCHED, payload: {
                    activeConnections: getTimeFormattedConnections(activeConnections, meta.userId),
                    pastConnections: getTimeFormattedConnections(pastConnections, meta.userId),
                    requestedConnections: response.requestedConnections ? response.requestedConnections : [],
                    userId: meta.userId,
                },
            });
            yield put({type: FETCH_PENDING_CONNECTIONS});
            yield put({type: FETCH_ALL_BOTS_PROGRESS});
            if (type === GET_CONNECTIONS) {
                refreshTask = yield fork(chatListTimestampRefresher)
                const socket = SocketClient.getInstance().getConnectedSocket();
                if (socket) {
                    socket.off('appt-changed');
                    socket.off('refresh-connections');
                    socket.off('user-disconnected-by');
                    SocketClient.getInstance().unregisterConnectivityCallbacks('GlobalSocketWatcher');
                    SocketClient.getInstance().registerConnectivityCallbacks('GlobalSocketWatcher', () => {
                        dispatch({
                            type: SOCKET_DISCONNECTED,
                        });
                    }, () => {
                        dispatch({
                            type: SOCKET_CONNECTED,
                        });
                    });
                    socket.on('refresh-connections', (data) => {
                        console.log('Got a refresh event');
                        dispatch({
                            type: GET_SPECIFIC_CONNECTION,
                            payload: {
                                connectionId: data.connectionId,
                            },
                        });
                    });
                    socket.on('user-disconnected-by', (data) => {
                        console.log('Got a disconnected event');
                        AlertUtil.showMessage('You\'re disconnected by ' + data.userName, 'Close', 'top', 'warning');
                        dispatch({
                            type: GET_CONNECTIONS,
                            payload: {
                                refresh: true,
                            },
                        });
                    });
                    socket.on('appt-changed', (data) => {
                        console.log('Got an appointment status change event');
                        AlertUtil.showSuccessMessage(data.data.message);
                        dispatch({
                            type: APPOINTMENTS_FETCH,
                        });
                    });
                }
            }


        }
    }
}

function chatConnectionStatusChannel(user) {
    console.log('Watching Sendbird Connection');
    return eventChannel(emitter => {
        const iv = setInterval(() => {
            emitter(SendBirdAction.getInstance().sb.getConnectionState());
        }, 2000);
        return () => {
            clearInterval(iv);
        };
    });
}

function* fetchChatbots() {
    while (true) {
        yield take(FETCH_CHATBOTS);
        try {
            const conversations = yield call(ConversationService.getConversations);
            if (conversations.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                yield put({type: FETCH_CHATBOTS_FAILURE})
            } else {
                yield put({type: FETCH_CHATBOTS_SUCCESS, payload: conversations})
            }
        } catch (error) {
            AlertUtil.showErrorMessage(error);
            yield put({type: FETCH_CHATBOTS_FAILURE})

        }
    }

}

function* chatConnectionWatcher() {
    const statusChannel = yield call(chatConnectionStatusChannel);
    while (true) {
        const status = yield take(statusChannel);
        const sendbirdStatus = yield select(state => state.chat.sendbirdStatus);
        switch (status) {
            case 'CLOSED': {
                yield put({
                    type: SENDBIRD_CONNECT_FAILED,
                });
                SendBirdAction.getInstance().sb.reconnect();
                break;
            }
            case 'CONNECTING': {
                if (sendbirdStatus !== 3) {
                    yield put({
                        type: SENDBIRD_RECONNECTING,
                    });
                }
                break;
            }
            case 'OPEN': {
                if (sendbirdStatus !== 2) {
                    yield put({
                        type: SENDBIRD_CONNECTED,
                    });
                }

            }
        }
    }
}


function* connectSendBird(dispatch) {
    let watcher = null;
    while (true) {
        const action = yield take([USER_LOGGED_IN_SUCCESSFUL, SENDBIRD_RECONNECT]);
        if (watcher) {
            yield cancel(watcher);
        }
        const meta = yield select(state => state.auth.meta);
        try {
            if (action.type === USER_LOGGED_IN_SUCCESSFUL) {
                SocketClient.getInstance().connect(meta.userId, USER_TYPE);
                yield put({
                    type: SOCKET_CONNECTED,
                });
                yield put({
                    type: SENDBIRD_CONNECTING,
                });
            }

            const {nickname, userId} = meta;
            console.log('Connecting Sendbird for ' + nickname + ' having id ' + userId);
            const sendBird = yield call(SendBirdAction.getInstance);
            const sendBirdUser = yield call(sendBird.connect, userId, nickname);
            if (sendBirdUser) {
                const sendBirdConnection = yield call(SendBirdConnection.getInstance);
                sendBirdConnection.remove();
                sendBirdConnection.add(null, () => {
                    console.log('Sendbird Reconnected');
                    dispatch({
                        type: GET_CONNECTIONS_SILENT,
                    });
                }, null);
                yield fork(incomingMessageHandler);
                watcher = yield fork(chatConnectionWatcher);
                yield put({
                    type: SENDBIRD_CONNECTED,
                });
                yield take(USER_LOGOUT);
                yield cancel(watcher);
            } else {
                console.log('Failed to fetch sendbird user information... SendBird Connect returned null.');
                setTimeout(() => {
                    dispatch({
                        type: SENDBIRD_RECONNECTING,
                    });
                    dispatch({
                        type: SENDBIRD_RECONNECT,
                    });
                }, 1000);
            }
        } catch (e) {
            console.log('Send Bird Issue');
            console.log(e);
            setTimeout(() => {
                dispatch({
                    type: SENDBIRD_RECONNECTING,
                });
                dispatch({
                    type: SENDBIRD_RECONNECT,
                });
            }, 1000);
        }
    }

}

function timerChannel() {
    return eventChannel(emitter => {
            const iv = setInterval(() => {
                emitter({});
            }, 60 * 1000);
            return () => {
                clearInterval(iv);
            };
        },
    );
}


function* chatListTimestampRefresher() {
    const repeatChannel = yield call(timerChannel);
    while (true) {
        yield take(repeatChannel);
        yield put({
            type: REFRESH_CHAT_TIMESTAMPS,
            payload: {},
        });
    }
}


const getTimeFormattedConnections = (connections, currentUserId) => {
    return connections.filter(connection => connection.name && connection.name.length > 0).map(connection => {
            return formatTimeForConnection(connection, currentUserId);
        },
    );
};

const addColorCode = (connections) => {

    if (connections && connections.length > 0) {
        connections = connections.map((item, index) => {
            if (!item.profilePicture) {
                item.colorCode = AVATAR_COLOR_ARRAY[index % AVATAR_COLOR_ARRAY.length];
            }
            return item;

        });
    }
    return connections;

};

const formatTimeForConnection = (connection, currentUserId) => {
    let timestamp = null;
    if (connection.lastMessageTimestamp) {
        let timeString = connection.lastMessageTimestamp;
        if (timeString.indexOf('-') === -1) {
            timeString = parseInt(connection.lastMessageTimestamp);
        }
        timestamp = new Date(timeString).getTime();
    }
    connection.lastMessageTimestamp = timestamp;
    if (connection.type === 'PRACTITIONER') {
        connection.nickname = connection.name;
        connection.userId = connection.connectionId;
    }
    return connection;
};


function* connectHandler() {
    while (true) {
        const {payload} = yield take(CONNECT);
        const connectResponse = yield call(ProfileService.connectWithUser, payload.userId);
        if (connectResponse.errors) {
            console.log(connectResponse.errors[0].endUserMessage);
            yield put({
                type: CONNECTION_FAILED,
            });
            yield put({
                type: GET_CONNECTIONS, payload: {
                    refresh: true,
                },
            });
            if (payload.onFailure) {
                payload.onFailure(connectResponse);
            }
        } else {
            AlertUtil.showSuccessMessage('Connection request sent');
            yield put({
                type: GET_CONNECTIONS, payload: {
                    refresh: true,
                },
            });
            if (payload.onSuccess) {
                payload.onSuccess();
            }
        }
    }
}

function* disconnectHandler() {
    while (true) {
        const {payload} = yield take(DISCONNECT);
        console.log('PAYLOAD', payload);
        yield put({type: DISCONNECTING});
        const disconnectResponse = yield call(ProfileService.disconnectProvider, payload.userId);
        if (disconnectResponse.errors) {
            console.log('Failed to disconnect');
            AlertUtil.showErrorMessage(disconnectResponse.errors[0].endUserMessage);
        } else {
            yield put({type: DISCONNECTED});

        }
        yield put({
            type: GET_CONNECTIONS,
            payload: {
                refresh: true,
            },
        });
    }
}

function* specificConnectionUpdateHandler() {
    while (true) {
        const {payload} = yield take(GET_SPECIFIC_CONNECTION);
        const {userId} = yield select(state => state.auth.meta);
        const response = yield call(ProfileService.getSpecificConnection, payload.connectionId);
        if (response.errors) {
            console.log(response.errors[0].endUserMessage);
        } else {
            yield put({
                type: SPECIFIC_CONNECTION_FETCHED, payload: formatTimeForConnection(response, userId),
            });
            const currentNavParams = NavigationService.getCurrentRouteParams();
            if (currentNavParams.routeName === Screens.LIVE_CHAT_WINDOW_SCREEN) {
                const {connection} = currentNavParams.params;
                if (payload.connectionId === connection.connectionId) {
                    yield put({
                        type: LIVE_CHAT_MARK_AS_READ,
                        payload: {
                            channelUrl: connection.channelUrl,
                        },
                    });
                }
            }
        }
    }
}

function* attachmentSender(dispatch) {
    while (true) {

        const {payload} = yield take(LIVE_CHAT_SEND_ATTACHMENT);
        yield fork(awsMediaUploader, payload, dispatch);
    }
}


function* awsMediaUploader(payload, dispatch) {
    try {
        const response = yield call(S3MediaManager.uploadChatMedia, {
            ...payload.file,
            contentType: payload.file.type,

        }, (e) => {
            const progress = e.percent * 100;
            dispatch({
                type: LIVE_CHAT_MEDIA_UPLOAD_PROGRESS,
                payload: {
                    ...payload,
                    progress,

                },
            });
        });
        if (response.success) {
            yield put({
                type: LIVE_CHAT_MEDIA_UPLOADED,
                payload: {
                    channelUrl: payload.channel.channelUrl,
                    _id: payload._id,
                    type: payload.file.type,
                    location: response.response.location,
                },
            });
        } else {
            AlertUtil.showErrorMessage('Media storage service failed to upload attachment');
        }
    } catch (e) {
        console.log(e);
        AlertUtil.showErrorMessage('Unable to send attachment');
    }
}

function* allBotsProgressUpdater() {
    while (true) {
        yield take(FETCH_ALL_BOTS_PROGRESS);
        const activeConnections = yield select(state => state.connections.activeConnections);
        const botConnections = activeConnections.filter(connection => connection.type === 'CHAT_BOT' && !connection.archived);
        for (let connection of botConnections) {
            yield fork(updateBotProgress, connection.connectionId);
        }
    }
}

function* updateBotProgress(connectionId) {
    const response = yield call(ConversationService.getConversationProgress, connectionId);
    if (response.errors) {
        console.log("Error fetching progress for contact " + connectionId);
        console.log(response.errors[0].endUserMessage);
    } else {
        yield put({
            type: BOT_PROGRESS_UPDATED,
            payload: response
        })
    }
}

function* updateProgressEffectListener() {
    while (true) {
        const {payload} = yield take(FETCH_BOT_PROGRESS);
        yield fork(updateBotProgress, payload);
    }
}

function* connectionArchiver() {
    while (true) {
        const {payload} = yield take(ARCHIVE_CONNECTION);
        const response = yield call(ProfileService.archiveConnection, payload);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            yield put({
                type: ARCHIVE_CONNECTION_FAILED,
                payload
            });
        }
    }
}

function* chatbotRestarter() {
    while (true) {
        const {payload} = yield take(RESTART_CHATBOT);
        const response = yield call(ConversationService.restartChatbot, payload);
        if (response.errors) {
            console.log(response.errors[0].endUserMessage);
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            yield put({
                type: RESTART_CHATBOT_FAILED
            });
        } else {
            yield put({
                type: GET_CONNECTIONS_SILENT
            });
        }
    }
}

function* fetchPendingConnections() {
    while (true) {
        yield take(FETCH_PENDING_CONNECTIONS);
        try {
            const pendingConnections = yield call(ProfileService.getPendingConnections);
            if (pendingConnections.errors) {
                AlertUtil.showErrorMessage(pendingConnections.errors[0].endUserMessage);
                yield put({
                    type: PENDING_CONNECTIONS_FAILED, payload: {
                        errorMsg: pendingConnections?.errors[0]?.endUserMessage,
                    }
                })
            } else {
                yield put({type: PENDING_CONNECTIONS_FETCHED, payload: pendingConnections})
            }
        } catch (error) {
            AlertUtil.showErrorMessage(error);
            yield put({type: PENDING_CONNECTIONS_FAILED})

        }
    }

}

function* fetchListAppointmentEligibleProviders() {
    while (true) {
        yield take(FETCH_LIST_APPOINTMENT_ELIGIBLE_PROVIDERS)
        try {
            const eligibleProviders = yield call(AppointmentService.listProviders);
            if (eligibleProviders.errors) {
                AlertUtil.showErrorMessage(eligibleProviders.errors[0].endUserMessage);
                yield put({
                    type: LIST_APPOINTMENT_ELIGIBLE_PROVIDERS_FAILED, payload: {
                        errorMsg: eligibleProviders?.errors[0]?.endUserMessage,
                    }
                })
            } else {
                yield put({type: LIST_APPOINTMENT_ELIGIBLE_PROVIDERS_FETCHED, payload: eligibleProviders})
            }
        } catch (error) {
            AlertUtil.showErrorMessage(error);
            yield put({type: LIST_APPOINTMENT_ELIGIBLE_PROVIDERS_FAILED})

        }
    }

}

function* fetchAllGroups() {
    while (true) {
        yield take(FETCH_ALL_GROUPS);
        try {
            const {userId} = yield select(state => state.auth.meta);
            const isPublic = true;
            const allGroups = yield call(ProfileService.getAllGroup, userId, isPublic);
            if (allGroups.errors) {
                AlertUtil.showErrorMessage(allGroups.errors[0].endUserMessage);
                yield put({
                    type: ALL_GROUPS_FAILED, payload: {
                        errorMsg: allGroups?.errors[0]?.endUserMessage,
                    }
                })
            } else {
                yield put({type: ALL_GROUPS_FETCHED, payload: allGroups})
            }
        } catch (error) {
            AlertUtil.showErrorMessage(error);
            yield put({type: ALL_GROUPS_FAILED})

        }
    }

}



export default function* connectionsSaga(store) {
    yield all([
        fork(getConnectionsHandler, store.dispatch),
        fork(connectSendBird, store.dispatch),
        fork(connectHandler),
        fork(disconnectHandler),
        fork(specificConnectionUpdateHandler),
        fork(allBotsProgressUpdater),
        fork(updateProgressEffectListener),
        fork(connectionArchiver),
        fork(chatbotRestarter),
        fork(attachmentSender, store.dispatch),
        fork(fetchChatbots),
        fork(fetchPendingConnections),
        fork(fetchListAppointmentEligibleProviders),
        fork(fetchAllGroups)

    ]);
}
