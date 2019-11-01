import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity} from 'react-native'

import Card from '../home/Card'
import { translate } from '../../assets/translations/translationManager'

//Redux stuff
import { connect } from 'react-redux'

import { totalSize, h} from '../../api/Dimensions'
import { Icon } from 'native-base'


class Head2Head extends Component {

    constructor(props){
        super(props)

        this.state = {
            pendingUpdate: false
        }
    }

    render() {

        return null;
        return (
            <Card
                titleIcon="filing"
                title="Història">
                
            </Card>
        )
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    currentMatch: state.match,
    IDsAndNames: state.IDsAndNames
})

export default connect(mapStateToProps)(Head2Head);

const styles = StyleSheet.create({

})