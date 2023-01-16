import {Linking} from 'react-native';
import NavigationService from "./NavigationService";
import AuthStore from './../utilities/AuthStore';
import {APP_PREFIX, CONTENT_TYPE, PUBLIC_WEBSITE_URL_FOR_BRANCH_CANONICAL_URL} from '../constants/CommonConstants';
import branch from 'react-native-branch';
import {Screens} from '../constants/Screens';
import Analytics from "@segment/analytics-react-native";

export default class DeepLinksService {

    static lastUriServed = null;

    static init() {
        Linking.addEventListener('url', this.handleUrl);

        Analytics.getAnonymousId().then(anonymousId => {
            branch.setIdentity(anonymousId)
            branch.subscribe(this.handleBranchLink);
        })

        Linking.getInitialURL().then((url) => {
            if (url) {
                this.navigateToUrl(url);
            }
        }).catch(err => console.error('An error occurred', err));

    }

    static handleUrl = (e) => {
        const route = e.url.replace(/.*?:\/\//g, '');
        this.navigateToUrl(route);
    };

    static async persistParams(params) {

        if (params) {
            const refinedParams = {};

            if (params.provider) {
                refinedParams.provider = params.provider;
            }
            if (params.recommendProvider) {
                refinedParams.recommendProvider = params.recommendProvider;
            }
            if (params.contentfulData) {
                refinedParams.contentfulData = params.contentfulData;
            }
            if (params.groupChannelInfo) {
                refinedParams.groupChannelInfo = params.groupChannelInfo;
            }
            if (params.profileElementData) {
                refinedParams.profileElementData = params.profileElementData;
            }
            if (params.appointment) {
                refinedParams.appointment = params.appointment;
            }
            if (params.formUrl) {
                refinedParams.formUrl = params.formUrl;
            }
            if (params.name) {
                refinedParams.name = params.name;
            }
            if (params.chatbot) {
                refinedParams.chatbot = params.chatbot;
            }
            refinedParams.navigateTo = params.navigateTo;
            await AuthStore.storeBranchParams(refinedParams)
        }
    };

    static handleBranchLink = async ({error, params, uri}) => {
        if (params && params['+non_branch_link']) {
            const nonBranchLink = params['+non_branch_link'];

            if (nonBranchLink.includes('magiclink')) {
                if (nonBranchLink !== DeepLinksService.lastUriServed) {
                    DeepLinksService.lastUriServed = nonBranchLink;
                    await DeepLinksService.navigateToUrl(nonBranchLink);

                    return;
                } else {
                    return;
                }
            }
        }
        if (uri && uri.includes('magiclink')) {
            await DeepLinksService.navigateToUrl(uri);
            return;
        }
        if (error) {
            console.log('Error from branch: ' + error);
            return;
        }

        if (!params['+clicked_branch_link']) {
            //Indicates initialization success and some other conditions
            //No link was opened
            console.log('No Link was opened');
            return;
        }
        // A Branch link was opened.
        // Route link based on data in params, e.g.

        //Now push the view for this URL
        const contentType = params.$content_type;
        const canonicalIdentifier = params.$canonical_identifier;
        if (contentType === CONTENT_TYPE.SHARE_PROVIDER_PROFILE) {
            let localParams = {
                navigateTo: Screens.PROVIDER_DETAIL_SCREEN,
                provider: {
                    userId: params.providerId
                },
            };
            await DeepLinksService.persistParams(localParams);
        } else if (contentType === CONTENT_TYPE.RECOMMEND_PROVIDER_PROFILE) {
            await DeepLinksService.persistParams({
                recommendProvider: {
                    providerId: params.providerId,
                    contentType: contentType
                }
            });
        } else if (contentType === CONTENT_TYPE.EDUCATION_CONTENT) {
            await DeepLinksService.persistParams({
                contentfulData: {
                    contentId: params.contentId,
                    contentType: contentType,
                    categorySlug: params.categorySlug,
                    topicSlug: params.topicSlug,
                }
            });
        } else if (contentType === CONTENT_TYPE.GROUP_RECOMMENDATION) {
            await DeepLinksService.persistParams({
                groupChannelInfo: {
                    groupChannelUrl: params.GroupChannelUrl,
                    contentType: contentType
                }
            });
        } else if (contentType === CONTENT_TYPE.PROFILE_ELEMENT) {
            await DeepLinksService.persistParams({
                profileElementData: {
                    profileElementKey: params.$profile_element_key,
                    profileElementValue: params.$profile_element_value,
                    profileElementTitle: params.$profile_element_title,
                    profileElementSubTitle: params.$profile_element_sub_title,
                    profileElementDescription: params.$profile_element_description,
                    contentType: contentType
                }
            });
        } else if (contentType === CONTENT_TYPE.APPOINTMENT_LINK) {
            const appointment = JSON.parse(params.appointment);
            let localParams = {
                navigateTo: Screens.APPOINTMENT_DETAILS_SCREEN,
                appointment: appointment,
            };
            await DeepLinksService.persistParams(localParams);
        } else if (contentType === CONTENT_TYPE.LEARNING_LIBRARY) {
            let localParams = {
                navigateTo: Screens.SECTION_LIST_SCREEN,
                formUrl: canonicalIdentifier,
            };
            await DeepLinksService.persistParams(localParams);
        } else if (contentType === CONTENT_TYPE.SERVICE_REQUEST) {
            let localParams = {
                navigateTo: Screens.TYPE_FORM_SCREEN,
                name: params.name,
                formUrl: canonicalIdentifier,
            };
            await DeepLinksService.persistParams(localParams);
        } else if (contentType === CONTENT_TYPE.SHARE_CHATBOT) {
            await DeepLinksService.persistParams({
                chatbot: {
                    contentType: contentType,
                    id: params.id,
                }
            });
        } else if (contentType === CONTENT_TYPE.REVAMP__HOME) {
            let localParams = {
                navigateTo: Screens.SERVICE_LIST_SCREEN
            };
            await DeepLinksService.persistParams(localParams);
        } else if (contentType === CONTENT_TYPE.TELEHEALTH_SCREEN) {
            let localParams = {
                navigateTo: Screens.APPT_SELECT_SERVICE_TYPE_SCREEN
            };
            await DeepLinksService.persistParams(localParams);
        } else if (contentType === CONTENT_TYPE.MAIN_APP_SCREEN) {
            let localParams = {
                navigateTo: Screens.SERVICE_LIST_SCREEN
            };
            await DeepLinksService.persistParams(localParams);
        }

        NavigationService.navigateTo('AuthLoading');
    };

    static navigateToUrl = async (url) => {
        if (url.includes('magiclink')) {
            const authToken = url.replace('magiclink/', '').replace(APP_PREFIX, '');
            await AuthStore.setAuthToken(authToken);
            NavigationService.navigateTo('AuthLoading');
        }
    };

    // Create branch link for share provider profile
    static shareProviderProfileLink = async (channel, providerId) => {
        let buo = await branch.createBranchUniversalObject(
            providerId,
            {
                locallyIndex: true,
                contentMetadata: {
                    customMetadata: {
                        providerId: providerId
                    },
                },
            },
        )

        let linkProperties = {
            feature: 'share',
            channel: channel,
        };

        let controlParams = {
            $content_type: 'share-provider-profile',
        };

        let {url} = await buo.generateShortUrl(linkProperties, controlParams);
        let shareOptions = {
            messageHeader: 'Check this out',
            messageBody: "Provider Profile" + ' ' + url,
        };

        let {sharedChannel, completed, error} = await buo.showShareSheet(
            shareOptions,
            linkProperties,
            controlParams
        );
    };

    // Create branch link for connect provider
    static recommendProviderProfileLink = async (channel, providerId) => {
        let buo = await branch.createBranchUniversalObject(
            providerId,
            {
                locallyIndex: true,
                contentMetadata: {
                    customMetadata: {
                        providerId: providerId,
                    },
                },
            },
        )

        let linkProperties = {
            feature: 'share',
            channel: channel,
        };

        let controlParams = {
            $content_type: 'recommend-provider-profile',
        };

        let {url} = await buo.generateShortUrl(linkProperties, controlParams);
        let shareOptions = {
            messageHeader: 'Check this out',
            messageBody: "Provider Profile" + ' ' + url,
        };

        let {sharedChannel, completed, error} = await buo.showShareSheet(
            shareOptions,
            linkProperties,
            controlParams
        );
    }

    // Create branch link QR code for recommend provider profile
    static profileQRCodeLink = async (providerId) => {
        let buo = await branch.createBranchUniversalObject(
            providerId,
            {
                locallyIndex: true,
                contentMetadata: {
                    customMetadata: {
                        providerId: providerId,
                    },
                },
            },
        )

        let linkProperties = {
            feature: 'qr-code-profile'
        };

        let controlParams = {
            $content_type: 'recommend-provider-profile',
        };

        let {url} = await buo.generateShortUrl(linkProperties, controlParams);
        return url;
    }

    // Create branch link for share educational content
    static shareEducationalContentPiece = async (channel, content) => {

        let buo = await branch.createBranchUniversalObject(content.id, {
            locallyIndex: true,
            title: content.title,
            contentDescription: content.description,
            contentMetadata: {
                customMetadata: {
                    contentId: content.id,
                    categorySlug: content.category?.categorySlug,
                    topicSlug: content.topic?.topicSlug
                },
            },
        });

        let linkProperties = {
            feature: 'share',
            channel: channel,
        };

        let controlParams = {
            $desktop_url: `${PUBLIC_WEBSITE_URL_FOR_BRANCH_CANONICAL_URL}${content.category?.categorySlug}/${content.topic?.topicSlug}/${content.slug}`,
            $content_type: 'education-content',
        };

        let {url} = await buo.generateShortUrl(linkProperties, controlParams);

        let shareOptions = {
            messageHeader: 'Check this out',
            messageBody: content.title + ' ' + url,
        };
        let {sharedChannel, completed, error} = await buo.showShareSheet(
            shareOptions,
            linkProperties,
            controlParams,
        );
    }

    // Create branch link for share public group link
    static shareGroupLink = async (channel, GroupChannelUrl) => {
        let buo = await branch.createBranchUniversalObject(
            GroupChannelUrl,
            {
                locallyIndex: true,
                contentMetadata: {
                    customMetadata: {
                        GroupChannelUrl: GroupChannelUrl,
                    },
                },
            },
        )

        let linkProperties = {
            feature: 'share',
            channel: channel,
        };

        let controlParams = {
            $content_type: 'group-recommendation',
        };

        let {url} = await buo.generateShortUrl(linkProperties, controlParams);
        let shareOptions = {
            messageHeader: 'Check this out',
            messageBody: "Join this Public Group here: " + ' ' + url,
        };

        let {sharedChannel, completed, error} = await buo.showShareSheet(
            shareOptions,
            linkProperties,
            controlParams
        );
    };

    // Create branch link QR code for public group
    static groupQRCodeLink = async (GroupChannelUrl) => {

        let buo = await branch.createBranchUniversalObject(
            GroupChannelUrl,
            {
                locallyIndex: true,
                contentMetadata: {
                    customMetadata: {
                        GroupChannelUrl: GroupChannelUrl,
                    },
                },
            },
        )

        let linkProperties = {
            feature: 'group-qr-code',
        };

        let controlParams = {
            $content_type: 'group-recommendation',
        };

        let {url} = await buo.generateShortUrl(linkProperties, controlParams);
        return url;
    };

    // Create branch link for appointment event add to calendar
    static appointmentLink = async (eventConfig, appointment) => {
        let buo = await branch.createBranchUniversalObject(
            'canonicalIdentifier',
            {
                locallyIndex: true,
                title: eventConfig.title,
                contentDescription: eventConfig.title,
                contentMetadata: {
                    contentType: CONTENT_TYPE.APPOINTMENT_LINK,
                    $content_type: CONTENT_TYPE.APPOINTMENT_LINK,
                    customMetadata: {
                        appointment: JSON.stringify(appointment),
                    },
                },
            },
        );

        let linkProperties = {
            feature: 'share',
            channel: 'facebook'
        };

        let controlParams = {
            $desktop_url: 'http://desktop-url.com/monster/12345',
            $content_type: 'appointment-link',
        }

        let {url} = await buo.generateShortUrl(linkProperties, controlParams);
        return url;

    }

    // Create branch link for appointment event add to calendar
    static shareAppLink = async (channel) => {
        let buo = await branch.createBranchUniversalObject(
            'ShareButtonLinkIdentifier',
        )

        let linkProperties = {
            feature: 'share',
            channel: channel,
        };

        let controlParams = {
            $content_type: 'share-app-link',
        };

        let {url} = await buo.generateShortUrl(linkProperties, controlParams);
        let shareOptions = {
            messageHeader: 'Check this out',
            messageBody: "App link" + ' ' + url,
        };

        let {sharedChannel, completed, error} = await buo.showShareSheet(
            shareOptions,
            linkProperties,
            controlParams
        );
    };

    // Create branch link for share chatbot
    static shareChatbot = async (channel, chatbotProfile) => {
        let buo = await branch.createBranchUniversalObject(chatbotProfile.id, {
            locallyIndex: true,
            title: "Assign Chat Bot",
            contentDescription: chatbotProfile.name,
            contentMetadata: {
                customMetadata: {
                    id: chatbotProfile.id,
                },
            },
        });

        let linkProperties = {
            feature: 'share',
            channel: channel,
        };

        let controlParams = {
            $content_type: 'share-chatbot',
        };

        let {url} = await buo.generateShortUrl(linkProperties, controlParams);
        let shareOptions = {
            messageHeader: 'Check this out',
            messageBody: "Chatbot" + ' ' + url,
        };

        let {sharedChannel, completed, error} = await buo.showShareSheet(
            shareOptions,
            linkProperties,
            controlParams
        );
    };

    // Create branch link for Share Quote
    static shareQuote = async (channel, quote, quoteAuthor) => {
        let buo = await branch.createBranchUniversalObject(
            'ShareButtonLinkIdentifier',
            {
                locallyIndex: true,
                title: quote,
                contentDescription: quoteAuthor,
            }
        )

        let linkProperties = {
            feature: 'share',
            channel: channel,
        };

        let controlParams = {
            $content_type: 'share-app-link',
        };

        let {url} = await buo.generateShortUrl(linkProperties, controlParams);
        let shareOptions = {
            messageHeader: 'Check this out',
            messageBody: "App link" + ' ' + url,
        };

        let {sharedChannel, completed, error} = await buo.showShareSheet(
            shareOptions,
            linkProperties,
            controlParams
        );
    };
}
