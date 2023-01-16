// @flow

import { createAction } from "redux-actions";
import {FETCH_BOT_PROGRESS, GET_CONNECTIONS, GET_CONNECTIONS_SILENT} from '../connections/actions';

export const CHAT_REQUEST_INITIALIZE = "chat/REQUEST_INITIALIZE";
export const CHAT_INITIALIZING = "chat/INITIALIZING";
export const CHAT_UPDATE_CONNECTION_STATUS = "chat/UPDATE_CONNECTION_STATUS";
export const CHAT_INIT_FAILED = "chat/INIT_FAILED";
export const CHAT_TOKEN_EXPIRED = "chat/TOKEN_EXPIRED";
export const CHAT_INIT_SUCCESSFUL = "chat/INIT_SUCCESSFUL";
export const CHAT_FETCH_NEXT_MSG = "chat/FETCH_NEXT_MSG";
export const CHAT_SEND_MESSAGE = "chat/SEND_MESSAGE";
export const CHAT_HIDE_SINGLE_CHOICES = "chat/HIDE_SINGLE_CHOICES";
export const CHAT_SEND_MESSAGE_IN_PROGRESS = "chat/SEND_MESSAGE_IN_PROGRESS";
export const CHAT_SEND_MESSAGE_FAILED = "chat/SEND_MESSAGE_FAILED";
export const CHAT_SEND_MESSAGE_SUCCESSFUL = "chat/SEND_MESSAGE_SUCCESSFUL";
export const CHAT_TYPING_DETECTED = "chat/TYPING_DETECTED";
export const CHAT_ADD_MESSAGE = "chat/ADD_MESSAGE";
export const CHAT_AUTO_REPLY_REGISTERED = "chat/AUTO_REPLY_REGISTERED";
export const CHAT_LOAD_EARLIER = "chat/LOAD_EARLIER";
export const CHAT_LOADING_EARLIER = "chat/LOADING_EARLIER";
export const CHAT_LOADED_EARLIER = "chat/LOADED_EARLIER";
export const CHAT_PAUSE = "chat/PAUSE";
export const CHAT_RESUME = "chat/RESUME";
export const CHAT_EXIT = "chat/EXIT";
export const CHAT_GROUP_UPDATED = "chat/GROUP_UPDATED";
export const LIVE_CHAT_INITIALIZE = "liveChat/INITIALIZE";
export const LIVE_CHAT_INITIALIZING = "liveChat/INITIALIZING";
export const LIVE_CHAT_READY = "liveChat/READY";
export const LIVE_CHAT_INIT_FAILED = "liveChat/INIT_FAILED";
export const LIVE_CHAT_MARK_AS_READ = "liveChat/MARK_AS_READ";
export const LIVE_CHAT_ADD_MESSAGE = "liveChat/ADD_MESSAGE";
export const LIVE_CHAT_MESSAGE_RECEIVED = "liveChat/MESSAGE_RECEIVED";
export const LIVE_CHAT_SEND_MESSAGE = "liveChat/SEND_MESSAGE";
export const LIVE_CHAT_SEND_ATTACHMENT = "liveChat/SEND_ATTACHMENT";
export const LIVE_CHAT_ATTACHMENT_SENT = "liveChat/ATTACHMENT_SENT";
export const LIVE_CHAT_MEDIA_UPLOADED = "liveChat/MEDIA_UPLOADED";
export const LIVE_CHAT_MEDIA_UPLOAD_PROGRESS = "liveChat/MEDIA_UPLOADED_PROGRESS";
export const LIVE_CHAT_MEDIA_SENT = "liveChat/MEDIA_SENT";
export const LIVE_CHAT_EXIT = "liveChat/EXIT";
export const LIVE_CHAT_DATA_SHARE_PROMPT_ANSWERED = "liveChat/DATA_SHARE_PROMPT_ANSWERED";
export const UPDATE_SESSION_DETAILS = "UPDATE_SESSION_DETAILS"

export const SENDBIRD_CONNECTED = "SENDBIRD_CONNECTED"
export const SENDBIRD_RECONNECT = "SENDBIRD_RECONNECT"
export const SENDBIRD_RECONNECTING = "SENDBIRD_RECONNECTING"
export const SENDBIRD_CONNECTING = "SENDBIRD_CONNECTING"
export const SENDBIRD_CONNECT_FAILED = "SENDBIRD_CONNECT_FAILED"


const createActionWrapper = action => {
  return createAction(action, data => data.payload, data => data.meta);
};

export const chatActionCreators = {
  chatRequestInitialize: createActionWrapper(CHAT_REQUEST_INITIALIZE),
  chatUpdateConnectionStatus: createActionWrapper(
    CHAT_UPDATE_CONNECTION_STATUS
  ),
  chatPaused: createAction(CHAT_PAUSE),
  chatResumed: createAction(CHAT_RESUME),
  chatInitFailed: createActionWrapper(CHAT_INIT_FAILED),
  chatInitSuccessful: createActionWrapper(CHAT_INIT_SUCCESSFUL),
  chatSendMessage: createActionWrapper(CHAT_SEND_MESSAGE),
  chatSendMessageInProgress: createActionWrapper(CHAT_SEND_MESSAGE_IN_PROGRESS),
  chatSendMessageFailed: createActionWrapper(CHAT_SEND_MESSAGE_FAILED),
  chatSendMessageSuccessful: createActionWrapper(CHAT_SEND_MESSAGE_SUCCESSFUL),
  chatTypingDetected: createActionWrapper(CHAT_TYPING_DETECTED),
  chatAddMessage: createActionWrapper(CHAT_ADD_MESSAGE),
  chatLoadEarlier: createActionWrapper(CHAT_LOAD_EARLIER),
  chatLoadingEarlier: createActionWrapper(CHAT_LOADING_EARLIER),
  chatLoadedEarlier: createActionWrapper(CHAT_LOADED_EARLIER),
  chatExit: createActionWrapper(CHAT_EXIT),
  chatFetchNext: createActionWrapper(CHAT_FETCH_NEXT_MSG),
  liveChatInit: createActionWrapper(LIVE_CHAT_INITIALIZE),
  liveChatInitFailed: createActionWrapper(LIVE_CHAT_INIT_FAILED),
  liveChatSendMessage: createActionWrapper(LIVE_CHAT_SEND_MESSAGE),
  liveChatExit: createAction(LIVE_CHAT_EXIT),
  dataSharingPromptAnswered: createActionWrapper(LIVE_CHAT_DATA_SHARE_PROMPT_ANSWERED),
  updateSessionDetails:createActionWrapper(UPDATE_SESSION_DETAILS),
  chatGroupUpdated: createAction(CHAT_GROUP_UPDATED),
  fetchConnections: createAction(GET_CONNECTIONS),
  fetchConnectionsSilent: createAction(GET_CONNECTIONS_SILENT),
  updateBotProgress: createAction(FETCH_BOT_PROGRESS)
};
