import React, {Component} from 'react';
import {Image, Platform, ScrollView, StatusBar, StyleSheet} from 'react-native';
import {Container, Text, View,Left, Body, Title, Button, Right, Header, Content} from 'native-base';
import {
    Colors,
    TextStyles,
    CommonStyles,
    BackButton,
    getHeaderHeight, PrimaryButton, isIphoneX, addTestID
} from 'ch-mobile-shared';
import {Screens} from '../../constants/Screens';

const HEADER_SIZE = getHeaderHeight();

export default class NewContributionDoneScreen extends Component<Props> {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            itemSelected: true
        };
    }

    goBack = () => {
        this.props.navigation.goBack();
    };


    componentDidMount(): void {

    }

    componentWillUnmount(): void {

    }

    navigateToAllGroups = () => {
        this.props.navigation.navigate(Screens.ALL_GROUPS_SCREEN);
    };

    render = () => {
        return (
            <Container style={{backgroundColor: Colors.colors.screenBG}}>
                <Header transparent style={styles.header}>
                    <StatusBar
                        backgroundColor={Platform.OS === 'ios' ? null : 'transparent'}
                        translucent
                        barStyle={'dark-content'}
                    />
                    <Left>
                        <BackButton onPress={this.goBack} />
                    </Left>
                    <Body />
                    <Right />
                </Header>

                <Content>
                    <View style={styles.mainWrapper}>
                        <Image
                            {...addTestID('contribute-img')}
                            resizeMode={'contain'}
                            style={styles.handImg}
                            source={require('../../assets/images/group-donation-icon.png')}/>

                        <Text style={styles.contributionMainTitle}>Amazing {'\n'} contribution!</Text>
                        <Text style={styles.contributionSubText}>Thank you for paying it forward!
                            By contributing to the Confidant community you're making it possible for people to access care that
                            can't currently afford it. </Text>
                        <Text style={styles.contributionSubText}>Together, we are transforming access to high-quality care for mental health and substance use disorders.</Text>

                    </View>

                </Content>
                <View style={styles.greBtn}>
                    <PrimaryButton
                        testId="continue-btn"
                        text="Continue"
                        onPress={this.navigateToAllGroups}
                    />
                </View>
            </Container>
        );
    };
}


const styles = StyleSheet.create({
    header: {
        paddingTop: 15,
        paddingHorizontal: 24,
        elevation: 0,
        height: HEADER_SIZE,
    },
    mainWrapper: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16
    },
    handImg: {
        width: 112,
        height: 112,
        marginBottom: 40
    },
    contributionMainTitle: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.highContrast,
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center'
    },
    contributionSubText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.mediumContrast,
        marginBottom: 32,
        textAlign: 'center'
    },
    greBtn: {
        ...CommonStyles.styles.stickyShadow,
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        borderRadius: 12
    },
});
