import React, {Component} from "react";
import {FlatList, Image, Platform, StatusBar, StyleSheet, TouchableOpacity, View} from "react-native";
import {connectConnections} from "../../redux";
import {Screens} from "../../constants/Screens";
import {
  AlertUtil,
  Colors,
  CommonStyles,
  DEFAULT_STATES_OPTIONS,
  getAvatar,
  getHeaderHeight,
  PrimaryButton,
  SecondaryButton,
  SingleCheckListItem,
  TextStyles,
} from "ch-mobile-shared";
import AppointmentService from "../../services/Appointment.service";
import Loader from "ch-mobile-shared/src/components/Loader";
import {Body, Button, Container, Content, Header, Left, ListItem, Right, Text, Title,} from "native-base";
import {addTestID, isIphoneX} from "ch-mobile-shared/src/utilities";
import GradientButton from "ch-mobile-shared/src/components/GradientButton";
import {CheckBox, Rating} from "react-native-elements";
import {
  FILTER_SERVICE_BY_COST,
  FILTER_SERVICE_BY_DURATION,
  FILTER_SERVICE_BY_RATING,
  PROVIDER_FILTERS_LOOKINGFOR_OPTIONS,
} from "../../constants/CommonConstants";
import Modal from "react-native-modalbox";
import {BackButton} from "ch-mobile-shared/src/components/BackButton";
import {GroupAvatarsComponent} from "ch-mobile-shared/src/components/GroupAvatarsComponent";
import Icon from "react-native-vector-icons/Feather";
import LottieView from "lottie-react-native";
import alfie from "../../assets/animations/Dog_Calendar.json";


const HEADER_SIZE = getHeaderHeight();

class ApptSelectServiceByTypeScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.serviceType = navigation.getParam("serviceType", null);
        this.isPatientProhibitive = navigation.getParam("isPatientProhibitive", false);
        this.state = {
            isLoading: true,
            servicesList: [],
            itemSelected: false,
            memberSelectedStates: [],
            selectedItem: null,
            selectedFilterType: null,
            filteredItems: [],
            durationsList: FILTER_SERVICE_BY_DURATION,
            costsList: FILTER_SERVICE_BY_COST,
            ratingList: FILTER_SERVICE_BY_RATING,
            providers: PROVIDER_FILTERS_LOOKINGFOR_OPTIONS,
        };

    }


    getDurationText = (duration) => {
        const minText = " min";
        const hourText = " hour";
        if (duration < 60) {
            return duration + minText;
        }
        const hour = parseInt(duration / 60);
        const min = duration % 60;
        let text = hour + hourText;
        if (min > 0) {
            text = text + " " + min + minText;
        }
        return text;
    };

    getServicesByType = async () => {
        let servicesList = await AppointmentService.getServicesByType(this.serviceType);
        if (servicesList.errors) {
            AlertUtil.showErrorMessage(servicesList.errors[0].endUserMessage);
            this.setState({isLoading: false});
        } else {
            servicesList = servicesList.map(service => {
                service.service.durationText = this.getDurationText(service.service.duration);
                service.isSelected = false;
                return service;
            });
            const providersList = servicesList.flatMap(obj => obj.providers);
            const uniqueProviders = [...new Set(providersList.map(provider => provider.designation))];
            /*this.setState({
                providersList: uniqueProviders.map(item => {
                    return {title: item, checked: false}
                })
            });*/
            let operatingStates = this.getOperatingStates([this.props.profile.patient.state]);
            this.setState({
                memberSelectedStates: [this.props.profile.patient.state],
                providersList: uniqueProviders.map(item => {
                    return {title: item, checked: false};
                }),
                servicesList: servicesList,
                filteredItems: servicesList,
                servicesFilterStates: operatingStates, isLoading: false,
            }, () => {
                if (this.state.memberSelectedStates.length > 0) {
                    this.setState({stateFilterApply: true});
                    this.applyFilter();
                }
            });
        }

    };
    getOperatingStates = (memberSelectedStates) => {
        //this.setState({memberSelectedStates})
        let operatingStates = DEFAULT_STATES_OPTIONS.map(state => {
            return {
                title: state,
                checked: memberSelectedStates.includes(state),
            };
        });
        return operatingStates;
    };
    updateList = (selectedItem) => {
        let servicesFilterStates = this.state.servicesFilterStates.map(item => {
            if (item.title === selectedItem.title) {
                item.checked = !item.checked;
            }
            return item;
        });
        let memberSelectedStates = this.state.memberSelectedStates;
        const stateFound = memberSelectedStates.some(item => item === selectedItem.title);
        if (stateFound) {
            memberSelectedStates = memberSelectedStates.filter(item => item !== selectedItem.title);
        } else {
            memberSelectedStates.push(selectedItem.title);
        }
        let filteredItems = this.state.filteredItems.map(item => {
            item.isSelected = false;
            return item;
        });
        this.setState({servicesFilterStates, memberSelectedStates, filteredItems});
        this.applyFilter();
    };
    removeStateFromFilter = (state) => {

        let servicesFilterStates = this.state.servicesFilterStates.map(item => {
            if (item.title === state) {
                item.checked = !item.checked;
            }
            return item;
        });
        let filteredItems = this.state.filteredItems.map(item => {
            item.isSelected = false;
            return item;
        });
        const memberSelectedStates = this.state.memberSelectedStates.filter(item => item !== state);
        this.setState({servicesFilterStates, memberSelectedStates, filteredItems, selectedItem: null});
        this.applyFilter();
    };
    clearFilters = () => {
        let costsList = this.state.costsList.map(item => {
            item.checked = false;
            return item;
        });
        let durationsList = this.state.durationsList.map(item => {
            item.checked = false;
            return item;
        });
        this.setState({costsList, durationsList, stateFilterApply: false});
    };

    componentDidMount = async () => {
        this.clearFilters();
        await this.getServicesByType();
    };

    renderProvider = (serviceDetail) => {

        if (!serviceDetail) {
            return null;
        }
        return serviceDetail && serviceDetail.providers && serviceDetail.providers.length > 0 && serviceDetail.providers.map((item, index) => {

            return (
                <View>
                    <View style={styles.personalInfoWrapper}>
                        <View style={styles.imageWrapper}>

                            {item.profilePicture ?
                                <Image
                                    style={styles.proImage}
                                    resizeMode="cover"
                                    source={{uri: getAvatar(item)}}/>
                                :
                                <View style={{
                                    ...styles.proBgMain,
                                    backgroundColor: item.colorCode,
                                }}><Text
                                    style={styles.proLetterMain}>{item.name.charAt(0).toUpperCase()}</Text></View>
                            }
                        </View>
                        <View style={styles.itemDetail}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemDes} numberOfLines={1}>
                                {item.designation}
                            </Text>

                        </View>
                    </View>
                    <View style={styles.personalInfoRating}>
                        <View style={{flexDirection: "row"}}>
                            <Rating
                                readonly
                                type="star"
                                showRating={false}
                                ratingCount={5}
                                imageSize={19}
                                selectedColor="#ffca00"
                                startingValue={item.combinedRating}
                                fractions={2}
                            />
                        </View>

                        <Text style={styles.reviewBtnText}>
                            {item.totalReviews} review{item.totalReviews > 1 ? "s" : ""}
                        </Text>

                    </View>
                    <GradientButton
                        testId="book-next"
                        text="Book Appointment"
                        onPress={() => {
                            this.nextStep({provider: item, service: serviceDetail.service});
                        }}
                    />
                </View>
            );
        });
    };

    nextStep = (selectedService) => {
        this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_DATE_TIME_SCREEN, {
            selectedProvider: selectedService.provider,
            selectedService: selectedService.service,
        });
    };

    backClicked = () => {
        this.props.navigation.goBack();
    };

    toggleFilterItem = (listKey, title) => {
        let relevantList = this.state[listKey];
        relevantList = relevantList.map((option) => {
            if (option.title === title) {
                option.checked = !option.checked;
            } else {
                option.checked = false;
            }

            return option;
        });
        const isChecked = relevantList.some((option) => option.checked);
        const updatedState = {};
        updatedState[listKey] = relevantList;
        updatedState.isDisabled = isChecked;

        this.setState(updatedState, this.applyFilter);
    };

    applyFilter = () => {

        const selectedProviders = this.state.providersList.filter(provider => provider.checked === true).map(provider => provider.title);
        const selectedCosts = this.state.costsList.filter(cost => cost.checked === true).map(cost => cost.value);
        const selectedDurations = this.state.durationsList.filter(duration => duration.checked === true).map(duration => duration.value);
        const selectedRatings = this.state.ratingList.filter(rating => rating.checked === true).map(rating => rating.value);
        const selectedStates = this.state.servicesFilterStates.filter(state => state.checked == true).map(state => state.title);

        let listItems = this.state.servicesList;
        let selectedValue = listItems;
        if (selectedProviders.length > 0) {
            selectedValue = selectedValue.filter(service => {
                const {providers} = service;
                const filteredProviders = providers.filter(provider => selectedProviders.includes(provider.designation));
                return filteredProviders.length > 0;
            }).map(service => {
                service.providers = service.providers.filter(provider => selectedProviders.includes(provider.designation));
                return service;
            });
        }
        if (selectedCosts.length > 0) {
            selectedValue = selectedValue.filter(item => item.service.cost <= Math.max(...selectedCosts));
        }
        if (selectedDurations.length > 0) {
            selectedValue = selectedValue.filter(item => item.service.duration <= Math.max(...selectedDurations));
        }
        if (selectedRatings.length > 0) {
            selectedValue = selectedValue.filter(service => {
                const {providers} = service;
                const filteredProviders = providers.filter(provider => provider.combinedRating <= Math.max(...selectedRatings));
                return filteredProviders.length > 0;
            }).map(service => {
                service.providers = service.providers.filter(provider => provider.combinedRating <= Math.max(...selectedRatings));
                return service;
            });
        }

        /*if(selectedStates.length>0)
        {
          let filteredServices=[]
          selectedValue.forEach((service, index) => {
            if(this.checkProviderOrServiceValid(service?.service?.operatingStates,selectedStates) || !service.service.stateLimited)
            {
              let filterProviders=[]
              service.providers.forEach((provider, index) =>{
                if(this.checkProviderOrServiceValid (provider?.operatingStates,selectedStates) || !provider.stateLimited)
                {
                  if(!this.isProviderAdded(filterProviders,provider))
                  {
                    filterProviders.push(provider)
                  }
                }
              })
              service.providers=filterProviders
              if(service.providers?.length>0)
              {
                filteredServices.push(service)
              }
          }});
          selectedValue=filteredServices
        }*/
        this.setState({
            filteredItems: selectedValue, stateFilterApply: true,
        });

    };

    checkProviderOrServiceValid = (providerServiceOperatingStates, selectedStates) => {
        let isValid = false;
        providerServiceOperatingStates?.forEach(providerServiceOperatingState => {
            if (selectedStates?.indexOf(providerServiceOperatingState) > -1) {
                isValid = true;
            }
        });
        return isValid;
    };
    isProviderAdded = (filterProviders, provider) => {
        filterProviders?.forEach(filterProvider => {
            if (filterProvider.userId === provider.userId) {
                return true;
            }
        });
        return false;
    };


    updateCheckStatus = (selectedItem) => {
        let {filteredItems} = this.state;
        filteredItems = filteredItems.map((filterItem) => {
            if (filterItem.service.id === selectedItem.service.id) {
                filterItem.isSelected = !filterItem.isSelected;
            } else {
                filterItem.isSelected = false;
            }
            return filterItem;
        });

        this.setState({filteredItems, selectedItem});
    };

    renderService = (item) => {

        const selectedStates = this.state.servicesFilterStates?.filter(state => state.checked == true).map(state => state.title);
        let haveOneProvider = item.providers?.filter(provider => (this.checkProviderOrServiceValid(provider?.operatingStates, selectedStates) || !provider.stateLimited))?.length > 0;
        if (haveOneProvider) {
            if (this.checkProviderOrServiceValid(item?.service?.operatingStates, selectedStates) || !item.service.stateUsageInAppointment) {
                return (
                    <TouchableOpacity
                        style={styles.serviceMainWrapper}
                        onPress={() => {
                            if (!item.isSelected) {
                                this.updateCheckStatus(item);
                            }
                        }}>
                        <View style={styles.itemHeader}>
                            <View style={{flex: 1}}>
                                <Text style={styles.itemTitle}>{item.service.name}</Text>
                                <View style={{display: "flex", flexDirection: "row", marginBottom: 16, marginTop: 8}}>
                                    <Text style={styles.itemDurationCost}
                                          numberOfLines={2}>{item.service.durationText} session</Text>
                                    <View style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                        <View style={styles.bulletIcon}/>
                                        <Text style={styles.itemDurationCost}>User typically pay
                                            ${item.service.cost}</Text>
                                    </View>
                                </View>
                                <Text numberOfLines={3} style={styles.itemDescription}>
                                    {item.service.description || "N/A"}
                                </Text>
                                {item.providers && item.providers?.length > 0 && (
                                    <View style={styles.providersMainWrapper}>
                                        <GroupAvatarsComponent
                                            avatars={item.providers.filter(provider => (this.checkProviderOrServiceValid(provider?.operatingStates, selectedStates) || !provider.stateLimited))}
                                        />
                                        <Text
                                            style={styles.itemProviderCount}>{item.providers?.length} {item.providers?.length <= 1 ? "provider" : "providers"} </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            }
        }
    };

    navigateLearnMoreScreen = (selectedItem) => {
        this.props.navigation.navigate(Screens.APPT_SELECT_SERVICE_DETAIL_SCREEN, {
            selectedItem: selectedItem,
        });
    };
    navigateToProhibitiveScreen = () => {
        this.props.navigation.navigate(Screens.PATIENT_PROHIBITIVE_SCREEN);
    };
    navigateToScheduleScreen = (selectedItem) => {
        if (this.isPatientProhibitive) {
            this.navigateToProhibitiveScreen();
        } else {
            this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_PROVIDER_SCREEN, {
                selectedService: selectedItem.service,
                selectedServiceProviders: selectedItem.providers,
                isProviderFlow: false,
                memberSelectedStates: this.state.memberSelectedStates,
            });
        }

    };
    getEmptyMessage = () => {
        let emptyStateHead = "No Service Available";
        let emptyStateMsg = "Services not available in your selected state, If you don’t think this is right, Please feel free to contact us.";
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

    render() {

        const {filteredItems, memberSelectedStates, stateFilterApply} = this.state;
        let filteredItemsTemp = [];
        const selectedStates = this.state.servicesFilterStates?.filter(state => state.checked == true).map(state => state.title);
        if (filteredItems?.length > 0) {
            filteredItems.filter(item => {
                let haveOneProvider = item.providers?.filter(provider => (this.checkProviderOrServiceValid(provider?.operatingStates, selectedStates) || !provider.stateLimited))?.length > 0;
                if (haveOneProvider) {
                    if (this.checkProviderOrServiceValid(item?.service?.operatingStates, selectedStates) || !item.service.stateUsageInAppointment) {
                        filteredItemsTemp.push(item);
                    }
                }
            });
        }
        StatusBar.setBarStyle("dark-content", true);
        if (this.state.isLoading) {
            return (<Loader/>);
        }
        let filterApplied = this.state.durationsList?.some((duration) => duration.checked)
            || this.state.costsList?.some((cost) => cost.checked)
            || this.state.providersList?.some((provider) => provider.checked)
            || this.state.ratingList?.some((rating) => rating.checked)
            || this.state.servicesFilterStates?.some(state => state.checked);

        return (
            <Container>
                <Header noShadow={false} transparent style={styles.header}>
                    <StatusBar
                        backgroundColor={Platform.OS === "ios" ? null : "transparent"}
                        translucent
                        barStyle={"dark-content"}
                    />
                    <Left style={{flex: 1}}>
                        <View style={styles.backButton}>
                            <BackButton
                                {...addTestID("back")}
                                onPress={this.backClicked}
                            />
                        </View>
                    </Left>
                    <Body style={styles.headerRow}>
                        <Title
                            {...addTestID("select-service-by-type-header")}
                            style={styles.headerText}>{this.serviceType}</Title>
                    </Body>
                    <Right style={{flex: 1}}>
                        <Button transparent
                                style={{alignItems: "flex-end", paddingRight: 7, marginRight: 8}}
                                onPress={() => {
                                    this.refs.modalContact.open();
                                }}
                        >
                            <Image style={styles.filterIcon}
                                   source={filterApplied ? require("../../assets/images/filtered.png") : require("../../assets/images/filter.png")}/>
                        </Button>
                    </Right>
                </Header>
                <Content
                    showsVerticalScrollIndicator={false}
                    {...addTestID("select-service-by-type-content")}>


                    <View style={styles.list}>
                        <TouchableOpacity>
                            {stateFilterApply && (
                                <View style={styles.filterWrapper}>
                                    {memberSelectedStates?.filter(Boolean)?.map((state) => {
                                        return (
                                            <View style={styles.filterChipsWrapper}>
                                                <Text style={styles.filterChipsText}>{state}</Text>
                                                <View style={styles.filterChipsIcon}>
                                                    <Icon
                                                        raised
                                                        name="minus"
                                                        type="feather"
                                                        style={styles.filterCloseIcon}
                                                        color={Colors.colors.secondaryIcon}
                                                        onPress={() => this.removeStateFromFilter(state)}/>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                        </TouchableOpacity>
                        {filteredItemsTemp?.length > 0 ? (
                            <FlatList
                                scrollIndicatorInsets={{right: 1}}
                                showsVerticalScrollIndicator={false}
                                {...addTestID("Service-List")}
                                data={filteredItems}
                                renderItem={({item, index}) => {
                                    const selectedStates = this.state.servicesFilterStates?.filter(state => state.checked == true).map(state => state.title);
                                    let haveOneProvider = item.providers?.filter(provider => (this.checkProviderOrServiceValid(provider?.operatingStates, selectedStates) || !provider.stateLimited))?.length > 0;
                                    if (haveOneProvider) {
                                        if (this.checkProviderOrServiceValid(item?.service?.operatingStates, selectedStates) || !item.service.stateUsageInAppointment) {
                                            return (
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
                                            )
                                        }
                                    }
                                }}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        ) : this.getEmptyMessage()}

                    </View>
                </Content>
                {this.state.selectedItem != null && (
                    <View
                        {...addTestID("view")}
                        style={styles.greBtn}>

                        <View style={styles.secondaryBtnWrapper}>
                            <SecondaryButton
                                testId="learn-more"
                                iconLeft="info"
                                type={"Feather"}
                                color={Colors.colors.mainBlue}
                                onPress={() => {
                                    this.navigateLearnMoreScreen(this.state.selectedItem);
                                }}
                                text="Learn more"
                                size={24}
                            />
                        </View>
                        <PrimaryButton
                            testId="schedule"
                            iconName="calendar"
                            type={"Feather"}
                            color={Colors.colors.whiteColor}
                            onPress={() => {
                                this.navigateToScheduleScreen(this.state.selectedItem);
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
                    // onClosed={this.hideFilter}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        maxHeight: "80%",
                    }}
                    entry={"bottom"}
                    position={"bottom"}
                    ref={"modalContact"}
                    swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID("swipeBar")}
                    />
                    <Content showsVerticalScrollIndicator={false}>
                        <View style={styles.filterBody}>
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginTop: 15,
                            }}>
                                <Text style={styles.mainHeading}>Filter Results</Text>
                                <Text style={styles.countText}>{this.state.filteredItems?.length} total</Text>
                            </View>
                            <View>
                                <Text style={styles.filterHead}>
                                    Duration
                                </Text>
                                {this.state.durationsList.length && this.state.durationsList.map((duration, index) => (
                                    <ListItem
                                        key={index}
                                        onPress={() => this.toggleFilterItem("durationsList", duration.title)}
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
                                                        },
                                                    ]
                                                    : styles.multiCheck
                                            }
                                            center
                                            iconType="material"
                                            checkedIcon="check"
                                            uncheckedIcon=""
                                            checkedColor={Colors.colors.primaryIcon}
                                            checked={duration.checked}
                                            onPress={() => this.toggleFilterItem("durationsList", duration.title)}
                                        />


                                    </ListItem>
                                ))}
                                <Text style={styles.filterHead}>
                                    Cost
                                </Text>
                                {this.state.costsList.map((cost, index) => (
                                    <ListItem
                                        key={index}
                                        onPress={() => this.toggleFilterItem("costsList", cost.title)}
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
                                                        },
                                                    ]
                                                    : styles.multiCheck
                                            }
                                            center
                                            iconType="material"
                                            checkedIcon="check"
                                            uncheckedIcon=""
                                            checkedColor={Colors.colors.primaryIcon}
                                            checked={cost.checked}
                                            onPress={() => this.toggleFilterItem("costsList", cost.title)}
                                        />

                                    </ListItem>
                                ))}
                                <Text style={styles.filterHead}>Rating</Text>
                                {this.state.ratingList.length && this.state.ratingList.map((rating, index) => (
                                    <ListItem
                                        key={index}
                                        onPress={() => this.toggleFilterItem("ratingList", rating.title)}
                                        style={
                                            rating.checked
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
                                                rating.checked
                                                    ? [
                                                        styles.checkBoxText,
                                                        {
                                                            color: Colors.colors.primaryText,
                                                        },
                                                    ]
                                                    : styles.checkBoxText
                                            }>
                                            {rating.title}
                                        </Text>
                                        <CheckBox
                                            containerStyle={
                                                rating.checked ?
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
                                            checked={rating.checked}
                                            onPress={() => this.toggleFilterItem("ratingList", rating.title)}
                                        />

                                    </ListItem>
                                ))}
                                <Text style={styles.filterHead}>
                                    Provider Type
                                </Text>
                                {this.state.providersList.map((designation, index) => (
                                    <ListItem
                                        key={index}

                                        onPress={() => this.toggleFilterItem("providersList", designation.title)}
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
                                            onPress={() => this.toggleFilterItem("providersList", designation.title)}
                                        />


                                    </ListItem>
                                ))}
                                <Text style={styles.checkBoxSectionText}>Services in States ? </Text>
                                {this.state.servicesFilterStates && this.state.servicesFilterStates.length > 0 && (
                                    <FlatList
                                        showsVerticalScrollIndicator={false}
                                        data={this.state.servicesFilterStates}
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

                                {/*<View style={styles.filterBtn}>*/}
                                {/*    <PrimaryButton*/}
                                {/*        onPress={() => this.applyFilter()}*/}
                                {/*        text="Apply filter"*/}
                                {/*    />*/}
                                {/*</View>*/}
                            </View>

                        </View>
                    </Content>

                </Modal>

            </Container>


        );

    }
}


const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingLeft: 3,
        paddingRight: 0,
        height: HEADER_SIZE,
        // ...CommonStyles.styles.headerShadow
    },
    backButton: {
        marginLeft: 18,
        width: 40,
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
    filterIcon: {
        height: 24,
        width: 24,
        marginRight: 12,
        paddingLeft: 0,
        paddingRight: 0,
    },

    bulletIcon: {
        height: 8,
        width: 8,
        borderRadius: 4,
        backgroundColor: Colors.colors.neutral50Icon,
        marginRight: 8,
        marginLeft: 8,
    },

    itemTitle: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 8,
    },
    itemDurationCost: {

        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.lowContrast,
    },
    itemDescription: {

        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.mediumContrast,
        marginTop: 16,
        marginBottom: 16,
    },
    serviceMainWrapper: {
        borderRadius: 12,
    },
    providerImages: {
        marginRight: 8,
    },
    itemProviderCount: {

        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.secondaryText,
    },

    providersMainWrapper: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 16,
    },

    proText: {
        color: "#515d7d",
        fontFamily: "Roboto-Regular",
        fontSize: 17,
        letterSpacing: 0.8,
        lineHeight: 18,
        textAlign: "center",
        marginBottom: 30,
    },
    list: {
        padding: 24,
    },
    serviceCard: {
        borderWidth: 2,
        borderColor: "#f5f5f5",
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: "rgba(37, 52, 92, 0.09)",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowRadius: 10,
        shadowOpacity: 0.8,
        elevation: 1,
        backgroundColor: Colors.colors.whiteColor,
        flexDirection: "column",

    },
    checkWrapper: {
        paddingRight: 16,
    },
    nextBtn: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 34 : 24,
    },
    personalInfoWrapper: {
        borderColor: "rgba(0,0,0,0.05)",
        backgroundColor: "#fff",

        marginTop: 16,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    personalInfoRating: {
        marginTop: 16,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        display: "flex",
        justifyContent: "space-between",
    },
    imageWrapper: {},
    proImage: {
        width: 48,
        height: 48,
        borderRadius: 80,
        overflow: "hidden",
    },
    staticText: {
        color: "#515d7d",
        fontFamily: "Roboto-Regular",
        fontSize: 22,
        lineHeight: 25,
        letterSpacing: 0.3,
        textAlign: "center",
        margin: 35,
    },
    proBgMain: {
        width: 65,
        height: 65,
        borderRadius: 45,
        justifyContent: "center",
        alignItems: "center",
    },
    proLetterMain: {
        fontFamily: "Roboto-Bold",
        color: "#fff",
        fontSize: 24,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    itemDetail: {
        paddingLeft: 16,
    },
    itemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 24,
    },
    itemBody: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: "#F5F5F5",
    },
    reviewBtnText: {
        color: "#515d7d",
        fontSize: 14,
        fontFamily: "Roboto-Regular",
        fontWeight: "400",
        lineHeight: 16,
        letterSpacing: 0.7,
        marginTop: 8,
        textAlign: "center",
    },
    serviceDesc: {
        color: "#25345C",
        fontFamily: "Roboto-Regular",
        fontSize: 15,
        lineHeight: 22.5,
        padding: 24,
    },
    filterHead: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5,
        color: Colors.colors.highContrast,
        marginBottom: 16,
        marginTop: 32,
    },
    filterBody: {},
    filterScroll: {
        paddingBottom: isIphoneX() ? 34 : 24,
        maxHeight: 450,
    },
    filterBtn: {
        paddingTop: 16,
    },
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
        justifyContent: "space-between",
        borderColor: Colors.colors.borderColor,
        backgroundColor: Colors.colors.whiteColor,
        padding: 16,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 8,
        marginLeft: 0,
    },
    multiListText: {
        fontFamily: "Roboto-Regular",
        fontSize: 15,
        letterSpacing: 0.3,
        color: "#515d7d",
        paddingRight: 10,
        flex: 1,
    },
    checkBoxMain: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 15,
        paddingBottom: 15,
        borderWidth: 0.5,
        borderColor: "#F0F0F2",
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
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
        backgroundColor: Colors.colors.whiteColor,
    },
    filterOverlay: {
        height: "auto",
        alignSelf: "center",
        position: "absolute",
        bottom: 0,
        paddingBottom: isIphoneX() ? 34 : 24,
        left: 0,
        right: 0,
        top: 85,
        paddingLeft: 24,
        paddingRight: 24,
        borderRadius: 12,
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
    checkBoxText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
        width: "90%",
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

export default connectConnections()(ApptSelectServiceByTypeScreen);
