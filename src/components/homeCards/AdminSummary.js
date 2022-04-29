import React, { Component } from 'react'
import { View, StyleSheet, TouchableOpacity, Pressable } from 'react-native'
import { Icon, Text, Toast} from "native-base"
import Accordion from "react-native-collapsible/Accordion"
import { connect } from 'react-redux'
import _ from "lodash"
import { Ionicons } from '@expo/vector-icons'

import Card from "../UX/Card"

import { translate } from "../../assets/translations/translationWorkers"
import { selectAdminCompetitions } from '../../redux/reducers'
import { setCurrentCompetition } from '../../redux/actions'


export class AdminSummary extends Component {

    constructor(props){
        super(props);

        this.state = {
            activeSections: []
        }
    }

    static _type = "admin"

    goToCompScreen = (comp) => {

        this.props.setCurrentCompetition(comp.id)
        this.props.navigation.navigate("CompetitionScreen", {competitionName: comp.name})
    }

    goToAdminScreen = (comp) => {
        this.props.setCurrentCompetition(comp.id)
        this.props.navigation.navigate("AdminScreen")
    }

    renderHeader = ({content: comp}, index, expanded) => {
        return (
            <View style={styles.accordionHeader}>
                <Text style={styles.compNameText}>{comp.name}</Text>
                {expanded
                    ? <Icon style={{ fontSize: 18, width: "auto" }} as={Ionicons} name="remove-circle" size={5} />
                    : <Icon style={{ fontSize: 18, width:"auto"}} as={Ionicons} name="add-circle" size={5} />}
            </View>  
        )
    }

    renderCompSummary = ({content: comp}) => {

        return(
        
            <View 
                key={comp.id}
                style={styles.AdminSummaryView} 
                >
                <View style={{...styles.pendingMatchPad}}/>
                <View style={{flex:1, justifyContent: "center", paddingVertical: 10}}>
                    <View style={{flexDirection: "row"}}>
                        <View style={{flex:1}}>
                            {comp.adminCompSummary().map(section => {
                                return(
                                    <View>
                                        {section.name ? <Text>{section.name}</Text> : null}
                                        <View style={styles.attributesView}>
                                            {section.attributes.map(item => 
                                                <TouchableOpacity style={styles.attributeView} onPress={() => Toast.show({"description": item.name + ": " + item.value})}>
                                                    {item.icon ? <Icon as={Ionicons} size={5} name={item.icon} style={styles.attributeIcon}/> : null}
                                                    <Text>{item.value}</Text>
                                                </TouchableOpacity>
                                            )}
                                            
                                        </View> 
                                    </View>
                                )
                            })}
                        </View>
                        
                        <View style={{justifyContent: "space-around", paddingRight: 10}}>
                            <Icon name="trophy" onPress={() => this.goToCompScreen(comp)}/>
                            <Icon name="clipboard" onPress={() => this.goToAdminScreen(comp)}/>
                        </View>
                    </View>
                        
                </View>
            </View>
        )
    }

    render() {

        if (_.isEmpty(this.props.adminComps)) return null
        //actionHelperText={"(" + Object.keys(this.props.adminComps).length + ")"}
        return (
            <Card
                titleIcon="clipboard"
                title={translate("tabs.competitions you administrate")}
                >
                    <Accordion
                        sections={Object.values(this.props.adminComps).map(comp => ({title: comp.name, content: comp}) )}
                        activeSections={this.state.activeSections}
                        onChange={(activeSections) => this.setState({ activeSections })}
                        touchableComponent={Pressable}
                        expandMultiple={true}
                        renderHeader={this.renderHeader}
                        renderContent={this.renderCompSummary}
                    />
            </Card>
        )
    }

}

const mapStateToProps = (state) => ({
    adminComps: selectAdminCompetitions(state)
})

const mapDispatchToProps = {
    setCurrentCompetition
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminSummary)

const styles = StyleSheet.create({

    AdminSummaryView: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        paddingVertical: 5,
        paddingHorizontal: 5,
    },

    accordionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10
    },

    pendingMatchPad: {
        width: 6,
        height: "90%",
        marginRight: 15,
        borderRadius: 3,
        backgroundColor: "#c6e17b",
    },

    compNameText: {
        fontFamily: "bold"
    },

    timeInfoView: {
        marginLeft: 10,
    },

    scheduleText: {
        textAlign: "right",
    },

    scheduledPad: {
        backgroundColor: "#c6e17b",
    },

    notScheduledPad: {
        backgroundColor: "#e1947b"
    },

    attributesView: {
        paddingVertical: 10,
        flexDirection: "row",
        flexWrap: "wrap"
    },

    attributeView: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 5
    },

    attributeIcon: {
        paddingRight: 15,
        color: "#ccc",
        width: "auto"
    },

    attributeName: {
        paddingRight: 10
    }

});

