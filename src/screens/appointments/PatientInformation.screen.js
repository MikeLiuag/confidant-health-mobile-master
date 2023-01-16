import React, {Component} from 'react';
import {Body, Container, Content, Header, Input, Item, Label, Left, Right, Text, View } from 'native-base';
import {Platform, StatusBar, StyleSheet, KeyboardAvoidingView, ScrollView } from 'react-native';
import {
    AlertUtil,
    isIphoneX,
    getHeaderHeight,
    Colors,
    PrimaryButton,
    TextStyles,
    FloatingInputField,
    BackButton, State_Input_Label, State_Input_Error, DEFAULT_STATES_OPTIONS, Address_Two_Input_Error
} from 'ch-mobile-shared';
import {DropDownInputField} from "ch-mobile-shared/src/components/DropDownInputField";
import {
    Emergency_Name_Input_Label,
    Emergency_Name_Input_Error,
    Emergency_Phone_Input_Error,
    Emergency_Phone_Input_Label,
    First_Name_Input_Label,
    First_Name_Input_Error,
    Last_Name_Input_Error,
    Last_Name_Input_Label,
    DOB_Label,
    ZipCode_Input_Label,
    Zip_Code_Input_Error,
    Nick_Name_Input_Label,
    Nick_Name_Input_Error, City_Input_Error, City_Input_Label,
    Address_One_Input_Label,
    Address_Two_Input_Label,
    UPDATE_PROFILE_DROPDOWN_TYPES
} from "ch-mobile-shared/src/constants";
import {Screens} from '../../constants/Screens';
import {NAME_REGEX, PHONE_REGEX} from "../../constants/CommonConstants";
import Loader from "../../components/Loader";
import DatePicker from 'react-native-datepicker'
import moment from "moment";
import {connectAppointments} from "../../redux";
import {Address_One_Input_Error} from "ch-mobile-shared/src/constants/CommonLabels";
import {StackedInputField} from "ch-mobile-shared/src/components/StackedInputField";

const HEADER_SIZE = getHeaderHeight();

class PatientInformationScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.componentReference = null;
        this.state = {
            isLoading: false,
            firstName: '',
            firstNameFocus: false,
            hasFirstNameError: null,
            lastName: '',
            lastNameFocus: false,
            hasLastNameError: null,
            fullName: '',
            fullNameFocus: false,
            hasFullNameError: null,
            dob: '',
            dobFocus: false,
            hasDOBError: null,
            phoneNumber: '',
            phoneNumberFocus: false,
            hasPhoneNumberError: null,
            city: '',
            cityFocus: false,
            hasCityError: null,
            zipCode: '',
            zipCodeFocus: false,
            hasZipCodeError: null,
            state: '',
            stateFocus: false,
            hasStateError: null,
            addressOne: '',
            addressOneFocus: false,
            hasAddressOneError: null,
            addressTwo: '',
            addressTwoFocus: false,
            hasAddressTwoError: null,
            emergencyContactName: '',
            emergencyContactNameFocus: false,
            hasEmergencyContactNameError: null,
            emergencyPhone: '',
            emergencyPhoneFocus: false,
            hasEmergencyPhoneError: null,

            currentDate: moment().toDate(),
        };

        this.form = {
            firstNameField: null,
            lastNameField: null,
            fullNameField: null,
            phoneNumberField: null,
            dobField: null,
            cityField: null,
            zipCodeField: null,
            stateField: null,
            addressOneField: null,
            addressTwoField: null,
            emergencyContactNameField: null,
            emergencyContactPhoneField: null,
            submitBtn: ''
        };
    }


    componentDidMount = async () => {
        const profile = this.props.profile.patient;
        this.setState({
            firstName: profile.firstName? profile.firstName : "",
            lastName: profile.lastName? profile.lastName : "",
            fullName: profile.fullName? profile.fullName : "",
            dob: profile.dob? profile.dob : "",
            phoneNumber: profile.phoneNumber? profile.phoneNumber : "",
            zipCode: profile.zipCode? profile.zipCode : "",
            city: profile.city? profile.city : "",
            state: profile.state? profile.state : "",
            addressOne: profile.address1? profile.address1 : "",
            addressTwo: profile.address2? profile.address2 : "",
            emergencyContactName: profile.emergencyContact? profile.emergencyContact : "",
            emergencyPhone: profile.emergencyPhone? profile.emergencyPhone : ""
        });
    };

    backClicked = () => {
        this.props.navigation.goBack();
    };

    /**
     * @function saveResponse
     * @description This method is used to update patient information.
     */

    navigateToNextScreen = (profileRequest) => {
        this.props.navigation.replace(Screens.CONSENT_SCREEN, {
            ...this.props.navigation.state.params,
            profileRequest : profileRequest
        });
    };

    saveResponse = async () => {

        const {firstName, lastName, fullName, dob, phoneNumber, zipCode, city, state, addressOne, addressTwo, emergencyContactName, emergencyPhone} = this.state;
        if (this.isFormValid()) {

            const profileRequestBody = {
                firstName,
                lastName,
                fullName,
                dob,
                phoneNumber,
                zipCode,
                city,
                state,
                address1: addressOne,
                address2: addressTwo,
                emergencyContact: emergencyContactName,
                emergencyPhone,
                isAppointmentFlow: true,
            };

            this.navigateToNextScreen(profileRequestBody)
        }
    };

    /**
     * @function isFormValid
     * @description This method is used to validate form values.
     */

    isFormValid = () => {
        if (!this.validateFirstName()) {
            AlertUtil.showErrorMessage('Invalid First Name');
            return false;
        }
        if (!this.validateLastName()) {
            AlertUtil.showErrorMessage('Invalid Last Name');
            return false;
        }
        if (!this.validateFullName()) {
            AlertUtil.showErrorMessage('Invalid Full Name');
            return false;
        }
        if (!this.validatePhoneNumber()) {
            AlertUtil.showErrorMessage('Invalid Phone Number');
            return false;
        }
        if (!this.validateCity()) {
            AlertUtil.showErrorMessage('Invalid city');
            return false;
        }
        if (!this.validateAddressOne()) {
            AlertUtil.showErrorMessage('Invalid Address 1');
            return false;
        }
        if (!this.validateEmergencyContactName()) {
            AlertUtil.showErrorMessage('Invalid emergency contact');
            return false;
        }
        if (!this.validateEmergencyPhone()) {
            AlertUtil.showErrorMessage('Invalid emergency phone');
            return false;
        }
        return true;
    };

    /**
     * @function validateFirstName
     * @description This method is used to validate first Name.
     */

    validateFirstName = () => {
        this.setState({firstNameFocus: false});
        const firstName = this.state.firstName.trim();
        let hasFirstNameError = false;
        if (firstName === null || firstName === '') {
            hasFirstNameError = true;
        } else if (firstName && firstName !== '') {
            hasFirstNameError = !NAME_REGEX.test(firstName);
        }
        this.setState({hasFirstNameError, firstName});

        return !hasFirstNameError;
    };

    focusFirstName = () => {
        this.setState({firstNameFocus: true});
    };

    clearText = (stateKey) => {
        const  {state} = this;
        state[stateKey] = "";
        this.setState(state);
    };

    onChangeFirstText = (firstName) => {
        this.setState({hasFirstNameError: null, firstName: firstName});
    };

    onSubmitFormFirst = () => {
        this.form.lastNameField._root.focus();
    };


    /**
     * @function validateLastName
     * @description This method is used to validate last name.
     */


    validateLastName = () => {
        this.setState({lastNameFocus: false});
        const lastName = this.state.lastName.trim();
        let hasLastNameError = false;
        if (lastName === null || lastName === '') {
            hasLastNameError = true;
        } else if (lastName && lastName !== '') {
            hasLastNameError = !NAME_REGEX.test(lastName);
        }
        this.setState({hasLastNameError, lastName});
        return !hasLastNameError;
    };

    focusLastName = () => {
        this.setState({lastNameFocus: true});
    };

    onChangeLastText = (lastName) => {
        this.setState({hasLastNameError: null, lastName: lastName});
    };

    onSubmitFormLast = () => {
        this.form.fullNameField._root.focus();
    };

    /**
     * @function validateFullName
     * @description This method is used to validate full name.
     */

    validateFullName = () => {
        this.setState({fullNameFocus: false});
        const fullName = this.state.fullName.trim();
        let hasFullNameError = false;
        if (fullName === null || fullName === '') {
            hasFullNameError = true;
        } else if (fullName && fullName !== '') {
            hasFullNameError = !NAME_REGEX.test(fullName);
        }
        this.setState({hasFullNameError, fullName});

        return !hasFullNameError;
    };

    focusFullName = () => {
        this.setState({fullNameFocus: true});
    };

    onChangeFullText = (fullName) => {
        this.setState({hasFullNameError: null, fullName: fullName});
    };

    onSubmitFormFull = () => {
        this.openDatePicker()
    };

    /**
     * @function validateDob
     * @description This method is used to validate date of birth.
     */

    openDatePicker = () => {
        this.setState({dobFocus: true});
        if (this.componentReference) {
            this.componentReference.onPressDate();
        }
    };

    /**
     * @function validatePhoneNumber
     * @description This method is used to validate phone number.
     */

    validatePhoneNumber = () => {
        this.setState({phoneNumberFocus: false});
        const phoneNumber = this.state.phoneNumber.trim();
        let hasPhoneNumberError = false;
        if (phoneNumber === null || phoneNumber === '') {
            hasPhoneNumberError = true;
        } else if (phoneNumber && phoneNumber !== '') {
            hasPhoneNumberError = !PHONE_REGEX.test(phoneNumber);
        }
        this.setState({hasPhoneNumberError, phoneNumber});
        return !hasPhoneNumberError;
    };

    focusPhoneNum = () => {
        this.setState({phoneNumberFocus: true});
    };

    onChangePhoneNum = (phoneNumber) => {
        this.setState({
            hasPhoneNumberError: null,
            phoneNumber
        });
    };

    onSubmitFormPhone = () => {
        this.form.addressOneField._root.focus();
    };

    /**
     * @function validateZipCode
     * @description This method is used to validate zip code.
     */

    validateZipCode = () => {
        this.setState({zipCodeFocus: false});
        const zipCode = this.state.zipCode.trim();
        let hasZipCodeError = false;
        if (zipCode === null || zipCode === '') {
            hasZipCodeError = true;
        } else if (zipCode && zipCode !== '') {
            hasZipCodeError = !ZIP_CODE_REGEX.test(zipCode);
        }
        this.setState({hasZipCodeError, zipCode});

        return !hasZipCodeError;
    };

    focusZipCode = () => {
        this.setState({zipCodeFocus: true});
    };

    onChangeZipCodeText = (zipCode) => {
        this.setState({hasZipCodeError: null, zipCode: zipCode});
    };

    onSubmitFormZipCode = () => {
        this.form.emergencyContactNameField._root.focus();
    };


    /**
     * @function validateCity
     * @description This method is used to validate zip code.
     */

    validateCity = () => {
        this.setState({cityFocus: false});
        const city = this.state.city.trim();
        let hasCityError = false;
        if (city === null || city === '') {
            hasCityError = true;
        }
        this.setState({hasCityError, city});

        return !hasCityError;
    };

    focusCity = () => {
        this.setState({cityFocus: true});
    };

    onChangeCityText = (city) => {
        this.setState({hasCityError: null, city: city});
    };

    onSubmitFormCity = () => {
        this.form.stateField._root.focus();
    };


    /**
     * @function validateState
     * @description This method is used to validate zip code.
     */

    focusState = () => {
        this.setState({stateFocus: true});
    };

    onChangeStateText = (state) => {
        this.setState({hasStateError: null, state: state});
    };

    onSubmitFormState = () => {
        this.form.zipCodeField._root.focus();
    };


    /**
     * @function validateAddressOne
     * @description This method is used to validate address one.
     */

    validateAddressOne = () => {
        this.setState({addressOneFocus: false});
        const addressOne = this.state.addressOne.trim();
        let hasAddressOneError = false;
        if (addressOne === null || addressOne === '') {
            hasAddressOneError = true;
        }
        this.setState({hasAddressOneError, addressOne});

        return !hasAddressOneError;
    };

    onChangeAddressOneText = (addressOne) => {
        this.setState({hasAddressOneError: null, addressOne: addressOne});
    }

    onSubmitFormAddressOne = () => {
        this.form.addressTwoField._root.focus();
    };

    /**
     * @function validateAddressTwo
     * @description This method is used to validate address two.
     */

    onChangeAddressTwoText = (addressTwo) => {
        this.setState({hasAddressTwoError: null, addressTwo: addressTwo});
    }

    onSubmitFormAddressTwo = () => {
        this.form.emergencyContactNameField._root.focus();
    };


    /**
     * @function validateEmergencyContactName
     * @description This method is used to validate emergency contact name.
     */

    validateEmergencyContactName = () => {
        this.setState({emergencyContactNameFocus: false});
        const emergencyContactName = this.state.emergencyContactName.trim();
        let hasEmergencyContactNameError = false;
        if (emergencyContactName && emergencyContactName !== '') {
            hasEmergencyContactNameError = !NAME_REGEX.test(emergencyContactName);
        }
        this.setState({hasEmergencyContactNameError, emergencyContactName});

        return !hasEmergencyContactNameError;
    };

    focusEmergencyContactName = () => {
        this.setState({emergencyContactNameFocus: true});
    };

    onChangeEmergencyContactNameText = (emergencyContactName) => {
        this.setState({hasEmergencyContactNameError: null, emergencyContactName: emergencyContactName});
    };

    onSubmitFormEmergencyContactName = () => {
        this.form.emergencyContactPhoneField._root.focus();
    };


    /**
     * @function validateEmergencyPhone
     * @description This method is used to validate emergency phone.
     */

    validateEmergencyPhone = () => {
        this.setState({emergencyPhoneFocus: false});
        const emergencyPhone = this.state.emergencyPhone.trim();
        let hasEmergencyPhoneError = false;
        if (emergencyPhone && emergencyPhone !== '') {
            hasEmergencyPhoneError = !PHONE_REGEX.test(emergencyPhone);
        }
        this.setState({hasEmergencyPhoneError, emergencyPhone});

        return !hasEmergencyPhoneError;
    };

    focusEmergencyPhone = () => {
        this.setState({emergencyPhoneFocus: true});
    };

    onChangeEmergencyPhoneText = (emergencyPhone) => {
        this.setState({hasEmergencyPhoneError: null, emergencyPhone: emergencyPhone});
    };

    onSubmitFormEmergencyPhone = () => {
        this.form.submitBtn._root.focus();
    };

    render() {
        StatusBar.setBarStyle('dark-content', true);
        if (this.state.isLoading) {
            return <Loader/>
        }
        const {firstName, lastName, fullName, dob, phoneNumber, zipCode, city, state, addressOne, addressTwo, emergencyContactName, emergencyPhone} = this.state;
        const isDisabled = !firstName.trim() || !lastName.trim() || !fullName.trim() || !dob.trim() || !phoneNumber.trim() || !zipCode.trim() || !city.trim() || !state || !addressOne.trim();
        return (
            <KeyboardAvoidingView
                style={{flex: 1, bottom: 0}}
                behavior={Platform.OS === 'ios' ? 'padding' : null}>
                <Container style={{ backgroundColor: Colors.colors.screenBG }}>
                    <Header
                        noShadow
                        transparent
                        style={styles.header}>
                        <StatusBar
                            backgroundColor={Platform.OS === 'ios' ? null : "transparent"}
                            translucent
                            barStyle={'dark-content'}
                        />
                        <Left>
                            <BackButton
                                onPress={() => this.backClicked()}
                            />
                        </Left>
                        <Body/>
                        <Right/>
                    </Header>
                    <ScrollView
                        showsVerticalScrollIndicator={false} enableResetScrollToCoords={false}>
                        <View style={styles.textBox}>
                            <Text style={styles.consentMainText}>
                                Before we get started we need some information.
                            </Text>
                            <Text style={styles.consentSubText}>
                                This is required to use Confidant’s services. We use this information to maintain your medical records.
                            </Text>

                        </View>

                        <View style={styles.infoFieldsWrapper}>
                            <Text style={styles.fieldHeader}>Personal information</Text>

                            <View style={styles.fieldWrapper}>
                                <FloatingInputField
                                    testId={'first-name-input'}
                                    hasError={this.state.hasFirstNameError}
                                    hasFocus={this.state.firstNameFocus}
                                    keyboardType={'default'}
                                    blur={this.validateFirstName}
                                    focus={this.focusFirstName}
                                    changeText={this.onChangeFirstText}
                                    returnKeyType={'next'}
                                    submitEditing={this.onSubmitFormFirst}
                                    getRef={field => {
                                        this.form.firstNameField = field;
                                    }}
                                    value={this.state.firstName}
                                    labelErrorText={First_Name_Input_Error}
                                    labelText={First_Name_Input_Label}
                                    editable={true}
                                    clearText={()=>{this.clearText("firstName")}}
                                />
                            </View>

                            <View style={styles.fieldWrapper}>
                                <FloatingInputField
                                    testId={'last-name-input'}
                                    hasError={this.state.hasLastNameError}
                                    hasFocus={this.state.lastNameFocus}
                                    keyboardType={'default'}
                                    blur={this.validateLastName}
                                    focus={this.focusLastName}
                                    changeText={this.onChangeLastText}
                                    returnKeyType={'next'}
                                    submitEditing={this.onSubmitFormLast}
                                    getRef={field => {
                                        this.form.lastNameField = field;
                                    }}
                                    value={this.state.lastName}
                                    labelErrorText={Last_Name_Input_Error}
                                    labelText={Last_Name_Input_Label}
                                    editable={true}
                                    clearText={()=>{this.clearText("lastName")}}
                                />
                            </View>

                            <View style={styles.fieldWrapper}>
                                <StackedInputField
                                    testId={'full-name-input'}
                                    hasError={this.state.hasFullNameError}
                                    hasFocus={this.state.fullNameFocus}
                                    keyboardType={'default'}
                                    blur={this.validateFullName}
                                    focus={this.focusFullName}
                                    changeText={this.onChangeFullText}
                                    returnKeyType={'next'}
                                    submitEditing={this.onSubmitFormFull}
                                    getRef={field => {
                                        this.form.fullNameField = field;
                                    }}
                                    value={this.state.fullName}
                                    labelErrorText={Nick_Name_Input_Error}
                                    labelText={Nick_Name_Input_Label}
                                    editable={true}
                                    clearText={()=>{this.clearText("fullName")}}
                                />
                            </View>

                            <View style={this.props.hasDOBError ?
                                [styles.inputWrapper, {borderColor: Colors.colors.mainBlue}] : styles.inputWrapper }>
                                <Item
                                    stackedLabel
                                    style={styles.inputFields}
                                    error={this.state.hasDOBError}
                                    success={this.state.hasDOBError === false}>
                                    <Label
                                        style={this.state.dobFocus ? [styles.inputLabel, {color: Colors.colors.primaryText}] : styles.inputLabel}>
                                        {this.state.hasDOBError ? 'Date of Birth is incorrect' : 'Date of Birth'}
                                    </Label>
                                    <Input
                                        style={styles.inputBox}
                                        onFocus={() => {
                                            this.openDatePicker()
                                        }}
                                        onBlur={() => {
                                            this.setState({dobFocus: false});
                                        }}
                                        onSubmitEditing={() => {
                                            this.form.phoneNumber._root.focus();
                                        }}
                                        getRef={field => {
                                            this.form.dob = field;
                                        }}
                                        placeholder={DOB_Label}
                                        placeholderTextColor={Colors.colors.lowContrast}
                                        value={this.state.dob ? moment(this.state.dob).format("MMM D, YYYY") : ''}
                                    />
                                </Item>
                                <DatePicker
                                    ref={(ref) => {
                                        this.componentReference = ref;
                                    }}
                                    style={{width: 0, position: 'absolute'}}
                                    date={this.state.dob}
                                    mode="date"
                                    placeholder="select date"
                                    format="YYYY-MM-DD"
                                    maxDate={moment(this.state.currentDate).format("YYYY-MM-DD")}
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                        dateInput: {
                                            height: 0,
                                            width: 0,
                                            borderWidth: 0
                                        },
                                        datePicker: {
                                            justifyContent: 'center'
                                        },
                                    }}
                                    onDateChange={(date) => {
                                        this.setState({dob: date})
                                    }}
                                    showIcon={false}
                                />
                            </View>

                            <View style={styles.fieldWrapper}>
                                <FloatingInputField
                                    testId={'phone-input'}
                                    hasError={this.state.hasPhoneNumberError}
                                    hasFocus={this.state.phoneNumberFocus}
                                    keyboardType={'phone-pad'}
                                    blur={this.validatePhoneNumber}
                                    focus={this.focusPhoneNum}
                                    changeText={this.onChangePhoneNum}
                                    returnKeyType={'next'}
                                    submitEditing={this.onSubmitFormPhone}
                                    getRef={field => {
                                        this.form.phoneNumberField = field;
                                    }}
                                    value={this.state.phoneNumber}
                                    labelErrorText={'Incorrect Phone Number'}
                                    labelText={'Phone Number'}
                                    editable={true}
                                    clearText={()=>{this.clearText("phoneNumber")}}
                                />
                            </View>

                            <Text style={styles.fieldHeader}>Current address</Text>

                            <View style={styles.fieldWrapper}>
                                <FloatingInputField
                                    testId={'address-one'}
                                    hasError={this.state.hasAddressOneError}
                                    hasFocus={this.state.addressOneFocus}
                                    keyboardType={'default'}
                                    focus={()=>{
                                        this.setState({addressOneFocus: true});
                                    }}
                                    blur={()=>{
                                        this.setState({addressOneFocus: false});
                                    }}
                                    changeText={this.onChangeAddressOneText}
                                    returnKeyType={'next'}
                                    submitEditing={this.onSubmitFormAddressOne}
                                    getRef={field => {
                                        this.form.addressOneField = field;
                                    }}
                                    value={this.state.addressOne}
                                    labelErrorText={Address_One_Input_Error}
                                    labelText={Address_One_Input_Label}
                                    editable={true}
                                    clearText={()=>{this.clearText("addressOne")}}
                                />
                            </View>

                            <View style={styles.fieldWrapper}>
                                <FloatingInputField
                                    testId={'address-two'}
                                    hasError={this.state.hasAddressTwoError}
                                    hasFocus={this.state.addressTwoFocus}
                                    keyboardType={'default'}
                                    focus={()=>{
                                        this.setState({addressTwoFocus: true});
                                    }}
                                    blur={()=>{
                                        this.setState({addressTwoFocus: false});
                                    }}
                                    changeText={this.onChangeAddressTwoText}
                                    returnKeyType={'next'}
                                    submitEditing={this.onSubmitFormAddressTwo}
                                    getRef={field => {
                                        this.form.addressTwoField = field;
                                    }}
                                    value={this.state.addressTwo}
                                    labelErrorText={Address_Two_Input_Error}
                                    labelText={Address_Two_Input_Label}
                                    editable={true}
                                    clearText={()=>{this.clearText("addressTwo")}}
                                />
                            </View>

                            <View style={styles.fieldWrapper}>
                                <FloatingInputField
                                    testId={'city-input'}
                                    hasError={this.state.hasCityError}
                                    hasFocus={this.state.cityFocus}
                                    keyboardType={'default'}
                                    blur={this.validateCity}
                                    focus={this.focusCity}
                                    changeText={this.onChangeCityText}
                                    returnKeyType={'next'}
                                    submitEditing={this.onSubmitFormCity}
                                    getRef={field => {
                                        this.form.cityField = field;
                                    }}
                                    value={this.state.city}
                                    labelErrorText={City_Input_Error}
                                    labelText={City_Input_Label}
                                    editable={true}
                                    clearText={()=>{this.clearText("city")}}
                                />
                            </View>

                            <View style={styles.fieldWrapper}>
                                <DropDownInputField
                                    testId={'state-input'}
                                    hasError={false}
                                    hasFocus={false}
                                    keyboardType={'default'}
                                    onChange={this.onChangeStateText}
                                    submitEditing={this.onSubmitFormState}
                                    getRef={field => {
                                        this.form.stateField = field;
                                    }}
                                    value={this.state.state}
                                    labelErrorText={State_Input_Error}
                                    labelText={State_Input_Label}
                                    editable={true}
                                    options={DEFAULT_STATES_OPTIONS}
                                    type={UPDATE_PROFILE_DROPDOWN_TYPES.state}
                                    dropDownIconColor={Colors.colors.mainBlue}
                                />
                            </View>

                            <View style={styles.fieldWrapper}>
                                <FloatingInputField
                                    testId={'zip-input'}
                                    hasError={this.state.hasZipCodeError}
                                    hasFocus={this.state.zipCodeFocus}
                                    keyboardType={'default'}
                                    blur={this.validateZipCode}
                                    focus={this.focusZipCode}
                                    changeText={this.onChangeZipCodeText}
                                    returnKeyType={'next'}
                                    submitEditing={this.onSubmitFormZipCode}
                                    getRef={field => {
                                        this.form.zipCodeField = field;
                                    }}
                                    value={this.state.zipCode}
                                    labelErrorText={Zip_Code_Input_Error}
                                    labelText={ZipCode_Input_Label}
                                    editable={true}
                                    clearText = {()=>{this.clearText("zipCode")}}
                                />
                            </View>

                            <Text style={styles.fieldHeader}>Emergency contact (optional)</Text>

                            <View style={styles.fieldWrapper}>
                                <FloatingInputField
                                    testId={'Emergency-Name-input'}
                                    hasError={this.state.hasEmergencyContactNameError}
                                    hasFocus={this.state.emergencyContactNameFocus}
                                    keyboardType={'default'}
                                    blur={this.validateEmergencyContactName}
                                    focus={this.focusEmergencyContactName}
                                    changeText={this.onChangeEmergencyContactNameText}
                                    returnKeyType={'next'}
                                    submitEditing={this.onSubmitFormEmergencyContactName}
                                    getRef={field => {
                                        this.form.emergencyContactNameField = field;
                                    }}
                                    value={this.state.emergencyContactName}
                                    labelErrorText={Emergency_Name_Input_Error}
                                    labelText={Emergency_Name_Input_Label}
                                    editable={true}
                                    clearText={()=>{this.clearText("emergencyContactName")}}
                                />
                            </View>

                            <View style={styles.fieldWrapper}>
                                <FloatingInputField
                                    testId={'Emergency-phone-input'}
                                    hasError={this.state.hasEmergencyPhoneError}
                                    hasFocus={this.state.emergencyPhoneFocus}
                                    keyboardType={'default'}
                                    blur={this.validateEmergencyPhone}
                                    focus={this.focusEmergencyPhone}
                                    changeText={this.onChangeEmergencyPhoneText}
                                    returnKeyType={'next'}
                                    submitEditing={this.onSubmitFormEmergencyPhone}
                                    getRef={field => {
                                        this.form.emergencyContactPhoneField = field;
                                    }}
                                    value={this.state.emergencyPhone}
                                    labelErrorText={Emergency_Phone_Input_Error}
                                    labelText={Emergency_Phone_Input_Label}
                                    editable={true}
                                    clearText={()=>{this.clearText("emergencyPhone")}}
                                />
                            </View>

                        </View>
                        <View style={styles.greBtn}>
                            <PrimaryButton
                                testId="request-appointment"
                                disabled={isDisabled}
                                ref={btn => {
                                    this.form.submitBtn = btn;
                                }}
                                onPress={() => this.saveResponse()}
                                text="CONTINUE"
                            />
                        </View>
                    </ScrollView>
                </Container>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        height: HEADER_SIZE,
        paddingLeft: 18
    },
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
        marginBottom: 16
    },
    infoFieldsWrapper: {
        paddingHorizontal: 24
    },
    fieldHeader: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextL,
        color: Colors.colors.highContrast,
        marginVertical: 16
    },
    fieldWrapper: {
        marginBottom: 20
    },
    inputWrapper: {
        width: '100%',
        backgroundColor: Colors.colors.white,
        height: 74,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.colors.white,
        paddingTop: 5,
        marginBottom: 16
    },
    inputFields: {
        elevation: 0,
        borderBottomWidth: 0
    },
    inputLabel: {
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.inputLabel,
        paddingLeft: 16,
        opacity: 0.8
    },
    inputBox: {
        ...TextStyles.mediaTexts.inputText,
        ...TextStyles.mediaTexts.manropeRegular,
        color: Colors.colors.highContrast,
        height: 35,
        paddingLeft: 16,
        marginTop: -10
    },
    textAreaLabel: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        color: Colors.colors.lowContrast,
        marginBottom: 8,
        paddingLeft: 16
    },
    inputIcon: {
        color: Colors.colors.neutral50Icon,
        fontSize: 22,
        paddingTop: 0,
        paddingRight: 16,
        marginTop: -10
    },
    greBtn: {
        paddingTop: 15,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: isIphoneX() ? 36 : 24
    },
    blueText: {
        fontFamily: 'Roboto-Regular',
        color: '#3fb2fe',
        fontSize: 15,
        lineHeight: 20,
        letterSpacing: 0,
        textAlign: 'center',
        marginBottom: 10
    }
});


export default connectAppointments()(PatientInformationScreen);
