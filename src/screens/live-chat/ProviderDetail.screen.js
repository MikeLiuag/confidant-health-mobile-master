import React, { Component } from "react";
import { FlatList, Image, Platform, StatusBar, StyleSheet, Text, View } from "react-native";
import { Body, Button, Container, Content, Header, Icon, Left, Right } from "native-base";
import { Screens } from "../../constants/Screens";

import {
  DEFAULT_AVATAR_COLOR,
  ERROR_NOT_FOUND,
  MAX_DESCRIPTION_LENGTH,
  S3_BUCKET_LINK,
  SEGMENT_EVENT,
} from "../../constants/CommonConstants";
import {
  addTestID,
  AlertUtil,
  AlfieLoader,
  Colors,
  CommonStyles,
  getHeaderHeight,
  isIphoneX,
  PrimaryButton,
  SecondaryButton,
  TextStyles,
  TransactionSingleActionItem,
  valueExists,
} from "ch-mobile-shared";
import ProfileService from "../../services/Profile.service";
import { connectConnections } from "../../redux";
import DeepLinksService from "../../services/DeepLinksService";
import { QRCodeComponent } from "ch-mobile-shared/src/components/QRCode.component.js";
import Fontisto from "react-native-vector-icons/Fontisto";
import { BackButton } from "ch-mobile-shared/src/components/BackButton";
import AntIcon from "react-native-vector-icons/AntDesign";
import FeatherIcons from "react-native-vector-icons/Feather";
import { RatingComponent } from "ch-mobile-shared/src/components/RatingComponent";
import { RenderTextChipComponent } from "ch-mobile-shared/src/components/RenderTextChipComponent";
import { RenderScrollableBoxListComponent } from "ch-mobile-shared/src/components/RenderScrollableBoxListComponent";
import moment from "moment";
import AppointmentService from "../../services/Appointment.service";
import Modal from "react-native-modalbox";
import Analytics from "@segment/analytics-react-native";
import { isConnected } from "@react-native-community/netinfo";

const HEADER_SIZE = getHeaderHeight();

Fontisto.loadFont();

class ProviderDetailScreen extends Component<Props> {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    const provider = navigation.getParam("provider", null);
    const patient = navigation.getParam("patient", null);
    this.referrer = navigation.getParam("referrer", null);
    this.isProviderFlow = navigation.getParam("isProviderFlow", true);
    this.selectedService = navigation.getParam("selectedService", null);
    this.isPatientProhibitive = navigation.getParam('isPatientProhibitive', false);
    this.state = {
      isLoading: true,
      providerInfo: provider,
      patientInfo: patient,
      /*hasAccess:
          profile.providerAccess &&
          profile.providerAccess.allowedProviders.includes(provider.userId),*/
      feedbackSummary: null,
      providerPublicDetails: null,
      providerEmployment: null,
      providerEducation: null,
      providerAffiliation: null,
      modalVisible: false,
      socialOptions: false,
      copiedLink: false,
      clipboardContent: null,
      serviceSelected: "selected",
      seeAll: false,
      selectedItemTitle: "",
      selectedItemListCount: 0,
      qrCode: "",
      slots: [{ start: 8, end: 9 }, { start: 8, end: 9 }, { start: 8, end: 9 }],
      rating: null,
      servicesList: null,
      isServiceModalOpen: false,
      modalHeightProps: {
        height: 0,
      },
    };
  }

  componentDidMount = async () => {
    await this.getProviderDetails();
    let providerId = this.state.providerInfo.userId;
    const qrcode = await DeepLinksService.profileQRCodeLink(providerId);
    this.setState({ qrCode: qrcode });
  };

  getProviderProfile = (providerInfo) => {
    const providerPublicDetails = providerInfo.providerProfile;
    // providerPublicEmployment
    const employmentDataLength =
      providerPublicDetails && providerPublicDetails.employmentName != null
        ? providerPublicDetails.employmentName.length
        : 0;

    const providerPublicEmployment = [];
    if (employmentDataLength > 0) {
      //Populate employment details
      for (let i = 0; i < employmentDataLength; i++) {
        providerPublicEmployment.push({
          name: providerPublicDetails.employmentName
            ? providerPublicDetails.employmentName[i]
            : "",
          place: providerPublicDetails.employmentPlace
            ? providerPublicDetails.employmentPlace[i]
            : "",
          image: providerPublicDetails.employmentImage
            ? providerPublicDetails.employmentImage
            : "",
          startDate: providerPublicDetails.employmentStartDate
            ? providerPublicDetails.employmentStartDate
            : "",
          endDate: providerPublicDetails.employmentEndDate
            ? providerPublicDetails.employmentEndDate
            : "",
        });
      }
    }

    const educationDataLength =
      providerPublicDetails && providerPublicDetails.educationName != null
        ? providerPublicDetails.educationName.length
        : 0;
    const providerPublicEducation = [];
    if (educationDataLength > 0) {
      //Populate education details
      for (let j = 0; j < educationDataLength; j++) {
        providerPublicEducation.push({
          name: providerPublicDetails.educationName
            ? providerPublicDetails.educationName[j]
            : "",
          place: providerPublicDetails.educationPlace
            ? providerPublicDetails.educationPlace[j]
            : "",
          image: providerPublicDetails.educationImage
            ? providerPublicDetails.educationImage
            : "",
          startDate: providerPublicDetails.educationStartDate
            ? providerPublicDetails.educationStartDate
            : "",
          endDate: providerPublicDetails.educationEndDate
            ? providerPublicDetails.educationEndDate
            : "",
          description: providerPublicDetails.educationDescription
            ? providerPublicDetails.educationDescription
            : "",
        });
      }
    }

    const affiliationDataLength =
      providerPublicDetails && providerPublicDetails.affiliationName != null
        ? providerPublicDetails.affiliationName.length
        : 0;
    const providerPublicAffiliation = [];
    if (affiliationDataLength > 0) {
      //Populate employment details
      for (let k = 0; k < affiliationDataLength; k++) {
        providerPublicAffiliation.push({
          name: providerPublicDetails.affiliationName
            ? providerPublicDetails.affiliationName[k]
            : "",
          place: providerPublicDetails.affiliationPlace
            ? providerPublicDetails.affiliationPlace[k]
            : "",
          image: providerPublicDetails.affiliationImage
            ? providerPublicDetails.affiliationImage
            : "",
        });
      }
    }
    this.setState({
      providerEmployment: providerPublicEmployment,
      providerEducation: providerPublicEducation,
      providerAffiliation: providerPublicAffiliation,
      providerInfo: providerInfo,
      isLoading: false,
    });
  };

  findAvatarColorCode = connectionId => {
    let connection = this.props.connections.activeConnections.filter(
      connection => connection.connectionId === connectionId,
    );
    if (connection && connection.length < 1) {
      connection = this.props.connections.pastConnections.filter(
        connection => connection.connectionId === connectionId,
      );
    }
    return connection && connection.length > 0 && connection[0].colorCode
      ? connection[0].colorCode
      : DEFAULT_AVATAR_COLOR;
  };

  getProviderDetails = async () => {
    this.setState({ isLoading: true });
    let { providerInfo } = this.state;
    try {
      let provider = await ProfileService.getProviderProfile(providerInfo.userId);
      if (provider.errors) {
        console.warn(provider.errors[0].endUserMessage);
        AlertUtil.showErrorMessage("Selected provider is not available");
        this.props.navigation.goBack();
      } else {
        await this.getFeedbackSummary();
        await this.getProviderServices();
        if (providerInfo && !providerInfo.profilePicture) {
          providerInfo = {
            ...providerInfo,
            colorCode: this.findAvatarColorCode(providerInfo.userId),
          };
        }
        this.getProviderProfile({ ...providerInfo, ...provider, name: provider?.fullName });
      }
    } catch (e) {
      console.log(e);
    }
  };

  startConversation = () => {
    this.detailDrawerClose();
    let { providerInfo, patientInfo } = this.state;
    const filteredConnection = this.props.connections.activeConnections.filter(
      connection => connection.connectionId === providerInfo.userId,
    );
    if (filteredConnection.length > 0) {
      const connection = filteredConnection[0];
      this.props.navigation.navigate(Screens.LIVE_CHAT_WINDOW_SCREEN, {
        referrer: Screens.PROVIDER_DETAIL_SCREEN,
        provider: providerInfo,
        patient: patientInfo,
        connection,
      });
    }
  };

  onClose = () => {
    this.setState({ modalVisible: false });
  };

  goBack = () => {
    this.props.navigation.goBack();
  };

  disconnectProvider = async () => {
    this.setState({ isModalOpen: false });
    this.onClose();
    this.props.disconnect({
      userId: this.state.providerInfo.userId,
    });
  };

  getFeedbackSummary = async () => {
    try {
      let { providerInfo } = this.state;
      const feedbackSummaryDetails = await ProfileService.getProviderFeedbackSummary(providerInfo.userId, this.state.feedbackSummary ? this.state.feedbackSummary.totalReviews : 3);
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

  getDurationText = (duration) => {
    const minText = " min";
    const hourText = " hour";
    if (duration < 60) {
      return duration + minText;
    }
    const hour = parseInt(duration / 60);
    const min = duration % 60;
    let text = hour + hourText;
    if (min > 0) {
      text = text + " " + min + minText;
    }
    return text;
  };

  getProviderServices = async () => {
    try {
      let { providerInfo } = this.state;
      let servicesList = await AppointmentService.getProviderServices(providerInfo.userId);
      if (servicesList.errors) {
        AlertUtil.showErrorMessage(servicesList.errors[0].endUserMessage);
        this.setState({ isLoading: false });
      } else {
        servicesList = servicesList.map(service => {
          service.duration = this.getDurationText(service.duration);
          service.title = service.name;
          return service;
        });
        this.setState({ servicesList });
      }
    } catch (error) {
      console.warn(error);
      AlertUtil.showErrorMessage("Unable to get provider services");
    }
  };

  showConfirm = () => {
    this.setState({
      modalVisible: false,
      confirmModal: true,
    });
  };

  checkImageUrl = image => {
    if (image != null) {
      return image.includes("https") || image.includes("http");
    }
  };

  closeConfirm = () => {
    this.setState({
      confirmModal: false,
    });
  };

  recommendProviderProfile = async channel => {
    this.setState({ isModalOpen: false });
    const { providerInfo } = this.state;
    let providerId = providerInfo.userId;
    await DeepLinksService.recommendProviderProfileLink(channel, providerId);
  };

  navigateToProhibitiveScreen = () => {
    this.props.navigation.navigate(Screens.PATIENT_PROHIBITIVE_SCREEN);
  };

  requestAppointment = () => {
    this.onClose();
    if (this.props.profile.patient.isPatientProhibitive) {
      this.navigateToProhibitiveScreen();
    } else {
      let { providerInfo, feedbackSummary } = this.state;
      this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN, {
        selectedProvider: {
          name: providerInfo.fullName,
          userId: providerInfo.userId,
          profilePicture: providerInfo.profileImage,
          fixedProvider: true,
          referrerScreen: Screens.PROVIDER_DETAIL_SCREEN,
          speciality: providerInfo.speciality.join(","),
          totalReviews: feedbackSummary ? feedbackSummary.totalReviews : 0,
          combinedRating: feedbackSummary ? feedbackSummary.combinedRating : 0,
        },
      });
    }
  };

  renderProviderDetail = (providerInfo, feedbackSummary) => {
    let profilePicture;
    if (providerInfo.profileImage && providerInfo.profileImage !== "") {
      profilePicture = S3_BUCKET_LINK + providerInfo.profileImage;
    } else {
      profilePicture = null;
    }
    return (
      <View style={styles.providerDetailWrapper}>
        <View style={{ flexDirection: "row", marginBottom: 16 }}>
          <View style={styles.personalInfoWrapper}>
            {providerInfo.profilePicture ? (
              <Image
                style={styles.proImage}
                resizeMode="cover"
                source={{ uri: profilePicture }}
              />
            ) : (
              <View
                style={{
                  ...styles.proBgMain,
                  backgroundColor: providerInfo.colorCode,
                }}>
                <Text style={styles.proLetterMain}>
                  {valueExists(providerInfo.name) && providerInfo.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.itemDetail}>
            <Text style={styles.sectionTitle}>{providerInfo.name}</Text>
            <Text style={styles.itemDes} numberOfLines={1}>
              {providerInfo.designation}
            </Text>
            <RatingComponent
              readonly={true}
              type="custom"
              showRating={false}
              ratingCount={5}
              size={20}
              ratingImage={require("../../assets/images/starRatingBlue.png")}
              ratingColor={Colors.colors.mainPink}
              ratingBackgroundColor={Colors.colors.lowContrast}
              fractions={2}
              defaultRating={feedbackSummary && feedbackSummary.combinedRating ? feedbackSummary.combinedRating : 0}
              startingValue={
                feedbackSummary && feedbackSummary.combinedRating ? feedbackSummary.combinedRating : 0
              }
            />
            <Text
              style={styles.itemDes}>{feedbackSummary && feedbackSummary.totalReviews ? feedbackSummary.totalReviews : 0} review{feedbackSummary && feedbackSummary.totalReviews > 1 ? "s" : ""}</Text>
          </View>
        </View>
        <RenderTextChipComponent renderList={providerInfo.speciality} />
      </View>

    );
  };

  renderReviews = (recentReviews, isModalOpen) => {
    return (
      <View style={{ paddingBottom: isModalOpen ? 30 : 0 }}>
        {recentReviews && recentReviews.map(review =>
          <View>
            <View style={{ ...styles.providerInfoRating, marginTop: this.state.seeAll ? 0 : 16 }}>
              <View style={styles.providerInfoRatingWrapper}>

                <RatingComponent
                  readonly={true}
                  type="custom"
                  showRating={false}
                  ratingCount={5}
                  size={20}
                  ratingImage={require("../../assets/images/starRatingBlue.png")}
                  ratingColor={Colors.colors.mainPink}
                  ratingBackgroundColor={Colors.colors.lowContrast}
                  fractions={2}
                  defaultRating={review.rating}
                  startingValue={
                    review.rating ? review.rating : 0
                  }
                />


              </View>
              <Text style={styles.providerInfoRatingDate}>
                {moment.utc(review.createdAt).format("MMMM D, YYYY")}
              </Text>
            </View>
            <Text style={styles.providerInfoRatingDes}>
              {valueExists(review.publicComment) ? review.publicComment : "No feedback"}
            </Text>
            {!isModalOpen && (
              <Button
                style={{ marginVertical: 16 }}
                onPress={async () => {
                  this.setState({ isLoading: true });
                  await this.getFeedbackSummary().then(() => this.setState({ isLoading: false }));
                  this.seeAll("Recent Reviews",
                    () => {
                      return this.renderReviews(this.state.feedbackSummary.recentReviews, true);
                    },
                    true,
                    this.state.feedbackSummary.recentReviews.length,
                  );
                }}
                transparent>
                <View style={styles.seeAllBtn}>
                  <Text style={styles.seeAllBtnText}>See all reviews</Text>
                  <AntIcon name="arrowright" size={20} color={Colors.colors.primaryIcon} />
                </View>
              </Button>
            )}
          </View>,
        )}
      </View>


    );
  };

  renderListItems = (listName, listValues) => {
    return (
      <View style={{ marginBottom: 32 }}>
        <RenderTextChipComponent renderList={listValues} />
      </View>
    );
  };

  getDetailImage = (detailName) => {
    switch (detailName) {
      case "Clinic affiliation":
        return require("../../assets/images/clinic.png");
      case "Past employment":
        return require("../../assets/images/employment.png");
      case "Education":
        return require("../../assets/images/employment.png");
      default :
        return "";
    }
  };

  renderProviderHistory = (listName, list, stateKey, isModalOpen) => {
    return (
      <View style={styles.mainDetailWrapper}>
        {list && list.map(item =>
          <View>
            <View style={styles.mainDetailItem}>
              <View style={{ flex: 1 }}>
                {valueExists(item.name) && <Text style={styles.detailTitle}>{item.name}</Text>}
                {valueExists(item.place) && <Text style={styles.detailPlace}>{item.place}</Text>}
                <View style={{ flexDirection: "row" }}>
                  {valueExists(item.startDate) &&
                    <Text style={styles.detailDate}>{item.startDate}</Text>}
                  {valueExists(item.endDate) && <Text
                    style={styles.detailDate}>{valueExists(item.startDate) && " - "}{item.endDate}</Text>}
                </View>
                {valueExists(item.description) &&
                  <Text style={styles.detailDes}>{item.description}</Text>}
              </View>
              <View>
                <Image
                  style={styles.detailImage}
                  resizeMode="cover"
                  source={this.getDetailImage(listName)} />
              </View>
            </View>

          </View>,
        )}
        {!isModalOpen && list.length > 1 && (
          <Button
            onPress={() => {
              this.seeAll(
                listName,
                () => {
                  return this.renderProviderHistory(
                    listName,
                    this.state[stateKey],
                    stateKey,
                    true);
                },
                true,
                this.state[stateKey].length,
              );
            }}

            transparent>
            <View style={styles.seeAllBtn}>
              <Text style={styles.seeAllBtnText}>See all {listName}</Text>
              <AntIcon name="arrowright" size={20} color={Colors.colors.primaryIcon} />
            </View>
          </Button>
        )}
      </View>
    );
  };

  renderQRCode = () => {
    const { qrCode } = this.state;
    return (
      <View style={styles.qrcodeWrapper}>
        <Text style={{ ...styles.sectionTitle, marginBottom: 16 }}>Provider’s QR Code</Text>
        <View style={styles.qrcodeInner}>
          <QRCodeComponent value={qrCode} />
        </View>
      </View>
    );
  };

  renderOptionsButtons = (isConnected, isRequested) => {
    return (
      <View
        {...addTestID("view")}
        style={styles.optionsBtn}>
        {!isConnected && !isRequested &&

          <View style={styles.optionsSecondaryBtnWrapper}>
            <SecondaryButton
              testId="open-profile"
              iconLeft="link-2"
              color={Colors.colors.mainBlue}
              onPress={() => {
                this.connectWithProvider();
              }}
              text="Connect"
              bgColor={Colors.colors.mainBlue10}
              borderColor={Colors.colors.whiteColor}
              type={"Feather"}
              size={24}
            />
          </View>
        }

        <SecondaryButton
          testId="select-provider"
          iconLeft="thumbs-up"
          color={Colors.colors.mainBlue}
          onPress={() => {
            this.recommendProviderProfile("facebook");
          }}
          text="Recommend"
          bgColor={Colors.colors.mainBlue10}
          borderColor={Colors.colors.whiteColor}
          type={"Feather"}
          size={24}
        />

      </View>
    );
  };

  renderBottomModal = (isConnected) => {
    return (
      <View
        style={styles.greBtn}>
        {(!this.isProviderFlow && this.selectedService) && (
          <View>
            <Text style={styles.bottomModalTitle}>{this.selectedService.name}</Text>
            <Text
              style={styles.bottomModalDurationText}>{this.getDurationText(this.selectedService.duration)} session</Text>
          </View>
        )}

        {
          isConnected && (
            <PrimaryButton
              testId="select-provider"
              iconName={"calendar"}
              type={"Feather"}
              color={Colors.colors.whiteColor}
              onPress={() => {
                if (this.selectedService) {
                  this.nextStep(this.selectedService);
                } else {
                  this.requestAppointment();
                }
              }}
              text={"Book Appointment"}
              size={24}
            />
          )
        }

      </View>
    );
  };

  renderSelectedServiceModal = () => {
    const { selectedService, isServiceModalOpen } = this.state;
    return (
      <Modal
        backdropPressToClose={true}
        backdropColor={Colors.colors.overlayBg}
        backdropOpacity={1}
        onClosed={this.serviceModalClose}
        style={{
          ...CommonStyles.styles.commonModalWrapper,
          maxHeight: selectedService.description.length > MAX_DESCRIPTION_LENGTH ? "80%" : "50%",
        }}
        entry={"bottom"}
        position={"bottom"}
        ref={"selectedServiceModal"}
        swipeArea={100}
        isOpen={isServiceModalOpen}
      >
        <View style={{ ...CommonStyles.styles.commonSwipeBar }}
              {...addTestID("swipeBar")}
        />
        <Content
          showsVerticalScrollIndicator={false}>
          <View>
            <Text style={styles.bottomModalLargeTitle}>{selectedService.name}</Text>
            <Text style={styles.bottomModalDurationText}>{selectedService.duration} session</Text>
            <Text style={styles.bottomModalSubText}>{selectedService.description}</Text>
          </View>
        </Content>
        <View style={{ paddingTop: 10, paddingBottom: isIphoneX() ? 34 : 24 }}>
          <PrimaryButton
            testId="select-provider"
            iconName={this.isProviderFlow ? "calendar" : "user"}
            type={"Feather"}
            color={Colors.colors.whiteColor}
            onPress={() => {
              this.nextStep(this.state.selectedService);
            }}
            text={this.isProviderFlow ? "Book Appointment" : "Select provider"}
            size={24}
          />
        </View>
      </Modal>
    );
  };

  nextStep = (selectedService) => {
    let { providerInfo, feedbackSummary } = this.state;
    if (this.props.profile.patient.isPatientProhibitive) {
      this.navigateToProhibitiveScreen();
    } else {
      this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_DATE_TIME_SCREEN, {
        selectedProvider: {
          name: providerInfo.fullName,
          userId: providerInfo.userId,
          profilePicture: providerInfo.profileImage,
          fixedProvider: true,
          referrerScreen: Screens.PROVIDER_DETAIL_SCREEN,
          speciality: providerInfo.speciality.join(","),
          totalReviews: feedbackSummary ? feedbackSummary.totalReviews : 0,
          combinedRating: feedbackSummary ? feedbackSummary.combinedRating : 0,
        },
        selectedService: selectedService,
      });
    }
  };

  serviceModalOpen = (service) => {
    this.setState({ isServiceModalOpen: true, selectedService: service });
  };

  backClicked = () => {
    this.props.navigation.goBack();
  };

  detailDrawerClose = () => {
    this.setState({
      isModalOpen: false,
      callBack: null,
      selectedItemTitle: null,
      selectedItemListCount: null,
      isList: false,
      isShareOptions: false,
      modalHeightProps: {
        height: 0,

      },
    });
  };

  onLayout(event) {
    const { height } = event.nativeEvent.layout;
    const newLayout = {
      height: height,
    };
    setTimeout(() => {
      this.setState({ modalHeightProps: newLayout });
    }, 10);

  }

  serviceModalClose = () => {
    this.setState({
      isServiceModalOpen: false,
      modalHeightProps: {
        height: 0,

      },
    });
  };

  renderServices = () => {
    return (
      <View style={styles.servicesMainWrapper}>
        <Text style={{ ...styles.sectionTitle, paddingLeft: 24 }}>Services</Text>
        <View style={{ paddingLeft: 24 }}>
          <RenderScrollableBoxListComponent
            renderList={this.state.servicesList}
            onPress={this.serviceModalOpen}
          />
        </View>
      </View>
    );
  };

  // renderSlots = () => {
  //     const isSelected = false;
  //     return (
  //         <View style={{paddingBottom: isIphoneX() ? 36 : 24}}>
  //             <View style={{marginTop: 40, marginBottom: 40}}>
  //                 <Text style={styles.bottomModalLargeTitle}>March 19, 2021</Text>
  //                 <Text style={styles.bottomModalDurationText}>3 time slots available</Text>
  //                 {this.state.slots.map(slot =>
  //                     <TouchableOpacity
  //                         key={'slot-'}
  //                         onPress={() => {
  //                         }}
  //                         style={isSelected ? {
  //                             ...styles.singleSlot, ...styles.singleSlotSelected,
  //                             width: '100%',
  //                             height: 64
  //                         } : styles.singleSlot}>
  //                         <Text
  //                             style={isSelected ? [styles.sTimeText, {color: Colors.colors.primaryText}] : styles.sTimeText}>{slot.start} am
  //                             - {slot.end} am EST</Text>
  //                     </TouchableOpacity>
  //                 )}
  //             </View>
  //             <PrimaryButton
  //                 testId="select-provider"
  //                 iconName={this.isProviderFlow ? 'calendar' : 'user'}
  //                 type={'Feather'}
  //                 color={Colors.colors.whiteColor}
  //                 // onPress={() => {
  //                 //     this.nextStep(this.state.selectedItem);
  //                 // }}
  //                 text={this.isProviderFlow ? 'Book Appointment' : "Select provider"}
  //                 size={24}
  //             />
  //
  //         </View>
  //
  //     )
  // }

  renderModalDetail = () => {
    const { selectedItemTitle, selectedItemListCount, callBack, isList, isShareOptions } = this.state;
    let renderView = () => {
      return null;
    };
    if (callBack) {
      renderView = callBack;
    }
    return (
      <Modal
        backdropPressToClose={true}
        backdropColor={Colors.colors.overlayBg}
        backdropOpacity={1}
        onClosed={this.detailDrawerClose}
        style={{
          ...CommonStyles.styles.commonModalWrapper,
          height: selectedItemListCount > 3 ? "80%" : "auto",
          position: "absolute",
          //maxHeight: selectedItemListCount > 3 ? '80%' : '50%'

        }}
        entry={"bottom"}
        position={"bottom"}
        ref={"modalDetailView"}
        swipeArea={100}
        isOpen={this.state.isModalOpen}
      >
        <View style={{ ...CommonStyles.styles.commonSwipeBar }}
              {...addTestID("swipeBar")}
        />
        <Content
          showsVerticalScrollIndicator={false}>
          <View onLayout={(event) => this.onLayout(event)}>
            {isShareOptions ?
              this.renderShareOptions() : isList && (
              <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 24,
              }}>
                <Text style={styles.itemName}>{selectedItemTitle}</Text>
                <Text
                  style={styles.providerInfoRatingTotalReviews}>{selectedItemListCount} total</Text>
              </View>
            )}
            {renderView()}
          </View>
        </Content>
      </Modal>
    );
  };

  renderApproach = (approach, isModalOpen) => {
    return (
      <View style={{ marginBottom: 32 }}>
        <Text style={styles.sectionTitle}>Approach</Text>
        <Text style={{ ...styles.providerInfoRatingDes, marginTop: 8, marginBottom: 8 }}>
          {valueExists(approach) ? approach : "No Approach"}
        </Text>
        {!isModalOpen && valueExists(approach) && (
          <Button
            onPress={() => {
              this.seeAll("Approach",
                () => {
                  return this.renderApproach(this.state.providerInfo.approach, true);
                },
                false,
                0);
            }}
            transparent>
            <View style={styles.seeAllBtn}>
              <Text style={styles.seeAllBtnText}>Read more</Text>
              <AntIcon name="arrowright" size={20} color={Colors.colors.primaryIcon} />
            </View>
          </Button>
        )}
      </View>
    );
  };

  seeAll = (selectedItemTitle, callBack, isList, selectedItemListCount) => {
    this.setState({ selectedItemTitle, selectedItemListCount, callBack, isModalOpen: true, isList });
  };

  renderShareOptions = () => {
    const { isConnected, isRequested } = this.state;
    let data = this.NOT_CONNECTED_OPTIONS;
    if (isConnected) {
      data = this.CONNECTED_OPTIONS;
    }
    if (isRequested) {
      data = data.filter(button => button.title !== "Connect");
    }
    return (
      <FlatList
        scrollIndicatorInsets={{ right: 1 }}
        showsVerticalScrollIndicator={false}
        data={data}
        style={styles.optionsButtonsMain}
        renderItem={({ item, index }) => {
          if (item.title === "Disconnect" && isRequested) {
            return null;
          } else {
            return (
              <View style={styles.singleActionItem}>
                <TransactionSingleActionItem
                  title={item.title}
                  iconBackground={item.iconBgColor}
                  styles={styles.gButton}
                  onPress={() => {
                    item.callback();
                  }}
                  renderIcon={(size, color) =>
                    <Icon type={item.iconType} style={[styles.optionIcon, { color: item.iconColor }]}
                          name={item.icon} />
                  }
                />
              </View>
            );
          }
        }}
        keyExtractor={(item, index) => index.toString()}
      />
    );
  };

  newConnectionSegmentEvents = async () => {
    let { providerInfo } = this.state;
    const segmentPayload = {
      userId: this.props?.auth?.meta?.userId,
      providerId: providerInfo?.userId,
      connectedAt: moment.utc(Date.now()).format(),
      providerName: providerInfo?.name,
      providerRole: providerInfo?.designation,
    };

    await Analytics.track(SEGMENT_EVENT.NEW_PROVIDER_CONNECTION, segmentPayload);

  };


  connectWithProvider = () => {
    this.setState({ isModalOpen: false });
    this.makeConnection();
  };

  makeConnection = async () => {
    let { providerInfo, patientInfo } = this.state;
    this.props.connect({
      userId: providerInfo.userId,
      onSuccess: async () => {
        const allowProviderAccess = {
          providerId: providerInfo.userId,
          allowed: true,
        };
        this.props.updateProviderAccess(allowProviderAccess);
        this.newConnectionSegmentEvents();
        this.props.navigation.navigate(this.state.providerInfo.type === "PRACTITIONER" ? Screens.PROVIDER_DETAIL_SCREEN : Screens.MATCH_MAKER_DETAIL_SCREEN, {
          provider: providerInfo,
          patient: patientInfo,
          referrer: Screens.PROVIDER_ACCESS_SCREEN,
          providerChatOpen: false,
        });
      },
      onFailure: () => {
        AlertUtil.showErrorMessage("Unable to connect at the moment. Please try again later");
      },
    });
  };

  CONNECTED_OPTIONS = [
    // {
    //     title: 'View past appointments',
    //     icon: 'calendar-check-o',
    //     iconBgColor: Colors.colors.successBG,
    //     iconColor: Colors.colors.successIcon,
    //     iconType: 'FontAwesome',
    //     callback: () => {
    //         console.log('view past appointments clicked')
    //     }
    // },
    {
      title: "Recommend",
      icon: "upload",
      iconBgColor: Colors.colors.secondaryColorBG,
      iconColor: Colors.colors.secondaryIcon,
      iconType: "Feather",
      callback: () => {
        this.recommendProviderProfile("facebook");
      },

    },
    {
      title: "Go to chat",
      icon: "message-circle",
      iconBgColor: Colors.colors.primaryColorBG,
      iconColor: Colors.colors.primaryIcon,
      iconType: "Feather",
      callback: this.startConversation,
    },
    {
      title: "Schedule Appointment",
      icon: "calendar-check-o",
      iconBgColor: Colors.colors.primaryColorBG,
      iconColor: Colors.colors.primaryIcon,
      iconType: "FontAwesome",
      callback: this.requestAppointment,
    },
    {
      title: "Disconnect",
      icon: "link-variant-off",
      iconBgColor: Colors.colors.errorBG,
      iconColor: Colors.colors.errorIcon,
      iconType: "MaterialCommunityIcons",
      callback: this.disconnectProvider,
    },

  ];

  NOT_CONNECTED_OPTIONS = [
    {
      title: "Recommend",
      icon: "upload",
      iconBgColor: Colors.colors.secondaryColorBG,
      iconColor: Colors.colors.secondaryIcon,
      iconType: "Feather",
      callback: () => {
        this.recommendProviderProfile("facebook");
      },

    },
    {
      title: "Connect",
      icon: "link-2",
      iconBgColor: Colors.colors.primaryColorBG,
      iconColor: Colors.colors.primaryIcon,
      iconType: "Feather",
      callback: this.connectWithProvider,
    },

  ];


  render = () => {
    StatusBar.setBarStyle("dark-content", true);
    const {
      providerInfo,
      feedbackSummary,
      isLoading,
      providerAffiliation,
      providerEducation,
      providerEmployment,
      isModalOpen,
      isServiceModalOpen,
    } = this.state;

    const isConnected =
      this.props.connections.activeConnections.filter(contact => {
        return contact.connectionId === this.state.providerInfo.userId;
      }).length > 0;

    const isRequested = this.props.connections.requestedConnections.filter((connection) => {
      return connection.connectionId === this.state.providerInfo.userId;
    }).length > 0;

    if (isLoading || this.props.connections.isLoading) {
      return <AlfieLoader />;
    }
    return (
      <Container style={{ backgroundColor: Colors.colors.screenBG }}>
        <Header transparent style={styles.header}>
          <StatusBar
            backgroundColor={Platform.OS === "ios" ? null : "transparent"}
            translucent
            barStyle={"dark-content"}
          />
          <Left>
            <View style={styles.backButton}>
              <BackButton
                {...addTestID("back")}
                onPress={this.backClicked}
              />
            </View>
          </Left>
          <Body />
          <Right>
            <Button
              {...addTestID("is-connected")}
              transparent
              style={{ alignItems: "flex-end", paddingRight: 7, marginRight: 10 }}
              onPress={() => {
                if (isConnected) {
                  this.setState({
                    isModalOpen: true,
                    isShareOptions: true,
                    socialOptions: false,
                    isConnected: isConnected,
                    isRequested: isRequested,
                  });
                } else {
                  this.setState({
                    isModalOpen: true,
                    isShareOptions: true,
                    socialOptions: false,
                    copiedLink: false,
                    isConnected: isConnected,
                    isRequested: isRequested,
                  });
                }

              }}>
              <FeatherIcons size={30} color={Colors.colors.mainBlue} name="more-horizontal" />
            </Button>
          </Right>
        </Header>
        <Content
          showsVerticalScrollIndicator={false}
          {...addTestID("provider-detail")}
          style={{ padding: 24 }}
        >
          <View>
            {providerInfo && this.renderProviderDetail(providerInfo, feedbackSummary)}
          </View>
          <View style={styles.providerReviewsMainWrapper}>
            {this.isProviderFlow && this.state.servicesList && this.state.servicesList.length > 0 ? this.renderServices() : null}
            {providerInfo && this.renderApproach(
              providerInfo.approach,
              false)}
            {feedbackSummary && (
              <Text style={styles.sectionTitle}>Recent Reviews</Text>
            )}
            {feedbackSummary && this.renderReviews(
              [feedbackSummary.recentReviews[0]],
              false)}
            {providerInfo?.providerProfile?.credentials && (
              <Text style={styles.sectionTitle}>Credentials</Text>
            )}
            {providerInfo?.providerProfile?.credentials && this.renderListItems(
              "Credentials",
              providerInfo.providerProfile.credentials)}
            {providerInfo?.providerProfile?.certifications && (
              <Text style={styles.sectionTitle}>Certifications</Text>
            )}
            {providerInfo?.providerProfile?.certifications && this.renderListItems(
              "Certifications",
              providerInfo.providerProfile.certifications)}
            {/*{providerAffiliation && providerAffiliation.length > 0 && (
                            <Text style={styles.sectionTitle}>Clinic affiliation</Text>
                        )}
                        {providerAffiliation && providerAffiliation.length > 0 && this.renderProviderHistory("Clinic affiliation",
                            [providerAffiliation[0]],
                            'providerAffiliation',
                            false
                        )}
                        {providerEmployment && providerEmployment.length > 0 && (
                            <Text style={styles.sectionTitle}>Past employment</Text>
                        )}
                        {providerEmployment && providerEmployment.length > 0 && this.renderProviderHistory("Past employment",
                            [providerEmployment[0]],
                            'providerEmployment',
                            false
                        )}*/}
            {providerEducation && providerEducation.length > 0 && (
              <Text style={{ ...styles.sectionTitle, marginBottom: 8 }}>Education</Text>
            )}
            {providerEducation && providerEducation.length > 0 && this.renderProviderHistory("Education",
              [providerEducation[0]],
              "providerEducation",
              false,
            )}
            {this.renderQRCode()}
            {this.renderOptionsButtons(isConnected, isRequested)}
          </View>
        </Content>
        {isModalOpen ? this.renderModalDetail() : this.renderBottomModal(isConnected)}
        {isServiceModalOpen && this.renderSelectedServiceModal()}
      </Container>
    );
  };
}

const styles = StyleSheet.create({
  mainDetailWrapper: {
    marginBottom: 20,
  },
  optionsButtonsMain: {
    // marginBottom: 16
  },
  singleActionItem: {
    marginBottom: 16,
  },
  optionIcon: {
    fontSize: 24,
  },
  optionsButtonsEach: {
    /*flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.colors.borderColor,
    marginBottom: 16,
    borderRadius: 8,
    padding: 16*/
  },

  optionsButtonsEachTitle: {
    ...TextStyles.mediaTexts.manropeBold,
    ...TextStyles.mediaTexts.TextH7,
    color: Colors.colors.highContrast,
  },

  header: {
    paddingTop: 15,
    paddingLeft: 3,
    paddingRight: 0,
    height: HEADER_SIZE,
  },
  backButton: {
    marginLeft: 18,
    width: 40,
  },
  headerRow: {
    flex: 3,
    alignItems: "center",
  },
  headerText: {
    ...TextStyles.mediaTexts.manropeBold,
    ...TextStyles.mediaTexts.TextH5,
    color: Colors.colors.highContrast,
    textAlign: "center",
  },
  providerDetailWrapper: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  personalInfoWrapper: {},
  imageWrapper: {
    flexDirection: "row",
  },
  proImage: {
    width: 120,
    height: 120,
    borderRadius: 80,
    overflow: "hidden",
  },
  proBgMain: {
    width: 65,
    height: 65,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  proLetterMain: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.TextH3,
    color: Colors.colors.whiteColor,
  },
  itemDetail: {
    marginLeft: 16,
    flex: 1,
  },
  itemName: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.TextH4,
    color: Colors.colors.highContrast,
  },
  itemDes: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.bodyTextS,
    color: Colors.colors.lowContrast,
    marginBottom: 16,
  },
  itemTotalReviews: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.bodyTextExtraS,
    color: Colors.colors.lowContrast,
  },

  seeAllBtn: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  seeAllBtnText: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.buttonTextM,
    color: Colors.colors.primaryText,
    marginRight: 8,
  },

  sectionTitle: {
    ...TextStyles.mediaTexts.serifProBold,
    ...TextStyles.mediaTexts.TextH4,
    color: Colors.colors.highContrast,
  },

  providerReviewsMainWrapper: {
    marginBottom: 32,
  },

  providerInfoRatingWrapper: {
    marginTop: 16,
    marginBottom: 24,
  },
  providerInfoRatingHeadingSection: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  providerInfoRatingTotalReviews: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.bodyTextExtraS,
    color: Colors.colors.lowContrast,
  },
  providerInfoRating: {
    flexDirection: "row",
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 8,
  },
  providerInfoRatingText: {
    marginLeft: 8,
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.bodyTextExtraS,
    color: Colors.colors.highContrast,
  },
  providerInfoRatingDate: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.bodyTextExtraS,
    color: Colors.colors.lowContrast,
  },
  providerInfoRatingDes: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.bodyTextS,
    color: Colors.colors.highContrast,
  },

  listTitle: {
    ...TextStyles.mediaTexts.serifProRegular,
    ...TextStyles.mediaTexts.TextH4,
    color: Colors.colors.highContrast,
    //marginBottom: 16
  },

  detailImage: {
    // width: 44,
    height: 44,
    overflow: "hidden",
    position: "relative",
    left: 0,
    top: -1,

  },
  mainDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    // position:'relative'
  },
  detailTitle: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.bodyTextExtraS,
    color: Colors.colors.highContrast,
    marginTop: 8,
  },
  detailPlace: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.inputLabel,
    color: Colors.colors.mediumContrast,
  },
  detailDate: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.inputLabel,
    color: Colors.colors.lowContrast,
  },
  detailDes: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.bodyTextS,
    color: Colors.colors.highContrast,
    marginTop: 8,
    marginBottom: 8,
    flex: 1,
  },

  qrcodeWrapper: {
    marginBottom: 32,
  },
  qrcodeInner: {
    ...CommonStyles.styles.shadowBox,
    borderRadius: 24,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    marginTop: 24,
  },
  optionsBtn: {
    marginBottom: 32,
  },
  optionsSecondaryBtnWrapper: {
    // marginBottom: 16
  },
  greBtn: {
    padding: 24,
    paddingBottom: isIphoneX() ? 36 : 24,
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
    ...CommonStyles.styles.stickyShadow,
  },
  secondaryBtnWrapper: {
    marginBottom: 16,
  },
  bottomModalLargeTitle: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.TextH3,
    color: Colors.colors.highContrast,
  },
  bottomModalTitle: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.buttonTextM,
    color: Colors.colors.highContrast,
    marginTop: 4,
  },

  bottomModalDurationText: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.bodyTextS,
    color: Colors.colors.lowContrast,
    marginBottom: 24,
  },
  bottomModalSubText: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.subTextL,
    color: Colors.colors.lowContrast,
    marginBottom: 40,
  },
  servicesMainWrapper: {
    marginBottom: 32,
    marginLeft: -24,
    marginRight: -24,
  },
  socialBtn: {
    width: 50,
    height: 50,
    borderRadius: 8,
    paddingTop: 0,
    paddingBottom: 0,
    overflow: "hidden",
    margin: 8,
  },
  shareOverlay: {
    height: 338,
    // padding: 24,
    paddingTop: 8,
    alignSelf: "center",
    position: "absolute",
    bottom: 0,
    paddingBottom: isIphoneX() ? 34 : 24,
    left: 0,
    right: 0,
    top: 0,
    borderTopColor: "#f5f5f5",
    borderTopWidth: 0.5,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  singleSlot: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
    shadowColor: "rgba(0,0,0,0.07)",
    backgroundColor: Colors.colors.whiteColor,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 10,
    shadowOpacity: 0.8,
    elevation: 0,
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 8,
  },
  singleSlotSelected: {
    borderColor: Colors.colors.mainBlue40,
    backgroundColor: Colors.colors.primaryColorBG,
  },
  sTimeText: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.subTextM,
    color: Colors.colors.highContrast,
  },
});

export default connectConnections()(ProviderDetailScreen);
