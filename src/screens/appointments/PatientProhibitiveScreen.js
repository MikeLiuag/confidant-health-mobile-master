import React from "react";
import {Platform, StatusBar, StyleSheet} from "react-native";
import {Body, Button, Container, Content, Header, Left, Right, Text, View} from "native-base";
import {
    addTestID,
    Colors,
    CommonStyles,
    getHeaderHeight,
    isIphoneX,
    PrimaryButton,
    TextStyles,
} from "ch-mobile-shared";
import EntypoIcons from 'react-native-vector-icons/Entypo';
import {Screens} from "../../constants/Screens";
import {NavigationActions, StackActions} from "react-navigation";
import LottieView from "lottie-react-native";
import alfie from "../../assets/animations/Dog_with_Can.json";

const HEADER_SIZE = getHeaderHeight();

export default class PatientProhibitiveScreen extends React.PureComponent<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };


     navigateToTabView = () =>{
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: Screens.TAB_VIEW})],
        });

        this.props.navigation.dispatch(resetAction);
    }

    getEmptyMessages =() => {
        return (
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
                <Text style={styles.emptyTextDes}>Right now, your ability to book appointments in the app is turned off. Please contact your matchmaker or emails us at help@confidanthealth to get this turned back on.</Text>

            </View>
        );
    };

    render() {
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
                <Content>
                    {this.getEmptyMessages()}
                </Content>

                <View style={styles.greBtn}>
                    <PrimaryButton
                        bgColor={Colors.colors.primaryText}
                        textColor={Colors.colors.whiteColor}
                        arrowIcon={false}
                        testId="back-to-home"
                        onPress={() => {
                            this.navigateToTabView();
                        }}
                        text="Back to Home"
                    />
                </View>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingLeft: 24,
        paddingRight: 24,
        height: HEADER_SIZE,
        // ...CommonStyles.styles.headerShadow,
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
        marginBottom:0,
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        ...CommonStyles.styles.stickyShadow
    },
    emptyView: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
        paddingBottom: 20
    },
    emptyAnim: {
        width: '90%',
        alignSelf: 'center',
        marginBottom: 30,
        paddingLeft: 20,
    },
    emptyTextMain: {
        ...TextStyles.mediaTexts.serifProMedium,
        ...TextStyles.mediaTexts.TextH7,
        color: Colors.colors.darkBlue,
        alignSelf: 'center',
        marginBottom: 20
    },
    emptyTextDes: {
        alignSelf: 'center',
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.TextH6,
        color: Colors.colors.lightText2,
        paddingLeft: 30,
        paddingRight: 30,
        textAlign: 'center',
    },
});
