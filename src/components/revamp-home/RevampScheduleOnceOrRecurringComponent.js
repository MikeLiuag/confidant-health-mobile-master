import React, {Component} from 'react';
import {Platform, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import {Content, Text, View} from 'native-base';
import {connectConnections} from "../../redux";
import moment from "moment";
import {
    addTestID,
    Colors,
    CommonSegmentHeader,
    CommonStyles,
    isIphoneX,
    PrimaryButton,
    TextStyles
} from "ch-mobile-shared";
import {ToggleSwitch} from "ch-mobile-shared/src/components/ToggleSwitch";
import {Picker} from "react-native-wheel-pick";
import {MINUTE_PICKER, TIME_PICKER_12_HOURS} from "../../constants/CommonConstants";
import Entypo from "react-native-vector-icons/Entypo";
import Modal from "react-native-modalbox";
import momentTimeZone from "moment-timezone";
import ConversationService from "../../services/Conversation.service";
import ProfileService from "../../services/Profile.service";

const TABS = [{title: 'Once', segmentId: 0}, {title: 'Recurring', segmentId: 1},];
const isIos = Platform.OS === 'ios';

class RevampScheduleOnceOrRecurringComponent extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.currentMoment = moment();
        this.currentDayOfMonth = this.currentMoment.format('DD');
        this.currentMonth = this.currentMoment.month();
        this.currentYear = parseInt(this.currentMoment.format('Y'));
        this.state = {
            selectedDays: [],
            activeSegmentId: 0,
            hour: '10',
            minute: '30',
            midday: 'am',
            selectedDate: this.currentDayOfMonth,
            selectedMonth: this.currentMonth,
            selectedYear: this.currentYear,
            activitySchedule: this.initializeEmptyActivityScheduleState()
        }
    }

    initializeEmptyActivityScheduleState = () => {
        if (this.props.activityContext?.schedule) {
            return {
                activity: this.props.selectedActivity,
                schedule: this.props.activityContext.schedule
            }
        }

        return {
            activity: this.props.selectedActivity,
            schedule: {
                scheduledAt: moment.utc(Date.now()).format(),
                days: [],
                type: "ONCE",
                timeslot: 1030,
                timeZoneId: momentTimeZone.tz.guess(true),
                questionAnswers: []

            }
        };
    };

    scheduleActivity = async () => {
        try {
            let {
                activeSegmentId,
                selectedDays,
                hour,
                minute,
                midday,
                selectedDate,
                selectedYear,
                activitySchedule
            } = this.state;
            let { scheduledAt, timeslot, questionAnswers} = activitySchedule.schedule ? '' : '';
            const selectedTime = hour + ':' + minute + ' ' + midday.toUpperCase();
            const date = selectedYear + '-' + this.getSelectedMonth() + '-' + selectedDate;
            const selectedDateTime = date + ' ' + selectedTime;
            const type = TABS[activeSegmentId].title.toUpperCase()

            if (activeSegmentId === 1) {
                timeslot = parseInt(moment(selectedTime, ["h:mm A"]).format("HHmm"));
            } else {
                scheduledAt = moment(selectedDateTime, ["YYYY-MM-DD h:mm A"]).utc().format();
            }

            activitySchedule = {
                activity: this.props.selectedActivity,
                schedule: {
                    scheduledAt,
                    days: selectedDays,
                    type,
                    timeslot,
                    timeZoneId: momentTimeZone.tz.guess(true),
                    questionAnswers
                }
            }
            this.setState({activitySchedule})
            const activityScheduled = await ConversationService.scheduleActivity(activitySchedule);
            if (activityScheduled.errors) {
                console.log(activityScheduled.errors[0].endUserMessage);
            } else {
                this.addProfileElement(scheduledAt, timeslot);
                this.props.fetchRevampContext();
                this.props.onSchedulePress()

            }
        } catch (e) {
            console.log(e);
        }
    };

    addProfileElement =  (scheduledAt, timeslot) => {
        try {

            let {activeSegmentId, selectedDays} = this.state;
            let key = this.props.selectedActivity.name + ' - Activity Scheduled for'
            let type = "DATE_TIME"
            let value = [scheduledAt]

            if (activeSegmentId === 1){
                key = this.props.selectedActivity.name + ' - Activity Recurring Schedule'
                type = "DAY_TIME"
                value = selectedDays.map(day=> {
                    return (day + ' ' + timeslot);
                })
            }

            const profileElementRequest = {
                profileElements: [
                    {
                        profileElementKey: key,
                        type: type,
                        profileElementValue: value,
                        method: "MOST_RECENT_RESPONSE"
                    }
                ]
            }
            const response = ProfileService.addMultipleProfileElement(profileElementRequest);
            if (response.errors) {
                console.log(response.errors[0].endUserMessage);
            }
        } catch (e) {
            console.log(e);
        }
    };


    getSelectedMonth = () => {
        let month = this.state.selectedMonth + 1;
        if (month < 10) {
            return '0' + month;
        } else {
            return month;
        }
    };

    renderMonthCarousal = () => {
        const {selectedMonth} = this.state;
        const start = 0;
        const end = 11;
        let monthsList = new Array(end - start).fill().map((_, index) => start + index);
        return (<ScrollView style={styles.monthWrapper}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}>
            {monthsList.map(month => {
                if (month >= this.currentMonth && month < moment.months().length) {
                    return (<TouchableOpacity onPress={() => {
                        this.setState({
                            selectedMonth: month, selectedDate: null,
                        })
                    }} style={styles.monthSlide} key={'month-' + month}>
                        <Text style={selectedMonth === month ? {
                            ...styles.monthText, color: Colors.colors.mainPink
                        } : styles.monthText}>{moment.months(month)}</Text>
                    </TouchableOpacity>)
                } else {
                    return null
                }
            })}
        </ScrollView>);
    };

    getDaysInMonth = (month, year) => {
        const date = new Date(year, month, 1);

        const days = [];
        while (date.getMonth() === month) {
            const _moment = moment(new Date(date));
            const dateValue = _moment.format('DD');
            let dayToShow = true;
            if (month === this.currentMonth) {
                if (parseInt(dateValue) < parseInt(this.currentDayOfMonth)) {
                    dayToShow = false;
                }
            }
            if (dayToShow) {
                days.push({
                    date: dateValue, day: _moment.format('ddd'),
                });
            }

            date.setDate(date.getDate() + 1);
        }
        return days;
    };

    isDateSelected = (date) => {
        if (this.state.selectedDate === null) {
            return false;
        }
        return parseInt(this.state.selectedDate) === parseInt(date);
    };

    selectDay = (date) => {
        if (this.state.selectedDate !== date) {
            this.setState({selectedDate: date});
        }
    };

    renderDays = () => {
        let daysOfMonth = this.getDaysInMonth(this.state.selectedMonth, this.currentYear);

        const days = daysOfMonth.map((data, index) => {
            return (<View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20,}}>
                <TouchableOpacity
                    {...addTestID('Select-' + (index + 1))}
                    key={this.state.selectedMonth + data.date + data.day}
                    style={this.isDateSelected(data.date) ? [styles.singleDayWrapper, {borderColor: Colors.colors.mainPink20}] : styles.singleDayWrapper}
                    onPress={() => {
                        this.selectDay(data.date);
                    }}
                >

                    <Text
                        style={this.isDateSelected(data.date) ? [styles.dateText, {color: Colors.colors.secondaryText}] : styles.dateText}>{data.date}</Text>
                    <Text
                        style={styles.selectedDayText}>{data.date === this.currentDayOfMonth && this.currentMonth === this.state.selectedMonth ? 'Today' : data.day}</Text>
                </TouchableOpacity>
            </View>);
        });

        return (<View style={{...styles.dayScroll, marginLeft: 24,}}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                {days}
            </ScrollView>
        </View>);
    };

    dayToggleSwitchHandler = (day) => {
        let {selectedDays, startTime, endTime} = this.state;
        if (selectedDays.some((selectedDay) => selectedDay === day)) {
            let index = selectedDays.indexOf(day)
            selectedDays.splice(index, 1);
        } else {
            selectedDays.push(day);
        }

        const {activitySchedule} = this.state;
        activitySchedule.schedule.days = selectedDays;

        this.setState({selectedDays: selectedDays, activitySchedule});
    };

    onHourSelected = (selectedValue) => {
        this.setState({hour: selectedValue})
    };

    onMinuteSelected = (selectedValue) => {
        this.setState({minute: selectedValue})
    };

    onMiddaySelected = (selectedValue) => {
        this.setState({midday: selectedValue})
    };

    renderDaysToggle = () => {
        return <View style={styles.dayList}>
            {
                moment.weekdays().map((day) =>
                    <View style={styles.singleDay}>
                        <Text style={styles.dayText}>{day}</Text>
                        <ToggleSwitch
                            testId={'day-toggle'}
                            switchOn={this.state.selectedDays.some((selectedDay) => selectedDay === day.toUpperCase())}
                            backgroundColorOn={Colors.colors.mainPink}
                            backgroundColorOff={Colors.colors.neutral50Icon}
                            onPress={() => {
                                this.dayToggleSwitchHandler(day.toUpperCase())
                            }}

                        />
                    </View>
                )}
        </View>
    };

    renderTimePicker = () => {
        let {hour, minute, midday} = this.state;
        return (<View style={styles.timePickerWrapper}>
            <View style={styles.timeBox}>
                <View style={styles.hrsBox}>
                    <Picker
                        style={styles.pickerStyle}
                        textColor={Colors.colors.swipeBg}
                        textSize={24}
                        itemStyle={pickerItemStyle}
                        selectedValue={hour}
                        pickerData={TIME_PICKER_12_HOURS}
                        onValueChange={this.onHourSelected}
                    />
                </View>
                <View style={styles.iconSection}>
                    <Entypo name="dots-two-vertical"
                            style={styles.arrowIcon}/>
                </View>
                <View style={styles.minBox}>
                    <Picker
                        style={styles.pickerStyle}
                        textColor={Colors.colors.swipeBg}
                        textSize={24}
                        selectedValue={minute}
                        pickerData={MINUTE_PICKER}
                        onValueChange={this.onMinuteSelected}
                        itemStyle={pickerItemStyle}
                    />
                </View>
                <View style={styles.amBox}>
                    <Picker
                        style={styles.pickerStyle}
                        textColor={Colors.colors.swipeBg}
                        textSize={24}
                        selectedValue={midday}
                        pickerData={['am', 'pm']}
                        onValueChange={this.onMiddaySelected}
                        itemStyle={{...pickerItemStyle, ...TextStyles.mediaTexts.manropeRegular}}
                    />
                </View>
            </View>
        </View>)

    }

    render() {
        const {showScheduleOnceOrRecurringModal} = this.props;
        return (<Modal
            backdropPressToClose={true}
            backdropColor={Colors.colors.overlayBg}
            backdropOpacity={1}
            isOpen={showScheduleOnceOrRecurringModal}
            onClosed={() => {
                this.props.onClosed()
            }}
            style={{
                ...CommonStyles.styles.commonModalWrapper,
                paddingLeft: 0,
                paddingRight: 0,
                height: '95%'
            }}
            entry={"bottom"}
            position={"bottom"} ref={"questionModal"} swipeArea={100}>
            <View style={CommonStyles.styles.commonSwipeBar}
            />
            <Content showsVerticalScrollIndicator={false}>
                <View style={styles.questionWrapper}>
                    <Text style={styles.mainHeadingH3}>Schedule this activity</Text>
                    <View style={{paddingHorizontal: 24}}>
                        <CommonSegmentHeader
                            segments={TABS}
                            segmentChanged={(segmentId) => {
                                this.setState({activeSegmentId: segmentId});
                            }}
                        />
                    </View>
                    {this.state.activeSegmentId === 0 ?
                        <View style={{marginBottom: 30, marginTop: 16}}>
                            {this.renderMonthCarousal()}
                            {this.renderDays()}
                            {this.renderTimePicker()}
                        </View>
                        :
                        <View style={{marginBottom: 30}}>
                            {this.renderDaysToggle()}
                            {this.renderTimePicker()}
                        </View>}
                </View>
            </Content>
            <View style={styles.primaryButton}>
                <PrimaryButton
                    disabled={false}
                    color={Colors.colors.mainBlue20}
                    text={'Schedule'}
                    onPress={() => {
                        this.props.onSchedulePress()
                        this.scheduleActivity();
                    }}
                />
            </View>
        </Modal>);
    };
}

const pickerItemStyle = {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderTopColor: 'transparent', ...TextStyles.mediaTexts.manropeExtraBold, ...TextStyles.mediaTexts.TextH3,
    lineHeight: 40,
}

const styles = StyleSheet.create({
    mainContentWrapper: {
        marginBottom: 32, paddingHorizontal: 24
    },
    mainHeadingH3: {
        ...TextStyles.mediaTexts.serifProBold, ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        textAlign: 'left',
        paddingHorizontal: 24,
        marginBottom: 16
    },
    questionWrapper: {
        marginTop: 0, // paddingHorizontal: 24,
    },
    timePickerWrapper: {
        borderRadius: 8, marginLeft: 16, marginRight: 16, ...CommonStyles.styles.shadowBox,
    },
    timeBox: {
        height: isIos ? 140 : 102,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        flexShrink: 0,
        flexGrow: 0
    },
    pickerStyle: {
        backgroundColor: 'transparent',// width: '100%',// textAlign: 'left',
    },
    arrowIcon: {
        color: Colors.colors.neutral500Icon, fontSize: 24
    },
    hrsBox: {
        width: 95,
    },
    iconSection: {
        width: 40, alignItems: 'center'
    },
    minBox: {
        width: 95,
    },
    amBox: {
        width: 95
    },
    dayList: {
        paddingBottom: 0, marginBottom: 5, paddingHorizontal: 24
    },
    singleDay: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24,
    },
    dayText: {
        color: Colors.colors.highContrast, ...TextStyles.mediaTexts.manropeMedium, ...TextStyles.mediaTexts.bodyTextS
    },
    monthWrapper: {
        flexDirection: 'row', marginBottom: 16, marginLeft: 24,
    },
    monthSlide: {
        marginRight: 32,
    },
    dayScroll: {
        marginBottom: 22
    },
    singleDayWrapper: {
        ...CommonStyles.styles.shadowBox,
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.03)',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
        width: 96,
        height: 88
    },
    monthText: {
        ...TextStyles.mediaTexts.manropeExtraBold, ...TextStyles.mediaTexts.TextH2, color: Colors.colors.mainPink20
    },
    dateText: {
        ...TextStyles.mediaTexts.serifProBold, ...TextStyles.mediaTexts.TextH2, color: Colors.colors.highContrast,
    },
    selectedDayText: {
        ...TextStyles.mediaTexts.manropeRegular, ...TextStyles.mediaTexts.overlineTextS,
        color: Colors.colors.mediumContrast,
        marginBottom: 8,
        textTransform: 'uppercase'
    },
    segmentWrapper: {},
    primaryButton: {
        padding: 24,
        paddingBottom: isIphoneX() ? 34 : 24
    }

});
export default connectConnections()(RevampScheduleOnceOrRecurringComponent);
