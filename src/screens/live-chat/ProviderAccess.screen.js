import React, {Component} from "react";
import {Image, StatusBar, StyleSheet, Text, View, Platform} from "react-native";
import {Button, Container, Content, Header, ListItem, Radio} from "native-base";
import LinearGradient from "react-native-linear-gradient";
import AwesomeIcon from 'react-native-vector-icons/FontAwesome';
import GradientButton from "../../components/GradientButton";
import {Screens} from "../../constants/Screens";
import {DEFAULT_AVATAR_COLOR, DEFAULT_IMAGE, S3_BUCKET_LINK, SEGMENT_EVENT} from '../../constants/CommonConstants';
import {addTestID, AlertUtil, isIphoneX} from 'ch-mobile-shared';
import AlfieLoader from '../../components/Loader';
import {Buttons} from "../../styles";
import {connectConnections} from "../../redux";
import moment from "moment";
import Analytics from "@segment/analytics-react-native";

class ProviderAccessScreen extends Component<Props> {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation, profile} = this.props;
        const patient = navigation.getParam('patientInfo', null);
        const provider = navigation.getParam('providerInfo', null);
        this.state = {
            isLoading: false,
            patientInfo: patient,
            providerInfo: provider,
            //hasAccess: profile.providerAccess && profile.providerAccess.allowedProviders.includes(provider.userId),
            hasAccess: profile.providerAccess && profile.providerAccess.allowedProviders.includes(provider.userId),
        };
    }

    changeProviderAccess = async (isAllowed) => {
        this.setState({
            hasAccess: isAllowed
        });
    };

    newConnectionSegmentEvents = async ()=>{
        const segmentPayload = {
            userId: this.props?.auth?.meta?.userId,
            providerId: this.state.providerInfo?.userId,
            connectedAt: moment.utc(Date.now()).format(),
            providerName : this.state.providerInfo?.name,
            providerRole : this.state.providerInfo?.designation
        };

        await Analytics.track(SEGMENT_EVENT.NEW_PROVIDER_CONNECTION, segmentPayload);

    }

    makeConnection = async (shouldAdd) => {
        if (shouldAdd) {
            this.props.connect({
                userId: this.state.providerInfo.userId,
                onSuccess: async ()=>{
                    const allowProviderAccess = {
                        providerId: this.state.providerInfo.userId,
                        allowed: this.state.hasAccess
                    };
                    this.props.updateProviderAccess(allowProviderAccess);
                    this.newConnectionSegmentEvents();
                    this.props.navigation.navigate(this.state.providerInfo.type ==="PRACTITIONER"?Screens.PROVIDER_DETAIL_SCREEN:Screens.MATCH_MAKER_DETAIL_SCREEN, {
                        provider: this.state.providerInfo,
                        patient: this.state.patientInfo,
                        referrer: Screens.PROVIDER_ACCESS_SCREEN,
                        providerChatOpen: false
                    });
                },
                onFailure: ()=>{
                    AlertUtil.showErrorMessage('Unable to connect at the moment. Please try again later');
                }
            });
        } else {
            const allowProviderAccess = {
                providerId: this.state.providerInfo.userId,
                allowed: this.state.hasAccess
            };
            this.props.updateProviderAccess(allowProviderAccess);
            this.props.navigation.navigate(this.state.providerInfo.type ==="PRACTITIONER"?Screens.PROVIDER_DETAIL_SCREEN:Screens.MATCH_MAKER_DETAIL_SCREEN, {
                provider: this.state.providerInfo,
                patient: this.state.patientInfo,
                referrer: Screens.PROVIDER_ACCESS_SCREEN,
                providerChatOpen: false
            });
        }

    };

    goBack = () => {
        this.props.navigation.goBack();
    };

    render = () => {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        const isConnected = this.props.connections.activeConnections.filter((connection) => {
            return connection.connectionId === this.state.providerInfo.userId;
        }).length > 0;

        const isRequested = this.props.connections.requestedConnections.filter((connection) => {
            return connection.connectionId === this.state.providerInfo.userId;
        }).length > 0;

        if (this.state.isLoading) {
            return (
                <AlfieLoader/>
            );
        }
        return (
            <Container style={styles.wrapper}>
                <StatusBar
                    backgroundColor={Platform.OS === 'ios'? null : "transparent"}
                    translucent
                    barStyle={'dark-content'}
                />
                <LinearGradient
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    colors={["#f7f9ff", "#fff", "#fff"]}
                    style={styles.headerBG}
                >
                    <View style={{paddingTop: isIphoneX() ? 20 : 5}}>
                        <Button
                            {...addTestID('Go-Back')}
                            transparent style={styles.backButton} onPress={this.goBack} text="GO BACK">
                            <AwesomeIcon name="angle-left" size={32} color="#3fb2fe"/>
                        </Button>
                    </View>
                    <Content style={styles.contentWrapper}>
                        <View style={styles.accessInfo}>
                            <Text style={styles.accessText}>Select Access Level</Text>
                            <Text style={styles.lightText}>You can change it later anytime</Text>
                        </View>


                        {this.state.providerInfo.profilePicture?
                            <Image style={styles.providerImg}
                                   resizeMode={"cover"}
                                   source={{uri: this.state.providerInfo.profilePicture ? (this.state.providerInfo.profilePicture.includes(S3_BUCKET_LINK)?this.state.providerInfo.profilePicture.replace('_thumbnail', ''):S3_BUCKET_LINK+this.state.providerInfo.profilePicture.replace('_thumbnail', '')) : (this.state.providerInfo.avatar ?this.state.providerInfo.avatar.includes(S3_BUCKET_LINK)?this.state.providerInfo.avatar:S3_BUCKET_LINK+this.state.providerInfo.avatar :S3_BUCKET_LINK + DEFAULT_IMAGE)}}
                                   alt="Icon"
                            />
                            :
                            <View style={{
                                ...styles.proBgMain,
                                backgroundColor: this.state.providerInfo.colorCode?this.state.providerInfo.colorCode:DEFAULT_AVATAR_COLOR
                            }}><Text
                                style={styles.proLetterMain}>{this.state.providerInfo.name.charAt(0).toUpperCase()}</Text></View>
                        }
                        <View style={styles.proInfo}>
                            <Text style={styles.boldText}>{this.state.providerInfo.name}</Text>
                            <Text style={styles.greyText}>
                                {this.state.providerInfo.designation ?
                                    this.state.providerInfo.designation : ""}
                            </Text>
                        </View>

                        <View style={styles.providerContent}>
                            <ListItem
                                {...addTestID('List-Item-Change-Provider-Access')}
                                style={this.state.hasAccess ? [styles.borderItem, {borderColor: '#3fb2fe'}] : styles.borderItem}
                                onPress={() => this.changeProviderAccess(true)}>
                                <View style={styles.radioText}>
                                    <Text style={styles.whiteText}>Full Access</Text>
                                    <Text style={styles.smallText}>{this.state.providerInfo.type === 'PRACTITIONER'?"Provider":"Matchmaker"} can see all your information to help you to
                                        reach your personal goals.</Text>
                                </View>
                                <Radio
                                    color={"#3fb2fe"}
                                    selectedColor={"#fff"}
                                    selected={this.state.hasAccess}
                                    style={this.state.hasAccess? styles.radioBtnSelected : styles.radioBtn}
                                    onPress={() => this.changeProviderAccess(true)}
                                />
                            </ListItem>
                            <View style={{height: 16}}></View>
                            <ListItem
                                style={!this.state.hasAccess ? [styles.borderItem, {borderColor: '#3fb2fe'}] : styles.borderItem}
                                onPress={() => this.changeProviderAccess(false)}>
                                <View style={styles.radioText}>
                                    <Text style={styles.whiteText}>No Access</Text>
                                    <Text style={styles.smallText}>{this.state.providerInfo.type === 'PRACTITIONER'?"Provider":"Your Matchmaker"} will only have access to your general
                                        information.</Text>
                                </View>
                                <Radio color={"#3fb2fe"}
                                       selectedColor={"#fff"}
                                       selected={!this.state.hasAccess}
                                       style={!this.state.hasAccess? styles.radioBtnSelected : styles.radioBtn}
                                       onPress={() => this.changeProviderAccess(false)}
                                />
                            </ListItem>
                        </View>
                    </Content>
                    <View style={styles.proInfoFooter}>
                        <GradientButton
                            testId = "connection"
                            style={styles.infoBtn}
                            disabled={isRequested}
                            onPress={() => {
                                this.makeConnection(!isConnected)
                            }}
                            text={isRequested?"CONNECTION REQUESTED":this.state.hasAccess ? "CONNECT WITH FULL ACCESS" : "SELECT NO ACCESS LEVEL"}
                        />
                    </View>
                </LinearGradient>
            </Container>
        );
    };
}

const commonText = {
    fontFamily: "Roboto-Regular",
    color: '#30344D'
};
const styles = StyleSheet.create({
    wrapper: {
        paddingTop: 23
    },
    headerBG: {
        flex: 1
    },
    backButton: {
        marginLeft: 22,
        width: 35,
        paddingLeft: 0
    },
    contentWrapper: {
        paddingTop: 10,
        paddingLeft: 24,
        paddingRight: 24
    },
    providerContent: {
        paddingTop: 20,
        marginBottom: 50
    },
    providerImg: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderColor: '#f7f9ff',
        borderWidth: 1,
        alignSelf: 'center',
        marginTop: 30
    },

    proBgMain:{

        width: 120,
        height: 120,
        borderRadius: 60,
        borderColor: '#f7f9ff',
        borderWidth: 1,
        alignSelf: 'center',
        marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    proLetterMain: {
        fontFamily: 'Roboto-Bold',
        color: '#fff',
        fontSize: 60,
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    accessInfo: {
        alignSelf: 'center'
    },
    accessText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        lineHeight: 36,
        letterSpacing: 1,
        color: '#25345c'
    },
    lightText: {
        color: '#646c73',
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'center'
    },
    proInfo: {
        alignItems: 'center',
        marginTop: 10
    },
    proInfoFooter: {
        paddingTop: 10,
        paddingBottom: isIphoneX() ? 40 : 20,
        paddingLeft: 24,
        paddingRight: 24,
    },
    ratingWrapper: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f5f5f5',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 24,
        paddingRight: 24,
        marginTop: 24,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    reviewScore: {
        color: '#737373',
        fontSize: 14,
        fontFamily: 'Roboto-Regular',
        lineHeight: 22,
        letterSpacing: 0.47,
        marginLeft: 15
    },
    reviewBtn: {
        alignSelf: 'flex-end'
    },
    reviewBtnText: {
        color: '#515d7d',
        fontSize: 13,
        fontFamily: 'Roboto-Regular',
        fontWeight: '500',
        lineHeight: 22,
        letterSpacing: 0.43
    },
    boldText: {
        ...commonText,
        fontSize: 16,
        lineHeight: 36,
        letterSpacing: 0.67
    },
    greyText: {
        ...commonText,
        fontSize: 11,
        lineHeight: 21,
        letterSpacing: 1,
        color: '#515d7d',
        textTransform: 'uppercase'
    },
    infoBtn: {
        alignSelf: 'center',
    },
    requestBtn: {
        ...Buttons.mediaButtons.startButtonBG,
        textAlign: "center",
        alignSelf: "center",
        backgroundColor: "#fff",
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#4FACFE',
    },
    requestText: {
        fontSize: 13,
        fontFamily: "Roboto-Regular",
        fontWeight: "600",
        textAlign: "center",
        width: "100%",
        color: "#4FACFE"
    },
    personalInfo: {
        paddingBottom: 15,
        paddingLeft: 30,
        paddingRight: 30,
        alignItems: 'center',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
    radioWrapper: {
        borderRadius: 4,
        overflow: 'hidden',
        paddingLeft: 1,
        paddingRight: 23,
        paddingTop: 3,
        paddingBottom: 3
    },
    headText: {
        ...commonText,
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 10,
        lineHeight: 28,
        letterSpacing: 0.88,
        marginTop: 24,
        alignSelf: 'flex-start'
    },
    parahText: {
        ...commonText,
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 20,
        textAlign: 'left',
        color: '#646c73'
    },
    loadersty: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    radioBtn: {
        width: 22,
        height: 21,
        borderWidth: 1,
        borderColor: '#ebebeb',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 4,
    },
    radioBtnSelected: {
        width: 22,
        height: 21,
        borderWidth: 1,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 4,
        backgroundColor: '#3fb2fe',
        borderColor: '#3fb2fe',
    },
    borderItem: {
        borderColor: '#f5f5f5',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderRadius: 8,
        marginLeft: 0,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 16,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        shadowColor: "#f5f5f5",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 0,
        backgroundColor: '#fff'
    },
    radioText: {
        paddingRight: 20,
        flex: 2
    },
    whiteText: {
        fontSize: 14,
        fontFamily: "Roboto-Regular",
        fontWeight: "600",
        textAlign: 'left',
        letterSpacing: 0.47,
        color: '#515d7d',
        marginBottom: 5,
    },
    smallText: {
        fontFamily: "Roboto-Regular",
        lineHeight: 19,
        fontSize: 13,
        color: '#646c73',
        flex: 1
    },
});

export default connectConnections()(ProviderAccessScreen);
