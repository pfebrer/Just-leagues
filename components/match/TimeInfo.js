import React, { Component } from 'react'
import { StyleSheet, View } from 'react-native'
import DatePicker from 'react-native-datepicker'
import moment from "moment"

import Card from '../home/Card'

import { translate } from '../../assets/translations/translationManager'
import {convertDate} from "../../assets/utils/utilFuncs"

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentMatch} from "../../redux/actions"
import { totalSize } from '../../api/Dimensions'
import UpdatableCard from './UpdatableCard'
import { Text } from 'native-base'


class TimeInfo extends Component {

    constructor(props){
        super(props)
        this.state = {
            pendingUpdate: false
        }

        this.datePickerFormat = "DD-MM HH:mm"
    }

    DateLimit = ({limitDate, textStyles }) => {

        let momentLimit = moment(limitDate)

        let daysLeft = momentLimit.diff( moment(), "days")

        textStyles = {
            color: daysLeft > 7 ? "green" : daysLeft > 3 ? "yellow" : "darkred",
            ...textStyles 
        }

        return (
            <View>
                <View style={{paddingTop:10, flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                    <Text style={{textAlign: "center"}}>{translate("info.limit to play") + ":" }</Text>
                    <Text style={{ ...textStyles, textAlign: "center"}}>{moment(limitDate).fromNow()}</Text>
                </View>
                <Text note style={{ textAlign: "center"}}>{"(" + moment(limitDate).calendar() + ")"}</Text>
            </View>
        )
    }

    updateAndCommitSchedule = (newDate) => {
        this.updateScheduledTime(newDate);
        this.commitScheduleToDB();
    }

    updateScheduledTime = (newDate) => {

        if (newDate){
            newDate = moment(newDate, this.datePickerFormat ).toDate()
        }

        this.props.setCurrentMatch({ scheduled: {...this.props.currentMatch.scheduled, time: newDate} }, {merge: true})

        this.setState({pendingUpdate: true})
    }

    commitScheduleToDB = () => this.props.updateDBMatchParams(["scheduled"], () => this.setState({pendingUpdate: false}) )

    render() {

        let cardProps = {
            titleIcon: "calendar",
            title: !this.props.currentMatch.context.pending ? translate("cardTitles.match date") : translate("cardTitles.match schedule"),
            actionIcon: this.props.currentMatch.scheduled && this.props.currentMatch.scheduled.time ? "refresh" : null,
            actionIconStyles: {color: "darkred"},
            onHeaderPress: this.props.currentMatch.scheduled && this.props.currentMatch.scheduled.time ? () => this.updateAndCommitSchedule(null) : null,
            contentContainerStyles: {justifyContent:"center", alignItems: "center"}
        }

        if ( !this.props.currentMatch.context.pending) {

            return (
                <Card {...cardProps}>
                    <Text style={{textAlign: "center", fontFamily: "bold", fontSize: totalSize(2) }}>{[translate("vocabulary.played"), moment(this.props.currentMatch.playedOn).fromNow()].join(" ")}</Text>
                    <Text note style={{textAlign: "center"}}>{"(" + moment(this.props.currentMatch.playedOn).calendar() + ")"}</Text>
                </Card>
            )

        } else {

            let timeLimit = this.props.currentMatch.due ? (

                <this.DateLimit 
                        limitDate={this.props.currentMatch.due}
                        textStyles={{textAlign: "center", ...styles.dateLimit}}/>
                
            ) : (
                <View style={{paddingTop:10}}>
                    <Text style={{textAlign: "center"}}>{translate("info.no date limit to play match")}</Text>
                </View>
            )

            return (
                <Card
                    {...cardProps}>
                    <DatePicker
                        minDate={new Date()}
                        maxDate={this.props.currentMatch.due}
                        date={this.props.currentMatch.scheduled && this.props.currentMatch.scheduled.time ? this.props.currentMatch.scheduled.time : null}
                        onDateChange={(date) => this.updateAndCommitSchedule(date)}
                        style={{paddingHorizontal: 20, width: "100%", justifyContent: "center", alignItems: "center"}}
                        mode="datetime"
                        placeholder={translate("vocabulary.fix a date")}
                        format={this.datePickerFormat}
                        disabled={!this.props.editable}
                        showIcon={this.props.editable}
                        customStyles={{
                            dateInput: {
                              borderWidth: 0,
                            },
                            dateText: {
                                fontSize: totalSize(2)
                            }
                        }}/>
                    {timeLimit}
                </Card>
            )

        }

    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    currentMatch: state.match,
    IDsAndNames: state.IDsAndNames
})

const mapDispatchToProps = dispatch => ({
    setCurrentMatch: (compInfo, config) => dispatch(setCurrentMatch(compInfo, config))
})

export default connect(mapStateToProps, mapDispatchToProps)(TimeInfo);

const styles = StyleSheet.create({

    dateLimit: {
        fontFamily: "bold",
        paddingLeft: 10,
        fontSize: totalSize(2)
    },
})
