import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { Button, Icon } from 'native-base'
import React, { Component } from 'react'
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { translate } from '../../../assets/translations/translationWorkers'

export default class GameTracker extends Component {

    constructor(props){
        super(props)
    }

    onScorePress = (who) => {
        this.newPoint(who)
    }

    onServeSidePress = (who, serveSide) => {
        this.props.updatePoint(this.props.game.sequence.length - 1, {serve_side: serveSide})
    }

    onYesLet = (who) => {
        this.props.newLet(who)
    }

    onStroke = (who) => {
        this.newPoint(who, {event: "stroke"})
    }

    onNoLet = (who) => {
        this.newPoint(who === 0 ? 1 : 0, {event: "no let"})
    }

    newPoint = (who, extras) => {

        // Let's guess what will be the serve side for this next point
        var serveSide = "R"
        const sequenceLength = this.props.game.sequence.length

        if (sequenceLength == 0) {
            return this.props.newPoint(who, serveSide, {event: "start"})
        }
        
        let lastPoint;
        for (var i = sequenceLength - 1; i >= 0; --i) {
            if (this.props.game.sequence[i].event !== "yes let"){
                lastPoint = this.props.game.sequence[i]
                break
            }
        }

        if (lastPoint.playerIndex === who){
            // If the player that won this point already served, then the serving side
            // is the opposite as the last one
            serveSide = lastPoint.serve_side === "R" ? "L" : "R"
        } else {
            for (var i = sequenceLength - 1; i > 0; --i) {
                if (this.props.game.sequence[i].playerIndex === who && this.props.game.sequence[i].event !== "yes let" && this.props.game.sequence[i - 1].playerIndex !== who){
                    serveSide = this.props.game.sequence[i].serve_side
                    break
                }
            }
        }

        this.props.newPoint(who, serveSide, extras)
    }

    undo = () => {
        this.props.undo()
    }

    renderPlayerSideView = (playerName, playerIndex) => {
        /* Renders all the elements at each side of the screen, which contain:
            - Name of the player.
            - Button with current points (Adds new point when pressed)
            - Buttons to choose serving side
            - Buttons for decisions (Yes let, stroke, no let)
        */

        return <View style={{width: "35%", alignItems: "center", justifyContent: "center"}}>
            <View style={{paddingVertical: 10}}>
                <Text>{playerName}</Text>
            </View>

            <TouchableOpacity style={{
                justifyContent: "center", alignItems: "center", backgroundColor: "#ccc", width: "80%", 
                aspectRatio: 1, borderRadius: 20, borderColor: "black", borderWidth: 2}}
                onPress={() => this.onScorePress(playerIndex)}>
                <Text style={{fontSize: 40}}>{this.props.game.result[playerIndex]}</Text>
            </TouchableOpacity>
            <View style={{flexDirection: "row"}}>
                <TouchableOpacity style={styles.serveSideButton} onPress={() => this.onServeSidePress(playerIndex, "L")}>
                    <Text>{translate("directions.L")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.serveSideButton} onPress={() => this.onServeSidePress(playerIndex, "R")}>
                    <Text>{translate("directions.R")}</Text>
                </TouchableOpacity>

            </View>
            <View style={{flex: 1}}></View>


            <TouchableOpacity style={styles.decisionButton} onPress={() => this.onYesLet(playerIndex)}>
                <Text>YES LET</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.decisionButton} onPress={() => this.onStroke(playerIndex)}>
                <Text>STROKE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.decisionButton} onPress={() => this.onNoLet(playerIndex)}>
                <Text>NO LET</Text>
            </TouchableOpacity>
        </View>
    }
    
    render() {

        const playerNames = this.props.playerNames

        return (
            <View style={{flex: 1, paddingTop: 20}}>
                <View style={{display: "flex", flexDirection: "row", flex: 1}}>
                    {this.renderPlayerSideView(playerNames[0], 0)}
                    <View style={{flex: 1}}>
                        <View style={{paddingVertical: 10, justifyContent: "center", alignItems: "center"}}>
                            <View style={{paddingHorizontal: 5}}>
                                <Text style={{fontWeight: "bold"}}>{translate("vocabulary.game").toUpperCase()} {this.props.gameIndex + 1}</Text>
                            </View>
                        </View>
                        
                        <PointsSequence sequence={this.props.game.sequence}/>
                        {this.props.game.end ? <View style={styles.gameEndView}><Text style={styles.gameEndText}>{translate("vocabulary.end")}</Text></View> : null}
                    </View>
                    {this.renderPlayerSideView(playerNames[1], 1)}
                </View>
                <View style={{paddingVertical: 10, alignItems: "center"}}>
                    <Button leftIcon={<Icon as={MaterialIcons} size={5} name="undo"/>} onPress={this.undo}>
                        <Text style={{color: "white", fontWeight: "bold"}}>{translate("actions.undo")}</Text>
                    </Button>
                </View>

            </View>
            
        )
    }
}

class PointsSequence extends Component {

    renderPointMark = ({playerIndex, event, serve_side}, playerPoints) => {
        let addedStyles = {}
        if (["no let", "stroke"].includes(event)) {

            let borderSide = ["Right", "Left"][playerIndex]

            addedStyles = {
                [`border${borderSide}Color`]: {"no let": "red", "stroke": "green"}[event],
                [`border${borderSide}Width`]: 5,
            }

        }

        return <View style={{flexDirection: "row", marginVertical: 3}}>
                {playerIndex === 0 ? <View style={styles.leftTriangle}></View> : null}
                <View style={{backgroundColor: "#ccc", flex: 1, alignItems: "center", height: 20, ...addedStyles}}>
                    <Text>{playerPoints} {translate(`directions.${serve_side}`)}</Text>
                </View>
                {playerIndex === 1 ? <View style={styles.rightTriangle}></View> : null}
            </View>
        
    }

    renderEmptyMark = () => {
        return <View style={{height: 20, marginVertical: 3}}/>
    }

    render(){
        
        let leftPoints = []
        let rightPoints = []
        let result = [0, 0]

        this.props.sequence.forEach(item => {

            let {playerIndex, event} = item
            
            if (!["yes let", "start"].includes(event)){
                result[playerIndex] += 1
            }

            let pointMark, emptySpace
            if (event === "yes let"){
                pointMark = <View style={{backgroundColor: "orange", height:3, width: "100%", marginVertical: 3}}></View>
                emptySpace = <View style={{height: 3, marginVertical: 3}}></View>
            } else {
                pointMark = this.renderPointMark(item, result[playerIndex])
                emptySpace = this.renderEmptyMark()
            }

            if (playerIndex === 0){
                leftPoints.push(pointMark)
                rightPoints.push(emptySpace)
            } else if (playerIndex === 1){
                leftPoints.push(emptySpace)
                rightPoints.push(pointMark)
            }
        })

        return <ScrollView ref={scrollView => this.scrollView = scrollView}
                onContentSizeChange={( contentWidth, contentHeight ) => {
                    this.scrollView.scrollToEnd({animated: true});
                }}>
            <View style={{display: "flex", flexDirection: "row"}}>
                <View style={{flex: 1, alignItems: "flex-end"}}>
                    {leftPoints}
                </View>
                <View style={{flex: 1}}>
                    {rightPoints}
                </View>
            </View>
        </ScrollView>

    }
    
}

const styles = StyleSheet.create({
    leftTriangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderTopWidth: 10,
        borderBottomWidth: 10,
        borderRightWidth: 10,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderRightColor:"#ccc",
        margin: 0,
        borderWidth: 0,
    },
    rightTriangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderTopWidth: 10,
        borderBottomWidth: 10,
        borderLeftWidth: 10,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor:"#ccc",
        margin: 0,
        borderWidth: 0,
    },
    serveSideButton: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ccc",
        paddingVertical: 10,
        marginVertical: 10,
        marginHorizontal: 10,
    },
    decisionButton: {
        width: "80%",
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#ccc",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 5
    },

    gameEndView: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#c6e17b",
        padding: 10,
        marginTop: 10,
        marginBottom: 5
    },

    gameEndText: {
        color: "green",
        fontWeight: "bold"
    }
});
