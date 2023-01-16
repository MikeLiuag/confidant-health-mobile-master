import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Icon} from 'native-base';
import {addTestID, isIphoneX, getTabMargin, Colors } from 'ch-mobile-shared';
import {connectReduxState} from '../../redux/modules';
import {Screens} from '../../constants/Screens';
import moment from 'moment';

const TAB_MARGIN = getTabMargin();

class SingleBottomNavigationIcon extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    hasBadge = () => {
        switch (this.props.routeName) {
            case Screens.CHAT_CONTACT_LIST: {
                if (this.props.connections.activeConnections.length > 0) {
                    let hasBadge = false;
                    this.props.connections.activeConnections.forEach(connection => {
                        if (connection.lastMessageUnread) {
                            hasBadge = true;
                        }
                    });
                    return hasBadge;
                }
                return false;
            }
            case Screens.APPOINTMENTS_SCREEN: {
                if (this.props.appointments.appointments.length > 0) {
                    let hasBadge = false;
                    this.props.appointments.appointments.forEach(appointment => {
                        if (appointment.status === 'NEEDS_ACTION') {
                            hasBadge = true;
                        }
                        if (appointment.status === 'BOOKED') {
                            if (moment().isSame(moment(appointment.startTime), 'days')
                                && !this.isMissed(appointment)) {
                                hasBadge = true;
                            }
                        }
                    });
                    return hasBadge;
                }
                return false;
            }
            case Screens.SECTION_LIST_SCREEN: {
                if(this.props.educational.assignedContent
                    && this.props.educational.assignedContent.assignedContent
                    && this.props.educational.assignedContent.assignedContent.length>0) {
                    if(this.props.profile.markAsCompleted && this.props.profile.markAsCompleted.length>0) {
                        let {assignedContent} = this.props.educational.assignedContent;
                        let {markAsCompleted} = this.props.profile;
                        assignedContent = assignedContent.map(content=>content.contentSlug);
                        markAsCompleted = markAsCompleted.map(content=>content.slug);
                        for(let content of assignedContent) {
                            if(!markAsCompleted.includes(content)) {
                                return true;
                            }
                        }
                    } else {
                        return true;
                    }
                }
                return false
            }
            default: {
                return false
            }
        }
    };

    isMissed = (appt)=>{
        return moment(appt.endTime).diff(moment(), 'minutes')<0
    };

    render() {
        const hasBadge = this.hasBadge();
        return (
            <View
                {...addTestID('bottom-icon-'+(this.props.iconName))}
                style={this.props.focused ? [styles.redRing, {backgroundColor: Colors.colors.mainBlue05}] : styles.redRing}>

                {
                    this.props.iconName === 'star-circle-outline' ?
                        <Icon
                            {...addTestID('star-icon')}
                            type={this.props.iconType?this.props.iconType:"Feather"} name={this.props.iconName}
                              style={this.props.focused ? [styles.starIcon, {color: Colors.colors.primaryIcon}] : styles.starIcon}/> :
                        // this.props.iconName === 'heart' ?
                        //     <View style={styles.plusWrap}>
                        //         <Icon
                        //             {...addTestID('heart-icon')}
                        //             type={this.props.iconType?this.props.iconType:"Feather"} name={this.props.iconName}
                        //               style={this.props.focused ? [styles.heartIco, {color: Colors.colors.primaryIcon}] : styles.heartIco}/>
                        //         <Icon
                        //             {...addTestID('plus-icon')}
                        //             type="FontAwesome" name="plus"
                        //               style={this.props.focused ? [styles.plusIco, {color: Colors.colors.primaryIcon}] : styles.plusIco} />
                        //     </View>:
                            <Icon
                                {...addTestID(this.props.iconName + ' - Icon')}
                                type={this.props.iconType?this.props.iconType:"Feather"} name={this.props.iconName}
                              style={this.props.focused ? [styles.iconStyle, {color: Colors.colors.primaryIcon}] : styles.iconStyle}/>
                }
                {hasBadge && (<View
                    {...addTestID('Appointment-dot')}
                    style={{...styles.redDot, display: hasBadge ? 'flex' : 'none'}}/>)}
            </View>
        )
            ;
    }
}
const styles = StyleSheet.create({
    foot: {
        backgroundColor: '#fff',
        justifyContent: 'flex-start',
    },
    // Footer Tab Style
    tabStyle: {
        backgroundColor: 'white',
        borderTopWidth: 0.5,
        borderTopColor: '#d1d1d1',
        justifyContent: 'flex-start',
        height: isIphoneX() ? 50 : 70,
        paddingTop: isIphoneX() ? 15 : 0,
        paddingBottom: 0
    },
    iconStyle: {
        color: Colors.colors.neutral50Icon,
        fontSize: 25,
        backgroundColor: 'rgba(255,255,255, 0.45)'
    },
    heartIco: {
        color: Colors.colors.neutral50Icon,
        fontSize: 30,
        backgroundColor: 'rgba(255,255,255, 0.45)'
    },
    starIcon: {
        color: Colors.colors.neutral50Icon,
        fontSize: 30,
        backgroundColor: 'rgba(255,255,255, 0.45)',
    },
    plusWrap: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center'
    },
    plusIco: {
        position: 'absolute',
        color: Colors.colors.neutral50Icon,
        fontSize: 13,
        backgroundColor: 'rgba(255,255,255, 0)',
        top: 8
    },
    tabIcon: {
        resizeMode: 'contain',
        height: 25,
    },
    redRing: {
        backgroundColor: 'transparent',
        width: 42,
        height: 42,
        borderRadius: 12,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: Colors.colors.white,
        // paddingTop: 4,
        marginTop: TAB_MARGIN,
    },
    redDot: {
        position: 'absolute',
        top: 2,
        right: 1,
        width: 13,
        height: 13,
        borderRadius: 8,
        backgroundColor: '#EC0D4E',
        borderWidth: 3,
        borderColor: '#fff'
    }
});


export default connectReduxState()(SingleBottomNavigationIcon);
