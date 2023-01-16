import React, {Component} from 'react';
import {Image, Platform, Share, StatusBar, StyleSheet} from 'react-native';
import {Body, Button, Container, Content, Header, Left, Right, Text, Title, View} from 'native-base';
import {
    Colors,
    CommonStyles,
    CommonTextArea,
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
import {
    REVAMP_ACTION_BUTTON_ACTIONS,
    REVAMP_ACTION_BUTTON_POSITIONS,
    REVAMP_DESCRIPTION_TYPE,
    REVAMP_QUESTION_RENDER_TYPE,
    REVAMP_VALUE_INPUT_TYPE,
    REVAMP_VALUES_DISPLAY_TYPE,
    S3_BUCKET_LINK,
    SCHEDULE_ACTIVITY_QUESTIONS
} from "../../constants/CommonConstants";
import ProfileService from "../../services/Profile.service";
import {Slider} from "react-native-elements";
import FeatherIcons from "react-native-vector-icons/Feather";
import {connectRevamp} from "../../redux"
import RevampTokenSpinnerComponent from "../../components/revamp-home/RevampTokenSpinnerComponent";
import AntIcon from "react-native-vector-icons/AntDesign";
import AntDesign from "react-native-vector-icons/AntDesign";
import RevampScheduleOnceOrRecurringComponent
    from "../../components/revamp-home/RevampScheduleOnceOrRecurringComponent";
import ConversationService from "../../services/Conversation.service";

const isIos = Platform.OS === 'ios';
const HEADER_SIZE = getHeaderHeight();

class RevampScheduleActivityScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.revampTypeData = navigation.getParam("revampTypeData", null);
        this.updateCurrentIndex = navigation.getParam('updateCurrentIndex', null);
        this.removeActivityFromAnswers = navigation.getParam('removeActivityFromAnswers', null);
        this.selectedActivity = navigation.getParam('selectedActivity', null);
        this.refScreen = navigation.getParam('refScreen', null);
        if (this.props.revamp.revampContext && this.props.revamp.revampContext.activities) {
            this.selectedActivity = this.props.revamp.revampContext?.activities
                .find(activityContext => activityContext.activity.name === this.selectedActivity).activity
        }
        this.state = {
            isLoading: false,
            parentQuestion: navigation.getParam('question', null),
            parentQuestionAnswers: navigation.getParam('answers', null),
            childQuestion: this.getParentQuestions(0),
            currentIndex: 0,
            showQuestionModal: false,
            answers: this.initializeEmptyState(schedulingQuestions),
            showOptionsModal: false,
            showTokenModal: false,
            openRewardSpinnerModal: false,
            showAnswersUpdateModal: false,
            showScheduleOnceOrRecurringModal: true,
            scheduleAttempted: false,
            answerOrUpdate: false
        }
    }

    initializeEmptyState = (questions) => {
        let map = new Map();
        if (questions && questions?.length > 0) {
            questions.map(question => {
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
        map.set(question.id, {
            profileElementKey: question.revampMetaData?.profileElement?.key,
            answers: answers,
            attempted: false,
            question: question,
            questionState: {
                consumed: [],
                parent: null,
                children: question.revampMetaData.children && question.revampMetaData.children.length > 0 ? question.revampMetaData.children : [],
                next: null
            }
        })
        let children = question.revampMetaData?.children
        if (children && children.length > 0) {
            children.map(child => {
                this.answersMap(child, map)
            })
        }
    }

    scheduleActivity = async () => {
        let {
            answers,
            currentIndex,
            childQuestion,

        } = this.state;
        let activityContext = this.props.revamp.revampContext.activities.find(activityContext => activityContext.activity.name === this.selectedActivity.name)
        let activitySchedule = activityContext.schedule

        const currentQuestion = schedulingQuestions[currentIndex];
        const currentQuestionAnswers = answers.get(currentQuestion.id).answers

        try {
            let questionAnswers = activitySchedule?.questionAnswers?.length > 0 ? activitySchedule.questionAnswers : []
            if (questionAnswers && questionAnswers.length > 0 && questionAnswers.some(question=> question.question === currentQuestion.name)){
                let question = questionAnswers.filter(question=> question.question === currentQuestion.name)
                question.answers = [{
                    name: currentQuestionAnswers[0],
                    subText: "",
                    colorCode: "",
                    exampleText: "",
                    placeholder: "",
                    icon: ""
                }]
            } else {
                questionAnswers.push({
                    question: currentQuestion.name,
                    answers: [{
                        name: currentQuestionAnswers[0],
                        subText: "",
                        colorCode: "",
                        exampleText: "",
                        placeholder: "",
                        icon: ""
                    }]
                })
            }
            activitySchedule.questionAnswers = questionAnswers

            activitySchedule = {
                activity: this.selectedActivity,
                schedule: activitySchedule
            }
            this.setState({activitySchedule})
           if ((childQuestion?.name === 'Is there anything that could prevent you from doing this activity?'
                   && currentQuestionAnswers[0] === 'No, I don\'t think so')
                || childQuestion?.name === 'How can you handle these obstacles?') {
                const revampContextUpdate = await ConversationService.scheduleActivity(activitySchedule);
                if (revampContextUpdate.errors) {
                    console.log(revampContextUpdate.errors[0].endUserMessage);
                } else {
                    console.log('Scheduling Question responses saved successfully')
                    let revampContext = this.props.revamp.revampContext;
                    if(revampContext.tokens && revampContext.tokens >= 0){
                        revampContext.tokens += 1;
                    } else {
                        revampContext.tokens = 1;
                    }
                    this.props.updateRevampContext(revampContext);
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
        schedulingQuestions.map(question => {
            if (question.revampMetaData.description.values && question.revampMetaData.description.values.length > 0) {
                question.revampMetaData.description.values.map(value => {
                    let mySubString = value.substring(value.indexOf("{") + 1, value.lastIndexOf("}"));
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

    backClicked = () => {
        this.removeActivityFromAnswers();
        this.props.navigation.goBack();
    };

    setAnswers = (item, inputType, questionId) => {
        let {answers} = this.state;
        let currentQuestionAnswers = answers.get(questionId).answers;
        if (currentQuestionAnswers.includes(item) && REVAMP_VALUE_INPUT_TYPE[inputType] !== REVAMP_VALUE_INPUT_TYPE.RATING_SCALE) {
            currentQuestionAnswers.splice(currentQuestionAnswers.indexOf(item), 1)
        } else {
            if ((REVAMP_VALUE_INPUT_TYPE[inputType] === REVAMP_VALUE_INPUT_TYPE.SINGLE_SELECT
                    || REVAMP_VALUE_INPUT_TYPE[inputType] === REVAMP_VALUE_INPUT_TYPE.TEXT_INPUT
                    || REVAMP_VALUE_INPUT_TYPE[inputType] === REVAMP_VALUE_INPUT_TYPE.BOOLEAN
                    || REVAMP_VALUE_INPUT_TYPE[inputType] === REVAMP_VALUE_INPUT_TYPE.RATING_SCALE)
                && currentQuestionAnswers.length !== 0) {
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
            return (<View style={{marginBottom: 8, paddingHorizontal: 24}}>
                {valuesGroups[0].values.map((item) => {
                    return (<View style={{marginBottom: 8}}>
                        <Button
                            style={!answers.includes(item.name) ? styles.btnInactive : styles.btnActive}
                            onPress={() => {
                                this.setAnswers(item.name, inputType, question.id)

                            }}
                            keyExtractor={item => item.name}
                        >
                            <Text style={{
                                ...styles.btnText,
                                color: !answers.includes(item.name) ? Colors.colors.highContrast : Colors.colors.primaryText
                            }} uppercase={false}>{item.name}</Text>
                        </Button>
                    </View>)
                })}
            </View>);
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

    renderTextArea = (question) => {
        let {answers} = this.state;
        let {inputType, displayType, valuesGroups} = question.revampMetaData;
        if (REVAMP_VALUES_DISPLAY_TYPE[displayType] !== REVAMP_VALUES_DISPLAY_TYPE.INPUT_FIELD) {
            return null;
        }
        answers = answers.get(question.id).answers;
        return (<View style={styles.textAreaContainer}>
            <CommonTextArea
                autoFocus={false}
                multiline={true}
                placeHolderText={"Write any obstacle you have in your mind"}
                placeholderTextColor={Colors.colors.highContrast}
                onChangeText={(input) => this.onChangeText(input, inputType, question.id)}
                borderColor={Colors.colors.mainBlue10}
                value={answers[0] ? answers[0] : ''}
            />
        </View>);
    }

    renderRatingScale = (question) => {
        let {answers} = this.state;
        let {inputType, displayType, valuesGroups, minSelection, maxSelection} = question.revampMetaData;
        if (REVAMP_VALUES_DISPLAY_TYPE[displayType] !== REVAMP_VALUES_DISPLAY_TYPE.RATING_SCALE) {
            return null;
        }
        let questionId = question.id;
        answers = answers.get(questionId).answers;
        return (<View style={{flexDirection: 'column', paddingHorizontal: 24, marginBottom: 32}}>
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
                    animateTransitions={false}
                    allowTouchTrack={true}
                    minimumTrackTintColor={Colors.colors.secondaryIcon}
                    trackStyle={{height: 8, borderRadius: 8, backgroundColor: Colors.colors.highContrastBG}}
                    thumbStyle={{height: 24, width: 24, backgroundColor: 'transparent'}}
                    thumbProps={{
                        children: (<Image
                            resizeMode={'contain'}
                            style={{height: 24, width: 24, backgroundColor: 'transparent'}}
                            source={require('../../assets/images/slider-indi.png')}/>),
                    }}
                />
                <View style={{flexDirection: 'row'}}>
                    <Left><Text style={{...styles.ratingScaleLabel}}>{valuesGroups[0].lowLabel}</Text></Left>
                    <Right><Text style={{...styles.ratingScaleLabel}}>{valuesGroups[0].highLabel}</Text></Right>
                </View>
            </View>
        </View>);
    }

    share = async (channel) => {
        try {
            const content = {
                title: 'Taking a pledge', message: 'I am making pledge to live by my values',
            }
            const options = {
                dialogTitle: "Share Pledge"
            }
            await Share.share(content, options);
        } catch (error) {
            alert(error.message);
        }

    };

    actionButtonOnPress = async (button, question) => {
        let {currentIndex, answers, childQuestion} = this.state;
        let currentQuestionAnswers = answers.get(question.id).answers;
        let {children} = question.revampMetaData;

        this.setState({showQuestionModal: false}, () => {
            if (this.refScreen === 'UserActivities') {
                if ((childQuestion?.name === 'Is there anything that could prevent you from doing this activity?'
                        && currentQuestionAnswers[0] === 'No, I don\'t think so')
                    || childQuestion?.name === 'How can you handle these obstacles?') {
                    this.setState({
                        showTokenModal: true
                    })
                    return;
                }
            }

            if (REVAMP_ACTION_BUTTON_ACTIONS[button.action] === REVAMP_ACTION_BUTTON_ACTIONS.CLOSE) {
                this.setState({
                    showQuestionModal: false,
                }, () => this.backClicked())
                return
            }
            if (button.action === 'START_CHECKIN') {
                this.updateCurrentIndex()
                this.setState({
                    showQuestionModal: false,
                }, () => this.backClicked())
                return
            }

            if (currentIndex + 1 === schedulingQuestions.length) {

                this.setState({
                    showQuestionModal: false,
                }, () => this.backClicked())


            } else if (children && children.length > 0 && (children.some(child => {
                let {renderType, mappedValue} = child.revampMetaData;
                return (REVAMP_QUESTION_RENDER_TYPE[renderType] === REVAMP_QUESTION_RENDER_TYPE.DIALOG && valueExists(mappedValue) && currentQuestionAnswers.includes(mappedValue))
            }))) {

                children.find(child => {
                    let {renderType, mappedValue} = child.revampMetaData;
                    if (REVAMP_QUESTION_RENDER_TYPE[renderType] === REVAMP_QUESTION_RENDER_TYPE.DIALOG && valueExists(mappedValue) && currentQuestionAnswers.includes(mappedValue)) {
                        this.setState({
                            showQuestionModal: true, parentQuestion: question, childQuestion: child
                        })
                    }
                })


            } else {
                if (currentQuestionAnswers.length > 0) {
                    this.addProfileElement(question, currentQuestionAnswers[0]);

                    this.setState({
                        showQuestionModal: true,
                        childQuestion: schedulingQuestions[currentIndex + 1],
                        currentIndex: currentIndex + 1
                    })
                }
                this.setState({
                    showQuestionModal: true,
                    childQuestion: schedulingQuestions[currentIndex + 1],
                    currentIndex: currentIndex + 1
                })

            }
        })
        this.scheduleActivity()
    }

    actionButtonDisabled = (button, question) => {
        let {answers} = this.state;
        let disabled = false;
        let currentQuestionAnswers = answers.get(question.id).answers;
        let {
            children
        } = question.revampMetaData;

        if (REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_BELOW) {
            disabled = (REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_FLOATING || REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_FLOATING || REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_BELOW || REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_END) && currentQuestionAnswers.length === 0

        } else {
            disabled = (REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_FLOATING || REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_FLOATING || REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_BELOW || REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_END) && currentQuestionAnswers.length === 0
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
            return (<View style={styles.actionBtnWrapper}>
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
            </View>)
        } else {
            return (<View style={styles.actionBtnWrapper}>
                <SecondaryButton
                    color={Colors.colors.mainBlue}
                    inactiveBtn={this.actionButtonDisabled(button, question)}
                    onPress={() => {
                        this.actionButtonOnPress(button, question)
                    }}
                    text={button.name}
                    size={24}
                />
            </View>)
        }
    }

    renderNumericList = (question) => {
        let {dataElements} = this.state;
        if (dataElements) {
            return (<View style={styles.statementList}>
                {dataElements.map((dataElement, index) => {
                    return (<View style={{
                        flexDirection: 'row', marginBottom: 16, alignItems: 'center'
                    }}>
                        <View style={styles.numericListNumberBox}>
                            <Text
                                style={styles.numericListNumber}>{index + 1}</Text>
                        </View>
                        <View style={{paddingLeft: 12, width: '90%'}}>
                            <Text
                                style={styles.numericListText}>{dataElement.value[0]}</Text>
                        </View>
                    </View>)

                })}
            </View>)
        }
        return null;

    }


    renderQuestion = (question) => {
        let {renderType, description, children, actionButtons} = question.revampMetaData;
        let {currentIndex} = this.state;

        return (<>
            <View style={styles.questionWrapper}>
                <View>
                    {REVAMP_QUESTION_RENDER_TYPE[renderType] !== REVAMP_QUESTION_RENDER_TYPE.INLINE && <>
                        <View style={styles.mainContentWrapper}>
                            {REVAMP_QUESTION_RENDER_TYPE[renderType] === REVAMP_QUESTION_RENDER_TYPE.DIALOG ? <Text
                                style={styles.mainHeadingH3}>{question.name}</Text> : REVAMP_QUESTION_RENDER_TYPE[renderType] === REVAMP_QUESTION_RENDER_TYPE.SCREEN ?
                                <Text style={styles.mainHeading}>{question.name}</Text> : null}
                            {question.name.includes('closer to your reward?') && <Text
                                style={styles.rewardText}>{this.props.revamp.revampContext.reward.name}</Text>}

                            {valueExists(description?.subtitle) &&
                                <Text style={styles.subHeading}>{description.subtitle}</Text>}


                        </View>
                        <>

                            {description.values.length > 0 && REVAMP_DESCRIPTION_TYPE[description.type] === REVAMP_DESCRIPTION_TYPE.NUMERIC_LIST && this.renderNumericList(question)}
                        </>

                    </>}
                    <View style={styles.sectionWrapper}>
                        {this.renderTextArea(question)}
                        {this.renderRatingScale(question)}
                        {this.renderValues(question)}
                        {children && children.length > 0 && children.map((childQuestion, index) => {
                            let {renderType} = childQuestion.revampMetaData;
                            if (REVAMP_QUESTION_RENDER_TYPE[renderType] === REVAMP_QUESTION_RENDER_TYPE.INLINE) {
                                return this.renderQuestion(childQuestion, index)
                            }
                            return null;
                        })}
                    </View>
                </View>
            </View>

        </>);
    }

    getParentQuestions = (currentIndex) => {
        if (schedulingQuestions && schedulingQuestions.length > 0) {
            return schedulingQuestions[currentIndex];
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

    renderUserScheduleQAResponses = () => {
        const selectedActivity = this.selectedActivity;
        const activityContext = this.props.revamp.revampContext.activities.find(activityContext => activityContext.activity.name === this.selectedActivity.name);
        const {checkIns, schedule} = activityContext;
        const {questionAnswers} = schedule;
        if (questionAnswers && questionAnswers.length >= 4) {
            const aligned = questionAnswers?.some(question => question.question === SCHEDULE_ACTIVITY_QUESTIONS.ALIGNED_WITH_VALUES.key)
                ? questionAnswers?.find(question => question.question === SCHEDULE_ACTIVITY_QUESTIONS.ALIGNED_WITH_VALUES.key).answers[0]
                : null;

            const pleasure = questionAnswers?.find(question => question.question === SCHEDULE_ACTIVITY_QUESTIONS.PLEASURE_FROM_THIS_ACTIVITY.key).answers[0]
                ? questionAnswers?.find(question => question.question === SCHEDULE_ACTIVITY_QUESTIONS.PLEASURE_FROM_THIS_ACTIVITY.key).answers[0]
                : null;

            const closerToReward = questionAnswers?.find(question => question.question === SCHEDULE_ACTIVITY_QUESTIONS.GETTING_CLOSER_TO_REWARD.key).answers[0]
                ? questionAnswers?.find(question => question.question === SCHEDULE_ACTIVITY_QUESTIONS.GETTING_CLOSER_TO_REWARD.key).answers[0]
                : null;

            const blockers = questionAnswers?.find(question => question.question === SCHEDULE_ACTIVITY_QUESTIONS.BLOCKERS.key).answers[0]
                ? questionAnswers?.find(question => question.question === SCHEDULE_ACTIVITY_QUESTIONS.BLOCKERS.key).answers[0]
                : null;
            return (
                <View style={styles.wrapper}>
                    <Image style={styles.modalIcon}
                           resizeMode={'contain'}
                           source={{uri: selectedActivity.icon && S3_BUCKET_LINK + selectedActivity.icon}}
                    />
                    <Text style={styles.modalText}>{selectedActivity.name}</Text>
                    <Text numberOfLines={1}
                          style={styles.modalCheckInText}>
                        {
                            checkIns?.length > 0
                                ? checkIns?.length > 1 ? checkIns?.length + ' check-ins' : checkIns?.length + ' check-in'
                                : 'No check-ins yet'
                        }
                    </Text>
                    <View style={styles.itemsList}>
                        <View style={styles.singleItem}>
                            <Text style={styles.itemText}>Aligned with values</Text>
                            {
                                aligned.name === 'Aligned'
                                    ? <AntIcon style={styles.modalCheckIcon}
                                               name="checkcircle" size={26}
                                               color={Colors.colors.successIcon}/>
                                    : aligned.name === 'Not Aligned'
                                        ? <AntDesign style={styles.modalCrossIcon}
                                                     name="closecircleo" size={26}
                                                     color={Colors.colors.lowContrast}/>
                                        : <AntDesign style={styles.modalCrossIcon}
                                                     name="questioncircleo" size={26}
                                                     color={Colors.colors.lowContrast}/>
                            }
                        </View>
                        <View style={styles.singleItem}>
                            <Text style={styles.itemText}>Getting closer to reward</Text>
                            {
                                closerToReward.name === 'Yes'
                                    ? <AntIcon style={styles.modalCheckIcon}
                                               name="checkcircle" size={26}
                                               color={Colors.colors.successIcon}/>
                                    : closerToReward.name === 'No'
                                        ? <AntDesign style={styles.modalCrossIcon}
                                                     name="closecircleo" size={26}
                                                     color={Colors.colors.lowContrast}/>
                                        : <AntDesign style={styles.modalCrossIcon}
                                                     name="questioncircleo" size={26}
                                                     color={Colors.colors.lowContrast}/>
                            }
                        </View>
                        {
                            pleasure
                            && <View style={styles.singleItem}>
                                <Text style={styles.itemText}>Pleasure from this activity</Text>
                                <View style={styles.modalCircle}>
                                    <Text style={styles.modalCircleText}>{pleasure ? pleasure.name : 0}</Text>
                                </View>
                            </View>
                        }
                        {
                            blockers
                            && <View style={styles.singleItem}>
                                <Text style={styles.itemText}>Blockers</Text>
                                <Text style={styles.yesText}>{blockers ? blockers.name : ''}</Text>
                            </View>
                        }
                        {/*<View style={styles.singleItem}>*/}
                        {/*    <Text style={styles.itemText}>Consequences</Text>*/}
                        {/*    <Text style={styles.noText}>No</Text>*/}
                        {/*</View>*/}
                    </View>
                </View>
            );
        } else {
            return null;
        }
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
            openRewardSpinnerModal,
            showAnswersUpdateModal,
            showScheduleOnceOrRecurringModal,
            scheduleAttempted,
            answerOrUpdate
        } = this.state;

        const activityContext =  this.props.revamp.revampContext.activities.find(activityContext => activityContext.activity.name === this.selectedActivity.name)
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
                        <Title style={styles.headerText}>{this.revampTypeData.name}</Title>
                    </Body>
                    {this.refScreen === 'UserActivities' ? <Right/> : <Right style={{flex: 1}}>
                        <Button transparent
                                style={{alignItems: 'flex-end', paddingRight: 7, marginRight: 8}}
                                onPress={() => {
                                    this.setState({showOptionsModal: true})
                                }}
                        >
                            <FeatherIcons size={30} color={Colors.colors.mainBlue} name="more-horizontal"/>
                        </Button>
                    </Right>}

                </Header>
                <Content style={styles.mainContent} scrollEnabled={true} showsVerticalScrollIndicator={false}>
                    <View style={{
                        marginVertical: 64, paddingLeft: 24, paddingRight: 24, alignItems: 'center'
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
                            text={"Continue Schedule"}
                            size={24}
                            onPress={() => {
                                if (scheduleAttempted) {
                                    if (answerOrUpdate) {
                                        this.refs?.questionModal?.open()
                                    } else {
                                        this.setState({showAnswersUpdateModal: true})
                                    }

                                } else {
                                    this.setState({showScheduleOnceOrRecurringModal: true})
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
                        ...CommonStyles.styles.commonModalWrapper, height: 'auto', position: 'absolute',
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"optionMenuModal"} swipeArea={100}>
                    <View style={CommonStyles.styles.commonSwipeBar}
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
                    activityContext={activityContext}
                    showScheduleOnceOrRecurringModal={showScheduleOnceOrRecurringModal}
                    onClosed={this.onCloseRevampScheduleOnceOrRecurringModal}
                    onSchedulePress={() => {
                        this.setState({
                            showScheduleOnceOrRecurringModal: false,
                            showAnswersUpdateModal: true,
                            scheduleAttempted: true
                        })
                    }}
                />

                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    isOpen={showQuestionModal}
                    // onClosed={() => {
                    //     this.setState({showQuestionModal: true})
                    // }}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        paddingLeft: 0,
                        paddingRight: 0,
                        height: 'auto',
                        position: 'absolute',
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"questionModal"} swipeArea={100}>
                    <View style={CommonStyles.styles.commonSwipeBar}
                    />
                    <Content showsVerticalScrollIndicator={false}>
                        {childQuestion && this.renderQuestion(childQuestion)}
                    </Content>
                    {childQuestion.revampMetaData.actionButtons && childQuestion.revampMetaData.actionButtons?.length > 0 && childQuestion.revampMetaData.actionButtons.map(button => {
                        if (REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_BELOW || REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.ENABLED_BELOW) {
                            return this.renderActionButton(button, childQuestion)
                        }
                    })}
                </Modal>

                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    isOpen={showAnswersUpdateModal}
                    onClosed={() => {
                        this.setState({showAnswersUpdateModal: false})
                    }}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper, height: 'auto', position: 'absolute'
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"showAnswersUpdateModal"} swipeArea={100}>
                    <View style={CommonStyles.styles.commonSwipeBar}
                    />
                    <Content showsVerticalScrollIndicator={false}>

                        {
                            activityContext && activityContext?.schedule?.questionAnswers?.length >= 4
                            && this.refScreen === 'UserActivities'
                                ? this.renderUserScheduleQAResponses()
                                : <View>
                                    <Text style={styles.mainHeadingH3}>Would you like to answer a few questions?</Text>
                                    <Text style={styles.answerModalSubText}>These questions help our guests to reflect on
                                        their activities, set intentions,
                                        and improve their success at achieving their reward.</Text>
                                </View>
                        }

                    </Content>
                    <View style={styles.modalButtons}>
                        {
                            activityContext && activityContext?.schedule?.questionAnswers?.length >= 4
                            && this.refScreen === 'UserActivities'
                            && <Text style={styles.modalButtonText}>Do you want to update responses?</Text>
                        }
                        <SecondaryButton
                            text={activityContext && activityContext?.schedule?.questionAnswers?.length >= 4
                            && this.refScreen === 'UserActivities'
                                ? 'Don’t update' : 'No, thanks'}
                            onPress={() => {
                                this.backClicked()
                            }}
                        />
                        <PrimaryButton
                            text={activityContext && activityContext?.schedule?.questionAnswers?.length >= 4
                            && this.refScreen === 'UserActivities'
                                ? 'Update (+1 token)' : 'Answer (+1 token)'}
                            onPress={() => {
                                this.setState({
                                    showAnswersUpdateModal: false,
                                    answerOrUpdate: true,
                                    showQuestionModal: true
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
                        ...CommonStyles.styles.commonModalWrapper, height: 'auto', position: 'absolute'
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
                        {this.props.revamp.revampContext.tokens >= 5 ? <Text style={{
                            ...styles.subText, ...TextStyles.mediaTexts.manropeRegular,
                            color: Colors.colors.lowContrast,
                            paddingTop: 16,
                            paddingBottom: 27
                        }}>Now you have
                            <Text style={{
                                ...styles.subText, ...TextStyles.mediaTexts.manropeBold,
                                color: Colors.colors.successText
                            }}> {this.props.revamp.revampContext.tokens} tokens.</Text>
                            You can save them for later or spin the wheel now and use your 5 tokens to earn reward.
                        </Text> : <Text style={{
                            ...styles.subText, ...TextStyles.mediaTexts.manropeRegular,
                            color: Colors.colors.lowContrast,
                            paddingTop: 16,
                            paddingBottom: 27
                        }}>You have
                            <Text style={{
                                ...styles.subText, ...TextStyles.mediaTexts.manropeBold,
                                color: Colors.colors.successText
                            }}> {
                                this.props.revamp.revampContext.tokens > 0
                                    ? this.props.revamp.revampContext.tokens
                                    : 1} token{this.props.revamp.revampContext.tokens > 1 && 's'}</Text>
                            . Earn
                            <Text style={{
                                ...styles.subText, ...TextStyles.mediaTexts.manropeBold,
                                color: Colors.colors.successText
                            }}> {5 - (this.props.revamp.revampContext.tokens > 0 ? this.props.revamp.revampContext.tokens : 1)} more </Text>
                            and you can spin the prize wheel.
                        </Text>}
                        <View style={{paddingBottom: 34, paddingTop: 40}}>
                            {this.props.revamp.revampContext.tokens >= 5 && < SecondaryButton
                                text={"Save for later"}
                                onPress={() => {
                                    this.props.navigation.goBack();
                                }}
                            />}
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
                        height: childQuestion.name.includes('Do you think this activity aligns with your values?') ? '90%' : 'auto',
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
            </Container>);
    };
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 15, paddingLeft: 0, paddingRight: 0, height: HEADER_SIZE, ...CommonStyles.styles.headerShadow
    }, backButton: {
        marginLeft: 18, width: 40,
    }, headerRow: {
        flex: 3, alignItems: 'center',
    }, headerText: {
        ...TextStyles.mediaTexts.manropeBold, ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        textAlign: 'center',
    }, questionWrapper: {
        marginTop: 0, // paddingHorizontal: 24,
    }, questionsBg: {
        width: '100%', position: 'absolute', // top: -100
    }, iconImg: {
        height: 24, width: 24, // marginBottom:100,
    }, imageIcon: {
        height: 89.33, width: 120, marginBottom: 32,
    }, sectionWrapper: {
        // marginTop: 24,
        // padding: 14
    }, mainContentWrapper: {
        // padding: 24,
        marginBottom: 32, paddingHorizontal: 24
    }, statementList: {
        paddingHorizontal: 24, marginBottom: 40
    }, mainHeading: {
        ...TextStyles.mediaTexts.serifProExtraBold, ...TextStyles.mediaTexts.TextH1,
        lineHeight: 40,
        color: Colors.colors.highContrast, // marginTop: 20,
        textAlign: 'left'
    }, rewardText: {
        ...TextStyles.mediaTexts.manropeBold, ...TextStyles.mediaTexts.subTextL,
        color: Colors.colors.highContrast,
        textAlign: 'left',
        marginVertical: 8
    }, mainHeadingH3: {
        ...TextStyles.mediaTexts.serifProBold, ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast, // marginTop: 20,
        textAlign: 'left',
    }, subHeading: {
        ...TextStyles.mediaTexts.manropeRegular, ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        marginTop: 8, // marginBottom: 16,
    }, headTextWrap: {
        display: 'flex', flexDirection: 'row'
    }, headMainText: {
        color: Colors.colors.highContrast, ...TextStyles.mediaTexts.subTextM, ...TextStyles.mediaTexts.manropeBold,
        marginBottom: 4,
        marginLeft: 16,
        marginTop: 15, // justifyContent: 'center',
        // alignItems: 'center',
    }, numericListNumberBox: {
        height: 34,
        width: 35,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.colors.whiteColor, ...CommonStyles.styles.shadowBox,
        borderRadius: 4
    }, numericListNumber: {
        ...TextStyles.mediaTexts.serifProBold, ...TextStyles.mediaTexts.TextH4,
        color: Colors.colors.mainPink,
        textAlign: 'center'
    }, numericListText: {
        ...TextStyles.mediaTexts.manropeRegular, ...TextStyles.mediaTexts.TextH7, color: Colors.colors.highContrast,
    }, toggleButtonText: {
        color: Colors.colors.highContrast, ...TextStyles.mediaTexts.subTextM, ...TextStyles.mediaTexts.manropeBold,
    }, iconBg: {
        height: 48,
        width: 48,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.colors.whiteColor, ...CommonStyles.styles.shadowBox,
        borderRadius: 5
    }, chipWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        width: '100%',
        marginBottom: 32,
    }, chipView: {
        backgroundColor: Colors.colors.highContrastBG,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 12,
        paddingRight: 12,
        borderRadius: 16,
        marginRight: 4,
        marginBottom: 8,
    }, chipText: {
        ...TextStyles.mediaTexts.manropeRegular, ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.mediumContrast,
    }, textAreaContainer: {
        marginBottom: 32, paddingHorizontal: 24
    }, switchContainer: {
        flexDirection: 'row', marginVertical: 32, paddingHorizontal: 24
    }, activityName: {
        ...TextStyles.mediaTexts.serifProExtraBold, ...TextStyles.mediaTexts.TextH1,
        lineHeight: 40,
        color: Colors.colors.highContrast,
        textAlign: 'left'
    }, contentImage: {
        height: 40, width: 40
    }, contentTitle: {
        ...TextStyles.mediaTexts.TextH5, ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast,
        textAlign: 'center',
        paddingTop: 16,
    }, contentDescs: {
        ...TextStyles.mediaTexts.bodyTextExtraS, ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast,
        textAlign: 'center',
    }, subText: {
        ...TextStyles.mediaTexts.bodyTextM, ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast,
        textAlign: 'center',
        paddingHorizontal: 24
    }, imageButton: {
        justifyContent: 'center', alignItems: 'center', paddingVertical: 29
    }, secondaryButton: {
        borderRadius: 8,
        height: 155,
        width: 155,
        borderWidth: 1,
        borderColor: Colors.colors.mainBlue40,
        backgroundColor: Colors.colors.whiteColor, ...CommonStyles.styles.shadowBox,
        marginBottom: 16,
    }, secondaryButtonInactive: {
        borderRadius: 8,
        height: 155,
        width: 155,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: Colors.colors.borderColor,
        marginBottom: 16,
    }, contentWrap: {
        flexDirection: 'row', // padding:12,
        position: 'relative', alignItems: 'center'
    }, buttonText: {
        ...TextStyles.mediaTexts.bodyTextS, ...TextStyles.mediaTexts.manropeMedium, width: "100%"
    }, textAreaMainHeading: {
        ...TextStyles.mediaTexts.subTextM, ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast,
        marginBottom: 4
    }, textAreaSubHeading: {
        ...TextStyles.mediaTexts.TextH7, ...TextStyles.mediaTexts.manropeMedium, color: Colors.colors.highContrast, // marginBottom: 8
    },
    overlayBG: {
        backgroundColor: 'rgba(37,52,92,0.35)', zIndex: -1
    },
    ratingScaleSelectedValue: {
        ...TextStyles.mediaTexts.manropeExtraBold, ...TextStyles.mediaTexts.TextH1,
        lineHeight: 40,
        color: Colors.colors.mainPink,
        textTransform: 'uppercase'
    }, sectionItemContentText: {
        width: 220, ...TextStyles.mediaTexts.subTextS, ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast,
    }, sectionItemHeadingText: {
        // color: '#25345c',
        ...TextStyles.mediaTexts.subTextS, ...TextStyles.mediaTexts.manropeBold, color: Colors.colors.lowContrast,
    }, sectionItemHeadingSubText: {
        // color: '#25345c',
        ...TextStyles.mediaTexts.subTextS, ...TextStyles.mediaTexts.manropeLight,
        color: Colors.colors.lowContrast,
        paddingLeft: 4
    }, planItemSectionWrapper: {
        display: 'flex', flexDirection: 'row', // justifyContent: 'flex-start',
        padding: 24, // width:'100%',
        alignItems: 'center',
    }, sectionItemHeadingIconRed: {
        height: 24,
        width: 24,
        backgroundColor: Colors.colors.errorIcon,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: "center"
    }, sectionShape: {
        width: 4,
        height: 40,
        backgroundColor: Colors.colors.lowContrast,
        alignItems: 'center',
        marginLeft: 'auto',
        borderBottomLeftRadius: 5,
        borderTopLeftRadius: 5
    }, sectionItem: {
        ...CommonStyles.styles.shadowBox, // borderWidth: 1,
        // borderColor: 'red',
        padding: 24, // margin:20,
        width: '98%', marginBottom: 8, borderRadius: 12, height: 137, backgroundColor: Colors.colors.whiteColor,
    }, sectionItemHeading: {
        display: 'flex', flexDirection: 'row',
    }, sectionItemContent: {
        display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
    }, continueButtonWrapper: {
        backgroundColor: Colors.colors.white, padding: 24, paddingBottom: isIphoneX() ? 34 : 24
        // opacity:0.3
    }, secondaryBtn: {
        marginBottom: 16
    }, actionBtnWrapper: {
        paddingLeft: 24, paddingRight: 24, paddingBottom: isIphoneX() ? 34 : 24
    }, actionSecondaryBtn: {
        marginBottom: 16,
    }, ratingScaleLabel: {
        ...TextStyles.mediaTexts.manropeMedium, ...TextStyles.mediaTexts.inputLabel,
        color: Colors.colors.mediumContrast,
    }, btnActive: {
        borderRadius: 8,
        borderWidth: 1, ...CommonStyles.styles.shadowBox,
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
    }, btnInactive: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.colors.borderColor,
        marginBottom: 0, ...CommonStyles.styles.shadowBox,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        textTransform: 'none',
        backgroundColor: Colors.colors.whiteColor,
        paddingTop: 0,
        paddingBottom: 0,
        height: 64
    }, btnText: {
        textTransform: 'none', ...TextStyles.mediaTexts.TextH7, ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast,
        textAlign: 'center',
    }, reward: {
        marginBottom: 40, alignSelf: 'center', height: 120, width: 120,
    }, wrapper: {
        alignItems: 'center'
    }, modalIcon: {
        marginTop: 0, marginBottom: 24, width: 80, height: 80
    }, modalText: {
        ...TextStyles.mediaTexts.TextH3, ...TextStyles.mediaTexts.serifProBold, color: Colors.colors.highContrast,
    }, modalCheckInText: {
        ...TextStyles.mediaTexts.subTextS, ...TextStyles.mediaTexts.manropeBold, color: Colors.colors.primaryText,
    }, itemsList: {
        width: '100%', marginVertical: 40
    }, singleItem: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16
    }, itemText: {
        ...TextStyles.mediaTexts.bodyTextS, ...TextStyles.mediaTexts.manropeMedium, color: Colors.colors.highContrast,
    }, modalCheckIcon: {
        marginRight: 4
    }, modalCrossIcon: {
        marginRight: 4
    }, modalCircle: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        backgroundColor: Colors.colors.successBG
    }, modalCircleText: {
        ...TextStyles.mediaTexts.bodyTextS, ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.successText,
        textAlign: 'center'
    }, noText: {
        ...TextStyles.mediaTexts.bodyTextS, ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.successText,
        textAlign: 'center'
    }, yesText: {
        ...TextStyles.mediaTexts.bodyTextS, ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.secondaryText,
        textAlign: 'center',
    }, modalButtons: {
        paddingBottom: isIphoneX() ? 34 : 24
    }, modalButtonText: {
        ...TextStyles.mediaTexts.bodyTextM, ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast,
        marginBottom: 24,
        textAlign: 'center'
    },
    answerModalSubText: {
        ...TextStyles.mediaTexts.bodyTextM,
        lineHeight: 27.2,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.mediumContrast,
        marginBottom: 40
    }
});

const schedulingQuestions = [
    {
        "id": "61b8106dcbff270001ca0777",
        "name": "How much pleasure do you think this activity will bring to you?",
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
            "valuesGroups": [{
                "name": "", "icon": "", "colorCode": "", "lowLabel": "None", "highLabel": "Tons", "values": []
            }],
            "actionButtons": [{
                "name": "Continue",
                "action": "NEXT",
                "primary": true,
                "primarySelectedText": "",
                "position": "ENABLED_BELOW"
            }],
            "responseBased": true,
            "backgroundImage": "",
            "dynamicProfileElement": {
                "key": "selectedActivity - Activity Pleasure Level Perceived",
                "type": "RATING_SCALE",
                "method": "ALL_RESPONSES_WITH_DATE_TIME_STAMPS"
            }
        }
    },
    {
        "id": "61b8106dcbff270001ca0778",
        "name": "Do you think this activity aligns with your values?",
        "revampMetaData": {
            "description": {
                "subtitle": "",
                "type": "NUMERIC_LIST",
                "values": ["#{ReVAMP Core value I statement 1}", "#{ReVAMP Core value I statement 2}", "#{ReVAMP Core value I statement 3}", "#{ReVAMP Core value I statement 4}", "#{ReVAMP Core value I statement 5}"]
            },
            "inputType": "SINGLE_SELECT",
            "renderType": "DIALOG",
            "displayType": "BUTTON_LIST",
            "mappedValue": "",
            "minSelection": 0,
            "maxSelection": 0,
            "valuesGroups": [{
                "name": "", "icon": "", "colorCode": "", "lowLabel": "", "highLabel": "", "values": [{
                    "name": "I'm not sure",
                    "subText": "",
                    "colorCode": "",
                    "exampleText": "",
                    "placeholder": "",
                    "icon": ""
                }, {
                    "name": "Not Aligned",
                    "subText": "",
                    "colorCode": "",
                    "exampleText": "",
                    "placeholder": "",
                    "icon": ""
                }, {
                    "name": "Aligned", "subText": "", "colorCode": "", "exampleText": "", "placeholder": "", "icon": ""
                }]
            }],
            "actionButtons": [{
                "name": "Continue",
                "action": "NEXT",
                "primary": true,
                "primarySelectedText": "",
                "position": "DISABLED_BELOW"
            }],
            "responseBased": true,
            "backgroundImage": "",
            "dynamicProfileElement": {
                "key": "selectedActivity - Activity Value Alignment Perceived",
                "type": "USER_DEFINED_VALUES",
                "method": "ALL_RESPONSES_WITH_DATE_TIME_STAMPS"
            }
        }
    },
    {
        "id": "61b8106dcbff270001ca0779",
        "name": "Do you think doing this activity will bring you closer to your reward?",
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
            "valuesGroups": [{
                "name": "", "icon": "", "colorCode": "", "lowLabel": "", "highLabel": "", "values": [{
                    "name": "I don't know",
                    "subText": "",
                    "colorCode": "",
                    "exampleText": "",
                    "placeholder": "",
                    "icon": ""
                }, {
                    "name": "No", "subText": "", "colorCode": "", "exampleText": "", "placeholder": "", "icon": ""
                }, {
                    "name": "Yes", "subText": "", "colorCode": "", "exampleText": "", "placeholder": "", "icon": ""
                }]
            }],
            "actionButtons": [{
                "name": "Continue",
                "action": "NEXT",
                "primary": true,
                "primarySelectedText": "",
                "position": "DISABLED_BELOW"
            }],
            "responseBased": true,
            "backgroundImage": "",
            "dynamicProfileElement": {
                "key": "selectedActivity - Activity Reward Progress Perceived",
                "type": "USER_DEFINED_VALUES",
                "method": "ALL_RESPONSES_WITH_DATE_TIME_STAMPS"
            }
        }
    },
    {
        "id": "61b8106dcbff270001ca077a",
        "name": "Is there anything that could prevent you from doing this activity?",
        "revampMetaData": {
            "description": {
                "subtitle": "Think about any barriers or obstacles that would get in the way.",
                "type": "ONE_LINER",
                "values": []
            },
            "inputType": "SINGLE_SELECT",
            "renderType": "DIALOG",
            "displayType": "BUTTON_LIST",
            "mappedValue": "",
            "minSelection": 0,
            "maxSelection": 0,
            "valuesGroups": [{
                "name": "", "icon": "", "colorCode": "", "lowLabel": "None", "highLabel": "Tons", "values": [{
                    "name": "Yes, possibly",
                    "subText": "",
                    "colorCode": "",
                    "exampleText": "",
                    "placeholder": "",
                    "icon": ""
                }, {
                    "name": "No, I don't think so",
                    "subText": "",
                    "colorCode": "",
                    "exampleText": "",
                    "placeholder": "",
                    "icon": ""
                }]
            }],
            "actionButtons": [{
                "name": "Continue",
                "action": "NEXT",
                "primary": true,
                "primarySelectedText": "",
                "position": "DISABLED_BELOW"
            }],
            "responseBased": true,
            "backgroundImage": "",
            "dynamicProfileElement": {
                "key": "selectedActivity - Activity Blockers Present",
                "type": "USER_DEFINED_VALUES",
                "method": "ALL_RESPONSES_WITH_DATE_TIME_STAMPS"
            },
            "children": [{
                "id": "61b8106dcbff270001ca077b", "name": "How can you handle these obstacles?", "revampMetaData": {
                    "description": {
                        "subtitle": "For example, doing the activity for less time. Or doing it instead of doing something else.",
                        "type": "ONE_LINER",
                        "values": []
                    },
                    "inputType": "TEXT_INPUT",
                    "renderType": "DIALOG",
                    "displayType": "INPUT_FIELD",
                    "mappedValue": "Yes, possibly",
                    "minSelection": 0,
                    "maxSelection": 0,
                    "valuesGroups": [{
                        "name": "", "icon": "", "colorCode": "", "lowLabel": "", "highLabel": "", "values": [{
                            "name": "",
                            "subText": "",
                            "colorCode": "",
                            "exampleText": "",
                            "placeholder": "Write any obstacle you have in your mind",
                            "icon": ""
                        }]
                    }],
                    "actionButtons": [{
                        "name": "Continue",
                        "action": "NEXT",
                        "primary": true,
                        "primarySelectedText": "",
                        "position": "ENABLED_BELOW"
                    }],
                    "responseBased": true,
                    "backgroundImage": "",
                    "dynamicProfileElement": {
                        "key": "selectedActivity - Activity Blocker Mitigation",
                        "type": "TEXT_INPUT",
                        "method": "ALL_RESPONSES_WITH_DATE_TIME_STAMPS"
                    }
                }
            }]
        }
    },
    {
        "id": "61b8106dcbff270001ca077c", "name": "Would you like to schedule another activity?", "revampMetaData": {
            "description": {
                "subtitle": "Planning time in your schedule, even just a few minutes, can help ensure  you complete your activities. ",
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
                    "action": "START_CHECKIN",
                    "primary": false,
                    "primarySelectedText": "",
                    "position": "ENABLED_BELOW"
                }, {
                    "name": "Select activity",
                    "action": "CLOSE",
                    "primary": true,
                    "primarySelectedText": "",
                    "position": "ENABLED_BELOW"
                }],
            "responseBased": true,
            "backgroundImage": ""
        }
    }
]

export default connectRevamp()(RevampScheduleActivityScreen);
