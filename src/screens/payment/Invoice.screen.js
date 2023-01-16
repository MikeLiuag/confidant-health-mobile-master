import React, {Component} from 'react';
import {StatusBar, StyleSheet, View, FlatList} from 'react-native';
import {Button, Left, Container, Content, Header, Body, Title, Right, Text} from 'native-base';
import {addTestID, isIphoneX, getHeaderHeight} from 'ch-mobile-shared';
import GradientButton from '../../components/GradientButton';
import  {HEADER_NORMAL, HEADER_X} from '../../constants/CommonConstants';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from "react-native-linear-gradient";
import {connectPayment} from '../../redux/modules/payment';

const DATA = [
    {
        title: 'Average Billed Cost',
        cost: '$0'
    },
    {
        title: 'Confidant Savings',
        cost: '$0'
    },
    {
        title: 'Your Cost',
        cost: '$100'
    },
];

const HEADER_SIZE = getHeaderHeight();

class InvoiceScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
        };

        this.serviceCost = this.props.navigation.getParam('serviceCost', null);

    }

    navigateBack() {
        this.props.navigation.goBack();
    }



    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return(
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={['#fff', '#fff', 'rgba(247, 249, 255, 0.5)']}
                    style={{flex: 1}}
                >
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
                        <Body style={{ flex: 2}}>
                            <Title style={styles.pageTitle}>Cost Breakdown</Title>
                        </Body>
                        <Right/>
                    </Header>
                    <Content contentContainerStyle={{padding: 24}}>
                        <FlatList
                            data={DATA}
                            renderItem={({ item , index}) =>
                                <View style={styles.singleItem}>
                                    <Text style={styles.invoiceTitle}>{item.title}</Text>
                                    <Text style={styles.invoiceTitle}>{item.title === 'Your Cost' ? '$'+this.serviceCost : item.cost}</Text>
                                </View>}
                            keyExtractor={(item, index) => item.key}
                        />
                        <View style={styles.invoiceList}>
                            <View style={styles.singleItem}>
                                <Text style={styles.invoiceTitle}>Insurance</Text>
                                <View style={styles.whyWrapper}>
                                    <Button
                                        {...addTestID('Why-btn')}
                                        transparent>
                                        <Text style={styles.whyText} uppercase={false}>Why?</Text>
                                    </Button>
                                    <Text style={styles.invoiceTitle}>-$0</Text>
                                </View>
                            </View>
                            <View style={styles.singleItem}>
                                <Text style={styles.invoiceTitle}>From Balance</Text>
                                <Text style={styles.invoiceTitle}>-$0</Text>
                            </View>
                            <View style={styles.singleItem}>
                                <Text style={styles.invoiceTotal}>Final Cost</Text>
                                <Text style={styles.invoiceCost}>${this.serviceCost ? this.serviceCost : '0'}</Text>
                            </View>
                        </View>

                    </Content>
                    <View style={styles.greBtn}>
                        <Button transparent style={styles.detailsBtn}>
                            <Text style={styles.detailsText} uppercase={false}>Need help? Talk to your matchmaker</Text>
                        </Button>
                        <GradientButton
                            testId = "add-funds"
                            onPress={() => {return false;}}
                            text="Add Funds"
                        />
                        <View style={styles.lockRow}>
                            <Icon name="lock" size={25} color="#b3bec9"/>
                            <Text style={styles.lockText}>Your Personal Information is Always Kept Secured</Text>
                        </View>
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
        borderBottomColor: 'rgba(0,0,0,0.05)',
        backgroundColor: '#fff',
        elevation: 0,
        justifyContent: 'flex-start',
        height: HEADER_SIZE,
    },
    backButton: {
        marginLeft: 15,
        width: 35
    },
    pageTitle: {
        textAlign: 'center',
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        fontSize: 18,
        lineHeight: 24,
        letterSpacing: 0.3,
    },
    invoiceList: {
        marginTop: 40
    },
    singleItem: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 52
    },
    invoiceTitle: {
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        lineHeight: 18.2,
        fontSize: 12,
        letterSpacing: 0.5
    },
    whyWrapper: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    whyText: {
        color: '#3fb2fe',
        fontFamily: 'Roboto-Regular',
        fontSize: 12,
        lineHeight: 18.2,
        letterSpacing: 0.5
    },
    invoiceCost: {
        color: '#77c70b',
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        lineHeight: 15,
        fontSize: 14,
        letterSpacing: 0
    },
    invoiceTotal: {
        color: '#25345c',
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        lineHeight: 18.2,
        fontSize: 13,
        letterSpacing: 0.5
    },
    detailsBtn: {
        alignSelf: 'center',
        marginBottom: 20
    },
    detailsText: {
        color: '#3fb2fe',
        fontSize: 14,
        letterSpacing: 0.5,
        textAlign: 'center'
    },
    lockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24
    },
    lockText: {
        color: '#969fa8',
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        lineHeight: 19.5,
        letterSpacing: 0,
        paddingLeft: 10
    },
    greBtn: {
        padding: 24,
        paddingBottom: isIphoneX()? 42 : 24
    }
});
export default connectPayment()(InvoiceScreen);
