import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity
} from 'react-native';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import { w, h } from '../../api/Dimensions';

import {getCompetitionName} from "../../assets/utils/utilFuncs"

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentCompetition} from "../../redux/actions"

import Card from '../home/Card';
import { translate } from '../../assets/translations/translationManager';
import { selectCurrentCompetition } from '../../redux/reducers';



class ChatsCarousel extends Component {

    constructor(props){
        super(props)

        this.relevantComps = 

        this.state = {
            activeSlide: props.currentComp ? props.currentUser.activeCompetitions.indexOf(props.currentComp.id) : 0
        }
    }

    componentDidMount(){

        if (!this.props.currentComp){

            let defaultComp = this.props.competitions[this.props.currentUser.activeCompetitions[0]]
            if (defaultComp) this.props.setCurrentCompetition(defaultComp.id)
            
        }

    }

    componentDidUpdate(prevProps){

        if (!this.props.currentComp){

            let defaultComp = this.props.competitions[Object.keys(this.props.competitions)[0]]
            if (defaultComp) this.props.setCurrentCompetition(defaultComp.id)
            
        } else if ( this.props.currentComp && ( !prevProps.currentComp || prevProps.currentComp.id != this.props.currentComp.id) ){
            this._slider1Ref.snapToItem(this.props.competitions[this.props.currentComp.id])
        }
    }

    changeChat = (compID, target, isActiveComp) => {

        if ( !isActiveComp ){
            this.props.setCurrentCompetition(compID)
        }

        this.props.setNewMessagesTarget(target)
    }

    _renderItem ({item: comp, index}) {

        let particularChat = comp.type == "groups" ? translate("vocabulary.group") : "Particular"

        //Check if this is the active competition
        let isActiveComp = this.props.currentComp ? comp.id == this.props.currentComp.id : false

        //If the competition is the active competition add the active styles to the current chat target (general or particular chat)
        let activeStyles = isActiveComp ? 
            [false, true].map( particularChat => particularChat == this.props.messagesTarget.particularChat ? styles.activeChat : null)
            :
            [null,null]

        return (
            <View style={styles.carouselItem}>
                <View style={styles.carouselItemTitleView}>
                    <Text style={this.props.titleTextStyle} >{getCompetitionName(comp)}</Text>
                </View>
                <View style={styles.chatSelectorView}>
                    <TouchableOpacity 
                        style={{...styles.chatSelector, ...activeStyles[0]}}
                        onPress={() => this.changeChat(comp.id, {particularChat: false}, isActiveComp)}>
                        <Text style={this.props.chatSelectorTextStyle}>{translate("vocabulary.general")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{...styles.chatSelector, ...activeStyles[1]}}
                        onPress={() => this.changeChat(comp.id, {particularChat: true}, isActiveComp)}>
                        <Text style={this.props.chatSelectorTextStyle}>{particularChat}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    render() {

        this.availableComps

        let availableComps = Object.values(this.props.competitions)

        return (
            <View style={{flex:1, ...this.props.style}}>
                <Carousel
                  ref={c => this._slider1Ref = c}
                  data={availableComps}
                  firstItem={this.state.activeSlide}
                  renderItem={(args) => this._renderItem(args)}
                  sliderWidth={w(100)}
                  itemWidth={w(80)}
                  inactiveSlideScale={0.94}
                  inactiveSlideOpacity={0.7}
                  // inactiveSlideShift={20}
                  containerCustomStyle={styles.slider}
                  contentContainerCustomStyle={styles.sliderContentContainer}
                  onSnapToItem={(index) => this.setState({ activeSlide: index }) }
                />
                <Pagination
                  dotsLength={availableComps.length}
                  activeDotIndex={this.state.activeSlide}
                  containerStyle={styles.paginationContainer}
                  dotColor={'rgba(0, 0, 0, 0.92)'}
                  dotStyle={styles.paginationDot}
                  inactiveDotColor="black"
                  inactiveDotOpacity={0.4}
                  inactiveDotScale={0.6}
                  carouselRef={this._slider1Ref}
                  tappableDots={!!this._slider1Ref}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({

    paginationContainer: {
        paddingTop: 0,
        paddingBottom: 10
    },
    
    slider:{
        flex: 1,
    },

    carouselItem: {
        flex:1,
        height: 400,
        backgroundColor: "white",
        borderRadius: 10,
        overflow: "hidden",
        elevation:5,
        alignItems: "center",
        padding: h(2),
        marginHorizontal: 5,
        marginVertical: 10
    },

    carouselItemTitleView: {
        flex:1
    },

    chatSelectorView: {
        flex:1,
        flexDirection: "row",
    },

    chatSelector: {
        flex:1,
        height: "100%",
        justifyContent: "center",
        alignItems: "center"
    },

    activeChat: {
        backgroundColor: "#ccc",
        borderRadius: 20
    }
})

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    competitions: state.competitions,
    currentComp: selectCurrentCompetition(state)
})

const mapDispatchToProps = {
    setCurrentCompetition
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatsCarousel);