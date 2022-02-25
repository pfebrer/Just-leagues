import { Component } from "react";
import { connect } from "react-redux";
import { selectUserSetting } from "../../redux/reducers";

import { setI18nConfig } from "./translationWorkers"

class TranslationManager extends Component {

    render(){
        setI18nConfig(this.props.language);
        return null
    }
}

const mapStateToProps = state => ({
    language: selectUserSetting(state, "General appearance", "language"),
})

export default connect(mapStateToProps)(TranslationManager)