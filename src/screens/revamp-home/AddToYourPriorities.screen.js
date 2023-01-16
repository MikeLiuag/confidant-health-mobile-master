import React, {Component} from "react";
import {Platform, ScrollView, StatusBar, StyleSheet} from "react-native";
import {Body, Button, Container, Header, Left, Right, Text, View} from "native-base";
import {addTestID, AlertUtil, Colors, CommonStyles, getHeaderHeight, TextStyles} from "ch-mobile-shared";
import {connectConnections} from "../../redux";
import Icon from "react-native-vector-icons/FontAwesome";
import GenericListItem from "../../components/revamp-home/GenericListItem";
import {Screens} from "../../constants/Screens";
import Loader from "../../components/Loader";
import EntypoIcons from 'react-native-vector-icons/Entypo';

const HEADER_SIZE = getHeaderHeight();

class AddToYourPrioritiesScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            revampContextDetails: this.props?.revamp?.revampContext || []
        };
    }

    /**
     * @function updateList
     * @description This method is used to update plan item priority.
     */
    updateList = (selectedPlanItem,shouldUpdate) => {
        let {revampContextDetails} = this.state;
        revampContextDetails?.plan?.planItemsContexts.map(planItemContext => {
            if (planItemContext?.planItem?.id === selectedPlanItem?.planItem?.id) {
                planItemContext.priority = !planItemContext.priority;
            }
        })
        this.setState({revampContextDetails,selectedPlanItem},()=>{
            if(shouldUpdate) {
                this.props.updateRevampContext(revampContextDetails)
            }
        });
    }

    /**
     * @function renderPlanItems
     * @description This method is used to render plan Items.
     */
    renderPlanItems = () => {
        const {revampContextDetails} = this.state;
        return (
            revampContextDetails && revampContextDetails?.plan?.planItemsContexts.map((revampContext, index) => {
                return (
                    <GenericListItem
                        index={index}
                        iconType={"AntIcon"}
                        iconName={revampContext.priority ?"minuscircle":"pluscircle"}
                        headingText={revampContext.status}
                        headingSubText={revampContext.planItem?.planToken ? '+' + revampContext.planItem?.planToken + (revampContext.planItem?.planToken > 1 ? ' Tokens' : ' Token') : null}
                        mainText={revampContext.planItem.name}
                        itemColor={Colors.colors.highContrast}
                        shapeColor={revampContext.priority ? Colors.colors.errorIcon : Colors.colors.successIcon}
                        performAction={() => {
                            this.updateList(revampContext,true)
                        }}
                    />
                );
            })
        )
    }

    /**
     * @function navigateToNextScreen
     * @description This method is used to navigate to next screen.
     */
    navigateToNextScreen = () => {
        this.props.navigation.navigate(Screens.TAB_VIEW)
    }

    /**
     * @function renderHeader
     * @description This method is used to render header.
     */
    renderHeader =()=>{
        return(
            <Header transparent style={styles.chatHeader}>
                <StatusBar
                    backgroundColor={Platform.OS === 'ios' ? null : 'transparent'}
                    barStyle="dark-content"
                    translucent
                />
                <Left>
                    <Button
                        {...addTestID('back')}
                        onPress={() => {
                            this.props.navigation.goBack();
                        }}
                        transparent
                        style={styles.backButton}>
                        <EntypoIcons size={30} color={Colors.colors.mainBlue} name="chevron-thin-left"/>
                    </Button>
                </Left>
                <Body style={{flex: 2}}/>
                <Right/>
            </Header>
        )
    }

    render() {
        StatusBar.setBarStyle("dark-content", true);
        if(this.state.isLoading){
            return <Loader/>
        }
        return (
            <Container>
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent
                />
                {this.renderHeader()}
                <ScrollView showsVerticalScrollIndicator={false} style={{paddingHorizontal: 24, marginBottom: 24}}>
                    <View>
                        <Text style={styles.titlePage}>Add to your priorities</Text>
                        <Text style ={styles.pageDescription}>We recommend choosing 1-3 items to focus on in the first week. These will appear in a
                            shorter list</Text>
                    </View>
                    <View>
                    {this.renderPlanItems()}
                    </View>
                </ScrollView>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    titlePage: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH2,
        color: Colors.colors.highContrast,
    },
    pageDescription: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.lowContrast,
        marginTop: 16,
    },
    chatHeader: {
        paddingTop: 15,
        paddingLeft: 24,
        paddingRight: 24,
        elevation: 0,
        height: HEADER_SIZE,
    },
    infoIcon: {
        color: Colors.colors.whiteColor,
        fontSize: 24,
    },
    providerImage: {
        height: 64,
        width: 64,
    },

    planImage: {
        marginBottom: 16,
        alignSelf: "center",
    },
    wrapperMain: {
        width: "100%",
    },
    headingSectionMain: {
        marginBottom: 14,
        width: "100%",
    },
    tokenImgWrapper: {
        alignItems: "center",
    },
    homeMainBanner: {
        width: "100%",
    },
    roundWrapper: {
        alignItems: "center",
        paddingBottom: 24,
    },
    tokenNumber: {
        position: "absolute",
        alignItems: "center",
        flex: 1,
        top: 30,
        color: Colors.colors.whiteColor,
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.largeText,
    },
    centerText: {
        position: "absolute",
        alignItems: "center",
        flex: 1,
        top: 30,
        color: Colors.colors.whiteColor,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.overlineTextS,
    },
    mainTitleText: {
        color: Colors.colors.whiteColor,
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH2,
        alignSelf: "center",
        paddingBottom: 24,
    },
    homeTopTextWrap: {
        alignItems: "center",
    },
    mainTitle: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.whiteColor,
        marginBottom: 8,
        marginTop: 12,
    },
    subTitle: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.whiteColor,
        marginTop: 16,
    },
    smileWrap: {
        justifyContent: "center",
        paddingHorizontal: 24,
    },

    homeSubTitle: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.whiteColor,
        textAlign: "center",
        paddingHorizontal: 50,
        paddingBottom: 40,
    },
    singleCard: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 12,
        padding: 24,
        marginBottom: 16,
    },
    planContent: {
    },
    planContentWrapper: {
        ...CommonStyles.styles.shadowBox,
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
        width: "100%",
        padding: 24,
    },
    planContentTitle: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.bodyTextL,
        color: Colors.colors.mediumContrast,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
    },
    planContentSubTitle: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
        paddingLeft: 24,
        paddingRight: 24,
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
    },
    btnStyle: {
        paddingLeft: 23,
        paddingRight: 23,
        marginBottom: 30,
    },
});

export default connectConnections()(AddToYourPrioritiesScreen);
