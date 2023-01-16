import React, {Component} from 'react';
import {StatusBar, StyleSheet, Platform} from 'react-native';
import {
  Body,
  Button,
  Container,
  Content,
  Header,
  Left,
  Right,
  Text,
  View,
} from 'native-base';
import {
  isIphoneX,
  Colors,
  TextStyles,
  addTestID,
  CommonStyles,
  getHeaderHeight,
  PrimaryButton,
} from 'ch-mobile-shared';
import SplashScreen from 'react-native-splash-screen';
import Loader from '../../components/Loader';
import EntypoIcons from 'react-native-vector-icons/Entypo';
import { Screens } from "../../constants/Screens";
const HEADER_SIZE = getHeaderHeight();

export default class ExclusionCriteriaForCliniciansScreen extends Component<Props> {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    SplashScreen.hide();
    super(props);
    this.state = {};
  }

  /**
   * @function backClicked
   * @description This method is used to navigate to next screen with condition.
   */

  backClicked = () => {
    this.props.navigation.goBack();
  };

  /**
   * @function navigateToHomeScreen
   * @description This method is used to navigate to home screen.
   */

  navigateToHomeScreen = () => {
    this.props.navigation.navigate(Screens.TAB_VIEW)
  };

  render() {
    if (this.state.isLoading) {
      return <Loader />;
    }
    StatusBar.setBarStyle('dark-content', true);
    return (
      <Container style={{backgroundColor: Colors.colors.screenBG}}>
        <Header noShadow={false} transparent style={styles.header}>
          <StatusBar
            backgroundColor={Platform.OS === 'ios' ? null : 'transparent'}
            translucent
            barStyle={'dark-content'}
          />
          <Left>
            <Button
              {...addTestID('back')}
              onPress={this.backClicked}
              transparent
              style={styles.backButton}>
              <EntypoIcons
                size={30}
                color={Colors.colors.mainBlue}
                name="chevron-thin-left"
              />
            </Button>
          </Left>
          <Body />
          <Right />
        </Header>
        <Content showsVerticalScrollIndicator={false}>
          <View style={styles.textBox}>
            <Text style={styles.magicMainText}>
              Sorry, our {'\n'}prescribers aren’t in your state yet.
            </Text>
            <Text style={styles.magicSubText}>
              You won’t be able to meet with this type of provider because you’re not located in Connecticut.
            </Text>
            <Text style={styles.magicSubText}>
              If you selected this by accident, {'\n'}please go back and change it.
            </Text>
            <Text style={styles.magicSubText}>
              Otherwise, you can book an {'\n'}appointment with our matchmakers or {'\n'}coaches - they can practice {'\n'}anywhere.
            </Text>
          </View>
        </Content>
        <View style={styles.greBtn}>
          <PrimaryButton
            bgColor={Colors.colors.primaryText}
            textColor={'#fff'}
            arrowIcon={false}
            testId="backtohome"
            onPress={() => {
              this.navigateToHomeScreen();
            }}
            text="Back to Home"
            disabled={''}
          />
        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 15,
    paddingLeft: 0,
    paddingRight: 0,
    height: HEADER_SIZE,
    ...CommonStyles.styles.headerShadow,
  },
  textBox: {
    paddingLeft: 24,
    paddingRight: 24,
  },
  magicMainText: {
    ...TextStyles.mediaTexts.serifProExtraBold,
    ...TextStyles.mediaTexts.TextH1,
    color: Colors.colors.highContrast,
    marginBottom: 24,
  },
  magicSubText: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.subTextL,
    marginBottom: 30,
    textAlign: 'left',
    color: Colors.colors.mediumContrast,
  },
  greBtn: {
    padding: 24,
    paddingBottom: isIphoneX() ? 36 : 24,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    ...CommonStyles.styles.stickyShadow,
  },
});
