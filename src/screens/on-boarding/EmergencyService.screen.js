import React from 'react';
import {Image, StatusBar, StyleSheet, BackHandler,Linking} from 'react-native';
import {Container, Content, Text, View} from 'native-base';
import SplashScreen from 'react-native-splash-screen';
import {connectAuth} from '../../redux';
import AuthService from "../../services/Auth.service";
import {Colors, TextStyles, CommonStyles, isIphoneX} from 'ch-mobile-shared';
import {EMERGENCY_CALL_NUMBER, NATIONAL_SUICIDE_PREVENTION_HELP_LINE} from "../../constants/CommonConstants";

class EmergencyServiceScreen extends React.PureComponent {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        SplashScreen.hide();
        super(props);

    }

    handleBackButton = () => {
        return true;
    };

    async componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);

        await AuthService.suicidalCriteria();
        this.props.logout();
    }

    componentWillUnmount(): void {
        BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
    }

    render() {
        StatusBar.setBarStyle('dark-content', true);
        return (
            <Container style={{ backgroundColor: Colors.colors.screenBG }}>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />

                <Content showsVerticalScrollIndicator={false}>
                    <View style={styles.textBox}>
                        <Text
                            style={styles.magicMainText}>
                            Confidant is not an {'\n'}emergency service.
                        </Text>

                        <Text style={styles.magicSubText}>
                            Your response indicates that you could be having an emergency.{'\n'}Confidant is not
                            equipped to support what you’re going through right now
                        </Text>
                        <Text style={styles.pinkText} onPress={() => Linking.openURL(`tel:${EMERGENCY_CALL_NUMBER}`)}>
                            You should call 911 or seek immediate medical attention.</Text>
                        <Text style={styles.magicSubText}>
                            We know this can be scary but by calling 911 you’ll get connected to care that is better suited to help you
                            right now
                        </Text>
                        <Text
                            style={styles.magicSubText}>
                            If you’re thinking about hurting yourself you can also call the National Suicide
                            Prevention Help Line at {'\n'}
                            <Text style={styles.callText} onPress={()=>Linking.openURL('tel:' + NATIONAL_SUICIDE_PREVENTION_HELP_LINE + '')}> 1-800-273-8255. </Text>
                        </Text>
                    </View>
                </Content>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    textBox: {
        paddingTop: isIphoneX()? 14 : 10,
        paddingLeft: 24,
        paddingRight: 24,
        marginTop: 90,
    },
    signInIcon: {
        marginBottom: 40,
        width: 120,
        height: 120
    },
    magicMainText: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.highContrast,
        marginBottom: 16,
    },
    magicSubText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        marginBottom: 32,
        color: Colors.colors.mediumContrast
    },
    pinkText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.mainPink,
        marginBottom: 32
    },
    callText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.primaryText
    }
});
export default connectAuth()(EmergencyServiceScreen);
