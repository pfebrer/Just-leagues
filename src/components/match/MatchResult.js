import React, { Component } from 'react'
import { Text, StyleSheet, View, Pressable } from 'react-native'

import Card from '../UX/Card'
import { translate } from '../../assets/translations/translationWorkers'

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentMatch} from "../../redux/actions"
import { totalSize, h} from '../../api/Dimensions'
import UpdatableCard from '../UX/UpdatableCard'
import InputField from '../configs/inputs'
import SquashMatchTracker from '../../Useful objects/sports/squash/matchTracker'

import _ from 'lodash'
import { Button, Modal } from 'native-base'




class MatchResult extends Component {

    constructor(props){
        super(props)

        this.state = {
            pendingUpdate: false,
            showMatchTracker: false,
            games: undefined
        }

        this.defaultResult = [0,0]
    }

    updateResultIndex = (iTarget, value) => {

        let newResult = _.cloneDeep(this.props.match.result || this.defaultResult)

        newResult[iTarget] = value

        this.updateResult(newResult)
    }

    updateResult = (result) => {
        this.props.setCurrentMatch({result}, {merge: true})

        this.setState({pendingUpdate: true})
    }

    commitResultToDB = () => this.props.updateDBMatchParams(["result"], () => this.setState({pendingUpdate: false}) )

    render() {

        if (!this.props.match.playersIDs) return <Card loading/>

        let result = this.props.match.result || this.props.defaultResult || this.defaultResult
            
        let scoreInputs = result.map( (value, index) => (
            <InputField
                type="number"
                key={index} 
                value={value}
                disabled={!this.props.editable} 
                onValueChange={(value)=>this.updateResultIndex(index, value)}/>
        ))

        let players = this.props.match.playersIDs.map( uid => this.props.match.context.competition.renderName(this.props.relevantUsers, uid) )
        let ranks = this.props.match.playersIDs.map( uid => {
            return this.props.match.context.competition.playersIDs.indexOf(uid) + 1
        })

        const Tracker = () => {
            if (!this.props.editable) return null
            
            return <View style={{marginTop: 20}}>
                <Button onPress={() => this.setState({showMatchTracker:true})}>{translate("actions.ref this match")}</Button>
                <Modal size="full" isOpen={this.state.showMatchTracker} onClose={() => this.setState({showMatchTracker:false})}>
                    <Modal.Content>
                    <Modal.CloseButton />
                    <Modal.Header>{translate("vocabulary.match")}</Modal.Header>
                    <Modal.Body style={{paddingLeft: 0, paddingTop: 0, paddingBottom: 0, paddingRight: 0, height: h(60)}}>
                        <SquashMatchTracker ref={tracker => this.tracker = tracker} 
                            match={this.props.match} 
                            relevantUsers={this.props.relevantUsers}
                            games={this.state.games}/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button.Group space={2}>
                        <Button onPress={() => {
                            const result = this.tracker.getResult()
                            const games = this.tracker.getGames()
                            this.updateResult(result)
                            this.setState({showMatchTracker:false, games: games})}
                        }>
                            {translate("actions.save")}
                        </Button>
                        </Button.Group>
                    </Modal.Footer>
                    </Modal.Content>
                </Modal>
            </View>
        }

        return (
            <UpdatableCard
                cardContainerStyles={this.props.style}
                titleIcon="tennisball"
                title={translate("vocabulary.match score")}
                pendingUpdate={this.state.pendingUpdate}
                onCommitUpdate={this.commitResultToDB}
                >
                <View style={styles.playerNameView}>
                    <Text style={{...styles.playerNameText, textAlign: "left"}}>{"(" + ranks[0] + ") " + players[0]}</Text>
                </View>
                <View style={styles.scoreContainer}>
                    {scoreInputs}
                </View>
                
                <View style={styles.playerNameView}>
                    <Text style={{...styles.playerNameText,textAlign:"right"}}>{players[1] + " (" + ranks[1] + ")"}</Text>
                </View>

                <Tracker/>

            </UpdatableCard>
        )
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    relevantUsers: state.relevantUsers
})

const mapDispatchToProps = {
    setCurrentMatch
}

export default connect(mapStateToProps, mapDispatchToProps)(MatchResult);

const styles = StyleSheet.create({
    //Players
    playerNameView: {
        width: "100%",
    },

    playerNameText: {
        fontSize: totalSize(2)
    },

    //Scores input
    scoreContainer: {
        flexDirection: "row",
        marginVertical: 10,
    },

    scoreInputView: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        flex:1
    },

    scoreValueView: {
        elevation: 3,
        backgroundColor: "white",
        height: h(6),
        width: h(6),
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center"
    },

    scoreValue: {
        fontSize: totalSize(2.5)
    },

    scoreInputControls: {
        padding: 20,
    },

    scoreInputControlsIcon: {
        fontSize: totalSize(1.5)
    },
})