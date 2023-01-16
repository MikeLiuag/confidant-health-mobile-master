import React, {Component} from 'react';
import {BackHandler, FlatList, Image, Platform, StatusBar, StyleSheet, TouchableOpacity} from 'react-native';
import {Accordion, Body, Button, Container, Content, Header, Icon, Left, Right, Text, Title, View} from 'native-base';
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
import {Screens} from "../../constants/Screens";
import {SingleAccordionItem} from "./SingleAccordionItem.component";
import {
    REVAMP_ACTION_BUTTON_ACTIONS,
    REVAMP_ACTION_BUTTON_POSITIONS,
    REVAMP_DESCRIPTION_TYPE,
    REVAMP_ON_BOARDING_TYPES,
    REVAMP_POPUP_BEHAVIOR,
    REVAMP_QUESTION_RENDER_TYPE,
    REVAMP_VALUE_INPUT_TYPE,
    REVAMP_VALUES_DISPLAY_TYPE,
    S3_BUCKET_LINK
} from "../../constants/CommonConstants";
import {ToggleSwitch} from "ch-mobile-shared/src/components/ToggleSwitch";
import {connectRevamp} from "../../redux";
import {ContentLoader} from "../../components/content-loader/ContentLoader";
import {Slider} from "react-native-elements";
import ProfileService from "../../services/Profile.service";

const HEADER_SIZE = getHeaderHeight();


class RevampSundayCheckInQuestionsScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.revampTypeData = navigation.getParam("revampTypeData", null);
        this.currentIndex = navigation.getParam("currentIndex", 0);
        this.state = {
            isLoading: false,
            isContentLoading: true,
            childQuestion: null,
            currentIndex: this.currentIndex,
            showQuestionModal: false,
            showPopupModal: false,
            popupDetail: null,
            answers: this.initializeEmptyState(this.revampTypeData.children),
            showCloseModal: false,
            dataElements: []
        }
    }

    initializeEmptyState = (questions) => {
        let map = new Map();
        if (questions && questions.length > 0) {
            questions.map(question => {
                this.answersMap(question, map, null)
            })
        }
        return map;
    };

    answersMap = (question, map) => {
        const revampSundayCheckIn = this.props.revamp.revampSundayCheckIn

        let answers = []
        if (question.revampMetaData.inputType === "RATING_SCALE") {
            answers = ['52']
        }
        let typeContext;
        if (revampSundayCheckIn) {
            if (this.revampTypeData.name === "Progress") {
                typeContext = revampSundayCheckIn.progress
                if (this.currentIndex === 0) {
                    answers = [typeContext.rewardProgress > 0 ? typeContext.rewardProgress : 52]
                } else {
                    answers = typeContext.howCanWeHelp?.length > 0 ? typeContext.howCanWeHelp : []
                }
            }
        }

        let {inputType} = question.revampMetaData;
        if (REVAMP_VALUE_INPUT_TYPE[inputType] === REVAMP_VALUE_INPUT_TYPE.BOOLEAN) {
            answers = [false]
        }
        map.set(
            question.id,
            {
                profileElementKey: question.revampMetaData?.profileElement?.key,
                answers,
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
            children.map(child => {
                this.answersMap(child, map)
            })
        }
    }

    addProfileElement = async (question) => {
        try {
            let payLoad = {profileElements: []}
            let {answers} = this.state;
            let {children, profileElement} = question.revampMetaData;
            if (children && children.length > 0) {
                children.map(childQuestion => {
                    if (REVAMP_QUESTION_RENDER_TYPE[childQuestion.revampMetaData.renderType] === REVAMP_QUESTION_RENDER_TYPE.INLINE && childQuestion.revampMetaData.profileElement) {
                        payLoad.profileElements.push({
                            profileElementKey: childQuestion.revampMetaData.profileElement.key,
                            profileElementValue: answers.get(childQuestion.id).answers,
                        })
                    }

                })
            }
            if (profileElement) {
                if (profileElement.type === "YES_NO") {
                    if (answers.get(question.id).answers[0] === true) {
                        answers.get(question.id).answers = ["Yes"]
                    } else if (answers.get(question.id).answers[0] === false) {
                        answers.get(question.id).answers = ["No"]
                    }
                }
                payLoad.profileElements.push(
                    {
                        profileElementKey: profileElement.key,
                        profileElementValue: answers.get(question.id).answers,
                    }
                )
            }
            const response = await ProfileService.addMultipleProfileElement(payLoad);
            if (response.errors) {
                console.log(response.errors[0].endUserMessage);
            }
        } catch (e) {
            console.log(e);
        }
    };

    updateSundayCheckIn = async (question) => {
        try {
            let {answers, currentIndex, childQuestion} = this.state;
            let {children} = this.revampTypeData;
            let currentQuestionSelections = answers.get(question.id).answers;
            if (this.revampTypeData.name === "Progress") {
                if (this.currentIndex === 0) {
                    this.props.revamp.revampSundayCheckIn.progress.rewardProgress = currentQuestionSelections[0]
                } else {
                    this.props.revamp.revampSundayCheckIn.progress.howCanWeHelp = currentQuestionSelections
                }
                if (currentIndex + 1 === this.revampTypeData.children.length) {
                    this.props.revamp.revampSundayCheckIn.progress.status = "COMPLETED"
                }


            }
            if (this.revampTypeData.name === "Mind & Body") {
                let negativeImpact = false;
                if (childQuestion){
                    negativeImpact = currentQuestionSelections[0] === 'Yes';
                }
                if (this.props.revamp.revampSundayCheckIn.mindAndBody.questionsAnswers && this.props.revamp.revampSundayCheckIn.mindAndBody.questionsAnswers.length > 0) {
                        if (this.props.revamp.revampSundayCheckIn.mindAndBody.questionsAnswers.some(quest => quest.question === this.revampTypeData.children[currentIndex].name)) {
                            let quest = this.props.revamp.revampSundayCheckIn.mindAndBody.questionsAnswers.find(quest => quest.question === this.revampTypeData.children[currentIndex].name)
                            if (!childQuestion) {
                                quest.answer = currentQuestionSelections[0] === 'Yes'
                            }
                            quest.negativeImpact = negativeImpact
                        } else {
                            this.props.revamp.revampSundayCheckIn.mindAndBody.questionsAnswers.push({
                                question: this.revampTypeData.children[currentIndex].name,
                                answer: currentQuestionSelections[0] === 'Yes',
                                negativeImpact
                            })
                        }
                } else {
                    this.props.revamp.revampSundayCheckIn.mindAndBody.questionsAnswers = [{
                        question: this.revampTypeData.children[currentIndex].name,
                        answer: currentQuestionSelections[0] === 'Yes',
                        negativeImpact
                    }]
                }
                if (currentIndex + 1 === this.revampTypeData.children.length) {
                    this.props.revamp.revampSundayCheckIn.mindAndBody.status = "COMPLETED"
                }
            }
            if (this.props.revamp.revampSundayCheckIn.progress.status === "COMPLETED" && this.props.revamp.revampSundayCheckIn.mindAndBody.status === "COMPLETED" && this.props.revamp.revampSundayCheckIn.plan.status === "COMPLETED") {
                this.props.revamp.revampSundayCheckIn.sundayCheckInStatus = 'COMPLETED'
            }
            await this.props.updateRevampSundayCheckin({revampSundayCheckIn: this.props.revamp.revampSundayCheckIn});
            await this.addProfileElement(question);
        } catch (e) {
            console.log(e);
        }
    };

    backClicked = () => {
        this.props.navigation.goBack();
    };

    navigateToSundayCheckIn = () => {
        const {services} = this.state;
        let revampContextDetails = this.props.revamp.revampContext;
        this.props.navigation.navigate(Screens.SUNDAY_CHECK_IN_HOME_SCREEN, {
            revampContextDetails,
            services
        })
    }

    setAnswers = (item, inputType, questionId) => {
        let {answers} = this.state;
        let currentQuestionAnswers = answers.get(questionId).answers;
        if (currentQuestionAnswers.includes(item)
            && REVAMP_VALUE_INPUT_TYPE[inputType] !== REVAMP_VALUE_INPUT_TYPE.RATING_SCALE) {
            currentQuestionAnswers.splice(currentQuestionAnswers.indexOf(item), 1)
        } else {

            if ((REVAMP_VALUE_INPUT_TYPE[inputType] === REVAMP_VALUE_INPUT_TYPE.SINGLE_SELECT
                    || REVAMP_VALUE_INPUT_TYPE[inputType] === REVAMP_VALUE_INPUT_TYPE.RATING_SCALE
                )
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

    renderList = (question) => {
        let {answers, currentIndex} = this.state;
        let currentQuestionAnswers = answers.get(question.id).answers;
        let {
            inputType,
            renderType,
            displayType,
            responseBased,
            valuesGroups,
            popups,
            actionButtons,
            minSelection, maxSelection
        } = question.revampMetaData;
        let list = valuesGroups[0]?.values ? valuesGroups[0]?.values : [];
        if (responseBased && list.length < 1) {
            let {valuesGroups} = this.revampTypeData.children[currentIndex - 1].revampMetaData;
            if (valuesGroups
                && valuesGroups.length > 0) {
                list = valuesGroups.flatMap(groups => groups.values)
                    .filter(value => answers.get(this.revampTypeData.children[currentIndex - 1].id).answers.includes(value.name))
            }
        }
        let {checkInFlow, scheduleFlow} = false;
        if (popups && popups.length > 0) {
            checkInFlow = popups?.flatMap(popup => popup.promptOptions).some(promptOption => {
                return REVAMP_ACTION_BUTTON_ACTIONS[promptOption.action] === REVAMP_ACTION_BUTTON_ACTIONS.CHECK_IN_ACTIVITY
            })
            scheduleFlow = popups?.flatMap(popup => popup.promptOptions).some(promptOption => {
                return REVAMP_ACTION_BUTTON_ACTIONS[promptOption.action] === REVAMP_ACTION_BUTTON_ACTIONS.SCHEDULE_ACTIVITY
            })
        }


        if (REVAMP_VALUES_DISPLAY_TYPE[displayType] === REVAMP_VALUES_DISPLAY_TYPE.CHECK_LIST) {
            return (
                <View style={{marginBottom: 8}}>
                    {
                        list.map((item, index) => {
                            return (
                                <SingleAccordionItem
                                    keyId={index}
                                    listPress={() => {
                                        this.setAnswers(valueExists(item.name) ? item.name : item, inputType, question.id)
                                    }}
                                    itemSelected={currentQuestionAnswers.includes(valueExists(item.name) ? item.name : item)}
                                    itemTitle={valueExists(item.name) ? item.name : item}
                                    keyExtractor={item => item.name}
                                />
                            )
                        })
                    }
                </View>
            );
        } else if (REVAMP_VALUES_DISPLAY_TYPE[displayType] === REVAMP_VALUES_DISPLAY_TYPE.BUTTON_LIST) {
            return (
                <View style={{marginBottom: 8, paddingHorizontal: 24}}>
                    {
                        list.map((item) => {
                            return (
                                <View style={{marginBottom: 8}}>
                                    <Button
                                        style={
                                            !currentQuestionAnswers.includes(item.name)
                                                ? styles.btnInactive : styles.btnActive}
                                        onPress={() => {
                                            this.setAnswers(item.name, inputType, question.id)

                                        }}
                                        keyExtractor={item => item.name}
                                    >
                                        <Text style={{
                                            ...styles.btnText,
                                            color: !currentQuestionAnswers.includes(item.name)
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
        } else if (REVAMP_VALUES_DISPLAY_TYPE[displayType] === REVAMP_VALUES_DISPLAY_TYPE.TILED_BUTTON_LIST ||
            REVAMP_VALUES_DISPLAY_TYPE[displayType] === REVAMP_VALUES_DISPLAY_TYPE.TILED_IMAGE_BUTTON_LIST
        ) {
            return (
                <View style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    paddingHorizontal: 24
                }}>
                    {
                        list.map((item) => {
                            return <View style={{marginRight: 17, marginBottom: 17, width: '45%'}}>
                                {
                                    REVAMP_VALUES_DISPLAY_TYPE[displayType] === REVAMP_VALUES_DISPLAY_TYPE.TILED_IMAGE_BUTTON_LIST
                                        ? <Button
                                            style={
                                                !currentQuestionAnswers.includes(item.name)
                                                    ? styles.imageBtnInactive : styles.imageBtnActive}
                                            onPress={() => {
                                                if (scheduleFlow && this.props.revamp.revampContext?.activities
                                                    && this.props.revamp.revampContext.activities
                                                        .some(activityContext => {
                                                            return activityContext.activity.name === item.name
                                                                && activityContext.schedule
                                                        })) {

                                                } else if (checkInFlow && this.props.revamp.revampContext.activities
                                                    .some(activityContext => {
                                                        return activityContext.activity.name === item.name
                                                            && activityContext.checkIns
                                                            && activityContext.checkIns.length > 0
                                                    })) {
                                                    currentQuestionAnswers.splice(currentQuestionAnswers.indexOf(item.name), 1)
                                                } else {
                                                    this.setAnswers(item.name, inputType, question.id)
                                                }
                                            }}
                                            keyExtractor={item => item.name}
                                        >
                                            <View style={{
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                height: 155,
                                                width: 155,
                                                borderRadius: 8,
                                                position: 'relative',
                                                paddingHorizontal: 16,
                                                paddingBottom: 30,
                                                paddingTop: 32,

                                            }}>
                                                <View style={{position: 'absolute', top: 8, right: 8}}>
                                                    {this.props.revamp.revampContext?.activities
                                                        && this.props.revamp.revampContext.activities
                                                            .some(activityContext => {
                                                                return activityContext.activity.name === item.name
                                                                    && activityContext.schedule
                                                            })
                                                        &&
                                                        <Image resizeMode={'contain'}
                                                               style={{height: 19.9, width: 20}}
                                                               source={require("../../assets/images/calenderCheck.png")}/>
                                                    }
                                                </View>
                                                <View style={styles.activityBox}>
                                                    <Image resizeMode={'contain'}
                                                           style={{...styles.contentImage}}
                                                           source={{uri: item.icon && S3_BUCKET_LINK + item.icon}}
                                                    />
                                                    <Text style={styles.activityName}>{item.name}</Text>
                                                    <Text style={styles.checkInsText}>{
                                                        this.props.revamp.revampContext?.activities
                                                        && this.props.revamp.revampContext.activities
                                                            .some(activityContext => {
                                                                return activityContext.activity.name === item.name
                                                                    && activityContext.checkIns
                                                                    && activityContext.checkIns.length > 0
                                                            })
                                                            ? this.props.revamp.revampContext.activities
                                                            .find(activityContext => activityContext.activity.name === item.name).checkIns.length + ' check-ins'
                                                            : 'No check-ins'
                                                    }</Text>
                                                </View>
                                            </View>
                                        </Button>
                                        :
                                        <Button
                                            style={
                                                !currentQuestionAnswers.includes(item.name)
                                                    ? styles.btnInactive : styles.btnActive}
                                            onPress={() => {
                                                this.setAnswers(item.name, inputType, question.id)

                                            }}
                                            keyExtractor={item => item.name}
                                        >
                                            <Text style={{
                                                ...styles.btnText,
                                                color: !currentQuestionAnswers.includes(item.name)
                                                    ? Colors.colors.highContrast
                                                    : Colors.colors.primaryText
                                            }} uppercase={false}>{item.name}</Text>
                                        </Button>
                                }
                            </View>
                        })
                    }
                </View>
            );
        }
    }

    nextQuestion = async (button, question) => {
        let {currentIndex, answers, popupDetail} = this.state;
        let currentQuestionAnswers = answers.get(question.id).answers;
        let {children} = question.revampMetaData;
        await this.updateSundayCheckIn( question)
        if (currentIndex + 1 === this.revampTypeData.children.length) {
            if (popupDetail !== null) {
                this.setState({
                    showPopupModal: false,
                    showQuestionModal: false,
                    popupDetail: null
                })
            }

            if (
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
                                childQuestion: child
                            })
                    }
                })
            } else {
                this.props.fetchRevampSundayCheckin(this.props.revamp.revampSundayCheckIn.id);
                this.props.fetchRevampSundayCheckinsList();
                this.navigateToSundayCheckIn();
            }
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
            if (popupDetail !== null) {
                this.setState({showPopupModal: false, popupDetail: null})
            }
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
                            childQuestion: child
                        })
                }
            })
        } else {
            if (currentQuestionAnswers.length > 0) {
                this.setState({
                    showQuestionModal: false,
                    childQuestion: null,
                    popupDetail: null
                })
            }
            this.setState({
                childQuestion: null,
                popupDetail: null
            })
            this.props.navigation.push(Screens.REVAMP_SUNDAY_CHECK_IN_QUESTIONS_SCREEN, {
                ...this.props.navigation.state.params,
                currentIndex: this.state.currentIndex + 1
            })
        }
    }

    actionButtonDisabled = (button, question) => {
        let {answers} = this.state;
        let disabled = false;
        let currentQuestionAnswers = answers.get(question.id).answers;
        let {
            children
        } = question.revampMetaData;

        if (REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_BELOW) {
            if (children && children.length > 0) {
                children.map(child => {
                        if (answers.get(child.id).answers.length === 0) {
                            disabled = true;
                        }
                    }
                )
            }
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
                    <View style={styles.actionPrimaryBtn}>
                        <PrimaryButton
                            type={'Feather'}
                            disabled={this.actionButtonDisabled(button, question)}
                            color={Colors.colors.mainBlue20}
                            text={buttonText}
                            size={24}
                            onPress={() => {
                                this.nextQuestion(button, question)
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
                            this.nextQuestion(button, question)
                        }}
                        text={button.name}
                        size={24}
                    />
                </View>
            )
        }
    }

    renderRatingScale = (question) => {
        let {answers} = this.state;
        let {inputType, displayType, valuesGroups, minSelection, maxSelection} = question.revampMetaData;
        if (REVAMP_VALUES_DISPLAY_TYPE[displayType] !== REVAMP_VALUES_DISPLAY_TYPE.RATING_SCALE) {
            return null;
        }
        let questionId = question.id;
        answers = answers.get(questionId).answers;
        return (
            <View style={{flexDirection: 'column', paddingTop: 40, paddingHorizontal: 24, marginBottom: 32}}>
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
                        value={answers[0].toString()}
                        animateTransitions={false}
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

    async componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    }

    renderQuestion = (question, questionIndex, isInlineQuestion) => {
        let {renderType, description, children, actionButtons} = question.revampMetaData;
        let {currentIndex} = this.state;

        return (
            <>
                <View style={!isInlineQuestion && styles.questionWrapper}>
                    {REVAMP_QUESTION_RENDER_TYPE[renderType] !== REVAMP_QUESTION_RENDER_TYPE.INLINE
                        &&
                        <>
                            <View style={{
                                ...styles.mainContentWrapper,
                                marginBottom: REVAMP_QUESTION_RENDER_TYPE[renderType] === REVAMP_QUESTION_RENDER_TYPE.DIALOG ? 24 : 32
                            }}>
                                {REVAMP_QUESTION_RENDER_TYPE[renderType] === REVAMP_QUESTION_RENDER_TYPE.DIALOG
                                    ? <Text style={styles.mainHeadingH3}>{question.name}</Text>
                                    : REVAMP_QUESTION_RENDER_TYPE[renderType] === REVAMP_QUESTION_RENDER_TYPE.SCREEN
                                        ? <Text style={styles.mainHeading}>{question.name}</Text>
                                        : null
                                }
                                {currentIndex === 0 && this.revampTypeData.name === 'Progress' &&
                                    <Text style={{
                                        ...styles.rewardText,
                                        color: Colors.colors.secondaryText
                                    }}>{this.props.revamp.revampContext.reward.name}</Text>
                                }
                                {valueExists(description?.subtitle)
                                    && <Text style={styles.subHeading}>{description.subtitle}</Text>
                                }
                            </View>
                        </>
                    }
                    <View style={styles.sectionWrapper}>
                        {this.renderRatingScale(question)}
                        {this.renderList(question)}
                    </View>
                </View>
                <View>
                    {actionButtons
                        && actionButtons?.length > 0
                        && actionButtons.map(button => {
                            if (
                                REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_BELOW
                                || REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.ENABLED_BELOW
                            ) {
                                return this.renderActionButton(button, question)

                            }
                        })}
                </View>
            </>
        );
    }

    getParentQuestions = (currentIndex) => {
        if (this.revampTypeData.children && this.revampTypeData.children.length > 0) {
            return this.revampTypeData.children[currentIndex];
        } else {
            return []
        }
    }

    handleBackButton = () => {
        this.setState({showCloseModal: true});
        return true;
    }

    componentWillUnmount(): void {
        BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
    }

    render() {
        StatusBar.setBarStyle('dark-content', true);
        const {isLoading} = this.state;
        if (isLoading) {
            return <Loader/>
        }
        const {
            childQuestion,
            currentIndex,
            showQuestionModal,
            showPopupModal,
            popupDetail,
            showCloseModal
        } = this.state;
        let {answers} = this.state;

        let question = this.getParentQuestions(currentIndex);
        let {
            minSelection,
            maxSelection,
            renderType,
            displayType,
            actionButtons,
            valuesGroups,
            backgroundImage,
            children,
        } = question.revampMetaData;
        answers = answers.get(question.id).answers;

        let valueDetail = null;
        if (popupDetail !== null && popupDetail !== undefined && REVAMP_POPUP_BEHAVIOR[popupDetail.behaviour] === REVAMP_POPUP_BEHAVIOR.SHOW_SELECTION) {
            if (valuesGroups && valuesGroups.length > 0) {
                valueDetail = valuesGroups[0].values?.find(value => value.name === answers[0])
            } else if (answers && answers.length > 0) {
                valueDetail = this.revampTypeData.children[currentIndex - 1].revampMetaData.valuesGroups.flatMap(groups => groups.values)
                    .filter(value => answers[0] === value.name)[0]
            }
        }

        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <Content style={styles.mainContent} scrollEnabled={true} showsVerticalScrollIndicator={false}>
                    <View>
                        <Header noShadow={false} transparent style={styles.header}>
                            <StatusBar
                                backgroundColor={Platform.OS === "ios" ? null : "transparent"}
                                translucent
                                barStyle={"dark-content"}
                            />
                            <Left>
                                <View style={styles.backButton}>
                                    <BackButton
                                        onPress={() => {
                                            this.setState({showCloseModal: true})
                                        }}
                                    />
                                </View>
                            </Left>
                            <Body style={styles.headerRow}>
                                <Title style={styles.headerText}>{this.revampTypeData.name}</Title>
                            </Body>
                            <Right/>
                            {/*<Right>*/}
                            {/*    <Button transparent*/}
                            {/*            style={{alignItems: 'flex-end', paddingRight: 7, marginRight: 8}}*/}
                            {/*            onPress={() => {*/}
                            {/*                this.refs.modalContact.open()*/}
                            {/*            }}*/}
                            {/*    >*/}
                            {/*        <FeatherIcons size={30} color={Colors.colors.mainBlue} name="more-horizontal"/>*/}
                            {/*    </Button>*/}
                            {/*</Right>*/}
                        </Header>
                        <Image
                            style={styles.questionsBg}
                            source={{uri: backgroundImage && S3_BUCKET_LINK + backgroundImage}}/>
                        {this.renderQuestion(question, currentIndex, false)}
                    </View>
                </Content>

                {
                    actionButtons
                    && actionButtons?.length > 0
                    && actionButtons.map(button => {
                            if (REVAMP_QUESTION_RENDER_TYPE[renderType] !== REVAMP_QUESTION_RENDER_TYPE.DIALOG
                                && REVAMP_ACTION_BUTTON_POSITIONS[button.position] !== REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_END
                                && REVAMP_VALUES_DISPLAY_TYPE[displayType] !== REVAMP_VALUES_DISPLAY_TYPE.RATING_SCALE
                                && REVAMP_ACTION_BUTTON_POSITIONS[button.position] !== REVAMP_ACTION_BUTTON_POSITIONS.ENABLED_END) {
                                return (
                                    <View style={styles.greBtn}>
                                        {(REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_FLOATING
                                                || REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.ENABLED_FLOATING)
                                            || (REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.HIDDEN_FLOATING
                                                && answers.length > minSelection)
                                            && !(maxSelection > 0 && answers.length !== maxSelection)
                                            && <View>
                                                {this.renderActionButton(button, question)}
                                            </View>
                                        }
                                    </View>
                                )
                            }
                            else {
                                return this.renderActionButton(button, question)
                            }
                        }
                    )
                }


                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={() => {
                        this.setState({showCloseModal: false})
                    }}
                    isOpen={showCloseModal}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        height: 'auto',
                        position: 'absolute'
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"optionMenuModal"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar, left: '50%'}}
                    />
                    <Content showsVerticalScrollIndicator={false} style={{paddingBottom: 24}}>
                        <Text style={{...styles.modalMainHeading, paddingBottom: 24, textAlign: 'center'}}>
                            Are you sure you want to exit?
                            You’ll lose your progress in this section and you only
                            have a few more to go.
                        </Text>
                        <SecondaryButton
                            onPress={() => {
                                this.props.fetchRevampSundayCheckinsList();
                                this.props.navigation.navigate(Screens.SUNDAY_CHECK_IN_HOME_SCREEN)
                            }}
                            text={'Yes, I’d like to exit'}
                        />
                        <PrimaryButton
                            onPress={() => {
                                this.setState({showCloseModal: false})
                            }}
                            text={'I’ll keep going'}
                        />
                    </Content>
                </Modal>

                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={() => {
                        this.setState({showQuestionModal: false})
                    }}
                    isOpen={showQuestionModal}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        height: 'auto',
                        position: 'absolute',
                        paddingLeft: 0,
                        paddingRight: 0
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"optionMenuModal"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                    />
                    <Content showsVerticalScrollIndicator={false}>
                        {childQuestion && this.renderQuestion(childQuestion, 0, false)}
                    </Content>
                </Modal>
                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={() => {
                        this.setState({
                            showPopupModal: false,
                            popupDetail: null
                        })
                    }}
                    isOpen={showPopupModal}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        height: 'auto',
                        position: 'absolute',
                        paddingLeft: 0,
                        paddingRight: 0
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"optionMenuModal"} swipeArea={100}>
                    <View style={CommonStyles.styles.commonSwipeBar}
                    />
                    {popupDetail !== null && popupDetail !== undefined &&
                        <Content showsVerticalScrollIndicator={false}>
                            {valueDetail
                                ? valueDetail.icon
                                    ? <View style={{
                                        marginTop: 14,
                                        marginBottom: 40,
                                        paddingLeft: 24,
                                        paddingRight: 24,
                                        alignItems: 'center',
                                    }}>
                                        {valueExists(valueDetail.icon) &&
                                            <Image style={styles.popupIconImg}
                                                   resizeMode={'contain'}
                                                   source={{uri: valueDetail.icon && S3_BUCKET_LINK + valueDetail.icon}}
                                            />
                                        }
                                        <View>
                                            <Text
                                                style={{
                                                    ...styles.modalMainHeading,
                                                    marginBottom: 0
                                                }}>{valueDetail.name ? valueDetail.name : valueDetail}</Text>

                                            <Text style={styles.checkInsText2}>{
                                                this.props.revamp.revampContext?.activities
                                                && this.props.revamp.revampContext.activities
                                                    .some(activityContext => {
                                                        return activityContext.activity.name === valueDetail.name
                                                            && activityContext.checkIns
                                                            && activityContext.checkIns.length > 0
                                                    })
                                                    ? this.props.revamp.revampContext.activities
                                                    .find(activityContext => activityContext.activity.name === valueDetail.name).checkIns.length + ' check-ins'
                                                    : 'No check-ins'
                                            }</Text>
                                        </View>
                                    </View>
                                    :
                                    <View style={{marginTop: 14, marginBottom: 32, paddingLeft: 24, paddingRight: 24}}>
                                        <Text
                                            style={styles.modalMainHeading}>{valueDetail.name ? valueDetail.name : valueDetail}</Text>
                                        <Text
                                            style={styles.modalSubHeading}>{valueDetail.subText ? valueDetail.subText : null}</Text>
                                    </View>
                                : <View style={{marginTop: 14, marginBottom: 32, paddingLeft: 24, paddingRight: 24}}>
                                    <Text style={styles.modalMainHeading}>{popupDetail.name}</Text>
                                    <Text style={styles.modalSubHeading}>{popupDetail.description}</Text>
                                </View>
                            }

                            {popupDetail.promptOptions && popupDetail.promptOptions.length > 0 && popupDetail.promptOptions?.map(option => {
                                return this.renderActionButton(option, question)
                            })}
                        </Content>
                    }
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
        backgroundColor: 'transparent',
        // ...CommonStyles.styles.headerShadow
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
    questionsBg: {
        width: '100%',
        position: 'absolute',
        // top: HEADER_SIZE + 7,
        zIndex: -1,
    },
    iconImg: {
        height: 24,
        width: 24,
        // marginBottom:100,
    },
    popupIconImg: {
        height: 89,
        width: 120,
        marginBottom: 24,
    },
    sectionWrapper: {
        // paddingBottom: 56,
        // padding: 14
    },
    mainContentWrapper: {
        paddingHorizontal: 24,
    },
    statementList: {
        paddingHorizontal: 24,
        marginBottom: 102,
    },
    mainHeading: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        lineHeight: 40,
        color: Colors.colors.highContrast,
        // marginTop: 20,
        textAlign: 'left'
    },
    mainHeadingH3: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        textAlign: 'left'
    }
    , subHeading: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        marginTop: 8,
        // marginBottom: 16,

    },
    headTextWrap: {
        display: 'flex',
        flexDirection: 'row'
    },
    headMainText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.subTextM,
        ...TextStyles.mediaTexts.manropeBold,
        marginBottom: 4,
        marginLeft: 16,
        marginTop: 15,
        // justifyContent: 'center',
        // alignItems: 'center',

    },
    numericListNumberBox: {
        height: 34,
        width: 35,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.colors.whiteColor,
        ...CommonStyles.styles.shadowBox,
        borderRadius: 5

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
        marginTop: 8,

    },
    toggleButtonText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.subTextM,
        ...TextStyles.mediaTexts.manropeBold,
        marginRight: 35,
    },
    iconBg: {
        height: 48,
        width: 48,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.colors.whiteColor,
        ...CommonStyles.styles.shadowBox,
        borderRadius: 5

    },
    chipWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        width: '100%',
        marginBottom: 32,
    },
    chipView: {
        backgroundColor: Colors.colors.highContrastBG,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 12,
        paddingRight: 12,
        borderRadius: 16,
        marginRight: 4,
        marginBottom: 8,
    },
    chipText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.mediumContrast,
    },
    textAreaContainer: {
        marginBottom: 32,
        paddingHorizontal: 24,
    },
    switchContainer: {
        flexDirection: 'row',
        marginBottom: 32,
        paddingHorizontal: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

    },

    greBtn: {
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
        alignItems: 'center',
        ...CommonStyles.styles.stickyShadow,
    },

    actionButtonBG: {
        paddingBottom: isIphoneX() ? 36 : 24,
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
        paddingTop: 20,
        backgroundColor: '#fff',
        ...CommonStyles.styles.shadowBox,
    },
    selectionTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.buttonTextM,
        color: Colors.colors.highContrast,
        marginTop: 4
    },
    modalMainHeading: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        textAlign: 'left',
        marginBottom: 16
    },
    modalSubHeading: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextL,
        color: Colors.colors.highContrast,

    },
    popupHeading: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        paddingBottom: 24,
        color: Colors.colors.highContrast,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentImage: {
        height: 40,
        width: 40
    },
    contentTitle: {
        ...TextStyles.mediaTexts.TextH5,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast,
        textAlign: 'center',
        paddingTop: 16,
    },
    contentDescs: {
        ...TextStyles.mediaTexts.bodyTextExtraS,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast,
        textAlign: 'center',
    },
    activityBox: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    activityName: {
        ...TextStyles.mediaTexts.subTextM,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast,
        textAlign: 'center',
        marginTop: 16
    },
    checkInsText: {
        ...TextStyles.mediaTexts.bodyTextExtraS,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.lowContrast,
        textAlign: 'center'
    },
    checkInsText2: {
        ...TextStyles.mediaTexts.bodyTextExtraS,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.lowContrast,
        textAlign: 'center'
    },
    imageButton: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 29,
        paddingHorizontal: 29
    },
    secondaryButton: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.colors.mainBlue40,
        backgroundColor: Colors.colors.whiteColor,
        ...CommonStyles.styles.shadowBox,
        marginBottom: 16,
    },
    imageBtnActive: {
        borderRadius: 12,
        borderWidth: 1,
        ...CommonStyles.styles.shadowBox,
        marginBottom: 0,
        height: 155,
        width: 155,
        borderColor: Colors.colors.mainBlue40,
        backgroundColor: Colors.colors.primaryColorBG
    },
    imageBtnInactive: {
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: 'transparent',
        height: 155,
        width: 155,
        marginBottom: 0,
        ...CommonStyles.styles.shadowBox,
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
    contentWrap: {
        flexDirection: 'row',
        // padding:12,
        position: 'relative',
        alignItems: 'center'
    },
    textAreaInput: {
        ...TextStyles.mediaTexts.TextH7,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.lowContrast,
    },
    textAreaMainHeading: {
        ...TextStyles.mediaTexts.subTextM,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast,
        marginBottom: 4
    },
    textAreaSubHeading: {
        ...TextStyles.mediaTexts.TextH7,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.highContrast,
        // marginBottom: 8
    },
    overlayBG: {
        backgroundColor: 'rgba(37,52,92,0.35)',
        zIndex: -1
    },
    fabWrapper: {
        height: 'auto',
        padding: 0,
        paddingTop: 40,

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
    valuesSelectedWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25
    },
    sectionItem: {
        ...CommonStyles.styles.shadowBox,
        // borderWidth: 1,
        // borderColor: 'red',
        padding: 24,
        // margin:20,
        width: '98%',
        marginBottom: 8,
        borderRadius: 12,
        height: 137,
        backgroundColor: Colors.colors.whiteColor,
    },
    sectionItemHeading: {
        display: 'flex',
        flexDirection: 'row',
    },
    sectionItemContent: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',

    },
    secondaryBtn: {
        marginBottom: 16
    },
    mainTitle: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        lineHeight: 40,
        color: Colors.colors.highContrast,
        marginBottom: 8,
        // marginTop: 32,
        textAlign: 'center'
    },
    actionBtnWrapper: {
        padding: 24,
        paddingBottom: isIphoneX() ? 24 : 14
    },
    actionPrimaryBtn: {
        marginBottom: 16,
    },
    ratingScaleSelectedValue: {
        ...TextStyles.mediaTexts.manropeExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        lineHeight: 40,
        color: Colors.colors.mainPink,
        textTransform: 'uppercase'
    },
    ratingScaleLabel: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.inputLabel,
        color: Colors.colors.mediumContrast,
    },
    rewardText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextL,
        color: Colors.colors.highContrast,
        textAlign: 'left',
        marginVertical: 8
    },
});

export default connectRevamp()(RevampSundayCheckInQuestionsScreen);

