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

import _ from 'lodash'




class MatchResult extends Component {

    constructor(props){
        super(props)

        this.state = {
            pendingUpdate: false
        }

        this.defaultResult = [0,0]
    }

    updateResult = (iTarget, value) => {

        let newResult = _.cloneDeep(this.props.match.result || this.defaultResult)

        newResult[iTarget] = value

        this.props.setCurrentMatch({result: newResult}, {merge: true})

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
                onValueChange={(value)=>this.updateResult(index, value)}/>
        ))

        let players = this.props.match.playersIDs.map( uid => this.props.match.context.competition.renderName(this.props.relevantUsers, uid) )
        let ranks = this.props.match.playersIDs.map( uid => {
            return this.props.match.context.competition.playersIDs.indexOf(uid) + 1
        })

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