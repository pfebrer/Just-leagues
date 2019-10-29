import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator, Text, TouchableOpacity, Image } from 'react-native';
import PropTypes from 'prop-types';
import {w, h, totalSize} from '../../../api/Dimensions';
import { translate } from '../../../assets/translations/translationManager';

export default class GetStarted extends Component {
  render() {
    return (
      [
      <TouchableOpacity key="email"
        onPress={() => {this.props.click("email")}}
        style={{...styles.button, ...styles.mailButton}}
        activeOpacity={0.6}
      >
        {this.props.isLogin
          ? <ActivityIndicator size="large" style={styles.spinner} color='white' />
          : <Text style={{...styles.text, ...styles.mailText}}>{translate("auth.log in").toUpperCase()}</Text>}
      </TouchableOpacity>,
      <TouchableOpacity key="google"
      onPress={() => {this.props.click("google")}}
      style={{...styles.button, ...styles.googleButton}}
      activeOpacity={0.6}
    >
      {this.props.isLogin
        ? <ActivityIndicator size="large" style={styles.spinner} color='white' />
        : [<Image key="googleIcon" style={styles.googleLogo} source={require("../../../assets/images/googleIcon.png")}/>,
          <Text key="googleText" style={{...styles.text, ...styles.googleText}}>{translate("auth.sign in with google")}</Text>]}
    </TouchableOpacity>]

    );
  }
}

GetStarted.propTypes = {
  click: PropTypes.func.isRequired,
  isLogin: PropTypes.bool.isRequired,
};

const styles = StyleSheet.create({
  button: {
    width: '85%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: w(2),
    borderRadius: w(10),
    marginTop: h(6),
    elevation: 3,
  },

  mailButton: {
    backgroundColor: 'black',
  },

  googleButton: {
    marginTop: h(2),
    backgroundColor: "white",
    flexDirection: "row",
    
  },

  text: {
    fontWeight: '700',
    paddingVertical: h(1),
    fontSize: totalSize(2.1),
  },

  mailText: {
    color: "white"
  },

  googleText: {
    color: "#4285F4",
    textAlign: "center",
    marginRight: w(10),
    flex: 1,
    fontSize: totalSize(1.9),
  },

  googleLogo: {
    marginHorizontal: w(3),
    height: h(2) + w(4),
    width: h(2) + w(4),
  },

  spinner: {
    height: h(5),
  },
});
