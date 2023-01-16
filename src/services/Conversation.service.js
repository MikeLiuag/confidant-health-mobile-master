import {HttpClient} from 'ch-mobile-shared';
import {ApiEndpoints} from '../constants/ApiEndpoints';

export default class ConversationService {
  static getChatToken(contactId) {
    return HttpClient.getInstance().request(
      ApiEndpoints.GET_CHAT_TOKEN,
      null,
      null,
      null,
      {
        contactId: contactId,
      },
    );
  }

  static getConversationHistory(contactId, skip) {
    return HttpClient.getInstance().request(
      ApiEndpoints.GET_CHAT_BOT_HISTORY,
      null,
      {
        contactId: contactId,
        skip: skip,
      },
      null,
      null,
    );
  }

  static async refreshDirectLineToken() {
    return HttpClient.getInstance().request(
      ApiEndpoints.REFRESH_DIRECTLINE_TOKEN,
      null,
      null,
      null,
      {},
    );
  }


  static async getChannelUrl(connectionId) {
    return HttpClient.getInstance().request(
      ApiEndpoints.GET_CHANNEL_URL,
      {connectionId},
      null,
      null,
      null,
    );
  }

  static async getConversations() {
    return HttpClient.getInstance().request(
      ApiEndpoints.CONVERSATION_LIST,
      null,
      null,
      null,
      null,
    );
  }

  static async selfAssignConversation(conversationId, organizationId) {
    return HttpClient.getInstance().request(
      ApiEndpoints.SELF_ASSIGN_CONVERSATION,
      null,
      null,
      null,
      {
        conversationId,
        organizationId,
      },
    );
  }

  static async getConversationProgress(connectionId) {
    return HttpClient.getInstance().request(
        ApiEndpoints.GET_CONVERSATION_PROGRESS,
        {connectionId});
  }

  static async restartChatbot(connectionId) {
    return HttpClient.getInstance().request(
        ApiEndpoints.RESTART_CHATBOT,
        {connectionId});
  }

  static async getRevampType(revampTypeId) {
    return HttpClient.getInstance().request(
        ApiEndpoints.GET_REVAMP_TYPE,
        null,
        {revampTypeId},
        null,
        null,
    );
  }

  static async getRevampTypesList() {
    return HttpClient.getInstance().request(
        ApiEndpoints.GET_REVAMP_TYPES_LIST,
        null,
        null,
        null,
        null,
    );
  }

  static async createRevampOnBoardingContext() {
    return HttpClient.getInstance().request(
        ApiEndpoints.CREATE_REVAMP_ON_BOARDING_CONTEXT,
        null,
        null,
        null,
        null,
    );
  }

  static async updateRevampOnBoardingContext(request) {
    return HttpClient.getInstance().request(
        ApiEndpoints.UPDATE_REVAMP_ON_BOARDING_CONTEXT,
        null,
        null,
        null,
        request,
    );
  }

  static async getRevampOnBoardingContext() {
    return HttpClient.getInstance().request(
        ApiEndpoints.GET_REVAMP_ON_BOARDING_CONTEXT,
        null,
        null,
        null,
        null,
    );
  }


  static async updateRevampContext(request) {
    return HttpClient.getInstance().request(
        ApiEndpoints.UPDATE_REVAMP_CONTEXT,
        null,
        null,
        null,
        request,
    );
  }

  static async getRevampContext() {
    return HttpClient.getInstance().request(
        ApiEndpoints.GET_REVAMP_CONTEXT,
        null,
        null,
        null,
        null,
    );
  }

  static async checkInActivity(revampContextModel) {
    return HttpClient.getInstance().request(
        ApiEndpoints.CHECK_IN_ACTIVITY,
        null,
        null,
        null,
        revampContextModel,
    );
  }

  static async createSundayCheckIn() {
    return HttpClient.getInstance().request(
        ApiEndpoints.CREATE_SUNDAY_CHECKIN,
        null,
        null,
        null,
        null,
    );
  }

  static async updateSundayCheckIn(sundayCheckInModel) {
    return HttpClient.getInstance().request(
        ApiEndpoints.UPDATE_SUNDAY_CHECKIN,
        null,
        null,
        null,
        sundayCheckInModel,
    );
  }

  static async getSundayCheckIn(revampId) {
    const queryParams = revampId ? {id : revampId} : null;
    return HttpClient.getInstance().request(
        ApiEndpoints.GET_SUNDAY_CHECKIN,
        null,
        queryParams,
        null,
        null,
    );
  }

  static async scheduleActivity(scheduleActivityModel) {
    return HttpClient.getInstance().request(
        ApiEndpoints.SCHEDULE_ACTIVITY,
        null,
        null,
        null,
        scheduleActivityModel,
    );
  }

  static async getSundayCheckIns() {
    return HttpClient.getInstance().request(
        ApiEndpoints.GET_SUNDAY_CHECKINS,
        null,
        null,
        null,
        null,
    );
  }
}
