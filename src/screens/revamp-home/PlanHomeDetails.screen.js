import React, {Component} from "react";
import {Image, Platform, ScrollView, StatusBar, StyleSheet} from "react-native";
import {Button, Container, Content, Header, Left, Right, Text, View} from "native-base";
import {
  addTestID,
  AlertUtil,
  Colors,
  CommonStyles,
  CONNECTION_TYPES,
  ContentfulClient,
  getHeaderHeight,
  PrimaryButton,
  TextStyles,
} from "ch-mobile-shared";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
import AntIcons from "react-native-vector-icons/AntDesign";
import EntypoIcons from 'react-native-vector-icons/Entypo';
import {CommonSegmentHeader} from "ch-mobile-shared";
import {List} from "react-native-paper";
import {CONNECTIONS_SEGMENTS_OPTIONS, PLAN_STATUS} from "../../constants/CommonConstants";
import GenericListItem from "../../components/revamp-home/GenericListItem";
import {connectConnections} from "../../redux";
import {Screens} from "../../constants/Screens";
import FeatherIcon from "react-native-vector-icons/Feather";
import {PlanItemModal} from "../../components/revamp-home/PlanItemModal";
import ProfileService from "../../services/Profile.service";
import Modal from "react-native-modalbox";
import Loader from "../../components/Loader";

const HEADER_SIZE = getHeaderHeight();

class PlanHomeDetailsScreen extends Component<Props> {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const {navigation} = this.props;
    const revampContextDetails = navigation.getParam('revampContextDetails', null);
    this.seeFullPlan = navigation.getParam('seeFullPlan', null);
    const services = navigation.getParam('services', null);
    this.totalCount = 0;
    this.fetchCount = 0;
    this.state = {
      revampPlanItemsList: [],
      revampContextDetails: this.props?.revamp?.revampContext,
      openModal: false,
      activeSegmentId: null ,
      services : services ,
      categoryItems: [],
      changeSegmentTab: (tabId)=>{}
    };
  }


  mapStateToProps = ()=>{

    if(!this.props.revamp.isLoading) {
      this.setState({
        revampPlanItemsList: this.props?.revamp?.revampContext?.plan?.planItemsContexts ?
          this.populateRevampContextData(this.props?.revamp?.revampContext?.plan?.planItemsContexts) : [],
        revampContextDetails: this.props?.revamp?.revampContext,
      })
    }
  }


  async componentDidMount(): void {
    this.getCategoryItems();
    this.mapStateToProps();
    this.reference = this.props.navigation.addListener(
      "willFocus",
      payload => {
        this.mapStateToProps();
      },
    );

  }

  componentWillUnmount = () => {
    if (this.reference) {
      this.reference.remove();
    }
  };


  componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
    if(this.state.activeSegmentId && !prevState.activeSegmentId && this.seeFullPlan === false) {
        this.state.changeSegmentTab(CONNECTIONS_SEGMENTS_OPTIONS.PRIORITY);
    }
  }
  convertToCategory = async (entries) => {
    const categoryItems = entries.items.map(entry => {
      return {
        categoryName: entry.fields.name,
        categoryImage: entry.fields.displayImage ? entry.fields.displayImage.fields.file.url : "",
        categoryTopics: entry.fields.topics,
        categorySlug: entry.fields.slug,
      };
    });
    await this.calculateMeta(categoryItems);
    if (this.state.categoryItems === null || this.state.categoryItems === undefined) {
      this.setState({ categoryItems });
    } else {
      const tempItem = this.state.categoryItems.concat(categoryItems)
      this.setState({ categoryItems:tempItem });
    }
    this.setState({ isLoading: false });
  };

  getCategoryItems = async () => {
    this.setState({isLoading:true});
    let finalQuery = {
      content_type: "category",
      skip: 0,
      include: 2,
      limit: 10,
    };
    let entries = await ContentfulClient.getEntries(finalQuery);
    if (entries) {
      await this.convertToCategory(entries);
      this.totalCount = entries?.total;
      this.fetchCount = this.fetchCount + entries?.items?.length;
      while (this.fetchCount <= this.totalCount) {
        finalQuery.skip = finalQuery.limit;
        finalQuery.limit = finalQuery.limit + 10;
        entries = await ContentfulClient.getEntries(finalQuery);
        if (entries) {
          await this.convertToCategory(entries);
          this.totalCount = entries?.total;
          this.fetchCount = this.fetchCount + entries?.items?.length;
        }
      }
    }
  }

  calculateMeta = (categoryItems)=>{

    return new Promise((resolve, reject)=>{
      try {
        const {assignedItems} = this.state;
        if(assignedItems && assignedItems.assignedContent && assignedItems.assignedContent.length>0) {
          const articles = [];
          categoryItems.forEach(category=>{
            const {categorySlug} = category;
            category.categoryTopics.forEach(topic=>{
              if(topic.fields && topic.fields.educationOrder) {
                const {slug: topicSlug} = topic.fields;
                topic.fields.educationOrder.forEach(article=>{
                  if(article.fields) {
                    articles.push({
                      entryId: article.sys.id, topicSlug, categorySlug
                    })
                  }

                })
              }

            })
          });
          assignedItems.assignedContent = assignedItems.assignedContent.map(content=>{
            const sluggedArticle = articles.find(article=>article.entryId===content.contentSlug);
            return {
              ...content,
              ...sluggedArticle
            }
          });
          this.setState({
            assignedItems
          });
        }
        resolve();
      } catch (e) {
        reject(e.message);
      }

    });
  };

  /**
   * @function arrangeData
   * @description This method is used to arrange not started items at top
   */
  arrangeData = (arr)=> {
    const fromIndex = arr.findIndex(item=> item.title=== PLAN_STATUS.NOT_STARTED.key);
    if(fromIndex!==0 && fromIndex > -1) {
      const element = arr[fromIndex];
      arr.splice(fromIndex, 1);
      arr.splice(0, 0, element);
    }
    return arr;
  }

  /**
   * @function populateRevampContextData
   * @description This method is used to populate Revamp Context Data as sections
   */
  populateRevampContextData = (revampPlanItemsList) => {
    if (revampPlanItemsList) {
      const map = revampPlanItemsList.reduce((prev, current) => {
        const title = current.status.toUpperCase() === PLAN_STATUS.SCHEDULED.key ? PLAN_STATUS.IN_PROGRESS.key : current.status.toUpperCase();
        if (prev[title]) {
          prev[title].push(current);
        } else {
          prev[title] = [current]
        }
        return prev;
      }, {});
      const updatedList =  Object.keys(map).map(title => {
        return {
          title: title, data: map[title], expanded: title === PLAN_STATUS.NOT_STARTED.key || PLAN_STATUS.IN_PROGRESS.key
        }
      });
      return this.arrangeData(updatedList);
    }
  }


  /**
   * @function removePlanItem
   * @description This method is used to remove plan item
   */
  removePlanItem = () => {
    let {revampContextDetails, selectedPlanItem,activeSegmentId} = this.state;
    revampContextDetails?.plan?.planItemsContexts.map((planItemContext, index) => {
      if (planItemContext?.planItem?.id === selectedPlanItem?.planItem.id) {
        revampContextDetails?.plan?.planItemsContexts.splice(index, 1);
      }
    });
    this.setState({revampContextDetails: revampContextDetails}, () => {
      this.props.updateRevampContext(revampContextDetails);
      this.mapStateToProps();
    });
  }

  /**
   * @function addOrRemoveFromPriorities
   * @description This method is update priority status of plan item
   */
  addOrRemoveFromPriorities = () => {
    let {selectedPlanItem, revampContextDetails} = this.state;
    revampContextDetails?.plan?.planItemsContexts.map((planItemContext) => {
      if (planItemContext?.planItem?.id === selectedPlanItem?.planItem?.id) {
        planItemContext.priority = !planItemContext.priority;
      }
    });
    this.setState({revampContextDetails}, () => {
      this.props.updateRevampContext(revampContextDetails);
    })
  }

  /**
   * @function haveItemsToBePrioritize
   * @description This method is used to return boolean value ( has items to be prioritize or not )
   */
  haveItemsToBePrioritize = () => {
    const {revampContextDetails} = this.state;
    if (revampContextDetails) {
      return revampContextDetails?.plan?.planItemsContexts?.filter(context => context.priority === false)?.length > 0;
    }
    return false;
  }


  /**
   * @function navigateToAddToPriorityScreen
   * @description This method is used to navigate to add to priority screen
   */
  navigateToAddToPriorityScreen = () => {
    let {revampContextDetails} = this.state;
    revampContextDetails.plan.planItemsContexts = revampContextDetails?.plan?.planItemsContexts.filter(planItem => planItem.priority === false);
    this.props.navigation.navigate(Screens.ADD_YOUR_PRIORITIES_SCREEN, {
      ...this.props.navigation.state.params,
      revampContextDetails: revampContextDetails
    });
  }

  /**
   * @function renderEmptyPrioritiesSection
   * @description This method is used to render empty priorities section
   */
  renderEmptyPrioritiesSection = () => {
    return (<View>
          <View style={{...styles.planContent, marginBottom: 20}}>
            <Image
                style={styles.planImage}
                resizeMode="contain"
                source={require("../../assets/images/priorities.png")}
            />

            <Text style={styles.planContentTitle}>
              Add to your priorities
            </Text>
            <Text style={styles.planContentSubTitle}>
              You don’t have any priority items selected. Most Confidant guests find it helpful to focus on a few
              items at a time. These are highlighted as priorities.
            </Text>
          </View>
          {this.haveItemsToBePrioritize() && (<View style={styles.btnStyle}>
                <PrimaryButton
                    text="Add your priorities"
                    onPress={() => {
                      this.navigateToAddToPriorityScreen();
                    }}
                />
              </View>)}
        </View>

    )
  }

  /**
   * @function renderSegmentSection
   * @description This method is used to render segment section
   */
  renderSegmentSection = () => {
    return (<CommonSegmentHeader
            segments={[{
              title: "Full Plan", segmentId: CONNECTIONS_SEGMENTS_OPTIONS.FULL_PLAN}, {
              title: "Priority", segmentId: CONNECTIONS_SEGMENTS_OPTIONS.PRIORITY
            }]}
            setTabControl={callback=>{
              this.setState({changeSegmentTab: callback});
            }}
            segmentChanged={(segmentId) => {
              this.setState({
                activeSegmentId: segmentId,
              });
            }}
        />)
  }

  /**
   * @function getAllRequiredData
   * @description This method is used to get color by status
   */
  getItemColorByStatus = (revampContext) => {
    switch (revampContext.status) {
      case 'IN_PROGRESS':
        return Colors.colors.mainBlue;
      case 'SCHEDULED':
        return Colors.colors.warningIcon;
      case 'NOT_STARTED':
        return Colors.colors.highContrast;
      case 'COMPLETED':
        return Colors.colors.successIcon;
      default :
        return Colors.colors.highContrast

    }
  }

  /**
   * @function renderPageMainModal
   * @description This method is used to render page main model.
   */
  renderPageMainModal = () => {
    const {selectedPlanItem, activeSegmentId} = this.state;
    const screenDetails = this.getRespectiveScreen(selectedPlanItem?.planItem?.type);
    return (<PlanItemModal
            openModal={this.state.openModal}
            selectedPlanItem={selectedPlanItem}
            screenDetails={screenDetails}
            removePlanItem={this.removePlanItem}
            addOrRemoveFromPriorities={this.addOrRemoveFromPriorities}
            closeModal={this.closeModal}
            activeSegmentId={activeSegmentId}
        />)
  }

  /**
   * @function renderCardList
   * @description This method is used to render list of plan items
   */
  renderCardList = (revampPlanItemsList, isPriority) => {
    let listToBeRender = revampPlanItemsList;
    if (isPriority) {
      listToBeRender = listToBeRender.filter(context => context.priority === true);
    }
    return (listToBeRender && listToBeRender?.map((revampContext) => {
          return (<GenericListItem
                  iconType={"FeatherIcon"}
                  iconName={"more-horizontal"}
                  headingText={revampContext.status}
                  headingSubText={revampContext.planItem?.planToken ? '+' + revampContext.planItem?.planToken + (revampContext.planItem?.planToken > 1 ? ' Tokens' : ' Token') : null}
                  mainText={revampContext?.planItem?.name}
                  itemColor={this.getItemColorByStatus(revampContext)}
                  shapeColor={this.getItemColorByStatus(revampContext)}
                  performAction={() => {
                    this.openModal(revampContext)
                  }}
                  navigateToScreen = {()=>{
                    this.setState({selectedPlanItem : revampContext},()=> {
                      this.getRespectiveScreen(revampContext?.planItem?.type)?.method();
                    })
                  }}
              />);

        }));
  };

  /**
   * @function renderFullPlanItems
   * @description This method is used to render Full plan items
   */
  renderFullPlanItems = () => {
    const {revampPlanItemsList} = this.state;
    return (<View style={styles.planContent}>
          {revampPlanItemsList && Object.keys(revampPlanItemsList).map(context => {
            const expanded = revampPlanItemsList[context].expanded;
            return (<List.Accordion
                    title={PLAN_STATUS[revampPlanItemsList[context].title]?.value}
                    titleStyle={styles.headerStyles}
                    style={styles.headerBgStyles}
                    left={props => <AntIcons size={22} color={Colors.colors.highContrast}
                                             name={expanded ? "caretup" : "caretdown"}/>}
                    right={props => <Text
                        style={styles.itemQty}>{revampPlanItemsList[context].data?.length} item
                      {revampPlanItemsList[context]?.data?.length > 1 ? 's' : ''}</Text>}
                    expanded={expanded}
                    onPress={() => {
                      this.handleExpanded(context)
                    }}>
                  {revampPlanItemsList[context].data && this.renderCardList(revampPlanItemsList[context].data, false)}
                </List.Accordion>)
          })}
        </View>)
  }


  /**
   * @function handleExpanded
   * @description This method is used to handle accordion expansion
   */
  handleExpanded = (context) => {
    let {revampPlanItemsList} = this.state;
    revampPlanItemsList[context].expanded = !revampPlanItemsList[context].expanded;
    this.setState({revampPlanItemsList});
  };

  /**
   * @function renderPriorityPlanItems
   * @description This method is used to render Priority items
   */
  renderPriorityPlanItems = () => {
    const {revampPlanItemsList} = this.state;
    return (this.hasPriorityItems() ? <View style={styles.planContent}>
          {revampPlanItemsList && Object.keys(revampPlanItemsList).map(context => {
            return revampPlanItemsList[context].data && this.renderCardList(revampPlanItemsList[context].data, true)
          })}
        </View> : this.renderEmptyPrioritiesSection())
  }

  /**
   * @function hasPriorityItems
   * @description This method is used to get boolean value for priority items
   */
  hasPriorityItems = () => {
    const {revampContextDetails} = this.state;
    return revampContextDetails.plan?.planItemsContexts.filter(planItem => planItem.priority === true)?.length > 0;
  }

  /**
   * @function openModal
   * @description This method is used to open modal
   */
  openModal = (selectedPlanItem) => {
    this.setState({selectedPlanItem: selectedPlanItem, openModal: true})
  }

  /**
   * @function closeModal
   * @description This method is used to close modal
   */
  closeModal = () => {
    this.setState({selectedPlanItem: null, openModal: false})
  }


  /**
   * @function getConnectionDetail
   * @description This method is used to get Connection Detail
   */
  getConnectionDetail = (connectionId) => {
    let connection = this.props.connections.activeConnections.filter(connection => connection.connectionId === connectionId);
    if (connection && connection.length < 1) {
      connection = this.props.connections.pastConnections.filter(connection => connection.connectionId === connectionId);
    }
    return connection && connection.length > 0 && connection[0] ? connection[0] : null;
  };

  /**
   * @function navigateBack
   * @description This method is used to navigate back
   */

  navigateBack = () => {
    this.props.navigation.goBack();
  }

  /**
   * @function getProviderInfo
   * @description This method is used to get provider Profile.
   */
  getProviderInfo = async (userId) => {
    const provider = await ProfileService.getProviderProfile(userId);
    if (provider.errors) {
      console.warn(provider.errors[0].endUserMessage);
    } else {
      return provider;
    }
  };

  /**
   * @function viewProviderProfile
   * @description This method is used to view provider profile
   */
  viewProviderProfile = selectedProvider => {
    const provider = {
      ...selectedProvider,
      userId: selectedProvider.providerId,
      name: selectedProvider.fullName,
      avatar: selectedProvider.profileImage,
      type: CONNECTION_TYPES.PRACTITIONER,
      profilePicture: selectedProvider.profileImage,
      colorCode: !selectedProvider.profileImage ? selectedProvider.colorCode : null,
    };
    const payload = {
      provider: provider, patient: this.props.auth.meta,
    }
    if (selectedProvider.matchmaker) {
      this.props.navigation.navigate(Screens.MATCH_MAKER_DETAIL_SCREEN, payload);
    } else {
      this.props.navigation.navigate(Screens.PROVIDER_DETAIL_SCREEN, payload);
    }
  };

  /**
   * @function navigatesToServicesScreen
   * @description This method is used to navigate to services screen
   */
  navigatesToServicesScreen = () => {
    const {selectedPlanItem} = this.state;
    if (selectedPlanItem?.planItem?.referenceId) {
      const {services} = this.state;
      const connection = services.find(service => service.id === selectedPlanItem?.planItem.referenceId);
      if (connection) {
        this.props.navigation.navigate(Screens.APPT_SELECT_SERVICE_DETAIL_SCREEN, {
          selectedItem: {
            service: connection, providers: connection.providers.filter(Boolean), isProviderFlow: false
          }
        });
      } else {
        this.props.navigation.navigate(Screens.APPT_SELECT_SERVICE_TYPE_SCREEN, {
          isProviderFlow: false
        });
      }
    } else {
      this.props.navigation.navigate(Screens.APPT_SELECT_SERVICE_TYPE_SCREEN, {
        isProviderFlow: false
      });
    }
  }

  /**
   * @function navigatesToProvidersScreen
   * @description This method is used to navigate to providers screen
   */
  navigatesToProvidersScreen = async () => {
    const {selectedPlanItem} = this.state;
    if(selectedPlanItem.planItem?.type === 'PROVIDER_TYPE'){
      this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_PROVIDER_SCREEN, {
        isProviderFlow: false,
        selectedFilter: selectedPlanItem?.planItem.referenceId ,
      });
    }else {
      if (selectedPlanItem?.planItem?.referenceId) {
        const connection = await this.getProviderInfo(selectedPlanItem?.planItem.referenceId);
        if (connection) {
          this.viewProviderProfile(connection)
        } else {
          this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_PROVIDER_SCREEN, {
            isProviderFlow: true
          });
        }
      } else {
        this.props.navigation.navigate(Screens.REQUEST_APPT_SELECT_PROVIDER_SCREEN, {
          isProviderFlow: true
        });
      }
    }
  }

  /**
   * @function navigatesToTopicsScreen
   * @description This method is used to navigate to topics screen
   */
  navigatesToTopicsScreen = async (referenceId) => {
    if(referenceId){
      let query = {
        'content_type': 'topics',
        'sys.id': referenceId
      };

      const response = await ContentfulClient.getEntries(query);

      const item = response.items?.[0].fields

      const category = this.state.categoryItems.filter(cat => cat.categoryTopics.find(top => top.sys.id === referenceId))

      this.props.navigation.navigate(Screens.TOPIC_CONTENT_LIST_SCREEN, {
        topicName: item.name,
        topicDescription: item.description,
        topicImage: item.coverImage,
        topicIcon: item.icon,
        educationOrder:item.educationOrder,
        category: category?.[0],
        topicSlug: item.slug,
        getMetaForSingleArticle: this.getMetaForSingleArticle
      });
    }else{
      this.props.navigation.navigate(Screens.SECTION_LIST_SCREEN);
    }
  }

  getMetaForSingleArticle = (entryId)=>{
    const articles = [];
    this.state.categoryItems.forEach(category=>{
      const {categorySlug, categoryName} = category;
      category.categoryTopics.forEach(topic=>{
        if(topic.fields && topic.fields.educationOrder) {
          const {slug: topicSlug, name} = topic.fields;
          topic.fields.educationOrder.forEach(article=>{
            if(article.fields) {
              articles.push({
                entryId: article.sys.id, topic: {topicSlug, name}, category: {categorySlug, categoryName}
              })
            }
          })
        }
      })
    });
    return articles.find(article=>article.entryId===entryId);
  }

  /**
   * @function navigatesToGroupsScreen
   * @description This method is used to navigate to groups screen
   */
  navigatesToGroupsScreen = async () => {
    const {selectedPlanItem} = this.state;
    if (selectedPlanItem?.planItem?.referenceId) {
      let connection = this.getConnectionDetail(selectedPlanItem?.planItem?.referenceId);
      this.props.navigation.navigate(Screens.GROUP_DETAIL_SCREEN, {
        name: connection?.name,
        profilePicture: connection?.profilePicture,
        channelUrl: selectedPlanItem?.planItem?.referenceId
      });
    } else {
      this.props.navigation.navigate(Screens.ALL_GROUPS_SCREEN);
    }
  }

  /**
   * @function navigateToCHatBots
   * @description This method is used to navigate to select chatBots.
   */
  navigateToChatBots = () => {
    const {selectedPlanItem} = this.state;
    if (selectedPlanItem?.planItem?.referenceId) {
      const connection = this.props.connections.chatbotList.find(chatbot => chatbot.id === selectedPlanItem?.planItem?.referenceId);
      if (connection) {
        this.props.navigation.navigate(Screens.CHATBOT_PROFILE, {contact: connection});
      } else {
        this.props.navigation.navigate(Screens.CHATBOT_LIST_SCREEN);
      }
    } else {
      this.props.navigation.navigate(Screens.CHATBOT_LIST_SCREEN);
    }
  };

  /**
   * @function navigateToActivities
   * @description This method is used to navigate to Activities screen.
   */
  navigateToActivities = () => {};

  /**
   * @function navigateToArticleScreen
   * @description This method is used to navigate to article screen
   */
  navigateToArticleScreen = () => {
    const {selectedPlanItem} = this.state;
    if (selectedPlanItem?.planItem?.referenceId) {
      this.props.navigation.navigate(Screens.EDUCATIONAL_CONTENT_PIECE, {
        contentSlug: selectedPlanItem?.planItem.referenceId, category: '', topic: ''
      });
    } else {
      this.props.navigation.navigate(Screens.SECTION_LIST_SCREEN);
    }
  };

  /**
   * @function getRespectiveScreen
   * @description This method is used to get navigation details
   */
  getRespectiveScreen = (type) => {
    const {selectedPlanItem} = this.state;
    const hasReference = selectedPlanItem?.planItem?.referenceId
    switch (type) {
      case 'SERVICE':
        return {
          title: `Service${hasReference? '': 's'}`,
          method: () => this.navigatesToServicesScreen()
        };
      case 'PROVIDER':
        return {
          title: `Provider${hasReference? '': 's'}`,
          method: () => this.navigatesToProvidersScreen()
        };
      case 'GROUP':
        return {
          title: `Group${hasReference ? '' : 's'}`,
          method: () => this.navigatesToGroupsScreen()
        };
      case 'TOPIC':
        return {
          title: `Topic${hasReference? '': 's'}`,
          method: () => this.navigatesToTopicsScreen(hasReference)
        };
      case 'EDUCATION':
        return {
          title: `Education Content${hasReference? '': 's'}`,
          method: () => this.navigateToArticleScreen()
        };
      case 'ACTIVITY':
        return {
          title: `${hasReference? 'Activity': 'Activities'}`,
          method: () => this.navigateToActivities()
        };
      case 'CONVERSATION':
        return {
          title: `Conversation${hasReference? '': 's'}`,
          method: () => this.navigateToChatBots()
        };

      case 'PROVIDER_TYPE':
        return {
          title: `Provider${hasReference? '': 's'}`,
          method: () => this.navigatesToProvidersScreen()
        };
      default :
        return null

    }

  }

  showInfoDrawer = () => {
    this.refs?.infoDrawer?.open()
  };

  /**
   * @function renderHeader
   * @description This method is used to render Header items
   */
  renderHeader = ()=>{
    return(
        <Header
            {...addTestID("Header")}
            noShadow transparent style={styles.chatHeader}>
          <StatusBar
              backgroundColor={Platform.OS === "ios" ? null : "transparent"}
              translucent
              barStyle={"dark-content"}
          />
          <Left>
            <Button
                {...addTestID("Back")}
                onPress={() => this.navigateBack()}
                transparent
                style={styles.backButton}>
              <EntypoIcons size={30} color={Colors.colors.white} name="chevron-thin-left"/>
            </Button>
          </Left>
          <Right>
            <Button
                onPress={()=>{
                  this.showInfoDrawer()
                }}
                transparent>
              <AntIcons size={22} color={Colors.colors.whiteColor} name="infocirlceo"/>
            </Button>
          </Right>
        </Header>
    )
  }

  render() {
    StatusBar.setBarStyle("dark-content", true);

    if(this.state.isLoading){
      return <Loader/>
    }
    const {activeSegmentId, openModal} = this.state;

    return (<Container>
          <StatusBar
              backgroundColor="transparent"
              barStyle="dark-content"
              translucent
          />
          <ScrollView showsVerticalScrollIndicator={false}>
            <LinearGradient
                start={{x: 0, y: 0.75}}
                end={{x: 1, y: 0.25}}
                colors={["#136A8A", "#0F8D83"]}
                style={styles.homeMainBg}>
              {this.renderHeader()}
              <View style={styles.homeTopTextWrap}>
                <Text style={[styles.mainTitle, {textAlign: "center"}]}>Plan</Text>
                <Text style={styles.homeSubTitle}>
                  Have a bias towards action – let’s see something happen now. You can break that big plan into small
                  steps and take the first step right away.
                </Text>
                <View style={styles.planContentWrapper}>
                  {this.renderSegmentSection()}
                  {activeSegmentId === CONNECTIONS_SEGMENTS_OPTIONS.FULL_PLAN && this.renderFullPlanItems()}
                  {activeSegmentId === CONNECTIONS_SEGMENTS_OPTIONS.PRIORITY && this.renderPriorityPlanItems()}
                </View>
              </View>
            </LinearGradient>
          </ScrollView>
      <Modal
        backdropPressToClose={true}
        backdropColor={ Colors.colors.overlayBg}
        backdropOpacity={1}
        style={{...CommonStyles.styles.commonModalWrapper,
          height:'auto',
          position:'absolute',
          padding:24
        }}
        entry={"bottom"}
        position={"bottom"} ref={"infoDrawer"} swipeArea={100}>
        <View style={{...CommonStyles.styles.commonSwipeBar}}
              {...addTestID('swipeBar')}
        />
        <View style={styles.infoDetails}>
          <Text style={styles.infoMainText}>It’s time to check out your plan! We put together recommendations based on your responses. This is your starting point.</Text>
          <Text style={styles.infoSubText}>
            You can customize your plan to ensure it aligns with your expectations and abilities.{'\n'}
            If you have any questions about modifying your plan, message your Matchmaker. They’re here to help.
          </Text>
        </View>
      </Modal>
          {openModal && this.renderPageMainModal()}
        </Container>);
  }
}

const styles = StyleSheet.create({
  homeMainBg: {
    minHeight: 306,
  },
  itemQty: {
    color: Colors.colors.lowContrast,
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.subTextS,
  },
  headerStyles: {
    color: Colors.colors.highContrast,
    ...TextStyles.mediaTexts.serifProExtraBold,
    ...TextStyles.mediaTexts.bodyTextL,
  },
  headerBgStyles: {
    backgroundColor: Colors.colors.whiteColor,

  },
  bodyStyle: {
    paddingLeft: -20,
    marginLeft: 0,
    width: "100%",
    marginVertical: 0,
    paddingVertical: 0,
  },
  chatHeader: {
    paddingTop: 15,
    paddingLeft: 24,
    paddingRight: 24,
    elevation: 0,
    height: HEADER_SIZE,
  },
  infoIcon: {
    color: Colors.colors.whiteColor,
    fontSize: 24,
  },
  providerImage: {
    height: 64,
    width: 64,
  },

  planImage: {
    marginBottom: 16,
    alignSelf: "center",
  },
  wrapperMain: {
    width: "100%",
  },
  headingSectionMain: {
    marginBottom: 14,
    width: "100%",
  },
  tokenImgWrapper: {
    alignItems: "center",
  },
  homeMainBanner: {
    width: "100%",
  },
  roundWrapper: {
    alignItems: "center",
    paddingBottom: 24,
  },
  tokenNumber: {
    position: "absolute",
    alignItems: "center",
    flex: 1,
    top: 30,
    color: Colors.colors.whiteColor,
    ...TextStyles.mediaTexts.serifProBold,
    ...TextStyles.mediaTexts.largeText,
  },
  centerText: {
    position: "absolute",
    alignItems: "center",
    flex: 1,
    top: 30,
    color: Colors.colors.whiteColor,
    ...TextStyles.mediaTexts.manropeBold,
    ...TextStyles.mediaTexts.overlineTextS,
  },
  mainTitleText: {
    color: Colors.colors.whiteColor,
    ...TextStyles.mediaTexts.serifProBold,
    ...TextStyles.mediaTexts.TextH2,
    alignSelf: "center",
    paddingBottom: 24,
  },
  homeTopTextWrap: {
    alignItems: "center",
    // paddingVertical: 32,
    // paddingHorizontal: 24,
  },
  mainTitle: {
    ...TextStyles.mediaTexts.serifProExtraBold,
    ...TextStyles.mediaTexts.TextH1,
    color: Colors.colors.whiteColor,
    marginBottom: 8,
    marginTop: 12,
  },
  subTitle: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.bodyTextM,
    color: Colors.colors.whiteColor,
    marginTop: 16,
  },
  smileWrap: {
    // alignItems: 'center',
    justifyContent: "center",
    paddingHorizontal: 24,
    // flexWrap: 'wrap'
  },

  homeSubTitle: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.bodyTextM,
    color: Colors.colors.whiteColor,
    textAlign: "center",
    paddingHorizontal: 50,
    paddingBottom: 40,
  },
  singleCard: {
    ...CommonStyles.styles.shadowBox,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  },
  planContent: {
    // paddingTop: 56,
  },
  planContentWrapper: {
    ...CommonStyles.styles.shadowBox,
    // borderTopRightRadius: 24,
    // borderTopLeftRadius: 24,
    width: "100%",
    padding: 24,
    // marginVertical: 40,
  },
  planContentTitle: {
    ...TextStyles.mediaTexts.serifProBold,
    ...TextStyles.mediaTexts.bodyTextL,
    color: Colors.colors.mediumContrast,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  planContentSubTitle: {
    ...TextStyles.mediaTexts.manropeRegular,
    ...TextStyles.mediaTexts.bodyTextS,
    color: Colors.colors.highContrast,
    paddingLeft: 24,
    paddingRight: 24,
    alignItems: "center",
    justifyContent: "center",
    // alignSelf: "center",
    textAlign: "center",
  },
  btnStyle: {
    paddingLeft: 23,
    paddingRight: 23,

  },
  btnOptions: {
    marginBottom: 8,
  },
  modalHeading: {
    ...TextStyles.mediaTexts.manropeBold,
    ...TextStyles.mediaTexts.TextH3,
    color: Colors.colors.highContrast,
    marginBottom: 8
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

export default connectConnections()(PlanHomeDetailsScreen);
