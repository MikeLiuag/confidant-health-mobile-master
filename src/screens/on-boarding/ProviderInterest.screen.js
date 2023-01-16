import React, {Component} from 'react';
import {FlatList, Image, StatusBar, StyleSheet} from 'react-native';
import {Container, Content, Text, View} from 'native-base';
import {
    addTestID,
    Colors,
    isIphoneX,
    PrimaryButton,
    SingleCheckListItem,
    TextStyles,
    BackButton, AlertUtil,
} from "ch-mobile-shared";
import SplashScreen from 'react-native-splash-screen';
import {Screens} from '../../constants/Screens';
import Loader from '../../components/Loader';
import AuthService from "../../services/Auth.service";
import ProfileService from "../../services/Profile.service";
import Analytics from "@segment/analytics-react-native";
import { SEGMENT_EVENT } from "../../constants/CommonConstants";
import DeviceInfo from "react-native-device-info";
import moment from "moment";
import { connectAuth } from "../../redux";

class ProviderInterestScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        SplashScreen.hide();
        super(props);
        const {navigation} = this.props;
        this.profileImage = navigation.getParam('profileImage', null);
        this.data = navigation.getParam('data', null);
        this.state = {
            isLoading: true,
            suggestions: [],
            systemConfig: {}
        };
    }

    async componentDidMount(): void {
        this.getOnBoardingGoals();
    }

    getOnBoardingGoals = async () => {
        try {
            const response = await AuthService.getPatientOnBoardingGoals();
            if (response.errors) {
                const onBoardingGoalsErrorMessage = response.errors[0].endUserMessage;
                AlertUtil.showErrorMessage(onBoardingGoalsErrorMessage);
                this.setState({isLoading: false});
            } else {
                this.setState({
                    systemConfig: response,
                    isLoading: false
                },()=>{
                    this.addFlags();
                });
            }
        } catch (e) {
            AlertUtil.showErrorMessage(e);
            this.setState({isLoading: false});
        }
    };

    addFlags = async () => {
        if(this.state.systemConfig && this.state.systemConfig.connectionSuggestions) {
            const suggestions = this.state.systemConfig.connectionSuggestions.map(goal => {
                            return {
                                title: goal.label,
                                exclusive: goal.isExclusive,
                                selected: false,
                            };
                        });
            this.setState({
                suggestions
            });
        }
    };

    updateList = (title, exclusive) => {
        let suggestions = this.state.suggestions.map(item => {
            if(!exclusive && item.exclusive) {
                item.selected = false;
            }
            if (item.title === title) {
                item.selected = !item.selected;
            } else {
                if(exclusive) {
                    item.selected = false;
                }
            }
            return item;
        });

        this.setState({suggestions});

    };

    backClicked = () => {
        this.props.navigation.goBack();
    };

    sendResponse = async () => {
        try {
            this.setState({isLoading: true});
            const connectionSuggestions = this.state.suggestions?.filter(item => item?.selected).map(item => item?.title);
            const postOnboardPayload = {
                providerId:  null,
                profileImage: this.profileImage,
                connectionSuggestion: connectionSuggestions,

            };
            const onBoardRequestBody = {
                profile: postOnboardPayload,
                file: null,
            };
            const response = await ProfileService.patientOnBoarding(onBoardRequestBody);
            if (response.errors) {
                this.setState({isLoading: false});
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            } else {
                this.props.onUserOnboarded({
                    nickName: this.props?.auth?.meta?.nickname,
                    userId : this.props?.auth?.meta?.userId
                });
                Analytics.identify(this.props?.auth?.meta?.userId, {
                    "hasSuccessfullyOnboarded": true
                });
                Analytics.track(SEGMENT_EVENT.NEW_MEMBER_ONBOARDING_SUCCESSFULLY, {
                    category: 'Goal Completion',
                    label: 'New Member OnBoarding',
                    deviceType: DeviceInfo.getBrand,
                    requestedLinkAt: moment.utc(Date.now()).format(),
                })
                await AlertUtil.showSuccessMessage('Patient onboarded successfully');
                this.setState({isLoading:false},()=>{
                    setTimeout(() => {
                        this.navigateToNextScreen();
                    }, 100);
                })

            }
        } catch (e) {
            console.log(e);
            this.setState({isLoading: false});
            AlertUtil.showErrorMessage('Something went wrong, please try later');
        }
    };

    navigateToNextScreen = () => {
        const connectionSuggestions = this.state?.suggestions?.filter(item => item?.selected).map(item => item?.title);
        this.props.navigation.navigate(Screens.CONTRIBUTION_GATE_SCREEN, {
            ...this.props.navigation.state.params,
            connectionSuggestions
        });
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        if (this.state.isLoading) {
            return <Loader/>;
        }

        const isDisabled = this.state.suggestions?.filter(item => item?.selected).length < 1;

        return (
            <Container style={{ backgroundColor: Colors.colors.screenBG }}>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />
                <View style={styles.backButtonWrapper}>
                    <BackButton
                        onPress={this.backClicked}
                    />
                </View>
                <Content showsVerticalScrollIndicator={false}>
                    <View style={styles.textBox}>
                        <Image
                            {...addTestID('Goal-icon-png')}
                            style={styles.signInIcon}
                            source={require('../../assets/images/provider-interest.png')}/>
                        <Text
                            {...addTestID('Heading-1')}
                            style={styles.magicMainText}>
                            Is there something we can help you with right away?
                        </Text>
                        <Text
                            {...addTestID('Heading-2')}
                            style={styles.magicSubText}>
                            We can connect you to someone to get you answers fast.
                        </Text>
                    </View>
                    <View style={styles.optionList}>
                        {this.state.suggestions.length > 0 && (
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                data={this.state.suggestions}
                                renderItem={({item, index}) =>
                                    <SingleCheckListItem
                                        listTestId={'list - ' + index + 1}
                                        checkTestId={'checkbox - ' + index + 1}
                                        keyId={index}
                                        listPress={() => this.updateList(item.title, item.exclusive)}
                                        itemSelected={item.selected}
                                        itemTitle={item.title}
                                        checkID={'checkbox - ' + index + 1}
                                    />
                                }
                                keyExtractor={item => item.id}
                            />
                        )}
                    </View>
                    <View
                        {...addTestID('view')}
                        style={styles.greBtn}>

                        <PrimaryButton
                            textColor={'#fff'}
                            arrowIcon={false}
                            testId="continue"
                            disabled={isDisabled}
                            onPress={() => {
                                this.sendResponse();
                            }}
                            text="Continue"
                        />
                    </View>
                </Content>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    backButtonWrapper: {
        position: 'relative',
        zIndex: 2,
        paddingTop: isIphoneX()? 50 : 44,
        paddingLeft: 22
    },
    textBox: {
        alignItems: 'center',
        // paddingTop: isIphoneX()? 124 : 100,
        paddingLeft: 40,
        paddingRight: 40
    },
    signInIcon: {
        marginBottom: 40,
        width: 120,
        height: 120
    },
    magicMainText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 16,
        textAlign: 'center'
    },
    magicSubText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextL,
        marginBottom: 40,
        textAlign: 'center',
        color: Colors.colors.mediumContrast
    },
    greBtn: {
        paddingTop: 15,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 34 : 24
    },
    optionList: {
        padding: 24
    },
});

export default connectAuth()(ProviderInterestScreen)
