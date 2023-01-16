import React, {Component} from 'react';
import {FlatList, Platform, StatusBar, StyleSheet} from 'react-native';
import {addTestID, AlertUtil, getHeaderHeight} from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';
import {Button, Container, Left, Body, Right, Content, Header, Text, View} from 'native-base';
import AwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {isIphoneX, isTelehealthConfigured} from 'ch-mobile-shared';
import ProfileService from '../../services/Profile.service';
import Loader from '../../components/Loader';
import GradientButton from '../../components/GradientButton';
import LinearGradient from "react-native-linear-gradient";

const HEADER_SIZE = getHeaderHeight();

export default class GroupRulesViewScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.connection = this.props.navigation.getParam('connection', null);
        this.state = {
            isLoading: true,
            ruleDetails: null
        };
    }

    async componentDidMount(): void {
        try {
            const groupsResponse = await ProfileService.getGroupDetails(this.connection.connectionId);
            if (groupsResponse.errors) {
                AlertUtil.showErrorMessage('Unable to join group session for now. Please try later.');
                console.warn(groupsResponse.errors);
                this.goBack();
            } else {
                if(groupsResponse.isAdmin) {
                    this.navigateToNext();
                } else {
                    if (groupsResponse.rulesEnabled
                        && groupsResponse.groupRuleSettings) {
                        this.setState({isLoading: false, ruleDetails: groupsResponse.groupRuleSettings});
                    } else {
                        this.navigateToNext();
                    }
                }
            }
        } catch (e) {
            AlertUtil.showErrorMessage('Unable to join group session for now. Please try later.');
            console.warn(e);
            this.goBack();
        }

    }

    navigateToNext = async () => {
        const isConfigured = await isTelehealthConfigured();
        this.props.navigation.replace(!isConfigured ? Screens.TELEHEALTH_WELCOME : Screens.GROUP_CALL_SCREEN, {
            connection: this.connection,
            groupCall: true,
        });
    };


    goBack = () => {
        this.props.navigation.goBack();
    };

    render() {
        StatusBar.setBarStyle('dark-content', true);
        if (this.state.isLoading) {
            return (<Loader/>);
        }
        return (
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={['#fff', 'rgba(247,249,255,0.5)', '#f7f9ff']}
                    style={{flex: 1}}
                >
                    <Header transparent style={styles.header}>
                        <StatusBar
                            backgroundColor={Platform.OS === 'ios' ? null : 'transparent'}
                            translucent
                            barStyle={'dark-content'}
                        />
                        <Left>
                            <Button
                                {...addTestID('back')}
                                transparent
                                style={styles.backButton}
                                onPress={() => {
                                    this.goBack();
                                }}
                            >
                                <AwesomeIcon name="angle-left" size={32} color="#3fb2fe"/>
                            </Button>
                        </Left>
                        <Body/>
                        <Right/>
                    </Header>
                    <Content contentContainerStyle={{ paddingBottom: 10, paddingLeft: 24, paddingRight: 24 }}>
                        <View style={styles.textBox}>
                            <Text {...addTestID('title')} style={styles.mainTitle}>Group {"\n"} Session Rules</Text>
                            <Text {...addTestID('description')} style={styles.descriptionText}>{this.state.ruleDetails.description}</Text>
                        </View>

                        <FlatList
                            data={this.state.ruleDetails.rules}
                            renderItem={({item, index})=>{

                                return (
                                    <View
                                        {...addTestID('rule-'+index+1)}
                                        style={styles.ruleItem} key={index+1+item.ruleId}>
                                        <Text style={styles.blueText}>{index+1} </Text>
                                        <Text style={styles.itemText} numberOfLines={2}>
                                            {item.description}
                                        </Text>
                                    </View>
                                )
                            }}
                        />

                    </Content>
                    <View style={styles.greBtn}>
                        <Text
                            {...addTestID("i-don't-agree")}
                            onPress={() => {
                            this.goBack();
                        }}
                              style={styles.blueBtnText}>I don't agree</Text>
                        <GradientButton
                            testId = "i-agree"
                            onPress={this.navigateToNext}
                            text="I Agree"
                        />
                    </View>
                </LinearGradient>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    header: {
        height: HEADER_SIZE,
        paddingLeft: 6
    },
    backButton: {
        marginLeft: 16,
        width: 45,
        paddingLeft: 0
    },
    titleText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 24,
        color: '#27355d',
        flex: 0.8,
        textAlign: 'center',
    },
    textBox: {
        justifyContent: 'center',
        paddingLeft: 20,
        paddingRight: 20
    },
    mainTitle: {
        fontFamily: 'Roboto-Regular',
        color: '#25345c',
        fontSize: 24,
        lineHeight: 32,
        letterSpacing: 1,
        textAlign: 'center',
        marginBottom: 24,
        marginTop: 24
    },
    descriptionText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 17,
        lineHeight: 25,
        letterSpacing: 0.8,
        color: '#27355d',
        textAlign: 'center',
        marginBottom: 40
    },
    ruleItem: {
        padding: 16,
        borderWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.07)',
        shadowColor: '#f5f5f5',
        shadowOffset: {
            width: 5,
            height: 10,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 0,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        borderRadius: 8,
        overflow: 'hidden'
    },
    itemText: {
        fontFamily: 'Roboto-Regular',
        color: '#25345c',
        fontSize: 13,
        // lineHeight: 18,
        letterSpacing: 0.5
    },
    blueText: {
        fontFamily: 'Roboto-Bold',
        color: '#3fb2fe',
        fontSize: 16,
        lineHeight: 18,
        letterSpacing: 0.57,
        marginRight: 16
    },
    blueBtnText: {
        fontFamily: 'Roboto-Regular',
        color: '#3fb2fe',
        fontSize: 15,
        lineHeight: 20,
        letterSpacing: 0,
        textAlign: 'center',
        marginBottom: 10
    },
    greBtn: {
        paddingTop: 15,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX()? 36 : 24
    },
});
