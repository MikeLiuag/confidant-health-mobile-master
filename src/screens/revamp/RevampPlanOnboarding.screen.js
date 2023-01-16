import React, {PureComponent} from 'react';
import {Image, Platform, StatusBar, StyleSheet, TouchableOpacity} from 'react-native';
import {
    addTestID,
    Colors,
    CommonStyles,
    getHeaderHeight, isIphoneX,
    PrimaryButton,
    SecondaryButton,
    TextStyles,
} from 'ch-mobile-shared';
import {Container, Content, Header, Left, Right, Text, View} from 'native-base';
import {BackButton} from 'ch-mobile-shared/src/components/BackButton';
import Overlay from 'react-native-modal-overlay';
import AntIcons from 'react-native-vector-icons/AntDesign';
import Loader from '../../components/Loader';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {REVAMP_ON_BOARDING_TYPE_CONTEXT_STATUS} from "../../constants/CommonConstants";
import {Screens} from "../../constants/Screens";
import {connectRevamp} from "../../redux";
import EntypoIcons from "react-native-vector-icons/Entypo";
import FeatherIcons from "react-native-vector-icons/Feather";
import Modal from "react-native-modalbox";


const HEADER_SIZE = getHeaderHeight();

class RevampPlanOnboardingScreen extends PureComponent<Props> {

    constructor(props) {

        super(props);
        const {navigation} = this.props;
        this.revampTypeData = navigation.getParam("revampTypeData", null);
        this.state = {
            isLoading: false,
            allPlanItems: this.props.revamp.revampContext.plan && this.props.revamp.revampContext.plan.planItemsContexts || [],
            currentPlanState: 0,
            priorities: [],
            showPopupModal: false,
            showRemovePlanItemModal: false
        };
        this.scrollView= null;
    }

    getMainText = () => {
        const {currentPlanState} = this.state;
        switch (currentPlanState) {
            case 0:
                return 'We’ve put together an outline of a plan for you based on your previous responses.';
            case 1:
                return 'What would you like to focus on this week?';
            case 2:
                return 'Here is your priorities list for this week.';
            default:
                return '';
        }
    };

    getSubText = () => {
        const {currentPlanState} = this.state;
        switch (currentPlanState) {
            case 0:
                return 'This plan list is a starting point. Take a look. ' +
                    'Are there any suggestions that you know you don\'t want to do? Then remove them now. ' +
                    'If not, let\'s keep going!';
            case 1:
                return 'We recommend choosing 1-3 items to focus on in the first week. These will appear in a shorter list.';
            case 2:
                return 'You’ve unlocked a new home screen which includes your ReVAMP plan. You’re ready to jump in!';
            default:
                return '';
        }
    };

    backClicked = () => {
        let {currentPlanState} = this.state;
        if (currentPlanState === 0) {
            this.props.navigation.goBack();
        } else {
            if (currentPlanState === 1) {
                let {allPlanItems} = this.state;
                allPlanItems = allPlanItems.map(planItem => {
                    planItem.priority = false;
                    return planItem;
                });
                this.setState({
                    allPlanItems,
                    priorities: [],
                    currentPlanState: currentPlanState - 1,
                });
            } else {
                this.setState({
                    currentPlanState: currentPlanState - 1,
                });
            }

        }

    };

    removePlanItem = (planItemId) => {
        let {allPlanItems} = this.state;
        allPlanItems = allPlanItems.filter(planItem => planItem.planItem.id !== planItemId);
        this.setState({
            allPlanItems,
        });
    };

    addToPriority = (planItemId) => {
        let {allPlanItems} = this.state;
        allPlanItems = allPlanItems.map(planItem => {
            if (planItem.planItem.id === planItemId) {
                planItem.priority = !planItem.priority;
            }
            return planItem;
        });
        this.setState({
            allPlanItems,
        });
    };

    navigateToNextStep = () => {
        let {currentPlanState, allPlanItems} = this.state;
        switch (currentPlanState) {
            case 0: {
                if (allPlanItems?.length === 0) {
                    this.gotoSuccess();
                } else {
                    this.setState({
                        currentPlanState: currentPlanState + 1,
                    });
                }
                break;
            }
            case 1: {
                const priorities = allPlanItems.filter(planItem => planItem.priority);
                if (priorities?.length === 0) {
                    this.setState({
                        showPopupModal: true
                    })
                } else {
                    this.setState({
                        currentPlanState: currentPlanState + 1,
                        priorities,
                    });
                }
                break;
            }
            case 2: {
                this.gotoSuccess();
                break;
            }
        }
        setTimeout(()=>{
            this.scrollView._root.scrollToPosition(0, 0, true);
        }, 10);

    };

    gotoSuccess = () => {
        this.closePopup();
        this.updateRevampContext()
    };

    navigateToRewardPointsScreen = () => {
        const navigation = this.props.navigation;
        navigation.navigate(Screens.REVAMP_REWARD_POINT_SCREEN, {...navigation.state.params})
    };

    updateRevampContext = async () => {
        try {
            let {allPlanItems} = this.state;
            let revampContext = this.props.revamp.revampContext;
            if(revampContext.tokens && revampContext.tokens >= 0){
                revampContext.tokens += 1;
            } else {
                revampContext.tokens = 1;
            }
            if (allPlanItems?.length > 0) {
                revampContext.plan.planItemsContexts = allPlanItems
                const revampContextUpdate = await this.props.updateRevampContext(revampContext);
                if (revampContextUpdate.errors) {
                    console.log(revampContextUpdate.errors[0].endUserMessage);
                }
            }
            this.updateRevampOnBoardingContext();
        } catch (e) {
            console.log(e);
        }
    };


    updateRevampOnBoardingContext = async () => {
        try {
            let revampOnBoardingContext = this.props.revamp.revampOnBoardingContext
            let {revampTypesContexts} = revampOnBoardingContext;
            if (revampTypesContexts && revampTypesContexts.length > 0) {


                let typeInContext = revampTypesContexts.find(typeContext => typeContext.typeId === this.revampTypeData.id)
                if (!typeInContext) {
                    revampTypesContexts.push(
                        {
                            typeId: this.revampTypeData.id,
                            typeStatus: REVAMP_ON_BOARDING_TYPE_CONTEXT_STATUS.IN_PROGRESS.key,
                            questionsContexts:[]
                        }
                    );

                }
            }
            revampOnBoardingContext.marker = '';
            revampOnBoardingContext.revampTypesContexts = revampTypesContexts;

            this.props.updateRevampOnBoardingContext({revampOnBoardingContext});
            this.navigateToRewardPointsScreen();

        } catch (e) {
            console.log(e);
        }
    };

    closePopup = () => {
        this.setState({
            showPopupModal: false,
        });
    }


    render() {
        const {isLoading, allPlanItems, currentPlanState, priorities, showPopupModal, showRemovePlanItemModal, planItemId} = this.state;
        const planItems = currentPlanState === 2 ? priorities : allPlanItems;
        if (isLoading) {
            return <Loader/>;
        }
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <Content contentContainerStyle={styles.mainContent}
                         scrollEnabled={true}
                         showsVerticalScrollIndicator={false}
                         ref={c=> this.scrollView=c}
                >
                    <View>
                        <Header noShadow={false} transparent style={styles.header}>
                            <StatusBar
                                backgroundColor={Platform.OS === 'ios' ? null : 'transparent'}
                                translucent
                                barStyle={'dark-content'}
                            />
                            <Left>
                                <View style={styles.backButton}>
                                    <BackButton
                                        onPress={() => {
                                            this.backClicked();
                                        }}
                                    />
                                </View>
                            </Left>
                            <Right/>
                        </Header>
                        <Image
                            style={styles.questionsBg}
                            source={require('../../assets/images/rewardBgBlob.png')}/>
                        <View>
                            <View style={styles.questionWrapper}>
                                <View>
                                    <View style={styles.mainContentWrapper}>
                                        <Text style={styles.mainHeading}>{this.getMainText()}</Text>
                                        <Text style={styles.subHeading}>{this.getSubText()}</Text>
                                    </View>
                                    <View>
                                        {
                                            planItems.map((planItem, index) => {
                                                return (
                                                    <TouchableOpacity
                                                        key={`plan-item-${index}`}
                                                        onPress={() => {
                                                            if (currentPlanState === 0) {
                                                              this.setState({showRemovePlanItemModal:true, planItemId: planItem.planItem.id})
                                                            } else if (currentPlanState === 1) {
                                                                this.addToPriority(planItem.planItem.id);
                                                            }
                                                        }}
                                                    >
                                                        <View style={styles.planItemSectionWrapper}>
                                                            <View style={styles.sectionShape}>
                                                            </View>
                                                            <View style={styles.sectionItem}>
                                                                <View style={styles.sectionItemContentWrapper}>
                                                                    <View style={styles.sectionItemHeading}>
                                                                        <Text style={styles.sectionItemHeadingText}>Not
                                                                            started</Text>
                                                                        <Text style={styles.sectionItemHeadingSubText}>+{planItem.planItem.planToken ? planItem.planItem.planToken : 1} token</Text>
                                                                    </View>
                                                                    <View style={styles.sectionItemContent}>
                                                                    <Text style={styles.sectionItemContentText}>
                                                                        {planItem.planItem.name}
                                                                    </Text>
                                                                </View>
                                                                </View>
                                                                <View
                                                                    style={
                                                                        planItem.priority
                                                                        || currentPlanState === 2
                                                                            ? {}
                                                                            : currentPlanState === 0
                                                                                ? styles.sectionItemHeadingIconRed
                                                                                : styles.sectionItemHeadingIconGreen
                                                                    }>
                                                                    {
                                                                        currentPlanState === 0 ?
                                                                            <EntypoIcons name="minus" size={14}
                                                                                      color={Colors.colors.white}/> : null
                                                                    }
                                                                    {
                                                                        currentPlanState === 1 ? <>
                                                                            {
                                                                                planItem.priority ? <FeatherIcons
                                                                                        name="check" size={24}
                                                                                        color={Colors.colors.successIcon}/> :
                                                                                    <EntypoIcons
                                                                                        name="plus" size={14}
                                                                                        color={Colors.colors.white}/>
                                                                            }
                                                                        </> : null
                                                                    }
                                                                    {
                                                                        currentPlanState === 2 ?
                                                                            <FeatherIcon name={'more-horizontal'}
                                                                                         size={24}
                                                                                         color={Colors.colors.mainBlue}/> : null
                                                                    }
                                                                </View>
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            })
                                        }

                                        {
                                            currentPlanState !== 2 && (
                                                <View style={{ padding: 24, paddingBottom: isIphoneX() ? 36 : 24  }}>
                                                <PrimaryButton
                                                    type={'Feather'}
                                                    color={Colors.colors.mainBlue20}
                                                    text={'Continue'}
                                                    size={24}
                                                    onPress={this.navigateToNextStep}
                                                />
                                                </View>
                                            )
                                        }

                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </Content>
                {
                    currentPlanState === 2 && (
                        <View style={{padding: 24, paddingBottom: isIphoneX() ? 36 : 24  }}>
                            <PrimaryButton
                                type={'Feather'}
                                color={Colors.colors.mainBlue20}
                                text={'Continue'}
                                size={24}
                                onPress={this.navigateToNextStep}
                            />
                        </View>
                    )
                }

                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={()=>{
                        this.setState({showRemovePlanItemModal: false})
                    }}
                    isOpen={showRemovePlanItemModal}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        height:'auto',
                        position: 'absolute'
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"optionMenuModal"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                    />
                    <Content showsVerticalScrollIndicator={false} style={{paddingBottom:24}}>
                        <Text style={{...styles.modalMainHeading, paddingBottom:24, textAlign: 'center'}}>
                            Are you sure you want to permanently remove this item from your plan?
                        </Text>
                        <SecondaryButton
                            onPress={() => {
                                this.removePlanItem(planItemId);
                                this.setState({showRemovePlanItemModal: false})
                            }}
                            text={'Yes'}
                        />
                        <PrimaryButton
                            onPress={() => {
                                this.setState({showRemovePlanItemModal: false})
                            }}
                            text={'No'}
                        />
                    </Content>
                </Modal>

                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.closePopup}
                    isOpen={showPopupModal}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        height:'auto',
                        position: 'absolute',
                        paddingRight: 0,
                        paddingLeft: 0
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"popupModal"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                    />
                    <Content showsVerticalScrollIndicator={false}>
                        <View style={{marginVertical: 14, paddingLeft: 24, paddingRight: 24}}>
                            <Text style={styles.modalMainHeading}>Practice adding plan items to your short list.</Text>
                            <Text style={styles.modalSubHeading}>Highlighting your priorities can help ensure you’re
                                focusing your time and energy on what matters.</Text>
                        </View>
                        <View style={{padding: 24,  paddingBottom: isIphoneX() ? 36 : 24 }}>
                            <SecondaryButton
                                color={Colors.colors.mainBlue}
                                onPress={this.gotoSuccess}
                                text={'Not now'}
                                size={24}
                            />
                            <PrimaryButton
                                type={'Feather'}
                                color={Colors.colors.mainBlue20}
                                text={'Select Plan Item'}
                                size={24}
                                onPress={this.closePopup}
                            />
                        </View>
                    </Content>
                </Modal>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingLeft: 0,
        paddingRight: 0,
        height: HEADER_SIZE,
        // ...CommonStyles.styles.headerShadow,
        backgroundColor: 'transparent',
    },
    backButton: {
        marginLeft: 18,
        width: 40,
    },
    questionWrapper: {
        marginTop: 0,
        paddingHorizontal: 24,
    },
    mainContentWrapper: {
        marginBottom: 40,
    },
    questionsBg: {
        width: '100%',
        position: 'absolute',
        zIndex:-1
    },
    mainHeading: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        lineHeight: 40,
        color: Colors.colors.highContrast,
        marginBottom: 8,
        textAlign: 'left'
    },
    subHeading: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,

    },
    modalMainHeading: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        textAlign: 'left',
        paddingBottom: 24,
    },
    modalSubHeading: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextL,
        color: Colors.colors.highContrast,

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
    contentWrap: {
        flexDirection: 'row',
        // padding:12,
        position: 'relative',
        alignItems: 'center',
    },
    buttonText: {
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeMedium,
        width: '100%',
    },
    overlayBG: {
        backgroundColor: 'rgba(37,52,92,0.35)',
        zIndex: -1,
    },
    fabWrapper: {
        height: 'auto',
        padding: 0,
        paddingTop: 40,
        paddingBottom: 24,
        alignSelf: 'center',
        position: 'absolute',
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
    sectionItemContentText: {
        ...TextStyles.mediaTexts.linkTextM,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast,
    },
    sectionItemHeadingText: {
        ...TextStyles.mediaTexts.subTextS,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.lowContrast,
    },
    sectionItemHeadingSubText: {
        ...TextStyles.mediaTexts.subTextS,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.lowContrast,
        marginLeft: 8,
    },
    planItemSectionWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    sectionItemHeadingIconRed: {
        height: 24,
        width: 24,
        backgroundColor: Colors.colors.errorIcon,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionItemHeadingIconGreen: {
        height: 24,
        width: 24,
        backgroundColor: Colors.colors.successIcon,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionShape: {
        width: 4,
        height: 40,
        backgroundColor: Colors.colors.lowContrast,
        alignItems: 'center',
        marginLeft: 'auto',
        borderBottomLeftRadius: 8,
        borderTopLeftRadius: 8,

    },
    sectionItem: {
        ...CommonStyles.styles.shadowBox,
        padding: 24,
        width: '98%',
        marginBottom: 8,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    sectionItemContentWrapper:{
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
        width: 220,
    },
    sectionItemHeading: {
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 4,
    },
    sectionItemContent: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',

    }
});

export default connectRevamp()(RevampPlanOnboardingScreen);
