import React, {Component} from 'react';
import { StatusBar, StyleSheet, View} from 'react-native';
import {Button, Left, Body, Right, Title, Container, Content, Header} from 'native-base';
import { addTestID, isIphoneX, getHeaderHeight } from 'ch-mobile-shared';
import GradientButton from '../../components/GradientButton';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from "react-native-linear-gradient";
import {Screens} from '../../constants/Screens';
import CreditCardsListComponent from '../../components/payment/CreditCardsListComponent';
import {connectPayment} from "../../redux";
import Analytics from "@segment/analytics-react-native";

const HEADER_SIZE = getHeaderHeight();

class CardListScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.showDeleteSection = navigation.getParam('showDeleteSection', null);
        this.state = {
            deleteBtn: true
        };
    }

    deleteCard = (cardId) =>{
        this.props.deleteCard({payload: cardId});
    }


    navigateBack() {
        this.props.navigation.goBack();
    }
    addCardScreen = () => {
        this.props.navigation.navigate(Screens.PAYMENT_SCREEN,{
            showAddCardScreen: true,
            ...this.props.navigation.state.params
        });
    }

    async componentDidMount(): void {
        await Analytics.screen(
            'Card List Screen'
        );
        this.props.fetchCardsList();
    }

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return(
            <Container>
                <Header transparent style={styles.header}>
                    <StatusBar
                        backgroundColor="transparent"
                        barStyle="dark-content"
                        translucent
                    />
                    <Left>
                        <Button
                            {...addTestID('Back')}
                            onPress={() => this.navigateBack()}
                            transparent
                            style={styles.backButton}>
                            <Icon name="angle-left" size={32} color="#3fb2fe"/>
                        </Button>
                    </Left>
                    <Body style={{ flex: 2}}><Title style={styles.paymentTitle}>Payment Method(s)</Title></Body>
                    <Right>
                        {/*<Button transparent
                                onPress={this.showDelete}
                        >
                            <Text style={styles.editText}>Edit</Text>
                        </Button>*/}
                    </Right>
                </Header>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={['#fff', '#fff', '#f7f9ff']}
                    style={{flex: 1}}
                >
                    <Content>
                        <CreditCardsListComponent
                            showDeleteSection={this.showDeleteSection}
                            cardListData={this.props.payment.cardsList}
                            isLoading={this.props.payment.isLoading}
                            deleteCard={this.deleteCard}/>
                    </Content>

                    <View style={styles.greBtn}>
                        <GradientButton
                            testId = "add-payment-method"
                            onPress={this.addCardScreen}
                            text="Add payment method"
                        />
                    </View>
                </LinearGradient>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingLeft: 3,
        borderBottomColor: '#f9f9f9',
        elevation: 0,
        justifyContent: 'flex-start',
        height: HEADER_SIZE,
        backgroundColor: '#fff'
    },
    backButton: {
        marginLeft: 15,
        width: 35
    },
    paymentTitle: {
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        fontSize: 18,
        letterSpacing: 0.3,
        fontWeight: '400',
        textAlign: 'center'
    },
    editText: {
        color: '#3fb2fe',
        fontFamily: 'Roboto-Regular',
        fontWeight: '600',
        fontSize: 14,
        letterSpacing: 0.3
    },
    cardList: {},
    singleCard: {
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: 'rgba(0,0,0,0.07)',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 10,
        shadowOpacity: 0.8,
        elevation: 1,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 17,
        overflow: 'hidden'
    },
    cardImg: {
        width: 38,
        height: 30,
        marginTop: 17,
        marginBottom: 17
    },
    cardDes: {
        flex: 2,
        paddingLeft: 24
    },
    cardName: {
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        lineHeight: 13,
        fontSize: 13,
        letterSpacing: 0.28,
        marginBottom: 4
    },
    cardNum: {
        color: '#969fa8',
        fontSize: 13,
        lineHeight: 13,
        letterSpacing: 0.28,
        fontFamily: 'Roboto-Regular'
    },
    dltBtn: {
        backgroundColor: '#d0021b',
        height: 65,
    },
    dltText: {
        color: '#fff',
        fontFamily: 'Roboto-Regular',
        fontWeight: '600',
        fontSize: 14,
        letterSpacing: 0.3
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX()? 36 : 24
    },
    detailText: {
        color: '#3fb2fe',
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 0.5,
        textAlign: 'center',
        marginBottom: 30
    }
});

export default connectPayment()(CardListScreen);
