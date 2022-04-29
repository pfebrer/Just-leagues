import React, { Component } from 'react'
import { Select } from 'native-base'
import { connect } from 'react-redux'
import _ from "lodash"

import { translate } from '../../assets/translations/translationWorkers';
import { selectCurrentCompetition } from '../../redux/reducers';

class PlayerPicker extends Component {
    
    constructor(props){
        super(props);

        this.state = {
            value: undefined
        }

    }

    renderItems = () => {

        if (!this.props.currentComp || !this.props.currentComp.playersIDs) return null

        let items = this.props.currentComp.playersIDs.reduce( (items, uid) => {

            if (this.props.relevantUsers[uid] && this.props.relevantUsers[uid].asigned === false ) {
                items.push( {label: this.props.currentComp.renderName(this.props.relevantUsers, uid) , value: uid} )
            }

            return items
        }, [])

        items = _.sortBy(items, ["label"])

        return items.map( ({label, value}) => <Select.Item key={value} label={label} value={value}/> )

    }

    render() {
        return (
            <Select
                note
                mode="dropdown"
                placeholder = {translate("actions.pick a player")}
                style={this.props.style}
                selectedValue={this.props.value || this.state.value}
                onValueChange={(value) => {this.setState({value}); this.props.onPlayerChange(value)}}
            >
                {this.renderItems()}
            </Select>
        )
    }
}

const mapStateToProps = (state) => ({
    currentComp: selectCurrentCompetition(state),
    currentUser: state.currentUser,
    relevantUsers: state.relevantUsers
})

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayerPicker)

