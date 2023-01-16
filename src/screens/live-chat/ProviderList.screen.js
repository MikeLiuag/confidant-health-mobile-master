import React, {Component} from 'react';
import {FlatList, Image, StatusBar, StyleSheet, TouchableOpacity, View, Platform, Linking} from 'react-native';
import AwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {Body, Button, Container, Content, Header, Left, Right, Text, Title} from 'native-base';
import {addTestID, AlertUtil, ContentfulClient, isIphoneX, getHeaderHeight} from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';
import {CONFIDANT_CALL_NUMBER, CONFIDANT_HELP_EMAIL, CONFIDANT_TEXT_NUMBER, DEFAULT_IMAGE, HEADER_NORMAL, HEADER_X, NICK_NAME,
    S3_BUCKET_LINK, USER_ID} from '../../constants/CommonConstants';
import {ContentLoader} from '../../components/content-loader/ContentLoader';
import ProfileService from '../../services/Profile.service';
import GradientButton from '../../components/GradientButton';
import Modal from 'react-native-modalbox';
import LinearGradient from 'react-native-linear-gradient';
import Analytics from "@segment/analytics-react-native";

const HEADER_SIZE = getHeaderHeight();
export default class ProviderListScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.state = {
            isLoading: true,
            data: null,
            patient: null,
            isSearching: false,
            searchQuery: '',
        };
        this.userId = navigation.getParam(USER_ID, null);
        this.nickName = navigation.getParam(NICK_NAME, null);
        this.organizationId = navigation.getParam('organizationId', null);
        this.organizationName = navigation.getParam('organizationName', null);
    }

    componentDidMount() {
        Analytics.screen(
            'Provider List Screen'
        );
    }

    toggleSearching = () => {
        this.state.isSearching = !this.state.isSearching;
        this.setState({isSearching: this.state.isSearching});
        if (!this.state.isSearching) {
            this.setState({searchQuery: ''});
        }
    };


    getMatchMakersList = async () => {
        const matchmakers = await ProfileService.getAllMatchMakers();
        if (matchmakers.errors) {
            AlertUtil.showErrorMessage(matchmakers.errors[0].endUserMessage);
            this.setState({isLoading: false, data: null});
        } else {
            const matchmakersData = await Promise.all(await matchmakers.map(async provider => {
                    const publicData = await this.getMatchmakerDetail(provider.userId);
                    provider.description = publicData.description;
                    if (provider.profileImage && provider.profileImage !== '') {
                        provider.profileImage = S3_BUCKET_LINK + provider.profileImage;
                    } else {
                        provider.profileImage = null;
                    }
                    return provider;
                },
            ));


            this.setState({
                isLoading: false, data: matchmakersData,
            });
        }
    };

    getMatchmakerDetail = async (userId) => {
        let contentType = {
            'content_type': 'providerDetails',
            'fields.providerId': userId,
        };
        const data = {
            description: '',
        };
        const entries = await ContentfulClient.getEntries(contentType);
        if (entries && entries.total > 0) {
            data.description = entries.items[0].fields && entries.items[0].fields.backstory ? entries.items[0].fields.backstory.trim() : '';
        }
        return data;
    };


    componentDidMount = () => {
        this.getMatchMakersList();
    };

    showProviderDetails(provider) {
        this.props.navigation.navigate(Screens.MATCH_MAKER_DETAIL_SCREEN, {
            provider: {
                userId: provider.userId,
                name: provider.fullName,
                avatar: provider.profileImage,
            },
            patient: this.state.patient,
        });
    }

    goBack = () => {
        this.props.navigation.goBack();
    };

    helpDrawerClose = () => {
        this.refs?.modalContact.close();
    };

    render = () => {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <Container style={styles.container}>
                {/* Header --- Start */}
                <Header noShadow transparent style={styles.providerHeader}>
                    <StatusBar
                        backgroundColor={Platform.OS === 'ios' ? null : 'transparent'}
                        translucent
                        barStyle={'dark-content'}
                    />
                    <Left>
                        <Button style={{width: 30, marginLeft: 15}} onPress={this.goBack} transparent>
                            <AwesomeIcon name="angle-left" size={32} color="#3fb2fe"/>
                        </Button>
                    </Left>
                    <Body style={styles.headerRow}>
                        <Title style={styles.headerText}>Matchmakers</Title>
                    </Body>
                    <Right/>
                </Header>
                <Content>
                    {this.state.isLoading ? (
                        <View style={{flex: 1, overflow: 'hidden', width: '90%'}}>
                            <ContentLoader type="provider-search-card" numItems="14"/>
                        </View>
                    ) : (
                        <View>
                            <Text style={styles.matchHeading}>We’ve selected these {this.state.data.length}{' '}
                                matchmakers for you:</Text>
                            <FlatList
                                data={this.state.data}
                                style={styles.list}
                                renderItem={({item, index}) => (
                                    <TouchableOpacity
                                        {...addTestID('Provider-Details- ' + (index+1))}
                                        activeOpacity={0.8}
                                        style={styles.singleItem}
                                        onPress={() => this.showProviderDetails(item)}
                                    >
                                        <View style={styles.avatarContainer}>
                                            <Image
                                                {...addTestID('Profile-Image- ' + (index+1))}
                                                style={styles.avatarImage}
                                                source={{uri: item.profileImage ? item.profileImage : S3_BUCKET_LINK + DEFAULT_IMAGE}}
                                            />
                                            {/*<View*/}
                                            {/*    style={item.connectionStatus === 'online' ? styles.online : styles.offline}*/}
                                            {/*/>*/}
                                        </View>
                                        <View style={styles.contact}>
                                            <Text style={styles.contactUsername}>{item.fullName}</Text>
                                            <Text style={styles.subText}>
                                                {/*{this.organizationName}*/}
                                                {item.description}
                                            </Text>
                                            <Button
                                                {...addTestID('View-Profile- ' + (index+1))}
                                                transparent
                                                    onPress={() => this.showProviderDetails(item)}
                                                    style={styles.viewProBtn}>
                                                <Text style={styles.proBtnText}>View Profile</Text>
                                            </Button>
                                        </View>

                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </View>

                    )}

                    <View style={styles.desBox}>
                        <Text style={styles.desText}>Don’t see someone you immediately connect with? We have plenty
                            more.</Text>
                        <GradientButton
                            testId = "contact-confidant"
                            text="Contact Confidant"
                            onPress={() => {
                                this.refs?.modalContact?.open();
                            }}
                        />
                    </View>
                </Content>

                <Modal
                    backdropPressToClose={true}
                    backdropColor="rgba(37,52,92,0.35)"
                    backdropOpacity={1}
                    onClosed={this.helpDrawerClose}
                    style={styles.modal}
                    entry={'bottom'}
                    position={'bottom'} ref={'modalContact'} swipeArea={100}>
                    <View style={{width: '100%'}}>
                        <Text style={styles.contactHeader}>Contact Confidant</Text>
                        <LinearGradient
                            start={{x: 0, y: 1}}
                            end={{x: 1, y: 0}}
                            colors={['#4FACFE', '#34b6fe', '#00C8FE']}
                            style={styles.gButton}
                        >
                            <Button
                                {...addTestID('Email-Confidant')}
                                transparent
                                    style={styles.fabBtn}
                                    onPress={() => Linking.openURL('mailto:' + CONFIDANT_HELP_EMAIL + '')}

                            >
                                <Text style={styles.fabBtnText}>Email Confidant</Text>
                            </Button>
                        </LinearGradient>
                        <LinearGradient
                            start={{x: 0, y: 1}}
                            end={{x: 1, y: 0}}
                            colors={['#4FACFE', '#34b6fe', '#00C8FE']}
                            style={styles.gButton}
                        >
                            <Button
                                {...addTestID('Call-Confidant')}
                                transparent
                                    style={styles.fabBtn}
                                    onPress={() => Linking.openURL('tel:' + CONFIDANT_CALL_NUMBER + '')}

                            >
                                <Text style={styles.fabBtnText}>Call Confidant</Text>
                            </Button>
                        </LinearGradient>
                        <LinearGradient
                            start={{x: 0, y: 1}}
                            end={{x: 1, y: 0}}
                            colors={['#4FACFE', '#34b6fe', '#00C8FE']}
                            style={styles.gButton}
                        >
                            <Button
                                {...addTestID('Text-Confidant')}
                                transparent
                                    style={styles.fabBtn}
                                    onPress={() => Linking.openURL('sms:' + CONFIDANT_TEXT_NUMBER + '')}

                            >
                                <Text style={styles.fabBtnText}>Text Confidant</Text>
                            </Button>
                        </LinearGradient>
                    </View>
                </Modal>
            </Container>
        );
    };
}
const styles = StyleSheet.create({
    contactHeader: {
        color: '#25345c',
        fontSize: 20,
        lineHeight: 30,
        letterSpacing: 0.4,
        fontFamily: 'Roboto-Regular',
        textAlign: 'center',
        marginBottom: 24,
        paddingLeft: 18,
        paddingRight: 18,
    },
    outlineBtn: {
        borderColor: '#3fb2fe',
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: '#fff',
        height: 48,
        justifyContent: 'center',
        elevation: 0,
        marginBottom: 16,
    },
    outlineText: {
        color: '#3fb2fe',
        fontSize: 13,
        letterSpacing: 0.7,
        lineHeight: 19.5,
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    gButton: {
        width: '100%',
        borderRadius: 4,
        height: 48,
        marginBottom: 16,
    },
    fabBtn: {
        justifyContent: 'center',
    },
    fabBtnText: {
        color: '#fff',
        fontSize: 13,
        lineHeight: 19.5,
        textAlign: 'center',
        letterSpacing: 0.7,
        fontFamily: 'Roboto-Bold',
        textTransform: 'uppercase',
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#f5f5f5',
        borderTopWidth: 0.5,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingLeft: 24,
        paddingRight: 24,
        height: 300,
    },
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    providerHeader: {
        height: HEADER_SIZE,
        paddingLeft: 3,
        paddingRight: 0,
        elevation: 0,
        borderBottomColor: '#f5f5f5',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
    },
    headerRow: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    headerText: {
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        fontSize: 18,
        lineHeight: 24,
        letterSpacing: 0.3,
        alignSelf: 'center',
    },
    searchField: {
        fontFamily: 'Titillium-Web-Light',
        color: '#B3BEC9',
        fontSize: 14,
        fontWeight: '100',
        marginTop: 16,
        marginBottom: 10,
        marginLeft: 8,
        marginRight: 8,
        paddingLeft: 15,
        borderRadius: 4,
        borderColor: '#B7D2E5',
        backgroundColor: '#FFF',
    },
    matchHeading: {
        color: '#25345c',
        textAlign: 'center',
        fontSize: 24,
        lineHeight: 36,
        letterSpacing: 1,
        marginTop: 15,
        marginBottom: 35,
        fontFamily: 'Roboto-Regular',
    },
    list: {
        backgroundColor: '#FFF',
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 20,
    },
    singleItem: {
        borderWidth: 0,
        marginBottom: 16,
        borderColor: 'rgba(0,0,0, 0.15)',
        elevation: 0,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        shadowColor: 'rgba(0,0,0, 0.15)',
    },
    avatarContainer: {
        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: 150,
    },
    online: {
        backgroundColor: '#4CD964',
        width: 14,
        height: 14,
        borderRadius: 10,
        position: 'absolute',
        left: 55,
        top: 10,
        borderColor: '#fff',
        borderWidth: 1,
    },
    offline: {
        backgroundColor: '#D3D3D3',
        width: 14,
        height: 14,
        borderRadius: 10,
        position: 'absolute',
        left: 55,
        top: 10,
        borderColor: '#fff',
        borderWidth: 1,
    },
    stateGrey: {
        backgroundColor: '#EAEDF3',
        width: 14,
        height: 14,
        borderRadius: 10,
        position: 'absolute',
        left: 55,
        top: 10,
        borderColor: '#fff',
        borderWidth: 1,
    },
    contact: {
        backgroundColor: '#fff',
        padding: 16,
        borderBottomRightRadius: 8,
        borderBottomLeftRadius: 8,
        overflow: 'hidden',
    },
    contactUsername: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0.5,
        color: '#25345c',
        marginBottom: 8,
    },
    subText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 13,
        lineHeight: 19.5,
        letterSpacing: 0.5,
        color: '#646c73',
    },
    viewProBtn: {
        borderColor: '#3fb2fe',
        borderRadius: 4,
        borderWidth: 1,
        justifyContent: 'center',
        marginTop: 16,
    },
    proBtnText: {
        color: '#3fb2fe',
        fontSize: 13,
        lineHeight: 19.5,
        letterSpacing: 0.7,
        fontFamily: 'Roboto-Bold',
        fontWeight: '700',
        textAlign: 'center',
    },
    contactMetaContainer: {
        height: 60,
        paddingTop: 10,
        justifyContent: 'center',
    },
    contactMetaWrapper: {
        marginLeft: 15,
        marginRight: 8,
    },
    desBox: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 20,
    },
    desText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 14,
        color: '#25345C',
        lineHeight: 21,
        letterSpacing: 0.47,
        textAlign: 'center',
        marginTop: 25,
        paddingLeft: 15,
        paddingRight: 15,
        marginBottom: 24,
    },
    sendBn: {
        alignSelf: 'center',
        backgroundColor: '#3fb2fe',
    },
    sendTxt: {
        color: '#FFF',
        fontFamily: 'Roboto-Regular',
        fontSize: 12,
    },
    loadersty: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
});
