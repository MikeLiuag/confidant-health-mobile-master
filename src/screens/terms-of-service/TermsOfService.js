import React, {Component} from 'react';
import {Body, Button, Container, Content, Header, Left, Right, Text, Title, View,} from 'native-base';
import {Linking, StatusBar, StyleSheet, Platform} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import {addTestID, getHeaderHeight} from 'ch-mobile-shared';

const HEADER_SIZE = getHeaderHeight();

export default class TermsOfService extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {};
    }

    backClicked = () => {
        this.props.navigation.goBack();
    };

    render() {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <Container>
                <Header transparent style={styles.chatHeader}>
                    <StatusBar
                        backgroundColor={Platform.OS === 'ios'? null : "transparent"}
                        translucent
                        barStyle={'dark-content'}
                    />
                    <Left>
                        <Button
                            {...addTestID('Back')}
                            transparent style={styles.backButton} onPress={() => {
                            this.backClicked();
                        }}>
                            <Icon name='angle-left' size={32} color="#3fb2fe"/>
                        </Button>
                    </Left>
                    <Body style={{ flex: 2}}>
                        <Title
                            style={styles.headerText}>Terms of Service</Title>
                    </Body>
                    <Right/>
                </Header>
                <Content showsVerticalScrollIndicator={false}
                    {...addTestID('Content-details')}
                >
                    <View style={styles.mainContent}>
                        <Text style={styles.headingText}>1. Terms</Text>
                        <Text style={styles.detailText}>By accessing the website at<Text style={styles.detailTextLink} onPress={()=>{ Linking.openURL('http://confidanthealth.com')}}> http://confidanthealth.com </Text>or utilizing its mobile app, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.</Text>

                        <Text style={styles.headingText}>2. Use License</Text>
                        <Text style={styles.detailText}>Permission is granted to temporarily download one copy of the materials (information or software) on Confidant Health's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</Text>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>modify or copy the materials;</Text>
                        </View>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</Text>
                        </View>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>attempt to decompile or reverse engineer any software contained on Confidant Health's website;</Text>
                        </View>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>remove any copyright or other proprietary notations from the materials; or</Text>
                        </View>
                        <View style={styles.detailTextDash}>
                            <Text>-</Text><Text style={styles.detailTextList}>transfer the materials to another person or "mirror" the materials on any other server.</Text>
                        </View>
                        <Text style={styles.detailText}>This license shall automatically terminate if you violate any of these restrictions and may be terminated by Confidant Health at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.</Text>

                        <Text style={styles.headingText}>3. Disclaimer</Text>
                        <Text style={styles.detailText}>The materials on Confidant Health's website are provided on an 'as is' basis. Confidant Health makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</Text>
                        <Text style={styles.detailText}>Further, Confidant Health does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.</Text>
                        <Text style={styles.headingText}>4. Limitations</Text>
                        <Text style={styles.detailText}>In no event shall Confidant Health or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Confidant Health's website, even if Confidant Health or a Confidant Health authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.</Text>


                        <Text style={styles.headingText}>5. Accuracy of materials</Text>
                        <Text style={styles.detailText}>The materials appearing on Confidant Health's website could include technical, typographical, or photographic errors. Confidant Health does not warrant that any of the materials on its website are accurate, complete or current. Confidant Health may make changes to the materials contained on its website at any time without notice. However Confidant Health does not make any commitment to update the materials.</Text>
                        <Text style={styles.headingText}>6. Links</Text>
                        <Text style={styles.detailText}>Confidant Health has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Confidant Health of the site. Use of any such linked website is at the user's own risk.</Text>

                        <Text style={styles.headingText}>7. Modifications</Text>
                        <Text style={styles.detailText}>Confidant Health may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.</Text>

                        <Text style={styles.headingText}>8. Governing Law</Text>
                        <Text style={styles.detailText}>These terms and conditions are governed by and construed in accordance with the laws of Texas and you irrevocably submit to the exclusive jurisdiction of the courts in that State, and within Travis County.</Text>
                    </View>

                </Content>
            </Container>
        );
    }

}
const styles = StyleSheet.create({
    chatHeader: {
        backgroundColor: 'white',
        borderBottomColor: '#f5f5f5',
        borderBottomWidth: 1,
        elevation: 0,
        height: HEADER_SIZE,
    },
    headerText: {
        color: '#30344D',
        fontFamily: "Roboto-Regular",
        fontWeight: "600",
        fontSize: 20
    },
    mainContent:{
        padding:25,
    },
    headingText:{
        color: '#30344D',
        fontFamily: "Roboto-Regular",
        fontWeight: "800",
        fontSize: 18,
        marginTop:10,
        marginBottom:10,
    },
    backButton: {
        width: 30,
        marginLeft: 16,
        paddingLeft: 0
    },
    detailTextDash:{
        display:'flex',
        flexDirection:'row',
        marginLeft:20,

    },
    detailText:{
        color: '#30344D',
        fontFamily: "Roboto-Regular",
        fontWeight: "300",
        fontSize: 14,
        textAlign:'justify',
        marginBottom:5,
        lineHeight: 20,
    },
    detailTextList:{
        color: '#30344D',
        fontFamily: "Roboto-Regular",
        fontWeight: "200",
        fontSize: 14,
        textAlign:'justify',
        marginBottom:5,
        marginLeft:20,
        lineHeight: 20,
    },

    detailTextLink:{
        color: '#00C8FE',
        fontFamily: "Roboto-Regular",
        fontWeight: "300",
        fontSize: 14,
        textAlign:'justify',
        marginBottom:5,
        lineHeight: 20,
    },
    container: {
        flex: 1,
        justifyContent: 'center'
    },

    loadersty: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(255, 255, 255, 0.8)'
    },
});
