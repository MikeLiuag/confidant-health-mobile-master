import React, {Component} from 'react';
import {StatusBar, StyleSheet, FlatList, TouchableOpacity, Image} from 'react-native';
import {Container, Content, Text, View, Button, Left, Body, Right, Header} from 'native-base';
import {
    addTestID, getHeaderHeight,
    Colors, TextStyles, CommonStyles, BackButton, getAvatar, AlertUtil, CONNECTION_TYPES,
} from "ch-mobile-shared";
import GenericActionButton from 'ch-mobile-shared/src/components/GenericActionButton';
import AwesomeFonts from 'react-native-vector-icons/FontAwesome';
import FeatherIcons from 'react-native-vector-icons/Feather';
import AntIcons from 'react-native-vector-icons/AntDesign';
import Modal from 'react-native-modalbox';
import moment from "moment";
import {Screens} from "../../constants/Screens";
import AppointmentService from "../../services/Appointment.service";
import {connectConnections} from "../../redux";
import DeepLinksService from "../../services/DeepLinksService";
import Loader from '../../components/Loader';
const HEADER_SIZE = getHeaderHeight();
class MyCareTeamScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            careTeamList : null,
            selectedCareTeamDetails : null,
            modalOpen: false,
            modalHeightProps: {
                height: 50
            }
        };
        // console.log(filteredConnections);
    }

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
        const careTeamMembers = this.props.connections.activeConnections.filter( connection => connection.type === CONNECTION_TYPES.MATCH_MAKER || connection.type === CONNECTION_TYPES.PRACTITIONER)
        if(careTeamMembers.length===0) {
            this.navigateBack();
        }
    }

    renderAppointmentView = (item) => {
        const {appointments} = this.props;

        if(appointments.appointments.length > 0){
            const bookedAppointments = appointments
                .filter(appt => appt.participantId === item.connectionId)
                .filter(appt => moment(appt.startTime).isAfter(moment()));
            if (bookedAppointments.length > 0) {
                return <View style={styles.nextApptWrap}>
                    <Text style={styles.nextApptTitle}>
                        Next Appointment
                    </Text>
                    <Text style={styles.nextApptDate}>{this.getAppointmentTimeString(bookedAppointments[0])}</Text>
                </View>;
            }else{
                return null;
            }

            // return <View style={styles.nextAppWrap}>
            //     <Text style={styles.nextAppWrapAppText}>Next Appointment</Text>
            //     <Text>{this.getAppointmentTimeString(bookedAppointments[0])}</Text>
            // </View>;
        }

    };


    recommendProvider = async (channel, selectedProvider) => {
        await DeepLinksService.recommendProviderProfileLink(
            channel,
            selectedProvider.connectionId
        );
    };


    disconnectProvider = (selectedProvider) => {
        this.props.disconnect({
            userId: selectedProvider.connectionId,
        });

        this.detailDrawerClose();
    };

    openChat = (item) => {
        this.props.navigation.navigate(Screens.LIVE_CHAT_WINDOW_SCREEN, {
            provider: { ...item, userId: item.connectionId },
            referrer: Screens.TAB_VIEW,
            patient: this.props.auth.meta,
            connection: item,
        });
    }

    navigateToProhibitiveScreen = ()=>{
        this.props.navigation.navigate(Screens.PATIENT_PROHIBITIVE_SCREEN);
    }

    scheduleAppointment = async (selectedProvider) => {
        this.detailDrawerClose();
        if(this.props.profile.patient.isPatientProhibitive){
            this.navigateToProhibitiveScreen()
        }else {
            this.setState({ isLoading: true });
            let response = await AppointmentService.listProviders();
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({ isLoading: false });
            } else {

                const selectedResult = response.filter(data => data.userId === selectedProvider.connectionId);
                this.setState({ isLoading: false });
                this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN, {
                    selectedProvider: selectedResult[0],
                });
            }
        }
    }

    navigateBack() {
        this.props.navigation.goBack();
    }

    showDetails = (item) => {
        this.setState({selectedCareTeamDetails : item, modalOpen: true})
    }

    detailDrawerClose = () => {
        this.setState({selectedCareTeamDetails : null, modalOpen: false})
    };

    navigateToNextScreen = () => {
        // this.props.navigation.navigate(Screens.SOCIAL_DETERMINANTS_SCREEN);
    };

    onLayout(event) {
        const {height} = event.nativeEvent.layout;
        const newLayout = {
            height: height
        };

        this.setState({ modalHeightProps: newLayout });
    }

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        if(this.props.connections.isLoading) {
            return <Loader/>
        }
        const careTeamMembers = this.props.connections.activeConnections.filter( connection => connection.type === 'MATCH_MAKER' || connection.type === 'PRACTITIONER')

        return (
            <Container style={{ backgroundColor: Colors.colors.screenBG }}>
                <Header transparent style={styles.header}>
                    <StatusBar
                        backgroundColor="transparent"
                        barStyle="dark-content"
                        translucent
                    />
                    <Left>
                        <BackButton
                            {...addTestID('Back')}
                            onPress={() => this.navigateBack()}
                        />
                    </Left>
                    <Body style={{flex: 2}}>
                    </Body>
                    <Right/>
                </Header>
                <Content showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
                    <View style={styles.titleWrap}>
                        <Text style={{...CommonStyles.styles.commonAptHeader}}>
                            My care team
                        </Text>
                        {this.state.careTeamList && this.state.careTeamList.length &&
                        <Text style={styles.memberCount}>{this.state.careTeamList.length} members</Text>
                        }
                    </View>

                    {careTeamMembers && careTeamMembers.length > 0 &&
                    <View style={styles.teamWrapper}>
                        <FlatList
                            data={careTeamMembers}
                            renderItem={({item, index}) =>
                                <TouchableOpacity
                                    style={styles.singleTeamItem}
                                    onPress={() => {
                                        this.showDetails(item)
                                    }}
                                >
                                    <View style={styles.teamUpperInfo}>
                                        <View style={styles.teamImgWrap}>
                                            <Image
                                                style={styles.teamImg}
                                                resizeMode={'cover'}
                                                source={{uri: getAvatar(item)}}/>
                                            {/*<View style={styles.statusDot}></View>*/}
                                        </View>
                                        <View style={styles.teamDetails}>
                                            <Text style={styles.infoTitle}>{item.name}</Text>
                                            <Text style={styles.infoContent}>{item.designation}</Text>
                                        </View>
                                        <View style={styles.domainIcon}>
                                            <FeatherIcons size={30} color={Colors.colors.mainBlue}
                                                          name="more-horizontal"/>
                                        </View>
                                    </View>
                                    {/*{index === 0 ?*/}
                                    {/*        this.renderAppointmentView(item) : null*/}
                                    {/*}*/}
                                </TouchableOpacity>
                            }
                            keyExtractor={item => item.id}
                        />
                    </View>
                    }
                </Content>



                <Modal
                    backdropPressToClose={true}
                    backdropColor={ Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.detailDrawerClose}
                    style={{...CommonStyles.styles.commonModalWrapper,
                        maxHeight: '80%' }}
                    entry={"bottom"}
                    isOpen={this.state.modalOpen}
                    position={"bottom"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    {this.state.selectedCareTeamDetails &&
                    <Content showsVerticalScrollIndicator={false}>
                        <View>
                            <View style={styles.contentWrapper}>
                                <View style={styles.teamImgWrapModal}>
                                    <Image
                                        style={styles.teamImgModal}
                                        resizeMode={'cover'}
                                        source={{uri: getAvatar(this.state.selectedCareTeamDetails)}}/>
                                    {/*<View style={styles.statusDotModal}></View>*/}
                                </View>
                                <View style={styles.teamDetails}>
                                    <Text style={styles.infoTitleModal}>{this.state.selectedCareTeamDetails.name}</Text>
                                    <Text style={styles.infoContentModal}>{this.state.selectedCareTeamDetails.designation}</Text>
                                </View>
                            </View>
                            <View style={styles.actionList}>
                                <View style={styles.singleActionItem}>
                                    <GenericActionButton
                                        onPress={()=>{this.scheduleAppointment(this.state.selectedCareTeamDetails)}}
                                        title={'Schedule an appointment'}
                                        iconBackground={Colors.colors.primaryColorBG}
                                        styles={styles.gButton}
                                        renderIcon={(size, color) =>
                                            <FeatherIcons size={22} color={Colors.colors.primaryIcon} name="calendar"/>
                                        }
                                    />
                                </View>
                                <View style={styles.singleActionItem}>
                                    <GenericActionButton
                                        onPress={()=>{ this.props.navigation.navigate(Screens.APPOINTMENTS_SCREEN)}}
                                        title={'View past appointments'}
                                        iconBackground={Colors.colors.successBG}
                                        styles={styles.gButton}
                                        renderIcon={(size, color) =>
                                            <AwesomeFonts size={22} color={Colors.colors.successIcon}
                                                          name="calendar-check-o"/>
                                        }
                                    />
                                </View>
                                <View style={styles.singleActionItem}>
                                    <GenericActionButton
                                        title={'Go to chat'}
                                        onPress={()=> {this.openChat(this.state.selectedCareTeamDetails)}}
                                        iconBackground={Colors.colors.warningBG}
                                        styles={styles.gButton}
                                        renderIcon={(size, color) =>
                                            <FeatherIcons size={22} color={Colors.colors.warningIcon}
                                                          name="message-circle"/>
                                        }
                                    />
                                </View>
                                <View style={styles.singleActionItem}>
                                    <GenericActionButton
                                        title={'Recommend'}
                                        onPress={()=> {this.recommendProvider('facebook', this.state.selectedCareTeamDetails)}}
                                        iconBackground={Colors.colors.secondaryColorBG}
                                        styles={styles.gButton}
                                        renderIcon={(size, color) =>
                                            <FeatherIcons size={22} color={Colors.colors.secondaryIcon} name="share"/>
                                        }
                                    />
                                </View>
                                <View style={styles.singleActionItem}>
                                    <GenericActionButton
                                        onPress={()=> {this.disconnectProvider(this.state.selectedCareTeamDetails)}}
                                        title={'Disconnect'}
                                        iconBackground={Colors.colors.errorBG}
                                        styles={styles.gButton}
                                        renderIcon={(size, color) =>
                                            <AntIcons size={22} color={Colors.colors.errorIcon} name="disconnect"/>
                                        }
                                    />
                                </View>
                            </View>
                        </View>

                    </Content>
                    }
                </Modal>

            </Container>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        // paddingTop: 30,
        paddingLeft: 24,
        borderBottomWidth: 0,
        elevation: 0,
        height: HEADER_SIZE,
    },
    titleWrap: {
        marginBottom: 16
    },
    memberCount: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,
        marginTop: -20
    },
    teamWrapper: {
        marginBottom: 40
    },
    singleTeamItem: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 12,
        marginBottom: 8
    },
    teamUpperInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16
    },
    domainIcon: {

    },
    nextApptWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor:  Colors.colors.mediumContrastBG
    },
    nextApptTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
    },
    nextApptDate: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,
    },
    modalStatus: {
        color: Colors.colors.secondaryText,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeBold,
        marginBottom: 4
    },
    contentWrapper: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    teamImgWrap: {
        width: 48,
        height: 48
    },
    teamImgWrapModal: {
        width: 68,
        height: 68
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 5,
        backgroundColor: Colors.colors.neutral50Icon,
        borderColor: Colors.colors.white,
        borderWidth: 2,
        position: 'absolute',
        bottom: 3,
        right: -1
    },
    statusDotModal: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: Colors.colors.neutral50Icon,
        borderColor: Colors.colors.white,
        borderWidth: 3,
        position: 'absolute',
        bottom: 3,
        right: -1
    },
    teamImg: {
        width: 48,
        height: 48,
        borderRadius: 24
    },
    teamImgModal: {
        width: 68,
        height: 68,
        borderRadius: 34
    },
    teamDetails: {
        paddingLeft: 12,
        flex: 1
    },
    infoTitle: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS
    },
    infoTitleModal: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        paddingLeft: 4
    },
    infoContent: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText
    },
    infoContentModal: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextS,
        paddingLeft: 4
    },
    actionList: {
        marginTop: 24
    },
    singleActionItem: {
        borderWidth: 1,
        borderColor: Colors.colors.mediumContrastBG,
        borderRadius: 12,
        marginBottom: 16
    }
});


export default connectConnections()(MyCareTeamScreen);
