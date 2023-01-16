import React, {Component} from 'react';
import {Platform, Share, StatusBar, StyleSheet} from 'react-native';
import {Body, Button, Container, Content, Header, Left, Right, Text, View} from 'native-base';
import {
    addTestID,
    AlertUtil,
    Colors,
    CommonStyles,
    getHeaderHeight, isIphoneX,
    PrimaryButton,
    SecondaryButton,
    TextStyles,
    VideoPlayer
} from 'ch-mobile-shared';
import Loader from "../../components/Loader";
import {ContentfulClient} from "ch-mobile-shared/src/lib";
import {BackButton} from "ch-mobile-shared/src/components/BackButton";
import Icon from "react-native-vector-icons/Feather";
import Modal from "react-native-modalbox";
import {Screens} from "../../constants/Screens";
import ConversationService from "../../services/Conversation.service";
import LottieView from "lottie-react-native";
import alfie from "../../assets/animations/Dog_Calendar";
import DeepLinksService from "../../services/DeepLinksService";
import {REVAMP_DESCRIPTION_TYPE, REVAMP_ON_BOARDING_TYPES} from "../../constants/CommonConstants";
import {connectRevamp} from "../../redux";
import Analytics from "@segment/analytics-react-native";

const HEADER_SIZE = getHeaderHeight();

class RevampTypeHomeScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.revampTypeData = navigation.getParam('revampTypeData', null);
        this.player = null;
        this.componentReference = null;
        this.state = {
            isLoading: true,
            data: null,
            revampType: null
        }
    }

    componentDidMount = async () => {
        Analytics.screen(
          this.revampTypeData.name + ' Section - Explanation Screen'
        );
        await this.getRevampTypeContent();
        await this.getRevampType();
    };

    getRevampTypeContent = async () => {
        try {
            let query = {
                'content_type': 'revampTypes',
                'sys.id': this.revampTypeData.contentfulEntryId
            };
            const response = await ContentfulClient.getEntries(query);
            if (response.errors) {
                console.log(provider.errors[0].endUserMessage);
                AlertUtil.showErrorMessage('Type not available.');
                this.setState({isLoading: false});
            } else {
                let revampType;
                if (response.items?.length > 0 && response.items[0] && response.items[0].fields) {
                    revampType = {
                        name: response.items[0].fields.name,
                        description: response.items[0].fields.description.content.map(paragraph => paragraph.content[0].value).join('\n\n'),
                        poster: response.items[0].fields.poster.fields.file.url,
                        video: response.items[0].fields.video.fields.file.url,
                        quote: response.items[0].fields.quote.content.map(paragraph => paragraph.content[0].value).join('\n\n'),
                        quoteAuthor: response.items[0].fields.quoteAuthor,
                        detailDescription: response.items[0].fields.detailDescription.content.map(paragraph => paragraph.content[0].value).join('\n\n'),
                        tokenText: response.items[0].fields.tokenText,
                        tokenSubText: response.items[0].fields.tokenSubText,
                    };
                    this.setState({data: revampType});
                } else {
                    this.setState({data: null});
                }
            }
        } catch (e) {
            console.log(e);
            this.setState({isLoading: false});
        }
    };

    getRevampType = async () => {
        try {
            const response = await ConversationService.getRevampType(this.revampTypeData.id);
            if (response.errors) {
                console.log(response.errors[0].endUserMessage);
                AlertUtil.showErrorMessage('Type not available');
                this.setState({isLoading: false});
            } else {
                this.setState({revampType: response});
                if (this.props.revamp.revampOnBoardingContext && this.props.revamp.revampOnBoardingContext.marker !== '') {
                  this.navigateToQuestions();
                    this.setState({isLoading: false});
                }else {
                    this.setState({isLoading: false});
                }
            }
        } catch (e) {
            console.log(e);
            this.setState({isLoading: false});
        }
    };


    navigateToQuestions = () => {
        if (this.player){
            this.player.pause()
        }
        if (this.revampTypeData.name === REVAMP_ON_BOARDING_TYPES.PLAN.key) {
            this.props.navigation.navigate(Screens.REVAMP_PLAN_ONBOARDING, {
                revampTypeData: this.revampTypeData,
                contentfulData : this.state.data
            })
        } else {
            this.props.navigation.navigate(Screens.REVAMP_QUESTIONS_SCREEN, {
                revampTypeData: this.revampTypeData,
                contentfulData : this.state.data
            })
        }
    };

    shareQuote = async (channel) => {
        await DeepLinksService.shareQuote(channel, this.state.data.quote.trim(), this.state.data.quoteAuthor.trim())
        /*try {
            const content = {
                title: 'Share Quote and Quote Author',
                message:
                    'Quote Author:  ' + this.state.data.quoteAuthor.trim() + '\nQuote: ' + this.state.data.quote,
            }
            const options = {
                dialogTitle: "Share Quote"
            }
            await Share.share(content, options);
        } catch (error) {
            alert(error.message);
        }
        */


    };

    backClicked = () => {
        this.player.pause();
        this.props.navigation.goBack();
    };

    pauseMedia = (player) => {
        setTimeout(() => {
            if (player) {
                player.pause();
            }
        }, 0);
    };

    getEmptyMessage = () => {
        let emptyStateHead = 'No Data Available';
        let emptyStateMsg = 'Data not available. If you don’t think this is right, Please feel free to contact us.';

        return (
            <View style={styles.emptyView}>
                <LottieView
                    ref={animation => {
                        this.animation = animation;
                    }}
                    style={styles.emptyAnim}
                    resizeMode="cover"
                    source={alfie}
                    autoPlay={true}
                    loop/>
                <Text style={styles.emptyTextMain}>{emptyStateHead}</Text>
                <Text style={styles.emptyTextDes}>{emptyStateMsg}</Text>
            </View>
        );
    };

    render() {
        StatusBar.setBarStyle('dark-content', true);
        if (this.state.isLoading) {
            return <Loader/>
        }
        const {data} = this.state;

        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <Header noShadow={false} transparent style={styles.header}>
                    <StatusBar
                        backgroundColor={Platform.OS === "ios" ? null : "transparent"}
                        translucent
                        barStyle={"dark-content"}
                    />
                    <Left style={{flex: 1}}>
                        <View style={styles.backButton}>
                            <BackButton
                                {...addTestID('back')}
                                onPress={this.backClicked}
                            />
                        </View>
                    </Left>
                    <Body style={styles.headerRow}>
                    </Body>
                    <Right style={{flex: 1}}>
                        <Button transparent
                                style={{alignItems: 'flex-end', paddingRight: 7, marginRight: 8}}
                                onPress={() => {
                                    this.refs?.modalContact?.open()
                                }}
                        >
                            <Icon name="info" size={24} color={Colors.colors.primaryIcon}/>
                        </Button>
                    </Right>
                </Header>
                {data ?
                    <View style={{flex: 1}}>
                        <Content showsVerticalScrollIndicator={false}>
                            <View style={styles.mainContentWrapper}>
                                <View style={{marginBottom: 16}}>
                                    <Text style={styles.mainHeading}>{this.revampTypeData.name}</Text>
                                    <Text style={styles.subHeading}>{data.description}</Text>
                                </View>
                                <View style={{marginBottom: 24, borderRadius: 24, overflow: 'hidden'}}>
                                    <VideoPlayer
                                        {...addTestID('Video-Player')}
                                        ref={(ref) => {
                                            this.player = ref;
                                        }}
                                        thumbnail={{uri: 'https:' + data.poster}}
                                        endThumbnail={{uri: 'https:' + data.poster}}
                                        endWithThumbnail
                                        video={{uri: 'https:' + data.video}}
                                        disableControlsAutoHide
                                        onPlayPress={this.pauseMedia}
                                        onStart={this.pauseMedia}
                                        pauseOnPress
                                        disableFullscreen={true}
                                        resizeMode='cover'
                                        style={styles.mainVideoImage}
                                        customStyles={gradientPlayer}
                                        playArrowSize={41}
                                        isGradientP={false}
                                        refScreen={"revamp"}

                                    />
                                </View>
                                <View style={{marginBottom: 24}}>
                                    <Text style={styles.authorQuote}>{data.quote}</Text>
                                    <Text style={styles.authorName}>{data.quoteAuthor}</Text>
                                </View>

                            </View>
                        </Content>
                        <View style={styles.greBtns}>
                            <SecondaryButton
                                color={Colors.colors.mainBlue}
                                text="Share quote"
                                size={24}
                                iconLeft='upload'
                                type={'Feather'}
                                borderColor='transparent'
                                onPress={() => {
                                    this.shareQuote('facebook');
                                }}
                            />
                            <PrimaryButton
                                type={'Feather'}
                                color={Colors.colors.whiteColor}
                                onPress={() => {
                                    this.navigateToQuestions();
                                }}
                                text="Continue"
                                size={24}
                            />
                        </View>
                    </View>
                    :
                    this.getEmptyMessage()
                }
                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.filterDrawerClose}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        maxHeight: '70%'
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalContact"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content showsVerticalScrollIndicator={false}>
                        {data && this.revampTypeData && (
                            <View style={{marginVertical: 24}}>
                                <Text style={styles.modalMainHeading}>About {this.revampTypeData.name}</Text>
                                <Text style={styles.modalSubHeading}>{data.detailDescription}</Text>
                            </View>
                        )}
                    </Content>
                </Modal>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingLeft: 0,
        paddingRight: 0,
        height: HEADER_SIZE,
        // ...CommonStyles.styles.headerShadow
    },
    headerRow: {
        flex: 3,
        alignItems: 'center'
    },
    backButton: {
        marginLeft: 18,
        width: 40,
    },
    mainContentWrapper: {
        marginTop: 4,
        marginBottom: 24,
        paddingLeft: 24,
        paddingRight: 24
    },
    mainHeading: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.highContrast,
        marginBottom: 8
    },
    subHeading: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextL,
        color: Colors.colors.highContrast
    },
    modalMainHeading: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        textAlign: 'left',
        paddingBottom: 24
    },
    modalSubHeading: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextL,
        color: Colors.colors.highContrast,

    },
    authorQuote: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.mediumContrast,
        paddingBottom: 8

    }
    , authorName: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.mainPink,
        marginBottom: 10,

    },
    mainVideoImage: {
        width: "100%",
        alignSelf: 'center',
    },
    homeTopTextWrap: {
        paddingVertical: 32,
        paddingHorizontal: 24
    },
    buttonControls: {
        width: 295,
        marginTop: 40,
        alignSelf: 'center'
    },
    otherOption: {
        alignSelf: 'center',
        paddingTop: 20,
        color: Colors.colors.primaryTextDM,
    },

    mainTitle: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.highContrast,
        marginBottom: 8,
        marginTop: 32,
        textAlign: 'center'
    },
    roundVideoBtnWrapper: {
        position: "relative",
        alignSelf: 'center',
        marginTop: 20,
    },
    roundVideoBg: {
        position: "absolute",
        top: 20,
        left: 20
    },
    greBtns: {
        padding: 24,
        paddingBottom: isIphoneX()? 34 : 24
    },
    emptyView: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
        paddingBottom: 20
    },
    emptyAnim: {
        width: '90%',
        // alignSelf: 'center',
        marginBottom: 30,
    },
    emptyTextMain: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        alignSelf: 'center',
        marginBottom: 8
    },
    emptyTextDes: {
        alignSelf: 'center',
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.mediumContrast,
        paddingLeft: 16,
        paddingRight: 16,
        textAlign: 'center',
        marginBottom: 32
    },
});


const gradientPlayer = {
    preloadingPlaceholder: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center'
    },
    thumbnail: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center'
    },
    playButton: {
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',

    },
    playArrow: {
        color: 'white'
    },
    video: Platform.Version >= 24 ? {} : {
        backgroundColor: 'transparent'
    },
    controls: {
        backgroundColor: 'transparent',
        height: 90,
        marginTop: -90,
        flexDirection: 'row',
        alignItems: 'center'
    },
    playControl: {
        color: 'white',
        padding: 8
    },
    extraControl: {
        color: 'white',
        padding: 8
    },
    seekBar: {
        alignItems: 'center',
        height: 30,
        flexGrow: 1,
        flexDirection: 'row',
        paddingHorizontal: 10,
        marginLeft: -10,
        marginRight: -5
    },
    seekBarFullWidth: {
        marginLeft: 0,
        marginRight: 0,
        paddingHorizontal: 0,
        marginTop: -8,
        height: 8
    },
    seekBarProgress: {
        height: 5,
        backgroundColor: '#FFF',
        borderRadius: 5,
        opacity: 0.5
    },
    seekBarKnob: {
        backgroundColor: '#FFF'
    },
    seekBarBackground: {
        backgroundColor: '#FFF',
        height: 3,
        borderRadius: 3,
        opacity: 0.25,
        marginRight: 10
    },
    overlayButton: {
        flex: 1
    },

};

export default connectRevamp()(RevampTypeHomeScreen);
