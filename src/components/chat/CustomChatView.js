import React, {Component} from 'react';
import {
    AppState,
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView, Platform, StatusBar,
    StyleSheet
} from 'react-native';
import {
    Container,
    Content,
    Header,
    Left,
    Right,
    Button,
    Icon,
    Input,
    ListItem,
    Picker,
    Text,
    View,
    CheckBox
} from 'native-base';
import GradientButton from '../../components/GradientButton';
import CustomOverlay from '../CustomOverlay';
import {
    addTestID,
    PrimaryButton,
    getHeaderHeight,
    Colors,
    isIphoneX,
    TextStyles,
    TransactionSingleActionItem,
    CommonStyles, AlertUtil,
} from 'ch-mobile-shared';
import {connectChat} from "../../redux";
import LottieView from 'lottie-react-native';
import alfie from '../../assets/animations/Face_Talking';
import alfieFace from '../../assets/animations/alfie-face-new';
import Ionicon from 'react-native-vector-icons/Ionicons';
import uuid from 'uuid';
import ProgressCircle from 'react-native-progress-circle';
import GestureRecognizer from 'react-native-swipe-gestures';
import FeatherIcons from "react-native-vector-icons/Feather";
import AntIcons from "react-native-vector-icons/AntDesign";
import EntypoIcons from 'react-native-vector-icons/Entypo';
import Modal from "react-native-modalbox";
import { Slider } from 'react-native-elements';
import {SEGMENT_EVENT} from '../../constants/CommonConstants';
import Hyperlink from 'react-native-hyperlink';
import {EducationalPieceComponent} from '../learning-library/EducationalPiece.component';
import Analytics from '@segment/analytics-react-native';
import moment from 'moment';
import DeepLinksService from '../../services/DeepLinksService';
import { Screens } from "../../constants/Screens";

const HEADER_SIZE = getHeaderHeight();
const fullList = Dimensions.get('screen').height - (isIphoneX() ? 350 : 310);
let singleCount = 0;

class CustomChatView extends Component<Props> {
    constructor(props) {
        super(props);
        let contentType =
            this.props.message &&
            this.props.message.attachments &&
            this.props.message.attachments.length &&
            this.props.message.attachments[0].contentType;
        bgImage : {uri: ""};
        let delay = Math.round(
            this.props.message.text.trim().split(/\s+/).length / 4,
        ) + 1;

        if (delay === 1) {
            delay = 3;
        }
        this.state = {
            appState: AppState.currentState,
            fullScreenView: false,
            pausePressed: false,
            selected: undefined,
            keyboardHeight: isIphoneX() ? 38 : 12,
            contentType,
            selectedChoices: [],
            timeRemaining: contentType === 'provider-message' ? delay * 1000 : 0,
            initialDelay: delay * 1000,
            dropdowns: {
                '0': '',
                '1': '',
            },
            textInput: '',
            responded: false,
            pictureTaken: false,
            selectedAnswers: [],
            selectedRating: contentType==='rating-scale'? this.props.message.ratingScale.values[(this.props.message.ratingScale.values.length/2)-1]: -1,
            educationRead: false,
            filteredProvidersConnected: false
        };
        this.hlinkRef = null;
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this.keyboardDidShow.bind(this),
        );
    }

    static defaultProps = {
        bgImage: require("../../assets/images/accessLearningLib.png"),
    };
    _keyboardDidHide = () => {
        this.setState({
            keyboardHeight: isIphoneX() ? 38 : 12,
        });
    };

    keyboardDidShow(e) {
        this.setState({
            keyboardHeight: e.endCoordinates.height,
        });
    }

    getCompletion = () => {
        const {timeRemaining, initialDelay} = this.state;
        return (timeRemaining * 100) / (initialDelay);
    };

    componentDidUpdate(prevProps: Readonly<P>,
                       prevState: Readonly<S>,
                       snapshot: SS,): void {
        if (prevProps.chat.chatPaused && !this.props.chat.chatPaused) {
            const message = this.props.chat.chatMessages[0];
            let contentType =
                message &&
                message.attachments &&
                message.attachments.length &&
                message.attachments[0].contentType;
            if (contentType && contentType === 'provider-message') {
                this.setState({
                    timeRemaining: this.state.initialDelay,
                });
                this.startTimer();
            }
        } else if (this.props.chat.chatPaused) {
            this.stopTimer();
        }
    }

    fetchNext = () => {
        this.stopTimer();
        this.setState({
            timeRemaining: 0,
            responded: true
        });
        const message = {};
        message._id = uuid.v4();
        message.createdAt = new Date();

        this.props.chatFetchNext({
            payload: message,
            meta: {contact: this.props.chat.contact},
        });

    };

    startTimer = () => {
        this.timer = setTimeout(() => {
            this.startTimer();
            this.setState({
                timeRemaining: this.state.timeRemaining - 40,
            });

            if (this.state.timeRemaining === 0) {
                // this.fetchNext();
            } else if (this.state.timeRemaining < 0) {
                this.fetchNext();
                clearTimeout(this.timer);
            }

        }, 40);
        this.setState({pausePressed: false});
    };

    stopTimer = () => {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    };

    componentDidMount(): void {
        Keyboard.dismiss();
        let contentType =
            this.props.message &&
            this.props.message.attachments &&
            this.props.message.attachments.length &&
            this.props.message.attachments[0].contentType;
        if (contentType && contentType === 'provider-message') {
            this.startTimer();
        }
        AppState.addEventListener('change', this._handleAppState);
    }

    onChoiceToggle = choice => {
        if (this.state.selectedChoices.indexOf(choice) < 0) {
            this.setState({
                ...this.state,
                selectedChoices: [...this.state.selectedChoices, choice],
            });
        } else {
            this.setState({
                ...this.state,
                selectedChoices: this.state.selectedChoices.filter(
                    value => value !== choice,
                ),
            });
        }
    };

    onValueChange = (value, index) => {
        const state = this.state;
        state.dropdowns[index] = value;
        this.setState(state);
    };

    onMultiSelectPressed = () => {
        return Object.values(this.state.dropdowns).join(', ');
    };

    onMultiSelectListItemPressed = choice => {
        const choiceIndex = this.state.selectedChoices.indexOf(choice);
        let selectedChoices = this.state.selectedChoices;
        if (choiceIndex > -1) {
            selectedChoices.splice(choiceIndex, 1);
            this.setState({
                selectedChoices: selectedChoices,
            });
        } else {
            this.setState({
                selectedChoices: [...this.state.selectedChoices, choice],
            });
        }
    };

    pauseTimer = () => {
        this.setState({pausePressed: true});
        this.stopTimer();
    };

    playTimer = () => {
        this.setState({pausePressed: false});
        this.startTimer();
    };

    onSwipeUp = () => {
        this.setState({
            fullScreenView: true,
        });
    };

    onSwipeDown = () => {
        this.setState({fullScreenView: false});
    };

    renderText = (textToBeRender , textStyle)=>{
        return(
            <Hyperlink
                //style={{padding: 16}}
                ref={(hlink) => {
                    this.hlinkRef = hlink;
                }}
                onPress={(url) => {
                    try {
                        this.hlinkRef.handleLink(url);
                    } catch (e) {
                        AlertUtil.showErrorMessage('Unable to open this link');
                    }
                }}
                linkStyle={{textDecorationLine: 'underline'}}
            >
                <Text
                    {...addTestID('Full-Screen-View-Text')}
                    style={textStyle}
                >
                    {textToBeRender}
                </Text>
            </Hyperlink>
        )
    }
    cardUploadOpen = () => {
        this.refs.cardUploadOption.open();
    };

    cardUploadClose = () => {
        this.refs.cardUploadOption.close();
    };

    educationDrawerOpen = () => {
        this.refs.educationDrawerOption.open();
    };

    educationDrawerClose = () => {
        this.refs.educationDrawerOption.close();
    };

    render = () => {
        const {bgImage} = this.props;
        const config = {
            velocityThreshold: 0.1,
            directionalOffsetThreshold: 50,
        };
        let contentType =
            this.props.message &&
            this.props.message.attachments &&
            this.props.message.attachments.length &&
            this.props.message.attachments[0].contentType;
        const dataType = this.props.message &&
            this.props.message.attachments &&
            this.props.message.attachments.length &&
            this.props.message.attachments[0].dataType;
        const activityData = this.props.message.attachments &&
            this.props.message.attachments.length &&
            this.props.message.attachments[0].content &&
            this.props.message.attachments[0].content.activity;

        const hasEducation = this.props.message && this.props.message.attachments &&
            this.props.message.attachments.length &&
            this.props.message.attachments[0].content &&
            this.props.message.attachments[0].content.contentfulData &&
            this.props.message.attachments[0].content.contentfulData.title;

        const isArticleCompleted = hasEducation &&  this.props.profile.markAsCompleted && !!(this.props.profile.markAsCompleted.find(education =>
            this.props.message.educationSlug === education['slug']
        ))
        if(contentType==='single-message') {
            contentType = 'chatbot-completed'
        }
        // contentType = 'provider-prompt';
        switch (contentType) {
            // please service type accordingly
            case 'telehealth-services-old': {
                return (
                    <GestureRecognizer
                        onSwipeUp={this.onSwipeUp}
                        onSwipeDown={this.onSwipeDown}
                        config={config}
                        style={{flex: 1, position: 'absolute'}}>
                        <CustomOverlay
                            containerStyle={styles.overlayBG}
                            childrenWrapperStyle={
                                this.state.fullScreenView
                                    ? styles.fullOverlay
                                    : styles.responseWrapper
                            }
                            visible={!this.props.chat.chatPaused}
                            onClose={this.minimizePopup}
                            // closeOnTouchOutside
                        >


                            <View style={{width: '100%', paddingBottom: 24}}>
                                <Image
                                    resizeMode={'contain'}
                                    style={styles.starImage}
                                    source={require('../../assets/images/stars.png')}/>
                                <View
                                    style={{...styles.gestureArea, paddingBottom: 0}}>
                                    <View style={styles.swipeBar}
                                          {...addTestID('swipeBar')}
                                    />
                                    <Button
                                        {...addTestID('ios-arrow-down')}
                                        transparent
                                        style={styles.arrowBtn}
                                        onPress={this.minimizePopup}>
                                        <Ionicon
                                            style={styles.arrowIcon}
                                            name="ios-arrow-down" size={40} color="#4FACFE"/>
                                    </Button>

                                    <Text
                                        style={
                                            styles.MainHeadingPopup
                                        }
                                    >
                                        Learn more about our clinical services
                                    </Text>
                                    <Image
                                        resizeMode={'contain'}
                                        style={styles.activityImg}
                                        source={require('../../assets/images/services.png')}
                                    />

                                    <Text
                                        style={
                                            styles.MainParaPopup
                                        }
                                    >
                                        Prescription, therapy, coaching, strategizing, and much more
                                    </Text>
                                    <Text
                                        style={
                                            styles.BookAppText
                                        }
                                    >
                                        Book Appointment Now
                                    </Text>
                                </View>




                                <View style={styles.buttonsWrap}>
                                    <Button
                                        transparent
                                        onPress={this.fetchNext}
                                        style={styles.selectServiceBtn}>
                                        <Text uppercase={false} style={styles.buttonText}>I will do this later</Text>
                                    </Button>
                                    <GradientButton
                                        onPress={async () => {
                                            await this.minimizePopup();
                                            this.props.navigateToNextScreen('SERVICES_LIST', null);
                                        }}
                                        style={styles.gradtbtn}
                                        text="See Our Services"

                                    />
                                </View>


                            </View>

                        </CustomOverlay>
                    </GestureRecognizer>
                );
            }
            //provider-prompt
            case 'provider-prompt-old-design': {
                return (
                    <GestureRecognizer
                        onSwipeUp={this.onSwipeUp}
                        onSwipeDown={this.onSwipeDown}
                        config={config}
                        style={{flex: 1, position: 'absolute'}}>
                        <CustomOverlay
                            containerStyle={styles.overlayBG}
                            childrenWrapperStyle={
                                this.state.fullScreenView
                                    ? styles.fullOverlay
                                    : styles.responseWrapper
                            }
                            visible={!this.props.chat.chatPaused}
                            onClose={this.minimizePopup}
                            // closeOnTouchOutside
                        >


                            <View style={{width: '100%', paddingBottom: 24}}>
                                <Image
                                    resizeMode={'contain'}
                                    style={styles.starImage}
                                    source={require('../../assets/images/stars.png')}/>
                                <View
                                    style={{...styles.gestureArea, paddingBottom: 0}}>
                                    <View style={styles.swipeBar}
                                          {...addTestID('swipeBar')}
                                    />
                                    <Button
                                        {...addTestID('ios-arrow-down')}
                                        transparent
                                        style={styles.arrowBtn}
                                        onPress={this.minimizePopup}>
                                        <Ionicon
                                            style={styles.arrowIcon}
                                            name="ios-arrow-down" size={40} color="#4FACFE"/>
                                    </Button>

                                    <Text
                                        style={
                                            styles.MainHeadingPopup
                                        }
                                    >
                                        Get introduced to our Clinical Team:
                                    </Text>
                                    <Image
                                        resizeMode={'contain'}
                                        style={styles.activityImg}
                                        source={require('../../assets/images/services.png')}
                                    />

                                    <Text
                                        style={
                                            styles.MainParaPopup
                                        }
                                    >
                                        Therapists, Prescribers, Coaches, Social Workers and Matchmakers
                                    </Text>
                                    <Text
                                        style={
                                            styles.BookAppText
                                        }
                                    >
                                        Book Appointment Now
                                    </Text>
                                </View>




                                <View style={styles.buttonsWrap}>
                                    <Button
                                        transparent
                                        onPress={this.fetchNext}
                                        style={styles.selectServiceBtn}>
                                        <Text uppercase={false} style={styles.buttonText}>I will do this later</Text>
                                    </Button>
                                    <GradientButton
                                        onPress={async () => {
                                            await this.minimizePopup();
                                            this.props.navigateToNextScreen('PROVIDERS_LIST', null);
                                        }}
                                        style={styles.gradtbtn}
                                        text="Meet the Team"

                                    />
                                </View>


                            </View>

                        </CustomOverlay>
                    </GestureRecognizer>
                );
            }
            //filtered-providers
            case 'filtered-providers-old': {
                return (
                    <GestureRecognizer
                        onSwipeUp={this.onSwipeUp}
                        onSwipeDown={this.onSwipeDown}
                        config={config}
                        style={{flex: 1, position: 'absolute'}}>
                        <CustomOverlay
                            containerStyle={styles.overlayBG}
                            childrenWrapperStyle={
                                this.state.fullScreenView
                                    ? styles.fullOverlay
                                    : styles.responseWrapper
                            }
                            visible={!this.props.chat.chatPaused}
                            onClose={this.minimizePopup}
                            // closeOnTouchOutside
                        >


                            <View style={{width: '100%', paddingBottom: 24}}>
                                <Image
                                    resizeMode={'contain'}
                                    style={styles.starImage}
                                    source={require('../../assets/images/stars.png')}/>
                                <View
                                    style={{...styles.gestureArea, paddingBottom: 0}}>
                                    <View style={styles.swipeBar}
                                          {...addTestID('swipeBar')}
                                    />
                                    <Button
                                        {...addTestID('ios-arrow-down')}
                                        transparent
                                        style={styles.arrowBtn}
                                        onPress={this.minimizePopup}>
                                        <Ionicon
                                            style={styles.arrowIcon}
                                            name="ios-arrow-down" size={40} color="#4FACFE"/>
                                    </Button>
                                    {this.renderText(`Connect with a ${this.props.message.attachments[0].content.popupText ? this.props.message.attachments[0].content.popupText : 'Provider'}`,styles.MainHeadingPopup)}
                                    <Image
                                        resizeMode={'contain'}
                                        style={styles.activityImg}
                                        source={require('../../assets/images/services.png')}
                                    />

                                    <Text
                                        style={
                                            styles.MainParaPopup
                                        }
                                    >
                                        Our coaches are available to meet with you
                                    </Text>
                                    <Text
                                        style={
                                            styles.BookAppText
                                        }
                                    >
                                        Book Appointment Now
                                    </Text>
                                </View>




                                <View style={styles.buttonsWrap}>
                                    <Button
                                        transparent
                                        onPress={this.fetchNext}
                                        style={styles.selectServiceBtn}>
                                        <Text uppercase={false} style={styles.buttonText}>I will do this later</Text>
                                    </Button>
                                    <GradientButton
                                        onPress={async () => {
                                            await this.minimizePopup();
                                            this.props.navigateToNextScreen('FILTERED_PROVIDER_LIST', this.props.message.attachments[0].content.popupText);
                                        }}
                                        style={styles.gradtbtn}
                                        text="Meet the Team"

                                    />
                                </View>


                            </View>

                        </CustomOverlay>
                    </GestureRecognizer>
                );
            }
            case 'single-select': {
                const choices = this.props.message.attachments[0].content.choices;
                singleCount = choices.length;

                const decoratedChoices = choices.map((choice, index) => {
                    const itemSelected = this.state.selectedChoices[0] === choice;
                    return (
                            <ListItem
                                {...addTestID('List-Item')}
                                key={`choice-ss-${index}`}
                                style={
                                    itemSelected
                                        ? [styles.multiList, styles.multiListSelected]
                                        : styles.multiList
                                }
                                    onPress={() => {
                                        this.setState({
                                            selectedChoices: [choice]
                                        });
                                        // this.props.onSend([{text: choice, type: 'message'}]);
                                    }}
                            >
                                <Text
                                    {...addTestID('Multi-List-Text')}
                                    style={
                                        itemSelected
                                            ? [
                                                styles.multiListText,
                                                {
                                                    color: Colors.colors.primaryText,
                                                },
                                            ]
                                            : styles.multiListText
                                    }>
                                    {choice}
                                </Text>
                            </ListItem>

                    );
                    // return (
                    //     <View>
                    //         {/*<Button*/}
                    //         {/*    {...addTestID('Single-Select-Botton')}*/}
                    //         {/*    transparent*/}
                    //         {/*    onPress={() => {*/}
                    //         {/*        this.props.onSend([{text: choice, type: 'message'}]);*/}
                    //         {/*    }}*/}
                    //         {/*    key={key}*/}
                    //         {/*    style={styles.singleSelectBtn}>*/}
                    //         {/*    <Text uppercase={false} style={styles.buttonText}>{choice}</Text>*/}
                    //         {/*</Button>*/}
                    //
                    //         <SecondaryButton
                    //             onPress={() => {
                    //                 this.props.onSend([{text: choice, type: 'message'}]);
                    //             }}
                    //             borderColor={Colors.colors.borderColor}
                    //             bgColor={Colors.colors.white}
                    //             textColor={Colors.colors.highContrast}
                    //             text={choice}
                    //         />
                    //
                    //     </View>
                    // )
                });
                if (decoratedChoices.length === 0) {
                    return null;
                }
                return (
                    <CustomOverlay
                        // containerStyle={styles.overlayBG}
                        childrenWrapperStyle={styles.fullOverlay}
                        visible={!this.props.chat.chatPaused}
                        onClose={this.minimizePopup}
                        // closeOnTouchOutside
                    >
                        <Container style={{width: '100%'}}>
                            <Header transparent style={styles.header}>
                                <StatusBar
                                    backgroundColor="transparent"
                                    barStyle="dark-content"
                                    translucent
                                />
                                <Left>
                                    <Button transparent
                                            style={styles.backBtn}
                                            onPress={this.minimizePopup}
                                    >
                                        <EntypoIcons size={24} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                                        <Text uppercase={false} style={styles.backBtnText}>Back</Text>
                                    </Button>
                                </Left>
                                <Right>
                                    <Button transparent
                                            style={styles.crossBtn}
                                            onPress={this.minimizePopup}
                                    >
                                        <AntIcons size={24} color={Colors.colors.mainBlue} name="close"/>
                                    </Button>
                                </Right>
                            </Header>
                            <Content>
                                {/*<View>*/}
                                    <View style={styles.textWrap}>
                                        {this.renderText(this.props.message.text, styles.SSQuestion)}
                                        {decoratedChoices.length > 1 && (
                                            <Text style={styles.SSHint}>Select the best option</Text>
                                        )}
                                    </View>
                                    <View style={styles.optionList}>
                                        {decoratedChoices}
                                    </View>
                                {/*</View>*/}
                            </Content>
                            {
                                this.state.selectedChoices.length>0 && (
                                    <View
                                        style={styles.greBtn}>
                                        <PrimaryButton
                                            text="Continue"
                                            onPress={()=>{
                                                this.props.onSend([{text: this.state.selectedChoices[0], type: 'message'}]);
                                            }}
                                        />
                                    </View>
                                )
                            }

                        </Container>
                    </CustomOverlay>
                );
            }
            case 'multi-select': {
                const choices = this.props.message.attachments[0].content.choices;
                const decoratedChoices = choices.map((choice, key) => {
                    const itemSelected = this.state.selectedChoices.indexOf(choice) > -1;
                    return (
                        <ListItem
                            {...addTestID('List-Item')}
                            style={
                                itemSelected
                                    ? [styles.multiList, styles.multiListSelected]
                                    : styles.multiList
                            }
                            key={key}
                            onPress={() => this.onMultiSelectListItemPressed(choice)}>
                            <Text
                                {...addTestID('Multi-List-Text')}
                                style={
                                    itemSelected
                                        ? [
                                            styles.multiListText,
                                            {
                                                color: Colors.colors.primaryText
                                            },
                                        ]
                                        : styles.multiListText
                                }>
                                {choice}
                            </Text>

                            <CheckBox
                                {...addTestID('Multi-Radio-Select')}
                                style={
                                    itemSelected ? [styles.multiCheck, styles.multiCheckSelected] : styles.multiCheck
                                }
                                color={Colors.colors.mainBlue}
                                checked={this.state.selectedChoices.indexOf(choice) > -1}
                                onPress={() => this.onMultiSelectListItemPressed(choice)}
                            />
                            {/*<Radio*/}
                            {/*    {...addTestID('Multi-Radio-Select')}*/}
                            {/*    style={*/}
                            {/*        itemSelected ? [styles.multiCheck, styles.multiCheckSelected] : styles.multiCheck*/}
                            {/*    }*/}
                            {/*    color="#3fb2fe"*/}
                            {/*    selectedColor="#fff"*/}
                            {/*    selected={this.state.selectedChoices.indexOf(choice) > -1}*/}
                            {/*    onPress={() => this.onMultiSelectListItemPressed(choice)}*/}
                            {/*/>*/}
                        </ListItem>
                    );
                });
                if (decoratedChoices.length === 0) {
                    return null;
                }
                return (
                    <CustomOverlay
                        // containerStyle={styles.overlayBG}
                        childrenWrapperStyle={styles.fullOverlay}
                        onClose={this.minimizePopup}
                        visible={!this.props.chat.chatPaused}>
                        <Container style={{width: '100%'}}>
                            <Header transparent style={styles.header}>
                                <StatusBar
                                    backgroundColor="transparent"
                                    barStyle="dark-content"
                                    translucent
                                />
                                <Left>
                                    <Button transparent
                                            style={styles.backBtn}
                                            onPress={this.minimizePopup}
                                    >
                                        <EntypoIcons size={24} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                                        <Text uppercase={false} style={styles.backBtnText}>Back</Text>
                                    </Button>
                                </Left>
                                <Right>
                                    <Button transparent
                                            style={styles.crossBtn}
                                            onPress={this.minimizePopup}
                                    >
                                        <AntIcons size={24} color={Colors.colors.mainBlue} name="close"/>
                                    </Button>
                                </Right>
                            </Header>
                            <Content>
                                <View style={styles.textWrap}>
                                    {this.renderText(this.props.message.text,styles.SSQuestion)}
                                    <Text style={styles.SSHint}>Select all that apply</Text>
                                </View>
                                <View style={styles.optionList}>
                                    {decoratedChoices}
                                </View>
                            </Content>
                            {
                                this.state.selectedChoices.length>0 && (
                                    <View
                                        style={styles.greBtn}>
                                        <PrimaryButton
                                            onPress={() => {
                                                this.props.onSend([
                                                    {
                                                        text: this.state.selectedChoices.join(', '),
                                                        type: 'message',
                                                    },
                                                ]);
                                                this.setState({selectedChoices: []});
                                            }}
                                            text="Continue"
                                        />
                                    </View>
                                )
                            }

                            {/*<Button*/}
                            {/*    {...addTestID('Submit-Button')}*/}
                            {/*    full*/}
                            {/*    style={styles.submitBtn}*/}
                            {/*    onPress={() => {*/}
                            {/*        this.props.onSend([*/}
                            {/*            {*/}
                            {/*                text: this.state.selectedChoices.join(', '),*/}
                            {/*                type: 'message',*/}
                            {/*            },*/}
                            {/*        ]);*/}
                            {/*        this.setState({selectedChoices: []});*/}
                            {/*    }}>*/}
                            {/*    <LinearGradient*/}
                            {/*        start={{x: 0, y: 1}}*/}
                            {/*        end={{x: 1, y: 0}}*/}
                            {/*        colors={['#4FACFE', '#34b6fe', '#00C8FE']}*/}
                            {/*        style={styles.submitGre}>*/}
                            {/*        <Text style={styles.multiSubmitText}>Submit Answer</Text>*/}
                            {/*    </LinearGradient>*/}
                            {/*</Button>*/}
                        </Container>
                    </CustomOverlay>
                );
            }
            case 'multi-dropdown': {
                let dropdowns = this.props.message.attachments[0].content.dropdowns.map(
                    (dropdown, key) => {
                        const pickerItems = dropdown.values.map((value, key) => {
                            return (
                                <Picker.Item
                                    label={value}
                                    value={key === 0 ? '' : value}
                                    key={key}
                                />
                            );
                        });

                        return (
                            <View style={styles.pickerBorder} key={key}>
                                <Picker
                                    mode="dropdown"
                                    iosIcon={<Icon name="arrow-down"/>}
                                    placeholder={dropdown.label}
                                    textStyle={{color: '#25345C'}}
                                    itemTextStyle={{color: '#25345C'}}
                                    style={styles.singleDropdown}
                                    selectedValue={this.state.dropdowns[key]}
                                    onValueChange={value => this.onValueChange(value, key)}>
                                    {pickerItems}
                                </Picker>
                            </View>
                        );
                    },
                );
                return (
                    <View style={styles.dropWrapper}>
                        <View style={styles.dropdownContainer}>
                            <Text style={styles.dropdownText}/>
                            <View style={styles.twinDropdowns}>{dropdowns}</View>

                            <GradientButton
                                testId="submit"
                                disabled={
                                    this.state.dropdowns[0] === '' ||
                                    this.state.dropdowns[1] === ''
                                }
                                style={styles.dropdrownSubmit}
                                text="Submit"
                                onPress={() => {
                                    this.props.onSend([
                                        {text: this.onMultiSelectPressed(), type: 'message'},
                                    ]);
                                    this.setState({
                                        ...this.state,
                                        dropdowns: {
                                            '0': '',
                                            '1': '',
                                        },
                                    });
                                }}
                            />
                        </View>
                    </View>
                );
            }
            case 'provider-message': {
                return (
                    <CustomOverlay
                        // containerStyle={styles.overlayBG}
                        childrenWrapperStyle={styles.fullOverlay}
                        onClose={this.minimizePopup}
                        visible={
                            !this.props.chat.chatPaused && this.state.timeRemaining > 0
                        }>
                        <Container style={{width: '100%'}}>
                            <Header transparent style={styles.header}>
                                <StatusBar
                                    backgroundColor="transparent"
                                    barStyle="dark-content"
                                    translucent
                                />
                                <Left>
                                    <Button transparent
                                            style={styles.backBtn}
                                            onPress={this.minimizePopup}
                                    >
                                        <EntypoIcons size={24} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                                        <Text uppercase={false} style={styles.backBtnText}>Back</Text>
                                    </Button>
                                </Left>
                                <Right>
                                    <Button transparent
                                            style={styles.crossBtn}
                                            onPress={this.minimizePopup}
                                    >
                                        <AntIcons size={24} color={Colors.colors.mainBlue} name="close"/>
                                    </Button>
                                </Right>
                            </Header>
                            <Content>
                                <View style={styles.proWrapper}>
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
                                    <Text style={styles.proHint}>{this.props.message.text}</Text>
                                </View>
                            </Content>
                            <View style={styles.timerWrapper}>
                                <ProgressCircle
                                    percent={this.getCompletion()}
                                    radius={40}
                                    borderWidth={3}
                                    color={Colors.colors.primaryIcon}
                                    shadowColor="#f5f5f5"
                                    bgColor="#fff"
                                >
                                    {this.state.pausePressed ? (
                                        <Button
                                            {...addTestID('Play-Timer')}
                                            style={{
                                                justifyContent: 'center',
                                                height: 80,
                                                width: 80,
                                                paddingLeft: 5,
                                                paddingBottom: 0,
                                            }}
                                            transparent onPress={this.playTimer}>
                                            <Ionicon name="md-play" size={30} color={Colors.colors.primaryIcon}/>
                                        </Button>
                                    ) : (
                                        <Button
                                            {...addTestID('Pause-Timer')}
                                            style={{justifyContent: 'center', height: 80, width: 80, paddingBottom: 0}}
                                            transparent onPress={this.pauseTimer}>
                                            <Ionicon name="md-pause" size={30} color={Colors.colors.primaryIcon}/>
                                        </Button>
                                    )}
                                </ProgressCircle>
                                <Button
                                    {...addTestID('Fetch-Next')}
                                    style={{marginTop: 32}} transparent onPress={this.fetchNext}>
                                    <Text uppercase={false} style={styles.skipText}>
                                        Skip to next
                                    </Text>
                                </Button>
                            </View>
                        </Container>
                    </CustomOverlay>
                );
            }
            case 'text-input': {
                const isNumeric = dataType && (dataType.toLowerCase() === 'numeric' || dataType.toLowerCase() === 'integer' || dataType.toLowerCase() === 'number');
                return (
                    <CustomOverlay
                        onClose={this.minimizePopup}
                        // containerStyle={styles.overlayBG}
                        childrenWrapperStyle={styles.fullOverlay}
                        visible={!this.props.chat.chatPaused}>
                        <KeyboardAvoidingView
                            style={{flex: 1, bottom: 0}}
                            behavior={Platform.OS === 'ios' ? 'padding' : null}
                            enabled
                            ref={(ref) => {
                                this.keyboardAVRef = ref;
                            }}
                        >
                            <Container>
                                <Header transparent style={styles.header}>
                                    <StatusBar
                                        backgroundColor="transparent"
                                        barStyle="dark-content"
                                        translucent
                                    />
                                    <Left>
                                        <Button transparent
                                                style={styles.backBtn}
                                                onPress={this.minimizePopup}
                                        >
                                            <EntypoIcons size={24} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                                            <Text uppercase={false} style={styles.backBtnText}>Back</Text>
                                        </Button>
                                    </Left>
                                    <Right>
                                        <Button transparent
                                                style={styles.crossBtn}
                                                onPress={this.minimizePopup}
                                        >
                                            <AntIcons size={24} color={Colors.colors.mainBlue} name="close"/>
                                        </Button>
                                    </Right>
                                </Header>
                                <Content>
                                    <View style={styles.textWrap}>
                                        <Text style={styles.inputHead}>{this.props.message.text}</Text>
                                        <Text style={styles.inputDes}>Type your answer below</Text>
                                    </View>
                                </Content>
                                <View style={{...styles.noGreBtn, backgroundColor: Colors.colors.whiteColor}}>
                                    <View style={styles.inputRow}>
                                        <Input
                                            style={this.state.textFocus ?
                                                [styles.inputSelf, { borderColor: Colors.colors.mainBlue }] : styles.inputSelf}
                                            keyboardType={isNumeric ? "number-pad" : "default"}
                                            value={this.state.textInput}
                                            onChangeText={textInput => {
                                                this.setState({textInput: textInput});
                                            }}
                                            onFocus = {()=>{
                                                this.setState({textFocus: true})
                                            }}
                                            onBlur = {()=>{
                                                this.setState({textFocus: false})
                                            }}
                                        />
                                        {/*<Button*/}
                                        {/*    {...addTestID('Message')}*/}
                                        {/*    transparent*/}
                                        {/*    disabled={this.state.textInput === ''}*/}
                                        {/*    onPress={() => {*/}
                                        {/*        this.props.onSend([*/}
                                        {/*            {text: this.state.textInput, type: 'message'},*/}
                                        {/*        ]);*/}
                                        {/*    }}>*/}
                                        {/*    <Icon*/}
                                        {/*        type={'FontAwesome'}*/}
                                        {/*        name="paper-plane"*/}
                                        {/*        color='#3fb2fe'*/}
                                        {/*        style={this.state.textInput === '' ? {*/}
                                        {/*            marginRight: 0,*/}
                                        {/*            fontSize: 30,*/}
                                        {/*            color: '#EBEBEB',*/}
                                        {/*        } : {marginRight: 0, fontSize: 30, color: '#3fb2fe'}}*/}
                                        {/*    />*/}
                                        {/*</Button>*/}
                                    </View>
                                    <PrimaryButton
                                        disabled={this.state.textInput === ''}
                                        onPress={() => {
                                            this.props.onSend([
                                                {text: this.state.textInput, type: 'message'},
                                            ]);
                                        }}
                                        text={'Continue'}
                                    />
                                </View>
                            </Container>
                        </KeyboardAvoidingView>
                    </CustomOverlay>
                );
            }
            case 'activity' : {
                const choices = this.props.message.attachments[0].content.choices;
                return (
                    <GestureRecognizer
                        onSwipeUp={this.onSwipeUp}
                        onSwipeDown={this.onSwipeDown}
                        config={config}
                        style={{flex: 1, position: 'absolute'}}>
                        <CustomOverlay
                            containerStyle={{backgroundColor: 'rgba(37,52,92,0.3)', zIndex: -1}}
                            childrenWrapperStyle={
                                this.state.fullScreenView
                                    ? styles.fullOverlay
                                    : styles.responseWrapper
                            }
                            onClose={this.minimizePopup}
                            visible={!this.props.chat.chatPaused}>
                            <View style={{width: '100%', paddingBottom: 24}}>
                                <View
                                    style={{...styles.gestureArea, paddingLeft: 0, paddingRight: 0, paddingBottom: 0}}>
                                    <View style={styles.swipeBar}/>
                                    <Button
                                        {...addTestID('Minimize-Popup-Multi-Select')}
                                        transparent
                                        style={styles.arrowBtn}
                                        onPress={this.minimizePopup}>
                                        <Ionicon
                                            style={styles.arrowIcon}
                                            name="ios-arrow-down" size={40} color="#4FACFE"/>
                                    </Button>

                                    <View style={{paddingLeft: 24, paddingRight: 24}}>
                                        <Image
                                            resizeMode={'contain'}
                                            style={styles.activityImg}
                                            source={require('../../assets/images/new-bot-activity.png')}
                                        />
                                        <Text style={styles.activityMainText}>
                                            {activityData.title}
                                        </Text>
                                        <Text style={styles.activitySubText}>
                                            {this.props.message.text}
                                        </Text>
                                        <View>
                                            <View style={styles.singleActivityRow}>
                                                <Text style={styles.activityDarkText}>Items Needed</Text>
                                                <Text style={styles.activityLightText}>{activityData.itemsNeeded}</Text>
                                            </View>
                                            <View style={styles.singleActivityRow}>
                                                <Text style={styles.activityDarkText}>Time Needed</Text>
                                                <Text style={styles.activityLightText}>{activityData.timeNeeded}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.buttonBlock}>
                                            {
                                                choices[0] && (
                                                    <Button
                                                        transparent
                                                        onPress={() => {
                                                            this.props.onSend([{text: choices[0], type: 'message'}]);
                                                        }}
                                                        style={styles.activityOutlineBtn}>

                                                        <Text uppercase={false}
                                                              style={styles.activityOutlineBtnText}>{choices[0]}</Text>
                                                    </Button>
                                                )
                                            }

                                            {
                                                choices[1] && (
                                                    <GradientButton
                                                        text={choices[1]}
                                                        onPress={() => {
                                                            this.props.onSend([{text: choices[1], type: 'message'}]);
                                                        }}
                                                    />
                                                )
                                            }

                                        </View>
                                    </View>

                                </View>

                            </View>
                        </CustomOverlay>
                    </GestureRecognizer>
                )
            }
            case 'payment' : {
                return (
                    <GestureRecognizer
                        onSwipeUp={this.onSwipeUp}
                        onSwipeDown={this.onSwipeDown}
                        config={config}
                        style={{flex: 1, position: 'absolute'}}>
                        <CustomOverlay
                            containerStyle={{backgroundColor: 'rgba(37,52,92,0.3)', zIndex: -1}}
                            childrenWrapperStyle={
                                this.state.fullScreenView
                                    ? styles.fullOverlay
                                    : styles.responseWrapper
                            }
                            onClose={this.minimizePopup}
                            visible={!this.props.chat.chatPaused}>
                            <View style={{width: '100%', paddingBottom: 24}}>
                                <View
                                    style={{...styles.gestureArea, paddingLeft: 0, paddingRight: 0, paddingBottom: 0}}>
                                    <View style={styles.swipeBar}/>
                                    <Button
                                        {...addTestID('Minimize-Popup-Multi-Select')}
                                        transparent
                                        style={styles.arrowBtn}
                                        onPress={this.minimizePopup}>
                                        <Ionicon
                                            style={styles.arrowIcon}
                                            name="ios-arrow-down" size={40} color="#4FACFE"/>
                                    </Button>

                                    <View style={{paddingLeft: 24, paddingRight: 24}}>
                                        <View style={styles.paymentWrapper}>
                                            <Image
                                                resizeMode={'contain'}
                                                style={styles.paymentImg}
                                                source={require('../../assets/images/receiving-money.png')}
                                            />
                                        </View>
                                        {this.renderText(this.props.message.text,styles.paymentMainText)}
                                        <Text style={styles.activitySubText}>
                                            You can add funds to your wallet from here.
                                        </Text>

                                        <View style={styles.buttonBlock}>
                                            <GradientButton
                                                text="Add Funds"
                                                onPress={() => {
                                                    this.props.navigateToNextScreen('PAYMENT', null);
                                                }}
                                            />
                                            <Button
                                                {...addTestID('Cancel-Button')}
                                                transparent
                                                style={styles.clearBtn}
                                                onPress={() => {
                                                    this.props.onSend([{
                                                        text: 'I\'ve already added funds',
                                                        type: 'message'
                                                    }]);
                                                }}>
                                                <Text uppercase={false} style={styles.alreadyAddedFundsText}>
                                                    I've already added funds
                                                </Text>
                                            </Button>
                                        </View>

                                    </View>

                                </View>

                            </View>
                        </CustomOverlay>
                    </GestureRecognizer>
                )
            }
            case 'lesson-completed' : {
                return (
                    <CustomOverlay
                        // containerStyle={styles.overlayBG}
                        childrenWrapperStyle={styles.fullOverlay}
                        visible={!this.props.chat.chatPaused}
                        onClose={this.minimizePopup}
                        // closeOnTouchOutside
                    >
                        <Container style={styles.blockBg}>
                            <Header transparent style={styles.header}>
                                <StatusBar
                                    backgroundColor="transparent"
                                    barStyle="dark-content"
                                    translucent
                                />
                                <Left>
                                    <Button transparent
                                            style={styles.backBtn}
                                            onPress={this.minimizePopup}
                                    >
                                        <EntypoIcons size={24} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                                        <Text uppercase={false} style={styles.backBtnText}>Back</Text>
                                    </Button>
                                </Left>
                                <Right>
                                    <Button transparent
                                            style={styles.crossBtn}
                                            onPress={this.minimizePopup}
                                    >
                                        <AntIcons size={24} color={Colors.colors.mainBlue} name="close"/>
                                    </Button>
                                </Right>
                            </Header>
                            <Content>
                                <View style={styles.lessonWrap}>
                                    <Image
                                        style={styles.lessonImg}
                                        source={require('../../assets/images/lesson-completed.png')}/>
                                    <Text style={styles.lessonMainText}>You’ve completed {'\n'}
                                        this lesson!</Text>
                                    <Text style={styles.lessonSubText}>Keep the momentum going by returning to the chatbot</Text>
                                </View>
                            </Content>
                            <View
                                style={styles.noGreBtn}>
                                <Button
                                    style={styles.noTimeBtn}
                                    transparent>
                                    <Text uppercase={false} style={styles.noTimeText}>I don’t have time right now</Text>
                                </Button>
                                <PrimaryButton
                                    text="Continue"
                                />
                            </View>
                        </Container>
                    </CustomOverlay>
                )
            }
            case 'chatbot-completed' : {
                return (
                    <CustomOverlay
                        // containerStyle={styles.overlayBG}
                        childrenWrapperStyle={styles.fullOverlay}
                        visible={!this.props.chat.chatPaused}
                        onClose={this.minimizePopup}
                        // closeOnTouchOutside
                    >
                        <Container style={styles.blockBg}>
                            <Header transparent style={styles.header}>
                                <StatusBar
                                    backgroundColor="transparent"
                                    barStyle="dark-content"
                                    translucent
                                />
                                <Left>
                                    <Button transparent
                                            style={styles.backBtn}
                                            onPress={this.minimizePopup}
                                    >
                                        <EntypoIcons size={24} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                                        <Text uppercase={false} style={styles.backBtnText}>Back</Text>
                                    </Button>
                                </Left>
                                <Right>
                                    <Button transparent
                                            style={styles.crossBtn}
                                            onPress={this.minimizePopup}
                                    >
                                        <AntIcons size={24} color={Colors.colors.mainBlue} name="close"/>
                                    </Button>
                                </Right>
                            </Header>
                            <Content>
                                <View style={styles.chatbotCompletedWrap}>
                                    <Image
                                        style={styles.chatbotCompletedImg}
                                        source={require('../../assets/images/chatbot-completed.png')}/>
                                    <Text style={styles.chatbotCompletedMainText}>Congratulations, you {'\n'} finished this conversation</Text>
                                    <Text style={styles.chatbotCompletedSubText}>You can always come back to this chat later to access what you learned. </Text>
                                </View>
                            </Content>
                            <View
                                style={styles.noGreBtn}>
                                <Button
                                    style={styles.noTimeBtn}
                                    transparent
                                    onPress={()=>{
                                        this.props.restartChatbot(this.props.contactId);
                                        setTimeout(()=>{
                                            this.fetchNext();
                                        }, 2000);
                                    }}
                                >
                                    <Text uppercase={false} style={styles.noTimeText}>Restart Chatbot</Text>
                                </Button>
                                <PrimaryButton
                                    text="Archive Chatbot"
                                    onPress={()=>{
                                        this.props.archiveConnection(this.props.contactId);
                                        this.props.navigateToNextScreen('BACK');
                                    }}
                                />
                            </View>
                        </Container>
                    </CustomOverlay>
                )
            }
            case 'idCard-upload' : {
                return (
                    <CustomOverlay
                        // containerStyle={styles.overlayBG}
                        childrenWrapperStyle={styles.fullOverlay}
                        visible={!this.props.chat.chatPaused}
                        onClose={this.minimizePopup}
                        // closeOnTouchOutside
                    >
                        <Container style={styles.blockBg}>
                            <Header transparent style={styles.header}>
                                <StatusBar
                                    backgroundColor="transparent"
                                    barStyle="dark-content"
                                    translucent
                                />
                                <Left>
                                    <Button transparent
                                            style={styles.backBtn}
                                            onPress={this.minimizePopup}
                                    >
                                        <EntypoIcons size={24} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                                        <Text uppercase={false} style={styles.backBtnText}>Back</Text>
                                    </Button>
                                </Left>
                                <Right>
                                    <Button transparent
                                            style={styles.crossBtn}
                                            onPress={this.minimizePopup}
                                    >
                                        <AntIcons size={24} color={Colors.colors.mainBlue} name="close"/>
                                    </Button>
                                </Right>
                            </Header>
                            <Content>
                                <View style={styles.idCardWrap}>
                                    <Text style={styles.idCardMain}>Add your ID card</Text>
                                    <Text style={styles.idCardTime}>5 minutes</Text>
                                    <Text style={styles.idCardDes}>We need to confirm your identity. Please upload a picture of your ID such as your license or passport. You’ll need to take a photo of the front and back side.</Text>
                                </View>
                            </Content>
                            <View
                                style={styles.idCardBtns}>
                                <Text style={styles.idCardBtnTitle}>Front side photo</Text>
                                {this.state.pictureTaken ?
                                    <View style={styles.idViewWrap}>
                                        <Image
                                            style={styles.idCardImg}
                                            resizeMode={'cover'}
                                            source={require('../../assets/images/id-card-sample.png')}/>
                                        <Button
                                            style={styles.retakeBtn}
                                            transparent>
                                            <Text uppercase={false} style={styles.retakeText}>Retake photo</Text>
                                        </Button>
                                    </View>
                                    :
                                    <Button
                                        style={styles.idSideBtn}
                                        onPress={this.cardUploadOpen}
                                        transparent>
                                        <Text uppercase={false} style={styles.idSideText}>Add front side photo</Text>
                                        <AntIcons name={"pluscircle"} size={24} color={Colors.colors.primaryIcon}/>
                                    </Button>}
                                <Text style={styles.idCardBtnTitle}>Front back photo</Text>
                                {this.state.pictureTaken ?
                                    <View style={styles.idViewWrap}>
                                        <Image
                                            style={styles.idCardImg}
                                            resizeMode={'cover'}
                                            source={require('../../assets/images/id-card-sample.png')}/>
                                        <Button
                                            style={styles.retakeBtn}
                                            transparent>
                                            <Text uppercase={false} style={styles.retakeText}>Retake photo</Text>
                                        </Button>
                                    </View>
                                    :
                                    <Button
                                        style={styles.idSideBtn}
                                        transparent>
                                        <Text uppercase={false} style={styles.idSideText}>Add back side photo</Text>
                                        <AntIcons name={"pluscircle"} size={24} color={Colors.colors.primaryIcon}/>
                                    </Button>}
                            </View>
                            <Modal
                                backdropPressToClose={true}
                                backdropColor={Colors.colors.overlayBg}
                                backdropOpacity={1}
                                onClosed={this.cardUploadClose}
                                style={{
                                    ...CommonStyles.styles.commonModalWrapper,
                                    maxHeight: 315
                                }}
                                entry={"bottom"}
                                position={"bottom"} ref={"cardUploadOption"} swipeArea={100}>
                                <View style={{...CommonStyles.styles.commonSwipeBar}}
                                      {...addTestID('swipeBar')}
                                />
                                <Content showsVerticalScrollIndicator={false}>
                                    <Text style={styles.idDrawerTitle}>ID card - front side</Text>
                                    <View style={styles.singleOption}>
                                        <TransactionSingleActionItem
                                            title={'Take a photo'}
                                            iconBackground={Colors.colors.white}
                                            renderIcon={(size, color) =>
                                                <FeatherIcons size={24} color={Colors.colors.primaryIcon}
                                                              name="camera"/>
                                            }
                                        />
                                    </View>
                                    <View style={styles.singleOption}>
                                        <TransactionSingleActionItem
                                            title={'Select from gallery'}
                                            iconBackground={Colors.colors.secondaryColorBG}
                                            renderIcon={(size, color) =>
                                                <FeatherIcons size={24} color={Colors.colors.secondaryIcon}
                                                              name="image"/>
                                            }
                                        />
                                    </View>
                                </Content>
                            </Modal>
                        </Container>
                    </CustomOverlay>
                )
            }
            case 'education' : {
                return (
                    <CustomOverlay
                        // containerStyle={styles.overlayBG}
                        childrenWrapperStyle={styles.fullOverlay}
                        visible={!this.props.chat.chatPaused}
                        onClose={this.minimizePopup}
                        // closeOnTouchOutside
                    >
                        {
                            this.state.educationRead ? this.renderEducationCompleted(): this.renderEducationReadingOptions(hasEducation, isArticleCompleted)
                        }
                    </CustomOverlay>
                )
            }
            case 'rating-scale': {
                return (
                    <CustomOverlay
                        // containerStyle={styles.overlayBG}
                        childrenWrapperStyle={styles.fullOverlay}
                        visible={!this.props.chat.chatPaused}
                        onClose={this.minimizePopup}
                        // closeOnTouchOutside
                    >
                        <Container style={styles.blockBg}>
                            <Header transparent style={styles.header}>
                                <StatusBar
                                    backgroundColor="transparent"
                                    barStyle="dark-content"
                                    translucent
                                />
                                <Left>
                                    <Button transparent
                                            style={styles.backBtn}
                                            onPress={this.minimizePopup}
                                    >
                                        <EntypoIcons size={24} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                                        <Text uppercase={false} style={styles.backBtnText}>Back</Text>
                                    </Button>
                                </Left>
                                <Right>
                                    <Button transparent
                                            style={styles.crossBtn}
                                            onPress={this.minimizePopup}
                                    >
                                        <AntIcons size={24} color={Colors.colors.mainBlue} name="close"/>
                                    </Button>
                                </Right>
                            </Header>
                            <Content>
                                <View style={styles.sliderWrap}>
                                    <Text style={styles.sliderMainText}>{this.props.message.text}</Text>
                                    <Image
                                        style={styles.sliderAlfie}
                                        source={require('../../assets/images/slider-alfie.png')}/>
                                    <Text style={styles.sliderValue}>{this.state.selectedRating}</Text>
                                    <View style={styles.sliderBox}>
                                        <Slider
                                            onValueChange={(rating)=>{
                                                this.setState({
                                                    selectedRating: rating
                                                })
                                            }}
                                            minimumValue={this.props.message.ratingScale.values[0]}
                                            maximumValue={this.props.message.ratingScale.values[this.props.message.ratingScale.values.length-1]}
                                            step={1}
                                            value={this.state.selectedRating}
                                            animateTransitions={true}
                                            allowTouchTrack={true}
                                            minimumTrackTintColor={Colors.colors.secondaryIcon}
                                            trackStyle={{ height: 8, borderRadius: 8, backgroundColor: Colors.colors.highContrastBG }}
                                            // thumbStyle={{}}
                                            thumbProps={{
                                                children: (
                                                    <Image
                                                        style={styles.sliderIndicator}
                                                        source={require('../../assets/images/slider-indi.png')}/>
                                                ),
                                            }}
                                        />
                                        <View style={styles.RangeValues}>
                                            <Text style={styles.minValue}>{this.props.message.ratingScale.lowLabel}</Text>
                                            <Text style={styles.maxValue}>{this.props.message.ratingScale.highLabel}</Text>
                                        </View>
                                    </View>
                                </View>
                            </Content>
                            <View
                                style={styles.noGreBtn}>
                                <PrimaryButton
                                    text="Continue"
                                    onPress={()=>{
                                        this.props.onSend([{text: this.state.selectedRating+'', type: 'message'}]);
                                    }}
                                />
                            </View>
                        </Container>
                    </CustomOverlay>
                );
            }
            case 'provider-prompt': {
                return (
                    <CustomOverlay
                        // containerStyle={styles.overlayBG}
                        childrenWrapperStyle={styles.fullOverlay}
                        visible={!this.props.chat.chatPaused}
                        onClose={this.minimizePopup}
                        // closeOnTouchOutside
                    >
                        <Container style={styles.blockBg}>
                            <Header transparent style={styles.header}>
                                <StatusBar
                                    backgroundColor="transparent"
                                    barStyle="dark-content"
                                    translucent
                                />
                                <Left>
                                    <Button transparent
                                            style={styles.backBtn}
                                            onPress={this.minimizePopup}
                                    >
                                        <EntypoIcons size={24} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                                        <Text uppercase={false} style={styles.backBtnText}>Back</Text>
                                    </Button>
                                </Left>
                                <Right>
                                    <Button transparent
                                            style={styles.crossBtn}
                                            onPress={this.minimizePopup}
                                    >
                                        <AntIcons size={24} color={Colors.colors.mainBlue} name="close"/>
                                    </Button>
                                </Right>
                            </Header>
                            <Content>
                                <View style={styles.clinicalWrap}>
                                    <Text style={styles.clinicalMain}>Get introduced to
                                        our clinical team:</Text>
                                    <Image
                                        style={styles.clinicalImg}
                                        resizeMode={'contain'}
                                        source={require('../../assets/images/clinical-team-bot.png')}/>
                                    <Text numberOfLines={4} style={styles.clinicalDes}>Our team includes a range of professionals, including nurse practitioners, social workers, coaches, and matchmakers.</Text>
                                </View>
                            </Content>
                            <View
                                style={styles.noGreBtn}>
                                <Button
                                    style={styles.noTimeBtn}
                                    transparent
                                    onPress={()=>{
                                        this.fetchNext();
                                    }}
                                >
                                    <Text uppercase={false} style={styles.noTimeText}>I don’t have time right now</Text>
                                </Button>
                                <PrimaryButton
                                    onPress={ async ()=>{
                                        //this.educationDrawerOpen()
                                        await this.minimizePopup();
                                        this.props.navigateToNextScreen('PROVIDERS_LIST', this.props.message.attachments[0].content.popupText);
                                    }}
                                    text="Get introduced"
                                />
                            </View>
                            <Modal
                                backdropPressToClose={true}
                                backdropColor={Colors.colors.overlayBg}
                                backdropOpacity={1}
                                onClosed={this.educationDrawerClose}
                                style={{
                                    ...CommonStyles.styles.commonModalWrapper, paddingTop: 0,
                                    maxHeight: '90%'
                                }}
                                entry={"bottom"}
                                position={"bottom"} ref={"educationDrawerOption"} swipeArea={100}>
                                <Header transparent style={styles.headerModal}>
                                    <Left>
                                        <Button transparent
                                                style={styles.backBtn}
                                                onPress={this.educationDrawerClose}
                                        >
                                            <EntypoIcons size={24} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                                        </Button>
                                    </Left>
                                    <Right>
                                        <Button transparent
                                                style={styles.crossBtn}
                                        >
                                            <Text uppercase={false} style={styles.doneText}>I’m done</Text>
                                        </Button>
                                    </Right>
                                </Header>
                                <Content showsVerticalScrollIndicator={false}>
                                    {/*provider list*/}
                                    <Text>Clinical team list will be here</Text>
                                </Content>
                            </Modal>
                        </Container>
                    </CustomOverlay>
                );
            }
            case 'filtered-providers': {
                return (
                    <CustomOverlay
                        // containerStyle={styles.overlayBG}
                        childrenWrapperStyle={styles.fullOverlay}
                        visible={!this.props.chat.chatPaused}
                        onClose={this.minimizePopup}
                        // closeOnTouchOutside
                    >
                        <Container style={styles.blockBg}>
                            <Header transparent style={styles.header}>
                                <StatusBar
                                    backgroundColor="transparent"
                                    barStyle="dark-content"
                                    translucent
                                />
                                <Left>
                                    <Button transparent
                                            style={styles.backBtn}
                                            onPress={this.minimizePopup}
                                    >
                                        <EntypoIcons size={24} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                                        <Text uppercase={false} style={styles.backBtnText}>Back</Text>
                                    </Button>
                                </Left>
                                <Right>
                                    <Button transparent
                                            style={styles.crossBtn}
                                            onPress={this.minimizePopup}
                                    >
                                        <AntIcons size={24} color={Colors.colors.mainBlue} name="close"/>
                                    </Button>
                                </Right>
                            </Header>
                            <Content>
                                <View style={styles.clinicalWrap}>
                                    <Text style={styles.clinicalMain}>Connect with a {this.props.message.attachments[0].content.popupText ? this.props.message.attachments[0].content.popupText : 'Provider'}</Text>
                                    <Image
                                        style={styles.coachImg}
                                        resizeMode={'contain'}
                                        source={require('../../assets/images/coach-bot.png')}/>
                                    {this.renderText(this.props.message.text, styles.clinicalDes)}
                                </View>
                            </Content>
                            <View
                                style={styles.noGreBtn}>
                                <Button
                                    style={styles.noTimeBtn}
                                    transparent
                                    onPress={()=>{
                                        this.fetchNext();
                                    }}
                                >
                                    <Text uppercase={false} style={styles.noTimeText}>{this.state.filteredProvidersConnected?`Continue Chatbot`: `I don’t have time right now`}</Text>
                                </Button>
                                <PrimaryButton
                                    onPress={async ()=>{
                                        setTimeout(()=>{
                                            this.setState({
                                                filteredProvidersConnected: true
                                            });
                                        }, 1000);
                                        this.props.navigateToNextScreen('FILTERED_PROVIDER_LIST', this.props.message.attachments[0].content.popupText);
                                    }}
                                    text="Connect"
                                />
                            </View>
                            <Modal
                                backdropPressToClose={true}
                                backdropColor={Colors.colors.overlayBg}
                                backdropOpacity={1}
                                onClosed={this.educationDrawerClose}
                                style={{
                                    ...CommonStyles.styles.commonModalWrapper, paddingTop: 0,
                                    maxHeight: '90%'
                                }}
                                entry={"bottom"}
                                position={"bottom"} ref={"educationDrawerOption"} swipeArea={100}>
                                <Header transparent style={styles.headerModal}>
                                    <Left>
                                        <Button transparent
                                                style={styles.backBtn}
                                                onPress={this.educationDrawerClose}
                                        >
                                            <EntypoIcons size={24} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                                        </Button>
                                    </Left>
                                    <Right>
                                        <Button transparent
                                                style={styles.crossBtn}
                                        >
                                            <Text uppercase={false} style={styles.doneText}>I’m done</Text>
                                        </Button>
                                    </Right>
                                </Header>
                                <Content showsVerticalScrollIndicator={false}>
                                    {/*Coach team list*/}
                                    <Text>Coach team list will be here</Text>
                                </Content>
                            </Modal>
                        </Container>
                    </CustomOverlay>
                );
            }
            case 'telehealth-services': {
                return (
                    <CustomOverlay
                        // containerStyle={styles.overlayBG}
                        childrenWrapperStyle={styles.fullOverlay}
                        visible={!this.props.chat.chatPaused}
                        onClose={this.minimizePopup}
                        // closeOnTouchOutside
                    >
                        <Container style={styles.blockBg}>
                            <Header transparent style={styles.header}>
                                <StatusBar
                                    backgroundColor="transparent"
                                    barStyle="dark-content"
                                    translucent
                                />
                                <Left>
                                    <Button transparent
                                            style={styles.backBtn}
                                            onPress={this.minimizePopup}
                                    >
                                        <EntypoIcons size={24} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                                        <Text uppercase={false} style={styles.backBtnText}>Back</Text>
                                    </Button>
                                </Left>
                                <Right>
                                    <Button transparent
                                            style={styles.crossBtn}
                                            onPress={this.minimizePopup}
                                    >
                                        <AntIcons size={24} color={Colors.colors.mainBlue} name="close"/>
                                    </Button>
                                </Right>
                            </Header>
                            <Content>
                                <View style={styles.clinicalWrap}>
                                    <Text style={styles.clinicalMain}>Learn more about our
                                        clinical services</Text>
                                    <Image
                                        style={styles.clinicalImg}
                                        resizeMode={'contain'}
                                        source={require('../../assets/images/clinical-service-bot.png')}/>
                                    <Text numberOfLines={4} style={styles.clinicalDes}>You can access prescriptions, therapy, coaching, family support, and much more through the Confidant Health app. Check it out.</Text>
                                </View>
                            </Content>
                            <View
                                style={styles.noGreBtn}>
                                <Button
                                    style={styles.noTimeBtn}
                                    transparent
                                    onPress={()=>{
                                        this.fetchNext();
                                    }}
                                >
                                    <Text uppercase={false} style={styles.noTimeText}>{this.state.filteredProvidersConnected?'Continue Chatbot': 'I don’t have time right now'}</Text>
                                </Button>
                                <PrimaryButton
                                    onPress={()=>{
                                        setTimeout(()=>{
                                            this.setState({
                                                filteredProvidersConnected: true
                                            });
                                        }, 1000);
                                        this.props.navigateToNextScreen('SERVICES_LIST', null);
                                    }}
                                    text="Learn more"
                                />
                            </View>
                            <Modal
                                backdropPressToClose={true}
                                backdropColor={Colors.colors.overlayBg}
                                backdropOpacity={1}
                                onClosed={this.educationDrawerClose}
                                style={{
                                    ...CommonStyles.styles.commonModalWrapper, paddingTop: 0,
                                    maxHeight: '90%'
                                }}
                                entry={"bottom"}
                                position={"bottom"} ref={"educationDrawerOption"} swipeArea={100}>
                                <Header transparent style={styles.headerModal}>
                                    <Left>
                                        <Button transparent
                                                style={styles.backBtn}
                                                onPress={this.educationDrawerClose}
                                        >
                                            <EntypoIcons size={24} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                                        </Button>
                                    </Left>
                                    <Right>
                                        <Button transparent
                                                style={styles.crossBtn}
                                        >
                                            <Text uppercase={false} style={styles.doneText}>I’m done</Text>
                                        </Button>
                                    </Right>
                                </Header>
                                <Content showsVerticalScrollIndicator={false}>
                                    {/*services list*/}
                                    <Text>Clinical services list will be here</Text>
                                </Content>
                            </Modal>
                        </Container>
                    </CustomOverlay>
                );
            }
            default: {
                return <View/>;
            }
        }
    };

    componentWillUnmount(): void {
        this.stopTimer();
        this.timer = null;
        AppState.removeEventListener('change', this._handleAppState);
        this.keyboardDidHideListener.remove();
        this.keyboardDidShowListener.remove();
    }

    renderEducationCompleted = ()=>{
        return (
            <Container style={styles.blockBg}>
                <Header transparent style={styles.header}>
                    <StatusBar
                        backgroundColor="transparent"
                        barStyle="dark-content"
                        translucent
                    />
                    <Left>
                        <Button transparent
                                style={styles.backBtn}
                                onPress={this.minimizePopup}
                        >
                            <EntypoIcons size={24} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                            <Text uppercase={false} style={styles.backBtnText}>Back</Text>
                        </Button>
                    </Left>
                    <Right>
                        <Button transparent
                                style={styles.crossBtn}
                                onPress={this.minimizePopup}
                        >
                            <AntIcons size={24} color={Colors.colors.mainBlue} name="close"/>
                        </Button>
                    </Right>
                </Header>
                <Content>
                    <View style={styles.lessonWrap}>
                        <View style={styles.alfieCompletedWrap}>
                            <LottieView
                                ref={animation => {
                                    this.animation = animation;
                                }}
                                style={styles.alfieCompleted}
                                resizeMode="cover"
                                source={alfieFace}
                                autoPlay={true}
                                loop
                            />
                        </View>
                        <Text style={styles.lessonMainText}>Awesome, you just learned something new!</Text>
                        <Text style={styles.lessonSubText}>If you want to access this article again later you can come back to it at any time, or check it out in the Learning Library later.</Text>
                    </View>
                </Content>
                <View
                    style={styles.noGreBtn}>
                    <PrimaryButton
                        text="Continue"
                        onPress={()=>{
                            this.props.onSend([{text: 'Continue', type: 'message'}]);
                        }}
                    />
                </View>
            </Container>
        );
    };

    renderEducationReadingOptions = (hasEducation, isCompleted)=>{
        return (
            <Container style={styles.blockBg}>
                <Header transparent style={styles.header}>
                    <StatusBar
                        backgroundColor="transparent"
                        barStyle="dark-content"
                        translucent
                    />
                    <Left>
                        <Button transparent
                                style={styles.backBtn}
                                onPress={this.minimizePopup}
                        >
                            <EntypoIcons size={24} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                            <Text uppercase={false} style={styles.backBtnText}>Back</Text>
                        </Button>
                    </Left>
                    <Right>
                        <Button transparent
                                style={styles.crossBtn}
                                onPress={this.minimizePopup}
                        >
                            <AntIcons size={24} color={Colors.colors.mainBlue} name="close"/>
                        </Button>
                    </Right>
                </Header>
                <Content>
                    <View style={styles.educationWrap}>
                        <Image
                            style={styles.educationImg}
                            source={require('../../assets/images/bot-education.png')}/>
                        <Text style={styles.educationMain}>{this.props.message.text}</Text>
                        {hasEducation && this.props.message?.attachments?.[0]?.content?.contentfulData?.contentLengthduration && (
                          <Text style={styles.educationTime}>{`${this.props.message?.attachments[0]?.content?.contentfulData?.contentLengthduration} read`}</Text>
                        )}
                        <Text numberOfLines={4} style={styles.educationDes}>{hasEducation?this.props.message?.attachments[0]?.content.contentfulData?.title: 'Content Unavailable'}</Text>
                    </View>
                </Content>
                <View
                    style={styles.noGreBtn}>
                    <Button
                        style={styles.noTimeBtn}
                        onPress={()=>{
                            this.props.onSend([{text: 'I’m not interested', type: 'message'}]);
                        }}
                        transparent>
                        <Text uppercase={false} style={styles.noTimeText}>I’m not interested</Text>
                    </Button>
                    {
                        hasEducation && (
                            <View style={{ marginBottom: 16 }}>
                                <PrimaryButton
                                    bgColor={Colors.colors.primaryColorBG}
                                    textColor={Colors.colors.primaryText}
                                    onPress={()=>{
                                        this.props.onSend([{text: 'Read later', type: 'message'}]);
                                    }}
                                    text="Read later"
                                />
                            </View>
                        )
                    }

                    <PrimaryButton
                        onPress={hasEducation?this.educationDrawerOpen:()=>{
                            this.props.onSend([{text: 'Continue', type: 'message'}]);
                        }}
                        text={hasEducation?`Read now`:'Continue'}
                    />
                </View>
                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.educationDrawerClose}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper, paddingTop: 0,
                        maxHeight: '90%'
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"educationDrawerOption"} swipeArea={100}>

                    <Header transparent style={styles.headerModal}>
                        <Left>
                            <Button transparent
                                    style={styles.backBtn}
                                    onPress={this.educationDrawerClose}
                            >
                                <EntypoIcons size={24} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                            </Button>
                        </Left>
                        <Right>
                            {/*<Button transparent*/}
                            {/*        style={styles.crossBtn}*/}
                            {/*>*/}
                            {/*    <FeatherIcons size={24} color={Colors.colors.mainBlue} name="more-horizontal"/>*/}
                            {/*</Button>*/}
                        </Right>
                    </Header>
                    <EducationalPieceComponent
                        entryId={this.props?.message?.attachments[0]?.content?.educationContentSlug}
                        educationOrder={null}
                        isLoading={this.props.educational.isLoading}
                        completedArticles={this.props.profile.markAsCompleted}
                        bookmarkedArticles={this.props.profile.bookmarked}
                        bookmarkContent={this.bookmarkContent}
                        captureFeedback={()=>{}}
                        isProviderApp={false}
                        markContentAsComplete={()=>{}}
                        fromRecommendedContent={true}
                        fromFavouriteContent={true}
                        shareToSocialNetworks={this.shareEducationalContentToSocialNetworks}
                        // navigation={this.props.navigation}
                        goBack={() => {
                            // this.props.navigation.goBack();
                        }}
                        insideChatbot
                        // initiateSegmentCall={this.sendEducationEventToSegment}
                    />
                    {/*<Content showsVerticalScrollIndicator={false}>*/}
                    {/*    <Text style={styles.idDrawerTitle}>What are opioids?</Text>*/}
                    {/*    <Text>Educational content block</Text>*/}
                    {/*</Content>*/}
                    {
                        !this.props.educational.isLoading && (

                            <View
                                style={styles.greBtnModal}>
                                <PrimaryButton
                                    text={isCompleted?'Continue':'Mark as complete'}
                                    onPress={()=>{
                                        if(!isCompleted) {
                                            this.markContentAsComplete(this.props.message.educationSlug,
                                                this.props.message.attachments[0].content.contentfulData.title);
                                        }
                                        this.educationDrawerClose();
                                        this.setState({
                                            educationRead: true
                                        });
                                    }}
                                />
                            </View>
                        )
                    }
                </Modal>
            </Container>
        )
    }


    shareEducationalContentToSocialNetworks = async (channel, content) => {
        const category = this.category;
        const topic = this.topic;
        content = {...content, category, topic};

        await Analytics.track(SEGMENT_EVENT.APP_SHARED,{
            userId : this.props.auth.meta.userId,
            screenName: 'Chatbot',
        });

        await DeepLinksService.shareEducationalContentPiece(channel, content);
    };

    bookmarkContent = async (isBookmarked, entryId, entryTitle) => {
        const markInfo = {
            slug: entryId,
            shouldMark: !isBookmarked,
        };
        if (!isBookmarked) {
            //only send segment event if bookmark value is false
            await Analytics.track(SEGMENT_EVENT.EDUCATION_BOOKMARKED, {
                educationName: entryTitle,
                userId: this.props.auth.meta.userId,
                bookmarkedAt: moment.utc(Date.now()).format(),
            });
        }
        this.props.bookmarkContent(markInfo);
    };

    markContentAsComplete = (entryId, entryTitle) => {
        Analytics.track(SEGMENT_EVENT.EDUCATION_MARKED_AS_READ, {
            educationName: entryTitle,
            userId: this.props.auth.meta.userId,
            markedReadAt: moment.utc(Date.now()).format(),
        })
        this.props.markAsCompletedContent({slug: entryId});
    };

    _handleAppState = () => {
        if (this.state.appState === 'active') {
            if (this.animation) {
                this.animation.play();
            }
        }
    };

    minimizePopup = () => {
        let contentType =
            this.props.message &&
            this.props.message.attachments &&
            this.props.message.attachments.length &&
            this.props.message.attachments[0].contentType;
        if (this.state.timeRemaining > 0 || contentType !== 'provider-message') {
            this.stopTimer();
            this.props.chatPaused();
        }

    };
}

const styles = StyleSheet.create({
    blockBg: {
        backgroundColor: Colors.colors.screenBG
    },
    header: {
        height: HEADER_SIZE,
        paddingLeft: 18,
        paddingRight: 18,
        paddingTop: 0
    },
    backBtn: {
        alignItems: 'center',
        paddingLeft: 0,
        paddingTop: 0
    },
    backBtnText: {
        ...TextStyles.mediaTexts.linkTextM,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.primaryText
    },
    crossBtn: {
        paddingRight: 10,
        paddingTop: 0
    },
    textWrap: {
        paddingHorizontal: 24,
        marginBottom: 32
    },
    optionList: {
        paddingHorizontal: 24,
        paddingBottom: 30
    },
    paymentWrapper: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'rgba(0,0,0, 0.15)',
        borderRadius: 80,
        elevation: 0,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 40,
        shadowOpacity: 1.0,
        shadowColor: 'rgba(0,0,0, 0.10)',
        marginBottom: 30,
        marginTop: 20,
        backgroundColor: '#fff',
        alignSelf: 'center',
    },
    paymentImg: {
        width: 100
    },
    paymentMainText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        lineHeight: 36,
        letterSpacing: 1,
        color: '#25345C',
        textAlign: 'center',
        marginBottom: 16
    },
    activityImg: {
        marginBottom: 20,
        alignSelf: 'center'
    },
    activityMainText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 20,
        lineHeight: 30,
        letterSpacing: 0.83,
        color: '#25345C',
        textAlign: 'center',
        marginBottom: 16
    },
    activitySubText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0.34,
        color: '#646C73',
        textAlign: 'center'
    },
    singleActivityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
        paddingTop: 16,
        paddingBottom: 16
    },
    activityDarkText: {
        fontFamily: 'Roboto-Bold',
        fontSize: 13,
        lineHeight: 14,
        letterSpacing: 0.28,
        fontWeight: '500',
        color: '#25345C',
    },
    activityLightText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        lineHeight: 14,
        letterSpacing: 0.28,
        fontWeight: '300',
        color: '#515D7D',
    },
    buttonBlock: {
        marginTop: 40
    },
    activityOutlineBtn: {
        borderColor: '#3fb2fe',
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: '#fff',
        height: 48,
        justifyContent: 'center',
        elevation: 0,
    },
    activityOutlineBtnText: {
        color: '#3fb2fe',
        fontSize: 13,
        letterSpacing: 0.7,
        lineHeight: 19.5,
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    innerTimer: {
        fontFamily: 'Roboto-Regular',
        fontSize: 22,
        lineHeight: 35,
        letterSpacing: 0.8,
        color: '#3fb2fe',
        textAlign: 'center',
    },
    gestureArea: {
        padding: 24,
        // backgroundColor: 'red',
        width: '100%',
        alignItems: 'center',
        // height: 72,
    },
    swipeBar: {
        backgroundColor: '#f5f5f5',
        width: 80,
        height: 4,
        borderRadius: 2,
        top: -38,
    },
    arrowBtn: {
        paddingTop: 0,
        paddingBottom: 0,
        height: 25,
        marginBottom: 25,
        justifyContent: 'center',
        width: 80,
        marginTop: 0
    },
    arrowIcon: {
        marginTop: -7
    },
    proWrapper: {
        padding: 24
    },
    alfieWrapper: {
        width: 56,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: Colors.colors.primaryColorBG,
        borderRadius: 25,
        marginBottom: 16,
        backgroundColor: Colors.colors.primaryColorBG
    },
    alfie: {
        width: 48,
        height: 48,
    },
    timerWrapper: {
        alignItems: 'center',
        paddingBottom: isIphoneX() ? 40 : 24,
    },
    proQuestion: {
        fontFamily: 'Roboto-Regular',
        fontSize: 17,
        lineHeight: 18,
        letterSpacing: 0.8,
        color: '#25345c',
        textAlign: 'center',
        marginBottom: 20,
        paddingLeft: 20,
        paddingRight: 20,
    },
    proHint: {
        ...TextStyles.mediaTexts.bodyTextM,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast,
        textAlign: 'left',
        marginBottom: 24
    },
    inputHead: {
        ...TextStyles.mediaTexts.TextH4,
        ...TextStyles.mediaTexts.serifProBold,
        color: Colors.colors.highContrast,
        textAlign: 'center',
        marginBottom: 8,
        paddingLeft: 24,
        paddingRight: 24,
        marginTop: 40
    },
    inputDes: {
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.lowContrast,
        textAlign: 'center',
        marginBottom: 24,
        paddingLeft: 24
    },
    inputRow: {
        borderColor: Colors.colors.borderColor,
        borderTopWidth: 0.5,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    inputSelf: {
        borderColor: Colors.colors.borderColor,
        borderWidth: 1,
        borderRadius: 8,
        height: 64,
        ...TextStyles.mediaTexts.inputText,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast,
        paddingLeft: 16,
    },
    timerCircle: {
        marginBottom: 10,
        marginTop: 10,
    },
    skipText: {
        ...TextStyles.mediaTexts.linkTextM,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.primaryText,
        textAlign: 'center',
        lineHeight: 20,
    },
    overlayBG: {
        backgroundColor: 'rgba(37,52,92,0.3)',
        zIndex: -1,
    },
    responseWrapper: {
        height: 'auto',
        // paddingLeft: 20,
        // paddingRight: 20,
        padding: 0,
        alignSelf: 'center',
        position: 'absolute',
        bottom: 0,
        paddingBottom: isIphoneX() ? 12 : 0,
        left: 0,
        right: 0,
        borderTopColor: '#f5f5f5',
        borderTopWidth: 0.5,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    fullOverlay: {
        padding: 0,
        // paddingTop: isIphoneX() ? 30 : 10,
        position: 'absolute',
        bottom: 0,
        top: 0,
        // paddingBottom: isIphoneX() ? 50 : 30,
        left: 0,
        right: 0,
    },
    multiWrapper: {
        height: 'auto',
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 24,
        alignSelf: 'center',
        position: 'absolute',
        bottom: 0,
        paddingBottom: isIphoneX() ? 50 : 30,
        left: 0,
        right: 0,
        borderTopColor: '#f5f5f5',
        borderTopWidth: 0.5,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    SSQuestion: {
        ...TextStyles.mediaTexts.TextH4,
        ...TextStyles.mediaTexts.serifProBold,
        color: Colors.colors.highContrast,
        textAlign: 'left',
        alignSelf: 'flex-start',
        marginBottom: 8
    },
    MainHeadingPopup: {
        fontFamily: 'Roboto-Regular',
        fontSize: 18,
        lineHeight: 25,
        letterSpacing: 0.34,
        color: '#7D859D',
        textAlign: 'center',
        marginBottom: 8,
        paddingLeft: 64,
        paddingRight: 64,
        fontWeight: '700',
        paddingBottom:20
    },

    MainParaPopup: {
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        lineHeight: 25,
        letterSpacing: 0.34,
        color: '#7D859D',
        textAlign: 'center',
        marginBottom: 8,
        paddingLeft: 64,
        paddingRight: 64,
        fontWeight: '700',
        paddingBottom:20


    },
    BookAppText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        lineHeight: 25,
        letterSpacing: 0.34,
        color: '#8c8f98',
        textAlign: 'center',
        marginBottom: 18,
        fontWeight: '700',
    },
    SSHint: {
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.lowContrast
    },
    SSWrapper: {
        maxHeight: 310,
        width: '100%'
    },
    multiList: {
        borderWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.colors.mediumContrastBG,
        backgroundColor: Colors.colors.white,
        marginLeft: 0,
        paddingLeft: 16,
        paddingTop: 20,
        paddingBottom: 20,
        paddingRight: 16,
        marginBottom: 8,
        borderRadius: 8
    },
    multiListSelected: {
        borderColor: Colors.colors.mainBlue40,
        backgroundColor: Colors.colors.primaryColorBG
    },
    multiListText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
        paddingRight: 10,
        flex: 1,
    },
    multiTextSelected: {
        fontFamily: 'Roboto-Regular',
        fontWeight: '600',
        fontSize: 15,
        letterSpacing: 0.3,
        color: '#3fb2fe',
    },
    multiRadio: {
        width: 22,
        height: 21,
        borderWidth: 1,
        borderColor: '#ebebeb',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 4
    },
    multiRadioSelected: {
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

    multiCheck: {
        width: 32,
        height: 32,
        borderWidth: 1,
        borderColor: Colors.colors.mediumContrastBG,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 4
    },
    multiCheckSelected: {
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.colors.mainBlue,
        color: Colors.colors.mainBlue
    },
    optionContainer: {
        maxHeight: 300,
        marginTop: 10,
        paddingLeft: 10,
        flex: 0,
        flexShrink: 1,
        flexGrow: 0,
    },

    singleSelectBtn: {
        paddingTop: 10,
        paddingBottom: 10,
        borderColor: '#3fb2fe',
        borderWidth: 1,
        // flex: 1,
        width: '100%',
        minWidth: 150,
        margin: 7,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        overflow: 'hidden',
        height: 'auto',
        minHeight: 48,
    },

    multiSelectBtn: {
        borderColor: 'transparent',
        borderWidth: 1.5,
        justifyContent: 'center',
        paddingTop: 0,
        paddingBottom: 0,
        height: 'auto',
        marginBottom: 8,
        minWidth: 200,
        maxWidth: '85%',
    },
    notSelected: {
        borderColor: '#4FACFE',
        borderWidth: 1.5,
        justifyContent: 'center',
        paddingTop: 0,
        paddingBottom: 0,
        height: 'auto',
        marginBottom: 8,
        minWidth: 200,
        maxWidth: '85%',
    },
    buttonBG: {
        borderRadius: 2,
        flex: 1,
        // height: 50,
        justifyContent: 'center',
        minWidth: 130,
        maxWidth: '65%',
        paddingTop: 12,
        paddingBottom: 12,
    },
    buttonBGMulti: {
        borderRadius: 2,
        flex: 1,
        // height: 50,
        justifyContent: 'center',
        // width: 200,
        paddingTop: 12,
        paddingBottom: 12,
    },
    buttonText: {
        color: '#3fb2fe',
        fontSize: 14,
        letterSpacing: 0.3,
        lineHeight: 21,
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        textTransform: 'capitalize',
        textAlign: 'center',
    },
    multiText: {
        color: '#3fb2fe',
        fontSize: 14,
        fontFamily: 'OpenSans-Regular',
        paddingLeft: 20,
    },
    whiteText: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: 'OpenSans-Regular',
        paddingLeft: 20,
    },
    submitBtn: {
        marginLeft: 24,
        marginRight: 24,
        marginBottom: isIphoneX() ? 12 : 0,
    },
    submitGre: {
        flex: 1,
        height: 48,
        borderRadius: 4,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    multiSubmitText: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        fontSize: 13,
        letterSpacing: 0.7,
        lineHeight: 19.5,
        textAlign: 'center',
        color: '#fff',
        textTransform: 'uppercase',
    },
    clearBtn: {
        // width: 200,
        paddingLeft: 20,
        paddingRight: 20,
        alignSelf: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    clearBtnText: {
        color: '#4FACFE',
        textDecorationLine: 'underline',
        fontSize: 12,
        textAlign: 'center',
    },
    alreadyAddedFundsText: {
        color: '#4FACFE',
        // textDecorationLine: 'underline',
        fontSize: 15,
        textAlign: 'center',
    },
    dropWrapper: {
        justifyContent: 'flex-end',
        flexDirection: 'row',
    },
    dropdownContainer: {
        maxWidth: '70%',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        borderColor: 'rgba(63, 177, 254, 0.2)',
        borderWidth: 1,
        padding: 13,
        backgroundColor: '#fff',
        marginRight: 15,
        marginBottom: 15,
        flexDirection: 'column',
        alignItems: 'center',
    },
    dropdownText: {
        color: '#25345C',
        fontSize: 16,
        fontWeight: '300',
    },
    twinDropdowns: {
        width: '100%',
    },
    pickerBorder: {
        borderColor: '#E2E5ED',
        borderWidth: 1.5,
        borderRadius: 4,
        width: '100%',
        height: 50,
        justifyContent: 'center',
        marginTop: 10,
    },
    singleDropdown: {
        width: '100%',
    },
    dropdrownSubmit: {
        alignSelf: 'center',
    },

    buttonsWrap: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 24 : 14,
        // textAlign: 'center',
        // alignSelf: 'center',
    },
    gradtbtn: {
        textAlign: 'center',
        alignSelf: 'center',
    },
    selectServiceBtn: {
        paddingTop: 10,
        paddingBottom: 10,
        borderColor: '#3fb2fe',
        borderWidth: 1,
        width: '100%',
        minWidth: 150,
        marginTop: 7,
        marginBottom: 7,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        overflow: 'hidden',
        height: 'auto',
        minHeight: 48,


    },
    starImage: {
        width: '100%',
        height: 300,
        position: 'absolute',
        alignSelf: 'center',
        top:30
    },
    chatbotCompletedWrap: {
        paddingHorizontal: 24,
        paddingVertical: 40,
        justifyContent: 'center'
    },
    chatbotCompletedImg: {
        width: 170,
        height: 160,
        marginBottom: 40,
        alignSelf: 'center'
    },
    chatbotCompletedMainText: {
        ...TextStyles.mediaTexts.TextH3,
        ...TextStyles.mediaTexts.serifProBold,
        color: Colors.colors.highContrast,
        marginBottom: 16,
        textAlign: 'center'
    },
    chatbotCompletedSubText: {
        ...TextStyles.mediaTexts.bodyTextM,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast,
        textAlign: 'center'
    },
    lessonWrap: {
        paddingHorizontal: 24,
        paddingVertical: 40,
        justifyContent: 'center'
    },
    lessonImg: {
        width: 100,
        height: 100,
        marginBottom: 40,
        alignSelf: 'center'
    },
    lessonMainText: {
        ...TextStyles.mediaTexts.TextH3,
        ...TextStyles.mediaTexts.serifProBold,
        color: Colors.colors.highContrast,
        marginBottom: 16,
        textAlign: 'center'
    },
    lessonSubText: {
        ...TextStyles.mediaTexts.bodyTextM,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast,
        paddingHorizontal: 24,
        textAlign: 'center'
    },
    noTimeBtn: {
        marginBottom: 16,
        alignSelf: 'center'
    },
    noTimeText: {
        ...TextStyles.mediaTexts.linkTextM,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.primaryText,
        textAlign: 'center'
    },
    idCardWrap: {
        padding: 24
    },
    idCardMain: {
        ...TextStyles.mediaTexts.TextH3,
        ...TextStyles.mediaTexts.serifProBold,
        color: Colors.colors.highContrast,
        marginBottom: 4
    },
    idCardTime: {
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.lowContrast,
        marginBottom: 16
    },
    idCardDes: {
        ...TextStyles.mediaTexts.bodyTextM,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast
    },
    idCardBtns: {
        padding: 24,
        paddingBottom: isIphoneX() ? 34 : 24
    },
    idCardBtnTitle: {
        ...TextStyles.mediaTexts.subTextM,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast,
        marginBottom: 16,
        marginTop: 24
    },
    idSideBtn: {
        marginBottom: 8
    },
    idSideText: {
        ...TextStyles.mediaTexts.linkTextM,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.primaryText,
    },
    idViewWrap: {
        backgroundColor: Colors.colors.mediumContrastBG,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8
    },
    idCardImg: {
        width: 89,
        height: 64,
        borderRadius: 4
    },
    retakeBtn: {

    },
    retakeText: {
        ...TextStyles.mediaTexts.linkTextM,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.primaryText,
        paddingLeft: 32
    },
    idDrawerTitle: {
        ...TextStyles.mediaTexts.TextH3,
        ...TextStyles.mediaTexts.serifProBold,
        color: Colors.colors.highContrast,
        marginBottom: 40
    },
    headerModal: {
        paddingTop: 0,
        paddingLeft: 0,
        paddingRight: 0,
    },
    educationWrap: {
        padding: 24,
        alignItems: 'center'
    },
    educationImg: {
        width: 100,
        height: 74,
        alignSelf: 'center',
        marginBottom: 40
    },
    educationMain: {
        ...TextStyles.mediaTexts.TextH3,
        ...TextStyles.mediaTexts.serifProBold,
        color: Colors.colors.highContrast,
        paddingHorizontal: 40,
        marginBottom: 4,
        textAlign: 'center'
    },
    educationTime: {
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.lowContrast,
        marginBottom: 40,
        textAlign: 'center'
    },
    educationDes: {
        ...TextStyles.mediaTexts.bodyTextM,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast,
        textAlign: 'center'
    },
    alfieCompletedWrap: {
        width: 145,
        height: 145,
        borderRadius: 75,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.colors.primaryColorBG,
        alignSelf: 'center',
        marginBottom: 40
    },
    alfieCompleted: {
        width: 135,
        height: 135
    },
    sliderWrap: {
        padding: 24,
        alignItems: 'center'
    },
    sliderMainText: {
        ...TextStyles.mediaTexts.TextH3,
        ...TextStyles.mediaTexts.serifProBold,
        color: Colors.colors.highContrast,
        paddingHorizontal: 24,
        marginTop: 16,
        marginBottom: 40,
        textAlign: 'center'
    },
    sliderAlfie: {
        width: 120,
        height: 134,
        marginBottom: 16
    },
    sliderValue: {
        color: Colors.colors.secondaryIcon,
        ...TextStyles.mediaTexts.TextH1,
        ...TextStyles.mediaTexts.manropeExtraBold,
        textAlign: 'center'
    },
    sliderBox: {
        width: '100%',
        marginTop: 80
    },
    sliderIndicator: {
        marginTop: -2
    },
    RangeValues: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    minValue: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium
    },
    maxValue: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,
        textAlign: 'right'
    },
    clinicalWrap: {
        padding: 24,
        alignItems: 'center'
    },
    clinicalMain: {
        ...TextStyles.mediaTexts.TextH3,
        ...TextStyles.mediaTexts.serifProBold,
        color: Colors.colors.highContrast,
        marginBottom: 24,
        paddingHorizontal: 24,
        textAlign: 'center'
    },
    clinicalDes: {
        ...TextStyles.mediaTexts.bodyTextM,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast,
        paddingHorizontal: 24,
        textAlign: 'center'
    },
    clinicalImg: {
        width: 254,
        height: 120,
        marginBottom: 24
    },
    coachImg: {
        width: 120,
        height: 120,
        marginBottom: 24
    },
    doneText: {
        ...TextStyles.mediaTexts.linkTextM,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.primaryText
    },
    singleOption: {
        marginBottom: 16
    },
    greBtn: {
        paddingHorizontal: 24,
        paddingBottom: isIphoneX() ? 34 : 24,
        paddingTop: isIphoneX() ? 34 : 24,
        ...CommonStyles.styles.stickyShadow
    },
    noGreBtn: {
        paddingHorizontal: 24,
        paddingBottom: isIphoneX() ? 34 : 24,
        backgroundColor: Colors.colors.screenBG
    },
    greBtnModal: {
        paddingHorizontal: 0,
        paddingBottom: isIphoneX() ? 34 : 24,
    }
});

export default connectChat()(CustomChatView);
