import React, {Component} from 'react';
import {
    BackHandler,
    FlatList,
    Image,
    Platform,
    Keyboard,
    KeyboardAvoidingView,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import {Accordion, Body, Button, Container, Content, Header, Icon, Left, Right, Text, Title, View} from 'native-base';
import {
    addTestID,
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
    REVAMP_ON_BOARDING_TYPE_CONTEXT_STATUS,
    REVAMP_ON_BOARDING_TYPES,
    REVAMP_POPUP_BEHAVIOR,
    REVAMP_QUESTION_RENDER_TYPE,
    REVAMP_VALUE_INPUT_TYPE,
    REVAMP_VALUES_DISPLAY_TYPE,
    S3_BUCKET_LINK
} from "../../constants/CommonConstants";
import {ToggleSwitch} from "ch-mobile-shared/src/components/ToggleSwitch";
import ProfileService from "../../services/Profile.service";
import Overlay from "react-native-modal-overlay";
import {connectRevamp} from "../../redux";
import Analytics from "@segment/analytics-react-native";
import {ContentLoader} from "../../components/content-loader/ContentLoader";

const HEADER_SIZE = getHeaderHeight();
class RevampQuestionsScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    componentWillMount () {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    }

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.revampTypeData = navigation.getParam("revampTypeData", null);
        this.state = {
            isLoading: false,
            isContentLoading: true,
            childQuestion: null,
            currentIndex: this.props.revamp.revampOnBoardingContext.marker !== ''
                ? this.revampTypeData.children.findIndex(question => question.id === this.props.revamp.revampOnBoardingContext.marker) + 1 === this.revampTypeData.children.length
                    ? this.revampTypeData.children.findIndex(question => question.id === this.props.revamp.revampOnBoardingContext.marker)
                    : this.revampTypeData.children.findIndex(question => question.id === this.props.revamp.revampOnBoardingContext.marker) + 1
                : 0,
            showQuestionModal: false,
            showPopupModal: false,
            popupDetail: null,
            answers: this.initializeEmptyState(this.revampTypeData.children),
            showCloseModal: false,
            keyboardOpen: false,
            dataElements:[]
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
        const revampBoardingContext = this.props.revamp.revampOnBoardingContext

        let answers = []
        if (revampBoardingContext
            && revampBoardingContext.revampTypesContexts
            && revampBoardingContext.revampTypesContexts.length > 0
            && revampBoardingContext.revampTypesContexts.some(typeContext => typeContext.typeId === this.revampTypeData.id)
        ) {
            const typeContext = revampBoardingContext.revampTypesContexts
                .find(typeContext => typeContext.typeId === this.revampTypeData.id)
            if (typeContext && typeContext.questionsContexts) {
                const questionsContext = typeContext.questionsContexts
                if (questionsContext.some(questionContext => questionContext.questionId === question.id)) {
                    const responses = questionsContext.find(questionContext => questionContext.questionId === question.id).responses
                    if (responses && responses.length)
                        answers = questionsContext.find(questionContext => questionContext.questionId === question.id).responses.map(res => res.name)
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
                if(profileElement.type === "YES_NO"){
                    if (answers.get(question.id).answers[0] === true){
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

    updateRevampContext = async (question) => {
        try {
            let {answers, currentIndex} = this.state;
            let currentQuestionSelections = answers.get(question.id).answers;
            let revampContext = this.props.revamp.revampContext;

            if (this.revampTypeData.name === REVAMP_ON_BOARDING_TYPES.REWARD.key && currentIndex === 0) {
                let {valuesGroups} = question.revampMetaData;
                revampContext.reward = valuesGroups.flatMap(groups => groups.values)
                    .find(value => value.name === currentQuestionSelections[0])
                this.props.updateRevampContext(revampContext);
                Analytics.identify(this.props.auth.meta.userId, {reward: currentQuestionSelections});
            }
            if (this.revampTypeData.name === REVAMP_ON_BOARDING_TYPES.VALUES.key) {
                let {valuesGroups} = question.revampMetaData;
                revampContext.values = valuesGroups.flatMap(groups => groups.values)
                    .filter(value => currentQuestionSelections.includes(value.name))
                this.props.updateRevampContext(revampContext);
            }

            if (this.revampTypeData.name === REVAMP_ON_BOARDING_TYPES.ACTIVITIES.key) {
                let {valuesGroups} = question.revampMetaData;
                let selectedActivities = valuesGroups.flatMap(groups => groups.values)
                    .filter(value => currentQuestionSelections.includes(value.name)).map(activity => {
                        return {
                            activity: activity,
                            scheduled: false
                        }
                    })

                if (revampContext.activities && revampContext.activities.length > 0) {
                    selectedActivities.map(activity => {
                        if (!revampContext.activities.some(activityContext => activityContext.activity.name === activity.activity.name)) {
                            revampContext.activities.push({
                                activity: activity.activity,
                                scheduled: false
                            })
                        }
                    })
                } else {
                    revampContext.activities = selectedActivities
                }
                this.props.updateRevampContext(revampContext);
            }
        } catch (e) {
            console.log(e);
        }
    };

    setValuesInRevampOnboardingContext = (question) =>{
        let {answers, childQuestion} = this.state;
        let currentQuestionSelections = answers.get(question.id).answers;
        let {valuesGroups, majorQuestion, inputType} = question.revampMetaData;
        if (!majorQuestion) {
            majorQuestion = false;
        }
            let valuesList = valuesGroups.flatMap(groups => groups.values)
                .filter(value => currentQuestionSelections.includes(value.name))
            if (this.revampTypeData.name === REVAMP_ON_BOARDING_TYPES.VALUES.key && valuesList.length === 0){
                valuesList = this.props.revamp.revampContext.values.filter(value => currentQuestionSelections.includes(value.name))
            }
            if (REVAMP_VALUE_INPUT_TYPE[inputType] === REVAMP_VALUE_INPUT_TYPE.TEXT_INPUT) {
                valuesList = [{
                    colorCode: "string",
                    exampleText: "string",
                    icon: "string",
                    name: currentQuestionSelections[0],
                    placeholder: "string",
                    subText: "string"
                }];
            }
            let revampOnBoardingContext = this.props.revamp.revampOnBoardingContext;
            let {revampTypesContexts} = revampOnBoardingContext;
            if (revampTypesContexts && revampTypesContexts.length > 0) {
                let typeInContext = revampTypesContexts.find(typeContext => typeContext.typeId === this.revampTypeData.id)
                if (typeInContext) {
                    if (typeInContext.questionsContexts && typeInContext.questionsContexts.length > 0) {
                        let questionInContext = typeInContext.questionsContexts.find(questionContext => questionContext.questionId === question.id);
                        if (questionInContext) {
                            if (questionInContext.responses
                                && !questionInContext.responses.some(res => valuesList.some(selection => selection.name === res.name))) {
                                questionInContext.responses = [...new Set([...questionInContext.responses, ...valuesList])]
                            } else {
                                questionInContext.responses = [...new Set([ ...valuesList])]
                            }
                        } else {
                            typeInContext.questionsContexts.push({
                                majorQuestion: majorQuestion,
                                questionId: question.id,
                                responses: valuesList
                            })

                        }
                    } else {
                        typeInContext.questionsContexts = [
                            {
                                majorQuestion: majorQuestion,
                                questionId: question.id,
                                responses: valuesList
                            }
                        ]
                    }
                } else {
                    revampTypesContexts.push(
                        {
                            typeId: this.revampTypeData.id,
                            typeStatus: REVAMP_ON_BOARDING_TYPE_CONTEXT_STATUS.IN_PROGRESS.key,
                            questionsContexts: [
                                {
                                    majorQuestion: majorQuestion,
                                    questionId: question.id,
                                    responses: valuesList
                                }
                            ]
                        }
                    );
                }
            } else {
                revampTypesContexts = [{
                    typeId: this.revampTypeData.id,
                    typeStatus: REVAMP_ON_BOARDING_TYPE_CONTEXT_STATUS.IN_PROGRESS.key,
                    questionsContexts: [
                        {
                            majorQuestion: majorQuestion,
                            questionId: question.id,
                            responses: valuesList
                    }
                ]
            }]
        }
        return revampTypesContexts
    }

    updateRevampOnBoardingContext = async (question) => {
        try {
            let {childQuestion} = this.state;
            let {valuesGroups, majorQuestion, inputType, children} = question.revampMetaData;
            let revampOnBoardingContext = this.props.revamp.revampOnBoardingContext;
            let {revampTypesContexts} = revampOnBoardingContext;

            if (children && children.length > 0) {
               children.map((question)=>{
                    revampTypesContexts = this.setValuesInRevampOnboardingContext(question)
                })

            }
            revampTypesContexts = this.setValuesInRevampOnboardingContext(question)
            if (childQuestion === null){
                revampOnBoardingContext.marker = question.id;
            }

            revampOnBoardingContext.marker = question.id;
            revampOnBoardingContext.revampTypesContexts = revampTypesContexts;
            revampOnBoardingContext.typeInProgressId = this.revampTypeData.id;
            revampOnBoardingContext.typeInProgressName = this.revampTypeData.name;

            this.props.updateRevampOnBoardingContext({revampOnBoardingContext});

        } catch (e) {
            console.log(e);
        }
    };


    backClicked = () => {
        this.props.navigation.goBack();
    };

    navigateToRewardPointsScreen = () => {
        let revampContext = this.props.revamp.revampContext;
        if(revampContext.tokens && revampContext.tokens >= 0){
            revampContext.tokens += 1;
        } else {
            revampContext.tokens = 1;
        }
        this.props.updateRevampContext(revampContext);
        const navigation = this.props.navigation;
        navigation.navigate(Screens.REVAMP_REWARD_POINT_SCREEN, {...navigation.state.params})
    };

    _renderHeader = (item, expanded) => {
        return (
            <View style={{
                flexDirection: "row",
                marginBottom: expanded ? 8 : 24,
                justifyContent: "space-between",
                alignItems: "center",
                marginHorizontal: 24,
            }}>
                <View style={styles.headTextWrap}>
                    <View style={styles.iconBg}>
                        {item.icon &&
                            <Image style={styles.iconImg}
                                   resizeMode={'contain'}
                                   source={{uri: item.icon && S3_BUCKET_LINK + item.icon}}
                            />}
                    </View>
                    <Text style={styles.headMainText}>{item.name}</Text>
                </View>
                <View>
                    {expanded
                        ? <Icon type={'SimpleLineIcons'} style={{fontSize: 22}} name="arrow-up"/>
                        : <Icon type={'SimpleLineIcons'} style={{fontSize: 22}} name="arrow-down"/>}
                </View>
            </View>
        );
    }

    setAnswers = (item, inputType, questionId) => {
        let {answers} = this.state;
        let currentQuestionAnswers = answers.get(questionId).answers;
        if (currentQuestionAnswers.includes(item)) {

            currentQuestionAnswers.splice(currentQuestionAnswers.indexOf(item), 1)

        } else {

            if ((REVAMP_VALUE_INPUT_TYPE[inputType] === REVAMP_VALUE_INPUT_TYPE.SINGLE_SELECT
                    || REVAMP_VALUE_INPUT_TYPE[inputType] === REVAMP_VALUE_INPUT_TYPE.TEXT_INPUT
                    || REVAMP_VALUE_INPUT_TYPE[inputType] === REVAMP_VALUE_INPUT_TYPE.BOOLEAN
                    || REVAMP_VALUE_INPUT_TYPE[inputType] === REVAMP_VALUE_INPUT_TYPE.RATING_SCALE
                    || REVAMP_VALUE_INPUT_TYPE[inputType] === REVAMP_VALUE_INPUT_TYPE.DATE_TIME
                    || REVAMP_VALUE_INPUT_TYPE[inputType] === REVAMP_VALUE_INPUT_TYPE.DAY_TIME
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

    _renderContent = (item, question) => {
        let {answers} = this.state;
        let {inputType, displayType,} = question.revampMetaData;
        answers = answers.get(question.id).answers;

        return (
            REVAMP_VALUES_DISPLAY_TYPE[displayType] === REVAMP_VALUES_DISPLAY_TYPE.GROUPED_LIST
                ? <View>
                    <FlatList
                        data={item.values}
                        renderItem={({item, index}) => {
                            return (<SingleAccordionItem
                                listTestId={'list - ' + index + 1}
                                checkTestId={'checkbox - ' + index + 1}
                                keyId={index}
                                listPress={() => {
                                    this.setAnswers(item.name, inputType, question.id)
                                }}
                                itemSelected={answers.includes(item.name)}
                                itemTitle={item.name}
                            />)
                        }
                        }
                        keyExtractor={item => item}
                    />
                </View>
                :
                <View style={{...styles.chipWrapper, paddingHorizontal: 24, marginTop: 24}}>
                    {item.values && item.values.map(item => {
                        return (
                            <TouchableOpacity onPress={() => {
                                this.setAnswers(item.name, inputType, question.id)
                            }}>
                                <View style={{
                                    ...styles.chipView,
                                    backgroundColor: answers.includes(item.name)
                                        ? valueExists(item.colorCode)
                                            ? item.colorCode
                                            : Colors.colors.mainBlue
                                        : Colors.colors.highContrastBG
                                }}>
                                    <Text style={{
                                        ...styles.chipText,
                                        color: answers.includes(item.name) ? Colors.colors.whiteColor : Colors.colors.mediumContrast
                                    }}>{item.name}</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                </View>
        );
    }

    renderValues = (question) => {
        let {displayType, valuesGroups, responseBased} = question.revampMetaData;

        if (valuesGroups && valuesGroups.length > 0
            && (REVAMP_VALUES_DISPLAY_TYPE[displayType] === REVAMP_VALUES_DISPLAY_TYPE.GROUPED_LIST
                || REVAMP_VALUES_DISPLAY_TYPE[displayType] === REVAMP_VALUES_DISPLAY_TYPE.GROUPED_CHIPS)) {
            return this.renderGroupedListValues(question)

        } else if (REVAMP_VALUES_DISPLAY_TYPE[displayType] === REVAMP_VALUES_DISPLAY_TYPE.CHECK_LIST
            || REVAMP_VALUES_DISPLAY_TYPE[displayType] === REVAMP_VALUES_DISPLAY_TYPE.BUTTON_LIST
            || REVAMP_VALUES_DISPLAY_TYPE[displayType] === REVAMP_VALUES_DISPLAY_TYPE.TILED_LIST
            || REVAMP_VALUES_DISPLAY_TYPE[displayType] === REVAMP_VALUES_DISPLAY_TYPE.TILED_BUTTON_LIST
            || REVAMP_VALUES_DISPLAY_TYPE[displayType] === REVAMP_VALUES_DISPLAY_TYPE.TILED_IMAGE_BUTTON_LIST
            || responseBased
        ) {
            return this.renderList(question)
        }
    }

    renderGroupedListValues = (question) => {
        let {valuesGroups} = question.revampMetaData;
        return (
            <Accordion
                dataArray={valuesGroups}
                animation={true}
                expanded={[0]}
                headerStyle={{ height: 48 }}
                style={{borderTopColor: Colors.colors.borderColor, marginBottom: 8}}
                renderHeader={this._renderHeader}
                renderContent={(item) => this._renderContent(item, question)}
            />
        );
    }

    removeActivityFromAnswers = () => {
        let {answers, currentIndex} = this.state;
        answers.get(this.revampTypeData.children[currentIndex].id).answers = [];
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


    onChangeText = (textInput, inputType, questionId) => {
        let {answers} = this.state;
        answers = answers.get(questionId).answers;
        if ((textInput !== '' || textInput !== null) && valueExists(answers[0])) {
            this.setAnswers(textInput, inputType, questionId)
        } else {
            this.setAnswers(textInput, inputType, questionId)
        }

    };

    renderTextArea = (question, questionIndex) => {
        let {answers, currentIndex} = this.state;
        let questionId = question.id;
        let {inputType, renderType, displayType, responseBased, valuesGroups} = question.revampMetaData;
        if (REVAMP_VALUES_DISPLAY_TYPE[displayType] !== REVAMP_VALUES_DISPLAY_TYPE.INPUT_FIELD) {
            return null;
        }
        answers = answers.get(questionId).answers;
        let placeholder = ''
        let valuesList = valuesGroups[0]?.values ? valuesGroups[0]?.values[0] : [];
        placeholder = valuesList.placeholder
        if (responseBased) {
            let {valuesGroups} = this.revampTypeData.children[0].revampMetaData;
            if (valuesGroups && valuesGroups.length > 0) {
                valuesList = valuesGroups.flatMap(groups => groups.values)
                    .filter(value => this.state.answers.get(this.revampTypeData.children[currentIndex - 1].id).answers.includes(value.name))
                if (valuesList[questionIndex]) {
                    placeholder = valuesList[questionIndex].placeholder
                }

            }
        }

        return (
            <View style={styles.textAreaContainer}>
                {
                    responseBased
                    && valuesList[questionIndex]
                    && valuesList[questionIndex].name
                    && valuesList[questionIndex].exampleText
                    && REVAMP_QUESTION_RENDER_TYPE[renderType] === REVAMP_QUESTION_RENDER_TYPE.INLINE
                    &&
                    <View style={{marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                        <View style={{width: '65%', paddingRight: 10}}>
                            <Text
                                style={styles.textAreaMainHeading}>{
                                valuesList[questionIndex]
                                && valuesList[questionIndex].name}</Text>
                            <Text
                                style={styles.textAreaSubHeading}>
                                Ex. {valuesList[questionIndex]
                                && valuesList[questionIndex].exampleText}</Text>
                        </View>
                        <View>
                            {this.revampTypeData.name === REVAMP_ON_BOARDING_TYPES.VALUES.key
                                && valuesList[questionIndex]
                                && valuesList[questionIndex].exampleText
                                &&
                                /*<Button
                                    onPress={() => {
                                        this.onChangeText(
                                            valuesList[questionIndex]
                                                ? valuesList[questionIndex].exampleText
                                                : '', inputType,
                                            questionId)
                                    }}
                                    text={'Use Example'}
                                />*/
                                <Button
                                style={{...styles.btnActive, height: 'auto' }}
                                onPress={() => {
                                    this.onChangeText(
                                        valuesList[questionIndex]
                                            ? valuesList[questionIndex].exampleText
                                            : '', inputType,
                                        questionId)
                                }}
                                >
                                <Text
                                    style={{
                                        ...styles.btnText,
                                        color: Colors.colors.primaryText}}
                                    uppercase={false}>Use Example</Text>
                                </Button>
                            }
                        </View>
                    </View>
                }

                <CommonTextArea
                    autoFocus={false}
                    multiline={true}
                    placeHolderText={placeholder ? placeholder : ''}
                    placeholderTextColor={styles.textAreaInput}
                    onChangeText={(input) => this.onChangeText(input, inputType, questionId)}
                    borderColor={Colors.colors.white}
                    value={answers[0] ? answers[0] : ''}
                    returnKeyType={'next'}
                />
            </View>
        );
    }

    renderSwitchButton = (question) => {
        let {answers} = this.state;
        let {inputType, displayType, valuesGroups} = question.revampMetaData;
        if (REVAMP_VALUES_DISPLAY_TYPE[displayType] !== REVAMP_VALUES_DISPLAY_TYPE.SWITCH) {
            return null;
        }
        let questionId = question.id;
        answers = answers.get(questionId).answers;
        return (
            <View style={styles.switchContainer}>

                <View style={{flex: 5}}>
                    <Text style={styles.toggleButtonText}>{valuesGroups[0].values[0].name}</Text>
                </View>

                <View style={{flex: 1}}>
                    <ToggleSwitch
                        switchOn={valueExists(answers[0]) ? answers[0] : false}
                        backgroundColorOn={Colors.colors.mainPink}
                        backgroundColorOff={Colors.colors.neutral50Icon}
                        onPress={() => {
                            this.toggleSwitchHandler(valueExists(
                                    answers[0]) ? !answers[0] : true,
                                inputType,
                                questionId)
                        }}
                    />
                </View>

            </View>
        );
    }

    toggleSwitchHandler = (value, inputType, questionId) => {
        this.setAnswers(value, inputType, questionId)
    };

    share = async (channel, question, button) => {
        try {
            const content = {
                title: 'Taking a pledge',
                message:
                    'I am making pledge to live by my values',
            }
            const options = {
                dialogTitle: "Share Pledge"
            }
            await Share.share(content, options);
            this.nextQuestion(question, button)
        } catch (error) {
            alert(error.message);
        }

    };

    nextQuestion = async (question, button) => {
        let {currentIndex, answers, popupDetail, childQuestion} = this.state;
        let currentQuestionAnswers = answers.get(question.id).answers;
        let {children, significantQuestion} = question.revampMetaData;
        if (!(REVAMP_ACTION_BUTTON_ACTIONS[button.action] === REVAMP_ACTION_BUTTON_ACTIONS.SKIP)) {
            this.addProfileElement(question);
        }
        if (currentIndex + 1 === this.revampTypeData.children.length) {
            if (popupDetail !== null) {
                this.setState({
                    showPopupModal: false,
                    showQuestionModal: false,
                    popupDetail: null
                })
            }
            if (childQuestion === null) {
                this.updateRevampOnBoardingContext(question)
            }
            if (significantQuestion) {
                this.updateRevampContext(question)
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
                if (popupDetail !== null) {
                    this.setState({showPopupModal: false, popupDetail: null})
                }
                if (childQuestion === null) {
                    this.updateRevampOnBoardingContext(question)
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

                this.navigateToRewardPointsScreen()
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
            if (childQuestion === null) {
                this.updateRevampOnBoardingContext(question)
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
            if (popupDetail !== null) {
                this.setState({
                    showPopupModal: false,
                    popupDetail: null
                })
            }

            if (currentQuestionAnswers.length > 0) {
                if (childQuestion === null) {
                    this.updateRevampOnBoardingContext(question)
                }
                if (significantQuestion) {
                    this.updateRevampContext(question)
                }

                this.setState({
                    showQuestionModal: false,
                    childQuestion: null,
                    currentIndex: currentIndex + 1,
                    showPopupModal: false,
                    popupDetail: null
                })
            }
            if (childQuestion === null) {
                this.updateRevampOnBoardingContext(question)
            }
            if (significantQuestion) {
                this.updateRevampContext(question)
            }

            this.setState({
                childQuestion: null,
                currentIndex: currentIndex + 1,
                showPopupModal: false,
                popupDetail: null
            })
            if (this.revampTypeData.name === REVAMP_ON_BOARDING_TYPES.VALUES.key
                && currentIndex === 0
                && currentQuestionAnswers.length === 5 ) {
                if (
                    this.revampTypeData.children[currentIndex + 1].revampMetaData.minSelection === 5
                    && this.revampTypeData.children[currentIndex + 1].revampMetaData.maxSelection === 5
                    && this.revampTypeData.children[currentIndex + 1].revampMetaData.responseBased
                ) {
                    answers.get(this.revampTypeData.children[currentIndex + 1 ].id).answers = currentQuestionAnswers
                    this.setState({answers},
                        ()=>this.nextQuestion(
                            this.revampTypeData.children[currentIndex + 1 ],
                            {action: 'no action'})
                    )
                }
            }
            this.props.navigation.push(Screens.REVAMP_QUESTIONS_SCREEN, {...this.props.navigation.state.params})
        }
    }

    updateCurrentIndex = () => {
        const {currentIndex} = this.state;
        if ((currentIndex + 1) === this.revampTypeData.children.length) {
            this.navigateToRewardPointsScreen()
        } else {
            this.setState({currentIndex: currentIndex + 1})
        }
    }


    navigateScheduleActivityScreen = (question, selectedActivity) => {
        const navigation = this.props.navigation;
        navigation.navigate(Screens.REVAMP_SCHEDULE_ACTIVITY,
            {
                ...navigation.state.params,
                question,
                selectedActivity,
                updateCurrentIndex: this.updateCurrentIndex,
                removeActivityFromAnswers: this.removeActivityFromAnswers
            })
    };

    navigateCheckInActivityScreen = (question, selectedActivity) => {
        const navigation = this.props.navigation;
        navigation.navigate(Screens.REVAMP_CHECK_IN_ACTIVITY, {
            ...navigation.state.params,
            question,
            selectedActivity,
            updateCurrentIndex: this.updateCurrentIndex,
            removeActivityFromAnswers: this.removeActivityFromAnswers,
            refScreen: 'revampOnBoarding'
        })
    };


    actionButtonOnPress = async (button, question) => {
        let {answers, popupDetail} = this.state;
        let currentQuestionAnswers = answers.get(question.id).answers;
        let {
            popups, inputType
        } = question.revampMetaData;

        if (popups && popups.length > 0 && popupDetail !== null) {
            popups.map(async (popup, index) => {
                let {behaviour} = popup;
                if (
                    REVAMP_POPUP_BEHAVIOR[behaviour] === REVAMP_POPUP_BEHAVIOR.PROMPT
                    && REVAMP_ACTION_BUTTON_ACTIONS[button.action] === REVAMP_ACTION_BUTTON_ACTIONS.CLOSE
                ) {

                    this.setState({showPopupModal: false, popupDetail: null})

                } else if (
                    REVAMP_POPUP_BEHAVIOR[behaviour] === REVAMP_POPUP_BEHAVIOR.RESPONSE_BASED_PROMPT
                    && REVAMP_ACTION_BUTTON_ACTIONS[button.action] === REVAMP_ACTION_BUTTON_ACTIONS.SHARE) {
                    this.addProfileElement(question);
                    await this.share('facebook', question, button)
                    this.setState({
                        showPopupModal: false,
                        popupDetail: null,
                    })

                } else if (
                    (REVAMP_POPUP_BEHAVIOR[behaviour] === REVAMP_POPUP_BEHAVIOR.PROMPT
                        && REVAMP_ACTION_BUTTON_ACTIONS[button.action] === REVAMP_ACTION_BUTTON_ACTIONS.SKIP)
                    || (REVAMP_POPUP_BEHAVIOR[behaviour] === REVAMP_POPUP_BEHAVIOR.PROMPT
                        && REVAMP_ACTION_BUTTON_ACTIONS[button.action] === REVAMP_ACTION_BUTTON_ACTIONS.NEXT)
                    || (REVAMP_POPUP_BEHAVIOR[behaviour] === REVAMP_POPUP_BEHAVIOR.RESPONSE_BASED_PROMPT
                        && REVAMP_ACTION_BUTTON_ACTIONS[button.action] === REVAMP_ACTION_BUTTON_ACTIONS.NEXT)
                    || (REVAMP_POPUP_BEHAVIOR[behaviour] === REVAMP_POPUP_BEHAVIOR.SHOW_SELECTION
                        && REVAMP_ACTION_BUTTON_ACTIONS[button.action] === REVAMP_ACTION_BUTTON_ACTIONS.NEXT)
                ) {
                    this.nextQuestion(question, button)
                } else if (
                    (REVAMP_POPUP_BEHAVIOR[behaviour] === REVAMP_POPUP_BEHAVIOR.SHOW_SELECTION
                        && REVAMP_ACTION_BUTTON_ACTIONS[button.action] === REVAMP_ACTION_BUTTON_ACTIONS.SCHEDULE_ACTIVITY)
                ) {
                    this.setState({
                        showPopupModal: false,
                        popupDetail: null
                    })
                    this.navigateScheduleActivityScreen(question, currentQuestionAnswers[0])
                } else if (
                    (REVAMP_POPUP_BEHAVIOR[behaviour] === REVAMP_POPUP_BEHAVIOR.SHOW_SELECTION
                        && REVAMP_ACTION_BUTTON_ACTIONS[button.action] === REVAMP_ACTION_BUTTON_ACTIONS.CHECK_IN_ACTIVITY)
                ) {
                    this.setState({
                        showPopupModal: false,
                        popupDetail: null
                    })
                    this.navigateCheckInActivityScreen(question, currentQuestionAnswers[0])
                }
            })
            return;
        }

        if (popups && popups.length > 0 && popupDetail === null) {
            popups.map((popup, index) => {
                if (
                    (REVAMP_POPUP_BEHAVIOR[popup.behaviour] === REVAMP_POPUP_BEHAVIOR.PROMPT
                        && currentQuestionAnswers.length === 0)
                    || (REVAMP_POPUP_BEHAVIOR[popup.behaviour] === REVAMP_POPUP_BEHAVIOR.SHOW_SELECTION
                        && currentQuestionAnswers.length > 0)
                    || (REVAMP_POPUP_BEHAVIOR[popup.behaviour] === REVAMP_POPUP_BEHAVIOR.RESPONSE_BASED_PROMPT
                        && currentQuestionAnswers.length > 0)
                ) {
                    if (this.revampTypeData.name === REVAMP_ON_BOARDING_TYPES.ACTIVITIES.key
                        && this.props.revamp.revampContext?.activities
                        && this.props.revamp.revampContext.activities.some(activityContext => {
                            if (activityContext.schedule || (activityContext.checkIns && activityContext.checkIns.length > 0)) {
                                return true
                            }
                        })
                        && (REVAMP_POPUP_BEHAVIOR[popup.behaviour] === REVAMP_POPUP_BEHAVIOR.PROMPT
                            && currentQuestionAnswers.length === 0)
                        || REVAMP_VALUE_INPUT_TYPE[inputType] === REVAMP_VALUE_INPUT_TYPE.BOOLEAN && currentQuestionAnswers[0] === false
                    ) {
                        this.nextQuestion(question, button)
                    } else {
                        this.setState({
                            showPopupModal: true,
                            popupDetail: popup
                        })
                    }

                }
            })
            return
        }

        this.nextQuestion(question, button)
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
            } else {
                disabled = currentQuestionAnswers.length === 0;
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
                <View style={this.state.keyboardOpen? {...styles.actionBtnWrapper, paddingLeft: 0, paddingRight: 0 } : styles.actionBtnWrapper}>
                    <View style={this.state.keyboardOpen? {...styles.actionPrimaryBtn, marginBottom: 0 } : styles.actionPrimaryBtn}>
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


    renderNumericList=(question) =>{
        let {dataElements, isContentLoading} = this.state;
        if (isContentLoading) {
            return (
                <View
                    style={{marginLeft:24,marginRight:24}}
                >
                    <ContentLoader numItems={5}  type={'i-statements'}/>
                </View>
                )
        }

        return ( <View style={styles.statementList}>
                {
                    dataElements.map((dataElement, index) => {
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

    async componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
        let profileElements = {
            "profileElementKeys": []
        }
        this.revampTypeData.children.map(question => {
            if (question.revampMetaData.description.values && question.revampMetaData.description.values.length > 0) {
                question.revampMetaData.description.values.map(value => {
                    profileElements.profileElementKeys.push(value)
                })
            }
        })

        setTimeout(async() => {
            await this.fetchDataElements(profileElements)
        }, 1000);
    }

    fetchDataElements = async (profileElements) => {
        try {
            const response = await ProfileService.getDataElements(profileElements);
            if (response.errors) {
                this.setState({isContentLoading: true});
            } else {
                this.setState({dataElements: response.profileElements, isContentLoading: false});

            }
        } catch (e) {
            console.log(e);
            this.setState({isContentLoading: true});
        }
    };

    renderQuestion = (question, questionIndex, isInlineQuestion) => {
        let {renderType, description, children, actionButtons} = question.revampMetaData;
        let {answers} = this.state;

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
                                {valueExists(description?.subtitle)
                                    && <Text style={styles.subHeading}>{description.subtitle}</Text>
                                }
                            </View>
                            {description.values.length > 0
                                && REVAMP_DESCRIPTION_TYPE[description.type] === REVAMP_DESCRIPTION_TYPE.NUMERIC_LIST
                                && this.renderNumericList(question)
                            }
                        </>
                    }
                    <View style={styles.sectionWrapper}>
                        {this.renderTextArea(question, questionIndex)}
                        {this.renderSwitchButton(question)}
                        {this.renderValues(question)}
                        {children
                            && children.length > 0
                            && children.map((childQuestion, index) => {
                                let {renderType} = childQuestion.revampMetaData;
                                if (REVAMP_QUESTION_RENDER_TYPE[renderType] === REVAMP_QUESTION_RENDER_TYPE.INLINE) {
                                    return this.renderQuestion(childQuestion, index, true)
                                }
                                return null;
                            })}
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

    handleBackButton = ()=>{
        this.setState({showCloseModal: true});
        return true;
    }

    componentWillUnmount(): void {
        BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow = () => {
        this.setState({
            keyboardOpen: true
        });
    }

    _keyboardDidHide = () => {
        this.setState({
            keyboardOpen: false
        });
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
            actionButtons,
            valuesGroups,
            backgroundImage,
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
            <KeyboardAvoidingView
                style={{ flex:1, bottom: 0}}
                behavior={Platform.OS==='ios'?'padding':null}>
                <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <ScrollView style={styles.mainContent} scrollEnabled={true} showsVerticalScrollIndicator={false}>
                    <View>
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
                                            this.setState({showCloseModal: true})
                                        }}
                                    />
                                </View>
                            </Left>
                            <Body style={styles.headerRow}>
                                <Title style={styles.headerText}>{this.revampTypeData.name}</Title>
                            </Body>
                            <Right style={{flex: 1}}></Right>
                            {/*<Right>*/}
                            {/*    <Button transparent*/}
                            {/*            style={{alignItems: 'flex-end', paddingRight: 7, marginRight: 8}}*/}
                            {/*            onPress={() => {*/}
                            {/*                this.refs?.modalContact.open()*/}
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
                </ScrollView>

                {
                    actionButtons
                    && actionButtons?.length > 0
                    && actionButtons.map(button => {
                            if (REVAMP_QUESTION_RENDER_TYPE[renderType] !== REVAMP_QUESTION_RENDER_TYPE.DIALOG
                                && REVAMP_ACTION_BUTTON_POSITIONS[button.position] !== REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_END
                                && REVAMP_ACTION_BUTTON_POSITIONS[button.position] !== REVAMP_ACTION_BUTTON_POSITIONS.ENABLED_END) {
                                return (
                                    <View style={styles.greBtn}>
                                        {(minSelection > 1
                                            || ((this.revampTypeData.name === REVAMP_ON_BOARDING_TYPES.ACTIVITIES.key && currentIndex === 2)
                                            || (this.revampTypeData.name === REVAMP_ON_BOARDING_TYPES.ACTIVITIES.key && currentIndex === 0)))
                                            &&
                                            <View style={[answers.length > maxSelection
                                                || answers.length < minSelection && {marginBottom: isIphoneX() ? 36 : 24},{ paddingTop: 24}]}>
                                                {minSelection > 1 && maxSelection > 1 ?
                                                    <View style={styles.valuesSelectedWrapper}>
                                                        {answers.length === maxSelection
                                                            &&
                                                            <Image
                                                                style={{marginRight: 5}}
                                                                resizeMode={'cover'}
                                                                source={require("../../assets/images/thumbs.png")}/>}
                                                        <Text style={styles.selectionTitle}>
                                                            {answers.length + ' of ' + maxSelection + ' Selected'}
                                                        </Text>
                                                    </View>
                                                    :
                                                    <View style={styles.valuesSelectedWrapper}>
                                                        {answers.length >= minSelection
                                                            && <Image
                                                                style={{marginRight: 5}}
                                                                resizeMode={'cover'}
                                                                source={require("../../assets/images/thumbs.png")}/>
                                                        }
                                                        <Text style={styles.selectionTitle}>
                                                            {
                                                                answers.length === 0
                                                                    ? 'Select at least ' + minSelection
                                                                    : answers.length >= minSelection
                                                                        ? ' ' + answers.length + ' values Selected'
                                                                        : 'Select at least ' + (minSelection - answers.length) + ' more'
                                                            }
                                                        </Text>
                                                    </View>

                                                }
                                            </View>
                                        }
                                        {(REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.DISABLED_FLOATING
                                                || REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.ENABLED_FLOATING)
                                            || (REVAMP_ACTION_BUTTON_POSITIONS[button.position] === REVAMP_ACTION_BUTTON_POSITIONS.HIDDEN_FLOATING
                                                && answers.length >= minSelection)
                                            && !(maxSelection > 0 && answers.length !== maxSelection)
                                            && <View>
                                                {this.renderActionButton(button, question)}
                                            </View>
                                        }
                                    </View>

                                )
                            } else {
                                return this.renderActionButton(button, question)
                            }
                        }
                    )
                }


                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={()=>{
                        this.setState({showCloseModal: false})
                    }}
                    isOpen={showCloseModal}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        height:'auto',
                        position: 'absolute'
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"optionMenuModal"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}/>
                    <Content showsVerticalScrollIndicator={false} style={{paddingBottom:24}}>
                        <Text style={{...styles.modalMainHeading, paddingBottom:24, textAlign: 'center'}}>
                            Are you sure you want to exit?
                            You’ll lose your progress in this section and you only
                            have a few more to go.
                        </Text>
                        <SecondaryButton
                            onPress={() => {
                                this.props.navigation.navigate(Screens.SERVICE_LIST_SCREEN)
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
                    onClosed={()=>{
                        this.setState({showQuestionModal: false})
                    }}
                    isOpen={showQuestionModal}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        height:'auto',
                        position:'absolute',
                        paddingLeft:0,
                        paddingRight:0
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
                    onClosed={()=>{
                        this.setState({
                            showPopupModal: false,
                            popupDetail: null
                        })
                    }}
                    isOpen={showPopupModal}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        height:'auto',
                        position:'absolute',
                        paddingLeft:0,
                        paddingRight:0,
                        paddingBottom: isIphoneX() ? 35: 0
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
            </KeyboardAvoidingView>
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
        height: 'auto',
        position: 'absolute',
        top: 0,
        flex: 1,
        aspectRatio: 1,
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
        // paddingTop: 24,
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
        paddingLeft: 24,
        paddingRight: 24,
    },
    actionPrimaryBtn: {
        marginBottom: 40,
    }
});

export default connectRevamp()(RevampQuestionsScreen);

