import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity} from 'react-native'

import Card from '../home/Card'
import { translate } from '../../assets/translations/translationManager'
import {renderName} from "../../assets/utils/utilFuncs"

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentMatch} from "../../redux/actions"
import { totalSize, h} from '../../api/Dimensions'
import { Icon } from 'native-base'
import UpdatableCard from './UpdatableCard'


class MatchResult extends Component {

    constructor(props){
        super(props)

        this.state = {
            pendingUpdate: false
        }
    }

    updateResult = (iTarget, step) => {

        let newResult = this.props.currentMatch.result.map( (val, i) => i == iTarget ? val + step : val )

        this.props.setCurrentMatch({result: newResult}, {merge: true})

        this.setState({pendingUpdate: true})
    }

    commitResultToDB = () => this.props.updateDBMatchParams(["result"], () => this.setState({pendingUpdate: false}) )

    render() {

        if (!this.props.currentMatch.playersIDs) return <Card loading/>

        let result = this.props.currentMatch.result || this.props.defaultResult
            
        let scoreInputs = result.map( (value, index) => (
            <ScoreInput 
                key={index} 
                value={value}
                disabled={!this.props.editable} 
                updateValue={(step)=>this.updateResult(index, step)}/>
        ))

        let players = this.props.currentMatch.playersIDs.map( uid => renderName(this.props.relevantUsers[uid].names, this.props.currentMatch.context.competition.settings.general.nameDisplay) )
        let ranks = this.props.currentMatch.playersIDs.map( uid => {
            return this.props.competitions[this.props.currentMatch.context.competition.id].playersIDs.indexOf(uid) + 1
        })

        return (
            <UpdatableCard
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

class ScoreInput extends Component {

    render() {

        if (this.props.disabled){

            return (
                <View style={styles.scoreInputView}>
                    <View style={styles.scoreValueView}>
                        <Text style={styles.scoreValue}>{this.props.value}</Text>
                    </View>
                </View>
            )

        } else {

            return (
                <View style={styles.scoreInputView}>
                    <TouchableOpacity 
                        style={styles.scoreInputControls}
                        onPress={() => this.props.updateValue(-1)}>
                        <Icon name="arrow-round-back" style={styles.scoreInputControlsIcon}/>
                    </TouchableOpacity>
                    <View style={styles.scoreValueView}>
                        <Text style={styles.scoreValue}>{this.props.value}</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.scoreInputControls}
                        onPress={() => this.props.updateValue(+1)}
                        >
                        <Icon name="arrow-round-forward" style={styles.scoreInputControlsIcon}/>
                    </TouchableOpacity>
                </View>
            )

        }

        
        
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    currentMatch: state.match,
    competitions: state.competitions,
    relevantUsers: state.relevantUsers
})

const mapDispatchToProps = dispatch => ({
    setCurrentMatch: (compInfo, config) => dispatch(setCurrentMatch(compInfo, config))
})

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