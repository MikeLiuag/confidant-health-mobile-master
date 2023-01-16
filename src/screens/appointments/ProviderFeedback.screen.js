import React, {Component} from 'react';
import {Platform, StatusBar, StyleSheet} from 'react-native';
import {Container, Text, View, Button, Content, Header, Left, Body, Right, Icon, Form} from 'native-base';
import {
    Colors,
    TextStyles,
    CommonStyles,
    addTestID,
    BackButton,
    getHeaderHeight, isIphoneX,
    PrimaryButton,
    CommonTextArea, Public_TextArea_Label, Private_TextArea_Label
} from 'ch-mobile-shared';
import Modal from 'react-native-modalbox';

const HEADER_SIZE = getHeaderHeight();

export default class ProviderFeedbackScreen extends Component<Props> {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            modalVisible:true,
        };
    }

    componentDidMount(): void {

    }

    componentWillUnmount(): void {

    }

    showInfoDrawer = () => {
        this.refs?.infoDrawer?.open()
    };
    backClicked = () => {
        this.props.navigation.goBack();
    };

    render =() =>{
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);

        return (
            <Container style={{ backgroundColor: Colors.colors.screenBG }}>
                <Header transparent
                        style={styles.headerWrap}>
                    <StatusBar
                        backgroundColor={Platform.OS === 'ios'? null : "transparent"}
                        translucent
                        barStyle={'dark-content'}
                    />
                    <Left>
                        <BackButton
                            onPress={this.backClicked}
                        />
                    </Left>
                    <Body />
                    <Right />
                </Header>
                <Content>
                    <View style={styles.titleWrap}>
                        <Text style={styles.mainHeading}>
                            Provider feedback
                        </Text>
                        <Text style={styles.subText}>
                            Your feedback is important to us and to the Confidant community.
                        </Text>
                    </View>
                    <Form style={styles.fieldsWrapper}>
                        <View style={styles.singleField}>
                            <View style={styles.headWrapper}>
                                <View style={styles.infoWrap}>
                                    <Text style={styles.boldText}>Public feedback</Text>
                                    <Button
                                        onPress={this.showInfoDrawer}
                                        transparent>
                                        <Icon name={'info'} type={'Feather'} style={styles.infoIcon}/>
                                    </Button>
                                </View>
                                <Text style={styles.greyText}>Optional</Text>
                            </View>
                            <View style={styles.textareaWrapper}>
                                <CommonTextArea
                                    testID={'Enter-public-comment'}
                                    value={'He is a great provider'}
                                    autoFocus={false}
                                    multiline={true}
                                    borderColor={Colors.colors.borderColor}
                                    placeholderText={Public_TextArea_Label}
                                    // onChangeText={this.onChangePublicText}
                                    // getRef={this.publicGetRef}
                                />
                            </View>
                        </View>


                        <View style={styles.singleField}>
                            <View style={styles.headWrapper}>
                                <View style={styles.infoWrap}>
                                    <Text style={styles.boldText}>Private feedback</Text>
                                    <Button
                                        onPress={this.showInfoDrawer}
                                        transparent>
                                        <Icon name={'info'} type={'Feather'} style={styles.infoIcon}/>
                                    </Button>
                                </View>
                                <Text style={styles.greyText}>Optional</Text>
                            </View>
                            <View style={styles.textareaWrapper}>
                                <CommonTextArea
                                    testID={'Enter-Private-Feedback'}
                                    value={'Great session, thanks!'}
                                    autoFocus={false}
                                    multiline={true}
                                    borderColor={Colors.colors.borderColor}
                                    placeholderText={Private_TextArea_Label}
                                    // onChangeText={this.onChangePrivateText}
                                    // getRef={this.privateGetRef}
                                />
                            </View>
                        </View>
                    </Form>
                </Content>
                <View style={styles.greBtns}>
                    <PrimaryButton
                        arrowIcon={true}
                        text={'Continue'}
                    />
                </View>


                <Modal
                    backdropPressToClose={true}
                    backdropColor={ Colors.colors.overlayBg}
                    backdropOpacity={1}
                    // onClosed={true}
                    style={{...CommonStyles.styles.commonModalWrapper, maxHeight: 300 }}
                    entry={"bottom"}
                    position={"bottom"} ref={"infoDrawer"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <View style={styles.infoDetails}>
                        <Text style={styles.infoMainText}>Thank you for providing feedback!</Text>
                        <Text style={styles.infoSubText}>Feedback helps to shape everything we do. We strive to meet your needs and are always working to improve. Public feedback also helps other members select their provider.</Text>
                    </View>
                </Modal>
            </Container>
        );
    }
}


const styles = StyleSheet.create({
    headerWrap: {
        paddingLeft: 22,
        paddingRight: 18,
        height: HEADER_SIZE
    },
    moreIcon: {
        color: Colors.colors.primaryIcon,
        fontSize: 30
    },
    titleWrap: {
        padding: 24
    },
    mainHeading: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.TextH1,
        ...TextStyles.mediaTexts.serifProExtraBold,
        marginBottom: 8,
        textAlign: 'center'
    },
    subText: {
        color: Colors.colors.mediumContrast,
        ...TextStyles.mediaTexts.bodyTextM,
        ...TextStyles.mediaTexts.manropeRegular,
        textAlign: 'center'
    },
    fieldsWrapper: {
        paddingHorizontal: 24,
        paddingTop: 8
    },
    singleField: {
        marginBottom: 24
    },
    headWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    boldText: {
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextM,
        color: Colors.colors.highContrast
    },
    infoWrap: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    infoIcon: {
        color: Colors.colors.primaryIcon,
        fontSize: 24
    },
    greyText: {
        ...TextStyles.mediaTexts.manropeMedium,
        ...TextStyles.mediaTexts.captionText,
        color: Colors.colors.lowContrast
    },
    textareaWrapper: {
        marginBottom: 24
    },
    greBtns: {
        paddingHorizontal: 24,
        paddingBottom: isIphoneX()? 34 : 24
    },
    infoDetails: {

    },
    infoMainText: {
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3,
        color: Colors.colors.highContrast,
        marginBottom: 24
    },
    infoSubText: {
        ...TextStyles.mediaTexts.manropeRegular,
        ...TextStyles.mediaTexts.bodyTextM,
        color: Colors.colors.highContrast
    }
});
