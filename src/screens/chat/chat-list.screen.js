import React, { Component } from "react";
import {AppState, FlatList, Image, Platform, ScrollView, StatusBar, StyleSheet} from 'react-native';
import {Button, Container, Header, Icon, Text, View, Left, Right, Title, Body, ListItem, Content} from 'native-base';
import { connectConnections } from "../../redux";
import { Screens } from "../../constants/Screens";
import {
  AddConnectionsOverlay,
  addTestID,
  AlertUtil,
  ConfidantChatRoaster,
  isIphoneX,
  SearchFloatingButton,
  SliderSearch,
  CustomModal,
  Colors, CommonStyles, TextStyles,
  getHeaderHeight, hasNotificationPermissions, requestNotificationPermissions, CommonSegmentHeader,
} from 'ch-mobile-shared';
import {CONTENT_TYPE, ERROR_NOT_FOUND, EXPIRE_TOKEN, SEGMENT_EVENT} from "../../constants/CommonConstants";
import AuthService from "../../services/Auth.service";
import AuthStore from "./../../utilities/AuthStore";
import PushNotificationListeners from "../../components/PushNotificationListeners";
import LinearGradient from "react-native-linear-gradient";
import { sortConnections } from "../../redux/modules/connections/reducer";
import { isEqual } from "lodash";
import ProfileService from "../../services/Profile.service";
import BranchOverlay from "../../components/BranchOverlay";
import Analytics from "@segment/analytics-react-native";
import { ContentfulClient } from "ch-mobile-shared/src/lib/contentful/contentful";
import moment from "moment";
import {CheckBox} from 'react-native-elements';
import GradientButton from 'ch-mobile-shared/src/components/GradientButton';
import Modal from 'react-native-modalbox';
// import CustomModal from '../../components/CustomModal';
import {isTimeElapsed} from 'ch-mobile-shared/src/utilities';


const HEADER_SIZE = getHeaderHeight();

const CHAT_FILTERS = [{
  displayText: 'Members',
  filterValue: 'PATIENT'
},{
  displayText: 'Providers',
  filterValue: 'PROVIDERS'
},{
  displayText: 'Chatbots',
  filterValue: 'CHAT_BOT'
},{
  displayText: 'Support Groups',
  filterValue: 'CHAT_GROUP'
}];

class ChatListScreen extends Component<Props> {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const {navigation} = this.props;
    this.navLock = false;
    this.state = {
      modalVisible: false,
      filters: [],
      activeSegmentId: 'active',
      branchOverlyModel: false,
      branchOverlyModelForCTA: false,
      providerConnectOverlyModel: false,
      isLoading: true,
      isActive: true,
      refreshing: false,
      data: null,
      filterType: 'ALL',
      appState: AppState.currentState,
      activeConnections: this.props.connections.activeConnections,
      profileElementKey: null,
      profileElementValue: null,
      branchOverlyTitle: null,
      branchOverlySubTitle: null,
      branchOverlyDescription: null,
      branchLink: null,
      contentSlug: null,
      contentImage: null,
      providerId: null,
      providerInfo: null,
      profileElementData: true,
      groupChannelUrl: null,
      modalHeightProps: {
        height: 0
      }
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.connections.activeConnections.length !== this.props.connections.activeConnections.length) {
      this.setState({
        activeConnections: this.props.connections.activeConnections,
      });
    } else {
      for (let i = 0; i < this.props.connections.activeConnections.length; i++) {
        const current = this.props.connections.activeConnections[i];
        const prev = prevProps.connections.activeConnections[i];
        if (!isEqual(current, prev)) {
          this.setState({
            activeConnections: this.props.connections.activeConnections,
          });
          break;
        }
      }
    }
  }


  componentDidMount = async () => {
    //Only for local debugging to expire token if session is not expiring
    if (EXPIRE_TOKEN) {
      await AuthService.logout();
      this.props.navigation.navigate(Screens.MAGIC_LINK_SCREEN);
    }

    PushNotificationListeners.subscribeToOneSignal();
    this.props.fetchAppointments();
    if (this.props.connections.connectionsFetchedFor !== this.props.auth.meta.userId) {
      this.props.fetchConnections();
    } else {
      this.props.refreshConnections();
    }

    this.props.fetchProfile();
    this.props.fetchWallet();
    this.props.fetchContentAssignedToMe();
    this.props.fetchEducationMarkers();
    this.props.registerTokenRefreshTask();
    const activeSession = await AuthStore.hasActiveTelesession();
    if (activeSession) {
      this.props.navigation.navigate(
        Screens.TELEHEALTH_WELCOME,
        JSON.parse(activeSession),
      );
    }

    const branchParams = await AuthStore.getBranchParams();
    if (branchParams) {
      if (branchParams.navigateTo) {
        this.props.navigation.navigate(
          branchParams.navigateTo,
          branchParams,
        );
      }
      if (branchParams.recommendProvider != null && branchParams.recommendProvider.contentType === CONTENT_TYPE.RECOMMEND_PROVIDER_PROFILE) {
        const providerInfo = await ProfileService.getProviderProfile(branchParams.recommendProvider.providerId);
        if (!providerInfo.error) {
          this.setState({
            branchOverlyModel: true,
            branchOverlySubTitle: providerInfo.fullName,
            branchOverlyDescription: providerInfo.bio,
            branchOverlyImage: providerInfo.profileImage,
            providerId: providerInfo.providerId,
            providerName : providerInfo?.name,
            providerDesignation : providerInfo?.designation,
            branchLink: branchParams.recommendProvider.contentType,
          });
        }
      }
      if (branchParams.contentfulData != null && branchParams.contentfulData.contentType === CONTENT_TYPE.EDUCATION_CONTENT) {
        let query = {
          "content_type": "educationalContent",
          "sys.id": branchParams.contentfulData.contentId,
        };
        const res = await ContentfulClient.getEntries(query);
        let eduContent;
        if (res.items.length > 0) {
          eduContent = res.items[0];
          if (eduContent && eduContent.fields) {
            this.setState({
              branchOverlyModel: true,
              branchOverlySubTitle: eduContent.fields.title,
              branchOverlyDescription: eduContent.fields.description,
              branchOverlyImage: eduContent.fields.titleImage ? eduContent.fields.titleImage.fields.file.url : null,
              contentSlugs: {
                contentId: branchParams.contentfulData.contentId,
                categorySlug: branchParams.contentfulData.categorySlug,
                topicSlug: branchParams.contentfulData.topicSlug,
              },
              branchLink: branchParams.contentfulData.contentType,
            });
          }
        }
      }
      if (branchParams.groupChannelInfo != null && branchParams.groupChannelInfo.contentType === CONTENT_TYPE.GROUP_RECOMMENDATION) {
        const groupInfo = await ProfileService.getGroupDetails(branchParams.groupChannelInfo.groupChannelUrl);

        if (groupInfo.errors) {
          AlertUtil.showErrorMessage("This group is not public");
        } else {
          this.setState({
            branchOverlyModel: true,
            branchOverlySubTitle: groupInfo.name,
            branchOverlyImage: groupInfo.profilePicture,
            branchOverlyDescription: "",
            groupChannelUrl: branchParams.groupChannelInfo.groupChannelUrl,
            branchLink: branchParams.groupChannelInfo.contentType,
          });
        }

      }
      if (branchParams.profileElementData != null && branchParams.profileElementData.contentType === CONTENT_TYPE.PROFILE_ELEMENT) {
        const profileElementRequest = {
          profileElementKey: branchParams.profileElementData.profileElementKey,
          profileElementValue: branchParams.profileElementData.profileElementValue,
        };
        const response = await ProfileService.addProfileElement(profileElementRequest);
        if (response.message != null) {
          this.setState({
            branchOverlyModel: true,
            branchOverlyTitle: branchParams.profileElementData.profileElementTitle,
            branchOverlySubTitle: branchParams.profileElementData.profileElementSubTitle,
            branchOverlyDescription: branchParams.profileElementData.profileElementDescription,
            branchLink: "profile-element",
          });
        }
      }
      AuthStore.removeBranchParams().then(() => {
        console.log("Branch Params removed");
      });
    }
    const notificationStatus = await hasNotificationPermissions();
    if (notificationStatus.status === 'denied') {
      await requestNotificationPermissions();
    }
  };

  openChatWith = item => {
    this.navLock = true;
    if (item.type === "CHAT_BOT") {
      this.props.navigation.navigate(Screens.CHAT_INSTANCE, { contact: item });
    } else {
      if (this.props.chat.sendbirdStatus === 2) {
        this.props.navigation.navigate(Screens.LIVE_CHAT_WINDOW_SCREEN, {
          provider: { ...item, userId: item.connectionId },
          referrer: Screens.TAB_VIEW,
          patient: this.props.auth.meta,
          connection: item,
        });
      } else {
        AlertUtil.showErrorMessage("Please wait until chat service is connected");
      }

    }
    setTimeout(() => {
      this.navLock = false;
    }, 1000);
  };


  closeDrawer = () => {
    if (this._drawer) {
      this._drawer._root.close();
    }
  };

  getSections = () => {

    let connections = this.state.activeConnections;
    if(this.state.activeSegmentId==='active') {
        connections = connections.filter(connection=>!connection.archived);
        let {filters} = this.state;
        if(filters.length>0) {
          if(filters.includes("PROVIDERS")) {
            filters = [...filters, 'PRACTITIONER', 'MATCH_MAKER'];
          }
          connections = connections.filter(connection=>filters.includes(connection.type));
        }
    } else {
      connections = connections.filter(connection=>connection.archived);
    }

    return [{
      title: "",
      count: connections.length,
      data: sortConnections(connections),
    }];
  };


  propagate = result => {
    this.setState({
      activeConnections: result.active,
    });
  };


  createGroup = () => {
    this.onClose();
    this.props.navigation.navigate(Screens.CREATE_GROUP_SCREEN);
  };

  onClose = () => {
    this.setState({ modalVisible: false });
  };

  navigateToInvitation = invitationType => {
    this.onClose();
    this.props.navigation.navigate(Screens.INVITATION, {
      invitationType,
    });
  };

  showProviderSearch = () => {
    this.onClose();
    this.props.navigation.navigate(Screens.PROVIDER_SEARCH, {
      patient: this.state.patient,
    });
  };

  showModal = () => {
    if (!this.navLock) {
      this.setState({ ...this.state, modalVisible: true });
    }
  };
  branchCloseOverlay = () => {
    this.setState({ branchOverlyModel: false });
  };

  handleOnContinueButton = (branchLink) => {
    if (branchLink === CONTENT_TYPE.RECOMMEND_PROVIDER_PROFILE) {
      this.providerConnection();
    } else if (branchLink === CONTENT_TYPE.EDUCATION_CONTENT) {
      this.educationalContentPiecesScreen();
    } else if (branchLink === CONTENT_TYPE.GROUP_RECOMMENDATION) {
      this.groupRecommendation();
    } else if (branchLink === CONTENT_TYPE.PROFILE_ELEMENT) {
      this.branchCloseOverlay();
    }

  };

  newProviderSegmentEvents = async ()=>{
    const {providerId,providerName,providerDesignation} = this.state;
    const segmentPayload = {
      userId: this.props?.auth?.meta?.userId,
      providerId: providerId,
      connectedAt: moment.utc(Date.now()).format(),
      providerName : providerName,
      providerRole : providerDesignation
    };

    await Analytics.track(SEGMENT_EVENT.NEW_PROVIDER_CONNECTION, segmentPayload);
  }

  providerConnection = async () => {

    this.props.connect({
      userId: this.state.providerId,
      onSuccess: () => {
        const allowProviderAccess = {
          providerId: this.state.providerId,
          allowed: true,
        };
        this.props.updateProviderAccess(allowProviderAccess);
        this.setState({ branchOverlyModel: false });
        this.props.fetchConnections();
        this.props.fetchAppointments();
        this.newProviderSegmentEvents();

      },
      onFailure: (connectResponse) => {
        AlertUtil.showErrorMessage(connectResponse.errors[0].endUserMessage);
        this.setState({ branchOverlyModel: false });
      },
    });

  };

  educationalContentPiecesScreen = () => {
    this.setState({ branchOverlyModel: false });
    let contentSlugs = this.state.contentSlugs;
    let contentTitle = this.state.branchOverlySubTitle;

    this.props.navigation.navigate(Screens.EDUCATIONAL_CONTENT_PIECE, {
      contentSlug: contentSlugs.contentId,
      category: { categorySlug: contentSlugs.categorySlug },
      topic: { topicSlug: contentSlugs.topicSlug },
    });
  };

  groupRecommendation = async () => {
    this.setState({ branchOverlyModel: false });
    const response = await ProfileService.joinPublicGroup(this.state.groupChannelUrl);
    if (response.errors) {
      AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
    } else {
      AlertUtil.showSuccessMessage("Group Joined Successfully");
      this.props.fetchConnections();
      this.props.fetchAppointments();

      const groupInfo = await ProfileService.getGroupDetails(this.state.groupChannelUrl);
      if (groupInfo.errors) {
        AlertUtil.showErrorMessage("This group is not public");
      } else {
        const segmentGroupJoinedPayload = {
          userId: this.props.auth.meta?.userId,
          groupId: this.state.groupChannelUrl,
          groupName: groupInfo?.name,
          joinedAt: moment.utc(Date.now()).format(),
          joinMethod: "Branch Link - group-recommendation",
          groupAnonymousStatus: groupInfo?.groupAnonymous,
          groupPrivacyStatus: groupInfo?.groupTypePublic,
          groupTotalMembers: groupInfo?.members?.length,
          category: 'Goal Completion',
          label: 'Group Joined'

        };
        await Analytics.track(SEGMENT_EVENT.GROUP_JOINED, segmentGroupJoinedPayload);
      }
      this.props.refreshConnections();
    }


  };

  getFeedbackSummary = async (userId) => {
    try {
      const feedbackSummaryDetails = await ProfileService.getProviderFeedbackSummary(userId);
      if (feedbackSummaryDetails.errors) {
        console.warn(feedbackSummaryDetails.errors[0].endUserMessage);
        if (feedbackSummaryDetails.errors[0].errorCode !== ERROR_NOT_FOUND) {
          AlertUtil.showErrorMessage(
            feedbackSummaryDetails.errors[0].endUserMessage,
          );
        }
      } else {
        this.setState({
          feedbackSummary: feedbackSummaryDetails,
        });
      }
    } catch (error) {
      console.warn(error);
      AlertUtil.showErrorMessage("Unable to retrieve feedback summary");
    }
  };

  navigateToProhibitiveScreen = ()=>{
    this.props.navigation.navigate(Screens.PATIENT_PROHIBITIVE_SCREEN);
  }

  requestAppointment = async (provider) => {
    // Analytics.track('New Appointment - Selected Provider', {
    //     selectedProvider: provider,
    // });

    if(this.props.profile.patient.isPatientProhibitive){
      this.navigateToProhibitiveScreen()
    }else {
      await this.getFeedbackSummary(provider.userId);
      this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN, {
        selectedProvider: { ...provider, ...this.state.feedbackSummary },
      });
    }
  };

  helpDrawerClose = () => {
    this.refs?.modalContact?.close();
    this.setState({
      modalHeightProps: {
        height: 0,

      }
    });
  };

  onLayout(event) {
    const {height} = event.nativeEvent.layout;
    const newLayout = {
      height: height
    };
    setTimeout(()=>{
      this.setState({ modalHeightProps: newLayout });
    }, 10)

  }

  render = () => {
    // StatusBar.setBackgroundColor('transparent', true);
    StatusBar.setBarStyle("dark-content", true);
    let bookedAppointments = this.props.appointments.appointments || [];
    if (bookedAppointments.length > 0) {
      bookedAppointments = bookedAppointments.filter(appt => (appt.status === "PROPOSED" || appt.status === "BOOKED") && !isTimeElapsed(appt.startTIme));
    }
    if (this.props.connections.error) {
      setTimeout(
        () => AlertUtil.showErrorMessage(this.props.connections.error),
        0,
      );
    }
    const sections = this.getSections();
    return (
      <Container style={styles.container}>
        <Header
          {...addTestID("Header")}
          noShadow transparent style={styles.chatHeader}>
          <StatusBar
            backgroundColor={Platform.OS === "ios" ? null : "transparent"}
            translucent
            barStyle={"dark-content"}
          />
          <Left style={{flex: 1}}>
            <Button transparent
                    style={styles.userIconBtn}
                    onPress={() => {
                      this.props.navigation.navigate(Screens.CONNECTIONS_SCREEN);
                    }}
            >
              <Icon {...addTestID("profile-icon")} type="Feather" name="users"
                    style={{ ...styles.starIcon, color: Colors.colors.primaryIcon }} />
            </Button>
          </Left>
          <Body style={styles.headerRow}>
            <Title
                {...addTestID("select-service-by-type-header")}
                style={styles.headerText}>Chats</Title>
          </Body>
          <Right style={{flex: 1}}>
            {
              this.state.activeSegmentId ==='active' && (
                  <Button transparent
                          color={Colors.colors.mainPink}
                          style={styles.filterBtn}
                          onPress={() => {
                            this.refs?.modalContact?.open()
                          }}
                  >
                      <Image
                          resizeMode={'contain'}
                          style={styles.filterIcon}
                          source={this.state.filters?.length < 1 ?require('../../assets/images/filter.png') : require('../../assets/images/filtered.png')}/>
                  </Button>
              )
            }

          </Right>
        </Header>

        {this.state.branchOverlyModel &&
        <BranchOverlay
          modalVisible={this.state.branchOverlyModel}
          branchLink={this.state.branchLink}
          branchOverlyTitle={this.state.branchOverlyTitle}
          branchOverlySubTitle={this.state.branchOverlySubTitle}
          branchOverlyDescription={this.state.branchOverlyDescription}
          branchOverlyImage={this.state.branchOverlyImage}
          branchCloseOverlay={this.branchCloseOverlay}
          handleOnContinueButton={this.handleOnContinueButton}
        />
        }
        <AddConnectionsOverlay
          modalVisible={this.state.modalVisible}
          closeOverlay={this.onClose}
          createGroup={this.createGroup}
          navigateToInvitation={this.navigateToInvitation}
          showProviderSearch={this.showProviderSearch}
        />
        <View
            style={{paddingHorizontal: 24,
              ...CommonStyles.styles.headerShadow,
              // marginBottom: 16
            }}>
          <CommonSegmentHeader
              segments={[
              {title: 'Active', segmentId: 'active'},
              {title: 'Archived', segmentId: 'archived'},
                ]}
              segmentChanged={(segmentId) => {
                this.setState({activeSegmentId: segmentId});
              }}
          />
        </View>
        <View
          style={{ flex: 1 }}
        >
          <ConfidantChatRoaster
            activeSections={sections[0].count !== 0 ? sections : null}
            filterType={this.state.filterType}
            appointments={bookedAppointments}
            isMember={true}
            requestAppointment={this.requestAppointment}
            navigateToConnection={this.openChatWith}
            restartConversation={this.props.restartChatbot}
            archiveConnection={this.props.archiveConnection}
            onRefresh={this.props.refreshConnections}
            isLoading={this.props?.connections?.isLoading}
          />
        </View>
        {/*<SearchFloatingButton

          {...addTestID("plus-btn")}
          icon="plus"
          onPress={() => {
            this.showModal();
          }}
          isFiltering={this.state.modalVisible}
        />*/}

          <Modal
              backdropPressToClose={true}
              backdropColor={ Colors.colors.overlayBg}
              backdropOpacity={1}
              onClosed={this.helpDrawerClose}
              style={{...CommonStyles.styles.commonModalWrapper,
                maxHeight: '60%',
                // bottom: this.state.modalHeightProps.height
              }}
              entry={"bottom"}
              position={"bottom"} ref={"modalContact"} swipeArea={100}>
            <View style={{...CommonStyles.styles.commonSwipeBar}}
                  {...addTestID('swipeBar')}
            />
          <Content showsVerticalScrollIndicator={false}>
            <View
                // onLayout={(event) => this.onLayout(event)}
                style={styles.innerMain}>
              <View style={styles.filterTopHead}>
                <Text style={styles.filterHeadText}>Filter Results</Text>
                <Text style={styles.filterTotalText}>{sections[0] ? sections[0].count :0} total</Text>
              </View>
              <View style={styles.checkBoxSectionMain}>

                {CHAT_FILTERS.map((filter, index) => {
                  filter.checked = this.state.filters.includes(filter.filterValue);
                  return (
                      <ListItem
                          key={index}
                          onPress={() => {
                            let {filters} = this.state;
                            if(filters.includes(filter.filterValue)) {
                              filters = filters.filter(value=>value!==filter.filterValue);
                            }else {
                              filters.push(filter.filterValue);
                            }
                            this.setState({filters});
                          }}
                          style={
                            filter.checked
                                ? [
                                  styles.multiList,
                                  {
                                    backgroundColor: Colors.colors.primaryColorBG,
                                    borderColor: Colors.colors.mainBlue40,
                                  },
                                ]
                                : styles.multiList
                          }
                      >
                        <Text
                            style={
                              filter.checked
                                  ? [
                                    styles.checkBoxText,
                                    {
                                      color: Colors.colors.primaryText,
                                    },
                                  ]
                                  : styles.checkBoxText
                            }>
                          {filter.displayText}
                        </Text>
                        <CheckBox
                            containerStyle={
                              filter.checked ?
                                  [
                                    styles.multiCheck,
                                    {
                                      borderColor: Colors.colors.primaryIcon,
                                    }
                                  ]
                                  : styles.multiCheck
                            }
                            center
                            iconType='material'
                            checkedIcon='check'
                            uncheckedIcon=''
                            checkedColor={Colors.colors.primaryIcon}
                            checked={filter.checked}
                            onPress={() => {
                              let {filters} = this.state;
                              if(filters.includes(filter.filterValue)) {
                                filters = filters.filter(value=>value!==filter.filterValue);
                              }else {
                                filters.push(filter.filterValue);
                              }
                              this.setState({filters});
                            }}
                        />
                      </ListItem>
                  )})}
              </View>
            </View>
          </Content>
        </Modal>

      </Container>
    );
  };
}

const styles = StyleSheet.create({
  iconStyle: {
    color: "#d1d1d1",
    fontSize: 25,
  },
  searchField: {
    fontFamily: "Titillium-Web-Light",
    color: "#B3BEC9",
    fontSize: 14,
    fontWeight: "100",
    marginTop: 16,
    marginBottom: 10,
    marginLeft: 8,
    marginRight: 8,
    paddingLeft: 15,
    borderRadius: 4,
    borderColor: "#B7D2E5",
    backgroundColor: "#FFF",
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 15,
  },
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: Colors.colors.screenBG,
  },
  chatHeader: {
    // backgroundColor: "#fff",
    paddingTop: 15,
    paddingLeft: 24,
    paddingRight: 18,
    elevation: 0,
    height: HEADER_SIZE,
  },
  searchBox: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  mainImagesView: {
    height: 200,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingTop: 20,
    backgroundColor: "#fff",
  },
  filtersView: {
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: "row",
    flexWrap: "nowrap",
    paddingLeft: 16,
    backgroundColor: "#ffffff",
    height: 60,
    paddingBottom: 24,
  },
  filterBtn: {
    paddingLeft: 0,
    paddingRight: 6,
    marginRight: 0,
  },
  filterIcon: {
    width: 24
  },
  filterText: {
    color: "#515d7d",
    fontFamily: "Roboto-Bold",
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: 0.54,
    textTransform: "capitalize",
  },
  filterBtnSelected: {
    height: 32,
    borderWidth: 0.5,
    borderColor: "#f5f5f5",
    shadowColor: "#f5f5f5",
    shadowOffset: {
      width: 5,
      height: 10,
    },
    shadowRadius: 8,
    shadowOpacity: 1.0,
    elevation: 2,
    backgroundColor: "#515d7d",
    marginRight: 8,
  },
  userIconBtn: {
    alignItems: 'flex-end',
    paddingRight: 0,
    paddingLeft:0,
    width: 35
  },
  userIcon: {
    color: Colors.colors.primaryIcon,
    fontSize: 24
  },
  starIcon: {
    color: "#d1d1d1",
    fontSize: 24,
    backgroundColor: "rgba(255,255,255, 0.45)",
  },
  filterTextSelected: {
    color: "#FFF",
    fontFamily: "Roboto-Bold",
    fontWeight: "600",
    lineHeight: 16,
    fontSize: 14,
    letterSpacing: 0.54,
    textTransform: "capitalize",
  },
  addIcon: {
    width: 5,
    height: 10,
  },
  headerRow: {
    flex: 3,
    alignItems: 'center'
  },
  headerText: {
    ...TextStyles.mediaTexts.manropeBold,
    ...TextStyles.mediaTexts.TextH5,
    color: Colors.colors.highContrast,
    textAlign: 'center',
    paddingLeft: 0
  },
  filterOverlay: {
    height: 'auto',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 0,
    paddingBottom: isIphoneX() ? 34 : 24,
    left: 0,
    right: 0,
    top: 145,
    paddingLeft: 24,
    paddingRight: 24,
    borderRadius: 12
  },
  innerMain: {
    position: 'relative',
  },
  filterTopHead: {
    flexDirection: 'row',
    marginBottom: 24,
    justifyContent: 'space-between'
  },
  filterHeadText: {
    color: Colors.colors.highContrast,
    ...TextStyles.mediaTexts.serifProBold,
    ...TextStyles.mediaTexts.TextH3
  },
  filterTotalText: {
    color: Colors.colors.lowContrast,
    ...TextStyles.mediaTexts.manropeBold,
    ...TextStyles.mediaTexts.subTextS,
    marginLeft: 8
  },
  mainHeading: {
    ...TextStyles.mediaTexts.manropeBold,
    ...TextStyles.mediaTexts.TextH3,
    color: Colors.colors.highContrast,
  },
  countText: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.bodyTextExtraS,
    color: Colors.colors.lowContrast,
  },
  checkBoxSectionMain: {
    // paddingTop: 40
  },
  checkBoxSectionText: {
    ...TextStyles.mediaTexts.manropeBold,
    ...TextStyles.mediaTexts.TextH5,
    color: Colors.colors.highContrast,
    marginBottom: 16,
    marginTop: 32,
  },
  multiCheck: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: Colors.colors.borderColor,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    backgroundColor: Colors.colors.whiteColor
  },
  multiList: {
    // display: 'flex',
    // flexDirection: 'row',
    // alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.colors.borderColor,
    backgroundColor: Colors.colors.white,
    marginLeft: 0,
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
});
export default connectConnections()(ChatListScreen);
