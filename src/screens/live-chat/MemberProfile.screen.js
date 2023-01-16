import React, {Component} from 'react';
import {StatusBar, StyleSheet, View, Image} from 'react-native';
import {Button, Left, Body, Right, Container, Content, Header, Text} from 'native-base';
import {addTestID, getAvatar, isIphoneX, getHeaderHeight, isIphone12 } from 'ch-mobile-shared';
import GradientButton from '../../components/GradientButton';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from "react-native-linear-gradient";
import Ionicon from "react-native-vector-icons/Ionicons";
import Overlay from "react-native-modal-overlay";
import moment from 'moment-timezone';
import {Screens} from '../../constants/Screens';
import {connectConnections} from "../../redux";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import GenericActionButton from 'ch-mobile-shared/src/components/GenericActionButton';
import Analytics from "@segment/analytics-react-native";

const HEADER_SIZE = getHeaderHeight();

class MemberProfileScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.member = {
            name: navigation.getParam('name', null),
            userId: navigation.getParam('userId', null),
            profilePicture: navigation.getParam('profilePicture', null),
            lastModified: navigation.getParam('lastModified', null),
        };
        this.isConnected = navigation.getParam('isConnected', false);
        this.state = {
            modalVisible: false,
            confirmModal: false
        };
    }

    componentDidMount() {
        Analytics.screen(
            'Member Profile Screen'
        );
    }

    navigateBack() {
        this.props.navigation.goBack();
    }

    disconnectUser = async () => {
        this.onClose();
        this.props.disconnect({
            userId: this.member.userId,
        });
        this.props.navigation.navigate(Screens.TAB_VIEW);
    };

    onClose = () => {
        this.setState({modalVisible: false});
    };

    showOptions = () => {
        this.setState({
            modalVisible: true,
        });
    };

    showConfirm = () => {
        this.setState({
            modalVisible: false,
            confirmModal: true,
        });
    };

    closeConfirm = () => {
        this.setState({
            confirmModal: false,
        });
    };

    gotoChat = () => {
        this.onClose();
        this.props.navigation.navigate(Screens.LIVE_CHAT_WINDOW_SCREEN, {
            connection: {
                ...this.member,
                connectionId: this.member.userId,
                type: 'PATIENT'

            }
        });
    };


    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={['#fff', '#fff', '#f7f9ff']}
                    style={{flex: 1}}
                >
                    <Header transparent style={styles.header}>
                        <StatusBar
                            backgroundColor="transparent"
                            barStyle="dark-content"
                            translucent
                        />
                        <Left>
                            <Button
                                {...addTestID('Navigate-Back')}
                                onPress={() => this.navigateBack()}
                                transparent
                                style={styles.backButton}>
                                <Icon name="angle-left" size={32} color="#3fb2fe"/>
                            </Button>
                        </Left>
                        <Body/>
                        <Right>
                            {this.isConnected ? (
                                <Button
                                    {...addTestID('Show-Options')}
                                    transparent style={{marginRight: 0, paddingRight: 12}}
                                    onPress={() => {
                                        this.showOptions();
                                    }}
                                >
                                    <Ionicon name='ios-more' size={30}
                                             color={'#4FACFE'}/>
                                </Button>
                            ) : null}

                        </Right>
                    </Header>

                    <Overlay
                        containerStyle={styles.overlayBG}
                        childrenWrapperStyle={styles.fabWrapper}
                        visible={this.state.modalVisible} onClose={this.onClose} closeOnTouchOutside>

                        <View style={{width: '100%'}}>
                            <View style={styles.actionHead}>
                                <Text style={styles.actionTitle}>Actions</Text>
                                <Button
                                    {...addTestID('On-Close')}
                                    transparent
                                    onPress={() => {
                                        this.onClose();
                                    }}
                                >
                                    <Ionicon name='md-close' size={30}
                                             color="#4FACFE"/>
                                </Button>
                            </View>
                            <View>
                                <View style={{width: '100%'}}>
                                    {/*<GradientButton text="Sponsor Sessions" />*/}
                                    <GenericActionButton
                                        onPress={this.gotoChat}
                                        title={'Go to chat'}
                                        iconBackground={'#77C70B'}
                                        styles={styles.gButton}
                                        renderIcon={(size, color) =>
                                            <MaterialIcons
                                                name='chat-bubble-outline'
                                                size={18}
                                                color={color}
                                            />
                                        }
                                    />
                                    <GenericActionButton
                                        onPress={this.showConfirm}
                                        title={'Disconnect'}
                                        iconBackground={'#E13C68'}
                                        styles={styles.gButton}
                                        renderIcon={(size) =>
                                            <Image
                                                source={require('./../../assets/images/link-off.png')}
                                                style={{width: size, height: size}}
                                            />
                                        }
                                    />
                                </View>
                            </View>
                        </View>

                    </Overlay>

                    <Overlay
                        containerStyle={styles.confirmOverlay}
                        childrenWrapperStyle={styles.confirmWrapper}
                        visible={this.state.confirmModal}>
                        <View style={{width: '100%'}}>
                            <Text style={styles.confirmHeader}>
                                Are you sure you want to disconnect?
                            </Text>
                            <View style={styles.confirmBtns}>
                                <Button
                                    {...addTestID('Disconnect-user')}
                                    style={{...styles.outlineBtn, flex: 1, marginTop: 10}}
                                    onPress={this.disconnectUser}
                                >
                                    <Text style={styles.outlineText}>Yes, Disconnect</Text>
                                </Button>
                                <View style={styles.noBtn}>
                                    <GradientButton
                                        testId="no"
                                        onPress={this.closeConfirm}
                                        text="No"
                                    />
                                </View>
                            </View>
                        </View>

                    </Overlay>

                    <Content>
                        <View style={styles.headSection}>
                            <Image
                                style={styles.memberImg}
                                source={{uri: getAvatar(this.member)}}/>
                            <Text style={styles.alfieName}>{this.member.name}</Text>
                            <Text style={styles.alfieDes}>{this.isConnected ? 'Connected' : 'Disconnected'} Since: {
                                moment(this.member.lastModified).format('MMM, Y',)
                            }</Text>
                        </View>
                        <View style={styles.bodySection}>
                            <Text style={styles.heading}>How you can help:</Text>
                            <Text style={styles.desText}>There are many ways to help members in the Confidant system.
                                We’ve complied a list of helpful tips to maximize your experience and the experience of
                                the Member you’re supporting.</Text>
                            <Text style={styles.heading}>Educate yourself:</Text>
                            <Text style={styles.desText}>
                                We believe that one of the most effective ways to help others is to educate yourself. By
                                understanding the science behind substance abuse, your change in perspective can have a
                                significant impact on your relationships.
                            </Text>
                            <Text style={styles.heading}>Help yourself:</Text>
                            <Text style={styles.desText}>
                                We also believe that speaking with our expert team can help you make significant change
                                in how you approach your loved one. Confidant is designed to help everyone – even if you
                                are not using drugs yourself. Having conversations about your anxieties, fears, past
                                trauma, or anything that is on your mind, not only helps yourself, but also improve your
                                interactions with others.
                            </Text>
                            <Text style={styles.heading}>Communicate with them:</Text>
                            <Text style={styles.desText}>
                                The greatest predictor of success is time spent in treatment, and every minute spent
                                using the Confidant application is treatment. Using Confidant to communicate with
                                someone is not only shows your encouragement and support, but also reminds them to
                                continue to use the application. Additionally, you can both feel assured knowing that
                                everything you say is secure and encrypted inside our HIPAA compliant text platform.
                            </Text>
                            <Text style={styles.heading}>Sponsor their sessions:</Text>
                            <Text style={styles.desText}>
                                A powerful way to help support other members is to sponsor their sessions. You can
                                provide financial funding to someone in a way that can only be used toward treatment. We
                                understand that this option might not be for everyone. When you click “Sponsor Sessions”
                                below, you’ll be able to add credits to their account, so they can have Tele-health
                                sessions with our providers at discounted rates - it’s a win for everyone.
                            </Text>
                        </View>
                        {this.isConnected && (
                            <View style={styles.btnBox}>
                                {/*<GradientButton*/}
                                {/*    onPress={() => this.navigateBack()}*/}
                                {/*    text="Sponsor Sessions"*/}
                                {/*/>*/}
                                <GenericActionButton
                                    onPress={this.gotoChat}
                                    title={'Go to chat'}
                                    iconBackground={'#77C70B'}
                                    viewStyle={styles.genericActionButton}
                                    renderIcon={(size, color) =>
                                        <MaterialIcons
                                            name='chat-bubble-outline'
                                            size={18}
                                            color={color}
                                        />
                                    }
                                />
                                <GenericActionButton
                                    onPress={this.showConfirm}
                                    title={'Disconnect'}
                                    iconBackground={'#E13C68'}
                                    viewStyle={styles.genericActionButton}
                                    renderIcon={(size) =>
                                        <Image
                                            source={require('./../../assets/images/link-off.png')}
                                            style={{width: size, height: size}}
                                        />
                                    }
                                />
                            </View>
                        )}

                    </Content>

                </LinearGradient>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingLeft: 3,
        borderBottomColor: '#fff',
        elevation: 0,
        justifyContent: 'flex-start',
        height: HEADER_SIZE,
    },
    backButton: {
        marginLeft: 15,
        width: 35
    },
    actionHead: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: HEADER_SIZE + (isIphoneX() ? (isIphone12()? 0 : 24 ) : 0),
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        paddingLeft: 20,
        paddingRight: 24,
        paddingBottom: 5,
    },
    actionTitle: {
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        fontSize: 18,
        letterSpacing: 0.3,
        flex: 2,
        paddingBottom: 10,
        textAlign: 'center',
    },
    overlayBG: {
        backgroundColor: 'rgba(37,52,92,0.35)'
    },
    fabWrapper: {
        height: 'auto',
        padding: 0,
        alignSelf: 'center',
        position: 'absolute',
        // top: Platform.OS === 'ios'? isIphoneX()? 112 : 80 : 55,
        top: 0,
        left: 0,
        right: 0,
        borderColor: 'rgba(37,52,92,0.1)',
        borderTopWidth: 0.5,
        elevation: 1,
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 8,
        shadowOpacity: 0.5,
        shadowColor: 'rgba(37,52,92,0.1)',
        zIndex: 0,
    },

    memberImg: {
        width: 160,
        height: 160,
        borderRadius: 80,
        marginBottom: 24
    },
    alfieName: {
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        lineHeight: 25,
        letterSpacing: 1,
        color: '#25345c',
        textAlign: 'center',
        marginBottom: 16
    },
    alfieDes: {
        fontFamily: 'Roboto-Regular',
        fontSize: 12,
        lineHeight: 13,
        letterSpacing: 1,
        color: '#515D7D',
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 40
    },
    headSection: {
        paddingLeft: 24,
        paddingRight: 24,
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1,
        alignItems: 'center'
    },
    bodySection: {
        paddingLeft: 24,
        paddingRight: 24,
    },
    heading: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        fontSize: 12,
        lineHeight: 14,
        letterSpacing: 0.75,
        color: '#515D7D',
        textTransform: 'uppercase',
        marginTop: 40,
        marginBottom: 16
    },
    desText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 22,
        color: '#646C73',
    },
    listUL: {
        paddingLeft: 20
    },
    btnBox: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24
    },

    outline: {
        borderColor: '#EBEBEB',
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: '#fff',
        height: 48,
        justifyContent: 'center',
        elevation: 0,
        marginTop: 16
    },
    outlineBtn: {
        borderColor: '#f78795',
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: '#fff',
        height: 48,
        justifyContent: 'center',
        elevation: 0,
        marginTop: 16
    },
    outlineText: {
        color: '#f78795',
        fontSize: 13,
        letterSpacing: 0.7,
        lineHeight: 19.5,
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    confirmWrapper: {
        height: 'auto',
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 40 : 25,
        paddingTop: 36,
        alignSelf: 'center',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        elevation: 3,
        shadowOffset: {width: 0, height: 10},
        shadowColor: '#f5f5f5',
        shadowOpacity: 0.5,
    },
    confirmOverlay: {
        backgroundColor: 'rgba(37,52,92,0.5)',
    },
    confirmHeader: {
        color: '#25345c',
        fontSize: 20,
        lineHeight: 30,
        letterSpacing: 0.4,
        fontFamily: 'Roboto-Regular',
        textAlign: 'center',
        marginBottom: 30,
        paddingLeft: 18,
        paddingRight: 18,
    },
    confirmBtns: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    noBtn: {
        flex: 1,
        marginLeft: 17,
        justifyContent: 'center',
    },
    genericActionButton: {
        borderColor: '#EBEBEB',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
    }
});
export default connectConnections()(MemberProfileScreen);
