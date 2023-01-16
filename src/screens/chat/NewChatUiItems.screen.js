import React, { Component } from "react";
import { AppState, Platform, ScrollView, StatusBar, StyleSheet, Image, FlatList } from "react-native";
import { Button, Content, Container, Header, Icon, Text, View, Left, Right, Body, Title } from "native-base";
import { connectConnections } from "../../redux";
import {
    addTestID,
    isIphoneX, BackButton, CommonSegmentHeader, SingleCheckListItem,
    Colors, CommonStyles, TextStyles,
    getHeaderHeight
} from 'ch-mobile-shared';
import Modal from "react-native-modalbox";


const HEADER_SIZE = getHeaderHeight();
const DATA = [
    {
        title: 'Members',
    },
    {
        title: 'Providers',
    },
    {
        title: 'Chatbots',
    },
    {
        title: 'Support Groups',
    }
];


class NewChatUiItemsScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentDidUpdate() {

    }


    componentDidMount() {

    };

    navigateBack() {
        this.props.navigation.goBack();
    }

    showFilterOptions = () => {
        this.refs?.chatFilterDrawer?.open()
    };

    render = () => {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle("dark-content", true);
        return (
            <Container style={styles.container}>
                <Header
                    {...addTestID("Header")}
                    noShadow transparent style={styles.chatHeader}>
                    <StatusBar
                        backgroundColor={Platform.OS === "ios" ? null : "transparent"}
                        translucent
                        barStyle={"dark-content"}
                    />
                    <Left>
                        <BackButton
                            {...addTestID('Back')}
                            onPress={() => this.navigateBack()}
                        />
                    </Left>
                    <Body style={{flex: 2}}>
                        <Title style={styles.chatHeaderText}>Chats</Title>
                    </Body>
                    <Right>
                        <Button
                            style={styles.filterBtn}
                            onPress={this.showFilterOptions}
                            transparent>
                            <Image
                                style={styles.filterIcon}
                                resizeMode={'contain'}
                                source={require('../../assets/images/Filter-icon.png')} />
                        </Button>
                    </Right>
                </Header>
                <Content contentContainerStyle={{ padding: 24 }}>

                   <CommonSegmentHeader
                       firstTabText={'Active'}
                       secondTabText={'Archive'}
                   />

                </Content>



                <Modal
                    backdropPressToClose={true}
                    backdropColor={ Colors.colors.overlayBg}
                    backdropOpacity={1}
                    // onClosed={true}
                    style={{...CommonStyles.styles.commonModalWrapper, maxHeight: 440 }}
                    entry={"bottom"}
                    position={"bottom"} ref={"chatFilterDrawer"} swipeArea={100}>
                    <View style={{...CommonStyles.styles.commonSwipeBar}}
                          {...addTestID('swipeBar')}
                    />
                    <View style={styles.filterList}>
                        <View style={styles.filterTopHead}>
                            <Text style={styles.filterHeadText}>Filter Results</Text>
                            <Text style={styles.filterTotalText}>24 total</Text>
                        </View>
                        <FlatList
                            data={DATA}
                            renderItem={({item,index}) =>
                                <SingleCheckListItem
                                    listTestId={'list - ' + index+1}
                                    checkTestId={'checkbox - ' + index+1}
                                    keyId={index}
                                    // listPress={() => this.updateList(item.title)}
                                    itemSelected={false}
                                    itemTitle={item.title}
                                    checkID={'checkbox - ' + index+1}
                                />
                            }
                            keyExtractor={item => item.id}
                        />
                    </View>
                </Modal>
            </Container>
        );
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: Colors.colors.screenBG,
    },
    chatHeader: {
        paddingTop: 15,
        paddingLeft: 18,
        paddingRight: 24,
        elevation: 0,
        height: HEADER_SIZE,
    },
    chatHeaderText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.TextH5
    },
    filterBtn: {
        paddingLeft: 0,
        paddingRight: 0
    },
    filterIcon: {
        width: 24
    },
    filterTopHead: {
        flexDirection: 'row',
        marginBottom: 24,
        justifyContent: 'space-between'
    },
    filterHeadText: {
        color: Colors.colors.highContrast,
        ...TextStyles.mediaTexts.serifProBold,
        ...TextStyles.mediaTexts.TextH3
    },
    filterTotalText: {
        color: Colors.colors.lowContrast,
        ...TextStyles.mediaTexts.manropeBold,
        ...TextStyles.mediaTexts.subTextS,
        marginLeft: 8
    },
});
export default connectConnections()(NewChatUiItemsScreen);
