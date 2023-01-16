import React from 'react';
import {Image, StatusBar, StyleSheet, TouchableOpacity} from 'react-native';
import {Container, Content, Text, View} from 'native-base';
import {AlertUtil, Colors, CommonStyles, isIphoneX, TextStyles,} from 'ch-mobile-shared';
import SplashScreen from 'react-native-splash-screen';
import {Screens} from '../../constants/Screens';
import {S3_BUCKET_LINK} from "../../constants/CommonConstants";
import {DEFAULT_AVATAR_COLOR} from "ch-mobile-shared/src/constants";
import {connectConnections} from "../../redux";
import {BookAppointmentModal} from "../../components/appointment/BookAppointmentModal";
import Loader from "../../components/Loader";
import ProfileService from "../../services/Profile.service";
import {NavigationActions, StackActions} from "react-navigation";

class MatchMakerScreen extends React.PureComponent<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        SplashScreen.hide();
        super(props);
        this.state = {
            bookModalVisible: false,
            isScreenFocused : true
        }
    }

    componentDidMount() {
        this.reference = this.props.navigation.addListener(
            "willFocus",
            payload => {
                if (!this.props.profile.isLoading && this.props.profile?.patient?.shortOnBoardingDetail?.postOnboardingAttempt) {
                    this.navigateToTabView();
                }
            },
        );
        this.props.fetchProfile();
        this.props.fetchConnections();
    }

    componentWillUnmount() {
        if (this.reference) {
            this.reference.remove();
        }
    }

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
        if (!this.props.profile.isLoading && this.props.profile?.patient?.shortOnBoardingDetail?.postOnboardingAttempt && this.state.isScreenFocused) {
            this.navigateToTabView();
        }
    }

    navigateToTabView = () => {
        this.updatePostOnboardingAttempt();
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({
                    routeName: Screens.TAB_VIEW
                }
            )],
        });
        this.props.navigation.dispatch(resetAction);
    };

    openChatWith = item => {
        this.updatePostOnboardingAttempt();
        this.navLock = true;
        if (item.type === "CHAT_BOT") {
            this.setState({isScreenFocused: false})
            this.props.navigation.navigate(Screens.CHAT_INSTANCE, {contact: item});
        } else {
            if (this.props.chat.sendbirdStatus === 2) {
                const resetAction = StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({
                            routeName: Screens.LIVE_CHAT_WINDOW_SCREEN,
                            params: {
                                provider: {...item, userId: item.connectionId},
                                referrer: Screens.TAB_VIEW,
                                patient: this.props.auth.meta,
                                connection: item,
                            },
                        }
                    )],
                });
                this.props.navigation.dispatch(resetAction);
            } else {
                AlertUtil.showErrorMessage("Please wait until chat service is connected");
            }

        }
        setTimeout(() => {
            this.navLock = false;
        }, 1000);
    };

    navigateToProviders = () => {
        this.updatePostOnboardingAttempt();
        this.setState({isScreenFocused: false})
        this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_PROVIDER_SCREEN, {
            isProviderFlow: true,
        });
    };

    navigateToServices = () => {
        this.updatePostOnboardingAttempt();
        this.setState({isScreenFocused: false})
        this.props.navigation.navigate(Screens.APPT_SELECT_SERVICE_TYPE_SCREEN, {
            isProviderFlow: false,
        });
    };

    updatePostOnboardingAttempt = async () => {
        try {
            const response = await ProfileService.updatePostOnboardingAttempt({postOnboardingAttempt: true});
            if (response?.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            } else {
                console.log('Post On boarding attempted successfully !');
                this.props.fetchProfile();
            }
        } catch (e) {
            console.log('Error in update post on boarding attempt', e)
        }
    };

    render() {
        StatusBar.setBarStyle('dark-content', true);
        if (this.props.profile.isLoading || this.props.connections.isLoading) {
            return <Loader/>;
        }
        let connections = this.props.connections.activeConnections;
        const filters = ['PROVIDERS', 'PRACTITIONER', 'MATCH_MAKER'];
        let providerConnection = connections.find(connection => filters.includes(connection.type));
        let chatBotConnection = connections.find(connection => connection.type === 'CHAT_BOT' && connection.name !== "Confidant ChatBot");
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />
                <Content showsVerticalScrollIndicator={false}>
                    <View style={styles.textBox}>
                        <View style={styles.avatarContainer}>
                            {providerConnection && providerConnection.profilePicture
                                ? <Image
                                    style={styles.avatarImage}
                                    source={{uri: S3_BUCKET_LINK + providerConnection.profilePicture}}
                                />
                                :
                                <View style={{...styles.proBgMain, backgroundColor: DEFAULT_AVATAR_COLOR}}>
                                    <Text
                                        style={styles.proLetterMain}>{providerConnection && providerConnection.name.charAt(0).toUpperCase()}</Text>
                                </View>
                            }
                        </View>
                        <Text style={styles.privacyMainText}>Hi! I’m {providerConnection && providerConnection.name},
                            your{'\n'}matchmaker.</Text>
                        <Text style={styles.singleParah}>
                            {this.props.profile?.patient?.shortOnBoardingDetail?.needAppointment || this.props.profile?.patient?.shortOnBoardingDetail?.talkToMatchMaker
                                ? 'I’ll be confirming your appointment details with you.' +
                                ' Expect to hear from me in the next 24 hours.'
                                : 'I’ll answer your questions and help you book appointments.'
                            }
                        </Text>
                    </View>
                    <View style={{paddingHorizontal: 24, marginBottom: 24}}>
                        <TouchableOpacity style={styles.BoxWrapper}
                                          onPress={() => this.openChatWith(providerConnection)}>
                            <View style={styles.boxTop}>
                                <Text style={styles.boxTopText}>Chat with me</Text>
                            </View>
                            <View>
                                <Text style={styles.boxBottomText}>Answering questions is what I do! Insurance?
                                    Services? Cost? I can answer all that and more.</Text>
                            </View>
                        </TouchableOpacity>

                        {this.props.profile?.patient?.shortOnBoardingDetail?.needAppointment || this.props.profile?.patient?.shortOnBoardingDetail?.talkToMatchMaker
                            ?
                            <TouchableOpacity style={styles.BoxWrapper}
                                              onPress={() => {
                                                  this.openChatWith(chatBotConnection)
                                              }}>
                                <View style={styles.boxTop}>
                                    <Text style={styles.boxTopText}>Complete your pre-{'\n'}appointment form</Text>
                                </View>
                                <View>
                                    <Text style={styles.boxBottomText}>Help us understand your background and unique
                                        needs.</Text>
                                </View>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity style={styles.BoxWrapper}
                                              onPress={() => {
                                                  this.setState({bookModalVisible: true})
                                              }}>
                                <View style={styles.boxTop}>
                                    <Text style={styles.boxTopText}>Book an appointment yourself</Text>
                                </View>
                                <View>
                                    <Text style={styles.boxBottomText}>Find a good time to meet and the right person
                                        from our team for you.</Text>
                                </View>
                            </TouchableOpacity>

                        }

                        <TouchableOpacity style={styles.BoxWrapper} onPress={() => {
                            this.navigateToTabView()
                        }}>
                            <View style={styles.boxTop}>
                                <Text style={styles.boxTopText}>Start using our digital tools</Text>
                            </View>
                            <View>
                                <Text style={styles.boxBottomText}>Try ReVAMP - our DIY behavior change program, explore
                                    healthbots, read articles, and more.</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </Content>
                <BookAppointmentModal
                    visible={this.state.bookModalVisible}
                    onClose={() => {
                        this.setState({bookModalVisible: false});
                    }}
                    navigateToProviders={this.navigateToProviders}
                    navigateToServices={this.navigateToServices}
                />
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    backButtonWrapper: {
        position: 'relative',
        zIndex: 2,
        paddingTop: isIphoneX() ? 50 : 44,
        paddingLeft: 22
    },
    textBox: {
        alignItems: 'center',
        paddingLeft: 24,
        paddingRight: 24,
        marginBottom: 40,
        marginTop: 50,
        flex: 1
    },
    signInIcon: {
        marginBottom: 40,
        width: 120,
        height: 120
    },
    privacyMainText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 16,
        textAlign: 'center'
    },
    singleParah: {
        ...TextStyles.mediaTexts.bodyTextM,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.mediumContrast,
        textAlign: "center",
        // marginBottom: 16,
    },
    BoxWrapper: {
        padding: 24,
        marginBottom: 16,
        borderRadius: 12,
        ...CommonStyles.styles.shadowBox,
    },
    boxTop: {
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    boxTopIcon: {
        width: 56,
        height: 56,
        marginRight: 24,
    },
    boxTopText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.highContrast,
    },
    boxBottomText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.mediumContrast,
    },
    avatarContainer: {
        marginBottom: 32,
    },
    avatarImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignSelf: 'center',
        borderColor: '#F3F4F4',
        borderWidth: 5,
    },
    proBgMain: {
        borderColor: '#F3F4F4',
        borderWidth: 5,
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    proLetterMain: {
        ...TextStyles.mediaTexts.manropeExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.white,
        textTransform: 'uppercase'
    },
});

export default connectConnections()(MatchMakerScreen);
