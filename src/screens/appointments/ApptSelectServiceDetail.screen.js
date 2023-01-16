import React, {Component} from "react";
import {FlatList, Platform, StatusBar, StyleSheet, View} from "react-native";
import {connectConnections} from "../../redux";
import {Colors, getHeaderHeight, PrimaryButton, TextStyles} from "ch-mobile-shared";
import {Body, Button, Container, Content, Header, Left, Right, Text, Title} from "native-base";
import {addTestID, isIphoneX} from "ch-mobile-shared/src/utilities";
import {BackButton} from "ch-mobile-shared/src/components/BackButton";
import {GenericListComponent} from "ch-mobile-shared/src/components/GenericListComponent";
import {RatingComponent} from "ch-mobile-shared/src/components/RatingComponent";
import {S3_BUCKET_LINK} from "../../constants/CommonConstants";
import {Screens} from "../../constants/Screens";

const HEADER_SIZE = getHeaderHeight();

class ApptSelectServiceDetailScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.selectedItem = navigation.getParam("selectedItem", null);
        this.isProviderFlow = navigation.getParam("isProviderFlow", null);
    }

    renderReviews = () => {
        return (
            <View style={styles.providerInfoRatingWrapper}>
                <View style={styles.providerInfoRating}>
                    <RatingComponent
                        readonly={true}
                        startingValue={5}
                        fractions={2}
                        type='star'
                        showRating={false}
                        ratingCount={5}
                        size={25}
                        selectedColor={Colors.colors.secondaryText}
                        tintColor={'#fff'}
                        defaultRating={4}
                    />
                    <Text style={styles.providerInfoRatingDate}>
                        December 5, 2020
                    </Text>

                </View>
                <Text style={styles.providerInfoRatingDes}>
                    Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat
                    duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.
                </Text>
            </View>

        );
    };

    backClicked = () => {
        this.props.navigation.goBack();
    };

    seeAll = () => {
    }

    navigateToScheduleScreen = () => {
        if (this.isProviderFlow) {
            this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_DATE_TIME_SCREEN, {
                selectedService: this.selectedItem.service,
                selectedProvider: this.selectedItem.providers[0],
                ...this.props.navigation.state.params
            })
        } else {
            this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_PROVIDER_SCREEN, {
                patient: this.props.auth.meta,
                isProviderFlow: false,
                selectedService: this.selectedItem?.service,
                selectedServiceProviders: this.selectedItem?.providers,
                memberSelectedStates:[this.props.profile.patient.state]
            })
        }
    }

    navigateToProviderDetailsScreen = (selectedProvider) => {
        this.props.navigation.navigate(Screens.PROVIDER_DETAIL_SCREEN, {
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
            isProviderFlow: false,
            selectedService: this.selectedItem.service,
            memberSelectedStates:[this.props.profile.patient.state]
        });
    }

    renderProviderList = () => {
        const providerList = this.selectedItem.providers.map((providerData) => {
            if (providerData != null) {
                return {
                    userId: providerData.userId,
                    name: providerData.name,
                    designation: providerData.designation,
                    profilePicture: S3_BUCKET_LINK + providerData.profilePicture,
                }
            }
        })
        return (
            <View style={styles.genericListWrapper}>
                <FlatList
                    data={providerList}
                    renderItem={({item, index}) =>
                        <GenericListComponent
                            key={index}
                            itemDetail={item}
                            onPress={() => {
                                this.navigateToProviderDetailsScreen(item);
                            }}
                        />
                    }
                    keyExtractor={item => item?.id}
                />
            </View>
        )
    }

    render() {
        StatusBar.setBarStyle("dark-content", true);
        const list = ['Only available in CT', 'Only available in CT', 'Only available in CT']
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <Header transparent style={styles.header}>
                    <StatusBar
                        backgroundColor={Platform.OS === "ios" ? null : "transparent"}
                        translucent
                        barStyle={"dark-content"}
                    />
                    <Left>
                        <View style={styles.backButton}>
                            <BackButton
                                {...addTestID('back')}
                                onPress={this.backClicked}
                            />
                        </View>
                    </Left>
                    <Body style={styles.headerRow}>
                        <Title
                            {...addTestID("select-service-by-type-header")}
                            style={styles.headerText}>{this.serviceType}</Title>
                    </Body>
                    <Right>

                        {/*<Button transparent
                                style={{alignItems: 'flex-end', paddingRight: 7, marginRight: 8}}
                                onPress={() => {
                                    this.refs?.modalContact.open()
                                }}
                        >
                            <FeatherIcons size={30} color={Colors.colors.mainBlue} name="more-horizontal"/>
                        </Button>*/}
                    </Right>
                </Header>
                <Content
                    showsVerticalScrollIndicator={false}
                    {...addTestID("select-service-by-type-content")}
                >
                    <View style={styles.itemHeader}>
                        <View style={{flex: 1}}>
                            <Text style={styles.itemTitle}>{this.selectedItem.service.name}</Text>
                            <View style={{display: 'flex', flexDirection: 'row', marginBottom: 16, marginTop: 8}}>
                                <Text style={styles.itemDurationCost}
                                      numberOfLines={2}>{this.selectedItem.service.durationText} session</Text>
                                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                    <View style={styles.bulletIcon}/>
                                    <Text style={styles.itemDurationCost}>Users typically pay
                                        ${this.selectedItem.service.cost}</Text>
                                </View>
                            </View>
                            <View>
                                <Text style={styles.itemDescription}>
                                    {this.selectedItem.service.description}
                                </Text>
                            </View>
                            {/*<RenderTextChipComponent
                                    renderList={list}
                                />
                                <View style={styles.providerReviewsMainWrapper}>
                                    <Text style={styles.providerReviewsTitle}>
                                        Reviews
                                    </Text>
                                    {this.renderReviews()}
                                    <Button
                                        onPress={() => {
                                            this.seeAll();
                                        }}
                                        transparent>
                                        <View style={styles.seeAllBtn}>
                                            <Text style={styles.seeAllBtnText}>See all reviews</Text>
                                            <AntIcon name="arrowright" size={20} color={Colors.colors.primaryIcon}/>
                                        </View>
                                    </Button>
                                </View>*/}
                            {!this.isProviderFlow &&
                            <View>
                                <Text style={styles.providerReviewsTitle}>
                                    Select your service provider:
                                </Text>
                                {this.renderProviderList()}
                            </View>
                            }
                        </View>
                    </View>

                </Content>
                <View
                    style={styles.greBtn}>
                    <PrimaryButton
                        testId="schedule"
                        onPress={() => {
                            this.navigateToScheduleScreen();
                        }}
                        color={Colors.colors.whiteColor}
                        iconName='calendar'
                        text="Schedule"
                        arrowIcon={false}
                    />
                </View>
            </Container>


        );

    }
}


const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingLeft: 3,
        paddingRight: 0,
        height: HEADER_SIZE
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

    seeAllBtn: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },

    seeAllBtnText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.buttonTextM,
        color: Colors.colors.primaryText,
    },

    providerReviewsTitle: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH4,
        color: Colors.colors.highContrast,
    },

    providerReviewsMainWrapper: {
        marginTop: 32,
        marginBottom: 32,
    },

    providerInfoRatingWrapper: {
        marginTop: 24,
        marginBottom: 24,
    },
    providerInfoRating: {
        flexDirection: 'row',
        alignItems: 'center',
        display: "flex",
        justifyContent: 'space-between',
        marginBottom: 8
    },
    providerInfoRatingText: {
        marginLeft: 8,
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.highContrast,
    },
    providerInfoRatingDate: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        color: Colors.colors.lowContrast,
    },
    providerInfoRatingDes: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
    },

    filterIcon: {
        marginRight: 10,
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
        marginBottom: 8
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
        borderRadius: 12,
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
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 24
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        backgroundColor: Colors.colors.white,
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
    },
    genericListWrapper: {
        paddingTop: 24
    },
});

export default connectConnections()(ApptSelectServiceDetailScreen);
