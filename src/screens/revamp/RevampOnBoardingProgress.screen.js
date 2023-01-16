import React, {PureComponent} from 'react';
import {Platform, StatusBar, StyleSheet, View} from 'react-native';
import {Body, Container, Content, Header, Left, Right, Text} from 'native-base';
import {addTestID, getHeaderHeight, AlertUtil, Colors, CommonStyles, isIphoneX, PrimaryButton, TextStyles} from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';
import Loader from "../../components/Loader";
import {ProgressBar} from 'react-native-paper';
import {BackButton} from "ch-mobile-shared/src/components/BackButton";
import ConversationService from "../../services/Conversation.service";

import {REVAMP_ON_BOARDING_TYPE_CONTEXT_STATUS, REVAMP_ON_BOARDING_TYPES} from "../../constants/CommonConstants";
import {connectRevamp} from "../../redux";

const HEADER_SIZE = getHeaderHeight();

class RevampOnBoardingProgressScreen extends PureComponent<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {

        super(props);
        this.state = {
            isLoading: true,
            revampTypesList: null,
            lastItemHeight: {
                height: 0
            }
        }
    }

    componentDidMount = () => {
        this.props.fetchRevampOnBoardingContext();
        this.getRevampTypes()
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    getRevampTypes = async () => {
        try {
            const response = await ConversationService.getRevampTypesList();
            if (response.errors) {
                console.log(response.errors[0].endUserMessage);
                AlertUtil.showErrorMessage('Type not available');
                this.setState({isLoading: false});
            } else {
                this.setState({revampTypesList: response, isLoading: false});
            }
        } catch (e) {
            console.log(e)
            this.setState({isLoading: false});
        }
    }


    navigateToRevampTypeHome = (type) => {
        const {revampTypesList} = this.state;
        if (revampTypesList) {
            let revampTypeData = revampTypesList.find(record => record.name === type);
            this.props.navigation.navigate(Screens.REVAMP_TYPE_HOME_SCREEN, {
                revampTypeData
            })
        }
    };

    getButtonText = (typeName) => {
        let buttonText
        switch (typeName) {
            case REVAMP_ON_BOARDING_TYPES.REWARD.key :
                buttonText = 'Select Reward';
                break;
            case REVAMP_ON_BOARDING_TYPES.VALUES.key :
                buttonText = 'Define Values';
                break;
            case REVAMP_ON_BOARDING_TYPES.ACTIVITIES.key :
                buttonText = 'Select Activities';
                break;
            case REVAMP_ON_BOARDING_TYPES.MIND_AND_BODY.key :
                buttonText = 'Assess Mind & Body';
                break;
            case REVAMP_ON_BOARDING_TYPES.PLAN.key :
                buttonText = 'Review Plan';
                break;
            default:
                buttonText = 'Continue';
        }
        return buttonText;
    }

    onLayout(event) {
        const {height} = event.nativeEvent.layout;
        const newLayout = {
            height: Math.round(height)
        };
        this.setState({ lastItemHeight:  newLayout });
    }
    render() {
        StatusBar.setBarStyle('dark-content', true);
        if (this.state.isLoading || this.props.revamp.isLoading) {
            return <Loader/>
        }
        const {revampTypesList} = this.state;
        const revampOnBoardingContext = this.props.revamp.revampOnBoardingContext;
        let totalMajorQuestion = 0;
        let attemptedMajorQuestions = 0;
        let progress = {
            Reward: false,
            Activities: false,
            Values: false,
            'Mind & Body': false,
            Plan: false

        }
        if (revampTypesList && revampOnBoardingContext) {
            let typeInProgressData = revampTypesList.find(type =>
                type.id === revampOnBoardingContext.typeInProgressId
            )
            revampTypesList.forEach(type => {
                type.id
                const context = revampOnBoardingContext.revampTypesContexts
                    && revampOnBoardingContext.revampTypesContexts.find(typeContext => typeContext.typeId === type.id)
                progress[type.name] = !!context && context.typeStatus === REVAMP_ON_BOARDING_TYPE_CONTEXT_STATUS.COMPLETED.key

            })
            totalMajorQuestion = typeInProgressData.children.filter(child => child.revampMetaData.majorQuestion).length
            if (revampOnBoardingContext.revampTypesContexts
                && revampOnBoardingContext.revampTypesContexts.length > 0) {

                const typeContext = revampOnBoardingContext.revampTypesContexts
                    .find(type => type.typeId === revampOnBoardingContext.typeInProgressId)
                if (typeContext && typeContext.questionsContexts && typeContext.questionsContexts.length > 0) {
                    attemptedMajorQuestions = typeContext.questionsContexts.filter(question => question.majorQuestion).length
                }
            }
        }

        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>

                <Header noShadow={false} transparent style={styles.headerStyle}>
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
                    <Right style={{flex: 1}}></Right>
                </Header>
                <Content showsVerticalScrollIndicator={false}>

                    {/*{revampTypesList && revampTypesList.map((type) => (*/}
                    {/*    <TouchableWithoutFeedback onPress={() => this.navigateToRevampTypeHome(type.name)}>*/}

                    {/*        <View>*/}
                    {/*            <Text style={styles.mainContentWrapper}>{type.name}</Text>*/}
                    {/*        </View>*/}

                    {/*    </TouchableWithoutFeedback>*/}
                    {/*))}*/}

                    <View>

                        <View style={styles.mainContentWrapper}>
                            <View style={[styles.shape, { bottom: this.state.lastItemHeight.height }]}/>
                            <View style={styles.itemWrapper}>
                                <View
                                    style={!progress[REVAMP_ON_BOARDING_TYPES.REWARD.key]
                                        ? styles.roundCircleWhite
                                        : styles.roundCircle}>
                                    <Text
                                        style={!progress[REVAMP_ON_BOARDING_TYPES.REWARD.key]
                                            ? styles.roundCircleTextBlack
                                            : styles.roundCircleText}>1</Text>
                                </View>

                                <View style={styles.rightContentWrapper}>
                                    <Text
                                        style={!progress[REVAMP_ON_BOARDING_TYPES.REWARD.key]
                                            ? styles.mainHeadingInprogress
                                            : styles.mainHeadingCompleted}>Reward</Text>
                                    {revampOnBoardingContext?.typeInProgressName === REVAMP_ON_BOARDING_TYPES.REWARD.key &&
                                        <View style={styles.descWrapper}>
                                            <Text style={styles.descriptionText}>
                                                Core values guide behavior and action.
                                                Identify the “reward” that you’ll be working toward in Confidant,
                                                then we’ll help you build a plan to achieve it.
                                            </Text>
                                            <ProgressBar style={styles.progressBarr}
                                                         progress={totalMajorQuestion > 0
                                                             ? attemptedMajorQuestions / totalMajorQuestion
                                                             : 0}
                                                         color={Colors.colors.mainPink}
                                                         borderRadius={8}/>
                                            <View style={{
                                                marginTop: 5,
                                                flexDirection: 'row',
                                                justifyContent: 'space-between'
                                            }}>
                                                <Text style={styles.lightText}>
                                                    {attemptedMajorQuestions} of {totalMajorQuestion} Completed
                                                </Text>
                                                <Text
                                                    style={styles.completedText}>
                                                    {
                                                        totalMajorQuestion > 0
                                                            ? Math.round((attemptedMajorQuestions / totalMajorQuestion) * 100)
                                                            : 0
                                                    }%</Text>
                                            </View>
                                        </View>
                                    }
                                </View>
                            </View>

                            {
                                progress[REVAMP_ON_BOARDING_TYPES.VALUES.key]
                                && <View style={styles.successLine(1)}/>
                            }


                            <View style={styles.itemWrapper}>
                                <View
                                    style={
                                        progress[REVAMP_ON_BOARDING_TYPES.VALUES.key]
                                            ? styles.roundCircle
                                            : progress[REVAMP_ON_BOARDING_TYPES.REWARD.key]
                                                ? styles.roundCircleWhite
                                                : styles.roundCircleGrey
                                    }


                                >
                                    <Text
                                        style={
                                            progress[REVAMP_ON_BOARDING_TYPES.VALUES.key]
                                                ? styles.roundCircleText
                                                : progress[REVAMP_ON_BOARDING_TYPES.REWARD.key]
                                                    ? styles.roundCircleTextBlack
                                                    : styles.roundCircleTextBlackGrey}>2</Text>
                                </View>
                                <View style={styles.rightContentWrapper}>
                                    <Text
                                        style={progress[REVAMP_ON_BOARDING_TYPES.VALUES.key]
                                            ? styles.mainHeadingCompleted
                                            : progress[REVAMP_ON_BOARDING_TYPES.REWARD.key]
                                                ? styles.mainHeadingInprogress
                                                : styles.mainHeading}>Values</Text>
                                    {revampOnBoardingContext?.typeInProgressName === REVAMP_ON_BOARDING_TYPES.VALUES.key &&
                                        <View style={styles.descWrapper}>
                                            <Text style={styles.descriptionText}>
                                                Core values guide behavior and action.
                                                Reflect on and narrow down your core values.
                                                This will create a guide to your best life.
                                            </Text>
                                            <ProgressBar style={styles.progressBarr}
                                                         progress={totalMajorQuestion > 0
                                                             ? attemptedMajorQuestions / totalMajorQuestion
                                                             : 0}
                                                         color={Colors.colors.mainPink}
                                                         borderRadius={8}/>
                                            <View style={{
                                                marginTop: 5,
                                                flexDirection: 'row',
                                                justifyContent: 'space-between'
                                            }}>
                                                <Text style={styles.lightText}>
                                                    {attemptedMajorQuestions} of {totalMajorQuestion} Completed
                                                </Text>
                                                <Text
                                                    style={styles.completedText}>
                                                    {
                                                        totalMajorQuestion > 0
                                                            ? Math.round((attemptedMajorQuestions / totalMajorQuestion) * 100)
                                                            : 0
                                                    }%</Text>
                                            </View>
                                        </View>
                                    }
                                </View>
                            </View>

                            {
                                progress[REVAMP_ON_BOARDING_TYPES.ACTIVITIES.key]
                                && <View style={styles.successLine(2)}/>
                            }


                            <View style={styles.itemWrapper}>
                                <View
                                    style={
                                        progress[REVAMP_ON_BOARDING_TYPES.ACTIVITIES.key]
                                            ? styles.roundCircle
                                            : progress[REVAMP_ON_BOARDING_TYPES.VALUES.key]
                                                ? styles.roundCircleWhite
                                                : styles.roundCircleGrey}>
                                    <Text
                                        style={
                                            progress[REVAMP_ON_BOARDING_TYPES.ACTIVITIES.key]
                                                ? styles.roundCircleText
                                                : progress[REVAMP_ON_BOARDING_TYPES.VALUES.key]
                                                    ? styles.roundCircleTextBlack
                                                    : styles.roundCircleTextBlackGrey
                                        }>3</Text>
                                </View>
                                <View style={styles.rightContentWrapper}>
                                    <Text
                                        style={progress[REVAMP_ON_BOARDING_TYPES.ACTIVITIES.key]
                                            ? styles.mainHeadingCompleted
                                            : progress[REVAMP_ON_BOARDING_TYPES.VALUES.key]
                                                ? styles.mainHeadingInprogress
                                                : styles.mainHeading}>
                                        Activities
                                    </Text>
                                    {revampOnBoardingContext?.typeInProgressName === REVAMP_ON_BOARDING_TYPES.ACTIVITIES.key &&
                                        <View style={styles.descWrapper}>
                                            <Text style={styles.descriptionText}>
                                                Our days are made up of activities.
                                                Can you identify some activities that will
                                                help you reach your reward?
                                            </Text>
                                            <ProgressBar style={styles.progressBarr}
                                                         progress={totalMajorQuestion > 0
                                                             ? attemptedMajorQuestions / totalMajorQuestion
                                                             : 0}
                                                         color={Colors.colors.mainPink}
                                                         borderRadius={8}/>
                                            <View style={{
                                                marginTop: 5,
                                                flexDirection: 'row',
                                                justifyContent: 'space-between'
                                            }}>
                                                <Text style={styles.lightText}>
                                                    {attemptedMajorQuestions} of {totalMajorQuestion} Completed
                                                </Text>
                                                <Text
                                                    style={styles.completedText}>
                                                    {
                                                        totalMajorQuestion > 0
                                                            ? Math.round((attemptedMajorQuestions / totalMajorQuestion) * 100)
                                                            : 0
                                                    }%</Text>
                                            </View>
                                        </View>
                                    }
                                </View>
                            </View>

                            {
                                progress[REVAMP_ON_BOARDING_TYPES.MIND_AND_BODY.key]
                                && <View style={styles.successLine(3)}/>
                            }

                            <View style={styles.itemWrapper}>
                                <View
                                    style={
                                        progress[REVAMP_ON_BOARDING_TYPES.MIND_AND_BODY.key]
                                            ? styles.roundCircle
                                            : progress[REVAMP_ON_BOARDING_TYPES.ACTIVITIES.key]
                                                ? styles.roundCircleWhite
                                                : styles.roundCircleGrey}>
                                    <Text
                                        style={
                                            progress[REVAMP_ON_BOARDING_TYPES.MIND_AND_BODY.key]
                                                ? styles.roundCircleText
                                                : progress[REVAMP_ON_BOARDING_TYPES.ACTIVITIES.key]
                                                    ? styles.roundCircleTextBlack
                                                    : styles.roundCircleTextBlackGrey}>4</Text>
                                </View>
                                <View style={styles.rightContentWrapper}>
                                    <Text
                                        style={progress[REVAMP_ON_BOARDING_TYPES.MIND_AND_BODY.key]
                                            ? styles.mainHeadingCompleted
                                            : progress[REVAMP_ON_BOARDING_TYPES.ACTIVITIES.key]
                                                ? styles.mainHeadingInprogress
                                                : styles.mainHeading}>Mind & Body</Text>
                                    {revampOnBoardingContext?.typeInProgressName === REVAMP_ON_BOARDING_TYPES.MIND_AND_BODY.key &&
                                        <View style={styles.descWrapper}>
                                            <Text style={styles.descriptionText}>
                                                Your plan also depends on your physical and mental wellbeing. Let us
                                                know how
                                                you’re doing.
                                            </Text>
                                            <ProgressBar style={styles.progressBarr}
                                                         progress={totalMajorQuestion > 0
                                                             ? attemptedMajorQuestions / totalMajorQuestion
                                                             : 0}
                                                         color={Colors.colors.mainPink}
                                                         borderRadius={8}/>
                                            <View style={{
                                                marginTop: 5,
                                                flexDirection: 'row',
                                                justifyContent: 'space-between'
                                            }}>
                                                <Text style={styles.lightText}>
                                                    {attemptedMajorQuestions} of {totalMajorQuestion} Completed
                                                </Text>
                                                <Text
                                                    style={styles.completedText}>
                                                    {
                                                        totalMajorQuestion > 0
                                                            ? Math.round((attemptedMajorQuestions / totalMajorQuestion) * 100)
                                                            : 0
                                                    }%</Text>
                                            </View>
                                        </View>
                                    }
                                </View>
                            </View>

                            {
                                revampOnBoardingContext?.typeInProgressName === ''
                                && <View style={styles.successLine(4)}/>
                            }


                            <View style={styles.itemWrapper}
                                  onLayout={(event) => this.onLayout(event)}
                            >
                                <View
                                    style={
                                        revampOnBoardingContext?.typeInProgressName === REVAMP_ON_BOARDING_TYPES.PLAN.key
                                            ? styles.roundCircleWhite
                                            : revampOnBoardingContext?.typeInProgressName === ''
                                                ? styles.roundCircle
                                                : styles.roundCircleGrey}>
                                    <Text
                                        style={
                                            revampOnBoardingContext?.typeInProgressName === REVAMP_ON_BOARDING_TYPES.PLAN.key
                                                ? styles.roundCircleTextBlack
                                                : revampOnBoardingContext?.typeInProgressName === ''
                                                    ? styles.roundCircleText
                                                    : styles.roundCircleTextBlackGrey}>
                                        5
                                    </Text>
                                </View>
                                <View style={styles.rightContentWrapper}>
                                    <Text
                                        style={revampOnBoardingContext?.typeInProgressName === REVAMP_ON_BOARDING_TYPES.PLAN.key
                                            ? styles.mainHeadingInprogress
                                            : revampOnBoardingContext?.typeInProgressName === ''
                                                ? styles.mainHeadingCompleted
                                                : styles.mainHeading}>
                                        Plan
                                    </Text>
                                    {revampOnBoardingContext?.typeInProgressName === REVAMP_ON_BOARDING_TYPES.PLAN.key &&
                                        <View style={styles.descWrapper}>
                                            <Text style={styles.descriptionText}>
                                                Finally, customize your plan to ensure it will
                                                work for you and then you can get started!.
                                            </Text>
                                            {/*<ProgressBar style={styles.progressBarr}*/}
                                            {/*             progress={totalMajorQuestion > 0*/}
                                            {/*                 ? attemptedMajorQuestions/totalMajorQuestion*/}
                                            {/*                 : 0}*/}
                                            {/*             color={Colors.colors.mainPink}*/}
                                            {/*             borderRadius={5}/>*/}
                                            {/*<View style={{*/}
                                            {/*    marginTop: 5,*/}
                                            {/*    flexDirection: 'row',*/}
                                            {/*    justifyContent: 'space-between'*/}
                                            {/*}}>*/}
                                            {/*    <Text style={styles.lightText}>*/}
                                            {/*        {attemptedMajorQuestions} of {totalMajorQuestion} Completed*/}
                                            {/*    </Text>*/}
                                            {/*    <Text*/}
                                            {/*        style={styles.completedText}>*/}
                                            {/*        {*/}
                                            {/*            totalMajorQuestion > 0*/}
                                            {/*                ? Math.round((attemptedMajorQuestions/totalMajorQuestion)*100)*/}
                                            {/*                : 0*/}
                                            {/*        }%</Text>*/}
                                            {/*</View>*/}
                                        </View>
                                    }
                                </View>
                            </View>
                        </View>
                    </View>
                </Content>
                <View style={styles.greBtns}>
                    <PrimaryButton
                        type={'Feather'}
                        color={Colors.colors.whiteColor}
                        onPress={() => {
                            this.navigateToRevampTypeHome(revampOnBoardingContext?.typeInProgressName)
                        }}
                        text={this.getButtonText(revampOnBoardingContext?.typeInProgressName)}
                        size={24}
                    />
                </View>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    headerStyle:{
        paddingTop: 15,
        paddingLeft: 20,
        paddingRight: 0,
        height: HEADER_SIZE
    },
    mainHeadingCompleted: {
        ...TextStyles.mediaTexts.mainTitle,
        ...TextStyles.mediaTexts.serifProBold,
        color: Colors.colors.successText,
        paddingTop: 4,
    },
    mainHeadingInprogress: {
        ...TextStyles.mediaTexts.mainTitle,
        ...TextStyles.mediaTexts.serifProBold,
        paddingTop: 4,
    },
    mainHeading: {
        ...TextStyles.mediaTexts.mainTitle,
        ...TextStyles.mediaTexts.serifProBold,
        color: Colors.colors.lowContrast,
        paddingTop: 4,
    },
    descWrapper: {
        marginTop: 13,

    },
    rightContentWrapper: {
        paddingLeft: 16,
        paddingRight: 16,
        width: "85%",

    },
    shape: {
        width: 4,
        // height: "100%",
        // minWidth: '20%',
        // maxWidth: 500,
        // minHeight: '10%',
        // maxHeight: '100%',
        position: 'absolute',
        backgroundColor: Colors.colors.highContrastBG,
        left: 58,
        top: 28
    },
    successLine: (level) => ({
        width: 4,
        height:40,
        minWidth: '20%',
        maxWidth: 500,
        minHeight: '10%',
        maxHeight: '100%',
        position: 'absolute',
        backgroundColor: Colors.colors.successIcon,
        left: 58,
        top: level === 1 ? 50 : (50 * level + (18 * level))
    }),
    descriptionText: {
        fontSize: 15,
        lineHeight: 24,
        color: Colors.colors.mediumContrast,
    },
    backButton: {
        marginTop: 10,
        width: 45,
        paddingTop: 0
    },
    roundCircle: {
        height: 56,
        width: 56,
        borderRadius: 50,
        backgroundColor: Colors.colors.successIcon,
        justifyContent: 'center',
        alignItems: 'center',
    },
    roundCircleWhite: {
        height: 56,
        width: 56,
        borderRadius: 50,
        backgroundColor: Colors.colors.whiteColor,
        justifyContent: 'center',
        alignItems: 'center',
        ...CommonStyles.styles.stickyShadow

    },
    roundCircleGrey: {
        height: 56,
        width: 56,
        borderRadius: 50,
        backgroundColor: Colors.colors.highContrastBG,
        justifyContent: 'center',
        alignItems: 'center',
    },
    roundCircleText: {
        color: Colors.colors.whiteColor,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM
    },
    roundCircleTextBlack: {
        color: Colors.colors.black,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM
    },
    roundCircleTextBlackGrey: {
        color: Colors.colors.lowContrast
    },
    mainContentWrapper: {
        marginTop: 28,
        paddingLeft: 32,
        paddingRight: 32,
        position: "relative"
    },
    itemWrapper: {
        display: 'flex',
        flexDirection: 'row',
        paddingBottom: 24,
    },
    lightText: {
        color: '#637888',
        fontSize: 13
    },
    completedText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.mainPink,
    },
    progressBarr: {
        backgroundColor: Colors.colors.highContrastBG,
        marginTop: 24,
        borderRadius: 8,
        height: 8,
        marginBottom: 8,

    },
    greBtns: {
        paddingHorizontal: 24,
        paddingBottom: isIphoneX() ? 34 : 24,
        backgroundColor: 'transparent'
    }
})

export default connectRevamp()(RevampOnBoardingProgressScreen);
