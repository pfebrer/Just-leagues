import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity} from 'react-native'

import Card from '../UX/Card'
import { translate } from '../../assets/translations/translationWorkers'

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentMatch} from "../../redux/actions"
import { totalSize, h} from '../../api/Dimensions'
import { Icon } from 'native-base'


class MatchDiscussion extends Component {

    constructor(props){
        super(props)

        this.state = {
            pendingUpdate: false
        }
    }

    updateResult = (iTarget, step) => {

        this.props.setCurrentMatch({result: newResult}, {merge: true})

        this.setState({pendingUpdate: true})
    }

    commitResultToDB = () => this.props.updateDBMatchParams(["comments"], () => this.setState({pendingUpdate: false}) )

    render() {

        return null;

        return (
            <Card
                titleIcon="chatboxes"
                title="Discussió">
                
            </Card>
        )
        
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

export default connect(mapStateToProps, mapDispatchToProps)(MatchDiscussion);

const styles = StyleSheet.create({

})