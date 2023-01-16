import React, {Component} from 'react';
import {FlatList, Image, StatusBar, StyleSheet, AppState } from 'react-native';
import {Container, Content, Header, Text, View, Button} from 'native-base';
import {addTestID, isIphoneX, SliderSearch, getHeaderHeight} from 'ch-mobile-shared';
import LinearGradient from 'react-native-linear-gradient';
import {connectConnections} from "../../redux";
import {Screens} from '../../constants/Screens';
import LottieView from "lottie-react-native";
import alfie from "../../assets/animations/Dog_with_Can";
import { createStyles, maxWidth } from 'react-native-media-queries';

const HEADER_SIZE = getHeaderHeight();

const DATA = [
    {
        name: 'Telehealth Consultation',
        cost: '$50',
        icon: 'tele-consultation',
        color: '#d52952',
        formUrl: 'https://confidanthealth.typeform.com/to/r7GIQn'
    },
    {
        name: 'Telehealth Evaluation',
        cost: '$75',
        icon: 'tele-evaluation',
        color: '#195c9d',
        formUrl: 'https://confidanthealth.typeform.com/to/I26AB28y'
    },
    {
        name: 'In-Home Evaluation',
        cost: '$130',
        icon: 'in-home-evaluation',
        color: '#5f3d9a',
        formUrl: 'https://confidanthealth.typeform.com/to/YosAb1d6'
    },
    {
        name: 'In-Home MAT Assessment',
        cost: '$150',
        icon: 'in-home-MAT',
        color: '#f34b06',
        formUrl: 'https://confidanthealth.typeform.com/to/wsDHR4'
    },
    {
        name: 'Naloxone Prescription',
        cost: '$40',
        icon: 'naloxone',
        color: '#b95844',
        formUrl: 'https://confidanthealth.typeform.com/to/J5AOpgL1'
    },
    {
        name: 'Naltrexone Prescription',
        cost: '$75',
        icon: 'naltrexone',
        color: '#2e6b56',
        formUrl: 'https://confidanthealth.typeform.com/to/ueYF6RzF'
    },
];


class ServiceListScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            services: DATA,
            appState: AppState.currentState,
        };
    }

    componentDidMount(): void {
        AppState.addEventListener('change', this._handleAppState);
    }

    componentWillUnmount(): void {
        AppState.removeEventListener('change', this._handleAppState);
    }

    _handleAppState = () => {
        if(this.state.appState === 'active') {
            if(this.animation) {
                this.animation.play();
            }
        }
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    resolveIcon = (icon)=>{
        switch (icon) {
            case 'tele-consultation':
                return require('../../assets/images/tele-consultation.png');
            case 'tele-evaluation':
                return require('../../assets/images/tele-evaluation.png');
            case 'in-home-evaluation':
                return require('../../assets/images/inHome-evaluation.png');
            case 'in-home-MAT':
                return require('../../assets/images/inHome-MAT-assess.png');
            case 'naloxone':
                return require('../../assets/images/naloxone-perscription.png');
            case 'naltrexone':
                return require('../../assets/images/naltrexone-prescription.png');
            default:
                return require('../../assets/images/tele-consultation.png');
        }
    };

    navigateToTypeform = (item)=>{
        this.props.navigation.navigate(Screens.TYPE_FORM_SCREEN, {
            name: item.name,
            formUrl: item.formUrl
        });
    };

    propagate=(services)=>{
        this.setState({services});
    };

    emptyService = () => {
        return(
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
                <Text style={styles.emptyTextMain}>No Service Found</Text>
                <Text style={styles.emptyTextDes}>You do not have any service available right now. If you don’t think this is right, you can let us know by emailing help@confidanthealth.com and we’ll check it out for you.</Text>
            </View>
        )
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={['#fff', '#F7F9FF', '#F7F9FF']}
                    style={{flex: 1}}
                >
                    <Header transparent style={styles.header}>
                        <StatusBar
                            backgroundColor="transparent"
                            barStyle="dark-content"
                            translucent
                        />
                        <SliderSearch
                            options={{
                                screenTitle: 'Services We Provide',
                                searchFieldPlaceholder: 'Search Service',
                                listItems: DATA,
                                filter: (listItems, query) => {
                                    return listItems.filter(service =>
                                        service.name
                                            .toLowerCase()
                                            .includes(query.toLowerCase().trim())
                                    );
                                },
                                showBack: false,
                                backClicked: this.backClicked,
                            }}
                            propagate={this.propagate}
                        />

                    </Header>
                    <Content contentContainerStyle={{paddingBottom: 40}}>
                        <View style={styles.serviceInfo}>
                            <Text
                                {...addTestID('request-service')}
                                style={styles.serviceTitle}>Request a Service</Text>
                            <Text
                                {...addTestID('service-description')}
                                style={styles.serviceSubTitle}>After you request a service, one of our matchmakers will connect you with the best provider in our network for you.</Text>
                        </View>


                        <FlatList
                            data={this.state.services}
                            style={styles.serviceList}
                            renderItem={({item, index}) => {
                                // const icon = require(item.icon);
                                return (
                                    <View style={mediaStyles.shadowBase}>
                                        <View key={index} style={ mediaStyles.cardShadow}>
                                            <View
                                                {...addTestID('service-'+ (index+1))}
                                                key={index + 'inner-to'}
                                                style={mediaStyles.singleCard}>


                                                <Image
                                                    source={this.resolveIcon(item.icon)}
                                                    resizeMode={'cover'}
                                                    style={mediaStyles.cardImg}
                                                />
                                                <View style={mediaStyles.contentWrapper}>
                                                    <Text style={[styles.serCost, { color: (item.color)}]}>{item.cost}</Text>
                                                    <Text style={mediaStyles.serTitle}>{item.name}</Text>
                                                    <Button
                                                        onPress={()=>{this.navigateToTypeform(item)}}
                                                        style={[styles.bookBtn, { backgroundColor: (item.color)}]}>
                                                        <Text uppercase={false} style={styles.bookBtnText}>Book Appointment</Text>
                                                    </Button>
                                                </View>

                                            </View>
                                        </View>
                                    </View>);
                            }
                            }
                            keyExtractor={item => item.id}
                            ListEmptyComponent={this.emptyService}
                        />

                    </Content>

                </LinearGradient>
            </Container>
        );
    };
}

const base = {
    contentWrapper: {
        padding: 24
    },
    singleCard: {
        height: 246,
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        borderRadius: 9,
        // marginBottom: -5
    },
    cardShadow: {
        borderRadius: 8,
        shadowColor: 'transparent',
        shadowOffset: {
            width: 10,
            height: 5,
        },
        shadowOpacity: 0.8,
        shadowRadius: 3,
        elevation: 0,
        backgroundColor: '#fff'
    },
    shadowBase: {
        overflow: 'hidden',
        paddingBottom: 40,
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 70,
        marginBottom: -40
    },
    cardImg: {
        position: 'absolute',
        width: '100%',
        height: 256,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    serTitle: {
        fontFamily: 'Roboto-Regular',
        fontWeight: '500',
        color: '#494469',
        fontSize: 20,
        lineHeight: 27,
        letterSpacing: 0.56,
        marginBottom: 24,
        maxWidth: 150
    },
};

const styles = StyleSheet.create({
    serCost: {
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        color: '#d52952',
        fontSize: 15,
        letterSpacing: 0.58,
        marginBottom: 16
    },
    bookBtn: {
        backgroundColor: '#d52952',
        borderRadius: 4,
        width: 165,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    bookBtnText: {
        color: '#FFF',
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        alignSelf: 'center',
        fontSize: 14,
        letterSpacing: 0.5
    },
    emptyView: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // paddingTop: 20,
        paddingBottom: 20
    },
    emptyAnim: {
        width: '90%',
        alignSelf: 'center',
        paddingLeft: 20,
        marginTop: -20,
        marginBottom: -20
    },
    emptyTextMain: {
        color: '#25345C',
        fontFamily: 'Roboto-Bold',
        fontWeight: '600',
        alignSelf: 'center',
        fontSize: 15,
        letterSpacing: 0.5,
        lineHeight: 15,
        marginBottom: 20
    },
    emptyTextDes: {
        color: '#969FA8',
        fontFamily: 'Roboto-Regular',
        alignSelf: 'center',
        fontSize: 14,
        letterSpacing: 0,
        lineHeight: 21,
        paddingLeft: 30,
        paddingRight: 30,
        textAlign: 'center'
    },
    serviceInfo: {
        alignItems: 'center',
        paddingTop: 15,
        paddingBottom: 16,
        paddingLeft: 15,
        paddingRight: 15,
    },
    serviceTitle: {
        fontFamily: 'Roboto-Regular',
        // fontWeight: '500',
        color: '#25345C',
        letterSpacing: 1,
        fontSize: 24,
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 24,
    },
    serviceSubTitle: {
        fontFamily: 'Roboto-Regular',
        // fontWeight: '500',
        color: '#25345C',
        fontSize: 15,
        lineHeight: 22.5,
        letterSpacing: 0.32,
        marginBottom: 8,
        textAlign: 'center',
        paddingLeft: 20,
        paddingRight: 20
    },
    touchableOpacityStyle: {
        position: 'absolute',
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        right: 20,
        bottom: isIphoneX() ? 40 : 20,
    },
    searchBG: {
        width: 55,
        height: 55,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filerIcon: {
        // display: 'none',
        width: 54,
        height: 54,
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#CBCCDC',
    },
    header: {
        height: HEADER_SIZE,
        borderBottomColor: '#F7F9FF',
        borderBottomWidth: 1,
        backgroundColor: '#F7F9FF',
        paddingLeft: 16,
    },
    serviceList: {
        padding: 24,
    },
    singleService: {
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 16,
        paddingBottom: 16,
        borderWidth: 0.5,
        borderColor: 'rgba(0,0,0,0.07)',
        shadowColor: 'rgba(0,0,0,0.07)',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        elevation: 0,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    imgView: {},
    serviceImg: {
        width: 40,
    },
    textWrapper: {
        paddingLeft: 24,
        flex: 2,
        justifyContent: 'center',
    }
});

const mediaStyles = createStyles(
    base,

    // override styles only if screen width is less than 400
    maxWidth(400, {
        contentWrapper: {
            padding: 20
        },
        singleCard: {
            height: 226,
        },
        cardImg: {
            height: 230
        },
        serTitle: {
            marginBottom: 16
        }
    }),
    maxWidth(360, {
        contentWrapper: {
            padding: 20
        },
        singleCard: {
            height: 195
        },
        cardShadow: {
            shadowColor: '#c0c7d9',
            elevation: 7,
            zIndex: 999,
            marginBottom: 16,
        },
        cardImg: {
            height: 230
        }
    })
);


export default connectConnections()(ServiceListScreen);
