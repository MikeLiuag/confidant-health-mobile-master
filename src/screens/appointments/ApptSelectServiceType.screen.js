import React, {Component} from 'react';
import {StatusBar, StyleSheet, View, FlatList, Platform, Image,TouchableOpacity} from 'react-native';
import {Body, Button, Container, Content, Header, Left, Right, Text, Title} from 'native-base';
import {connectConnections} from "../../redux";
import {Screens} from '../../constants/Screens';
import {isIphoneX, AlfieLoader, AlertUtil, addTestID, getHeaderHeight, CommonStyles, TextStyles, Colors} from 'ch-mobile-shared';
import GradientButton from '../../components/GradientButton';
import LinearGradient from 'react-native-linear-gradient';
import AppointmentService from '../../services/Appointment.service';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import AntIcon from 'react-native-vector-icons/AntDesign';
import {BackButton} from "ch-mobile-shared/src/components/BackButton";

const HEADER_SIZE = getHeaderHeight();

class ApptSelectServiceTypeScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const { navigation } = this.props;
        this.isPatientProhibitive = navigation.getParam("isPatientProhibitive", false);
        this.state = {
            isLoading: true,
            selectedProvider: null,
            serviceTypes: [],
            listItems: [],
            filteredItems: [],
            showBack: true,
            stepperText: true,
            filterSelect: false,
            designationsList: [],
            selectedFilterType: null,
        };
    }

    async componentDidMount(): void {
        let response = await AppointmentService.getAllServiceTypes();
        if (response.errors) {
            AlertUtil.showErrorMessage(response.errors[0].endUserMessage);
            this.backClicked();
        } else {
            this.setState({serviceTypes: response.serviceTypes, isLoading: false});
        }
    }

    nextStep = (serviceType) => {
        this.props.navigation.navigate(Screens.APPT_SELECT_SERVICE_BY_TYPE_SCREEN, {
            serviceType,
            isPatientProhibitive:this.isPatientProhibitive
        });
    };

    backClicked = () => {
        this.props.navigation.goBack();
    };


    getServiceTypeImage = (serviceName)=>{
        switch (serviceName) {
            case "Evaluation": return require('../../assets/images/evaluation.png')
            case "Medication": return require('../../assets/images/medication.png')
            case "Care Navigation": return require('../../assets/images/care-navigation.png')
            case "Coaching": return require('../../assets/images/coaching.png')
            case "Therapy": return require('../../assets/images/therapy.png')
            default : return require('../../assets/images/General.png')

        }
    }

    renderServiceTypeCard = (item) => {
        return (
            <View>
                <Image
                    resizeMode={'contain'}
                    {...addTestID('service-type-png')} style={styles.itemImage}
                       source={this.getServiceTypeImage(item.name)}/>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDes}>{item.description}</Text>
                <Text style={styles.itemCount}>{item.serviceByTypeCount} services</Text>
            </View>
        );
    };

    render = () => {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        if (this.state.isLoading) {
            return (<AlfieLoader/>);
        }
        return (
            <Container>
                <LinearGradient
                    start={{x: 1, y: 1}}
                    end={{x: 1, y: 0}}
                    colors={['#fff', '#fff', '#f7f9ff']}
                    style={{flex: 1}}
                >
                    <Header noShadow={false} transparent style={styles.header}>
                        <StatusBar
                            backgroundColor={Platform.OS === 'ios' ? null : 'transparent'}
                            translucent
                            barStyle={'dark-content'}
                        />
                        <Left>
                            <View style={styles.backButton}>
                                <BackButton
                                    {...addTestID('back-btn')}
                                    onPress={this.backClicked}
                                />
                            </View>
                        </Left>
                        <Body style={styles.headerRow}>
                            <Title
                                {...addTestID('select-serviceType-header')}
                                style={styles.headerText}>Select service type</Title>
                        </Body>
                        <Right style={Platform.OS === 'ios' ? null : {flex: 0.5}}>
                            {/*<AntIcon name="questioncircleo" size={24} color={Colors.colors.mainBlue}*/}
                            {/*         style={styles.questionIcon}/>*/}
                        </Right>
                    </Header>
                    <Content
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{paddingBottom: 40}}>
                        <View style={styles.list}>
                            {this.state.serviceTypes.length === 0 && (
                                <View>
                                    <Text style={styles.noRecordText}>No Service Types Found</Text>
                                </View>
                            )}

                            <FlatList
                                showsVerticalScrollIndicator={false}
                                data={this.state.serviceTypes}
                                renderItem={({item, index}) => (
                                    <TouchableOpacity
                                        {...addTestID('Service type details - ' + (index+1))}
                                        activeOpacity={0.8}
                                        onPress={() => this.nextStep(item.name)}
                                    >
                                    <View
                                        style={styles.singleCard}
                                        {...addTestID('Select-service-type-' + (index + 1))}
                                        activeOpacity={0.8}
                                    >
                                        {this.renderServiceTypeCard(item)}
                                    </View>
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </View>
                    </Content>
                </LinearGradient>
            </Container>
        );
    };
}


const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingLeft: 0,
        paddingRight: 0,
        height: HEADER_SIZE,
        ...CommonStyles.styles.headerShadow
    },
    list: {
        padding: 24,
    },
    noRecordText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.mediumContrast,
        textAlign: 'center',
    },
    singleCard: {
        borderRadius: 8,
        elevation: 2,
        marginBottom: 16,
        padding: 24,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#f5f5f5',
        shadowColor: 'rgba(37, 52, 92, 0.1)',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowRadius: 8,
        shadowOpacity: 1.0,
        // overflow: 'hidden'
    },
    itemImage :{
        marginBottom:24,
        width: 80,
        height: 80
    },
    itemName: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 8
    },
    itemDes: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.mediumContrast,
        marginBottom: 8
    },
    itemCount: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.lowContrast,
        marginBottom: 8
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
    questionIcon: {
        marginRight: 22,
        paddingLeft: 0,
        paddingRight: 0
    }
});

export default connectConnections()(ApptSelectServiceTypeScreen);
