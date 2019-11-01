import React, { Component } from 'react'
import { Text, StyleSheet, View } from 'react-native'
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


class TimeInfo extends Component {

    constructor(props){
        super(props)
        this.state = {
            pendingUpdate: false
        }
    }

    DateLimit = ({limitDate, textStyles }) => {

        let daysLeft = ( limitDate - Date.now() ) / (1000*60*60*24)

        textStyles = {
            color: daysLeft > 7 ? "green" : daysLeft > 3 ? "yellow" : "darkred",
            ...textStyles 
        }

        let timeLeft = daysLeft > 1 ? 
            daysLeft + " "  + translate("vocabulary.days").toLowerCase() :
            daysLeft*24 + " "  + translate("vocabulary.hours").toLowerCase()
        
        let displayDate = convertDate(limitDate , "dd/mm hh:mm")

        return <Text style={{ ...textStyles, textAlign: "center"}}>{displayDate}</Text>
    }

    updateScheduledTime = (newDate) => {

        newDate = moment(newDate, "DD-MM HH:mm" ).toDate()

        this.props.setCurrentMatch({ scheduled: {...this.props.currentMatch.scheduled, time: newDate} }, {merge: true})

        this.setState({pendingUpdate: true})
    }

    commitScheduleToDB = () => this.props.updateDBMatchParams(["scheduled"], () => this.setState({pendingUpdate: false}) )

    render() {

        let cardProps = {
            titleIcon: "calendar",
            title: !this.props.currentMatch.context.pending ? translate("cardTitles.match date") : translate("cardTitles.match schedule"),
            contentContainerStyles: {justifyContent:"center", alignItems: "center"}
        }

        if ( !this.props.currentMatch.context.pending) {

            return (
                <Card {...cardProps}>
                    <Text style={{textAlign: "center", fontFamily: "bold", fontSize: totalSize(2) }}>{moment(this.props.currentMatch.playedOn).format("DD-MM-YYYY HH:mm")}</Text>
                </Card>
            )

        } else {

            let timeLimit = this.props.currentMatch.due ? (
                <View style={{paddingTop:10, flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                    <Text style={{textAlign: "center"}}>{translate("info.limit to play") + ":" }</Text>
                    <this.DateLimit 
                        limitDate={this.props.currentMatch.due}
                        textStyles={{textAlign: "center", ...styles.dateLimit}}/>
                </View>
            ) : (
                <View style={{paddingTop:10}}>
                    <Text style={{textAlign: "center"}}>{translate("info.no date limit to play match")}</Text>
                </View>
            )

            return (
                <UpdatableCard
                    {...cardProps}
                    pendingUpdate={this.state.pendingUpdate}
                    onCommitUpdate={this.commitScheduleToDB}>
                    <DatePicker
                        minDate={new Date()}
                        maxDate={this.props.currentMatch.due}
                        date={this.props.currentMatch.scheduled ? this.props.currentMatch.scheduled.time : null}
                        onDateChange={(date) => {this.updateScheduledTime(date)}}
                        style={{paddingHorizontal: 20, width: "100%", justifyContent: "center", alignItems: "center"}}
                        mode="datetime"
                        placeholder={translate("vocabulary.fix a date")}
                        format="DD-MM HH:mm"
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
                </UpdatableCard>
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
