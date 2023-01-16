import React from 'react';
import {Image, StatusBar, StyleSheet, View} from 'react-native';
import {Container, Content, Header, Text} from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import {getHeaderHeight} from 'ch-mobile-shared';
import GradientButton from '../../components/GradientButton';
import {Screens} from '../../constants/Screens';
import Analytics from "@segment/analytics-react-native";

const HEADER_SIZE = getHeaderHeight();
export class CommunityCongratsScreen extends React.PureComponent<Props> {

    constructor(props) {
        super(props);
        this.amount = this.props.navigation.getParam('amount', null);
    }

    componentDidMount() {
        Analytics.screen(
            'Community Congrats Screen'
        );
    }

    navigateToNext = () => {
        this.props.navigation.replace(Screens.REWARD_POINTS_SCREEN, {
            ...this.props.navigation.state.params
        });
    };

    render = () => {
        return (
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={['#fff', '#fff', '#f7f9ff']}
                    style={{flex: 1}}
                >
                    <Header transparent style={styles.header}>
                        <StatusBar
                            backgroundColor="transparent"
                            barStyle="dark-content"
                            translucent
                        />
                    </Header>
                    <Content contentContainerStyle={{alignItems: 'center'}}>
                        <View style={styles.textWrapper}>
                            <Text style={styles.mainText}>
                                Congrats! You've sent <Text style={styles.amountText}>${this.amount}</Text> to the
                                Confidant Community.
                            </Text>
                            <Text style={styles.descriptionText}>
                                100% of the money is used for clinical care.
                            </Text>
                        </View>


                        <Image source={require('ch-mobile-shared/src/assets/images/Appt-sent.png')}
                               style={styles.sentImage}
                               resizeMode={'contain'}
                        />
                    </Content>
                    <View style={styles.btnStyle}>
                        <GradientButton
                            testId="continue"
                            onPress={this.navigateToNext}
                            text="Continue"
                        />
                    </View>
                </LinearGradient>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    header: {
        // paddingTop: 15,
        paddingLeft: 3,
        borderBottomColor: '#fff',
        elevation: 0,
        justifyContent: 'flex-start',
        height: HEADER_SIZE,
    },
    textWrapper: {
        paddingVertical: 40,
        paddingHorizontal: 45
    },
    mainText: {
        fontFamily: 'Roboto-Bold',
        fontSize: 27,
        fontWeight: '400',
        textAlign: 'center',
        lineHeight: 35,
        color: '#25345C',
        marginBottom: 30
    },
    descriptionText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        textAlign: 'center',
        lineHeight: 35,
        color: '#78819B',
        marginBottom: 30
    },
    amountText: {
        fontFamily: 'Roboto-Bold',
        fontSize: 27,
        fontWeight: '500',
        textAlign: 'center',
        color: '#77C70A'
    },
    sentImage: {
        width: 350,
        height: 300,
        // alignSelf: 'center'
    },
    btnStyle: {
        paddingLeft: 23,
        paddingRight: 23,
        marginVertical: 30,
        alignItems: 'center',
    },
});
