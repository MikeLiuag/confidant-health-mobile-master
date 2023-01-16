import React from 'react';
import {StatusBar, StyleSheet, Image, Platform} from 'react-native';
import {Container, Text, View, Content} from 'native-base';
import {addTestID, isIphoneX, Colors, PrimaryButton, TextStyles, CommonStyles, BackButton} from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';


export default class onBoardingContributionScreen extends React.PureComponent<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
    }
    backClicked = () => {
        this.props.navigation.goBack();
    };
    navigateToNextScreen = () => {
        this.props.navigation.replace(Screens.PENDING_CONNECTIONS_SCREEN,{
            ...this.props.navigation.state.params,
        });
    };

    render() {
        StatusBar.setBarStyle('dark-content', true);
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
                            style={styles.signInIcon}
                            source={require('../../assets/images/group-donation-icon2.png')}/>
                        <Text
                            {...addTestID('heading-1')}
                            style={styles.magicMainText}>
                            Thank you
                            for paying it forward!
                        </Text>
                        <Text
                            {...addTestID('sub-text-1')}
                            style={styles.magicSubText}>
                            Cost should never be a barrier
                            to getting help.
                        </Text>
                        <Text
                            {...addTestID('sub-text-2')}
                            style={styles.magicSubText}>
                            Monthly app subscriptions make it possible for us to provide care to everyone, regardless of their
                            ability to pay.
                        </Text>
                        <Text
                            {...addTestID('sub-text-3')}
                            style={styles.magicSubText}>
                            You can adjust your monthly contribution at any time.
                        </Text>
                    </View>





                    {/*<View style={styles.textBox}>*/}
                    {/*    <View style={styles.alfieWrapper}>*/}
                    {/*        <Image*/}
                    {/*            {...addTestID('Zip-code-png')}*/}
                    {/*            style={styles.headerImg}*/}
                    {/*            source={require('../../assets/images/hold-heart.png')}/>*/}
                    {/*    </View>*/}
                    {/*    <Text*/}
                    {/*        {...addTestID('Heading-1')}*/}
                    {/*        style={styles.contributionTitle}>*/}
                    {/*        Amazing Contribution*/}
                    {/*    </Text>*/}
                    {/*    <Text*/}
                    {/*        {...addTestID('Heading-2')}*/}
                    {/*        style={styles.contributionSubText}>*/}
                    {/*        Thank you for paying it forward! By contributing to the Confidant community you're making it possible for people to access care that can't currently afford it.*/}
                    {/*    </Text>*/}

                    {/*    <Text*/}
                    {/*        {...addTestID('Heading-3')}*/}
                    {/*        style={styles.contributionSubText}>*/}
                    {/*        Together, we are transforming access to high-quality care for mental health and substance use disorders.*/}
                    {/*    </Text>*/}
                    {/*</View>*/}
                </Content>
                <View
                    {...addTestID('amazing-app-subscription-contribution')}
                    style={styles.greBtn}>
                    <PrimaryButton
                        testId="continue"
                        onPress={() => {
                            this.navigateToNextScreen();
                        }}
                        text="Continue"
                    />
                </View>
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
        paddingLeft: 24,
        paddingRight: 24,
        marginBottom: 70,
        flex: 1
    },
    signInIcon: {
        marginVertical: 40,
        width: 120,
        height: 120
    },
    magicMainText: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
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
    emailText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextL,
        color: Colors.colors.mediumContrast
    },
    greBtn: {
        paddingTop: 15,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        backgroundColor: 'transparent'
    }
});
