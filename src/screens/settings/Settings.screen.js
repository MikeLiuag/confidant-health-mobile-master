import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {Screens} from '../../constants/Screens';
import {connectAuth} from '../../redux';
import {getAvatar, SettingsComponent, Colors} from 'ch-mobile-shared';
import DeepLinksService from "../../services/DeepLinksService";
import Analytics from "@segment/analytics-react-native";
import {SEGMENT_EVENT} from "../../constants/CommonConstants";
import {Icon} from 'native-base';


const DATA = [
    {
        title: 'Confidant Profile',
        des: 'Manage your Confidant profile settings',
        screen: Screens.UPDATE_PROFILE_SCREEN
    },
    {
        title: 'Mobile Notifications',
        des: 'Manage the notifications and reminders you get from us',
        screen: Screens.NOTIFICATION_SCREEN
    },
    {
        title: 'Wallet',
        des: 'Your Confidant Payment Account',
        screen:Screens.MY_WALLET_SCREEN
    },
    {
        title: 'Support',
        des: 'Contact us to get support',
        screen:Screens.SUPPORT_SCREEN
    },
    {
        title: 'About',
        des: 'Learn about the Confidant app',
        screen:Screens.ABOUT_SCREEN
    },
    {
        title: 'Share',
        des: 'Share the Confidant app',
    },
    {
        title: 'Privacy Policy',
        des: 'Read our privacy policy',
        screen:Screens.PRIVACY_POLICY_SCREEN
    },
    {
        title: 'Terms of Service',
        des: 'Read our terms of service',
        screen:Screens.TERMS_OF_SERVICE_SCREEN
    }
];

class SettingsScreen extends Component<Props> {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            darkMode: false
        };
    }


    toggleDarkMode = ()=>{
        this.setState({
            darkMode: !this.state.darkMode
        })
    }

    shareAppLink = async () => {
        await DeepLinksService.shareAppLink("facebook")
    };

    getSections = ()=>{
        return [
            {
                title: "Main Settings",
                data: [
                    {
                        title: 'Notifications',
                        des: 'Manage notifications',
                        screen: Screens.NOTIFICATION_SCREEN,
                        toggleable: false,
                        renderIcon: (style)=><Icon name={'bell'} type={'Feather'} style={style}/>,
                        iconColor: Colors.colors.secondaryIcon,
                        iconBGColor: Colors.colors.secondaryColorBG,
                        onToggle: null
                    }
                ]
            },
            // {
            //     title: "Dark Mode",
            //     data: [
            //         {
            //             title: 'Dark Mode',
            //             toggleable: true,
            //             onToggle: this.toggleDarkMode,
            //             onPress: this.toggleDarkMode,
            //             des: 'Dark mode is',
            //             renderIcon: (style)=><Icon name={'moon'} type={'Feather'} style={style}/>,
            //             iconColor: Colors.colors.white,
            //             iconBGColor: Colors.colors.neutral300Icon,
            //             checked: this.state.darkMode
            //         }
            //     ]
            // },
            {
                title: "Other Settings",
                data: [
                    {
                        title: 'About',
                        des: 'Learn about the Confidant app',
                        renderIcon: (style)=><Icon name={'info'} type={'Feather'} style={style}/>,
                        iconColor: Colors.colors.successIcon,
                        iconBGColor: Colors.colors.successBG,
                        screen:Screens.ABOUT_SCREEN
                    },
                    {
                        title: 'Share',
                        des: 'Share the Confidant app',
                        renderIcon: (style)=><Icon name={'share'} type={'Feather'} style={style}/>,
                        iconColor: Colors.colors.primaryIcon,
                        iconBGColor: Colors.colors.primaryColorBG,
                        onPress: this.shareAppLink
                    },
                    {
                        title: 'Privacy Policy',
                        des: 'Read our privacy policy',
                        renderIcon: (style)=><Icon name={'shield'} type={'Feather'} style={style}/>,
                        iconColor: Colors.colors.secondaryIcon,
                        iconBGColor: Colors.colors.secondaryColorBG,
                        screen:Screens.PRIVACY_POLICY_SCREEN
                    },
                    {
                        title: 'Terms of Service',
                        des: 'Read our terms of service',
                        renderIcon: (style)=><Icon name={'clipboard-list'} type={'FontAwesome5'} style={style}/>,
                        iconColor: Colors.colors.warningIcon,
                        iconBGColor: Colors.colors.warningBG,
                        screen:Screens.TERMS_OF_SERVICE_SCREEN
                    }
                ]
            }
        ];
    };


    backClicked = () => {
        this.props.navigation.goBack();
    };

    logout = async () => {
        this.props.logout();
        this.props.navigation.navigate(Screens.MAGIC_LINK_SCREEN);
    };

    navigateTo = (itemScreen) => {
        console.log(itemScreen);
        this.props.navigation.navigate(itemScreen);
    };

    shareAppLink = async () => {
        await DeepLinksService.shareAppLink("facebook");
        Analytics.track(SEGMENT_EVENT.APP_SHARED,{
            userId : this.props.auth.meta.userId,
            screenName: '',
            category: 'Goal Completion',
            label: 'App Shared'
        });

    };

    render(): React.ReactNode {
        // StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        let settingsData = DATA;
        if(this.props.profile.patient && !this.props.profile.patient.emailAddress) {
            settingsData = settingsData.filter(setting=>setting.screen!==Screens.CHANGE_PASSWORD_SCREEN);
        }
        return (
            <SettingsComponent
                data={settingsData}
                shareAppLink={this.shareAppLink}
                logout={this.logout}
                sections={this.getSections()}
                name={this.props.profile.patient.fullName}
                avatar={getAvatar(this.props.profile.patient)}
                profileScreen={Screens.UPDATE_PROFILE_SCREEN}
                backClicked={this.backClicked}
                navigateTo={this.navigateTo}
                isMember={true}
            />
        );
    }
}

export default connectAuth()(SettingsScreen);
