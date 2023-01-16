import React from 'react';
import {StatusBar, StyleSheet, Text, View, Image} from 'react-native';
import {Container, Content} from 'native-base';
import GradientButton from '../../components/GradientButton';
import LinearGradient from "react-native-linear-gradient";


export default class GroupPayItForwardScreen extends React.PureComponent<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.customAmount = navigation.getParam('customAmount', null);
    }

    navigateToNextScreen = () => {
        this.props.navigation.goBack();
    };

    render() {

        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={["#fff", "#fff", "#f7f9ff"]}
                    style={{flex: 1}}
                >
                    <StatusBar backgroundColor='transparent' translucent animated showHideTransition="slide"/>
                    <Content
                        contentContainerStyle={{paddingTop: 80, paddingBottom: 75, paddingLeft: 40, paddingRight: 40}}>
                        <Text style={styles.groupDonationTitle}>Congrats! You've sent{"\n"}
                        <Text style={styles.groupDonationAmount}>${this.customAmount}
                        <Text style={styles.groupDonationTitle}> to the Confidant {"\n"}community.</Text></Text>
                        </Text>
                        <Text style={styles.groupDonationDes}>
                            100% of the money is used {'\n'} for clinical care.
                        </Text>
                        <Image
                            resizeMode={'contain'}
                            style={styles.niceWorkImage}
                            source={require('../../assets/images/nice-work.png')}/>
                    </Content>
                    <View style={styles.btnStyle}>
                        <GradientButton
                            testId="continue"
                            text="Continue"
                            onPress={() => {
                                this.navigateToNextScreen();
                            }}
                        />
                    </View>
                </LinearGradient>
            </Container>
        );
    };
}


const styles = StyleSheet.create({

    niceWorkImage: {
        width: '100%',
        height: 300,
    },
    groupDonationTitle: {
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: 24,
        letterSpacing: 1,
        lineHeight: 36,
        textAlign: 'center',
        marginBottom: 24,
    },
    groupDonationDes: {
        color: '#515D7D',
        fontFamily: 'Roboto-Regular',
        fontStyle: 'normal',
        fontWeight: '300',
        fontSize: 20,
        letterSpacing: 0.714286,
        lineHeight: 30,
        marginBottom: 24,
        textAlign: 'center',
        paddingRight: 15,
        paddingLeft: 15,
    },
    groupDonationAmount: {
        color: '#77C70B',
        fontFamily: 'Roboto-Regular',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: 24,
        letterSpacing: 1,
        lineHeight: 36,
        textAlign: 'center',
    },
    btnStyle: {
        paddingLeft: 23,
        paddingRight: 23,
        marginBottom: 30,
    },
});

