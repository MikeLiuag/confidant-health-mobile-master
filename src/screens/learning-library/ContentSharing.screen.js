import React, {Component} from 'react';
import {StatusBar} from 'react-native';
import {AlertUtil, ShareContentComponent} from 'ch-mobile-shared';
import {connectEducationalContent} from '../../redux/modules/educational-content/connectEducationalContent';
import ProfileService from "../../services/Profile.service";

class ContentSharingScreen extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.topic = {
            name: this.props.navigation.getParam('topicName', null),
            educationOrder: this.props.navigation.getParam('educationOrder', null),
        };
        this.state = {
            isLoading: true,
            contentList: []
        };
    }

    componentDidMount(): void {
        this.getContentByTopic();
    }

    shareContent = async (content) => {
        this.setState({isLoading: true});
        this.props.selfAssign({
            entryId: content.slug,
            callback: this.contentShared
        });
    };

    contentShared = (assigned, slug) =>{
      if(assigned) {
          const {contentList} = this.state;
          contentList.forEach(item => {
              if (item.slug === slug) {
                  item.contentShared = true;
              }
          });
          this.setState({contentList, isLoading: false});
      }   else {
          this.setState({isLoading: false});
      }
    };
    getContentByTopic = async () => {
        try {
            this.setState({isLoading: true});
            const contentList = [];
            const entries = this.topic.educationOrder;
            if (entries) {
                entries.filter(entry => entry.fields).forEach(entry => {
                    contentList.push({
                        title: entry.fields.title,
                        subtitle: entry.fields.description,
                        slug: entry.sys.id
                    });
                });
            }
            const response = await ProfileService.getAssignedSlugs(this.props.auth.meta.userId);
            let assignedSlugs = [];
            if (!response.errors) {
                assignedSlugs = response;
            }
            contentList.map(content => {
                if (assignedSlugs.includes(content.slug)) {
                    content.contentShared = true;
                }
                return content;
            });
            this.setState({
                contentList,
                isLoading: false,
            });
        } catch (error) {
            console.warn(error);
            AlertUtil.showErrorMessage('Unable to get data from contentful');
            this.setState({isLoading: false});
        }
    };

    goBack = () => {
        this.props.navigation.goBack();
    };

    render() {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        return (
            <ShareContentComponent
                educationSelected={false}
                assigningSelf={true}
                isLoading={this.state.isLoading}
                shareContent={this.shareContent}
                data={this.state.contentList}
                goBack={this.goBack}
                selection={this.selectedConnection}
            />
        );
    }
}

export default connectEducationalContent()(ContentSharingScreen);
