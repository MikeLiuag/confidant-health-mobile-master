import React, {Component} from 'react';
import {AppState, FlatList, Image, StatusBar, StyleSheet, View} from 'react-native';
import {Button, Container, Content, Header, Left, Right, Text} from 'native-base';
import {
    addTestID,
    Colors,
    CommonStyles,
    getHeaderHeight,
    isIphoneX,
    PrimaryButton,
    TextStyles,
    TransactionSingleActionItem,
    valueExists
} from 'ch-mobile-shared';
import {S3_BUCKET_LINK} from "../../constants/CommonConstants";
import LinearGradient from "react-native-linear-gradient";
import LottieView from 'lottie-react-native';
import alfie from '../../assets/animations/alfie-face-new';
import {Screens} from '../../constants/Screens';
import {RenderTextChipComponent} from "ch-mobile-shared/src/components/RenderTextChipComponent";
import FeatherIcons from "react-native-vector-icons/Feather";
import Modal from "react-native-modalbox";
import {BackButton} from "ch-mobile-shared/src/components/BackButton";
import {connectConnections} from "../../redux";
import ConversationService from "../../services/Conversation.service";
import {AlertUtil} from "ch-mobile-shared/src/utilities";
import Loader from "ch-mobile-shared/src/components/Loader";
import DeepLinksService from "../../services/DeepLinksService";


const HEADER_SIZE = getHeaderHeight();
class ChatbotProfileScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.contact = navigation.getParam('contact', null);
        this.refScreen = navigation.getParam('refScreen', null);
        this.state = {
            appState: AppState.currentState,
            chatToOpen: null,
            isLoading: false,
            openFilterModal : false
        };
    }

    componentDidMount(): void {
        AppState.addEventListener('change', this._handleAppState);
    }

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
        if (this.state.chatToOpen !== null && this.state.isLoading) {
            this.startChatbot(null, this.state.chatToOpen);
        }
    }

    assignConversation = async (selectedChatbot) => {
        const id = selectedChatbot.id ? selectedChatbot.id : selectedChatbot.connectionId;
        try {
            if (selectedChatbot.assigned || this.props.connections.activeConnections.some(connection => connection.connectionId === id)) {
                const connection = this.props.connections.activeConnections.find(connection => connection.connectionId === id)
                const organizationId = selectedChatbot.organizationId ? selectedChatbot.organizationId : connection.connectionId;
                this.startChatbot(organizationId, null)
            } else {
                this.setState({isLoading: true})
                let response = await ConversationService.selfAssignConversation(
                    id,
                    selectedChatbot.organizationId,
                );
                if (response.errors) {
                    AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                    this.setState({isLoading: false})
                } else {
                    this.props.refreshConnections();
                    this.setState({chatToOpen: selectedChatbot.name})
                }
            }

        } catch (error) {
            AlertUtil.showErrorMessage(this.ERROR_SERVICES_UNREACHABLE);
        }
    };

    startChatbot = (organizationId, name) => {
        const connection = this.props.connections.activeConnections.find(connection => {
            if (organizationId) {
                return connection.connectionId === organizationId;
            } else {
                return connection.name === name;
            }
        })
        if (connection) {
            this.props.navigation.replace(Screens.CHAT_INSTANCE, {contact: connection});
            this.setState({chatToOpen: null, isLoading: false, openFilterModal : false})
        }
    }

    componentWillUnmount(): void {
        AppState.removeEventListener('change', this._handleAppState);
    }

    _handleAppState = () => {
        if (this.state.appState === 'active') {
            if (this.animation) {
                this.animation.play();
            }
        }
    };

    navigateBack = () => {
        this.props.navigation.goBack();
    }

    renderBenefits = (item) => {

        return (
            <View style={styles.benefitWrapper}>
                <Image
                    style={styles.noSlotImg}
                    resizeMode="contain"
                    source={require('../../assets/images/Path-red.png')}/>
                <Text style={styles.benefitText}>{item}</Text>
            </View>
        )

    }

    restartChatbotAndNavigate = (contact) => {
        this.props.restartChatbot(contact.connectionId);
        this.navigateBack();

    }

    filterDrawerClose = () => {
        this.setState({openFilterModal: false});
    }

    shareChatbot = async (contact) => {
        const chatbotProfile = this.props.connections.chatbotList.find(chatbot => chatbot.organizationId === contact.organizationId);
        this.filterDrawerClose();
        await DeepLinksService.shareChatbot('facebook', chatbotProfile);
    };

    render() {
        if (this.state.isLoading) {
            return (<Loader/>);
        }
        const contact = this.contact;
        let avatar = null;
        if (valueExists(contact.avatar)) {
            avatar = contact.avatar;
        } else if (valueExists(contact.profilePicture)) {
            avatar = contact.profilePicture;
        }

        StatusBar.setBarStyle('dark-content', true);

        const isConfidantHealthBot = contact.name === "Confidant ChatBot";
        const chatbotName = isConfidantHealthBot ? "Confidant health chatbot" : contact.name;

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
                            <View style={styles.backButton}>
                                <BackButton
                                    {...addTestID('back')}
                                    onPress={() => {
                                        this.navigateBack()
                                    }}
                                />
                            </View>
                        </Left>
                        <Right>
                            {!isConfidantHealthBot &&
                            <Button transparent
                                    style={{alignItems: 'flex-end', paddingRight: 7, marginRight: 8}}
                                    onPress={() => {
                                        this.setState({openFilterModal: true})
                                    }}
                            >
                                <FeatherIcons size={30} color={Colors.colors.mainBlue} name="more-horizontal"/>
                            </Button>
                            }
                        </Right>
                    </Header>
                    <Content>
                        <View style={styles.headSection}>
                            {isConfidantHealthBot ?
                                <View style={styles.alfieWrapper}>
                                    <LottieView
                                        ref={animation => {
                                            this.animation = animation;
                                        }}
                                        style={styles.alfie}
                                        resizeMode="cover"
                                        source={alfie}
                                        autoPlay={true}
                                        loop
                                    />
                                </View>
                                :
                                <View style={styles.chatbotInfoBox}>
                                    <View>
                                        {avatar ?
                                            <Image
                                                style={styles.proImage}
                                                resizeMode="cover"
                                                onError={(err) => {
                                                    console.log("Error")
                                                    console.log({err})
                                                }}
                                                source={{uri: S3_BUCKET_LINK + avatar}}/>
                                            :
                                            <Image
                                                style={styles.proImage}
                                                resizeMode="cover"
                                                source={require('../../assets/images/elfie-avatar.png')}/>
                                        }

                                    </View>
                                    <View>
                                        {valueExists(contact.name) &&
                                        <Text style={styles.mainHeading}>{contact.name}</Text>}
                                        {isConfidantHealthBot && <Text style={styles.mainHeading}>{chatbotName}</Text>}
                                        {/*<Text style={styles.mainSubHeading}>Weekly chatbot</Text>*/}
                                    </View>

                                    {/* <Image style={styles.chatbotImg} source={{ uri: contact.profilePicture ? S3_BUCKET_LINK + contact.profilePicture : CHATBOT_DEFAULT_AVATAR}} /> */}
                                </View>
                            }
                            <View>

                                {contact.tags && <RenderTextChipComponent renderList={contact.tags}/>}

                            </View>

                            {/* {isConfidantHealthBot && (<Text style={styles.alfieName}>Alfie</Text>)} */}
                            {/* <Text style={styles.alfieDes}>{chatbotName}</Text> */}
                        </View>
                        <View style={styles.bodySection}>
                            {isConfidantHealthBot ?
                                <View>
                                    <Text style={styles.heading}>MEET ALFIE</Text>
                                    <Text style={styles.desText}>Alfie is not just a cute dog that you will see
                                        throughout the app – he is an intelligent chatbot to guide you through your
                                        experience on Confidant. He was created by the Confidant team – a passionate
                                        group of technologists, epidemiologists, health economists, behavior health
                                        providers, patient advocates, people using drugs, and family members</Text>
                                    <Text style={styles.desText}>When we developed Alfie, we started by asked three
                                        simple questions:</Text>
                                    <View style={styles.listUL}>
                                        <Text style={{...styles.desText, marginBottom: 8}}>1. Why is addiction treatment
                                            so expensive?</Text>
                                        <Text style={{...styles.desText, marginBottom: 8}}>2. Why is most addiction
                                            treatment not effective?</Text>
                                        <Text style={{...styles.desText, marginBottom: 16}}>3. Why has no one fixed
                                            this?</Text>
                                    </View>
                                    <Text style={styles.desText}>
                                        We discussed these questions with dozens of experts, reviewed hundreds of
                                        scientific studies, and tested many different prototypes. With this information,
                                        we developed Alfie, based on the best-available scientific understanding of drug
                                        use and behavioral health.
                                    </Text>
                                    <Text style={styles.desText}>
                                        Alfie’s job is to give those seeking treatment for substance abuse an
                                        individualized experience. He is developed to provide personalized treatment
                                        plans at cost effective prices and ask questions that led to quality
                                        recommendations.
                                    </Text>
                                    <Text style={styles.desText}>
                                        When you chat with Alfie each day, he will share materials, provide activities,
                                        and recommend doctors and therapists – all leading you on the best path forward.
                                    </Text>
                                </View>
                                :
                                <View>
                                    {contact.description && (
                                        <View>
                                            <Text style={styles.heading}>About chatbot</Text>
                                            <Text style={styles.desText}>{contact.description}</Text>
                                        </View>
                                    )}
                                </View>
                            }


                            {contact.whoCanBenefit &&
                            <View style={styles.benefitWrapperMain}>
                                <Text style={styles.heading}>Who can benefit</Text>
                                <FlatList
                                    showsVerticalScrollIndicator={false}
                                    data={contact.whoCanBenefit}
                                    renderItem={({item, index}) => (
                                        <View
                                            style={styles.singleCard}
                                            activeOpacity={0.8}
                                        >
                                            {this.renderBenefits(item)}
                                        </View>

                                    )}
                                    keyExtractor={(item, index) => index.toString()}
                                />
                            </View>
                            }
                        </View>

                    </Content>
                    {!isConfidantHealthBot &&
                    <View style={styles.greBtn}>
                        {contact.connectionId && contact.progress?.completed === true
                            ?
                            <PrimaryButton
                                testId="schedule"
                                iconName='message-circle'
                                type={'Feather'}
                                color={Colors.colors.whiteColor}
                                onPress={() => {
                                    this.restartChatbotAndNavigate(contact);
                                }}
                                text="Restart chatbot"
                                size={24}
                            />
                            :
                            <PrimaryButton
                                testId="schedule"
                                iconName='message-circle'
                                type={'Feather'}
                                color={Colors.colors.whiteColor}
                                onPress={() => {
                                    this.assignConversation(contact);
                                }}
                                text={"Start chatbot"}
                                size={24}
                            />
                        }
                    </View>
                    }
                </LinearGradient>
                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.filterDrawerClose}
                    isOpen={this.state.openFilterModal}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        maxHeight: 250,
                        // bottom: this.state.modalHeightProps.height
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalContact"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content showsVerticalScrollIndicator={false}>
                        <View style={styles.singleOption}>
                            {contact.connectionId && contact.progress?.completed === true
                                ?
                                <TransactionSingleActionItem
                                    title={'Restart chatbot'}
                                    iconBackground={Colors.colors.white}
                                    styles={styles.gButton}
                                    renderIcon={(size, color) =>
                                        <FeatherIcons size={22} color={Colors.colors.primaryIcon}
                                                      name="message-circle"/>
                                    }
                                    onPress={() => {
                                        this.restartChatbotAndNavigate(contact);
                                    }}
                                />
                                :
                                <TransactionSingleActionItem
                                    title={'Start chatbot'}
                                    iconBackground={Colors.colors.white}
                                    styles={styles.gButton}
                                    renderIcon={(size, color) =>
                                        <FeatherIcons size={22} color={Colors.colors.primaryIcon}
                                                      name="message-circle"/>
                                    }
                                    onPress={() => {
                                        this.assignConversation(contact);
                                    }}
                                />
                            }

                        </View>
                        <View style={styles.singleOption}>
                            <TransactionSingleActionItem
                                title={'Share chatbot'}
                                iconBackground={Colors.colors.white}
                                styles={styles.gButton}
                                renderIcon={(size, color) =>
                                    <FeatherIcons size={22} color={Colors.colors.secondaryIcon} name="upload"/>
                                }
                                onPress={() => {
                                    this.shareChatbot(contact);
                                }}
                            />
                        </View>
                    </Content>
                </Modal>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    mainHeading: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.bodyTextL,
        color: Colors.colors.highContrast,
        width: 250,
        paddingLeft: 12
    },
    mainSubHeading: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextL,
        color: Colors.colors.highContrast,
    },
    benefitText: {
        paddingLeft: 10,
        ...TextStyles.mediaTexts.manropeLight,
        ...TextStyles.mediaTexts.linkTextM,
        color: Colors.colors.highContrast,
    },
    benefitWrapper: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingBottom: 16
    },
    benefitWrapperMain: {
        // paddingTop:20
    },
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
    alfieWrapper: {
        width: 120,
        height: 120,
        // justifyContent: 'Left',
        // alignItems: 'center',
        // borderColor: 'rgba(0,0,0, 0.15)',
        borderRadius: 80,
        elevation: 0,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 25,
        shadowOpacity: 1.0,
        shadowColor: 'rgba(0,0,0, 0.09)',
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    alfie: {
        width: 120,
        height: 120,
    },
    alfieName: {
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        lineHeight: 25,
        letterSpacing: 1,
        color: '#25345c',
        textAlign: 'center',
        // textTransform: 'uppercase',
        marginBottom: 16
    },
    alfieDes: {
        fontFamily: 'Roboto-Regular',
        fontSize: 12,
        lineHeight: 13,
        letterSpacing: 1,
        color: '#515D7D',
        // textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 40
    },
    headSection: {
        paddingLeft: 24,
        paddingRight: 24,
        // borderBottomColor: '#f5f5f5',
        // borderBottomWidth: 1,
        // alignItems: 'center',
        paddingTop: 30
    },
    bodySection: {
        paddingLeft: 24,
        paddingRight: 24,
    },
    heading: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.bodyTextL,
        color: Colors.colors.highContrast,
        marginTop: 32,
        marginBottom: 16
    },
    desText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 22,
        color: '#646C73',
        marginBottom: 16
    },
    listUL: {
        paddingLeft: 20
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24
    },
    chatbotInfoBox: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    chatbotImg: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 25,
        backgroundColor: 'rgba(63,178,254,0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    proBg: {
        overflow: 'hidden',
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 25,
        backgroundColor: 'rgba(63,178,254,0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    proLetter: {
        fontFamily: 'Roboto-Bold',
        color: '#fff',
        fontSize: 35,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    proImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
    },
    singleOption: {
        marginBottom: 16
    },
});

export default connectConnections()(ChatbotProfileScreen);
