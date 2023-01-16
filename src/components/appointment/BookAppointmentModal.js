import React, {Component} from 'react';
import {addTestID, Colors, CommonStyles, TransactionSingleActionItem} from 'ch-mobile-shared';
import {View} from 'native-base';
import AntIcons from 'react-native-vector-icons/AntDesign';
import Modal from 'react-native-modalbox';
import {StyleSheet} from 'react-native';

export class BookAppointmentModal extends Component {
    constructor(props) {
        super(props);

    }

    navigateToProviders = ()=>{
        this.props.onClose();
        this.props.navigateToProviders();
    };

    navigateToServices = ()=>{
        this.props.onClose();
        this.props.navigateToServices();
    };

    render() {
        return (
            <Modal
                backdropPressToClose={true}
                backdropColor={Colors.colors.overlayBg}
                backdropOpacity={1}
                onClosed={this.props.onClose}
                isOpen={this.props.visible}
                style={{...CommonStyles.styles.commonModalWrapper, maxHeight: 240}}
                entry={'bottom'}
                position={'bottom'} swipeArea={100}>
                <View style={{...CommonStyles.styles.commonSwipeBar}}
                      {...addTestID('swipeBar')}
                />
                <View style={styles.bookActionList}>
                    <View style={styles.singleAction}>
                        <TransactionSingleActionItem
                            onPress={this.navigateToProviders}
                            title={'Book with a provider'}
                            iconBackground={Colors.colors.primaryColorBG}
                            styles={styles.gButton}
                            renderIcon={(size, color) =>
                                <AntIcons size={22} color={Colors.colors.primaryIcon} name="user"/>
                            }
                        />
                    </View>
                    <View style={styles.singleAction}>
                        <TransactionSingleActionItem
                            title={'Book by service'}
                            iconBackground={Colors.colors.secondaryColorBG}
                            onPress={this.navigateToServices}
                            styles={styles.gButton}
                            renderIcon={(size, color) =>
                                <AntIcons size={22} color={Colors.colors.secondaryIcon} name="appstore-o"/>
                            }
                        />
                    </View>
                </View>
            </Modal>
        );
    }

}

const styles = StyleSheet.create({
    bookActionList: {},
    singleAction: {
        marginBottom: 16,
    },
});
