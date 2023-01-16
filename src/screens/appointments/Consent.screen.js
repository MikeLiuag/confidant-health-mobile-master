import React, {Component} from 'react';
import {StatusBar, StyleSheet, FlatList, KeyboardAvoidingView, Keyboard} from 'react-native';
import {Container, Content,Text, View, Header,Left, Right, Body} from 'native-base';
import {
    addTestID,
    isIphoneX,
    getHeaderHeight,
    Colors,
    PrimaryButton,
    TextStyles,
    CommonStyles,
    FloatingInputField,
    SingleCheckListItem,
    BackButton, AlertUtil
} from 'ch-mobile-shared';
import {CONSENT_OPTIONS, NAME_REGEX} from '../../constants/CommonConstants';
import Loader from "../../components/Loader";
import {Screens} from "../../constants/Screens";
import Modal from 'react-native-modalbox';
import moment from "moment";
import {connectProfile} from "../../redux";
import {ConsentContent} from "../../components/ConsentContent";

const HEADER_SIZE = getHeaderHeight();

export class ConsentScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.profileRequest = navigation.getParam('profileRequest', null);
        this.selectedProvider = navigation.getParam('selectedProvider', null);
        this.selectedService = navigation.getParam('selectedService', null);
        this.selectedSchedule = navigation.getParam('selectedSchedule', null);
        this.state = {
            isLoading : false,
            consentOptions: CONSENT_OPTIONS,
            title: '',
            name: '',
            nameFocus: false,
            hasNameError: null,
            isDisabled: true,
            keyboardOpen: false,
        };
    }

    componentDidMount(): void {
        const consentOptions = CONSENT_OPTIONS.map((option) => {
            option.checked = false;
            return option;
        });
        this.setState({
            consentOptions
        })
    }

    componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    }

    componentWillUnmount(): void {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow = () => {
        this.setState({
            keyboardOpen: true
        });
    };

    _keyboardDidHide = () => {
        this.setState({
            keyboardOpen: false
        });
    };

    updateList = (title) => {

        const consentOptions = this.state.consentOptions.map((option) => {
            if (option.title === title) {
                option.checked = !option.checked;
                option.dateTime = moment(Date.now()).format();
            }
            return option;
        });
        const checkedItems = consentOptions.filter((option) => {
            return option.checked;
        }).length;
        this.setState({
            consentOptions,
            isDisabled: checkedItems !== CONSENT_OPTIONS.length,
        })
    }

    consentDrawerOpen = (title, checked) => {
        if(!checked){
            this.setState({title: title});
            this.refs?.modalConsentView?.open()
        }else {
            const consentOptions = this.state.consentOptions.map((option) => {
                if (option.title === title) {
                    option.checked = !option.checked;
                    option.dateTime = moment(Date.now()).format();
                }
                return option;
            });
            const checkedItems = consentOptions.filter((option) => {
                return option.checked;
            }).length;
            this.setState({
                consentOptions,
                isDisabled: checkedItems !== CONSENT_OPTIONS.length,
            })}
    }

    agreeResponse = () => {

        const {name, title} = this.state;
        if (this.isFormValid()) {

            const consentOptions = this.state.consentOptions.map((option) => {
                if (option.title === title) {
                    option.checked = !option.checked;
                    option.dateTime = moment(Date.now()).format();
                    option.value = name;
                }
                return option;
            });
            const checkedItems = consentOptions.filter((option) => {
                return option.checked;
            }).length;
            this.setState({
                consentOptions,
                isDisabled: checkedItems !== CONSENT_OPTIONS.length,
                name: ""
            })
            this.consentDrawerClose();
        }
    };

    saveResponse = async () => {
        const profileRequestBody = {
            ...this.profileRequest,
            hipaa: this.state.consentOptions[0].dateTime,
            pcpRelease: this.state.consentOptions[1].dateTime
        };
        const updateProfileRequest = {
            profile: profileRequestBody,
            file: null
        };
        this.props.navigation.navigate(Screens.EXCLUSION_CRITERIA_SCREEN,{
            ...this.props.navigation.state.params,
            updateProfileRequest
        })
    }

    isFormValid = () => {
        if (!this.validateName()) {
            AlertUtil.showErrorMessage('Invalid Name');
            return false;
        }

        return true;
    };

    validateName = () => {
        this.setState({nameFocus: false});
        const name = this.state.name.trim();
        let hasNameError = false;
        if (name === null || name === '') {
            hasNameError = true;
        } else if (name && name !== '') {
            hasNameError = !NAME_REGEX.test(name);
        }
        this.setState({hasNameError, name});

        return !hasNameError;
    };

    focusName = () => {
        this.setState({nameFocus: true});
    };

    onChangeNameText = (name) => {
        this.setState({hasNameError: null, name});
    };

    navigateToNextScreen = () => {
        this.props.navigation.replace(Screens.NEW_PAYMENT_DETAILS_SCREEN, this.props.navigation.state.params);
    };

    consentDrawerClose = () => {
        this.refs?.modalConsentView?.close();
    };

    backClicked = () => {
        this.props.navigation.goBack();
    };

    render() {
        if(this.state.isLoading){
            return <Loader/>;
        }
        StatusBar.setBarStyle('dark-content', true);
        const isDisabled = !this.state.name.trim();
        return (
            <Container style={{ backgroundColor: Colors.colors.screenBG }}>
                <Header transparent style={styles.header}>
                    <StatusBar
                        backgroundColor="transparent"
                        barStyle="dark-content"
                        translucent
                    />
                    <Left>
                        <BackButton
                            onPress={() => this.backClicked()}
                        />
                    </Left>
                    <Body/>
                    <Right/>
                </Header>
                <Content>
                    <View style={styles.textBox}>
                        <Text
                            style={styles.consentMainText}>
                            Before we get started we need some information.
                        </Text>
                        <Text style={styles.consentSubText}>
                            This is required to use Confidant’s services. We are a healthcare company and store your information in a medical record. That means we keep everything confidential and secure.
                        </Text>
                    </View>
                    <View style={styles.optionList}>
                        {this.state.consentOptions && this.state.consentOptions.length > 0 && (
                            <FlatList
                                data={this.state.consentOptions}
                                renderItem={({item, index}) =>
                                    <SingleCheckListItem
                                        listTestId={'list item- ' + index+1}
                                        checkTestId={'checkbox - ' + index+1}
                                        keyId={index}
                                        listPress={() => this.updateList(item.title)}
                                        itemSelected={item.checked}
                                        itemTitle={item.title}
                                    />
                                }
                                keyExtractor={item => item.id}
                            />
                        )}
                    </View>
                </Content>
                <View
                    style={styles.greBtn}>
                    <PrimaryButton
                        testId="continue"
                        onPress={() => {
                            this.refs?.modalConsentView?.open()
                        }}
                        text="Continue"
                        disabled={this.state.isDisabled}
                    />
                </View>



                <Modal
                    backdropPressToClose={true}
                    backdropColor={ Colors.colors.overlayBg}
                    backdropOpacity={1}
                    onClosed={this.consentDrawerClose}
                    style={{...CommonStyles.styles.commonModalWrapper, maxHeight: '90%', backgroundColor: Colors.colors.screenBG }}
                    entry={"bottom"}
                    position={"bottom"} ref={"modalConsentView"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                        <Content
                            enableResetScrollToCoords={false}
                            showsVerticalScrollIndicator={false}>
                            <ConsentContent/>
                            <KeyboardAvoidingView
                                style={{ bottom: 0}}
                                behavior={'height'}>
                                <FloatingInputField
                                    testId={'name-input'}
                                    // hasError={this.state.hasNameError}
                                    hasFocus={this.state.nameFocus}
                                    keyboardType={'default'}
                                    blur={this.validateName}
                                    focus={this.focusName}
                                    changeText={this.onChangeNameText}
                                    returnKeyType={'next'}
                                    value={this.state.name}
                                    // labelErrorText={'Incorrect name'}
                                    labelText={'Your full name'}
                                    editable={true}
                                />
                                <View style={styles.btnWrap}>
                                    <PrimaryButton
                                        onPress={() => this.saveResponse()}
                                        disabled={isDisabled}
                                        text={'I agree'}
                                    />
                                </View>
                            </KeyboardAvoidingView>
                        </Content>
                </Modal>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    textBox: {
        marginTop: 30,
        alignItems: 'center',
        paddingHorizontal: 24
    },
    consentMainText: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.highContrast,
        marginBottom: 8
    },
    consentSubText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.mediumContrast,
        marginBottom: 32
    },
    greBtn: {
        paddingTop: 15,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
    },
    optionList: {
        paddingBottom: 40,
        paddingHorizontal: 24
    },
    header: {
        height: HEADER_SIZE,
        paddingLeft: 18
    },
    consentModalTitle: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 24
    },
    consentModalPara: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextS,
        color: Colors.colors.lowContrast,
        marginBottom: 16
    },
    btnWrap: {
        paddingTop: 24,
        paddingBottom: isIphoneX()? 34 : 24
    }
});
export default connectProfile()(ConsentScreen);
