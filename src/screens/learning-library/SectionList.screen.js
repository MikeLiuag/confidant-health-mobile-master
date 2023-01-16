import React, { Component } from "react";
import { StatusBar } from "react-native";
import { SectionListComponent } from "../../components/learning-library/SectionList.component";
import { ContentfulClient } from "ch-mobile-shared";
import { Screens } from "../../constants/Screens";
import { connectEducationalContent } from "../../redux";

class SectionListScreen extends Component<Props> {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.forAssignment = navigation.getParam("forAssignment", null);
    this.totalCount = 0;
    this.fetchCount = 0;
    this.state = {
      iconColor: "#3fb2fe",
      isLoading: true,
      forAssignment: this.forAssignment,
      educationOrder: [],
      assignedItems: this.props.educational.assignedContent,
      favouriteItems: this.props.profile.bookmarked,
    };
  }

  componentDidUpdate(prevProps, prevState, ss) {
    if (prevProps?.navigation?.state?.params?.forAssignment !== this.props?.navigation?.state?.params?.forAssignment) {
      this.setState({ forAssignment: this.props?.navigation?.state?.params?.forAssignment });
    }
  }

  componentWillUnmount() {
    if (this.screenBlurListener) {
      this.screenBlurListener.remove();
      this.screenBlurListener = null;
    }
  }

  async componentDidMount(): void {
    this.screenBlurListener = this.props.navigation.addListener(
      "willBlur",
      payload => {
        if (this.componentRef) {
          this.componentRef.willBlur();
        }
      },
    );

    let finalQuery = {
      content_type: "category",
      skip: 0,
      include: 2,
      limit: 10,
    };
    let entries = await ContentfulClient.getEntries(finalQuery);
    let categoryItems = [];
    if (entries) {
      await this.convertToCategory(entries);
      this.totalCount = entries?.total;
      this.fetchCount = this.fetchCount + entries?.items?.length;
      while (this.fetchCount <= this.totalCount) {
        finalQuery.skip = finalQuery.limit;
        finalQuery.limit = finalQuery.limit + 10;
        console.log(finalQuery);
        entries = await ContentfulClient.getEntries(finalQuery);
        if (entries) {
          await this.convertToCategory(entries);
          this.totalCount = entries?.total;
          this.fetchCount = this.fetchCount + entries?.items?.length;
        }
      }
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

  getMetaForSingleArticle = (entryId) => {
    const articles = [];
    this.state.categoryItems.forEach(category => {
      const { categorySlug, categoryName } = category;
      category.categoryTopics.forEach(topic => {
        if (topic.fields && topic.fields.educationOrder) {
          const { slug: topicSlug, name } = topic.fields;
          topic.fields.educationOrder.forEach(article => {
            if (article.fields) {
              articles.push({
                entryId: article.sys.id, topic: { topicSlug, name }, category: { categorySlug, categoryName },
              });
            }

          });
        }

      });
    });
    return articles.find(article => article.entryId === entryId);
  };

  calculateMeta = (categoryItems) => {

    return new Promise((resolve, reject) => {
      try {
        const { assignedItems } = this.state;
        if (assignedItems && assignedItems.assignedContent && assignedItems.assignedContent.length > 0) {
          const articles = [];
          categoryItems.forEach(category => {
            const { categorySlug } = category;
            category.categoryTopics.forEach(topic => {
              if (topic.fields && topic.fields.educationOrder) {
                const { slug: topicSlug } = topic.fields;
                topic.fields.educationOrder.forEach(article => {
                  if (article.fields) {
                    articles.push({
                      entryId: article.sys.id, topicSlug, categorySlug,
                    });
                  }

                });
              }

            });
          });
          assignedItems.assignedContent = assignedItems.assignedContent.map(content => {
            const sluggedArticle = articles.find(article => article.entryId === content.contentSlug);
            return {
              ...content,
              ...sluggedArticle,
            };
          });
          this.setState({
            assignedItems,
          });
        }
        resolve();
      } catch (e) {
        reject(e.message);
      }

    });


  };

  navigateToTopicList = (category) => {
    const { forAssignment } = this.state;
    this.props.navigation.navigate(Screens.TOPIC_LIST_SCREEN, {
      category,
      getMetaForSingleArticle: this.getMetaForSingleArticle,
      forAssignment,
    });
  };

  navigateToBlockDetail = (isAssignedContent) => {
    const { assignedItems, favouriteItems } = this.state;
    this.props.navigation.navigate(Screens.TOPIC_CONTENT_LIST_SCREEN, {
      fromRecommendedContent: !!isAssignedContent,
      fromFavouriteContent: !isAssignedContent,
      content: isAssignedContent ? assignedItems.assignedContent : favouriteItems,
      recommendedCategory: {
        categoryName: isAssignedContent ? "Recommended Articles" : "Favourite Articles",
      },
    });
  };

  navigateToNext = (contentSlug) => {
    let educationOrder = this.state.educationOrder;
    const educationMeta = this.getMetaForSingleArticle(contentSlug);
    const topic = (educationMeta && educationMeta.topic) || {
      name: "",
    };
    const category = (educationMeta && educationMeta.category) || {
      categoryName: "",
    };
    this.props.navigation.navigate(Screens.EDUCATIONAL_CONTENT_PIECE, {
      contentSlug,
      educationOrder,
      category, topic,

    });
  };

  openSelectedEducation = (item, contentSlug) => {
    this.setState({ isLoading: true });
    let educationOrder = [];
    if (this.state.categoryItems) {
      this.state.categoryItems.filter((categoryItem) => {
        if (categoryItem.categoryTopics && categoryItem.categoryTopics.length > 0) {
          categoryItem.categoryTopics.filter((categoryTopics) => {
            if (categoryTopics.fields) {
              if (categoryTopics.fields.educationOrder && categoryTopics.fields.educationOrder.length > 0) {
                categoryTopics.fields.educationOrder.filter((educationOrderItem) => {
                  if (educationOrderItem.sys.id === contentSlug) {
                    educationOrder = categoryTopics.fields.educationOrder;
                  }
                });
              }
            }
          });
        }

      });
    }

    this.setState({ educationOrder: educationOrder, isLoading: false }, () => {
      this.navigateToNext(contentSlug);

    });
  };

  backClicked = () => {
    this.props.navigation.goBack();
  };


  render(): React.ReactNode {
    StatusBar.setBarStyle("dark-content", true);
    return (
      <SectionListComponent
        categoryItems={this.state.categoryItems}
        navigateToBlockDetail={this.navigateToBlockDetail}
        navigateToTopicList={this.navigateToTopicList}
        isLoading={this.state.isLoading}
        isMemberApp={true}
        openSelectedEducation={this.openSelectedEducation}
        backClicked={this.backClicked}
        readArticles={this.props.profile.markAsCompleted}
        showReadInfo={true}
        bookmarked={this.props.profile.bookmarked}
        assignedContent={this.state.assignedItems}
        forAssignment={this.state.forAssignment}

      />
    );
  };
}

export default connectEducationalContent()(SectionListScreen);
