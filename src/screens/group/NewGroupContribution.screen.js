import React, {Component} from 'react';
import {Platform, ScrollView, StatusBar, StyleSheet, TouchableOpacity} from 'react-native';
import {Container, Text, View,Left, Body, Title, Button, Right, Header, Content} from 'native-base';
import {
    Colors,
    TextStyles,
    CommonStyles,
    BackButton,
    getHeaderHeight, PrimaryButton, isIphoneX
} from 'ch-mobile-shared';
import {CommonGroupCard} from '../../components/group/CommonGroupCard';
import {Screens} from '../../constants/Screens';

const HEADER_SIZE = getHeaderHeight();

export default class NewGroupContributionScreen extends Component<Props> {

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

    navigateToNext = () => {
        this.props.navigation.navigate(Screens.NEW_CONTRIBUTION_DONE_SCREEN);
    };

    renderPaymentSuggestions = () => {
        return <ScrollView
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.paymentCarousal}
            horizontal
            ref={(ref) => {
                this.scrollView = ref;
            }}
            onLayout={() => {
                setTimeout(() => {
                    if (this.scrollView) {
                        this.scrollView.scrollTo({x: 90, y: 0, animated: true});
                    }
                }, 10);
            }}>
            <TouchableOpacity // key={`suggestion-${index}`}
                style={styles.paymentBox}
            >
                <Text style={styles.payText}>$10</Text>
            </TouchableOpacity>
            <TouchableOpacity // key={`suggestion-${index}`}
                style={styles.paymentBox}
            >
                <Text style={styles.payText}>$10</Text>
            </TouchableOpacity>
            <TouchableOpacity // key={`suggestion-${index}`}
                style={[
                    styles.paymentBox,
                    this.state.itemSelected && {
                        borderWidth: 2,
                        borderColor: Colors.colors.mainPink20
                    },
                ]}
            >
                <Text style={styles.payText}>$10</Text>
                <Text style={styles.popularText}>Popular</Text>
            </TouchableOpacity>
            <TouchableOpacity // key={`suggestion-${index}`}
                style={styles.paymentBox}
            >
                <Text style={styles.payText}>$10</Text>
            </TouchableOpacity>
            <TouchableOpacity // key={`suggestion-${index}`}
                style={styles.paymentBox}
            >
                <Text style={styles.payText}>$10</Text>
            </TouchableOpacity>
        </ScrollView>;
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
                    <Text style={styles.contributionMainTitle}>Contribute to the group</Text>
                    <Text style={styles.contributionSubTitle}>100% of the money you pay for the group goes to clinical care for people who can't currently afford it.</Text>
                    <View style={styles.groupList}>
                        <CommonGroupCard
                            joinedGroup={true}
                            // onPress={this.groupDetails}
                        />
                    </View>

                    {this.renderPaymentSuggestions()}

                    <View style={{paddingHorizontal: 24}}>
                        <View style={[styles.donationAmountView, {...CommonStyles.styles.shadowBox}]}>
                            <Text style={styles.donationAmountHeading}>Your contribution</Text>
                            <View>
                                <Text style={styles.donationAmountNumber}>$10</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.greBtn}>
                        <PrimaryButton
                            testId="continue-btn"
                            text="Continue"
                            onPress={this.navigateToNext}
                        />
                    </View>

                </Content>

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
    contributionMainTitle: {
        ...TextStyles.mediaTexts.serifProExtraBold,
        ...TextStyles.mediaTexts.TextH1,
        color: Colors.colors.highContrast,
        marginTop: 16,
        marginBottom: 8,
        paddingHorizontal: 24
    },
    contributionSubTitle: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.mediumContrast,
        marginBottom: 32,
        paddingHorizontal: 24
    },
    groupList: {
        marginBottom: 32,
        paddingHorizontal: 24
    },
    paymentCarousal: {
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24
    },
    paymentBox: {
        ...CommonStyles.styles.shadowBox,
        borderWidth: 0.5,
        width: 98,
        height: 78,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        marginBottom: 24
    },
    payText: {
        ...TextStyles.mediaTexts.bodyTextS,
        ...TextStyles.mediaTexts.manropeBold,
        color: Colors.colors.primaryText
    },
    popularText: {
        marginTop: 5,
        ...TextStyles.mediaTexts.captionText,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.secondaryText,
    },
    donationAmountView: {
        ...CommonStyles.styles.shadowBox,
        borderWidth: 0.5,
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 32,
        borderRadius: 8,
        height: 64
    },
    donationAmountHeading: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.highContrast
    },
    donationAmountNumber: {
        ...TextStyles.mediaTexts.bodyTextL,
        ...TextStyles.mediaTexts.manropeMedium,
        color: Colors.colors.highContrast,
        textAlign: 'center'
    },
    greBtn: {
        // ...CommonStyles.styles.stickyShadow,
        padding: 24,
        paddingBottom: isIphoneX() ? 36 : 24,
        borderRadius: 12
    },
});
