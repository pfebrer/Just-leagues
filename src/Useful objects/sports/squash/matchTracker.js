import React, { Component, useRef } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import GameTracker from './gameTracker'
import Carousel from "react-native-reanimated-carousel";
import BottomSheet from 'reanimated-bottom-sheet';

import { h, w } from '../../../api/Dimensions';
import { Button } from 'native-base';
import Colors from '../../../constants/Colors';
import { translate } from '../../../assets/translations/translationWorkers';


export default class SquashMatchTracker extends Component {
    constructor(props){
        super(props)
        this.state = {
            games: props.games || [
                {
                    sequence: [
                    ],
                    result: [0, 0]
                },
            ],
            result: [0,0],
            time: 0,
            matchControlsModal: false,
        }

    }

    newLet = (gameIndex, playerIndex) => {
        const games = this.state.games.map((game, i) => {

            if (i === gameIndex) {
                // Can't register a let if the game hasn't started
                if(game.sequence.length == 0) return game
                // Same if the game is already over
                if(game.end) return game
                game.sequence = [...game.sequence, {playerIndex, event: "yes let"}]
            }
            return game
        })

        this.setState({games: games})
    }

    newGamePoint = (gameIndex, playerIndex, serveSide, extras) => {

        const games = this.state.games.map((game, i) => {

            if (i === gameIndex) {
                // The only way to start a game is with a start event.
                if (game.sequence.length == 0 && extras.event != "start") return game
                // Can't add a new point if the game is over
                if (game.end) return game

                game.sequence = [...game.sequence, {playerIndex, serve_side: serveSide, ...extras}]
                if (game.sequence.length > 1) {
                    game.result[playerIndex] += 1
                }
                

                if (game.result[playerIndex] >= 11){
                    let otherIndex = playerIndex === 0 ? 1 : 0
                    if (game.result[playerIndex] - game.result[otherIndex] >= 2) {
                        game.end = Date.now()
                    }
                }
            }
            return game
        })

        this.setState({games: games})
    }

    updateGamePoint = (gameIndex, pointIndex, updates) => {

        const games = this.state.games.map((game, i) => {

            if (i === gameIndex){
                game.sequence[pointIndex] = {...game.sequence[pointIndex], ...updates}
            }

            return game
        })

        this.setState({games: games})
    }

    undoGamePoint = (gameIndex) => {
        const games = this.state.games.map((game, i) => {

            if (i === gameIndex) {
                if (game.sequence.length == 0) return game

                const {playerIndex, event} = game.sequence.pop()
                if (playerIndex !== undefined && game.sequence.length > 0 && event !== "yes let") {
                    game.result[playerIndex] -= 1
                }

                game.end = false
            }
            return game
        })

        this.setState({games: games})
    }

    newGame = () => {
        console.warn(this.state.games)
        if (!this.state.games[this.state.games.length-1].end) return

        this.setState({games: [...this.state.games, {result: [0,0], sequence: []}]})
    }

    updateTracking = () => {

    }

    getResult = () => {

        let result = [0, 0]

        for (let game of this.state.games){
            if (game.end){
                let winnerIndex = game.sequence[game.sequence.length - 1].playerIndex
                result[winnerIndex] += 1
            }
        }

        return result
    }

    getGames = () => [...this.state.games]

    _renderBottomSheet = () => {

        if (this.state.matchControlsModal){
            return <View style={{height: h(30)}}>
                {this.state.games.map((game, i) => {
                    return <Text>{game.result}</Text>
                })}
            </View>
        } else {
            return null
        }
        
    }

    render() {

        const playerNames = this.props.match.playersIDs.map(playerID => this.props.match.context.competition.renderName(this.props.relevantUsers, playerID))

        return <View style={{flex: 1}}>
            <GamesCarousel
                playerNames={playerNames}
                games={this.state.games}
                matchResult={this.state.result}
                newGamePoint={this.newGamePoint}
                newLet={this.newLet}
                updateGamePoint={this.updateGamePoint}
                undoGamePoint={this.undoGamePoint}
                newGame={this.newGame}
                />
            {/* <Modal
                isVisible={this.state.matchControlsModal}
                onBackButtonPress={() => this.setState({matchControlsModal: false})}
                onBackdropPress={() => this.setState({matchControlsModal: false})}
                backdropOpacity={0.4}>
                <View style={{backgroundColor: "white"}}>
                <Text>I am the modal content!</Text>
                </View>
            </Modal> */}
            {/* <MatchSheet/> */}
            {/*this._renderBottomSheet()*/}
            {/* <TouchableOpacity onPress={() => this.setState({matchControlsModal: !this.state.matchControlsModal})}>
                <Text>MATCH SUMMARY</Text>
            </TouchableOpacity> */}
        </View>
    }

}

function MatchSheet() {
    const renderContent = () => (
      <View
        style={{
          backgroundColor: 'white',
          padding: 16,
          height: 450,
        }}
      >
        <Text>Swipe down to close</Text>
      </View>
    );
  
    const sheetRef = React.useRef(null);
  
    return (
      <>
        <View
          style={{
            backgroundColor: 'papayawhip',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TouchableOpacity
            onPress={() => sheetRef.current.snapTo(0)}
            ><Text>"Open Bottom Sheet"</Text></TouchableOpacity>

        </View>
        <BottomSheet
          ref={sheetRef}
          snapPoints={[200,100, 0]}
          borderRadius={10}
          renderContent={renderContent}
        />
      </>
    );
  }

const GamesCarousel = (props) => {

    const ref = useRef(null);

    const _renderItem = ({item: game, index: i}) => {

        if (game === "dummy") return <View style={{padding: 30}}>
            <Button style={{backgroundColor: Colors.WINNER_GREEN_BG}} onPress={props.newGame}>
                <Text style={{fontWeight: "bold", color: "darkgreen"}}>{translate("actions.new game").toUpperCase()}</Text>
            </Button>
        </View>

        return <GameTracker 
            game={game}
            gameIndex={i}
            playerNames={props.playerNames}
            matchResult={props.matchResult}
            newPoint={(...args) => props.newGamePoint(i, ...args)}
            newLet={(...args) => props.newLet(i, ...args)}
            updatePoint={(...args) => props.updateGamePoint(i, ...args)}
            undo={(...args) => props.undoGamePoint(i, ...args)}/>
    }

    let data = [...props.games]
    // If the last game is over, we allow the user to start a new game
    if(data[data.length - 1].end) data.push("dummy")

    return <GestureHandlerRootView style={{flex:1, height: "100%"}}>
        <View style={{flex:1, height: "100%"}}>
            <Carousel
            vertical={false}
            loop={false}
            onScrollBegin={() => console.warn("SCROLLING")}
            ref={ref}
            width={w(100)}
            style={{ width: "100%" }}
            autoPlay={false}
            data={data}
            pagingEnabled={true}
            renderItem={_renderItem}
        />
        </View> 
    </GestureHandlerRootView>
}
