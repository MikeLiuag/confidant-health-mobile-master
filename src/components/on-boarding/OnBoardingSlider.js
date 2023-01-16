/**
 * Created by Sana on 1/31/2019.
 */

import React, { Component } from 'react';
import {StyleSheet, Image, StatusBar, ScrollView} from 'react-native';
import { View, Text, Content, Container } from 'native-base';
import Swiper from 'react-native-swiper';
import {
  addTestID,
  isIphoneX,
  PrimaryButton,
  ProgressBars,
  Colors,
  TextStyles,
  CommonStyles,
  BackButton,
  getHeaderHeight
} from 'ch-mobile-shared';
const HEADER_SIZE = getHeaderHeight();
export default class OnBoardingSlider extends Component<Props> {

  constructor(props){
    super(props);
    this.state= {
      contentLength: 0,
      type: []
    }
  }

  render() {
    return (

        <View style={styles.mainWrapper}>
          <StatusBar
              backgroundColor="transparent"
              barStyle="dark-content"
              translucent
          />
          <Swiper showsButtons={false}
                  ref='boardingSwiper'
                  loop={false}
                  removeClippedSubviews={true}
                  automaticallyAdjustContentInsets={true}
                  loadMinimal
                  showsPagination={false}
                  onIndexChanged={this.playAnim}
          >
            <View style={styles.slide}>
              <View style={styles.slideContent}>
                <View style={{...styles.sliderHeader}}>
                  <View></View>
                  <View style={{flex:2}}>
                    {/*<ProgressBars*/}
                    {/*    index={0}*/}
                    {/*    totalBars={6}*/}
                    {/*/>*/}
                  </View>
                  <View></View>
                </View>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.sliderIconWrapper}>
                  <Image
                      style={{ ...styles.providersIcon, height: 348 }}
                      source={require("../../assets/images/onBoarding-1.png")}
                      resizeMode={"contain"} />
                </View>
                <View style={styles.contentWrapper}>
                  <Text  style={styles.title}>
                    Confidant is a community
                    of people helping each
                    other thrive.
                  </Text>
                </View>
              </ScrollView>
              <View {...addTestID("view")} style={styles.greBtn}>
                <PrimaryButton
                    text="Continue"
                    testId="continue"
                    arrowIcon={true}
                    // disabled={true}
                    // bgColor={Colors.colors.mainPink}
                    // textColor={Colors.colors.highContrast}
                    onPress={() => {
                      this.refs?.boardingSwiper.scrollBy(1);
                    }}
                />
                <Text style={{ ...CommonStyles.styles.blueLinkText }}
                      onPress={this.props.onLogin}>
                  I already have an account
                </Text>
              </View>
            </View>
            <View style={styles.slide}>
              <View style={styles.slideContent}>
                <View style={{...styles.sliderHeader}}>
                  <View>
                    <BackButton
                        onPress={() => {
                          this.refs?.boardingSwiper.scrollBy(-1);
                        }}
                    />
                  </View>
                  <View style={{flex:2}}>
                    {/*<ProgressBars*/}
                    {/*    index={1}*/}
                    {/*    totalBars={6}*/}
                    {/*/>*/}
                  </View>
                  <View></View>
                </View>

              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.sliderIconWrapper}>
                  <Image
                      style={{ ...styles.providersIcon, height: 269 }}
                      source={require("../../assets/images/onBoarding-2.png")}
                      resizeMode={"contain"} />
                </View>
                <View style={styles.contentWrapper}>
                  <Text style={styles.title}>
                    There are <Text style={styles.pinkText}>no barriers</Text>
                    {"\n"}to care in Confidant.
                  </Text>
                  <Text style={styles.singleParah}>
                    We are here to help you reach your goals without judgement. If you can’t afford it, the community helps you.
                  </Text>
                </View>
              </ScrollView>
              <View {...addTestID("view")} style={styles.greBtn}>
                <PrimaryButton
                    text="Continue"
                    testId="continue"
                    arrowIcon={true}
                    onPress={() => {
                      this.refs?.boardingSwiper.scrollBy(1);
                    }}
                />
                <Text style={{ ...CommonStyles.styles.blueLinkText }}
                      onPress={this.props.onLogin}>
                  I already have an account
                </Text>
              </View>
            </View>
            <View style={styles.slide}>
              <View style={styles.slideContent}>
                <View style={{...styles.sliderHeader}}>
                  <View>
                    <BackButton
                        onPress={() => {
                          this.refs?.boardingSwiper.scrollBy(-1);
                        }}
                    />
                  </View>
                  <View style={{flex:2}}>
                    {/*<ProgressBars*/}
                    {/*    index={2}*/}
                    {/*    totalBars={6}*/}
                    {/*/>*/}
                  </View>
                  <View></View>
                </View>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.sliderIconWrapper}>
                  <Image
                      style={{ ...styles.providersIcon, height: 249 }}
                      source={require("../../assets/images/onBoarding-3.png")}
                      resizeMode={"contain"} />
                </View>
                <View style={styles.contentWrapper}>
                  <Text isTruncated={true} style={styles.title}>
                    We have some of {"\n"}
                    <Text style={styles.pinkText}>the best</Text> providers.
                  </Text>
                  <Text style={styles.singleParah}>
                    Most of our providers also work at high-end facilities.
                    They practice in Confidant for the community.
                  </Text>
                </View>
              </ScrollView>
              <View {...addTestID("view")} style={styles.greBtn}>
                <PrimaryButton
                    text="Continue"
                    testId="continue"
                    arrowIcon={true}
                    onPress={() => {
                      this.refs?.boardingSwiper.scrollBy(1);
                    }}
                />
                <Text style={{ ...CommonStyles.styles.blueLinkText }}
                      onPress={this.props.onLogin}>
                  I already have an account
                </Text>
              </View>
            </View>
            <View style={styles.slide}>
              <View style={styles.slideContent}>
                <View style={{...styles.sliderHeader}}>
                  <View>
                    <BackButton
                        onPress={() => {
                          this.refs?.boardingSwiper.scrollBy(-1);
                        }}
                    />
                  </View>
                  <View style={{flex:2}}>
                    {/*<ProgressBars*/}
                    {/*    index={3}*/}
                    {/*    totalBars={6}*/}
                    {/*/>*/}
                  </View>
                  <View></View>
                </View>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.sliderIconWrapper}>
                  <Image
                      style={[styles.providersIcon, { height: 248 }]}
                      source={require("../../assets/images/onBoarding-4.png")}
                      resizeMode={"contain"} />
                </View>
                <View style={styles.contentWrapper}>
                  <Text style={styles.title}>
                    Your program {"\n"}
                    is <Text style={styles.pinkText}>unique to you</Text>.
                  </Text>
                  <Text style={styles.singleParah}>
                    Confidant is not a one-size-fits-all approach.
                    That's because research shows that different treatments are better for different people.
                  </Text>
                </View>
              </ScrollView>
              <View {...addTestID("view")} style={styles.greBtn}>
                <PrimaryButton
                    text="Continue"
                    testId="continue"
                    arrowIcon={true}
                    onPress={() => {
                      this.refs?.boardingSwiper.scrollBy(1);
                    }}
                />
                <Text style={{ ...CommonStyles.styles.blueLinkText }}
                      onPress={this.props.onLogin}>
                  I already have an account
                </Text>
              </View>
            </View>
            <View style={styles.slide}>
              <View style={styles.slideContent}>
                <View style={{...styles.sliderHeader}}>
                  <View>
                    <BackButton
                        onPress={() => {
                          this.refs?.boardingSwiper.scrollBy(-1);
                        }}
                    />
                  </View>
                  <View style={{flex:2}}>
                    {/*<ProgressBars*/}
                    {/*    index={4}*/}
                    {/*    totalBars={6}*/}
                    {/*/>*/}
                  </View>
                  <View></View>
                </View>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.sliderIconWrapper}>
                  <Image
                      style={{ ...styles.providersIcon, height: 294 }}
                      source={require("../../assets/images/onBoarding-5.png")}
                      resizeMode={"contain"} />
                </View>
                <View style={styles.contentWrapper}>
                  <Text style={styles.title}>
                    Every Member gives {"\n"}
                    at least <Text style={styles.pinkText}>$1 to help</Text> {"\n"}
                    someone else.
                  </Text>
                  <Text style={styles.singleParah}>
                    Most people contribute more.
                    We ask you contribute what you
                    can.
                  </Text>
                </View>
              </ScrollView>
              <View {...addTestID("view")} style={styles.greBtn}>
                <PrimaryButton
                    text="Continue"
                    testId="continue"
                    arrowIcon={true}
                    onPress={() => {
                      this.refs?.boardingSwiper.scrollBy(1);
                    }}
                />
                <Text style={{ ...CommonStyles.styles.blueLinkText }}
                      onPress={this.props.onLogin}>
                  I already have an account
                </Text>
              </View>
            </View>
            <View style={styles.slide}>
              <View style={styles.slideContent}>
                <View style={{...styles.sliderHeader}}>
                  <View>
                    <BackButton
                        onPress={() => {
                          this.refs?.boardingSwiper.scrollBy(-1);
                        }}
                    />
                  </View>
                  <View style={{flex:2}}>
                    {/*<ProgressBars*/}
                    {/*    index={5}*/}
                    {/*    totalBars={6}*/}
                    {/*/>*/}
                  </View>
                  <View></View>
                </View>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.sliderIconWrapper}>
                  <Image
                      style={[styles.providersIcon, { height: 150 }]}
                      source={require("../../assets/images/onBoarding-6.png")}
                      resizeMode={"contain"} />
                </View>
                <View style={styles.contentWrapper}>
                  <Text style={styles.title}>
                    We have fully {"\n"}
                    <Text style={styles.pinkText}>transparent pricing.</Text>
                  </Text>
                  <Text style={styles.singleParah}>
                    There are no hidden fees or surprise bills. We show you exactly what our services cost to deliver
                    and recommend a price for you to pay before you ever meet with a provider.
                    {"\n"} {"\n"}
                    If you can't afford it, pay what you can. If you value our services, pay it forward so more people
                    can
                    access them.
                  </Text>
                </View>
              </ScrollView>
              <View {...addTestID("view")} style={styles.greBtn}>
                <PrimaryButton
                    text="Continue"
                    testId="continue"
                    arrowIcon={true}
                    onPress={this.props.onSkip}
                />
                <Text style={{ ...CommonStyles.styles.blueLinkText }}
                      onPress={this.props.onLogin}>
                  I already have an account
                </Text>
              </View>
            </View>
          </Swiper>
        </View>
    );
  }
}


const styles = StyleSheet.create({
  mainWrapper:{
    flex: 1,
  },
  slide: {
    flex: 1,
  },
  slideContent: {
    alignItems: "center",
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: isIphoneX() ? 12 : 0,
    position: "relative",
  },
  sliderHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: HEADER_SIZE,
    // marginTop: 30,

  },
  sliderIconWrapper: {
    alignItems: "center",
  },
  contentWrapper: {
    paddingTop: 50,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 50,
  },
  backBtnView: {
    position: "absolute",
    left: 23,
    top: 36,
  },
  providersIcon: {
    width: 350,
    maxHeight: 348,
    marginTop: 40,
  },
  title: {
    ...TextStyles.mediaTexts.serifProBold,
    ...TextStyles.mediaTexts.TextH3,
    color: Colors.colors.highContrast,
    textAlign: "center",
    marginBottom: 16,
  },
  pinkText: {
    ...TextStyles.mediaTexts.serifProBold,
    ...TextStyles.mediaTexts.TextH3,
    color: Colors.colors.mainPink,
  },
  singleParah: {
    ...TextStyles.mediaTexts.bodyTextM,
    ...TextStyles.mediaTexts.manropeRegular,
    color: Colors.colors.mediumContrast,
    textAlign: "center",
    marginBottom: 16,
  },
  greBtn: {
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: isIphoneX() ? 44 : 24,
  },

});
