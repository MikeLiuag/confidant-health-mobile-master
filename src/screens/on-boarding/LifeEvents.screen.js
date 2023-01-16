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
    BackButton
} from 'ch-mobile-shared';
import SplashScreen from 'react-native-splash-screen';
import {Screens} from '../../constants/Screens';
import Loader from '../../components/Loader';


export default class LifeEventsScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        SplashScreen.hide();
        super(props);
        const {navigation} = this.props;
        this.systemConfig = navigation.getParam('systemConfig', null);
        this.data = navigation.getParam('data', null);
        this.state = {
            isLoading: false,
            contexts: [],
            systemConfig: {},
        };
    }

    async componentDidMount(): void {
        this.addFlags();
    }

    addFlags = async () => {
        if (this.systemConfig && this.systemConfig.contexts) {
            const contexts = this.systemConfig.contexts.map(goal => {
                return {
                    title: goal.label,
                    exclusive: goal.isExclusive,
                    selected: false,
                };
            });
            this.setState({
                contexts,
            });
        }
    };

    updateList = (title, exclusive) => {
        let contexts = this.state.contexts.map(item => {
            if (!exclusive && item.exclusive) {
                item.selected = false;
            }
            if (item.title === title) {
                item.selected = !item.selected;
            } else {
                if (exclusive) {
                    item.selected = false;
                }
            }
            return item;
        });

        this.setState({contexts});

    };

    backClicked = () => {
        this.props.navigation.goBack();
    };

    navigateToNextScreen = () => {
        const contexts = this.state.contexts.filter(item => item.selected).map(item => item.title);
        this.props.navigation.navigate(Screens.REAL_PERSON_SCREEN, {
            ...this.props.navigation.state.params,
            contexts,
        });
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        if (this.state.isLoading) {
            return <Loader/>;
        }

        const isDisabled = this.state.contexts.filter(item => item.selected).length < 1;

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
                            source={require('../../assets/images/life-events.png')}/>
                        <Text
                            {...addTestID('Heading-1')}
                            style={styles.magicMainText}>
                            Can you give us more context?
                        </Text>
                        <Text
                            {...addTestID('Heading-2')}
                            style={styles.magicSubText}>
                            Please select anything you’re going through right now.
                        </Text>
                    </View>
                    <View style={styles.optionList}>
                        {this.state.contexts.length > 0 && (
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                data={this.state.contexts}
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
