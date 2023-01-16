import React, {Component} from "react";
import {Image, StatusBar, StyleSheet, Text, View, Platform } from "react-native";
import AwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {Body, Button, Container, Content, Header, Icon, Input, Item, Label, Left, Right, Title} from "native-base";
import {Screens} from "../../constants/Screens";
import {DEFAULT_AVATAR_COLOR, DEFAULT_IMAGE, ERROR_NOT_FOUND, S3_BUCKET_LINK} from '../../constants/CommonConstants';
import {addTestID, AlertUtil, isIphoneX, getHeaderHeight} from 'ch-mobile-shared';
import {ContentLoader} from "../../components/content-loader/ContentLoader";
import ProfileService from "../../services/Profile.service";
import GradientButton from '../../components/GradientButton';
import {connectConnections} from "../../redux";

const HEADER_SIZE = getHeaderHeight();


class ProviderSearchScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        const patient = navigation.getParam('patient', null);

        this.state = {
            isLoading: false,
            notFound: false,
            data: null,
            patient: patient,
            provider: null,
            isSearching: false,
            code: "",
            hasError: false,
            searchFocus: false
        };
        this.searchField = null;
    }


    goBack = () => {
        this.props.navigation.goBack();
    };


    render = () => {
        let isConnected = false, isRequested=false;
        if (!this.state.isLoading && !this.state.notFound && this.state.provider) {
            const filteredConnection = this.props.connections.activeConnections.filter(connection => connection.connectionId === this.state.provider.userId);
            isConnected = filteredConnection && filteredConnection.length > 0;
            isRequested = this.props.connections.requestedConnections.filter((contact) => {
                return contact.connectionId === this.state.provider.userId;
            }).length > 0;
        }
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <Container style={styles.container}>
                <Header noShadow style={styles.providerHeader}>
                    <StatusBar
                        backgroundColor={Platform.OS === 'ios'? null : "transparent"}
                        translucent
                        barStyle={'dark-content'}
                    />
                    <Left style={{alignSelf: 'flex-end'}}>
                        <Button
                            {...addTestID('Go=-Back')}
                            style={{width: 35, marginLeft: 12}} onPress={this.goBack} transparent>
                            <AwesomeIcon name="angle-left" size={32} color="#3fb2fe"/>
                        </Button>
                    </Left>
                    <Body style={{alignSelf: 'flex-end', flex: 3}}>
                        <Title style={styles.headerText}>Add Provider By Code</Title>
                    </Body>
                    <Right style={{alignSelf: 'flex-end'}}/>
                </Header>
                <Content style={styles.content}>
                    <Item
                        floatingLabel
                        style={this.state.searchFocus ? [styles.searchField, {borderColor: '#3fb2fe'}] : styles.searchField}
                        error={this.state.hasError > 0}
                        disabled={this.state.isLoading}>
                        <Label
                            style={this.state.hasError ? [styles.inputLabel, {color: '#f78795'}] : styles.inputLabel}>Provider
                            Code</Label>
                        <Input
                            {...addTestID('Search-Provider')}
                            style={styles.inputBox}
                            autoFocus={true}
                            ref={(field) => {
                                this.searchField = field;
                            }}

                            value={this.state.code}
                            onSubmitEditing={() => {
                                this.searchProvider();
                            }}
                            returnKeyType="search"
                            onChangeText={code => {
                                this.setState({code: code.trim()});
                            }}
                            onFocus={() => {
                                this.setState({searchFocus: true});
                            }}
                            onBlur={() => {
                                this.setState({searchFocus: false});
                            }}
                        />
                        {this.state.code !== "" && (
                            <Icon active
                                  onPress={() => {
                                      this.resetSearch();
                                  }}
                                  type="AntDesign" name='closecircleo'
                                  style={styles.searchIcon}/>
                        )}

                    </Item>
                    {this.state.isLoading && (
                        <View
                            style={{marginLeft: -25, overflow: 'hidden'}}
                        >
                            <ContentLoader type={'provider-search-card'}/>
                        </View>
                    )}
                    {this.state.notFound && (
                        <View style={styles.notFoundCard}>
                            <AwesomeIcon style={styles.notFoundIcon} name="frown-o" size={40} color="#f78795"/>
                            <Text style={styles.notFoundMainText}>No results for your search</Text>
                            <Text style={styles.notFoundSecText}>Please try again and make sure
                                the code is correct.</Text>
                        </View>
                    )}
                    {
                        !this.state.isLoading && !this.state.notFound && this.state.provider && (
                            <View style={styles.foundWrapper}>
                                <View style={styles.top}>


                                    {this.state.provider.profileImage?
                                        <Image
                                            style={styles.proImage}
                                            source={{uri: this.state.provider.profileImage ? this.state.provider.profileImage : S3_BUCKET_LINK + DEFAULT_IMAGE}}
                                        />
                                        :
                                        <View style={{
                                            ...styles.proBgMain,
                                            backgroundColor: this.state.provider.colorCode?this.state.provider.colorCode:DEFAULT_AVATAR_COLOR
                                        }}><Text
                                            style={styles.proLetterMain}>{this.state.provider.fullName.charAt(0).toUpperCase()}</Text></View>
                                    }
                                    <View style={{flex: 1}}>
                                        <Text style={styles.providerName}>{this.state.provider.fullName}</Text>
                                        <Text style={styles.specialty}>{this.state.provider.designation ? this.state.provider.designation : 'Therapist'}</Text>
                                    </View>
                                </View>
                                <View style={{alignItems: 'center'}}>
                                    <GradientButton
                                        testId = "connection"
                                        disabled={isRequested}
                                        onPress={() => {
                                            if(!isRequested) {
                                                this.connect(!isConnected);
                                            }
                                        }}
                                        text={isConnected ? "GO TO CHAT" : isRequested?"Connection Requested":"Get Connected"}
                                    />
                                    <Button
                                        {...addTestID('See-Profile')}
                                        transparent
                                            style={styles.seeProfileBtn}
                                            onPress={() => {
                                                this.openProfile();
                                            }}>
                                        <Text style={styles.seeProfileText}>SEE PROFILE</Text>
                                    </Button>
                                </View>
                            </View>
                        )
                    }
                </Content>
            </Container>
        );
    };

    connect = (shouldAdd) => {

        if (shouldAdd) {
            const provider = {
                avatar: this.state.provider.profileImage,
                profilePicture:this.state.provider.profileImage,
                speciality:this.state.provider.speciality,
                contactId: this.state.provider.userId,
                contactType: this.state.provider.type,
                userId: this.state.provider.userId,
                name: this.state.provider.fullName,
                type: this.state.provider.type,
                colorCode:!this.state.provider.profileImage?this.state.provider.colorCode:null,
                designation : this.state.provider?.designation
            };

            this.props.navigation.navigate(Screens.PROVIDER_ACCESS_SCREEN, {
                providerInfo: {...provider,speciality : provider.speciality.split(",")},
                patientInfo: this.state.patient,
            });
        } else {
            this.startChat();
        }

    };

    startChat = () => {
        const {provider} = this.state;
        const filteredConnection = this.props.connections.activeConnections.filter(connection => connection.connectionId === provider.userId);
        if (filteredConnection.length > 0) {
            const connection = filteredConnection[0];
            this.props.navigation.navigate(Screens.LIVE_CHAT_WINDOW_SCREEN, {
                provider: {
                    userId: provider.userId,
                    name: provider.fullName,
                    avatar: provider.profileImage,
                    profilePicture:provider.profileImage,
                    colorCode:!provider.profileImage?provider.colorCode:null,
                },
                patient: this.props.auth.meta,
                connection
            });
        }

    };

    openProfile = () => {
        const {provider} = this.state;
        this.props.navigation.navigate(provider.type === 'PRACTITIONER'?Screens.PROVIDER_DETAIL_SCREEN:Screens.MATCH_MAKER_DETAIL_SCREEN, {
            provider: {
                userId: provider.userId,
                name: provider.fullName,
                avatar: provider.profileImage,
                type:provider.type,
                profilePicture:provider.profileImage,
                colorCode:!provider.profileImage?provider.colorCode:null,
            },
            patient: this.props.auth.meta,
        });
    };

    resetSearch = () => {
        this.setState({
            isLoading: false,
            code: '',
            notFound: false,
            provider: null,
            hasError: ''
        });
        if (this.searchField && this.searchField._root) {
            this.searchField._root.focus();
        }
    };

    findConnectionDetails = (connectionId)=>{
        let connection = this.props.connections.activeConnections.filter(connection => connection.connectionId ===connectionId);
        if(connection && connection.length<1){
            connection = this.props.connections.pastConnections.filter(connection => connection.connectionId ===connectionId);
        }
        return connection;
    }

    searchProvider = async () => {
        if (this.state.code.length !== 6) {
            AlertUtil.showErrorMessage('Code must be 6 characters long');
            this.setState({hasError: true, provider: null});
            return;
        }
        this.setState({isLoading: true, hasError: false, notFound: false, provider: null});
        const provider = await ProfileService.searchProviderByCode(this.state.code);
        if (provider.errors) {
            const errorCode = provider.errors[0].errorCode;
            if (errorCode === ERROR_NOT_FOUND) {
                this.setState({isLoading: false, notFound: true});
            }
        } else {
            provider.profileImage = provider.profileImage ? S3_BUCKET_LINK + provider.profileImage : provider.profileImage;
            if(!provider.profileImage){
                const filteredConnection = this.findConnectionDetails(provider.userId);
                provider.colorCode = filteredConnection && filteredConnection.length>0 && filteredConnection[0].colorCode?filteredConnection[0].colorCode:DEFAULT_AVATAR_COLOR;
            }
            this.setState({provider, isLoading: false, notFound: false});
        }
    };
}

const styles = StyleSheet.create({
    foundWrapper: {
        marginTop: 20,
        alignSelf: 'center',
        width: '100%',
        padding: 24,
        backgroundColor: '#efefef',
        borderRadius: 9,
        borderWidth: 0.5,
        borderColor: '#eee',
        shadowColor: '#eee',
        shadowOffset: {width: 2, height: 2},
        shadowOpacity: 0.01,
        elevation: 1
    },
    top: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    proImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginRight: 15
    },
    providerName: {
        color: '#25345c',
        fontFamily: 'Roboto-Regular',
        fontWeight: '500',
        fontSize: 15,
        marginBottom: 4,
        width: 'auto',
        paddingRight: 10
    },
    specialty: {
        color: '#646c73',
        fontFamily: 'Roboto-Regular',
        fontWeight: '300',
        fontSize: 15,
        width: '90%'
    },
    seeProfileBtn: {
        width: '100%',
        borderRadius: 6,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#3fb2fe',
        justifyContent: 'center'
    },
    seeProfileText: {
        color: '#3fb2fe',
        fontFamily: 'Roboto-Bold',
        fontSize: 13,
        letterSpacing: 0.7,
        lineHeight: 19.5
    },
    container: {
        flex: 1,
        flexDirection: "column"
    },
    providerHeader: {
        backgroundColor: "#fff",
        marginBottom: 0,
        elevation: 0,
        height: HEADER_SIZE,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5'
    },
    headerText: {
        color: "#30344D",
        fontFamily: "Roboto-Regular",
        fontWeight: "600",
        fontSize: 20,
        marginBottom: 8,
        alignSelf: 'center'
    },
    content: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 20
    },
    searchField: {
        fontFamily: 'Roboto-Regular',
        color: '#30344D',
        marginBottom: 5,
        elevation: 0,
        borderBottomWidth: 1
    },
    inputLabel: {
        fontFamily: 'Roboto-Regular',
        color: '#b3bec9',
        fontSize: 15,
        lineHeight: 16,
        paddingLeft: 0,
        top: 0,
        paddingTop: 15
    },
    inputBox: {
        color: '#515d7d',
        height: 63,
        fontSize: 15,
        paddingLeft: 0
    },
    searchIcon: {
        top: 2,
        color: '#b3bec9',
        paddingRight: 0,
        fontSize: 24
    },
    notFoundCard: {
        marginTop: 20,
        alignSelf: 'center',
        width: '100%',
        padding: 24,
        backgroundColor: '#fff',
        borderRadius: 9,
        borderWidth: 0.5,
        borderColor: '#eee',
        shadowColor: '#eee',
        shadowOffset: {width: 2, height: 2},
        shadowOpacity: 0.01,
        elevation: 1
    },
    notFoundIcon: {
        alignSelf: 'center',
        margin: 25
    },
    notFoundMainText: {
        alignSelf: 'center',
        fontSize: 14,
        fontFamily: "Roboto-Bold",
        color: '#515d7d',
        textTransform: 'uppercase',
        lineHeight: 21,
        marginBottom: 8,
        textAlign: 'center'
    },
    notFoundSecText: {
        alignSelf: 'center',
        fontSize: 15,
        lineHeight: 22,
        color: '#646c73',
        fontFamily: "Roboto-Regular",
        textAlign: 'center'
    },
    proBgMain:{
        width: 64,
        height: 64,
        borderRadius: 32,
        marginRight: 15,
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
});
export default connectConnections()(ProviderSearchScreen);
