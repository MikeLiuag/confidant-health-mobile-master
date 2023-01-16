import React, {Component} from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    SectionList,
    StatusBar,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import {Body, Button, Container, Content, Header, Icon, Left, ListItem, Right, Text, View} from 'native-base';
import {
    AddCardButton,
    AddFundsBox,
    addTestID,
    AlertUtil,
    AlfieLoader,
    BackButton,
    CardViewItem,
    Colors, CommonSegmentHeader,
    CommonStyles,
    getHeaderHeight,
    isIphoneX,
    PrimaryButton,
    TextStyles,
    TransactionSingleActionItem,
} from 'ch-mobile-shared';
import AntIcons from 'react-native-vector-icons/AntDesign';
import {connectPayment} from '../../../redux';
import moment from 'moment';
import Modal from 'react-native-modalbox';
import FeatherIcons from "react-native-vector-icons/Feather";
import {CreditCardInput} from "../../../components/payment/react-native-credit-card-input";
import BillingService from "../../../services/Billing.service";
import {
    DEFAULT_IMAGE, ERROR_NOT_FOUND,
    FILTER_TRANSACTIONS,
    S3_BUCKET_LINK,
    SEGMENT_EVENT,
    STRIPE_ERROR, TRANSACTIONS_TYPE
} from "../../../constants/CommonConstants";
import Analytics from "@segment/analytics-react-native";
import {CheckBox} from "react-native-elements";
import {Calendar} from 'react-native-calendars';

const TABS = [
    {title: 'Categories', segmentId: 'categories'},
    {title: 'Calendar', segmentId: 'calendar'},
];

const HEADER_SIZE = getHeaderHeight();

class MyWalletScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            submitted: false,
            error: null,
            cardData: {valid: false},
            cardDetails: null,
            amountToAdd: 100,
            transactionDetails: null,
            selectedCardId: this.props.payment.cardsList && this.props.payment.cardsList.length > 0 && this.props.payment.cardsList[0].cardId || 'new_card',
            transactionsCategoryList: FILTER_TRANSACTIONS,
            selectedTransactionCategory: "",
            currentPage: 0,
            hasMore: true,
            isLoadingMore: null,
            filteredTransactionsList: null,
            fromDay: '',
            toDay: '',
            markedDates: {},
            activeSegmentId :'categories',
            changeSegmentTab: (tabId)=>{}
        };
        this.paymentLock = false;
    }

    /**
     * @function payBill
     * @description Handle add funds to your wallet request.
     * @params cardId
     */
    payBill = async (cardId) => {
        if(this.paymentLock) {
            return;
        }
        this.paymentLock = true;
        const topupRequest = {
            paymentToken: cardId,
            amount: this.state.amountToAdd,
        };

        this.props.topupWallet({
            request: topupRequest, callback: (topupResponse) => {
                this.setState({
                    selectedCardId: null
                });
                Analytics.screen(
                    'Wallet Top up Screen'
                );
                const segmentAddFundsPayload = {
                    userId: this.props.auth.meta.userId,
                    paymentAmount: topupResponse.topupAmount,
                    paymentMethod: 'Stripe',
                    walletTotalBefore: topupResponse.previousBalance,
                    walletTotalAfter: topupResponse.currentBalance,
                    category: 'Goal Completion',
                    label: 'Funds Added to Wallet',
                };
                Analytics.track(SEGMENT_EVENT.FUNDS_ADDED_TO_WALLET, segmentAddFundsPayload);
            },
        });
        setTimeout(()=>{
            this.paymentLock = false;
        }, 1500);
    }

    /**
     * @function onSubmit
     * @description Handle stripe token & payment process .
     * @params creditCardInput
     */
    deleteCard = (cardId) => {
        this.savedCardDrawerClose();
        this.props.deleteCard({payload: cardId});
        this.props.fetchCardsList();
    }

    /**
     * @function onSubmit
     * @description Handle stripe token & payment process .
     * @params creditCardInput
     */
    onSubmit = async (creditCardInput) => {
        this.setState({isLoading: true});
        this.addCardDrawerClose();
        let creditCardToken;
        try {
            creditCardToken = await BillingService.getStripeToken(creditCardInput);
            if (creditCardToken.error) {
                if (creditCardToken.error.message.includes("The card number is longer than the maximum supported" +
                        " length of 16.")) {
                    AlertUtil.showErrorMessage("This is not a valid stripe card");
                } else {
                    AlertUtil.showErrorMessage(creditCardToken.error.message);
                }
                this.setState({isLoading: false});
            } else {
                // Send a request to your server with the received credit card token
                let paymentResponse = await BillingService.addCard(creditCardToken.id);
                if (paymentResponse.errors) {
                    AlertUtil.showErrorMessage(paymentResponse.errors[0].endUserMessage);
                } else {
                    this.props.fetchCardsList();
                    await Analytics.identify(this.props.auth?.meta?.userId, {
                        hasCardAddedSuccessfully : true
                    });
                    AlertUtil.showSuccessMessage("Card added successfully");

                }
                this.setState({isLoading: false});
            }
        } catch (e) {
            console.log(e);
            AlertUtil.showErrorMessage(STRIPE_ERROR);
            this.setState({isLoading: false});
        }

    };

    navigateBack() {
        this.props.navigation.goBack();
    }

    selectedCardDetails = async (data) => {
        await this.setState({cardDetails: data});
        this.savedCardDrawerOpen();
    }
    addFundsDrawerClose = () => {
        this.refs?.modalAddFunds?.close();
        this.setState({
            selectedCardId: null
        })
    };

    savedCardDrawerOpen = () => {
        this.refs?.modalAddFunds?.close();
        this.refs?.modalSavedCard?.open()
    };

    updateAmount = (value) => {
        if (value === 'INCREMENT') {
            this.setState({amountToAdd: this.state.amountToAdd + 1});
        } else if (value === 'DECREMENT') {
            this.setState({amountToAdd: this.state.amountToAdd - 1});
        }

    }

    addCardDrawerOpen = () => {
        this.refs?.modalAddFunds?.close();
        this.refs?.modalAddCard?.open()
    };

    savedCardDrawerClose = () => {
        this.refs?.modalSavedCard?.close();
    };

    addCardDrawerClose = () => {
        this.refs?.modalAddCard?.close();
    };

    transactionDetailDrawerClose = () => {
        this.refs?.modalTransactionDetails?.close();
    };

    showTransactionDetails = (selectedItem, description) => {
        selectedItem = {
            ...selectedItem,
            description
        }
        this.setState({transactionDetails: selectedItem});
        this.refs?.modalTransactionDetails?.open();

    }

    async componentDidMount(): void {
        const {selectedTransactionCategory, fromDay, toDay, currentPage, filteredTransactionsList, hasMore} = this.state;
        this.clearTransactionCategoryListFilters();
        this.props.fetchWalletSilently();
        this.props.fetchCardsList();
        await this.getPaymentHistory(selectedTransactionCategory, fromDay, toDay, currentPage, filteredTransactionsList, hasMore);
    }

    getPaymentHistory = async  (selectedTransactionCategory, fromDay, toDay, currentPage, filteredTransactionsList, hasMore, isLazy) => {
        isLazy
            ? this.setState({isLoadingMore: true})
            : this.setState({isLoading: true});
        const response = await BillingService.getPaymentHistory(selectedTransactionCategory, fromDay, toDay, currentPage);
        if (response.errors) {
            console.warn(response.errors[0].endUserMessage);
            if (response.errors[0].errorCode !== ERROR_NOT_FOUND) {
                AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            }
        } else {
            const currentPage = response.currentPage;
            const totalPages = response.totalPages;
            const nextPaymentHistory = response.paymentHistory;

            const transactionDetailsByDate = this.getTransactionHistoryDetailByDate(nextPaymentHistory);

            this.setState({
                filteredTransactionsList: filteredTransactionsList
                    ? [...filteredTransactionsList, ...nextPaymentHistory]
                    : [...nextPaymentHistory],
                hasMore: currentPage < totalPages - 1,
                currentPage: hasMore ? currentPage + 1 : currentPage,
                transactionDetailsByDate: transactionDetailsByDate,
                isLoading: false,
                isLoadingMore: false,
            });
        }
    };


    /**
     * @function getItemDetail
     * @description This method is used to get each transaction history title & subtitle.
     */
    getItemDetail = (item) => {
        let title = '', subText = '';
        if(item.paymentCategory === TRANSACTIONS_TYPE.SESSION_PAYMENT){
            title = item.serviceName ? item.serviceName : "Service";
            subText = item.providerName ? item.providerName : "Information not available";
        }
        if(item.paymentCategory === TRANSACTIONS_TYPE.COMMUNITY_PAYMENT){
            title = "Community Payment";
            subText = "Payment from you " + item.mode + " to Confidant Community";
        }
        if(item.paymentCategory === TRANSACTIONS_TYPE.GROUP_PAYMENT){
            title = item.groupName ? item.groupName : "Group";
            subText = item.mode ? "Group Payment from your " + item.mode : "Group Payment";
        }
        if(item.paymentCategory === TRANSACTIONS_TYPE.PRIZES){
            title = "Session Prize";
            subText = "Prize add to your account";
        }
        if(item.paymentCategory === TRANSACTIONS_TYPE.APP_SUBSCRIPTION){
            title = "App subscription";
            subText = "Renewed your app subscription";
        }
        if(item.paymentCategory === TRANSACTIONS_TYPE.WALLET_TOP_UP){
            title = "Wallet Topup";
            subText = "Add amount to your wallet";
        }

        return {
            title: title,
            subText: subText || "Information not available"
        };

    }

    /**
     * @function getTransactionDetailByDate
     * @description This method is used to populate section list data for transactions history from api response
     */
    getTransactionDetailByDate = (walletTransactionsHistory) => {
        return walletTransactionsHistory.reduce((walletTransactions, item) => {
            let existRecord = walletTransactions.find(record => record.title === moment(item.transactionTime).format("MMM D YYYY"))
            if (existRecord) {
                existRecord.data.push(item);
            } else {
                walletTransactions.push({
                    title: moment(item.transactionTime).format("MMM D YYYY"),
                    data: [item]
                })
            }
            return walletTransactions
        }, []);
    }

    getTransactionHistoryDetailByDate = (walletTransactionsHistory) => {
        return walletTransactionsHistory.reduce((walletTransactions, item) => {
            let existRecord = walletTransactions.find(record => record.title === moment(item.paidAt).format("MMM D YYYY"))
            if (existRecord) {
                existRecord.data.push(item);
            } else {
                walletTransactions.push({
                    title: moment(item.paidAt).format("MMM D YYYY"),
                    data: [item]
                })
            }
            return walletTransactions
        }, []);
    }

    /**
     * @function renderItem
     * @description This method is used to render each item of section List ( Transaction History )
     * @params renderItem
     */
    renderItem = (renderItem)=>{
        if(renderItem.item) {
            const itemDetail = this.getItemDetail(renderItem.item);
            return (
                <TouchableOpacity
                    onPress={() => {
                        this.showTransactionDetails(renderItem.item, itemDetail.subText)
                    }}
                    style={styles.singleEntry}>
                    {(renderItem.item?.paymentCategory === TRANSACTIONS_TYPE.SESSION_PAYMENT || renderItem.item?.paymentCategory === TRANSACTIONS_TYPE.COMMUNITY_PAYMENT || renderItem.item?.paymentCategory === TRANSACTIONS_TYPE.GROUP_PAYMENT)  && (
                        <Image
                            style={styles.proImage}
                            resizeMode="cover"
                            source={{uri: renderItem.item?.profilePicture ? S3_BUCKET_LINK + renderItem.item?.profilePicture : S3_BUCKET_LINK + DEFAULT_IMAGE}}
                        />
                    )}
                    {(renderItem.item?.paymentCategory === TRANSACTIONS_TYPE.APP_SUBSCRIPTION || renderItem.item?.paymentCategory === TRANSACTIONS_TYPE.WALLET_TOP_UP) && (
                        <View style={styles.iconCircle}>
                            <Icon type={'FontAwesome'} name="credit-card" style={styles.cardIcon}/>
                        </View>
                    )}
                    {(renderItem.item?.paymentCategory === TRANSACTIONS_TYPE.PRIZES) && (
                        <View style={styles.iconCircle}>
                            <Icon type={'Feather'} name="dollar-sign" style={styles.dollarIcon}/>
                        </View>
                    )}

                    <View style={styles.textBox}>
                        {itemDetail.title !== '' && (<Text style={styles.transactionText}>{itemDetail.title}</Text>)}
                        {itemDetail.subText !== '' && (<Text numberOfLines={2}
                                                             style={styles.duskText}>{itemDetail.subText}</Text>)}
                    </View>
                    <Text numberOfLines={1}
                          style={
                              renderItem.item?.paymentCategory === TRANSACTIONS_TYPE.WALLET_TOP_UP ?
                                  [styles.amountText, {color: Colors.colors.successText}]
                                  :
                                  {color: Colors.colors.secondaryText}
                          }>
                        {(renderItem.item?.paymentCategory === TRANSACTIONS_TYPE.WALLET_TOP_UP || renderItem.item?.paymentCategory === TRANSACTIONS_TYPE.PRIZES)  ? '+' : '-'} ${renderItem.item?.amount}
                    </Text>
                </TouchableOpacity>
            )
        }
    }

    openAddFundsModal = ()=>{

        this.setState({
            selectedCardId: this.props.payment.cardsList && this.props.payment.cardsList.length > 0 && this.props.payment.cardsList[0].cardId || 'new_card'
        })
        this.refs?.modalAddFunds?.open();
    };

    openTransactionsFilterModal = ()=>{
        this.refs?.filterTransactionsModal.open();
    };

    filterTransactionsDrawerClose = () => {
        this.refs?.filterTransactionsModal.close();
    };

    toggleFilterItem = (title) => {
        let relevantList = this.state.transactionsCategoryList;
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
        updatedState.isDisabled = isChecked;
        this.setState(updatedState, this.applyFilter);
    }

    applyFilter = () => {
        let {selectedTransactionCategory, transactionsCategoryList, fromDay, toDay, currentPage, filteredTransactionsList, hasMore} = this.state;
        selectedTransactionCategory = transactionsCategoryList.filter(transactionCategory => transactionCategory.checked === true).map(transaction => transaction.value)
        selectedTransactionCategory = selectedTransactionCategory[0];
        fromDay = "";
        toDay = "";
        currentPage = 0;
        filteredTransactionsList = null;
        let updatedFilteredTransactions = null;
        if(selectedTransactionCategory?.length != null ){
            updatedFilteredTransactions = this.getPaymentHistory(selectedTransactionCategory, fromDay, toDay, currentPage, filteredTransactionsList, hasMore);
        }
        this.setState({
            filteredTransactionsList: updatedFilteredTransactions,
            fromDay: "",
            toDay: "",
            dateRangeList: []
        });
        AlertUtil.showSuccessMessage("Filter applied");
    }

    applyCalendarFilter = () => {
        let {selectedTransactionCategory, fromDay, toDay,  currentPage, filteredTransactionsList, hasMore} = this.state;
        selectedTransactionCategory = "";
        currentPage = 0;
        filteredTransactionsList = null;
        let updatedFilteredTransactions = null;
        if(fromDay !== "" && fromDay !== null && toDay !== "" && toDay !== null ){
            updatedFilteredTransactions = this.getPaymentHistory(selectedTransactionCategory, fromDay, toDay, currentPage, filteredTransactionsList, hasMore);
        }
        this.clearTransactionCategoryListFilters();
        this.setState({
            filteredTransactionsList: updatedFilteredTransactions,
        });
        AlertUtil.showSuccessMessage("Filter applied");
    }

    clearTransactionCategoryListFilters = () => {
        let transactionsCategoryList = this.state.transactionsCategoryList.map(item => {
            item.checked = false;
            return item
        })
        this.setState({transactionsCategoryList})
    }

    populateDateRanges = (dates) => {
        let updatedData = {}
        return dates.reduce((dates, item) => {
            updatedData = {
                ...updatedData,
                [item]:  {color: '#dd0374', textColor: 'white'},
            }
            return updatedData
        }, []);
    }
    getRangeDatelist = () => {
        const {fromDay, toDay} = this.state;
        let dates = [];
        if(fromDay !== null && fromDay !== '' && toDay !== null && toDay !== ''){
            let startDate = moment(fromDay).startOf('day');
            let endDate = moment(toDay).startOf('day');
            while(startDate.add(1, 'days').diff(endDate) < 0) {
                dates.push(startDate.clone().format('YYYY-MM-DD'));
            }
            this.setState({
                dateRangeList: this.populateDateRanges(dates),
            })
        }
    }

    render() {
        StatusBar.setBarStyle('dark-content', true);
        const wallet = this.props.payment.wallet;
        if (wallet.isLoading || this.state.isLoading || this.props.payment.isLoading) {
            return (<AlfieLoader/>);
        }
        const {transactionsCategoryList, activeSegmentId, filteredTransactionsList, transactionDetailsByDate, fromDay, toDay, transactionDetails} = this.state;

        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <Header transparent style={styles.header}>
                    <StatusBar
                        backgroundColor="transparent"
                        barStyle="dark-content"
                        translucent
                    />
                    <Left>
                        <BackButton
                            {...addTestID('Back')}
                            onPress={() => this.navigateBack()}
                        />
                    </Left>
                    <Body style={{flex: 2}}>
                    </Body>
                    <Right>
                        <Button transparent
                                style={{alignItems: 'flex-end', paddingRight: 5, marginRight: 0}}
                                onPress={this.openTransactionsFilterModal}
                        >
                            <Image style={styles.filterIcon} source={require('../../../assets/images/filter.png')}/>
                        </Button>
                    </Right>
                </Header>
                <Content contentContainerStyle={{paddingBottom: 40}}>
                    <View style={styles.titleBox}>
                        <Text style={styles.mainWalletTitle}>My wallet</Text>
                        <Text
                            style={styles.subWalletTitle}>{`${this.props.payment.cardsList.length} payment option${this.props.payment.cardsList.length !== 1 ? 's' : ''}`}</Text>
                    </View>


                    {wallet.balance === 0 && (
                        <View style={styles.alertBox}>
                            <FeatherIcons {...addTestID('alert-triangle')}
                                          name="alert-triangle" size={24} color="#FF8A07"/>
                            <Text {...addTestID('add-fund-txt')}
                                  style={styles.alertText}>Add funds to your account to pay for sessions</Text>
                        </View>
                    )}

                    <ScrollView
                        {...addTestID("all-filters")}
                        showsHorizontalScrollIndicator={false}
                        horizontal
                        contentContainerStyle={{
                            justifyContent: "space-evenly",
                            alignItems: "flex-start",
                            paddingRight: 20,
                        }}
                        style={styles.horizontalSection}
                    >

                        <View style={styles.balanceItem}>
                            <Text {...addTestID('wallet-balance')}
                                  style={{
                                      ...styles.costValue,
                                      color: wallet.balance > 0 ? styles.costValue.color : Colors.colors.highContrast
                                  }}>${wallet.balance}</Text>
                            <Text {...addTestID('account-balance')}
                                  style={styles.costText}>Account balance</Text>
                        </View>

                        {this.props?.payment?.cardsList?.length > 0 && this.props?.payment?.cardsList.map(cardData =>
                            <View style={styles.addCardItem}>
                            <CardViewItem
                            touchable
                            showCardDetails={() => this.selectedCardDetails(cardData)}
                            itemData={cardData}
                            brand={cardData.brand}
                            lastDigits={cardData.last4}
                            holderName={cardData.cardHolderName}
                            expiryDate={cardData.expiryMonth + '/' + cardData.expiryYear}
                            />

                            </View>
                            )

                        }

                        <View style={styles.addCardItem}>
                            <AddCardButton
                                onPress={this.addCardDrawerOpen}
                            />
                        </View>
                    </ScrollView>
                    <View style={styles.transactionBox}>
                        {transactionDetailsByDate && transactionDetailsByDate.length > 0 && (
                            <View style={styles.wholeList}>
                                <SectionList
                                    sections={transactionDetailsByDate}
                                    renderItem={this.renderItem}
                                    renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
                                    keyExtractor={(item, index) => index}
                                />

                            </View>
                        )}
                    </View>

                </Content>
                <View style={styles.greBtn}>
                    <PrimaryButton
                        testId="add-funds"
                        onPress={this.openAddFundsModal}
                        text="Add Funds"
                    />
                </View>

                {/*Add Funds Modal*/}
                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.addFundsDrawerClose}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        maxHeight: 590,
                        backgroundColor: Colors.colors.screenBG
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalAddFunds"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <View style={{width: '100%'}}>
                        <Text style={styles.modalHeader}>Add funds</Text>
                        <Text style={styles.modalSubHeader}>${wallet.balance} account balance</Text>
                        <AddFundsBox
                            fundTitle={'How much would you like to add?'}
                            fundAmount={this.state.amountToAdd}
                            incrementAmount={() => {
                                this.updateAmount('INCREMENT')
                            }}
                            decrementAmount={() => {
                                this.updateAmount('DECREMENT')
                            }}
                            setCustomAmount={(amountToAdd)=>{
                                this.setState({
                                    amountToAdd
                                })
                            }}
                        />

                        <ScrollView
                            {...addTestID("all-type-list")}
                            showsHorizontalScrollIndicator={false}
                            horizontal
                            contentContainerStyle={{
                                justifyContent: 'center'
                            }}
                            style={styles.fundTypeList}>
                            {this.props.payment.cardsList.length > 0 && this.props.payment.cardsList.map(card =>
                                <Button
                                    onPress={() => {
                                        this.setState({
                                            selectedCardId: card.cardId
                                        })
                                    }}
                                    style={card.cardId === this.state.selectedCardId ? styles.masterBtnSelected : styles.masterBtn}
                                    transparent>
                                    <Text uppercase={false} style={styles.masterText}>Saved card</Text>
                                    <View style={styles.masterNumWrap}>
                                        <Image
                                            style={styles.masterImg}
                                            source={card.brand === 'Visa' ? require('../../../assets/images/visa.png') : require('../../../assets/images/master.png')}

                                        />
                                        <Text style={styles.masterNum}>{card.last4}</Text>
                                    </View>
                                </Button>
                            )}

                            <Button
                                onPress={()=> {
                                    this.setState({
                                        selectedCardId: 'new_card'
                                    })
                                }}
                                style={this.state.selectedCardId ==='new_card'? {...styles.newCardBtn,borderWidth:1,borderColor: Colors.colors.secondaryText} : styles.newCardBtn} transparent>
                                <Text uppercase={false} style={styles.newCardText}>New card</Text>
                            </Button>
                        </ScrollView>

                        <PrimaryButton
                            testId="add-money"
                            text={this.state.selectedCardId ==='new_card' ? 'Add new card ': 'Add $' + this.state.amountToAdd}
                            disabled={!this.state.selectedCardId}
                            onPress={() => {
                                if(this.state.selectedCardId === 'new_card'){
                                    this.addCardDrawerOpen();
                                }else {
                                    this.payBill(this.state.selectedCardId);
                                }
                            }}
                        />
                    </View>
                </Modal>


                {/*Saved Card Modal*/}
                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onOpened={this.savedCardDrawerOpen}
                    onClosed={this.savedCardDrawerClose}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        height: 'auto',
                        position:'absolute',
                        //maxHeight: 460,
                        backgroundColor: Colors.colors.screenBG
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalSavedCard"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    {this.state.cardDetails && (
                        <View style={{width: '100%'}}>
                            <Text style={styles.modalHeader}>Saved card</Text>
                            <View style={styles.savedCardWrap}>
                                <CardViewItem
                                    itemData={this.state.cardDetails}
                                    brand={this.state.cardDetails.brand}
                                    lastDigits={this.state.cardDetails.last4}
                                    holderName={this.state.cardDetails.cardHolderName}
                                    expiryDate={this.state.cardDetails.expiryMonth + '/' + this.state.cardDetails.expiryYear}
                                />
                            </View>
                            <View style={styles.singleActionItem}>
                                <TransactionSingleActionItem
                                    title={'Delete card'}
                                    onPress={() => {
                                        this.deleteCard(this.state.cardDetails.cardId)
                                    }}
                                    iconBackground={Colors.colors.errorBG}
                                    styles={styles.gButton}
                                    renderIcon={(size, color) =>
                                        <AntIcons size={22} color={Colors.colors.errorIcon} name="closecircleo"/>
                                    }
                                />
                            </View>
                        </View>
                    )}

                </Modal>


                {/*Add card Modal*/}
                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.addCardDrawerClose}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        maxHeight: 480,
                        backgroundColor: Colors.colors.screenBG
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalAddCard"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <KeyboardAvoidingView
                        style={{flex: 1, bottom: 0}}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                        <Content>
                            <Text style={styles.modalHeader}>Add new card</Text>
                            <CreditCardInput
                                {...addTestID("CVC-input")}
                                // autoFocus
                                requiresName
                                requiresCVC
                                requiresPostalCode
                                additionalInputsProps={{
                                    cvc: {
                                        textContentType: "password",
                                        secureTextEntry: true,
                                    },
                                }}
                                labelStyle={styles.label}
                                inputStyle={styles.input}
                                inputContainerStyle={styles.inputContainer}
                                validColor={Colors.colors.primaryText}
                                invalidColor={Colors.colors.errorIcon}
                                placeholderColor={"#fff"}
                                cardScale={1}
                                cardFontFamily="Roboto-Regular"
                                allowScroll={false}
                                onChange={(cardData) => {
                                    this.setState({cardData});
                                }

                                }/>
                            <PrimaryButton
                                disabled={!this.state.cardData.valid}
                                onPress={() => this.onSubmit(this.state.cardData)}
                                testId="add-card"
                                text="Add card"
                            />
                        </Content>
                    </KeyboardAvoidingView>
                </Modal>


                {/*Transaction Details Modal*/}
                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.transactionDetailDrawerClose}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        maxHeight: 300,
                        backgroundColor: Colors.colors.screenBG
                    }}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalTransactionDetails"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    {transactionDetails &&
                    <View style={{width: '100%'}}>
                        <Text style={[styles.transAmount,
                            (transactionDetails.paymentCategory === TRANSACTIONS_TYPE.WALLET_TOP_UP || transactionDetails.paymentCategory === TRANSACTIONS_TYPE.PRIZES) ?
                                {color: Colors.colors.successText}
                                : ''
                        ]}>${transactionDetails.amount}</Text>
                        <Text style={styles.modalHeader}>{transactionDetails.description}</Text>
                        <Text
                            style={styles.transDate}>{moment(transactionDetails.paidAt).format('MMMM Do YYYY,h:mm a')}</Text>
                        {transactionDetails.cardLast4 !== null &&
                        <Text style={styles.transStatus}>Paid with a saved card
                            ({transactionDetails.cardLast4})</Text>
                        }
                    </View>
                    }
                </Modal>

                {/*Filter Transactions Modal*/}
                <Modal
                    backdropPressToClose={true}
                    backdropColor={Colors.colors.overlayBg}
                    backdropOpacity={1}
                    // onClosed={this.hideFilter}
                    style={{
                        ...CommonStyles.styles.commonModalWrapper,
                        maxHeight: '80%',
                    }}
                    entry={'bottom'}
                    position={'bottom'}
                    ref={'filterTransactionsModal'}
                    swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <Content showsVerticalScrollIndicator={false}>
                        <View style={styles.filterBody}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginTop: 25
                            }}>
                                <Text style={styles.mainHeading}>Filter transactions</Text>
                                <Text style={styles.countText}>{filteredTransactionsList?.length} total</Text>
                            </View>
                            <CommonSegmentHeader
                                segments={TABS}
                                setTabControl={callback=>{
                                    this.setState({changeSegmentTab: callback});
                                    callback(activeSegmentId);
                                }}
                                segmentChanged={(segmentId) => {
                                    this.setState({activeSegmentId: segmentId});
                                }}
                            />
                            {
                                activeSegmentId && activeSegmentId === "categories" ?
                                    <View>
                                        {transactionsCategoryList.map((category, index) => (
                                            <ListItem
                                                key={index}
                                                onPress={() => this.toggleFilterItem( category.title, index)}
                                                style={
                                                    category.checked
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
                                                        category.checked
                                                            ? [
                                                                styles.checkBoxText,
                                                                {
                                                                    color: Colors.colors.primaryText,
                                                                },
                                                            ]
                                                            : styles.checkBoxText
                                                    }>
                                                    {category.title}
                                                </Text>

                                                <CheckBox
                                                    containerStyle={
                                                        category.checked ?
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
                                                    checked={category.checked}
                                                    onPress={() => this.toggleFilterItem(category.title)}
                                                />
                                            </ListItem>
                                        ))}
                                    </View>
                                    :
                                    <View>
                                        <Calendar
                                            markingType={'period'}
                                            onDayPress={day => {
                                                this.setState({fromDay: day.dateString, toDay: '', dateRangeList: []})
                                            }}
                                            onDayLongPress={day => {
                                                if(day.dateString <= fromDay){
                                                    AlertUtil.showErrorMessage("please select date grater then " + this.state.fromDay)
                                                }else{
                                                    this.setState({toDay: day.dateString});
                                                    this.getRangeDatelist();
                                                }

                                            }}
                                            markedDates={{
                                                [fromDay]: {startingDay: true, color: '#dd0374', textColor: 'white'},
                                                ...this.state.dateRangeList,
                                                [toDay]: {endingDay: true, color: '#dd0374', textColor: 'white'}
                                            }}
                                        />
                                        <View style={styles.filterBtn}>
                                            <PrimaryButton
                                                onPress={() => this.applyCalendarFilter()}
                                                text="Show Results"
                                            />
                                        </View>
                                    </View>
                            }
                        </View>
                    </Content>
                </Modal>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 30,
        paddingLeft: 18,
        borderBottomWidth: 0,
        elevation: 0,
        height: HEADER_SIZE,
    },
    titleBox: {
        paddingHorizontal: 24,
        marginTop: 20
    },
    mainWalletTitle: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.highContrast,
        marginTop: 8
    },
    subWalletTitle: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextS,
        color: Colors.colors.lowContrast,
        marginBottom: 24
    },
    horizontalSection: {
        flexGrow: 0,
        flexShrink: 0,
        flexDirection: "row",
        flexWrap: "nowrap",
        paddingHorizontal: 24
    },
    balanceItem: {
        width: 210,
        height: 210,
        justifyContent: 'center',
        ...CommonStyles.styles.shadowBox,
        marginRight: 16,
        borderRadius: 12
    },

    addCardItem: {
        marginHorizontal: 8
    },
    walletHead: {
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1
    },
    alertBox: {
        height: 48,
        backgroundColor: '#FFFBF4',
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
        paddingRight: 20,
        paddingLeft: 20,
        marginBottom: 24
    },
    alertText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        color: '#FF8700',
        letterSpacing: 0.28,
        paddingLeft: 20
    },
    costValue: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.successText,
        marginBottom: 8,
        textAlign: 'center',
        paddingHorizontal: 10
    },
    costText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        color: Colors.colors.highContrast,
        textAlign: 'center'
    },
    transactionBox: {
        paddingHorizontal: 24,
        paddingTop: 16
    },
    sectionHead: {
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24
    },
    headText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.lowContrast
    },
    wholeList: {
        // marginBottom: 16,
    },
    singleEntry: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 62,
        paddingVertical: 8
    },
    transImg: {
        width: 48,
        height: 48
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.colors.primaryColorBG,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cardIcon: {
        fontSize: 24,
        color: Colors.colors.primaryIcon
    },
    dollarIcon: {
        fontSize: 24,
        color: Colors.colors.successIcon
    },
    textBox: {
        flex: 2,
        paddingRight: 10,
        paddingLeft: 12
    },
    transactionText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast
    },
    duskText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.lowContrast,
        textTransform: 'capitalize'
    },
    amountText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.successText,
        width: 55,
        textAlign: 'right'
    },
    paidBtn: {
        backgroundColor: Colors.colors.successText,
        width: 58,
        height: 26,
        borderRadius: 4
    },
    unpaidBtn: {
        backgroundColor: Colors.colors.secondaryText,
        width: 58,
        height: 26,
        borderRadius: 4
    },
    paidText: {
        color: Colors.colors.white,
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        fontSize: 11,
        lineHeight: 11,
        letterSpacing: 0.42
    },
    greBtn: {
        ...CommonStyles.styles.stickyShadow,
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        borderRadius: 12
    },
    modalHeader: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginTop: 8,
        textAlign: 'center'
    },
    modalSubHeader: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.lowContrast,
        marginTop: 4,
        textAlign: 'center',
        marginBottom: 40
    },

    fundTypeList: {
        paddingVertical: 36,
        flexDirection: 'row'
    },
    applePayBtn: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 8,
        marginRight: 8,
        width: 88,
        height: 78,
        justifyContent: 'center'
    },
    applePayImg: {
        width: 54,
        height: 23
    },
    masterBtn: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 8,
        marginRight: 8,
        width: 114,
        height: 78,
        flexDirection: 'column',
        borderWidth: 1,
        paddingLeft: 0,
        paddingRight: 0,
        justifyContent: 'center'
    },
    masterBtnSelected: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 8,
        marginRight: 8,
        width: 114,
        height: 78,
        flexDirection: 'column',
        borderWidth: 1,
        borderColor: Colors.colors.secondaryText,
        paddingLeft: 0,
        paddingRight: 0,
        justifyContent: 'center'
    },
    masterText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.highContrast
    },
    masterNumWrap: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    masterImg: {
        width: 16,
        height: 10
    },
    masterNum: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.lowContrast,
        marginLeft: 4
    },
    newCardBtn: {
        ...CommonStyles.styles.shadowBox,
        borderRadius: 8,
        marginRight: 8,
        width: 98,
        height: 78,
        justifyContent: 'center'
    },
    newCardText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.highContrast
    },
    savedCardWrap: {
        paddingTop: 32,
        marginBottom: 40
    },
    singleActionItem: {
        marginBottom: 16,
        marginTop: 16
    },
    cardFieldsWrapper: {
        marginTop: 32
    },
    cardNumberBox: {
        marginBottom: 20,
        position: 'relative'
    },
    addMasterImg: {
        width: 16,
        height: 10,
        position: 'absolute',
        right: 16,
        top: 24
    },
    cardOtherInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    cardInfo1: {
        width: '30%',
        marginRight: 16
    },
    savedToggleWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 48
    },
    savedToggleText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
    },

    transAmount: {
        ...TextStyles.mediaTexts.manropeExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.secondaryText,
        marginBottom: 16,
        textAlign: 'center'
    },
    transDate: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.highContrast,
        marginTop: 24,
        marginBottom: 4,
        textAlign: 'center'
    },
    transStatus: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.lowContrast,
        marginBottom: 40,
        textAlign: 'center'
    },
    singleTranItem: {
        marginBottom: 8
    },

    cardItem: {
        position: 'relative',
        width: 327,
        paddingLeft: 24
    },
    cardBg: {
        position: 'absolute'
    },
    cardNumber: {
        flexDirection: 'row',
        marginTop: 90,
        marginBottom: 24
    },
    numberSection: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH4,
        color: Colors.colors.white,
        marginRight: 16
    },
    cardInfo: {
        flexDirection: 'row'
    },
    info1: {
        marginRight: 24,
        maxWidth: 130
    },
    infoLight: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.overlineTextS,
        color: Colors.colors.white,
        opacity: 0.6,
        textTransform: 'uppercase'
    },
    infoDark: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.white
    },
    proImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
    },

    sectionHeader:{
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.bodyTextExtraS,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.lowContrast,
        marginTop:24,
        marginBottom:8
    },


    filterText: {
        fontFamily: 'Roboto-Regular',
        color: '#25345C',
        fontSize: 17,
        lineHeight: 18,
        letterSpacing: 0.8,
        textAlign: 'center',
    },

    filterScroll: {
        maxHeight: 450,
        paddingBottom: isIphoneX()? 34 : 24
    },
    filterBtn: {
        padding: 24,
        paddingTop: 0,
        paddingBottom: isIphoneX() ? 34 : 24,
    },


    filterIcon: {
        height: 24,
        width: 24,
        marginRight: 12,
        paddingLeft: 0,
        paddingRight: 0
    },


    filterHead: {
        width: '100%',
        alignItems: 'center',
        borderBottomColor: '#F5F5F5',
        borderBottomWidth: 1,
        paddingTop: 24,
        paddingBottom: 24,
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
    filterBody: {

    },
    multiList: {
        justifyContent: 'space-between',
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
        width: '90%'
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

});
export default connectPayment()(MyWalletScreen);
