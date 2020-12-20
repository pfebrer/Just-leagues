import React, {Component} from 'react';
import { StyleSheet, Text, View} from 'react-native';
import Firebase from "../api/Firebase"
import ChangePWModal from '../components/ChangePWModal';
import PlayerProfile from '../components/statDisplays/UserProfile';

//Redux stuff
import { connect } from 'react-redux'
import Card from '../components/UX/Card';
import DetailedStats from '../components/statDisplays/DetailedStats';

import Carousel, {Pagination} from 'react-native-snap-carousel';
import { w } from '../api/Dimensions';
import { selectUserSetting } from '../redux/reducers';


class ProfileScreen extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            playerMatches: []
        }
    }

    componentDidMount() {

        this.matchesListener = Firebase.onUserMatchesSnapshot(this.props.currentUser.id, () => {

        })

    }

    static getDerivedStateFromProps(nextProps, prevState) {

        let uid = nextProps.navigation.getParam("uid", "");

        return {uid}

    }

    hidePWModal = () => {
        this.setState({
            changePW: false,
        })
    }

    render() {

        let playerName = this.state.playerName;
        let changePWModal = this.state.changePW ? (
            <ChangePWModal hidePWModal={this.hidePWModal}/>
        ) : null;
        let uid = this.state.uid || this.props.currentUser.id

        return (
            <View style={{...styles.container, backgroundColor: this.props.backgroundColor}}>
                <Card>
                    <Text>{this.props.currentUser.displayName}</Text>
                </Card>

                <StatsCarousel groupedMatches={[[],[],[]]}/>

                <PlayerProfile uid={uid}/>
                {changePWModal}
            </View>
        );
    }
}

class StatsCarousel extends Component {

    constructor(props){
        super(props)

        this.state = {
            slider1ActiveSlide: 0
        }
    }

    _renderItem ({item, index}) {
        return (
            <DetailedStats playerMatches={item}/>
        );
    }

    render () {
        return (
            <View style={styles.exampleContainer}>
                <Carousel
                  ref={c => this._slider1Ref = c}
                  data={this.props.groupedMatches}
                  renderItem={this._renderItem}
                  sliderWidth={w(100)}
                  itemWidth={w(80)}
                  inactiveSlideScale={0.94}
                  inactiveSlideOpacity={0.7}
                  // inactiveSlideShift={20}
                  containerCustomStyle={styles.slider}
                  contentContainerCustomStyle={styles.sliderContentContainer}
                  loop={true}
                  loopClonesPerSide={2}
                  autoplayDelay={500}
                  autoplayInterval={3000}
                  onSnapToItem={(index) => this.setState({ slider1ActiveSlide: index }) }
                />
                <Pagination
                  dotsLength={this.props.groupedMatches.length}
                  activeDotIndex={this.state.slider1ActiveSlide}
                  containerStyle={styles.paginationContainer}
                  dotColor={'rgba(255, 255, 255, 0.92)'}
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

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    backgroundColor: selectUserSetting(state, "General appearance", "backgroundColor")
})

export default connect(mapStateToProps)(ProfileScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
    },
    statsScrollView: {
        flexGrow: 1,
    },
    statTitleView: {
        paddingTop: 20,
        paddingBottom: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    statTitleText: {
        fontSize: 16,
        fontFamily: "bold",
        color: "black"
    },
    sessionOptions: {
        height: 40,
        flexDirection: "row",
        display: "none"
    },
    logOutButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "red"
    },
    logOutText: {
        color: "white",
        fontFamily: "bold"
    },
    changePWButton: {
        flex: 1,
        backgroundColor: "#f0e837",
        alignItems: "center",
        justifyContent: "center",
    },
    changePWText: {
        color: "black",
        fontFamily: "bold"
    },


});