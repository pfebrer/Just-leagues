import React, { Component } from 'react'
import { Text, StyleSheet, View, Pressable, Image } from 'react-native'

import Card from '../UX/Card'
import { translate } from '../../assets/translations/translationWorkers'

import BlankProfile from "../../assets/images/blank-profile.png"

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentMatch} from "../../redux/actions"
import { totalSize, h} from '../../api/Dimensions'
import UpdatableCard from '../UX/UpdatableCard'
import InputField from '../configs/inputs'
import SquashMatchTracker from '../../Useful objects/sports/squash/matchTracker'

import _ from 'lodash'
import moment from "moment"
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
        
        const pendingUpdate = result[0] !== "" && result[1] !== ""

        this.setState({pendingUpdate})
    }

    commitResultToDB = () => this.props.updateDBMatchParams(["result"], () => this.setState({pendingUpdate: false}) )

    render() {

        if (!this.props.match.playersIDs) return <Card loading/>

        let result = this.props.match.result || this.props.defaultResult || this.defaultResult
        
        const ScoreInput = (props) => {
            const textStyles = props.winner ? styles.winnerText : {}

            return <InputField
                type="number"
                key={props.index} 
                value={props.value}
                disabled={!props.editable}
                style={{padding: 0, margin: 0}}
                valueContainerStyle={{borderWidth: 0, elevation: 0, padding: 0, margin: 0}}
                inputContainerStyle={{padding: 5, margin: 0, flex: 1, width:"100%", ...textStyles}}
                disabledValueContainerStyle={{borderWidth: 0, elevation: 0}}
                onValueChange={(value)=> this.updateResultIndex(props.index, value)}
                controlMode="keyboard"/>
        }

        let players = this.props.match.playersIDs.map( uid => this.props.match.context.competition.renderName(this.props.relevantUsers, uid) )
        let ranks = this.props.match.playersIDs.map( uid => {
            return this.props.match.context.competition.playersIDs.indexOf(uid) + 1
        })
        const pics = this.props.match.playersIDs.map( uid => this.props.relevantUsers[uid].profilePic )

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

        const PlayerView = (props) => {
            const textStyles = props.winner ? styles.winnerText : {}
            const imgSrc = props.profilePic ? {uri: props.profilePic} : BlankProfile

            return <View style={styles.playerView}>
                <View style={styles.profileImageView}>
                    <Image style={styles.profileImage} source={imgSrc}/>
                </View>
                <View style={styles.playerNameView}>
                    <Text style={{...styles.playerNameText, ...textStyles}}>{props.name}</Text>
                    <Text style={{...styles.playerRankingText, ...textStyles}}>{`(${props.rank})`}</Text>
                </View>
            </View>
        }

        const scoreViewStyles = {
            ...styles.scoreView, 
            ...(this.props.editable ? styles.editableScoreView : styles.notEditableScoreView)
        }

        const timeInfo = this.props.match.scheduled?.time || this.props.match.playedOn
        const calendarTime = timeInfo ? moment(timeInfo).format("DD.MM.YYYY") : translate("vocabulary.no date")
        const hour = timeInfo ? moment(timeInfo).format("HH:mm") : ""

        const winners = [
            this.props.match.playedOn && (result[0] > result[1]),
            this.props.match.playedOn && (result[1] > result[0])
        ]

        return (<View>
            <View style={styles.matchSummaryView}>
                <PlayerView name={players[0]} rank={ranks[0]} winner={winners[0]} profilePic={pics[0]}/>
                
                <View style={styles.scoreContainer}>
                    <View style={styles.dateView}>
                        <Text style={styles.dayText}>{calendarTime}</Text>
                        <Text style={styles.hourText}>{hour}</Text>
                    </View>
                    <View style={scoreViewStyles}>
                        <ScoreInput index={0} value={result[0]} winner={winners[0]} editable={this.props.editable}/>
                        <View style={styles.scoreSeparator}/>
                        <ScoreInput index={1} value={result[1]} winner={winners[1]} editable={this.props.editable}/>
                    </View>
                </View>

                <PlayerView name={players[1]} rank={ranks[1]} winner={winners[1]} profilePic={pics[1]}/>
            </View>
            {this.state.pendingUpdate ? <Button style={{marginTop: 15, backgroundColor: "green"}} onPress={this.commitResultToDB}>{translate("actions.submit result")}</Button> : null}
            <Tracker/>
            </View>

            )
            
        // (
        //     <UpdatableCard
        //         cardContainerStyles={this.props.style}
        //         titleIcon="tennisball"
        //         title={translate("vocabulary.match score")}
        //         pendingUpdate={this.state.pendingUpdate}
        //         onCommitUpdate={this.commitResultToDB}
        //         >
        //         <View style={styles.playerNameView}>
        //             <Text style={{...styles.playerNameText, textAlign: "left"}}>{"(" + ranks[0] + ") " + players[0]}</Text>
        //         </View>
        //         <View style={styles.scoreContainer}>
        //             {scoreInputs}
        //         </View>
                
        //         <View style={styles.playerNameView}>
        //             <Text style={{...styles.playerNameText,textAlign:"right"}}>{players[1] + " (" + ranks[1] + ")"}</Text>
        //         </View>

        //         <Tracker/>

        //     </UpdatableCard>
        // )
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
    playerView: {
        justifyContent: "center",
        width: "35%",
        alignItems: "center"
    },

    profileImageView: {
        paddingVertical: 10
    },

    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 50
    },

    playerNameView: {
        justifyContent: "center",
        alignItems: "center"
    },

    playerNameText: {
        textAlign: "center",
        fontSize: totalSize(1.5)
    },

    winnerText: {
        fontWeight: "bold"
    },

    matchSummaryView: {
      flexDirection: "row", 
    },

    //Scores input
    scoreContainer: {
        width: "30%",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 10,
    },

    dateView: {
        justifyContent: "center",
        alignItems: "center"
    },

    dayText: {
        justifyContent: "center",
        alignItems: "center"
    },

    hourText: {
        color: "gray"
    },

    scoreView: {
        padding: 2,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },

    scoreSeparator: {
        width: 10,
        backgroundColor: "black",
        height: 1,
        borderRadius: 1.5
    },

    editableScoreView: {
        //borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 2,
        //borderStyle: "dashed"
    },

    scoreInputView: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        flex:1
    },

    scoreInputControls: {
        padding: 20,
    },

    scoreInputControlsIcon: {
        fontSize: totalSize(1.5)
    },
})