import React, {Component} from 'react';
import {StatusBar, StyleSheet, Image} from 'react-native';
import {Container, Content, Text, View, Input, Item, Label} from 'native-base';
import {addTestID, isIphoneX, getHeaderHeight} from 'ch-mobile-shared';
import SplashScreen from 'react-native-splash-screen';
import {Screens} from '../../constants/Screens';
import GradientButton from '../../components/GradientButton';
import LinearGradient from "react-native-linear-gradient";
import {Colors} from "ch-mobile-shared/src/styles";
import Loader from "../../components/Loader";
import DatePicker from 'react-native-datepicker'
import moment from "moment";
import Analytics from "@segment/analytics-react-native";

const HEADER_SIZE = getHeaderHeight();

export default class EnterDateOfBirthScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        SplashScreen.hide();
        super(props);
        this.componentReference = null;
        this.state = {
            dateOfBirth: null,
            hasDOBError: null,
            dobFocus: false,
            currentDate:moment().toDate(),
        };
    }

    componentDidMount() {
        Analytics.screen(
            'Enter Date Of Birth screen'
        );
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    navigateToNextScreen = () => {
        this.props.navigation.navigate(Screens.ENTER_ZIP_CODE_SCREEN, {
            ...this.props.navigation.state.params,
            dateOfBirth:this.state.dateOfBirth,
        });

    }

    openDatePicker = () => {
        this.setState({dobFocus:true});
        if(this.componentReference) {
            this.componentReference.onPressDate();
        }
    }

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        if (this.state.isLoading) {
            return <Loader/>
        }

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
                    <Content showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 50}}>
                        <View>
                            <View style={styles.textBox}>
                                <Image
                                    stle={styles.blueBg}
                                    source={require('../../assets/images/sign-up-bg.png')}/>
                                <View style={styles.alfieWrapper}>
                                    <Image
                                        style={styles.headerImg}
                                        resizeMode={'contain'}
                                        source={require('../../assets/images/calendar.png')}/>
                                </View>
                                <Text style={styles.magicMainText}>
                                    In case we get disconnected, what’s your date of birth?
                                </Text>
                                <Text style={styles.magicSubText}>
                                    We use your date of birth to validate your account if you lose access.
                                </Text>
                                <Text style={styles.magicSubText}>
                                    We also use it to wish you a happy birthday 😄
                                </Text>

                            </View>
                            <View style={styles.zipBox}>

                                <Item
                                    floatingLabel
                                    style={styles.inputFields}
                                    error={this.state.hasDOBError}
                                    success={this.state.hasDOBError === false}>
                                    <Label
                                        style={this.state.hasDOBError ? [styles.inputLabel, {color: Colors.colors.lightRed}] : (this.state.dobFocus ? [styles.inputLabel, {color: Colors.colors.blue3}] : styles.inputLabel)}>
                                        {this.state.hasDOBError ? 'Date of Birth is incorrect' : 'Date of Birth'}
                                    </Label>
                                    <Input
                                        {...addTestID('date-of-birth')}
                                        style={styles.inputBox}
                                        onFocus={() => {
                                            this.openDatePicker()
                                        }}
                                        value={this.state.dateOfBirth?moment(this.state.dateOfBirth).format("MMM D, YYYY"):''}
                                    />
                                </Item>

                                <DatePicker
                                    ref={(ref) => {
                                        this.componentReference = ref;
                                    }}
                                    style={{width: 0}}
                                    date={this.state.dateOfBirth}
                                    mode="date"
                                    placeholder="select date"
                                    format="YYYY-MM-DD"
                                    //minDate="2016-05-01"
                                    maxDate={moment(this.state.currentDate).format("YYYY-MM-DD")}
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                        dateInput: {
                                            height: 0,
                                            width: 0
                                        },
                                        datePicker: {
                                            justifyContent:'center'
                                        },
                                        // datePickerCon: { backgroundColor: '#b3bec9' },
                                        // dateText: { color: '#8f96ab'},
                                        // btnTextCancel: { color: '#666'}
                                    }}
                                    onDateChange={(date) => {
                                        this.setState({dateOfBirth: date})
                                    }}
                                    showIcon={false}
                                />
                            </View>
                        </View>

                    </Content>
                    <View style={styles.greBtn}>
                        <GradientButton
                            testId = "continue"
                            disabled={!this.state.dateOfBirth}
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
        marginTop: -120,
        overflow: 'hidden'
    },
    headerImg: {
        width: 68,
    },
    textBox: {
        marginTop: 30,
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 16
    },
    blueBg: {},
    magicMainText: {
        fontFamily: 'Roboto-Regular',
        color: '#25345c',
        fontSize: 24,
        lineHeight: 36,
        letterSpacing: 1,
        marginBottom: 16,
        textAlign: 'center',
        paddingLeft: 20,
        paddingRight: 20
    },
    magicSubText: {
        fontFamily: 'Roboto-Regular',
        fontWeight: '300',
        fontSize: 20,
        lineHeight: 30,
        letterSpacing: 0.71,
        marginBottom: 40,
        textAlign: 'center',
        color: '#515d7d',
        paddingLeft: 20,
        paddingRight: 20
    },
    zipBox: {
        paddingRight: 40,
        paddingLeft: 40
    },
    inputFields: {
        fontFamily: 'Roboto-Regular',
        color: Colors.colors.darkBlue,
        marginBottom: 5,
        elevation: 0,
        borderBottomWidth: 1,
    },
    inputLabel: {
        fontFamily: 'Roboto-Regular',
        color: Colors.colors.inputPlaceholder,
        fontSize: 15,
        lineHeight: 16,
        paddingLeft: 0
    },
    inputBox: {
        color: Colors.colors.inputValue,
        height: 55,
        fontSize: 15,
        paddingLeft: 0
    },
    greBtn: {
        paddingTop: 15,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 36 : 24
    },
    blueText: {
        fontFamily: 'Roboto-Regular',
        color: '#3fb2fe',
        fontSize: 15,
        lineHeight: 20,
        letterSpacing: 0,
        textAlign: 'center',
        marginBottom: 10
    }
});
