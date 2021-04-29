import React, { Component } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

import GameTracker from './gameTracker'
import Carousel from 'react-native-snap-carousel';
import BottomSheet from 'reanimated-bottom-sheet';

import { h, w } from '../../../api/Dimensions';

export default class SquashMatchTracker extends Component {
    constructor(props){
        super(props)
        this.state = {
            games: [
                {
                    sequence: [
                        {playerIndex: 0, event: "start", serve_side: "L"},
                        {playerIndex: 0, serve_side: "R"},
                        {playerIndex: 1, serve_side: "R"}
                    ],
                    result: [1,1]
                },
                {
                    sequence: [
                        {playerIndex: 0, event: "start", serve_side: "L"},
                        {playerIndex: 0, serve_side: "R"},
                        {playerIndex: 1, serve_side: "R"}
                    ],
                    result: [2, 1]
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
                game.sequence = [...game.sequence, {playerIndex, event: "yes let"}]
            }
            return game
        })

        this.setState({games: games})
    }

    newGamePoint = (gameIndex, playerIndex, serveSide, extras) => {

        const games = this.state.games.map((game, i) => {

            if (i === gameIndex) {
                game.sequence = [...game.sequence, {playerIndex, serve_side: serveSide, ...extras}]
                game.result[playerIndex] += 1

                if (game.result[playerIndex] === 11){
                    game.end = Date.now()
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
                const playerIndex = game.sequence.pop().point
                if (playerIndex !== undefined){
                    game.result[playerIndex] -= 1
                }
            }
            return game
        })

        this.setState({games: games})
    }

    newGame = () => {
        this.setState({games: [...this.state.games, {result: [0,0], sequence: [{playerIndex: 0, event: "start", serve_side: "R"}]}]})
    }

    updateTracking = () => {

    }

    _renderBottomSheet = () => {

        if (this.state.matchControlsModal){
            return <View style={{height: h(30), backgroundColor: "red"}}>
                {this.state.games.map((game, i) => {
                    return <Text>{game.result}</Text>
                })}
            </View>
        } else {
            return null
        }
        
    }

    render() {

        return <View style={{flex: 1}}>
            <GamesCarousel 
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
            {this._renderBottomSheet()}
            <TouchableOpacity onPress={() => this.setState({matchControlsModal: !this.state.matchControlsModal})}>
                <Text>MATCH SUMMARY</Text>
            </TouchableOpacity>
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

class GamesCarousel extends Component {

    constructor(props){
        super(props)

        this.state = {
            scrolling: false,
        }
    }

    _renderItem = ({item: game, index: i}) => {

        if (game === "dummy") return <TouchableOpacity onPress={this.props.newGame}><Text>NEW GAME!</Text></TouchableOpacity>

        return <GameTracker 
            game={game}
            gameIndex={i}
            matchResult={this.props.matchResult}
            newPoint={(...args) => this.props.newGamePoint(i, ...args)}
            newLet={(...args) => this.props.newLet(i, ...args)}
            updatePoint={(...args) => this.props.updateGamePoint(i, ...args)}
            undo={(...args) => this.props.undoGamePoint(i, ...args)}/>
    }

    render(){
        return <Carousel
            ref={(c) => { this._carousel = c; }}
            data={[...this.props.games, "dummy"]}
            renderItem={this._renderItem}
            sliderWidth={w(100)}
            itemWidth={w(100)}
            onSnapToItem={this.onScroll}
        />
    }
}
