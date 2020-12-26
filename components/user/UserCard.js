import React, { Component } from 'react'
import { Text, View } from 'react-native'
import { connect } from 'react-redux'
import Firebase from '../../api/Firebase'
import { updateRelevantUsers } from '../../redux/actions'

class UserCard extends Component {

    constructor(props){
        super(props)

    }

    listenForUser = (uid) => {
        this.userListener = Firebase.onUserSnapshot(uid, user => this.props.updateRelevantUsers([user]))
    }

    componentWillUnmount(){
        if (this.userListener) this.userListener()
    }

    render() {

        const userInfo = this.props.relevantUsers[this.props.uid]

        if (!userInfo) {
            if (!this.userListener){
                this.listenForUser(this.props.uid)
            }
            return null
        }

        return (
            <View>
                <Text>{userInfo.names.firstName} {userInfo.names.lastName}</Text>
            </View>
        )
    }
}

const mapStateToProps = state => ({
    relevantUsers: state.relevantUsers
})

const mapDispatchToProps = {
    updateRelevantUsers
}

export default connect(mapStateToProps, mapDispatchToProps)(UserCard)
