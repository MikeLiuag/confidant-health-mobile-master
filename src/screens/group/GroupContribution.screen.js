import React from 'react';
import {StatusBar, StyleSheet, Image} from 'react-native';
import {Container, Text, View, Content} from 'native-base';
import {addTestID, isIphoneX, getHeaderHeight} from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';
import GradientButton from '../../components/GradientButton';
import LinearGradient from "react-native-linear-gradient";

const HEADER_SIZE = getHeaderHeight();

export default class GroupContributionScreen extends React.PureComponent<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
    }

    navigateToNextScreen = () => {
        this.props.navigation.replace(Screens.GROUP_REWARD_POINTS_SCREEN, {
            ...this.props.navigation.state.params,
        });
    };

    render() {
        StatusBar.setBarStyle('dark-content', true);
        return (
            <Container>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={['#fff', 'rgba(247,249,255,0.5)', '#f7f9ff']}
                    style={{flex: 1}}
                >
                    <Content>
                        <View style={styles.textBox}>
                            <View style={styles.alfieWrapper}>
                                <Image
                                    {...addTestID('Zip-code-png')}
                                    style={styles.headerImg}
                                    source={require('../../assets/images/hold-heart.png')}/>
                            </View>
                            <Text
                                {...addTestID('Heading-1')}
                                style={styles.contributionTitle}>
                                Amazing Contribution
                            </Text>
                            <Text
                                {...addTestID('Heading-2')}
                                style={styles.contributionSubText}>
                                Thank you for paying it forward! By contributing to the Confidant community you're making it possible for people to access care that can't currently afford it.
                            </Text>

                            <Text
                                {...addTestID('Heading-3')}
                                style={styles.contributionSubText}>
                                Together, we are transforming access to high-quality care for mental health and substance use disorders.
                            </Text>
                        </View>
                    </Content>
                    <View
                        {...addTestID('amazing-group-contribution')}
                        style={styles.greBtn}>
                        <GradientButton
                            testId="continue"
                            onPress={() => {
                                this.navigateToNextScreen();
                            }}
                            text="Continue"
                        />
                    </View>
                </LinearGradient>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        height: HEADER_SIZE,
        paddingLeft: 22
    },
    alfieWrapper: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'rgba(0,0,0, 0.15)',
        borderRadius: 80,
        elevation: 0,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 25,
        shadowOpacity: 1.0,
        shadowColor: 'rgba(0,0,0, 0.09)',
        marginBottom: 25,
        backgroundColor: '#fff',
    },
    headerImg: {
        width: 50,
    },
    textBox: {
        marginTop: 40,
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 16,
    },
    contributionTitle: {
        fontFamily: 'Roboto-Regular',
        color: '#25345C',
        fontSize: 24,
        lineHeight: 36,
        letterSpacing: 1,
        marginBottom: 16,
        textAlign: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        fontStyle: 'normal',
        fontWeight: 'normal',
    },
    contributionSubText: {
        fontFamily: 'Roboto-Regular',
        fontWeight: '300',
        fontSize: 20,
        lineHeight: 30,
        letterSpacing: 0.71,
        marginBottom: 40,
        textAlign: 'center',
        color: '#515D7D',
        fontStyle: 'normal',
        paddingLeft: 20,
        paddingRight: 20
    },
    greBtn: {
        paddingTop: 15,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 36 : 24
    },
});
