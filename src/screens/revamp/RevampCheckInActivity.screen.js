import React, {Component} from 'react';
import {Image, Platform, StatusBar, StyleSheet} from 'react-native';
import {Body, Button, Container, Content, Header, Left, Right, Text, Title, View} from 'native-base';
import {
    addTestID,
    Colors,
    CommonStyles,
    getHeaderHeight,
    isIphoneX,
    PrimaryButton,
    SecondaryButton,
    TextStyles,
    valueExists
} from 'ch-mobile-shared';
import Loader from "../../components/Loader";
import {BackButton} from "ch-mobile-shared/src/components/BackButton";
import Modal from "react-native-modalbox";
import {Screens} from "../../constants/Screens";
import {
    REVAMP_ACTION_BUTTON_ACTIONS,
    REVAMP_ACTION_BUTTON_POSITIONS,
    REVAMP_DESCRIPTION_TYPE,
    REVAMP_QUESTION_RENDER_TYPE,
    REVAMP_VALUE_INPUT_TYPE,
    REVAMP_VALUES_DISPLAY_TYPE,
    S3_BUCKET_LINK
} from "../../constants/CommonConstants";
import ProfileService from "../../services/Profile.service";
import {Slider} from "react-native-elements";
import ConversationService from "../../services/Conversation.service";
import FeatherIcons from "react-native-vector-icons/Feather";
import {connectRevamp} from "../../redux";
import RevampTokenSpinnerComponent from "../../components/revamp-home/RevampTokenSpinnerComponent";
import RevampScheduleOnceOrRecurringComponent
    from "../../components/revamp-home/RevampScheduleOnceOrRecurringComponent";

const isIos = Platform.OS === 'ios';
const HEADER_SIZE = getHeaderHeight();

class RevampCheckInActivityScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.updateCurrentIndex = navigation.getParam('updateCurrentIndex', null);
        this.removeActivityFromAnswers = navigation.getParam('removeActivityFromAnswers', null);
        this.selectedActivity = navigation.getParam('selectedActivity', null);
        this.refScreen = navigation.getParam('refScreen', null);
        if (this.props.revamp.revampContext && this.props.revamp.revampContext?.activities) {
            this.selectedActivity = this.props.revamp.revampContext?.activities?.find(activityContext => {
                return activityContext.activity.name === this.selectedActivity
            })?.activity
        }
        this.state = {
            isLoading: false,
            parentQuestion: navigation.getParam('question', null),
            parentQuestionAnswers: navigation.getParam('answers', null),
            childQuestion: this.getParentQuestions(0),
            currentIndex: 0,
            showQuestionModal: true,
            showTokenModal: false,
            showPlanActivityModal: false,
            showScheduleOnceOrRecurringModal: false,
            answers: this.initializeEmptyState(checkInQuestions),
            showOptionsModal: false,
            openRewardSpinnerModal: false,
            payload: {
                activity: this.selectedActivity,
                checkIn: {
                    questionAnswers: []
                }
            }
        }
    }

    initializeEmptyState = (questions) => {
        let map = new Map();
        if (questions && questions.length > 0) {
            questions?.map(question => {
                this.answersMap(question, map, null)
            })
        }
        return map;
    };

    answersMap = (question, map) => {
        let answers = [];
        if (question.revampMetaData.inputType === "RATING_SCALE") {
            answers = ['5']
        }
        map.set(
            question.id,
            {
                profileElementKey: question.revampMetaData?.profileElement?.key,
                answers: answers,
                attempted: false,
                question: question,
                questionState: {
                    consumed: [],
                    parent: null,
                    children: question.revampMetaData.children && question.revampMetaData.children.length > 0
                        ? question.revampMetaData.children
                        : [],
                    next: null
                }
            })
        let children = question.revampMetaData?.children
        if (children && children.length > 0) {
            children?.map(child => {
                this.answersMap(child, map)
            })
        }
    }

    checkInActivity = async () => {
        try {
            let {payload} = this.state;
            const revampContextUpdate = await ConversationService.checkInActivity(payload);
            if (revampContextUpdate.errors) {
                console.log(revampContextUpdate.errors[0].endUserMessage);
            } else {
                this.props.fetchRevampContext();
            }
        } catch (e) {
            console.log(e);
        }
    };

    addProfileElement = async (question, selection) => {
        try {
            let profileElement = null;
            if (question.revampMetaData?.dynamicProfileElement) {
                profileElement = question.revampMetaData?.dynamicProfileElement
                const profileElementRequest = {
                    profileElements: [
                        {
                            profileElementKey: profileElement.key.replace('selectedActivity', this.selectedActivity.name),
                            type: profileElement.type,
                            profileElementValue: [selection],
                            method: profileElement.method,
                        }
                    ]
                }
                const response = await ProfileService.addMultipleProfileElement(profileElementRequest);
                if (response.errors) {
                    console.log(response.errors[0].endUserMessage);
                }
            }
        } catch (e) {
            console.log(e);
        }
    };

    componentDidMount() {
        let profileElements = {
            "profileElementKeys": []
        }
        checkInQuestions?.map(question => {
            if (question.revampMetaData?.description?.values && question.revampMetaData?.description?.values?.length > 0) {
                question.revampMetaData?.description?.values?.map(value => {
                    let mySubString = value.substring(
                        value.indexOf("{") + 1,
                        value.lastIndexOf("}")
                    );
                    profileElements.profileElementKeys.push(mySubString)
                })
            }
        })
        this.fetchDataElements(profileElements);
    }

    fetchDataElements = async (profileElements) => {
        try {
            const response = await ProfileService.getDataElements(profileElements);
            if (response.errors) {
                this.setState({isLoading: false});
            } else {
                this.setState({dataElements: response.profileElements, isLoading: false});
            }
        } catch (e) {
            console.log(e);
            this.setState({isLoading: false});
        }
    };

    backClicked = () => {
        if (this.removeActivityFromAnswers) {
            this.removeActivityFromAnswers();
        }
        this.props.navigation.goBack();
    };

    navigateToRewardPointsScreen = () => {
        const navigation = this.props.navigation;
        navigation.navigate(Screens.REVAMP_REWARD_POINT_SCREEN, {...navigation.state.params})
    };

    setAnswers = (item, inputType, questionId) => {
        let {answers} = this.state;
        let currentQuestionAnswers = answers.get(questionId).answers;
        if (currentQuestionAnswers.includes(item)
            && REVAMP_VALUE_INPUT_TYPE[inputType] !== REVAMP_VALUE_INPUT_TYPE.RATING_SCALE) {
            currentQuestionAnswers.splice(currentQuestionAnswers.indexOf(item), 1)
        } else {
            if ((REVAMP_VALUE_INPUT_TYPE[inputType] === REVAMP_VALUE_INPUT_TYPE.SINGLE_SELECT
                    || REVAMP_VALUE_INPUT_TYPE[inputType] === REVAMP_VALUE_INPUT_TYPE.TEXT_INPUT
                    || REVAMP_VALUE_INPUT_TYPE[inputType] === REVAMP_VALUE_INPUT_TYPE.BOOLEAN
                    || REVAMP_VALUE_INPUT_TYPE[inputType] === REVAMP_VALUE_INPUT_TYPE.RATING_SCALE
                )
                && currentQuestionAnswers?.length !== 0) {
                currentQuestionAnswers[0] = item;
                answers.get(questionId).attempted = true;
            } else {
                currentQuestionAnswers.push(item)
                answers.get(questionId).attempted = true;
            }
        }
        this.setState({answers})
    }

    renderValues = (question) => {
        let {answers} = this.state;
        answers = answers.get(question.id).answers;
        let {inputType, displayType, valuesGroups} = question.revampMetaData;

        if (REVAMP_VALUES_DISPLAY_TYPE[displayType] === REVAMP_VALUES_DISPLAY_TYPE.BUTTON_LIST) {
            return (
                <View style={{marginBottom: 8, paddingHorizontal: 24}}>
                    {
                        valuesGroups[0]?.values?.map((item) => {
                            return (
                                <View style={{marginBottom: 8}}>
                                    <Button
                                        style={
                                            !answers.includes(item.name)
                                                ? styles.btnInactive : styles.btnActive}
                                        onPress={() => {
                                            this.setAnswers(item.name, inputType, question.id)

                                        }}
                                        keyExtractor={item => item.name}
                                    >
                                        <Text style={{
                                            ...styles.btnText,
                                            color: !answers.includes(item.name)
                                                ? Colors.colors.highContrast
                                                : Colors.colors.primaryText
                                        }} uppercase={false}>{item.name}</Text>
                                    </Button>
                                </View>
                            )
                        })
                    }
                </View>
            );
        }
    }

    onChangeText = (textInput, inputType, questionId) => {
        let {answers} = this.state;
        answers = answers.get(questionId).answers;
        if ((textInput !== '' || textInput !== null) && valueExists(answers[0])) {
            this.setAnswers(textInput, inputType, questionId)
        } else {
            this.setAnswers(textInput, inputType, questionId)
        }

    };

    renderRatingScale = (question) => {
        let {answers} = this.state;
        let {inputType, displayType, valuesGroups, minSelection, maxSelection} = question.revampMetaData;
        if (REVAMP_VALUES_DISPLAY_TYPE[displayType] !== REVAMP_VALUES_DISPLAY_TYPE.RATING_SCALE) {
            return null;
        }
        let questionId = question.id;
        answers = answers.get(questionId).answers;
        return (
            <View style={{flexDirection: 'column', paddingHorizontal: 24, marginBottom: 32}}>
                <View style={{justifyContent: 'center', alignItems: 'center', marginBottom: 32, height: 40,}}>
                    <Text style={styles.ratingScaleSelectedValue}>{answers[0]}</Text>
                </View>
                <View style={{justifyContent: 'center', marginBottom: 16}}>
                    <Slider
                        onValueChange={(value) => {
                            this.setAnswers(value, inputType, questionId)
                        }}
                        minimumValue={minSelection}
                        maximumValue={maxSelection}
                        step={1}
                        value={answers[0]}
                        animateTransitions={true}
                        allowTouchTrack={true}
                        minimumTrackTintColor={Colors.colors.secondaryIcon}
                        trackStyle={{height: 8, borderRadius: 8, backgroundColor: Colors.colors.highContrastBG}}
                        thumbStyle={{height: 24, width: 24, backgroundColor: 'transparent'}}
                        thumbProps={{
                            children: (
                                <Image
                                    resizeMode={'contain'}
                                    style={{height: 24, width: 24, backgroundColor: 'transparent'}}
                                    source={require('../../assets/images/slider-indi.png')}/>
                            ),
                        }}
                    />
                    <View style={{flexDirection: 'row'}}>
                        <Left><Text style={{...styles.ratingScaleLabel}}>{valuesGroups[0].lowLabel}</Text></Left>
                        <Right><Text style={{...styles.ratingScaleLabel}}>{valuesGroups[0].highLabel}</Text></Right>
                    </View>
                </View>
            </View>
        );
    }

    actionButtonOnPress = async (button, question) => {
        let {currentIndex, answers, showQuestionModal, payload} = this.state;
        let currentQuestionAnswers = answers.get(question.id).answers;
        let {children} = question.revampMetaData;


        let questionAnswers = payload?.checkIn?.questionAnswers?.length > 0 ? payload?.checkIn?.questionAnswers : []
        questionAnswers.push({
            question: question.name,
            answers: [{
                name: currentQuestionAnswers[0],
                subText: "",
                colorCode: "",
                exampleText: "",
                placeholder: "",
                icon: ""
            }]
        })
        payload = {
            activity: this.selectedActivity,
            checkIn: {
                questionAnswers
            }
        }
        this.setState({showQuestionModal: false, payload}, () => {
            if (currentIndex === 2 && this.refScreen === 'UserActivities') {
                this.checkInActivity()
                this.setState({showQuestionModal: false, showPlanActivityModal: true, currentIndex: -1})
                return;
            }
            if (REVAMP_ACTION_BUTTON_ACTIONS[button.action] === REVAMP_ACTION_BUTTON_ACTIONS.CLOSE) {
                this.setState({
                    showQuestionModal: false,
                }, () => this.backClicked())
                return
            }
            if (button.action === 'BACK') {
                this.setState({
                    showQuestionModal: false,
                }, () => {
                    this.backClicked()
                    this.updateCurrentIndex()
                })
                return
            }
            if (currentIndex + 1 === checkInQuestions?.length) {
                this.checkInActivity()
                this.setState({
                    showQuestionModal: false,
                }, () => this.backClicked())
            } else if (
                children && children.length > 0
                && (children.some(child => {
                    let {renderType, mappedValue} = child.revampMetaData;
                    return (
                        REVAMP_QUESTION_RENDER_TYPE[renderType] === REVAMP_QUESTION_RENDER_TYPE.DIALOG
                        && valueExists(mappedValue)
                        && currentQuestionAnswers.includes(mappedValue)
                    )
                }))
            ) {

                children.find(child => {
                    let {renderType, mappedValue} = child.revampMetaData;
                    if (
                        REVAMP_QUESTION_RENDER_TYPE[renderType] === REVAMP_QUESTION_RENDER_TYPE.DIALOG
                        && valueExists(mappedValue)
                        && currentQuestionAnswers.includes(mappedValue)
                    ) {
                        this.setState(
                            {
                                showQuestionModal: true,
                                parentQuestion: question,
                                childQuestion: child
                            })
                    }
                })
            } else {
                if (currentQuestionAnswers.length > 0) {
                    this.addProfileElement(question, currentQuestionAnswers[0]);

                    this.setState({
                        showQuestionModal: true,
                        childQuestion: checkInQuestions[currentIndex + 1],
                        currentIndex: currentIndex + 1
                    })
                }
                this.setState({
                    showQuestionModal: true,
                    childQuestion: checkInQuestions[currentIndex + 1],
                    currentIndex: currentIndex + 1
                })
            }
        })

    }

    actionButtonDisabled = (button, question) => {
        let {answers} = this.state;
        let disabled = false;
        let currentQuestionAnswers = answers.get(question.id).answers;
        let {
            children
        } = question.revampMetaData;

        if (REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_BELOW) {
            disabled = (REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_FLOATING
                    || REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_FLOATING
                    || REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_BELOW
                    || REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_END)
                && currentQuestionAnswers.length === 0

        } else {
            disabled = (REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_FLOATING
                    || REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_FLOATING
                    || REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_BELOW
                    || REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_END)
                && currentQuestionAnswers.length === 0
        }
        return disabled;
    }

    renderActionButton = (button, question) => {
        let {answers} = this.state;
        let currentQuestionAnswers = answers.get(question.id).answers;
        let buttonText = button.name
        if (valueExists(button.primarySelectedText) && currentQuestionAnswers.length > 0) {
            buttonText = button.primarySelectedText
        }
        if (button.primary) {
            return (
                <View style={styles.actionBtnWrapper}>
                    <View style={styles.actionSecondaryBtn}>
                        <PrimaryButton
                            type={'Feather'}
                            disabled={this.actionButtonDisabled(button, question)}
                            color={Colors.colors.mainBlue20}
                            text={buttonText}
                            size={24}
                            onPress={() => {
                                this.actionButtonOnPress(button, question)
                            }}
                        />
                    </View>
                </View>
            )
        } else {
            return (
                <View style={styles.actionBtnWrapper}>
                    <SecondaryButton
                        color={Colors.colors.mainBlue}
                        inactiveBtn={this.actionButtonDisabled(button, question)}
                        onPress={() => {
                            this.actionButtonOnPress(button, question)
                        }}
                        text={button.name}
                        size={24}
                    />
                </View>
            )
        }
    }

    renderNumericList = () => {
        let {dataElements} = this.state;
        return (<View style={styles.statementList}>
                {
                    dataElements?.map((dataElement, index) => {
                        return (
                            <View style={{
                                flexDirection: 'row',
                                marginBottom: 16,
                                alignItems: 'center'
                            }}>
                                <View style={styles.numericListNumberBox}>
                                    <Text
                                        style={styles.numericListNumber}>{index + 1}</Text>
                                </View>
                                <View style={{paddingLeft: 12, width: '90%'}}>
                                    <Text
                                        style={styles.numericListText}>{dataElement.value[0]}</Text>
                                </View>
                            </View>
                        )

                    })
                }
            </View>
        )
    }

    renderQuestion = (question, questionIndex) => {
        let {renderType, displayType, description, children, actionButtons} = question.revampMetaData;
        let {answers, currentIndex} = this.state;

        return (
            <>
                <View style={styles.questionWrapper}>
                    <View>
                        {REVAMP_QUESTION_RENDER_TYPE[renderType] !== REVAMP_QUESTION_RENDER_TYPE.INLINE
                            &&
                            <>
                                <View style={styles.mainContentWrapper}>
                                    {REVAMP_QUESTION_RENDER_TYPE[renderType] === REVAMP_QUESTION_RENDER_TYPE.DIALOG
                                        ? <Text style={styles.mainHeadingH3}>{question.name}</Text>
                                        : REVAMP_QUESTION_RENDER_TYPE[renderType] === REVAMP_QUESTION_RENDER_TYPE.SCREEN
                                            ? <Text style={styles.mainHeading}>{question.name}</Text>
                                            : null
                                    }
                                    {currentIndex === 2 &&
                                        <Text style={{
                                            ...styles.rewardText,
                                            color: this.refScreen === 'revampOnBoarding'
                                                ? Colors.colors.highContrast
                                                : Colors.colors.secondaryText
                                        }}>{this.props.revamp.revampContext.reward.name}</Text>
                                    }
                                    {valueExists(description?.subtitle)
                                        && <Text style={styles.subHeading}>{description.subtitle}</Text>
                                    }


                                </View>
                                <>

                                    {description.values.length > 0
                                        && REVAMP_DESCRIPTION_TYPE[description.type] === REVAMP_DESCRIPTION_TYPE.NUMERIC_LIST
                                        && this.renderNumericList(question)
                                    }
                                </>

                            </>
                        }
                        <View style={styles.sectionWrapper}>
                            {this.renderRatingScale(question)}
                            {this.renderValues(question)}
                            {children
                                && children.length > 0
                                && children?.map((childQuestion, index) => {
                                    let {renderType} = childQuestion.revampMetaData;
                                    if (REVAMP_QUESTION_RENDER_TYPE[renderType] === REVAMP_QUESTION_RENDER_TYPE.INLINE) {
                                        return this.renderQuestion(childQuestion, index)
                                    }
                                    return null;
                                })}
                        </View>
                    </View>
                </View>

            </>
        );
    }

    getParentQuestions = (currentIndex) => {
        if (checkInQuestions && checkInQuestions.length > 0) {
            return checkInQuestions[currentIndex];
        } else {
            return []
        }
    }

    navigateToNextScreen = () => {
        this.props.navigation.goBack();
    };

    onCloseRevampScheduleOnceOrRecurringModal = () => {
        this.setState({showScheduleOnceOrRecurringModal: false})
    }

    onSchedulePress = () => {
        let revampContext = this.props.revamp.revampContext;
        if(revampContext.tokens && revampContext.tokens >= 0){
            revampContext.tokens += 1;
        } else {
            revampContext.tokens = 1;
        }
        this.props.updateRevampContext(revampContext);
        this.setState({showScheduleOnceOrRecurringModal: false, showTokenModal: true,})
    }

    render() {
        StatusBar.setBarStyle('dark-content', true);
        const {isLoading} = this.state;
        if (isLoading) {
            return <Loader/>
        }
        const {
            childQuestion,
            showQuestionModal,
            showOptionsModal,
            showTokenModal,
            currentIndex,
            openRewardSpinnerModal,
            showPlanActivityModal,
            showScheduleOnceOrRecurringModal
        } = this.state;

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
                                onPress={() => {
                                    this.backClicked();
                                }}
                            />
                        </View>
                    </Left>
                    <Body style={styles.headerRow}>
                        <Title style={styles.headerText}>Check-in</Title>
                    </Body>
                    {
                        this.refScreen === 'revampOnBoarding'
                            ? <Right style={{flex: 1}}>
                                <Button transparent
                                        style={{alignItems: 'flex-end', paddingRight: 7, marginRight: 8}}
                                        onPress={() => {
                                            this.setState({showOptionsModal: true})
                                        }}
                                >
                                    <FeatherIcons size={30} color={Colors.colors.mainBlue} name="more-horizontal"/>
                                </Button>
                            </Right>
                            : <Right/>
                    }
                </Header>
                <Content style={styles.mainContent} scrollEnabled={true} showsVerticalScrollIndicator={false}>
                    <View style={{
                        marginVertical: 64,
                        paddingLeft: 24,
                        paddingRight: 24,
                        alignItems: 'center'
                    }}>
                        <Image style={styles.imageIcon}
                               resizeMode={'contain'}
                               source={{uri: this.selectedActivity.icon && S3_BUCKET_LINK + this.selectedActivity.icon}}
                        />
                        <Text
                            style={{...styles.activityName}}>{this.selectedActivity.name}</Text>
                        <Text
                            style={styles.subText}>{this.selectedActivity.subText ? this.selectedActivity.subText : null}</Text>
                    </View>
                </Content>

                <View style={styles.actionBtnWrapper}>
                    <View style={styles.actionSecondaryBtn}>
                        <PrimaryButton
                            type={'Feather'}
                            color={Colors.colors.mainBlue20}
                            text={currentIndex === -1 ? "Continue" : "Continue Check-in"}
                            size={24}
                            onPress={() => {
                                if (currentIndex !== -1) {
                                    this.refs?.questionModal?.open()
                                } else {
                                    this.props.navigation.goBack()
                                }
                            }}
                        />
                    </View>
                </View>

                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    isOpen={showOptionsModal}
                    onClosed={() => {
                        this.setState({showOptionsModal: false})
                    }}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        height: 'auto',
                        position: 'absolute'
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"optionMenuModal"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content showsVerticalScrollIndicator={false}>
                        <SecondaryButton
                            color={Colors.colors.lowContrast}
                            inactiveBtn={true}
                            backgroundColor={Colors.colors.whiteColor}
                            text="Pause Revamp Onboarding"
                            size={24}
                            iconRight='pause'
                            type={'Ionicons'}
                            borderColor={Colors.colors.lowContrast}
                            onPress={() => {
                                this.props.navigation.pop(4);
                            }}
                        />
                    </Content>
                </Modal>

                <RevampScheduleOnceOrRecurringComponent
                    selectedActivity={this.selectedActivity}
                    showScheduleOnceOrRecurringModal={showScheduleOnceOrRecurringModal}
                    onClosed={this.onCloseRevampScheduleOnceOrRecurringModal}
                    onSchedulePress={this.onSchedulePress}
                />
                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    isOpen={showPlanActivityModal}
                    onClosed={() => {
                        this.setState({showPlanActivityModal: false})
                    }}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        height: 'auto',
                        position: 'absolute'
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"planActivityModal"} swipeArea={100}>
                    <View style={CommonStyles.styles.commonSwipeBar}
                    />
                    <Content showsVerticalScrollIndicator={false}>
                        <Text style={styles.planActivityModalHeaderText}>
                            Do you want to plan to do this activity in the future?
                        </Text>
                        <Text style={styles.planActivityModalSubText}>
                            Would you like to add this activity to your plan?
                        </Text>
                    </Content>
                    <View style={styles.planActivityModalButtons}>
                        <SecondaryButton
                            text={"Don't plan"}
                            onPress={() => {
                                this.onSchedulePress();
                                this.setState({showTokenModal: true, showPlanActivityModal: false})
                            }}
                        />
                        <PrimaryButton
                            text={"Plan Activity"}
                            onPress={() => {
                                this.setState({
                                    showPlanActivityModal: false,
                                    showScheduleOnceOrRecurringModal: true
                                })
                            }}
                        />
                    </View>
                </Modal>

                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    isOpen={showTokenModal}
                    onClosed={() => {
                        this.setState({showTokenModal: false})
                    }}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        height: 'auto',
                        position: 'absolute'
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"tokensModal"} swipeArea={100}>
                    <View style={CommonStyles.styles.commonSwipeBar}
                    />
                    <Content showsVerticalScrollIndicator={false}>
                        <Image
                            style={styles.reward}
                            source={require('../../assets/images/oneCheckInToken.png')}/>
                        <Text style={{...styles.mainHeadingH3, textAlign: 'center', paddingTop: 0}}>You have earned 1
                            token for checking in!</Text>
                        {this.props.revamp.revampContext.tokens >= 5
                            ?
                            <Text style={{
                                ...styles.subText,
                                ...TextStyles.mediaTexts.manropeRegular,
                                color: Colors.colors.lowContrast, paddingTop: 16, paddingBottom: 27
                            }}>Now you have
                                <Text style={{
                                    ...styles.subText,
                                    ...TextStyles.mediaTexts.manropeBold,
                                    color: Colors.colors.successText
                                }}> {this.props.revamp.revampContext.tokens} tokens.</Text>
                                You can save them for later or spin the wheel now and use your 5 tokens to earn reward.
                            </Text>
                            :
                            <Text style={{
                                ...styles.subText,
                                ...TextStyles.mediaTexts.manropeRegular,
                                color: Colors.colors.lowContrast, paddingTop: 16, paddingBottom: 27
                            }}>You have
                                <Text style={{
                                    ...styles.subText,
                                    ...TextStyles.mediaTexts.manropeBold,
                                    color: Colors.colors.successText
                                }}> {this.props.revamp.revampContext.tokens > 0 ? this.props.revamp.revampContext.tokens : 1} token{this.props.revamp.revampContext.tokens > 1 && 's'}</Text>
                                . Earn
                                <Text style={{
                                    ...styles.subText,
                                    ...TextStyles.mediaTexts.manropeBold,
                                    color: Colors.colors.successText
                                }}> {5 - (this.props.revamp.revampContext.tokens > 0 ? this.props.revamp.revampContext.tokens : 1)} more </Text>
                                and you can spin the prize wheel.
                            </Text>
                        }
                        <View style={{paddingBottom: 34, paddingTop: 40}}>
                            {this.props.revamp.revampContext.tokens >= 5 &&
                                < SecondaryButton
                                    text={"Save for later"}
                                    onPress={() => {
                                        this.props.navigation.goBack();
                                    }}
                                />
                            }
                            <PrimaryButton
                                text={this.props.revamp.revampContext.tokens >= 5 ? "Spin the wheel (5 tokens)" : "Continue"}
                                onPress={() => {
                                    if (this.props.revamp.revampContext.tokens >= 5) {
                                        this.setState({openRewardSpinnerModal: true});
                                    } else {
                                        this.props.navigation.goBack();
                                    }

                                }}
                            />
                        </View>
                    </Content>
                </Modal>

                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    isOpen={openRewardSpinnerModal}
                    onClosed={() => {
                        this.setState({openRewardSpinnerModal: false})
                    }}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        height: 'auto',
                        position: 'absolute',
                        paddingLeft: 0,
                        paddingRight: 0,
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"rewardSpinnerModal"} swipeArea={100}>
                    <View style={CommonStyles.styles.commonSwipeBar}
                    />
                    <Content showsVerticalScrollIndicator={false}>
                        <RevampTokenSpinnerComponent
                            navigateToNextScreen={this.navigateToNextScreen}
                        />
                    </Content>
                </Modal>
                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    isOpen={showQuestionModal}
                    /*onClosed={() => {
                        this.setState({showQuestionModal: false})
                    }}*/
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        paddingLeft: 0,
                        paddingRight: 0,
                        height: childQuestion.name.includes('Do you think this activity aligns with your values?') ? '90%' : 'auto',
                        position: 'absolute'
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"questionModal"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                    />
                    <Content showsVerticalScrollIndicator={false}>
                        {childQuestion && this.renderQuestion(childQuestion)}
                    </Content>
                    {childQuestion.revampMetaData.actionButtons
                        && childQuestion.revampMetaData.actionButtons?.length > 0
                        && childQuestion.revampMetaData.actionButtons?.map(button => {
                            if (
                                REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_BELOW
                                || REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.ENABLED_BELOW
                            ) {
                                return this.renderActionButton(button, childQuestion)
                            }
                        })}
                </Modal>
            </Container>
        );
    }
    ;
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingLeft: 0,
        paddingRight: 0,
        height: HEADER_SIZE,
        ...CommonStyles.styles.headerShadow
    },
    backButton: {
        marginLeft: 18,
        width: 40,
    },
    headerRow: {
        flex: 3,
        alignItems: 'center',
    },
    headerText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        textAlign: 'center',
    },
    questionWrapper: {
        marginTop: 0,
        // paddingHorizontal: 24,
    },
    mainContentWrapper: {
        // padding: 24,
        marginBottom: 32,
        paddingHorizontal: 24
    },
    statementList: {
        paddingHorizontal: 24,
        marginBottom: 40
    },
    imageIcon: {
        height: 89.33,
        width: 120,
        marginBottom: 32,
    },
    mainHeading: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        lineHeight: 40,
        color: Colors.colors.highContrast,
        textAlign: 'left'
    },
    mainHeadingH3: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,

        color: Colors.colors.highContrast,
        textAlign: 'left'
    },
    rewardText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextL,
        marginTop: 8,
        marginBottom: 16,

    },
    subHeading: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        marginTop: 8,
        // marginBottom: 16,

    },
    numericListNumberBox: {
        height: 34,
        width: 35,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.colors.whiteColor,
        ...CommonStyles.styles.stickyShadow,
        borderRadius: 5,
    },
    numericListNumber: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH4,
        color: Colors.colors.mainPink,
        textAlign: 'center'
    },
    numericListText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.highContrast,
        // marginTop: 8,

    },
    activityName: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        lineHeight: 40,
        color: Colors.colors.highContrast,
        textAlign: 'left',
    },
    subText: {
        ...TextStyles.mediaTexts.bodyTextM,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast,
        textAlign: 'center',
        paddingHorizontal: 24
    },
    secondaryButton: {
        borderRadius: 8,
        height: 155,
        width: 155,
        borderWidth: 1,
        borderColor: Colors.colors.mainBlue40,
        backgroundColor: Colors.colors.whiteColor,
        ...CommonStyles.styles.shadowBox,
        marginBottom: 16,
    },
    buttonText: {
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeMedium,
        width: "100%"
    },
    overlayBG: {
        backgroundColor: 'rgba(37,52,92,0.35)',
        zIndex: -1
    },
    fabWrapper: {
        height: 'auto',
        padding: 0,
        paddingTop: 40,
        paddingBottom: 24,

        alignSelf: 'center',
        position: 'absolute',
        // top: Platform.OS === 'ios'? isIphoneX()? 112 : 80 : 55,
        bottom: 0,
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
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
    },
    ratingScaleSelectedValue: {
        ...TextStyles.mediaTexts.manropeExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        lineHeight: 40,
        color: Colors.colors.mainPink,
        textTransform: 'uppercase'
    },
    sectionItem: {
        ...CommonStyles.styles.shadowBox,
        padding: 24,
        width: '98%',
        marginBottom: 8,
        borderRadius: 12,
        height: 137,
        backgroundColor: Colors.colors.whiteColor,
    },
    secondaryBtn: {
        marginBottom: 16
    },
    actionBtnWrapper: {
        padding: 24,
        paddingBottom: isIphoneX() ? 24 : 14
    },
    actionSecondaryBtn: {
        marginBottom: 16,
    },
    ratingScaleLabel: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
    },
    btnActive: {
        borderRadius: 8,
        borderWidth: 1,
        ...CommonStyles.styles.shadowBox,
        marginBottom: 0,
        borderColor: Colors.colors.mainBlue40,
        backgroundColor: Colors.colors.primaryColorBG,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        textTransform: 'none',
        paddingTop: 0,
        paddingBottom: 0,
        height: 64
    },
    btnInactive: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.colors.borderColor,
        marginBottom: 0,
        ...CommonStyles.styles.shadowBox,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        textTransform: 'none',
        backgroundColor: Colors.colors.whiteColor,
        paddingTop: 0,
        paddingBottom: 0,
        height: 64
    },
    btnText: {
        textTransform: 'none',
        ...TextStyles.mediaTexts.TextH7,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast,
        textAlign: 'center',
    },
    reward: {
        marginBottom: 40,
        alignSelf: 'center',
        height: 120,
        width: 120,
    },
    planActivityModalHeaderText: {
        ...TextStyles.mediaTexts.TextH3,
        ...TextStyles.mediaTexts.serifProBold,
        color: Colors.colors.highContrast,
        textAlign: 'left',
        paddingBottom: 16,
    },
    planActivityModalSubText: {
        ...TextStyles.mediaTexts.bodyTextM,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.mediumContrast,
        textAlign: 'left',
        paddingBottom: 24,
    },
    planActivityModalButtons: {
        paddingBottom: isIphoneX() ? 34 : 24
    }
});

const checkInQuestions = [
    {
        "id": "61e57f1d42eba400012a6bba",
        "name": "How much pleasure did this activity bring you?",
        "revampMetaData": {
            "description": {
                "subtitle": "This information is for you, so be honest with yourself.",
                "type": "ONE_LINER",
                "values": []
            },
            "inputType": "RATING_SCALE",
            "renderType": "DIALOG",
            "displayType": "RATING_SCALE",
            "mappedValue": "",
            "minSelection": 0,
            "maxSelection": 10,
            "valuesGroups": [
                {
                    "name": "",
                    "icon": "",
                    "colorCode": "",
                    "lowLabel": "None",
                    "highLabel": "Tons",
                    "values": []
                }
            ],
            "actionButtons": [
                {
                    "name": "Continue",
                    "action": "NEXT",
                    "primary": true,
                    "primarySelectedText": "",
                    "position": "ENABLED_BELOW"
                }
            ],
            "popups": [],
            "responseBased": true,
            "backgroundImage": "",
            "dynamicProfileElement": {
                "key": "selectedActivity - Activity Pleasure Level Actual",
                "type": "RATING_SCALE",
                "method": "ALL_RESPONSES_WITH_DATE_TIME_STAMPS"
            },
        }
    },
    {
        "id": "61e57f1d42eba400012a6bbb",
        "name": "Do you think this activity aligns with your values?",
        "revampMetaData": {
            "description": {
                "subtitle": "",
                "type": "NUMERIC_LIST",
                "values": [
                    "#{ReVAMP Core value I statement 1}",
                    "#{ReVAMP Core value I statement 2}",
                    "#{ReVAMP Core value I statement 3}",
                    "#{ReVAMP Core value I statement 4}",
                    "#{ReVAMP Core value I statement 5}"
                ]
            },
            "inputType": "SINGLE_SELECT",
            "renderType": "DIALOG",
            "displayType": "BUTTON_LIST",
            "mappedValue": "",
            "minSelection": 0,
            "maxSelection": 0,
            "valuesGroups": [
                {
                    "name": "",
                    "icon": "",
                    "colorCode": "",
                    "lowLabel": "",
                    "highLabel": "",
                    "values": [
                        {
                            "name": "I'm not sure",
                            "subText": "",
                            "colorCode": "",
                            "exampleText": "",
                            "placeholder": "",
                            "icon": ""
                        },
                        {
                            "name": "Not Aligned",
                            "subText": "",
                            "colorCode": "",
                            "exampleText": "",
                            "placeholder": "",
                            "icon": ""
                        },
                        {
                            "name": "Aligned",
                            "subText": "",
                            "colorCode": "",
                            "exampleText": "",
                            "placeholder": "",
                            "icon": ""
                        }
                    ]
                }
            ],
            "actionButtons": [
                {
                    "name": "Continue",
                    "action": "NEXT",
                    "primary": true,
                    "primarySelectedText": "",
                    "position": "DISABLED_BELOW"
                }
            ],
            "popups": [],
            "responseBased": true,
            "backgroundImage": "",
            "dynamicProfileElement": {
                "key": "selectedActivity - Activity Value Alignment Actual",
                "type": "USER_DEFINED_VALUES",
                "method": "ALL_RESPONSES_WITH_DATE_TIME_STAMPS"
            },
        }
    },
    {
        "id": "61e57f1d42eba400012a6bbc",
        "name": "Do you think you are getting closer to your reward?",
        "revampMetaData": {
            "description": {
                "subtitle": "This information is for you, so be honest with yourself.",
                "type": "ONE_LINER",
                "values": []
            },
            "inputType": "SINGLE_SELECT",
            "renderType": "DIALOG",
            "displayType": "BUTTON_LIST",
            "mappedValue": "",
            "minSelection": 0,
            "maxSelection": 0,
            "valuesGroups": [
                {
                    "name": "",
                    "icon": "",
                    "colorCode": "",
                    "lowLabel": "",
                    "highLabel": "",
                    "values": [
                        {
                            "name": "I don't know",
                            "subText": "",
                            "colorCode": "",
                            "exampleText": "",
                            "placeholder": "",
                            "icon": ""
                        },
                        {
                            "name": "No",
                            "subText": "",
                            "colorCode": "",
                            "exampleText": "",
                            "placeholder": "",
                            "icon": ""
                        },
                        {
                            "name": "Yes",
                            "subText": "",
                            "colorCode": "",
                            "exampleText": "",
                            "placeholder": "",
                            "icon": ""
                        }
                    ]
                }
            ],
            "actionButtons": [
                {
                    "name": "Continue",
                    "action": "NEXT",
                    "primary": true,
                    "primarySelectedText": "",
                    "position": "DISABLED_BELOW"
                }
            ],
            "popups": [],
            "responseBased": true,
            "backgroundImage": "",
            "dynamicProfileElement": {
                "key": "selectedActivity - Activity Reward Progress Actual",
                "type": "USER_DEFINED_VALUES",
                "method": "ALL_RESPONSES_WITH_DATE_TIME_STAMPS"
            },
        }
    },
    {
        "id": "61e57f1d42eba400012a6bc0",
        "name": "Would you like to do one more check-in? ",
        "revampMetaData": {
            "description": {
                "subtitle": "Reflect on another activity.",
                "type": "ONE_LINER",
                "values": []
            },
            "inputType": "NO_INPUT",
            "renderType": "DIALOG",
            "displayType": "",
            "mappedValue": "",
            "minSelection": 0,
            "maxSelection": 0,
            "valuesGroups": [],
            "actionButtons": [
                {
                    "name": "Not now",
                    "action": "BACK",
                    "primary": false,
                    "primarySelectedText": "",
                    "position": "ENABLED_BELOW"
                },
                {
                    "name": "Check-in",
                    "action": "NEXT",
                    "primary": true,
                    "primarySelectedText": "",
                    "position": "ENABLED_BELOW"
                }
            ],
            "popups": [],
            "responseBased": true,
            "backgroundImage": ""
        }
    }
]
export default connectRevamp()(RevampCheckInActivityScreen);
