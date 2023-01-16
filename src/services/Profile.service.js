import {HttpClient} from 'ch-mobile-shared';
import {ApiEndpoints} from '../constants/ApiEndpoints';

export default class ProfileService {
  static getProfile() {
    return HttpClient.getInstance().request(
      ApiEndpoints.GET_PROFILE,
      null,
      null,
      null,
      null,
    );
  }

  static patientOnBoarding(requestBody) {
    return HttpClient.getInstance().request(
      ApiEndpoints.PATIENT_ON_BOARDING,
      null,
      null,
      null,
      requestBody,
      true,
      null,
      'profile',
    );
  }

  static updateProfile(requestBody) {
    return HttpClient.getInstance().request(
      ApiEndpoints.UPDATE_PROFILE,
      null,
      null,
      null,
      requestBody,
      true,
      null,
      'profile',
    );
  }

  static allowProviderAccess(providerId, allowed) {
    if (allowed === null) {
      console.log(
        'Patient has chosen later option. Not updating provider access',
      );
      return;
    }
    return HttpClient.getInstance().request(
      ApiEndpoints.ALLOW_PROVIDER_ACCESS,
      {providerId},
      {allowed},
      null,
      null,
    );
  }

  static disconnectProvider(providerId) {
    return HttpClient.getInstance().request(
      ApiEndpoints.DISCONNECT_PROVIDER,
      {providerId},
      null,
      null,
      {},
    );
  }

  static getSpecificConnection(userId, channelUrl) {
    let query = null;
    if (channelUrl) {
      query = {channelUrl};
    }
    return HttpClient.getInstance().request(
      ApiEndpoints.GET_SPECIFIC_CONNECTION,
      {userId},
      query,
    );
  }

  static getPatientDCT() {
    return HttpClient.getInstance().request(
      ApiEndpoints.PATIENT_DCT,
      null,
      null,
      null,
      null,
    );
  }

  static getPatientTags() {
    return HttpClient.getInstance().request(
      ApiEndpoints.PATIENT_AVATARS,
      null,
      null,
      null,
      null,
    );
  }

  static checkPatientOnboardingStatus() {
    return HttpClient.getInstance().request(
      ApiEndpoints.CHECK_PATIENT_ONBOARDING_STATUS,
      null,
      null,
      null,
      null,
    );
  }

  static getAllowedProviders() {
    return HttpClient.getInstance().request(
      ApiEndpoints.GET_ALLOWED_PROVIDERS,
      null,
      null,
      null,
      null,
    );
  }

  static searchProviderByCode(code) {
    return HttpClient.getInstance().request(
      ApiEndpoints.SEARCH_PROVIDER_BY_CODE,
      null,
      {code},
    );
  }

  static getProviderProfile(providerId) {
    return HttpClient.getInstance().request(
      ApiEndpoints.GET_PROVIDER_PROFILE,
      {providerId},
      null,
      null,
      null,
    );
  }

  static saveRewards(requestBody) {
    return HttpClient.getInstance().request(
      ApiEndpoints.SAVE_REWARDS_PROFILE,
      null,
      null,
      null,
      requestBody,
    );
  }

  static getProviderFeedbackSummary(providerId, limit=3) {
    return HttpClient.getInstance().request(
      ApiEndpoints.GET_FEEDBACK_SUMMARY,
      {providerId},
        {limit},
      null,
      null,
    );
  }

  static getProviderFeedback(providerId, currentPage) {
    return HttpClient.getInstance().request(
      ApiEndpoints.GET_FEEDBACK,
      null,
      {
        providerId,
        pageNumber: currentPage,
      },
      null,
      null,
    );
  }

  static inviteMember(invitationParams) {
    return HttpClient.getInstance().request(
      ApiEndpoints.INVITE_MEMBER,
      null,
      null,
      null,
      invitationParams,
    );
  }

  static inviteProvider(invitationParams) {
    return HttpClient.getInstance().request(
      ApiEndpoints.INVITE_PROVIDER,
      null,
      null,
      null,
      invitationParams,
    );
  }

  static getConnections() {
    return HttpClient.getInstance().request(ApiEndpoints.GET_CONNECTIONS);
  }

  static getMarkedEducationalContent(markType) {
    return HttpClient.getInstance().request(
      ApiEndpoints.GET_MARKED_EDUCATIONAL_CONTENT,
      null,
      {type: markType},
      null,
      null,
    );
  }

  static markAsCompletedEducationalContent(slug, topicEntryId) {
    return HttpClient.getInstance().request(
      ApiEndpoints.MARK_AS_COMPLETE_EDUCATIONAL_CONTENT,
      {slug},
        {topic: topicEntryId},
      null,
      null,
    );
  }
  static topicCompleted(entryId) {
    return HttpClient.getInstance().request(
      ApiEndpoints.TOPIC_COMPLETED,
      {entryId},
      null,
      null,
      null,
    );
  }
  static educationViewed(entryId) {
    return HttpClient.getInstance().request(
      ApiEndpoints.EDUCATION_VIEWED,
      {entryId},
      null,
      null,
      null,
    );
  }

  static bookMarkEducationalContent(slug, isMark) {
    return HttpClient.getInstance().request(
      ApiEndpoints.BOOKMARK_EDUCATIONAL_CONTENT,
      {slug},
      {mark: isMark},
      null,
      null,
    );
  }

  static connectWithUser(userId) {
    return HttpClient.getInstance().request(
      ApiEndpoints.CONNECT,
      {userId},
      null,
      null,
      {},
    );
  }

  static getPendingConnections() {
    return HttpClient.getInstance().request(
      ApiEndpoints.PENDING_CONNECTIONS,
      null,
      null,
      null,
      null,
    );
  }

  static processPendingConnections(params) {
    return HttpClient.getInstance().request(
      ApiEndpoints.PROCESS_PENDING_CONNECTIONS,
      null,
      null,
      null,
      params,
    );
  }

  static getUserActivity(userId, pageNumber = 0, pageSize = 3) {
    return HttpClient.getInstance().request(
      ApiEndpoints.USER_ACTIVITY,
      {userId},
      {pageNumber: pageNumber, pageSize: pageSize},
      null,
      null,
    );
  }

  static getAllMatchMakers() {
    return HttpClient.getInstance().request(ApiEndpoints.ALL_MATCH_MAKERS);
  }

  static getContentAssignedToMe(pageNumber = 0, pageSize = 3) {
    return HttpClient.getInstance().request(
      ApiEndpoints.GET_CONTENT_ASSIGNED_TO_ME,
      null,
      {pageNumber: pageNumber, pageSize: pageSize},
      null,
      null,
    );
  }

  static getDCTDetails(userId, dctId, pageNumber = 0, pageSize = 3) {
    return HttpClient.getInstance().request(
      ApiEndpoints.GET_DCT_REPORT_VIEW,
      {userId},
      {dctId: dctId, pageNumber: pageNumber, pageSize: pageSize},
      null,
      null,
    );
  }

  static getOutcomeDetail(contextId, dctId) {
    return HttpClient.getInstance().request(
      ApiEndpoints.OUTCOME_DETAIL,
      {
        contextId,
        dctId,
      },
      null,
      null,
      null,
    );
  }

  static getAssignedSlugs(connectionId) {
    return HttpClient.getInstance().request(
      ApiEndpoints.GET_ASSIGNED_SLUGS,
      {connectionId},
      null,
      null,
      null,
    );
  }

  static shareContentWithMember(params) {
    return HttpClient.getInstance().request(
      ApiEndpoints.SHARE_CONTENT,
      null,
      null,
      null,
      params,
    );
  }

  static captureEducationFeedback(entryId, helpful) {
    return HttpClient.getInstance().request(
      ApiEndpoints.CAPTURE_EDUCATION_FEEDBACK,
      {entryId},
      {helpful},
      null,
      {},
    );
  }

  static async shareFeedback(requestBody) {
    return HttpClient.getInstance().request(
      ApiEndpoints.SHARE_FEEDBACK,
      null,
      null,
      null,
      requestBody,
    );
  }

  static async createGroup(payload) {
    return HttpClient.getInstance().request(
      ApiEndpoints.CREATE_GROUP,
      null,
      null,
      null,
      payload,
      true,
      null,
      'group',
    );
  }

  static async addProfileElement(payload) {
    return HttpClient.getInstance().request(
      ApiEndpoints.ADD_PROFILE_ELEMENT,
      null,
      null,
      null,
      payload,
    );
  }

  static async updateGroup(payload) {
    return HttpClient.getInstance().request(
      ApiEndpoints.UPDATE_GROUP,
      null,
      null,
      null,
      payload,
      true,
      null,
      'group',
    );
  }

  static async addGroupMembers(payload) {
    return HttpClient.getInstance().request(
      ApiEndpoints.ADD_GROUP_MEMBERS,
      null,
      null,
      null,
      payload,
    );
  }

  static async removeMember(channelUrl, userId) {
    return HttpClient.getInstance().request(ApiEndpoints.REMOVE_GROUP_MEMBER, {
      channelUrl,
      userId,
    });
  }

  static async deleteGroup(channelUrl) {
    return HttpClient.getInstance().request(ApiEndpoints.DELETE_GROUP, {
      channelUrl,
    });
  }

  static async getGroupDetails(channelUrl) {
    return HttpClient.getInstance().request(
      ApiEndpoints.GET_GROUP_DETAILS,
      {channelUrl},
      null,
      null,
      null,
      null,
      null,
      null,
    );
  }

  static async getAllGroup(userId, isPublic) {
    return HttpClient.getInstance().request(
        ApiEndpoints.GET_ALL_GROUP_DETAILS,
        {userId},
        {isPublic},
        null,
        null,
        null,
        null,
        null,
    );
  }

  static async startOrJoinGroupCall(channelUrl) {
    return HttpClient.getInstance().request(
      ApiEndpoints.START_OR_JOIN_GROUP_CALL,
      {channelUrl},
      null,
      null,
      null,
      null,
      null,
      null,
    );
  }

  static async sendAttachment(attachment) {
    return HttpClient.getInstance().request(
      ApiEndpoints.SEND_ATTACHMENT,
      null,
      null,
      null,
      attachment,
      true,
      null,
      'channel',
    );
  }

  static async joinPublicGroup(channelUrl) {
    return HttpClient.getInstance().request(
      ApiEndpoints.JOIN_PUBLIC_GROUP,
      {channelUrl},
      null,
      null,
      null,
      null,
      null,
      null,
    );
  }

  static async uploadImage(file,explicitAuthToken) {
    return HttpClient.getInstance().request(
        ApiEndpoints.UPLOAD_IMAGE,
        null,
        null,
        null,
        file,
        true,
        explicitAuthToken,
        'file'
    );
  }

  static async archiveConnection(connectionId) {
    return HttpClient.getInstance().request(
        ApiEndpoints.ARCHIVE_CONNECTION,
        {connectionId},
        null,null,{connectionId}
    );
  }

  static async addMultipleProfileElement(payload) {
    return HttpClient.getInstance().request(
        ApiEndpoints.ADD_MULTIPLE_PROFILE_ELEMENT,
        null,
        null,
        null,
        payload,
    );
  }

  static async getDataElements(payload) {
    return HttpClient.getInstance().request(
        ApiEndpoints.GET_DATA_ELEMENTS,
        null,
        null,
        null,
        payload,
    );
  }

  static async saveMemberTimeZone(updateProfileTimezoneRequest) {
    return HttpClient.getInstance().request(
      ApiEndpoints.SAVE_MEMBER_TIMEZONE,
      null,
      null,
      null,
      updateProfileTimezoneRequest,
    );
  }

  static async updatePostOnboardingAttempt(postOnboardingAttempt) {
    return HttpClient.getInstance().request(
        ApiEndpoints.UPDATE_POST_ON_BOARDING_ATTEMPT,
        null,
        postOnboardingAttempt,
        null,
        null,
    );
  }
}
