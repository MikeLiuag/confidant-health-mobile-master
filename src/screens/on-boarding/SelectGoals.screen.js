import React, {Component} from 'react';
import {FlatList, Image, StatusBar, StyleSheet} from 'react-native';
import {Container, Content, Text, View} from 'native-base';
import {
    addTestID,
    AlertUtil,
    Colors,
    CommonStyles,
    isIphoneX,
    PrimaryButton,
    SingleCheckListItem,
    TextStyles,
    BackButton
} from 'ch-mobile-shared';
import SplashScreen from 'react-native-splash-screen';
import {Screens} from '../../constants/Screens';
import AuthService from '../../services/Auth.service';
import Loader from '../../components/Loader';


export default class SelectGoalsScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        SplashScreen.hide();
        super(props);
        const {navigation} = this.props;
        this.nickname = navigation.getParam('nickname', null);
        this.data = navigation.getParam('data', null);
        this.state = {
            isLoading: true,
            onBoardingGoals: [],
            systemConfig: {}
        };
    }

    async componentDidMount(): void {
        await this.getOnBoardingGoals();
    }

    getOnBoardingGoals = async () => {
        try {
            const response = await AuthService.getPatientOnBoardingGoals();
            if (response.errors) {
                const onBoardingGoalsErrorMessage = response.errors[0].endUserMessage;
                AlertUtil.showErrorMessage(onBoardingGoalsErrorMessage);
                this.setState({isLoading: false});
            } else {
                const onBoardingGoals = response.onboardingGoals.map(goal => {
                    return {
                        title: goal,
                        selected: false,
                    };
                })
                this.setState({
                    onBoardingGoals,
                    isLoading: false,
                    systemConfig: response
                });
            }
        } catch (e) {
            AlertUtil.showErrorMessage(e);
            this.setState({isLoading: false});
        }
    };

    updateList = (title) => {
        let onBoardingGoals = this.state.onBoardingGoals.map(item => {
            if (item.title === title) {
                item.selected = !item.selected;
            }
            return item;
        });

        this.setState({onBoardingGoals: onBoardingGoals});

    };

    backClicked = () => {
        this.props.navigation.goBack();
    };

    navigateToNextScreen = () => {
        const selectedGoals = this.state.onBoardingGoals.filter(item => item.selected).map(item => item.title);
        this.props.navigation.navigate(Screens.PRIVACY_DISCLOSURE_SCREEN, {
            nickname: this.nickname,
            onboardingGoals: selectedGoals,
            data: this.data,
            systemConfig: this.state.systemConfig
        });
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        if (this.state.isLoading) {
            return <Loader/>;
        }

        const isDisabled = this.state.onBoardingGoals && this.state.onBoardingGoals.filter(item => item.selected).length < 1;

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
                            source={require('../../assets/images/new-select-goals-icon2.png')}/>
                        <Text
                            {...addTestID('Heading-1')}
                            style={styles.magicMainText}>
                            We can help with a lot.
                            Where should we start?
                        </Text>
                        <Text
                            {...addTestID('Heading-2')}
                            style={styles.magicSubText}>
                            You can select more than one.
                        </Text>
                    </View>
                    <View style={styles.optionList}>
                        {this.state.onBoardingGoals && this.state.onBoardingGoals.length>0 && (
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                data={this.state.onBoardingGoals}
                                renderItem={({item,index}) =>
                                    <SingleCheckListItem
                                        listTestId={'list - ' + index+1}
                                        checkTestId={'checkbox - ' + index+1}
                                        keyId={index}
                                        listPress={() => this.updateList(item.title)}
                                        itemSelected={item.selected}
                                        itemTitle={item.title}
                                        checkID={'checkbox - ' + index+1}
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
                            testId = "continue"
                            disabled={isDisabled}
                            onPress={() => {
                                this.navigateToNextScreen();
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
