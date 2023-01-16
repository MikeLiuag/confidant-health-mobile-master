import React, {Component} from "react";
import {FlatList, Image, Platform, StatusBar, StyleSheet, TouchableOpacity, View} from "react-native";

import {Body, Button, Container, Content, Header, Left, ListItem, Right, Text, Title} from "native-base";
import {connectConnections} from "../../redux";
import {Screens} from "../../constants/Screens";
import {
  addTestID,
  AlertUtil,
  AlfieLoader,
  Colors,
  CommonStyles,
  DEFAULT_STATES_OPTIONS,
  getAvatar,
  getHeaderHeight,
  isIphoneX,
  PrimaryButton,
  SecondaryButton,
  SingleCheckListItem,
  TextStyles,
} from "ch-mobile-shared";
import {BY_DESIGNATION, BY_RATING, DEFAULT_AVATAR_COLOR} from "../../constants/CommonConstants";
import AppointmentService from "../../services/Appointment.service";
import Modal from "react-native-modalbox";
import {RatingComponent} from "ch-mobile-shared/src/components/RatingComponent";
import {CheckBox} from "react-native-elements";
import {RenderTextChipComponent} from "ch-mobile-shared/src/components/RenderTextChipComponent";
import EntypoIcons from "react-native-vector-icons/Entypo";
import Icon from "react-native-vector-icons/Feather";
import LottieView from "lottie-react-native";
import alfie from "../../assets/animations/Dog_Calendar.json";

const HEADER_SIZE = getHeaderHeight();


class AppointmentSelectProviderScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.selectedFilter = navigation.getParam("selectedFilter", null);
        this.isProviderFlow = navigation.getParam("isProviderFlow", null);
        this.isPatientProhibitive = navigation.getParam("isPatientProhibitive", false);
        this.selectedService = navigation.getParam("selectedService", null);
        this.selectedServiceState = navigation.getParam("memberSelectedStates", null);
        this.selectedServiceProviders = navigation.getParam("selectedServiceProviders", null);
        this.fromOnboardFlow = navigation.getParam("fromOnboardFlow", null);
        if (this.selectedServiceProviders && this.selectedServiceProviders?.length > 0) {
            this.selectedServiceProviders = this.selectedServiceProviders.map(item => {
                if (item.isSelected === null) {
                    item.isSelected = false;
                }
                return item;
            });
        }
        this.state = {
            isLoading: true,
            selectedProvider: null,
            selectedItem: null,
            listItems: [],
            filteredItems: [],
            memberSelectedStates: [],
            showBack: true,
            stepperText: true,
            itemSelected: false,
            designationsList: [],
            selectedFilterType: null,
            specialities: [],
            confirmModal: false,
            modalVisible: false,
            modalHeightProps: {
                height: 0,
            },
        };
    }

    getOperatingStates = (memberSelectedStates) => {
        this.setState({memberSelectedStates});
        return DEFAULT_STATES_OPTIONS.map(state => {
            return {
                title: state,
                checked: memberSelectedStates?.includes(state),
            };
        });
    };
    findAvatarColorCode = connectionId => {
        let connection = this.props.connections.activeConnections.filter(
            connection => connection.connectionId === connectionId,
        );
        if (connection && connection.length < 1) {
            connection = this.props.connections.pastConnections.filter(
                connection => connection.connectionId === connectionId,
            );
        }
        return connection && connection.length > 0 && connection[0].colorCode
            ? connection[0].colorCode
            : DEFAULT_AVATAR_COLOR;
    };

    async componentDidMount(): void {

        let response = await AppointmentService.listProviders();
        if (!this.isProviderFlow && this.selectedServiceProviders?.length >= 0) {
            response = this.selectedServiceProviders;
        }

        response.forEach(provider => {
            if (provider.operatingStates === null)
                provider.operatingStates = [];
        });


        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            if (response && response?.length > 0) {
                response = response.map(item => {
                    if (item.isSelected === null) {
                        item.isSelected = false;
                    }
                    if (!item.profilePicture) {
                        item.colorCode = this.findAvatarColorCode(item.userId);
                    }
                    return item;
                });
            }
            const uniqueDesignations = [
                ...new Set(response.map(obj => obj.designation)),
            ].map(item => {
                return {title: item, checked: false};
            });
            let finalItems = [...new Set(response.flatMap(items => items.specialities))];
            let operatingStates = this.getOperatingStates(this.isProviderFlow === true ? [this.props.profile.patient.state] : this.selectedServiceState);

            this.setState({
                listItems: response,
                filteredItems: response,
                isLoading: false,
                providerFilterLookingFor: uniqueDesignations,
                providerFilterSpeciality: finalItems.map(item => {
                    return {title: item, checked: false};
                }),
                providerFilterStates: operatingStates,

            });
        }
        if (this.selectedFilter) {
            this.toggleFilterItem("providerFilterLookingFor", this.selectedFilter, this.filterByValue);
        }
        if (this.state.memberSelectedStates?.length > 0) {
            this.setState({stateFilterApply: true});
            this.filterByValue();
        }

    }

    navigateToProhibitiveScreen = () => {
        this.props.navigation.navigate(Screens.PATIENT_PROHIBITIVE_SCREEN);
    };
    nextStep = selectedProvider => {
        if (this.isPatientProhibitive) {
            this.navigateToProhibitiveScreen();
        } else {
            if (this.selectedService) {
                this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_DATE_TIME_SCREEN, {
                    ...this.props.navigation.state.params,
                    selectedProvider: selectedProvider,
                });
            } else {
                this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_SERVICE_SCREEN, {
                    selectedProvider: selectedProvider,
                });
            }
        }

    };

    viewProviderProfile = selectedProvider => {
        if (selectedProvider.matchmaker) {
            this.props.navigation.navigate(Screens.MATCH_MAKER_DETAIL_SCREEN, {
                ...this.props.navigation.state.params,
                provider: {
                    userId: selectedProvider.userId,
                    name: selectedProvider.name,
                    avatar: selectedProvider.profilePicture,
                    type: "MATCH_MAKER",
                    profilePicture: selectedProvider.profilePicture,
                },
                patient: this.props.auth.meta,
            });
        } else {
            this.props.navigation.navigate(Screens.PROVIDER_DETAIL_SCREEN, {
                ...this.props.navigation.state.params,
                provider: {
                    userId: selectedProvider.userId,
                    name: selectedProvider.name,
                    avatar: selectedProvider.profilePicture,
                    type: "PRACTITIONER",
                    profilePicture: selectedProvider.profilePicture,
                    colorCode: !selectedProvider.profilePicture
                        ? selectedProvider.colorCode
                        : null,
                },
                patient: this.props.auth.meta,
                isProviderFlow: this.isProviderFlow,
            });
        }
    };

    backClicked = () => {
        if (this.fromOnboardFlow) {
            this.props.navigation.replace(Screens.TAB_VIEW);
        } else {
            if (this.selectedServiceProviders && this.selectedServiceProviders?.length > 0) {
                this.selectedServiceProviders = this.selectedServiceProviders.map(item => {
                    item.isSelected = false;
                    return item;
                });
            }
            this.props.navigation.goBack();
        }
    };

    filterByValue = () => {
        let {listItems, providerFilterSpeciality, providerFilterLookingFor, providerFilterStates} = this.state;
        let selectedValue = listItems;
        const selectedDesignations = providerFilterLookingFor?.filter(provider => provider.checked === true).map(provider => provider.title);
        const selectedSpecialities = providerFilterSpeciality?.filter(speciality => speciality.checked == true).map(speciality => speciality.title);
        const selectedStates = providerFilterStates.filter(state => state.checked == true).map(state => state.title);
        if (selectedDesignations.length > 0) {
            selectedValue = listItems.filter(item => selectedDesignations.includes(item.designation));
        }
        if (selectedSpecialities.length > 0) {
            selectedValue = selectedValue.filter(item => {
                if (item.specialities && item.specialities.length > 0) {
                    const filteredSpecialities = item.specialities?.filter(speciality => selectedSpecialities.includes(speciality));
                    return filteredSpecialities.length > 0;
                }
                return false;
            });
        }
        if (selectedStates.length > 0) {
            let filteredProviders = [];
            listItems.forEach(listItem => {
                if ((listItem.operatingStates.some(selectedState => selectedStates.includes(selectedState)) && listItem.stateLimited) || !listItem.stateLimited) {
                    filteredProviders.push(listItem);
                }
            });
            selectedValue = filteredProviders;
            this.setState({stateFilterApply: true});
        }
        this.setState({
            filteredItems: selectedValue,
        });
    };

    setDefaultFilterState = () => {
        const {listItems} = this.state;
        this.setState({
            itemSelected: "",
            filteredItems: listItems,
        });
    };

    renderPersonalInfo = item => {
        return (
            <View style={styles.personalInfoMainWrapper}>
                <View style={styles.personalInfoWrapper}>
                    <View style={styles.imageWrapper}>
                        {item.profilePicture ? (
                            <View>
                                <Image
                                    style={styles.proImage}
                                    resizeMode="cover"
                                    source={{uri: getAvatar(item)}}/>
                                {/*<View style={{...styles.onlineStatus,backgroundColor: Colors.colors.successIcon}}/>*/}
                            </View>
                        ) : (
                            <View
                                style={{
                                    ...styles.proBgMain,
                                    backgroundColor: item.colorCode,
                                }}>
                                <Text style={styles.proLetterMain}>
                                    {item.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.itemDetail}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemDes} numberOfLines={1}>
                            {item.designation}
                        </Text>
                    </View>
                </View>
                {this.isProviderFlow && (
                    <RenderTextChipComponent renderList={item.specialities}/>
                )}
            </View>
        );
    };

    renderRatingWrapper = item => {
        return (
            <View style={styles.ratingWrapper}>
                <RatingComponent
                    readonly={true}
                    type="custom"
                    showRating={false}
                    ratingCount={5}
                    size={20}
                    ratingImage={require("../../assets/images/starRating.png")}
                    ratingColor={Colors.colors.mainPink}
                    ratingBackgroundColor={Colors.colors.lowContrast}
                    fractions={2}
                    defaultRating={item.combinedRating}
                    startingValue={
                        item.combinedRating
                            ? item.combinedRating
                            : "0"
                    }
                />
                <Text style={styles.reviewScore}>
                    {item.totalReviews} review{item.totalReviews > 1 ? "s" : ""}
                </Text>
            </View>
        );
    };

    renderExtras = (item) => {
        return (
            <View style={styles.extrasWrapper}>
                <Text numberOfLines={3} style={styles.extrasDes}>{item.approach}</Text>
                {/*<View style={styles.extrasSlots}>
                    <View style={styles.extrasSlotsInnerFirst}>
                        <Text style={styles.extrasSlotsWeekText}>This week</Text>
                        <Text style={styles.extrasSlotsSlotsText}>8 time slots</Text>
                    </View>

                    <View>
                        <Text style={styles.extrasSlotsWeekText}>Next week</Text>
                        <Text style={styles.extrasSlotsSlotsText}>8 time slots</Text>
                    </View>
                </View>*/}
            </View>
        );
    };

    hideFilter = filterType => {
        if (filterType === "BY_RATING") {
            this.refs?.filterModal?.close();
        } else if (filterType === "BY_DESIGNATION") {
            this.refs?.designationModal?.close();
        }
    };

    toggleFilterItem = (listKey, title, applyFilterCallback) => {
        let relevantList = this.state[listKey];
        relevantList = relevantList.map((option) => {
            if (option.title === title) {
                option.checked = !option.checked;
            }

            return option;
        });
        const isChecked = relevantList.some((option) => option.checked);
        const updatedState = {};
        updatedState[listKey] = relevantList;
        updatedState.isDisabled = isChecked;
        let callback = () => {
        };
        if (applyFilterCallback) {
            callback = applyFilterCallback;
        }

        this.setState(updatedState, callback);
    };


    updateCheckStatus = (selectedItem) => {
        let {filteredItems} = this.state;
        filteredItems = filteredItems.map((filterItem) => {
            if (filterItem.userId === selectedItem.userId) {
                filterItem.isSelected = !filterItem.isSelected;
            } else {
                filterItem.isSelected = false;
            }
            return filterItem;
        });

        /* if(this.selectedServiceProviders!==null)
         {
           this.selectedServiceProviders = this.selectedServiceProviders.map((filterItem) => {
             if (filterItem.userId === selectedItem.userId) {
               filterItem.isSelected = !filterItem.isSelected;
             } else {
               filterItem.isSelected = false;
             }
             return filterItem;
           });
         }*/
        const selected = filteredItems.find(item => item.isSelected);
        if (!selected) {
            selectedItem = null;
        }

        this.setState({filteredItems, selectedItem});
    };


    onLayout(event) {
        const {height} = event.nativeEvent.layout;
        const newLayout = {
            height: height,
        };
        setTimeout(() => {
            this.setState({modalHeightProps: newLayout});
        }, 10);

    }

    filterDrawerClose = () => {
        this.refs?.modalContact?.close();
        this.setState({
            modalHeightProps: {
                height: 0,
            },
        });
    };
    updateList = (selectedItem) => {
        let {providerFilterStates, memberSelectedStates} = this.state;
        providerFilterStates = providerFilterStates?.map(item => {
            if (item.title === selectedItem.title) {
                item.checked = !item.checked;
            }
            return item;
        });
        if (memberSelectedStates?.includes(selectedItem.title))
            memberSelectedStates = memberSelectedStates?.filter(item => item !== selectedItem.title);
        else
            memberSelectedStates.push(selectedItem.title);
        this.setState({providerFilterStates, memberSelectedStates});
        this.filterByValue();
    };

    removeStateFromFilter = (state) => {
        let {providerFilterStates, memberSelectedStates} = this.state;
        providerFilterStates = providerFilterStates?.map(item => {
            if (item.title === state) {
                item.checked = !item.checked;
            }
            return item;
        });
        memberSelectedStates = memberSelectedStates.filter(item => item !== state);
        let filteredItems = this.state.filteredItems.map(item => {
            item.isSelected = false;
            return item;
        });
        this.setState({providerFilterStates, filteredItems, memberSelectedStates, selectedItem: null});
        this.filterByValue();
    };

    getEmptyMessage = () => {
        let emptyStateHead = "No Provider Available";
        let emptyStateMsg = "Provider not available in your selected state, If you don’t think this is right, Please feel free to contact us.";
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
                <Text style={styles.emptyTextMain}>{emptyStateHead}</Text>
                <Text style={styles.emptyTextDes}>{emptyStateMsg}</Text>
            </View>
        );
    };

    render = () => {
        StatusBar.setBarStyle("dark-content", true);
        if (this.state.isLoading) {
            return <AlfieLoader/>;
        }
        const {
            providerFilterStates, stateFilterApply, providerFilterLookingFor,
            providerFilterSpeciality, filteredItems, memberSelectedStates, selectedItem,
        } = this.state;

        let filterApplied = providerFilterStates?.some(state => state.checked) ||
            providerFilterLookingFor?.some(state => state.checked) ||
            providerFilterSpeciality?.some(state => state.checked);


        const data = filteredItems?.length > 0 ? filteredItems : filterApplied ? [] : this.selectedServiceProviders;

        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>

                <Header noShadow={false} transparent style={styles.header}>
                    <StatusBar
                        backgroundColor={Platform.OS === "ios" ? null : "transparent"}
                        translucent
                        barStyle={"dark-content"}
                    />
                    <Left style={{flex: 1}}>
                        <Button
                            {...addTestID("back")}
                            onPress={this.backClicked}
                            transparent
                            style={styles.backButton}>
                            <EntypoIcons size={30} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                        </Button>
                    </Left>
                    <Body style={styles.headerRow}>
                        <Title
                            {...addTestID("select-provider-header")}
                            style={styles.headerText}>
                            {this.isProviderFlow ? "Meet our providers" : "Select a provider"}
                        </Title>
                    </Body>
                    <Right style={{flex: 1}}>
                        <Button transparent
                                style={{alignItems: "flex-end", paddingRight: 5, marginRight: 0}}
                                onPress={() => {
                                    this.refs?.modalContact?.open();
                                }}
                        >
                            <Image style={styles.filterIcon}
                                   source={filterApplied ? require("../../assets/images/filtered.png") : require("../../assets/images/filter.png")}/>
                        </Button>
                    </Right>
                </Header>
                <Content
                    scrollIndicatorInsets={{right: 1}}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{padding: 24}}>
                    <View style={styles.list}>
                        {stateFilterApply && (
                            <TouchableOpacity>
                                <View style={styles.filterWrapper}>
                                    {memberSelectedStates?.filter(Boolean).map((state) => {
                                        return (
                                            <TouchableOpacity onPress={() => this.removeStateFromFilter(state)}
                                                              style={styles.filterChipsWrapper}>
                                                <Text style={styles.filterChipsText}>{state}</Text>
                                                <View style={styles.filterChipsIcon}>
                                                    <Icon
                                                        raised
                                                        name="minus"
                                                        type="feather"
                                                        style={styles.filterCloseIcon}
                                                        color={Colors.colors.secondaryIcon}
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </TouchableOpacity>
                        )}
                        {data.length === 0 && (
                            this.getEmptyMessage()
                        )}
                        <FlatList
                            scrollIndicatorInsets={{right: 1}}
                            showsVerticalScrollIndicator={false}
                            data={data}
                            renderItem={({item, index}) => (

                                <TouchableOpacity
                                    {...addTestID("Select-service-" + (index + 1))}
                                    activeOpacity={0.8}
                                    style={
                                        item.isSelected
                                            ? [
                                                styles.serviceCard,
                                                {
                                                    borderWidth: 2,
                                                    borderColor: Colors.colors.mainPink80,
                                                },
                                            ]
                                            : styles.serviceCard
                                    }
                                    onPress={() => {
                                        if (!item.isSelected) {
                                            this.updateCheckStatus(item);
                                        }
                                    }}

                                >
                                    {this.renderPersonalInfo(item)}
                                    {this.renderExtras(item)}
                                    {this.renderRatingWrapper(item)}

                                </TouchableOpacity>
                            )}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </View>

                </Content>

                {selectedItem != null && (
                    <View
                        {...addTestID("view")}
                        style={styles.greBtn}>

                        <View style={styles.secondaryBtnWrapper}>
                            <SecondaryButton
                                testId="open-profile"
                                iconLeft="info"
                                type={"Feather"}
                                color={Colors.colors.mainBlue}
                                onPress={() => {
                                    this.viewProviderProfile(selectedItem);
                                }}
                                text="Open profile"
                                borderColor={Colors.colors.white}
                                size={24}
                            />
                        </View>
                        <PrimaryButton
                            testId="select-provider"
                            iconName="user"
                            type={"Feather"}
                            color={Colors.colors.whiteColor}
                            onPress={() => {
                                this.nextStep(selectedItem);
                            }}
                            text="Select provider"
                            size={24}
                        />

                    </View>
                )}


                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.filterDrawerClose}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        maxHeight: "80%",
                        // bottom: this.state.modalHeightProps.height
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalContact"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID("swipeBar")}
                    />
                    <Content
                        showsVerticalScrollIndicator={false}>
                        <View>
                            <View style={{
                                marginVertical: 16,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}>
                                <Text style={styles.mainHeading}>Filter Results</Text>
                                <Text style={styles.countText}>{this.state.filteredItems?.length} total</Text>
                            </View>
                            <View style={styles.checkBoxSectionMain}>
                                <Text style={styles.checkBoxSectionText}>Who are you looking for?</Text>
                                {this.state.providerFilterLookingFor?.map((designation, index) => (
                                    <ListItem
                                        key={index}
                                        onPress={() => this.toggleFilterItem("providerFilterLookingFor", designation.title, this.filterByValue)}
                                        style={
                                            designation.checked
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
                                                designation.checked
                                                    ? [
                                                        styles.checkBoxText,
                                                        {
                                                            color: Colors.colors.primaryText,
                                                        },
                                                    ]
                                                    : styles.checkBoxText
                                            }>
                                            {designation.title}
                                        </Text>
                                        <CheckBox
                                            containerStyle={
                                                designation.checked ?
                                                    [
                                                        styles.multiCheck,
                                                        {
                                                            borderColor: Colors.colors.primaryIcon,
                                                        },
                                                    ]
                                                    : styles.multiCheck
                                            }
                                            center
                                            iconType="material"
                                            checkedIcon="check"
                                            uncheckedIcon=""
                                            checkedColor={Colors.colors.primaryIcon}
                                            checked={designation.checked}
                                            onPress={() => this.toggleFilterItem("providerFilterLookingFor", designation.title, this.filterByValue)}
                                        />
                                    </ListItem>
                                ))}
                                <Text style={styles.checkBoxSectionText}>What speciality are you looking for?</Text>
                                {this.state.providerFilterSpeciality && this.state.providerFilterSpeciality.length > 0 && (
                                    <FlatList
                                        data={this.state.providerFilterSpeciality}
                                        renderItem={({item, index}) =>
                                            <ListItem
                                                key={index}
                                                onPress={() => this.toggleFilterItem("providerFilterSpeciality", item.title, this.filterByValue)}
                                                style={
                                                    item.checked
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
                                                        item.selected
                                                            ? [
                                                                styles.checkBoxText,
                                                                {
                                                                    color: Colors.colors.primaryText,
                                                                },
                                                            ]
                                                            : styles.checkBoxText
                                                    }>
                                                    {item.title}
                                                </Text>
                                                <CheckBox
                                                    containerStyle={
                                                        item.checked ?
                                                            [styles.multiCheck, {
                                                                borderColor: Colors.colors.primaryIcon,
                                                            }] :
                                                            styles.multiCheck
                                                    }
                                                    center
                                                    iconType="material"
                                                    checkedIcon="check"
                                                    uncheckedIcon=""
                                                    checkedColor={Colors.colors.primaryIcon}
                                                    checked={item.checked}
                                                    onPress={() => this.toggleFilterItem("providerFilterSpeciality", item.title, this.filterByValue)}
                                                />

                                            </ListItem>
                                        }
                                        keyExtractor={item => item.id}
                                    />
                                )}
                                <Text style={styles.checkBoxSectionText}>Provider in States ? </Text>
                                {providerFilterStates?.length > 0 && (
                                    <FlatList
                                        showsVerticalScrollIndicator={false}
                                        data={providerFilterStates}
                                        renderItem={({item, index}) =>
                                            <SingleCheckListItem
                                                listTestId={"list - " + index + 1}
                                                checkTestId={"checkbox - " + index + 1}
                                                keyId={index}
                                                listPress={() => {
                                                    this.updateList(item);
                                                }}
                                                itemSelected={item.checked}
                                                itemTitle={item.title}
                                                checkID={"checkbox - " + index + 1}
                                            />
                                        }
                                        keyExtractor={item => item}
                                    />
                                )}
                            </View>

                        </View>
                    </Content>
                </Modal>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingLeft: 0,
        paddingRight: 0,
        height: HEADER_SIZE,
        ...CommonStyles.styles.headerShadow,
    },
    apptHeading: {
        marginTop: 30,
        color: "#25345c",
        fontFamily: "Roboto-Regular",
        fontSize: 24,
        textAlign: "center",
        lineHeight: 24,
        letterSpacing: 1,
        marginBottom: 16,
    },
    list: {},
    personalInfoMainWrapper:
        {
            flexDirection: "column",
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 24,
        },
    personalInfoWrapper: {
        flexDirection: "row",
        alignItems: "center",
    },
    imageWrapper: {},
    proImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: "hidden",
    },
    proBgMain: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    proLetterMain: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.whiteColor,
    },
    itemDetail: {
        flex: 1,
        paddingLeft: 16,
    },
    itemName: {
        color: "#22242A",
        fontFamily: "Roboto-Bold",
        fontWeight: "500",
        fontSize: 15,
        lineHeight: 16,
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    itemDes: {
        color: "#515D7D",
        fontFamily: "Roboto-Regular",
        fontSize: 14,
        lineHeight: 16,
        letterSpacing: 0.3,
    },
    checkWrapper: {},
    nextBtnwrap: {
        backgroundColor: "rgba(63, 178, 254, 0.07)",
        borderRadius: 4,
        width: 55,
        height: 55,
        justifyContent: "center",
        alignItems: "center",
    },
    backButton: {
        marginLeft: 18,
        width: 40,
    },
    headerContent: {
        flexDirection: "row",
    },
    headerRow: {
        flex: 3,
        alignItems: "center",
    },
    headerText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        textAlign: "center",
    },
    extrasWrapper: {
        backgroundColor: Colors.colors.whiteColor,
        paddingBottom: 24,
        paddingRight: 24,
        paddingLeft: 24,
        paddingTop: 16,
    },
    extrasHeading: {
        color: "#22242A",
        fontFamily: "Roboto-Bold",
        fontWeight: "500",
        fontSize: 15,
        lineHeight: 16,
        letterSpacing: 0.3,
        marginBottom: 8,
    },
    specialitiesBox: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
        marginBottom: 16,
    },
    singleSpeciality: {
        backgroundColor: "rgba(63, 178, 254, 0.07)",
        paddingTop: 8,
        paddingBottom: 8,
        paddingRight: 16,
        paddingLeft: 16,
        marginRight: 8,
        borderRadius: 16,
        overflow: "hidden",
        color: "#25345C",
        fontFamily: "Roboto-Regular",
        fontWeight: "400",
        fontSize: 14,
        letterSpacing: 0.28,
    },
    reviewBtnText: {
        color: "#515d7d",
        fontSize: 14,
        fontFamily: "Roboto-Regular",
        fontWeight: "400",
        lineHeight: 16,
        letterSpacing: 0.7,
    },
    modal: {
        alignItems: "center",
        borderColor: "#f5f5f5",
        borderTopWidth: 0.5,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: 620,
    },
    filterHead: {
        width: "100%",
        alignItems: "center",
        borderBottomColor: "#F5F5F5",
        borderBottomWidth: 1,
        paddingTop: 24,
        paddingBottom: 24,
    },
    filterText: {
        fontFamily: "Roboto-Regular",
        color: "#25345C",
        fontSize: 17,
        lineHeight: 18,
        letterSpacing: 0.8,
        textAlign: "center",
    },
    filterBody: {},
    filterScroll: {
        maxHeight: 450,
        paddingBottom: isIphoneX() ? 34 : 24,
        // paddingVertical: 16
    },
    filterBtn: {
        padding: 24,
        paddingTop: 0,
        paddingBottom: isIphoneX() ? 34 : 24,
    },
    swipeBar: {
        backgroundColor: "#f5f5f5",
        width: 80,
        height: 4,
        borderRadius: 2,
        top: -35,
    },
    arrowBtn: {
        paddingTop: 0,
        paddingBottom: 0,
        height: 20,
        marginBottom: 24,
        justifyContent: "center",
        width: 80,
    },
    checkBoxMain: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 8,
        marginLeft: 0,
    },
    multiList: {
        // display: 'flex',
        // flexDirection: 'row',
        // alignItems: 'center',
        justifyContent: "space-between",
        borderColor: Colors.colors.borderColor,
        backgroundColor: Colors.colors.whiteColor,
        padding: 16,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 8,
        marginLeft: 0,
    },
    checkBoxText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
        width: "90%",
    },

    filterIcon: {
        height: 24,
        width: 24,
        marginRight: 12,
        paddingLeft: 0,
        paddingRight: 0,
    },
    checkBoxSectionMain: {
        //paddingTop: 40
    },
    checkBoxSectionText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        marginBottom: 16,
        marginTop: 16,
    },
    multiCheck: {
        width: 32,
        height: 32,
        borderWidth: 1,
        borderColor: Colors.colors.borderColor,
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
        backgroundColor: Colors.colors.whiteColor,
    },
    mainHeading: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
    },
    countText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.lowContrast,
    },
    serviceCard: {
        borderWidth: 2,
        borderColor: "#f5f5f5",
        borderRadius: 12,
        marginBottom: 16,
        backgroundColor: Colors.colors.whiteColor,
        flexDirection: "column",
    },
    extrasSlots: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        marginTop: 24,
        marginBottom: 24,
    },
    extrasSlotsInnerFirst: {
        marginRight: 16,
    },

    extrasSlotsWeekText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.highContrast,

    },
    extrasSlotsSlotsText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.lowContrast,
    },
    extrasDes: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
    },
    ratingWrapper: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.colors.borderColorLight,
        padding: 24,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    reviewScore: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.lowContrast,
    },
    totalReviews: {
        marginLeft: 8,
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.highContrast,
    },
    noProText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        ...CommonStyles.styles.stickyShadow,
    },
    secondaryBtnWrapper: {
        // marginBottom: 16
    },
    onlineStatus: {
        position: "absolute",
        top: 35,
        right: 4,
        height: 10,
        width: 10,
        borderWidth: 2,
        borderColor: Colors.colors.whiteColor,
        borderRadius: 6,
    },
    successTopWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderColor: Colors.colors.successIcon,
        backgroundColor: Colors.colors.successBG,
        marginLeft: 16,
        marginRight: 16,
        borderRadius: 8,
        padding: 16,
        left: 0,
        right: 0,
        top: 48,
        position: "absolute",
    },
    successBoxCheck: {
        padding: 8,
        borderRadius: 4,
        backgroundColor: Colors.colors.successIcon,
    },
    filterWrapper: {
        marginBottom: 16,
        flexWrap: "wrap",
        display: "flex",
        justifyContent: "flex-start",
        flexDirection: "row",


    },
    filterChipsWrapper: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "flex-start",
        height: 38,
        borderRadius: 40,
        paddingLeft: 16,
        paddingRight: 8,
        marginBottom: 8,
        marginRight: 8,
        backgroundColor: Colors.colors.secondaryColorBG,
    },
    filterChipsText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.secondaryText,
        marginRight: 8,
    },
    filterChipsIcon: {
        width: 20,
        height: 20,
        borderRadius: 40,
        backgroundColor: Colors.colors.whiteColor,
        ...CommonStyles.styles.stickyShadow,
    },
    filterCloseIcon: {
        position: "absolute",
        left: 4,
        top: 4,
    },
    emptyView: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 20,
        paddingBottom: 20,
    },
    emptyAnim: {
        width: "90%",
        // alignSelf: 'center',
        marginBottom: 30,
    },
    emptyTextMain: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        alignSelf: "center",
        marginBottom: 8,
    },
    emptyTextDes: {
        alignSelf: "center",
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.mediumContrast,
        paddingLeft: 16,
        paddingRight: 16,
        textAlign: "center",
        marginBottom: 32,
    },
});
export default connectConnections()(AppointmentSelectProviderScreen);
