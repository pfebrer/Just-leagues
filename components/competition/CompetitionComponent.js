import React, {Component} from 'react';
import { connect } from 'react-redux'

class CompetitionComponent extends Component {

    /* this.props.what determines the content of the component.
    This two static properties determines the functions to be called in each case */
    get listener(){

        const comp = this.props.competition

        const listeners = {
            main: comp.compScreenListener,
            compState: comp.compStateListener,
            matches: comp.compMatchesListener
        }

        return listeners[this.props.what]
    }

    get renderer (){

        const comp = this.props.competition

        const renderFuncs = {
            main: comp.renderCompScreen,
            compState: comp.renderCompState,
            matches: comp.renderCompMatches
        }

        return renderFuncs[this.props.what]
        
    }

    constructor(props){
        super(props);

        this.state = {}

    }

    componentDidMount(){

        //console.warn(this.listener)

        this.activeListener = this.listener(this.updateState, this.state, this.props)

    }

    componentWillUnmount(){
        //Unsubscribe from listeners
        if (this.activeListener) this.activeListener()
    }

    componentDidUpdate(prevProps){
        
        if (this.props.competition && !prevProps.competition || (this.props.competition.id != prevProps.competition.id) ){
            if (this.activeListener) this.activeListener()
            this.activeListener = this.listener(this.updateState, this.state, this.props)
        }
    }

    updateState = (updates) => {
        //This function is meant so that classes can set the state of the component
        this.setState(updates)
    }

    render(){

        if (!this.renderer) return null

        return this.renderer(this.state, this.props)

    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
})

export default connect(mapStateToProps)(CompetitionComponent);