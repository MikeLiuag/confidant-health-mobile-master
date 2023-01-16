import React, {Component} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {Button, Left, Container, Content, Header, Text} from 'native-base';
import {addTestID, isIphoneX, getHeaderHeight} from 'ch-mobile-shared';
import GradientButton from '../../components/GradientButton';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from "react-native-linear-gradient";

const HEADER_SIZE = getHeaderHeight();

class SessionPaidScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {};
    }

    navigateBack() {
        this.props.navigation.goBack();
    }

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return(
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
                        <Left>
                            <Button
                                {...addTestID('Back')}
                                onPress={() => this.navigateBack()}
                                transparent
                                style={styles.backButton}>
                                <Icon name="angle-left" size={32} color="#3fb2fe"/>
                            </Button>
                        </Left>
                    </Header>
                    <Content>
                        <Text style={styles.paymentTitle}>Congrats, your Telehealth Session is paid</Text>
                        <Text style={styles.costValue}>$400</Text>
                        <Text style={styles.costText}>Account balance</Text>
                    </Content>
                    <View style={styles.greBtn}>
                        <Button
                            {...addTestID('Vew-payment-details')}
                            transparent style={{ alignSelf: 'center'}}>
                            <Text uppercase={false} style={styles.detailText}>View Payment Details</Text>
                        </Button>
                        <GradientButton
                            testId = "back-to-chat"
                            onPress={() => this.navigateBack()}
                            text="back to chat"
                        />
                    </View>
                </LinearGradient>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingLeft: 3,
        borderBottomColor: '#fff',
        elevation: 0,
        justifyContent: 'flex-start',
        height: HEADER_SIZE,
    },
    backButton: {
        marginLeft: 15,
        width: 35
    },
    paymentTitle: {
        textAlign: 'center',
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        fontSize: 24,
        lineHeight: 36,
        letterSpacing: 1,
        marginBottom: 35,
        marginTop: 20,
        paddingLeft: 40,
        width: '90%',
        paddingRight: 40,
        alignSelf: 'center'
    },

    costValue: {
        color: '#77c70b',
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        fontSize: 48,
        textAlign: 'center',
        lineHeight: 48,
        marginBottom: 16
    },
    costText: {
        color: '#515d7d',
        fontFamily: 'Roboto-Regular',
        fontSize: 11,
        fontWeight: '500',
        lineHeight: 12,
        letterSpacing: 1.5,
        textAlign: 'center',
        textTransform: 'uppercase',
        marginBottom: 35
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX()? 36 : 24
    },
    detailText: {
        color: '#3fb2fe',
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
        textAlign: 'center',
        marginBottom: 20
    }
});
export default SessionPaidScreen;
