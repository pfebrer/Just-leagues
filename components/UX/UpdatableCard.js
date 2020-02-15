import React, { Component } from 'react'
import { StyleSheet} from 'react-native'

import _ from "lodash"

import Card from './Card'

export default class UpdatableCard extends Component {

    render() {

        let cardProps = {
            titleIconStyles: this.props.pendingUpdate ? styles.pendingUpdateFont : null,
            titleTextStyles: this.props.pendingUpdate ? styles.pendingUpdateFont : null,
            actionIcon: this.props.pendingUpdate ? "cloud-upload" : null,
            actionIconStyles: styles.pendingUpdateFont,
            cardContainerStyles: this.props.pendingUpdate ? {backgroundColor: "#ef8345"} : null,
            onHeaderPress: this.props.pendingUpdate ? this.props.onCommitUpdate : null,
        }

        return (
            <Card {...{..._.omit(this.props, ["children", "onCommitUpdate","pendingUpdate"]), ...cardProps}}>
                {this.props.children}
            </Card>
        )

    }
}

const styles = StyleSheet.create({

    //UPDATING STYLES
    pendingUpdateFont: {
        color: "#f8c8ac", 
        fontFamily: "bold"
    }
})
