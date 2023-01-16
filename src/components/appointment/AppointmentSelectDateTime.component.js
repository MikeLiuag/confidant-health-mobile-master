import React, {Component} from 'react';
import {Image, Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Body, Button, Container, Content, Header, Icon, Left, Right, Text, Title} from 'native-base';
import {
    addTestID,
    AlertUtil,
    BackButton,
    Colors,
    CommonStyles,
    getHeaderHeight,
    isIphoneX,
    PrimaryButton,
    ToggleSwitch,
    TextStyles
} from 'ch-mobile-shared';
import AwesomeIcon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import {ContentLoader} from '../content-loader/ContentLoader';
import momentTimeZone from 'moment-timezone';
import Modal from 'react-native-modalbox';
import {Picker} from "react-native-wheel-pick";
import {TIME_KEY_VALUE, TIME_PICKER} from "../../constants/CommonConstants"
import Loader from "../Loader";
const isIos = Platform.OS === 'ios';

const HEADER_SIZE = getHeaderHeight();

export class AppointmentSelectDateTimeComponent extends Component<Props> {
    constructor(props) {
        super(props);
        this.currentMoment = moment();
        this.currentDayOfMonth = this.currentMoment.format('DD');
        this.currentMonth = this.currentMoment.month();
        this.currentYear = parseInt(this.currentMoment.format('Y'));
        this.state = {
            isLoading: false,
            index: 1,
            selectDate: false,
            selectedDate: this.currentDayOfMonth,
            selectSlot: false,
            selectedMonth: this.currentMonth,
            totalSlots: 3,
            slots: [],
            currentViewPage: 0,
            openFilterModal: false,
            selectedDays: [],
            startTime: '01',
            endTime: '23',
            providerSchedule: [],
            filterApplied: false
        };
    }


    componentDidMount = () => {
        this.getAvailableSlots();
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
                    date: dateValue,
                    day: _moment.format('ddd'),
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

    isDateToday = (date) => {
        return this.state.selectedMonth === this.currentMonth && parseInt(date) === parseInt(this.currentDayOfMonth);
    };

    selectDay = (date) => {
        if (this.state.selectedDate !== date) {
            this.setState({selectedDate: date, selectedSlot: null}, () => {
                if (this.state.providerSchedule.length > 0) {
                    this.getMasterScheduleSlots()
                } else {
                    this.getAvailableSlots();

                }
            });
        }
    };

    renderDays = () => {
        let daysOfMonth = [];
        if (this.state.providerSchedule.length > 0) {
            daysOfMonth = this.state.providerSchedule
                .filter(schedule => {
                        return moment(schedule.scheduleDate, 'DD-MM-yyyy').format('MM') === this.getSelectedMonth().toString();
                    }
                ).map(schedule => {
                    const date = moment(schedule.scheduleDate, 'DD-MM-yyyy');
                    return {date: date.format('DD'), day: date.format('ddd')}
                });
        } else if (this.state.providerSchedule.length === 0 && this.state.filterApplied) {
            daysOfMonth = [];
        } else {
            daysOfMonth = this.getDaysInMonth(this.state.selectedMonth, this.currentYear);
        }

        let isAvailable = true;
        const days = daysOfMonth.map((data, index) => {
            return (

                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {isAvailable ?
                        <TouchableOpacity
                            {...addTestID('Select-' + (index + 1))}
                            key={this.state.selectedMonth + data.date + data.day}
                            style={this.isDateSelected(data.date) ? [styles.singleday, {borderColor: Colors.colors.mainPink20}] : styles.singleday}
                            onPress={() => {
                                this.selectDay(data.date);
                            }}
                        >
                            <Text style={styles.selectedMonthText}>{data.day}</Text>
                            <Text
                                style={this.isDateSelected(data.date) ? [styles.dateText, {color: Colors.colors.secondaryText}] : styles.dateText}>{data.date}</Text>
                            <Text style={styles.selectedMonthText}>{moment.months(this.state.selectedMonth)}</Text>
                            <Text
                                style={styles.totalSlotsText}>{(this.isDateSelected(data.date) && !this.state.isLoading && (this.state.slots.length < 1 ? "No slots" : `${this.state.slots.length} Slots`)) || ' '}</Text>

                        </TouchableOpacity>
                        :
                        <View style={{
                            height: 12,
                            width: 12,
                            borderRadius: 6,
                            backgroundColor: Colors.colors.swipeBg,
                            marginLeft: 8,
                            marginRight: 8
                        }}/>
                    }
                </View>
            );
        });

        return (
            <View style={styles.dayScroll}>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    {days}
                </ScrollView>
            </View>
        );
    };

    getSelectedMonth = () => {
        let month = this.state.selectedMonth + 1;
        if (month < 10) {
            return '0' + month;
        } else {
            return month;
        }

    };


    getAvailableSlots = async () => {
        this.setState({isLoading: true});
        const tz = this.props.appointments.timezone ? this.props.appointments.timezone : momentTimeZone.tz.guess(true);
        const date = this.state.selectedDate + '-' + this.getSelectedMonth() + '-' + this.currentYear;
        let response = await this.props.getAvailableSlots(this.props.originalAppointment ? this.props.originalAppointment.participantId : (this.props.isMemberApp ? this.props.selectedMember.userId : this.props.selectedMember.connectionId),
            this.props.selectedService.id, date, tz);
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false, slots: []});
        } else {
            const hasSlots = response.length > 0;
            if (this.isDateToday(this.state.selectedDate)) {
                response = response.filter(slot => {
                    const now = parseInt(momentTimeZone().tz(tz).format('HHmm'));
                    return now < slot.start;
                });
            }
            const state = {isLoading: false, slots: response};
            if (!hasSlots) {
                state.selectedSlot = null;
            }
            this.setState(state);
        }
    };


    getMasterScheduleSlots = () => {
        try {
            const tz = this.props.appointments.timezone ? this.props.appointments.timezone : momentTimeZone.tz.guess(true);
            const date = this.state.selectedDate + '-' + this.getSelectedMonth() + '-' + this.currentYear;
            let response = this.state.providerSchedule.filter(schedule => schedule.scheduleDate === date).map(schedule => schedule.availableSlots)[0];
            if (response) {
                const hasSlots = response.length > 0;
                if (this.isDateToday(this.state.selectedDate)) {
                    response = response.filter(slot => {
                        const now = parseInt(momentTimeZone().tz(tz).format('HHmm'));
                        return now < slot.start;
                    });
                }
                const state = {isLoading: false, slots: response};
                if (!hasSlots) {
                    state.selectedSlot = null;
                }
                this.setState(state);
            }
        } catch (e) {
            console.log('error', e)

        }

    };


    getMasterSchedule = async () => {
        this.setState({isLoading: true, filterApplied: true});
        const timeZone = this.props.appointments.timezone ? this.props.appointments.timezone : momentTimeZone.tz.guess(true);
        let {selectedDays, startTime, endTime} = this.state;
        startTime = this.getSelectedTime(startTime)
        endTime = this.getSelectedTime(endTime)
        try {
            const payload = {
                duration: this.props.selectedService.duration,
                providerId: this.props.selectedMember.userId,
                selectedDays: selectedDays,
                startTime: startTime * 100,
                endTime: endTime * 100,
                timeZone: timeZone
            }
            let response = await this.props.getMasterSchedule(payload);
            if (response.errors) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
                this.setState({isLoading: false, providerSchedule: []});
            } else if (response.masterScheduleItems.length > 0){

                let masterSchedule = response.masterScheduleItems[0].providerSchedule.map(item => {
                    return {
                        scheduleDate: item.scheduleDate,
                        availableSlots: item.availableServices[0].availableSlots,
                    }
                })
                const date = moment(response.masterScheduleItems[0].firstAvailability, 'DD-MM-yyyy').format('DD')

                this.setState({
                    providerSchedule: masterSchedule,
                    isLoading: false,
                    selectedDate: date
                }, this.getMasterScheduleSlots)
            } else {
                this.setState({
                    providerSchedule: [],
                    isLoading: false,
                    selectedDate: null,
                    slots:[]
                })
            }
        } catch (e) {
            console.log('Error getting master schedule', e)
            this.setState({
                providerSchedule: [],
                isLoading: false,
                selectedDate: null,
                slots:[]
            })
        }
    };

    slotSelected = (slot) => {
        this.setState({selectedSlot: slot});
    };


    getTimeFromMilitaryStamp = (stamp) => {
        const stringStamp = (stamp + '');
        if (stringStamp.length === 1) {
            return {
                time: '12:0' + stringStamp,
                amPm: 'AM',
            };
        } else if (stringStamp.length === 2) {
            return {
                time: '12:' + stringStamp,
                amPm: 'AM',
            };
        } else if (stringStamp.length === 3) {
            let hr = stringStamp.substr(0, 1);
            let min = stringStamp.substr(1);
            return {
                time: '0' + hr + ':' + min,
                amPm: 'AM',
            };
        } else {
            let hr = stringStamp.substr(0, 2);
            let min = stringStamp.substr(2);
            let amPM = 'AM';
            if (parseInt(hr) >= 12) {
                if (hr > 12) {
                    hr = parseInt(hr) - 12;
                    if (hr < 10) {
                        hr = '0' + hr;
                    }
                }
                amPM = 'PM';
            }
            return {
                time: hr + ':' + min,
                amPm: amPM,
            };
        }

    };

    reviewAppointment = () => {
        const dateObject = new Date(this.currentYear, parseInt(this.getSelectedMonth()) - 1, this.state.selectedDate);
        const _moment = moment(dateObject);
        const selectedSchedule = {
            day: this.state.selectedDate,
            dateDesc: _moment.format('dddd') + ', ' + this.state.selectedDate + ' ' + _moment.format('MMMM') + ' ' + this.currentYear,
            dayDateText: _moment.format('MMMM') + ' ' + this.state.selectedDate,
            slotStartTime: this.getTimeFromMilitaryStamp(this.state.selectedSlot.start),
            slotEndTime: this.getTimeFromMilitaryStamp(this.state.selectedSlot.end),
            month: this.getSelectedMonth(),
            year: this.currentYear,
            slot: this.state.selectedSlot,
        };
        const updateCallback = this.props.updateAppointment;
        if (updateCallback) {
            updateCallback({
                ...this.props.originalAppointment,
                serviceId: this.props.selectedService.id,
                serviceName: this.props.selectedService.name,
                serviceDuration: this.props.selectedService.duration,
                serviceCost: this.props.selectedService.cost,
                recommendedCost: this.props.selectedService.recommendedCost,
                marketCost: this.props.selectedService.marketCost,
                isChanged: true,
                selectedSchedule,
            });
        }
        if (this.props.selectedMember) {
            this.props.navigateToRequestApptConfirmDetailsScreen(this.props.selectedService, selectedSchedule, this.props.selectedMember);
        } else {
            this.props.navigateToAppointmentDetailsScreen(this.props.originalAppointment,
                {
                    ...this.props.originalAppointment,
                    serviceId: this.props.selectedService.id,
                    serviceName: this.props.selectedService.name,
                    serviceDuration: this.props.selectedService.duration,
                    serviceCost: this.props.selectedService.cost,
                    recommendedCost: this.props.selectedService.recommendedCost,
                    marketCost: this.props.selectedService.marketCost
                },
                this.props.selectedService,
                selectedSchedule,
                this.props.selectedMember,
            );
        }
    };

    renderMonthCarousal = () => {
        const {selectedMonth} = this.state;
        const start = 1;
        const end = 12;
        let monthsList = new Array(end - start + 1).fill().map((_,index) => start + index);
        return (
            <ScrollView style={styles.monthWrapper}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}>
                {
                    monthsList.map(month => {
                        if(month >= this.currentMonth && month < moment.months().length) {
                            return (
                                <TouchableOpacity onPress={() => {
                                    this.setState({
                                        selectedMonth: month,
                                        selectedDate: null,
                                        slots: [],
                                        selectedSlot: null,
                                    })
                                }} style={styles.monthSlide} key={'month-' + month}>
                                    <Text style={selectedMonth === month ?
                                        {...styles.monthText, color:Colors.colors.mainPink}:
                                        styles.monthText}>{moment.months(month)}</Text>
                                </TouchableOpacity>
                            )
                        }else{
                            return null
                        }
                    })
                }
            </ScrollView>
        );
    };

    renderSlots = () => {
        const availableSlots = this.state.slots.map((slot, i, index) => {
            const startTime = this.getTimeFromMilitaryStamp(slot.start);
            const endTime = this.getTimeFromMilitaryStamp(slot.end);

            const isSelected = this.state.selectedSlot === slot;
            return (
                <TouchableOpacity
                    {...addTestID('slot-selected-' + (i + 1))}
                    key={'slot-' + i}
                    onPress={() => {
                        this.slotSelected(slot);
                    }}
                    style={isSelected ? {
                        ...styles.singleSlot, ...styles.singleSlotSelected,
                        width: '100%',
                        // height: 64
                    } : styles.singleSlot}>
                    <Text
                        style={isSelected ? [styles.sTimeText, {color: Colors.colors.secondaryText}] : styles.sTimeText}>{startTime.time}{' '}{startTime.amPm}</Text>
                    <AwesomeIcon
                        style={styles.slotIcon}
                        name="long-arrow-right" size={20}
                        color={isSelected ? Colors.colors.secondaryIcon : Colors.colors.neutral50Icon}/>
                    <Text
                        style={isSelected ? [styles.sTimeText, {color: Colors.colors.secondaryText}] : styles.sTimeText}>{endTime.time}{' '}{endTime.amPm}</Text>

                </TouchableOpacity>
            );

        });
        return (
            <View style={styles.slotWrapper}>
                {this.state.isLoading ? (<ContentLoader numItems={6}/>) : (
                    <View>

                        {this.state.selectedDate && (
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22}}>

                                <Text style={styles.slotHeading}>{availableSlots.length} slots available</Text>
                                <Text
                                    style={styles.slotDate}>{this.state.selectedDate}{' '}{moment.months(this.state.selectedMonth)}{' '}{this.currentYear}</Text>
                            </View>
                        )}
                        <View style={styles.slotList}>
                            {availableSlots.length === 0 ?
                                <View style={styles.emptySlot}>
                                    <Text
                                        style={styles.noSlotText}>{this.state.selectedDate  || this.state.filterApplied ? 'No time slot available for this day.Try to select another day.' : 'Please pick a date from the list'}</Text>
                                    <Image
                                        {...addTestID('empty-slot-png')}
                                        style={styles.noSlotImg}
                                        resizeMode="contain"
                                        source={require('../../assets/images/emptySlot.png')}/>
                                </View> :
                                availableSlots
                            }
                        </View>
                    </View>

                )}
            </View>
        );
    };

    renderBottomModal = () => {
        return (
            <View style={styles.greBtn}>
                <PrimaryButton
                    color={Colors.colors.whiteColor}
                    onPress={() => {
                        this.reviewAppointment();
                    }}
                    text="Continue"
                />

            </View>
        )
    }

    getSelectedTime = (value) => {
        let time = TIME_KEY_VALUE.find(time => time.key === value)
        return time.value;
    }

    onStartTimeItemSelected = (selectedValue) => {
        this.setState({startTime: selectedValue})
    };

    onEndTimeItemSelected = selectedValue => {
        this.setState({endTime: selectedValue})
    };


    closeFilterModal = () => {
        let callBack = this.applyFilters
        if (this.state.selectedDays.length === 0){
            callBack = this.clearFilters
        }
        this.setState({
            openFilterModal: false
        }, callBack);
    };


    dayToggleSwitchHandler = (day) => {
        let {selectedDays, startTime, endTime} = this.state;
        if (selectedDays.some((selectedDay) => selectedDay === day)) {
            let index = selectedDays.indexOf(day)
            selectedDays.splice(index, 1);
        } else {
            selectedDays.push(day);
        }
        this.setState({selectedDays: selectedDays});
    };

    applyFilters = () => {
        if (this.state.selectedDays.length > 0) {
            this.setState({openFilterModal: false})
            this.getMasterSchedule()
        }
    }

    clearFilters = () => {
        this.setState({
            providerSchedule: [],
            selectedDays: [],
            selectedDate: this.currentDayOfMonth,
            openFilterModal: false,
            filterApplied: false,
            startTime: 0,
            endTime: 0
        }, this.getAvailableSlots);
    }


    render() {
        if (this.state.isLoading && this.state.filterApplied) {
            return <Loader/>
        }
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <Header noShadow={false} transparent style={styles.header}>
                    <StatusBar
                        backgroundColor={Platform.OS === 'ios' ? null : 'transparent'}
                        translucent
                        barStyle={'dark-content'}
                    />
                    <Left>
                        <View style={styles.backButton}>
                            <BackButton
                                {...addTestID('back')}
                                onPress={this.props.backClicked}
                            />
                        </View>
                    </Left>
                    <Body style={{flex: 2}}>
                        <Title
                            {...addTestID("select-dateTime-appointment")}
                            style={styles.headerText}>Select date & time</Title>
                    </Body>
                    <Right>
                        <Button transparent
                                style={{alignItems: 'flex-end', paddingRight: 7, marginRight: 8}}
                                onPress={() => {
                                    this.setState({openFilterModal: true})
                                }}
                        >
                            <Image style={styles.filterIcon} source={require('../../assets/images/filter.png')}/>
                        </Button>
                    </Right>
                </Header>
                <Content>
                    <View style={styles.monthDate}>
                        {this.renderMonthCarousal()}
                        {this.renderDays()}
                        {this.renderSlots()}
                    </View>
                </Content>
                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.closeFilterModal}
                    style={{...CommonStyles.styles.commonModalWrapper, maxHeight: '80%'}}
                    entry={"bottom"}
                    position={"bottom"}
                    ref={"filterModal"}
                    swipeArea={100}
                    isOpen={this.state.openFilterModal}
                >
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content
                        showsVerticalScrollIndicator={false}>
                        <Text style={styles.timeHeaderText}>
                            Filter by days & time slots
                        </Text>
                        <View style={styles.timeBox}>


                            <Picker
                                style={styles.pickerStyle}
                                textColor={Colors.colors.lowContrast}
                                textSize={34}
                                selectedItemTextColor={Colors.colors.highContrast}
                                itemStyle={pickerItemStyle}
                                selectedValue={this.state.startTime}
                                itemSpace={24}
                                pickerData={TIME_PICKER}
                                onValueChange={this.onStartTimeItemSelected}
                            />


                            {/*<WheelPicker style={POBstyles.customWheel}*/}
                            {/*             isCyclic={true}*/}
                            {/*             hideIndicator={true}*/}
                            {/*             selectedItemTextSize={34}*/}
                            {/*             itemTextSize={34}*/}
                            {/*             itemTextColor={Colors.colors.lowContrast}*/}
                            {/*             selectedItemTextFontFamily={'Manrope-Bold'}*/}
                            {/*             itemTextFontFamily={'Manrope-Bold'}*/}
                            {/*             selectedItemTextColor={Colors.colors.highContrast}*/}
                            {/*             initPosition={this.state.initHour}*/}
                            {/*             data={TIME_PICKER}*/}
                            {/*             onItemSelected={this.onStartTimeItemSelected}/>*/}
                            <View style={styles.iconSection}>
                                <Icon type="FontAwesome" name="long-arrow-right"
                                      style={styles.arrowIcon}/>
                            </View>


                            <Picker
                                style={styles.pickerStyle}
                                textColor={Colors.colors.lowContrast}
                                textSize={34}
                                selectedItemTextColor={Colors.colors.highContrast}
                                selectedValue={this.state.endTime}
                                itemSpace={24}
                                pickerData={TIME_PICKER}
                                onValueChange={this.onEndTimeItemSelected}
                                itemStyle={pickerItemStyle}
                            />


                            {/*<WheelPicker style={POBstyles.customWheel}*/}
                            {/*             isCyclic={true}*/}
                            {/*             hideIndicator={true}*/}
                            {/*             selectedItemTextSize={34}*/}
                            {/*             itemTextSize={34}*/}
                            {/*             selectedItemTextFontFamily={'Manrope-Bold'}*/}
                            {/*             itemTextFontFamily={'Manrope-Bold'}*/}
                            {/*             itemTextColor={Colors.colors.lowContrast}*/}
                            {/*             selectedItemTextColor={Colors.colors.highContrast}*/}
                            {/*             initPosition={14}*/}
                            {/*             data={TIME_PICKER}*/}
                            {/*             onItemSelected={this.onEndTimeItemSelected}/>*/}
                        </View>
                        <View style={styles.dayList}>
                            {moment.weekdays().map((day) =>
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
                        <View style={styles.slotBtns}>
                            {/*<View style={{ marginBottom: 16}}>*/}
                            {/*    <PrimaryButton*/}
                            {/*        testId="schedule"*/}
                            {/*        onPress={() => {*/}
                            {/*            this.applyFilters()*/}
                            {/*        }}*/}
                            {/*        text="Apply Filters"*/}
                            {/*    />*/}
                            {/*</View>*/}
                            <PrimaryButton
                                testId="schedule"
                                textColor={Colors.colors.primaryText}
                                bgColor={Colors.colors.primaryColorBG}
                                onPress={() => {
                                    this.clearFilters()
                                }}
                                text="Clear Filters"
                            />
                        </View>
                    </Content>
                </Modal>
                {this.state.selectedSlot && this.renderBottomModal()}
            </Container>
        );

    }
}

const pickerItemStyle = {
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderTopColor: 'transparent',
    color: Colors.colors.highContrast,
    ...TextStyles.mediaTexts.manropeBold,
    fontSize: 25
};

const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingLeft: 3,
        paddingRight: 0,
        height: HEADER_SIZE,
        ...CommonStyles.styles.headerShadow
    },

    backButton: {
        marginLeft: 18,
        width: 40,
    },
    headerRow: {
        flex: 3,
        alignItems: 'center'
    },
    headerText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        textAlign: 'center',
    },
    filterIcon: {
        height: 24,
        width: 24,
        marginRight: 12,
        paddingLeft: 0,
        paddingRight: 0
    },
    monthDate: {
        padding: 24,
        paddingBottom: isIphoneX() ? 34 : 24
    },
    monthWrapper: {
        flexDirection: 'row',
        marginBottom: 42
    },
    monthSlide: {
        marginRight: 32,
    },
    dayScroll: {
        marginBottom: 22
    },
    singleday: {
        ...CommonStyles.styles.shadowBox,
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.03)',
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        paddingHorizontal: 24,
        paddingVertical: 16
    },
    monthText: {
        ...TextStyles.mediaTexts.manropeExtraBold,
        ...TextStyles.mediaTexts.TextH2,
        color: Colors.colors.mainPink20
    },
    dateText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH2,
        color: Colors.colors.highContrast,
    },
    selectedMonthText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.overlineTextS,
        color: Colors.colors.mediumContrast,
        marginBottom: 8,
        textTransform: 'uppercase'
    },
    totalSlotsText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.lowContrast,
    },
    slotWrapper: {},
    slotHeading: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
    },
    slotDate: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.lowContrast,
    },
    slots: {},
    slotList: {
        paddingTop: 20,
        paddingBottom: 20
    },
    singleSlot: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        borderRadius: 8,
        ...CommonStyles.styles.shadowBox,
        marginBottom: 8,
        padding: 24,
        width: '100%'
    },
    singleSlotSelected: {
        borderColor: Colors.colors.mainPink20,
        backgroundColor: Colors.colors.whiteColor,
    },
    slotIcon: {
        marginLeft: 16,
        marginRight: 16
    },
    sTimeText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextM,
        color: Colors.colors.highContrast
    },
    emptySlot: {
        paddingRight: 45,
        paddingLeft: 45,
        alignItems: 'center',
    },
    noSlotText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextM,
        color: Colors.colors.highContrast,
        textAlign: 'center'
    },
    noSlotImg: {
        width: '100%',
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        ...CommonStyles.styles.stickyShadow
    },
    slotBtns: {
        paddingBottom: isIphoneX() ? 36 : 24,
    },
    timeHeaderText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.TextH3,
        ...TextStyles.mediaTexts.serifProBold,
        marginBottom: 32
    },
    changeText: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeRegular,
        textAlign: 'center'
    },
    timeBox: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.colors.mediumContrastBG,
        marginBottom: 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 24,
        paddingRight: 24,
        height: 150,
        overflow: 'hidden'
    },
    timeSection: {},
    timeBtn: {},
    timeText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.TextH3,
        ...TextStyles.mediaTexts.manropeExtraBold
    },
    iconSection: {
        // top: 20
    },
    arrowIcon: {
        color: Colors.colors.neutral500Icon,
        fontSize: 24
    },
    dayList: {
        paddingBottom: 40
    },
    singleDay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24
    },
    dayText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextS
    },
    pickerStyle: {
        backgroundColor: 'transparent',
        width: 100,
        height: isIos ? 100 : 130,
        marginTop: isIos ? -115 : 0
    }
});




