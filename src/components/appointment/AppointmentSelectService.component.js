import React, {Component} from 'react';
import {FlatList, Image, Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Body, Button, Container, Content, Header, Left, ListItem, Right, Text, Title} from 'native-base';
import {
    addTestID,
    BackButton,
    Colors,
    getHeaderHeight,
    isIphoneX,
    PrimaryButton,
    SecondaryButton,
    TextStyles,
    CommonStyles
} from "ch-mobile-shared";
import LinearGradient from "react-native-linear-gradient";
import {CheckBox} from 'react-native-elements';
import Loader from "../Loader";
import Modal from "react-native-modalbox";
import GradientButton from "../GradientButton";


const HEADER_SIZE = getHeaderHeight();

export class AppointmentSelectServiceComponent extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {};

    }

    renderService = (item) => {
        return (
            <TouchableOpacity
                style={styles.serviceMainWrapper}
                onPress={() => {
                    if(!item.isSelected) {
                        this.props.updateCheckStatus(item)
                    }
                }}>
                <View style={styles.itemHeader}>
                    <View style={{flex: 1}}>
                        <Text style={styles.itemTitle}>{item.name}</Text>
                        <View style={{display: 'flex', flexDirection: 'row', marginBottom: 16, marginTop: 8}}>
                            <Text style={styles.itemDurationCost}
                                  numberOfLines={2}>{item.durationText} session</Text>
                            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                <View style={styles.bulletIcon}/>
                                <Text style={styles.itemDurationCost}>User typically pay
                                    ${item.cost}</Text>
                            </View>
                        </View>
                        {/*<RenderTextChipComponent
                            renderList={item.service.serviceTypes}
                        />*/}
                        <Text numberOfLines={3} style={styles.itemDescription}>
                            {item.description || "N/A"}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    render() {
        if (this.props.isLoading) {
            return (<Loader/>);
        }
        return (
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={["#fff", "#fff", "#f7f9ff"]}
                    style={{flex: 1}}
                >
                    <Header noShadow={false} transparent style={styles.header}>
                        <StatusBar
                            backgroundColor={Platform.OS === "ios" ? null : "transparent"}
                            translucent
                            barStyle={"dark-content"}
                        />
                        <Left>
                            <View style={styles.backButton}>
                                <BackButton
                                    {...addTestID('back')}
                                    onPress={this.props.backClicked}
                                />
                            </View>
                        </Left>
                        <Body style={styles.headerRow}>
                            <Title
                                {...addTestID("select-service-by-type-header")}
                                style={styles.headerText}>Select Service</Title>
                        </Body>
                        <Right>
                            <Button transparent
                                    style={{alignItems: 'flex-end', paddingRight: 7, marginRight: 8}}
                                    onPress={() => {
                                        this.refs?.modalContact?.open()
                                    }}
                            >
                                <Image style={styles.filterIcon} source={require('../../assets/images/filter.png')}/>
                            </Button>
                        </Right>
                    </Header>
                    <Content
                        showsVerticalScrollIndicator={false}
                        {...addTestID("select-service-by-type-content")}
                    >
                        <View style={styles.list}>
                            <FlatList
                                scrollIndicatorInsets={{right: 1}}
                                showsVerticalScrollIndicator={false}
                                {...addTestID("Service-List")}
                                data={this.props.filteredItems}
                                renderItem={({item, index}) => (
                                    <TouchableOpacity
                                        {...addTestID("Select-service-" + (index + 1))}
                                        activeOpacity={0.8}
                                        style={item.isSelected
                                            ? [
                                                styles.serviceCard,
                                                {
                                                    borderColor: Colors.colors.mainPink80,
                                                },
                                            ]
                                            : styles.serviceCard
                                        }
                                        onPress={() => {
                                            this.setState({selectedService: item});
                                        }}
                                    >
                                        {this.renderService(item)}
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </View>
                    </Content>
                </LinearGradient>
                {this.props.selectedItem && (
                    <View
                        {...addTestID('view')}
                        style={styles.greBtn}>

                        <View style={styles.secondaryBtnWrapper}>
                            <SecondaryButton
                                testId="learn-more"
                                iconLeft='info'
                                type={'Feather'}
                                color={Colors.colors.mainBlue}
                                onPress={() => {
                                    this.props.navigateLearnMoreScreen(this.props.selectedItem);
                                }}
                                text="Learn more"
                                size={24}
                            />
                        </View>
                        <PrimaryButton
                            testId="schedule"
                            iconName='calendar'
                            type={'Feather'}
                            color={Colors.colors.whiteColor}
                            onPress={() => {
                                this.props.nextStep(this.props.selectedItem)
                            }}
                            text="Schedule"
                            size={24}
                        />

                    </View>
                )}

                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.props.closeFilterModal}
                    style={{...CommonStyles.styles.commonModalWrapper,
                        maxHeight: '80%',
                        // bottom: this.state.modalHeightProps.height
                    }}
                    entry={'bottom'}
                    position={'bottom'}
                    ref={'modalContact'}
                    swipeArea={100}
                    isOpen={this.props.openFilterModal}
                >
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content showsVerticalScrollIndicator={false}>
                        <View style={styles.filterBody}>
                            <Text style={styles.filterHead}>
                                Duration
                            </Text>
                            {this.props.durationsList.length && this.props.durationsList.map((duration, index) => (
                                <ListItem
                                    key={index}
                                    onPress={() => this.props.toggleFilterItem("durationsList", duration.title, this.props.applyFilter)}
                                    style={
                                        duration.checked
                                            ? [
                                                styles.multiList,
                                                {
                                                    backgroundColor: Colors.colors.primaryColorBG,
                                                    borderColor: Colors.colors.mainBlue40,
                                                },
                                            ]
                                            : styles.multiList
                                    }
                                >
                                    <Text
                                        style={
                                            duration.checked
                                                ? [
                                                    styles.checkBoxText,
                                                    {
                                                        color: Colors.colors.primaryText,
                                                    },
                                                ]
                                                : styles.checkBoxText
                                        }>
                                        {duration.title}
                                    </Text>
                                    <CheckBox
                                        containerStyle={
                                            duration.checked ?
                                                [
                                                    styles.multiCheck,
                                                    {
                                                        borderColor: Colors.colors.primaryIcon,
                                                    }
                                                ]
                                                : styles.multiCheck
                                        }
                                        center
                                        iconType='material'
                                        checkedIcon='check'
                                        uncheckedIcon=''
                                        checkedColor={Colors.colors.primaryIcon}
                                        checked={duration.checked}
                                        onPress={() => this.props.toggleFilterItem("durationsList", duration.title, this.props.applyFilter)}
                                    />
                                </ListItem>
                            ))}
                            <Text style={styles.filterHead}>
                                Cost
                            </Text>
                            {this.props.costsList.map((cost, index) => (
                                <ListItem
                                    key={index}
                                    onPress={() => this.props.toggleFilterItem("costsList", cost.title, this.props.applyFilter)}
                                    style={
                                        cost.checked
                                            ? [
                                                styles.multiList,
                                                {
                                                    backgroundColor: Colors.colors.primaryColorBG,
                                                    borderColor: Colors.colors.mainBlue40,
                                                },
                                            ]
                                            : styles.multiList
                                    }
                                >
                                    <Text
                                        style={
                                            cost.checked
                                                ? [
                                                    styles.checkBoxText,
                                                    {
                                                        color: Colors.colors.primaryText,
                                                    },
                                                ]
                                                : styles.checkBoxText
                                        }>
                                        {cost.title}
                                    </Text>


                                    <CheckBox
                                        containerStyle={
                                            cost.checked ?
                                                [
                                                    styles.multiCheck,
                                                    {
                                                        borderColor: Colors.colors.primaryIcon,
                                                    }
                                                ]
                                                : styles.multiCheck
                                        }
                                        center
                                        iconType='material'
                                        checkedIcon='check'
                                        uncheckedIcon=''
                                        checkedColor={Colors.colors.primaryIcon}
                                        checked={cost.checked}
                                        onPress={() => this.props.toggleFilterItem("costsList", cost.title, this.props.applyFilter)}
                                    />

                                </ListItem>
                            ))}
                            {/*<View style={styles.filterBtn}>*/}
                            {/*    <GradientButton*/}
                            {/*        onPress={() => this.props.applyFilter()}*/}
                            {/*        text="Apply filter"*/}
                            {/*    />*/}
                            {/*</View>*/}
                        </View>
                    </Content>
                </Modal>
            </Container>
        )

    }
}


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

    bulletIcon: {
        height: 8,
        width: 8,
        borderRadius: 4,
        backgroundColor: Colors.colors.neutral50Icon,
        marginRight: 8,
        marginLeft: 8
    },

    itemTitle: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 8,
        width:250
    //    justifyContent:'flex-start'
    },
    itemDurationCost: {

        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.lowContrast
    },
    itemDescription: {

        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.mediumContrast,
        marginTop: 16,
        marginBottom: 16
    },
    serviceMainWrapper: {
        borderRadius: 12
    },
    providerImages: {
        marginRight: 8
    },
    itemProviderCount: {

        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.secondaryText,
    },

    providersMainWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16
    },

    proText: {
        color: '#515d7d',
        fontFamily: 'Roboto-Regular',
        fontSize: 17,
        letterSpacing: 0.8,
        lineHeight: 18,
        textAlign: 'center',
        marginBottom: 30
    },
    list: {
        padding: 24
    },
    serviceCard: {
        borderWidth: 2,
        borderColor: '#f5f5f5',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: 'rgba(37, 52, 92, 0.09)',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowRadius: 10,
        shadowOpacity: 0.8,
        elevation: 1,
        backgroundColor: Colors.colors.whiteColor,
        flexDirection: 'column'

    },
    checkWrapper: {
        paddingRight: 16
    },
    nextBtn: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 34 : 24
    },
    personalInfoWrapper: {
        borderColor: 'rgba(0,0,0,0.05)',
        backgroundColor: '#fff',

        marginTop: 16,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    personalInfoRating: {
        marginTop: 16,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        display: "flex",
        justifyContent: 'space-between',
    },
    imageWrapper: {},
    proImage: {
        width: 48,
        height: 48,
        borderRadius: 80,
        overflow: 'hidden'
    },
    staticText: {
        color: '#515d7d',
        fontFamily: 'Roboto-Regular',
        fontSize: 22,
        lineHeight: 25,
        letterSpacing: 0.3,
        textAlign: 'center',
        margin: 35
    },
    proBgMain: {
        width: 65,
        height: 65,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    proLetterMain: {
        fontFamily: 'Roboto-Bold',
        color: '#fff',
        fontSize: 24,
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    itemDetail: {
        paddingLeft: 16,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 24
    },
    itemBody: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
    },
    reviewBtnText: {
        color: '#515d7d',
        fontSize: 14,
        fontFamily: 'Roboto-Regular',
        fontWeight: '400',
        lineHeight: 16,
        letterSpacing: 0.7,
        marginTop: 8,
        textAlign: 'center'
    },
    serviceDesc: {
        color: '#25345C',
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        lineHeight: 22.5,
        padding: 24
    },
    filterHead: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        marginBottom: 16,
        marginTop: 32
    },
    filterBody: {},
    filterScroll: {},
    filterBtn: {},
    /*multiList: {
        justifyContent: 'space-between',
        borderBottomWidth: 0,
        marginLeft: 0,
        paddingLeft: 24
    },*/
    multiList: {
        // display: 'flex',
        // flexDirection: 'row',
        // alignItems: 'center',
        justifyContent: 'space-between',
        borderColor: Colors.colors.borderColor,
        backgroundColor: Colors.colors.whiteColor,
        padding: 16,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 8,
        marginLeft: 0,
    },
    multiListText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 15,
        letterSpacing: 0.3,
        color: '#515d7d',
        paddingRight: 10,
        flex: 1
    },
    checkBoxMain: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 15,
        paddingBottom: 15,
        borderWidth: 0.5,
        borderColor: '#F0F0F2',
        borderRadius: 8,
        marginTop: 5,
        marginBottom: 5,
        // width: "100%"
    },
    multiCheck: {
        width: 32,
        height: 32,
        borderWidth: 1,
        borderColor: Colors.colors.borderColor,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
        backgroundColor: Colors.colors.whiteColor
    },
    filterOverlay: {
        height: 'auto',
        alignSelf: 'center',
        position: 'absolute',
        bottom: 0,
        paddingBottom: isIphoneX() ? 34 : 24,
        left: 0,
        right: 0,
        top: 85,
        paddingLeft: 24,
        paddingRight: 24,
        borderRadius: 12
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        ...CommonStyles.styles.stickyShadow
    },
    secondaryBtnWrapper: {
        // marginBottom: 16
    },
    checkBoxText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast
    },
});


