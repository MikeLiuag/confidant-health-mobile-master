import React, {Component} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import {Content, Text, View} from 'native-base';
import moment from "moment";
import {addTestID, Colors, CommonStyles, TextStyles} from "ch-mobile-shared";

class DatePickerComponent extends Component<Props> {
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
            selectedDate: this.currentDayOfMonth,
            selectedMonth: this.currentMonth,
            selectedYear: this.currentYear
        }
    }

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
        const end = 12;
        let monthsList = new Array(end - start).fill().map((_, index) => start + index);
        return (<ScrollView style={styles.monthWrapper}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}>
            {monthsList.map(month => {
                if (month >= this.currentMonth && month < moment.months().length) {
                    return (<TouchableOpacity onPress={() => {
                        this.setState({
                            selectedMonth: month, selectedDate: null,
                        }, () => {
                            this.props.setSelectedDate(this.state.selectedDate, month, this.currentYear)
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
        this.props.setSelectedDate(date, this.state.selectedMonth, this.currentYear);
    };

    renderDays = () => {
        let daysOfMonth = this.getDaysInMonth(this.state.selectedMonth, this.currentYear);

        const days = daysOfMonth.map((data, index) => {
            return (<View>
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

    render() {
        return (
            <Content showsVerticalScrollIndicator={false}>
                {this.renderMonthCarousal()}
                {this.renderDays()}
            </Content>
        );
    };
}

const styles = StyleSheet.create({
    singleDay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    dayText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextS
    },
    monthWrapper: {
        flexDirection: 'row',
        marginBottom: 32,
        marginLeft: 24,
    },
    monthSlide: {
        marginRight: 32,
    },
    dayScroll: {
        marginBottom: 32
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
        width: 96,
        height: 88
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
    selectedDayText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.overlineTextS,
        color: Colors.colors.mediumContrast,
        marginBottom: 8,
        textTransform: 'uppercase'
    }
});
export default (DatePickerComponent);
