import React, {Component} from 'react';
import {FlatList, KeyboardAvoidingView, Platform, StatusBar, StyleSheet} from 'react-native';
import {Container, Content, Text, View} from 'native-base';
import {
    addTestID,
    BackButton,
    Colors,
    isIphoneX,
    PrimaryButton,
    SingleCheckListItem,
    TextStyles
} from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';
import DatePickerComponent from "../../components/DatePicker";
import moment from "moment";
import Loader from "../../components/Loader";

export default class ScheduleScreen extends Component<Props> {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.currentMoment = moment();
        const {navigation} = this.props;
        this.shortOnBoardingDetails = navigation.getParam('shortOnBoardingDetails', null);
        this.state = {
            selectedDate: this.currentMoment.format('DD'),
            selectedMonth: this.currentMoment.month(),
            selectedYear: this.currentMoment.format('Y'),
            schedules: [
                {title: 'Early morning  (6 am - 9 am)', selected: false},
                {title: 'Morning  (9 am - 12 pm)', selected: false},
                {title: 'Afternoon  (12 pm - 3 pm)', selected: false},
                {title: 'Early evening  (3 pm - 6 pm)', selected: false},
                {title: 'Evening  (6 pm - 9 pm)', selected: false}
            ]
        };
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    navigateToNextScreen = () => {
        const {schedules, selectedDate, selectedMonth} = this.state;
        let shortOnBoardingDetails = this.shortOnBoardingDetails
        shortOnBoardingDetails.requestedAppointmentDate = selectedDate.toString();
        shortOnBoardingDetails.requestedAppointmentMonth = moment.months(parseInt(selectedMonth));
        shortOnBoardingDetails.requestedAppointmentTime = schedules.filter(schedule => schedule.selected).map(item=>item.title);

        this.props.navigation.navigate(Screens.SELECT_STATE_SCREEN, {
            ...this.props.navigation.state.params,
            shortOnBoardingDetails: shortOnBoardingDetails
        });
    };

    render() {
        StatusBar.setBarStyle('dark-content', true);
        if (this.props.isLoading) {
            return <Loader/>;
        }
        const {schedules, selectedDate} = this.state;
        return (
            <KeyboardAvoidingView
                style={{flex: 1, bottom: 0}}
                behavior={Platform.OS === 'ios' ? 'padding' : null}>
                <Container style={{backgroundColor: Colors.colors.screenBG}}>
                    <StatusBar
                        backgroundColor={Platform.OS === "ios" ? null : "transparent"}
                        translucent
                        barStyle={"dark-content"}
                    />
                    <View style={styles.scheduleHeader}>
                        <View style={styles.backButtonWrapper}>
                            <BackButton
                                onPress={this.backClicked}
                            />
                        </View>
                        <Text style={styles.scheduleHeaderText}>Select date & time</Text>
                    </View>
                    <Content showsVerticalScrollIndicator={false}>
                        <View style={{marginTop: 16}}>
                            <DatePickerComponent
                                setSelectedDate={(selectedDate, selectedMonth, selectedYear) => {
                                    this.setState({selectedDate, selectedMonth, selectedYear})
                                }}
                            />
                        </View>
                        <View style={styles.optionList}>
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                data={schedules}
                                renderItem={({item, index}) =>
                                    <SingleCheckListItem
                                        listTestId={'list - ' + index + 1}
                                        checkTestId={'checkbox - ' + index + 1}
                                        keyId={index}
                                        listPress={() => {
                                            item.selected = !item.selected
                                            this.setState({schedules})
                                        }}
                                        itemSelected={item.selected}
                                        itemTitle={item.title}
                                        checkID={'checkbox - ' + index + 1}
                                    />
                                }
                                keyExtractor={item => item.id}
                            />
                        </View>

                    </Content>
                    <View
                        {...addTestID('view')}
                        style={styles.greBtn}>
                        <PrimaryButton
                            testId='continue'
                            disabled={!(schedules.some(schedule => schedule.selected) && selectedDate !== null)}
                            onPress={() => {
                                this.navigateToNextScreen();
                            }}
                            text="Continue"
                        />
                    </View>
                </Container>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    scheduleHeader: {
        paddingLeft: 0,
        paddingRight: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: isIphoneX() ? 50 : 44,
    },
    backButtonWrapper: {
        marginLeft: 18,
        width: 40,
        zIndex: 1
    },
    scheduleHeaderText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        textAlign: 'center',
        flex: 1,
        marginLeft: -40
    },
    alfie: {
        width: 110,
        height: 110,
    },
    optionList: {
        paddingHorizontal: 24,
        marginBottom: 24
    },
    greBtn: {
        paddingHorizontal: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        backgroundColor: 'transparent'
    }
});

