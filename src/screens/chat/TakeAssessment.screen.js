import React, {Component} from 'react';
import {connectConnections} from './../../redux';
import ConversationService from './../../services/Conversation.service';
import {AssignAssessmentComponent} from 'ch-mobile-shared';

class TakeAssessmentScreen extends Component<Props> {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const contact = this.props.navigation.getParam('contact', null);
    this.organizationId = contact.connectionId;
  }

  backClicked = () => {
    this.props.navigation.goBack();
  };

  onSuccessfulAssignment = ()=>{
    this.props.refreshConnections();
  };

  render = () => {
    return (<AssignAssessmentComponent
        goBack={this.backClicked}
        organizationId={this.organizationId}
        onSuccessfulAssignment={this.onSuccessfulAssignment}
        getConversations={ConversationService.getConversations}
        assignConversation={ConversationService.selfAssignConversation}
    />)
  };
}
export default connectConnections()(TakeAssessmentScreen);
