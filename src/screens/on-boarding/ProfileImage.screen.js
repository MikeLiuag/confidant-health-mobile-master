import React, {Component} from 'react';
import {StatusBar, StyleSheet, Image,Platform } from 'react-native';
import {Container, Content, Text, View,Button } from 'native-base';
import {addTestID, isIphoneX, Colors, PrimaryButton, TextStyles, CommonStyles, BackButton} from 'ch-mobile-shared';
import SplashScreen from 'react-native-splash-screen';
import {Screens} from '../../constants/Screens';
import {S3_BUCKET_LINK, SEGMENT_EVENT} from "../../constants/CommonConstants";
import ImagePicker from 'react-native-image-picker';
import {PERMISSIONS, request} from 'react-native-permissions';
import {AlertUtil} from "ch-mobile-shared";
import ProfileService from "../../services/Profile.service";
import {connectAuth} from '../../redux';
import Loader from "../../components/Loader";
import AuthStore from "../../utilities/AuthStore";
import moment from "moment";
import Analytics from "@segment/analytics-react-native";

class ProfileImageScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        SplashScreen.hide();
        super(props);
        this.state = {
            imageUploaded: false,
            profileImage:null
        };
    }

    componentDidMount() {
        if(!this.props.auth.isLoading) {
            this.onboardingStartedSegmentEvents();
        }
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    chooseFile = async () => {
        let options = {
            title: 'Update Profile Picture',
            allowsEditing: true,
            mediaType: 'photo',
            storageOptions: {
                skipBackup: true,
                path: 'images'
            }
        };

        ImagePicker.showImagePicker(options, response => {
            if (response.didCancel) {
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
                if (response.error === 'Photo library permissions not granted' || response.error === 'Camera permissions not granted' || response.error === 'Permissions weren\'t granted') {
                    AlertUtil.showErrorMessage(response.error + '. Please go to application settings and allow permissions.');
                }
            } else if (response.customButton) {
                AlertUtil.showErrorMessage(response.customButton);
            } else {
                //let source = 'data:' + response.type + ';base64,' + response.data;
                let imageSize = response.fileSize / 1000000;
                if (imageSize >= 10) {
                    AlertUtil.showErrorMessage('Uploaded file size is too large');
                } else {
                    const fileData= {
                        uri: response.uri,
                        name: response.fileName ? response.fileName : 'confidant-health-image.jpeg',
                        type: response.type
                    }
                    this.uploadImage(fileData);
                }
            }
        });
    };

    checkPermissions = ()=>{
        request(Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE).then(result => {
            console.log(result);
            if (result === 'denied' || result==='blocked') {
                AlertUtil.showErrorMessage("Permission denied, please allow Photo Library Permissions from your phone settings");
            } else {
                this.chooseFile();
            }
        })
    };


    navigateToNextScreen = () => {
        this.props.navigation.navigate(Screens.DIFFICULTIES_SCREEN, {
            ...this.props.navigation.state.params,
            profileImage : this.state.profileImage

        });
    };



    uploadImage = async (profileData) => {
        this.setState({isLoading: true});
        const authToken = await AuthStore.getAuthToken();
        const file = {
            file: profileData
        };
        try {
            const response = await ProfileService.uploadImage(file,authToken);
            if (response.errors) {
                this.setState({isLoading: false});
            } else {
                this.setState({
                    profileImage: response.fileUrl,
                    imageUploaded: true,
                    isLoading: false
                });
            }
        } catch (e) {
            console.log(e)
            this.setState({isLoading: false})
        }
    }

    onboardingStartedSegmentEvents = ()=> {
        const segmentPayload = {
            userId: this.props.auth.meta.userId,
            startedAt: moment.utc(Date.now()).format(),
            category: 'Goal Completion',
            label: 'Started onBoarding',
        }
        Analytics.track(SEGMENT_EVENT.ON_BOARDING_STARTED, segmentPayload)
    }


    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        if(this.state.isLoading || this.props.auth.isLoading){
            return <Loader/>;
        }
        const nickname = this.props.auth.meta.nickname;
        return (
          <Container style={{ backgroundColor: Colors.colors.screenBG }}>
              <StatusBar
                backgroundColor="transparent"
                barStyle="dark-content"
                translucent
              />
              <View style={styles.backButtonWrapper}>
                  <BackButton
                      onPress={this.backClicked}
                  />
              </View>
              <Content showsVerticalScrollIndicator={false}   >
                  <View style={styles.textBox}>
                      <View style={{...CommonStyles.styles.letterWrapper, borderRadius: 500}}>
                          <View style={{...CommonStyles.styles.blueProBG}}
                          >
                              {
                                  this.state.imageUploaded?
                                    <Image
                                      {...addTestID('profile-image')}
                                      style={styles.proImg}
                                      resizeMode={'cover'}
                                      source={{uri: S3_BUCKET_LINK + this.state.profileImage}} /> :
                                    <Text style={{...CommonStyles.styles.proLetterInBox}}>{nickname.charAt(0).toUpperCase()}</Text>
                              }

                          </View>
                      </View>
                      <Text
                        {...addTestID('heading-1')}
                        style={styles.magicMainText}>
                          Upload a profile picture
                      </Text>
                      <Text
                        {...addTestID('heading-2')}
                        style={styles.magicSubText}>
                          {
                              this.state.imageUploaded?
                                'Here is how we’ll see you in the app. Want to update your profile picture?' :
                                'You can remain mysterious or you can upload a better profile picture here.'
                          }
                      </Text>
                  </View>


              </Content>
              <View
                {...addTestID('view')}
                style={styles.greBtn}>
                  {
                      this.state.imageUploaded ? (
                          <PrimaryButton
                              testId = "continue"
                              onPress={() => {this.navigateToNextScreen();}}
                              text="Continue"
                          />
                      ): (
                          <PrimaryButton
                              testId = "continue"
                              onPress={() => {this.checkPermissions();}}
                              text="Update profile picture"
                          />
                      )
                  }

                  {
                      !this.state.imageUploaded ? (<Button
                          {...addTestID('update-profile-pic')}
                          transparent style={{ alignSelf: 'center', marginTop: 16 }}>
                          <Text uppercase={false} style={{...CommonStyles.styles.blueLinkText, marginTop: 0}} onPress={this.navigateToNextScreen}>Skip for now</Text>
                      </Button>) : (<Button
                          {...addTestID('update-profile-pic')}
                          transparent style={{ alignSelf: 'center', marginTop: 16 }}>
                          <Text uppercase={false} style={{...CommonStyles.styles.blueLinkText, marginTop: 0}} onPress={this.checkPermissions}>Edit profile picture</Text>
                      </Button>)
                  }

              </View>
          </Container>
        );
    }
}

const styles = StyleSheet.create({
    backButtonWrapper: {
        position: 'relative',
        zIndex: 2,
        paddingTop: isIphoneX()? 50 : 44,
        paddingLeft: 22
    },
    textBox: {
        alignItems: 'center',
        paddingTop: isIphoneX()? 20 : 10,
        paddingLeft: 24,
        paddingRight: 24,
        marginBottom: 20
    },
    proImg: {
        width: 130,
        height: 130,
        borderRadius: 500,
        borderColor: Colors.colors.mainBlue,
        borderWidth: 1
    },
    magicMainText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 16,
        textAlign: 'center',
    },
    magicSubText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.subTextL,
        marginBottom: 40,
        textAlign: 'center',
        color: Colors.colors.mediumContrast
    },
    greBtn: {
        paddingHorizontal: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        backgroundColor: 'transparent'
    }
});
export default connectAuth()(ProfileImageScreen)

