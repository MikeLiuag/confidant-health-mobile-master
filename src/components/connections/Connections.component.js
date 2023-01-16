import React, {Component} from "react";
import {StyleSheet, View, TouchableOpacity, Text, Image, AppState} from "react-native";
import {Button, Content, Icon} from "native-base";
import LottieView from "lottie-react-native";
import alfie from "../../assets/animations/Dog_with_phone_and_provider";
import {
    CommonStyles, TransactionSingleActionItem, addTestID, getAvatar, CHATBOT_DEFAULT_AVATAR, DEFAULT_AVATAR_COLOR,
    Colors, TextStyles, CommonSegmentHeader,
    CustomModal
} from 'ch-mobile-shared';
import FeatherIcon from "react-native-vector-icons/Feather";
import MaterialComIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {Divider} from 'react-native-elements';
import {AlphabetList} from "react-native-section-alphabet-list";
import {CONNECTIONS_SEGMENTS_OPTIONS} from "../../constants/CommonConstants";

export class Connections extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {
            activeConnectionsVisible: this.props.activeConnectionsVisible,
            appState: AppState.currentState,
            selectedItem: null,
            modalVisible: false,
            modalHeightProps: {
                height: 0
            }
        }
        this.modalRef = null;
    }

    static getDerivedStateFromProps(props) {
        return {
            activeConnectionsVisible: props.activeConnectionsVisible,
            appState: AppState.currentState
        }
    }

    componentDidMount(): void {
        AppState.addEventListener('change', this._handleAppState);
    }

    componentWillUnmount(): void {
        AppState.removeEventListener('change', this._handleAppState);
    }


    _handleAppState = () => {
        if (this.state.appState === 'active') {
            if (this.animation) {
                this.animation.play();
            }
        }
    }

    emptyState = () => {
        let emptyStateMsg = '';
        this.state.activeConnectionsVisible ?
            emptyStateMsg = 'You do not have any active connections right now. If you don’t think this is right, you can let us know by emailing help@confidanthealth.com and we’ll check it out for you.'
            :
            emptyStateMsg = 'You don’t have any past connections. Past connections are people, groups, or chatbots that you were previously connected to, but have disconnected from. If you don’t think this is right, you can let us know by emailing help@confidanthealth.com and we’ll check it out for you.'

        return (
            <View style={styles.emptyView}>
                <LottieView
                    ref={animation => {
                        this.animation = animation;
                    }}
                    style={styles.emptyAnim}
                    resizeMode="cover"
                    source={alfie}
                    autoPlay={true}
                    loop/>
                {
                    this.state.activeConnectionsVisible ?
                        <Text style={styles.emptyTextMain}>You Have No Active Connections</Text>
                        :
                        <Text style={styles.emptyTextMain}>You Have No Past Connections</Text>
                }
                <Text style={styles.emptyTextDes}>{emptyStateMsg}</Text>
            </View>
        );
    }

    /**
     * @function closeButtonMenu
     * @description This method is used to close modal .
     */
    closeButtonMenu = () => {
        this.props.onCloseInnerModal();
        this.setState({
            modalVisible: false
        });
    };

    checkConnectionStatus = (selectedConnection) => {

        const isConnected =
            this.props.activeConnections.filter(contact => {
                return contact.connectionId === selectedConnection?.connectionId;
            }).length > 0;
        const isRequested = this.props.requestedConnections.filter((connection) => {
            return connection.connectionId === selectedConnection.connectionId;
        }).length > 0;
        return isRequested || isConnected;
    }


    onLayout(event) {
        const {height} = event.nativeEvent.layout;
        const newLayout = {
            height: height
        };
        setTimeout(() => {
            this.setState({modalHeightProps: newLayout});
        }, 10)

    }

    detailDrawerClose = () => {
        this.props.onCloseInnerModal();
        this.setState({
            modalVisible: false,
            modalHeightProps: {
                height: 0,

            }
        });
    };

    render() {
        const {selectedItem} = this.state;
        return (
            <View style={styles.segmentItems}>
                <View style={{paddingLeft: 24, paddingRight: 24}}>
                    <CommonSegmentHeader
                        segments={[
                            {title: 'Active', segmentId: 'active'},
                            {title: 'Past', segmentId: 'past'},
                        ]}
                        segmentChanged={(segmentId) => {
                            const isActive = segmentId === CONNECTIONS_SEGMENTS_OPTIONS.ACTIVE;
                            this.props.sectionChanged(isActive);
                        }}
                    />
                </View>
                {this.props.activeSections && this.props.activeSections.length > 0 ?
                    <AlphabetList
                        data={this.props.activeSections}
                        indexLetterStyle={{color: Colors.colors.whiteColor, fontSize: 0}}
                        contentContainerStyle={{paddingBottom: 250}}
                        renderCustomItem={(item) => (
                            <TouchableOpacity
                                {...addTestID('Navigate-to-connection')}
                                activeOpacity={0.8}
                                style={styles.singleItem}
                                onPress={() => {
                                    this.props.changeAccess(item);
                                }}
                            >
                                <View style={styles.avatarContainer}>
                                    {item.profilePicture ?
                                        <Image
                                            resizeMode={'cover'}
                                            style={styles.avatarImage} source={{uri: getAvatar(item)}}/>
                                        : item.type === 'CHAT_BOT' ? (<Image
                                                resizeMode={'cover'}
                                                style={styles.avatarImage} source={{uri: CHATBOT_DEFAULT_AVATAR}}/>) :
                                            <View style={{
                                                ...styles.proBg,
                                                backgroundColor: item.colorCode ? item.colorCode : DEFAULT_AVATAR_COLOR
                                            }}><Text
                                                style={styles.proLetter}>{item.name?.charAt(0).toUpperCase()}</Text></View>
                                    }
                                </View>
                                <View style={styles.contact}>
                                    <Text style={styles.contactUsername} numberOfLines={2}>{item.name}</Text>
                                    {
                                        this.props.getConnectionSubText(item) && (
                                            <Text style={styles.subText}>
                                                {this.props.getConnectionSubText(item)}
                                            </Text>
                                        )
                                    }
                                </View>
                                <View style={styles.nextWrapper}>
                                    <Button
                                        {...addTestID('navigate-to-connection-btn')}
                                        transparent style={styles.nextBtn} onPress={() => {
                                        this.setState({
                                            selectedItem: {
                                                ...item,
                                                shouldConnect: this.checkConnectionStatus(item)
                                            }, modalVisible: true
                                        }, () => {
                                            this.props.onOpenInnerModal();

                                        });
                                    }}>
                                        <Icon type={"Feather"} name="more-horizontal" sie={24}
                                              color={Colors.colors.mainBlue}/>
                                    </Button>
                                </View>
                            </TouchableOpacity>
                        )}
                        renderCustomSectionHeader={(section) => (
                            <View style={styles.headRow}>
                                <Text style={styles.listTitle}>{section.title}</Text>
                                <Divider style={styles.dividerStyle} width={'90%'}
                                         color={Colors.colors.highContrast}/>
                            </View>
                        )}
                    />
                    : this.emptyState()}


                <CustomModal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.detailDrawerClose}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        maxHeight: this.state.modalHeightProps.height + 50,
                        bottom: this.state.modalHeightProps.height,
                    }}
                    entry={"bottom"}
                    isOpen={this.state.modalVisible}
                    position={"bottom"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content
                        showsVerticalScrollIndicator={false}>
                        <View
                            onLayout={(event) => this.onLayout(event)}
                            style={styles.actionList}>

                            {this.state.activeConnectionsVisible && (
                                <View style={styles.btnOptions}>
                                    <TransactionSingleActionItem
                                        title={'Go to chat'}
                                        iconBackground={Colors.colors.whiteColor}
                                        styles={styles.gButton}
                                        renderIcon={(size, color) =>
                                            <FeatherIcon size={24} color={Colors.colors.primaryIcon}
                                                         name="message-circle"/>
                                        }
                                        onPress={() => {
                                            this.closeButtonMenu();
                                            this.props.navigateToChat(selectedItem)
                                        }}
                                    />
                                </View>
                            )}


                            {(selectedItem?.type === 'PRACTITIONER' || selectedItem?.type === 'MATCH_MAKER') && this.state.activeConnectionsVisible && (
                                <View style={styles.btnOptions}>
                                    <TransactionSingleActionItem
                                        title={'Request Appointment'}
                                        iconBackground={Colors.colors.successBG}
                                        styles={styles.gButton}
                                        renderIcon={(size, color) =>
                                            <FeatherIcon size={24} color={Colors.colors.successIcon} name="calendar"/>
                                        }
                                        onPress={() => {
                                            this.closeButtonMenu();
                                            this.props.navigateToRequestAppointment(selectedItem)
                                        }}
                                    />
                                </View>
                            )}


                            <View style={styles.btnOptions}>
                                <TransactionSingleActionItem
                                    title={'View Profile'}
                                    iconBackground={Colors.colors.errorBG}
                                    styles={styles.gButton}
                                    renderIcon={(size, color) =>
                                        <FeatherIcon size={24} color={Colors.colors.warningIcon} name="user"/>
                                    }
                                    onPress={() => {
                                        this.closeButtonMenu();
                                        this.props.navigateToProfile(selectedItem)
                                    }}
                                />
                            </View>

                            {(selectedItem?.type === 'PRACTITIONER' || selectedItem?.type === 'MATCH_MAKER') && !this.state.activeConnectionsVisible && !selectedItem?.shouldConnect && (
                                <View style={styles.btnOptions}>
                                    <TransactionSingleActionItem
                                        title={'Connect'}
                                        iconBackground={Colors.colors.whiteColor}
                                        styles={styles.gButton}
                                        renderIcon={(size, color) =>
                                            <FeatherIcon size={24} color={Colors.colors.secondaryIcon} name="link-2"/>
                                        }
                                        onPress={() => {
                                            this.closeButtonMenu();
                                            this.props.connectWithProvider(selectedItem)
                                        }}
                                    />
                                </View>
                            )}

                            {this.state.activeConnectionsVisible && (
                                <View style={styles.btnOptions}>
                                    <TransactionSingleActionItem
                                        title={'Remove from connections'}
                                        iconBackground={Colors.colors.secondaryColorBG}
                                        styles={styles.gButton}
                                        renderIcon={(size, color) =>
                                            <MaterialComIcons size={24} color={Colors.colors.secondaryIcon}
                                                              name="link-variant-off"/>
                                        }
                                        onPress={() => {
                                            this.closeButtonMenu();
                                            this.props.disconnect(selectedItem)
                                        }}
                                    />
                                </View>
                            )}
                        </View>

                    </Content>
                </CustomModal>


            </View>
        );
    }

}

const styles = StyleSheet.create({
    emptyView: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
        paddingBottom: 20
    },
    emptyAnim: {
        width: '90%',
        alignSelf: 'center',
        marginBottom: 30,
        paddingLeft: 20
    },
    emptyTextMain: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.highContrast,
        marginBottom: 20
    },
    emptyTextDes: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.lightText,
        paddingLeft: 30,
        paddingRight: 30,
        textAlign: 'center'
    },
    tabHead: {
        flexDirection: 'row',
        backgroundColor: Colors.colors.highContrastBG,
        borderRadius: 10,
        margin: 24,
        marginTop: 16,
        padding: 4,
    },
    segmentItems: {
        backgroundColor: Colors.colors.whiteColor,
        display: 'flex',
        flex: 1
    },
    firstBtn: {
        borderWidth: 1,
        minWidth: 160,
        borderRadius: 8,
        backgroundColor: Colors.colors.whiteColor,
        justifyContent: 'center',
        height: 32,
        shadowColor: 'rgba(0,0,0,0.07)',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0
    },
    pastBtn: {
        borderWidth: 1,
        minWidth: 160,
        borderRadius: 8,
        backgroundColor: Colors.colors.whiteColor,
        justifyContent: 'center',
        height: 32,
        shadowColor: 'rgba(0,0,0,0.07)',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0
    },
    tabTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.highContrast
    },
    headRow: {
        alignItems: 'center',
        flexDirection: 'row',
        height: 40,
        paddingRight: 24,
        paddingLeft: 24,
        backgroundColor: Colors.colors.whiteColor,
        marginBottom: 16
    },
    listTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.inputPlaceholder,
        color: Colors.colors.lowContrast,
    },
    dividerStyle: {
        marginLeft: 24
    },
    singleItem: {
        flex: 1,
        flexDirection: "row",
        paddingLeft: 8,
        paddingRight: 24,
        backgroundColor: Colors.colors.whiteColor,
        alignItems: 'center',
        marginBottom: 16
    },
    avatarContainer: {
        width: 80,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.colors.whiteColor
    },
    avatarImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    contact: {
        flex: 1,
        backgroundColor: Colors.colors.whiteColor,
    },
    contactUsername: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
        marginBottom: 3
    },
    subText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.lowContrast,
        textTransform: 'capitalize'
    },
    nextWrapper: {
        height: 60,
        justifyContent: "center"
    },
    nextBtn: {},
    nextIcon: {},
    contactMetaWrapper: {
        marginLeft: 15,
        marginRight: 8,
    },
    proBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center'
    },
    proLetter: {
        color: Colors.colors.whiteColor,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH3,
        textTransform: 'uppercase'
    },
    actionList: {},
    gButton: {},
    btnOptions: {
        marginBottom: 8
    }
});

