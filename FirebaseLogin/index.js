import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { KeyboardAvoidingView, StyleSheet, ImageBackground } from 'react-native';
import Login from './screens/Login';
import Register from './screens/Register';
import ForgotPassword from './screens/ForgotPassword';
import { w } from '../api/Dimensions';

import {Notifications} from "expo";
import * as Permissions from "expo-permissions";
import Firebase from "../api/Firebase";

export default class FirebaseLogin extends Component {

  constructor(props) {
    super(props);

  }
  
  state = {
    currentScreen: 'login', // can be: 'login' or 'register' or 'forgot'
  };

  changeScreen = screenName => () => {
    this.setState({ currentScreen: screenName });
  };

  userSuccessfullyLoggedIn = (user) => {
    this.registerForPushNotificationsAsync(user.user.uid)
    //this.props.login(user);
  };

  registerForPushNotificationsAsync = async (uid) => {
    const {status: existingStatus} = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
        // Android remote notification permissions are granted during the app
        // install, so this will only ask on iOS
        const {status} = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;

    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
        return;
    }

    // Get the token that uniquely identifies this device
    let token = await Notifications.getExpoPushTokenAsync();

    let updates = {};
    updates["expoToken"] = token;
    Firebase.playersRef.doc(uid).update(updates);

  };

  dontLogin = () => {
    this.props.navigation.navigate('App');
  };

  render() {
    let screenToShow;

    switch(this.state.currentScreen) {
      case 'login':
        screenToShow = <Login change={this.changeScreen} success={this.userSuccessfullyLoggedIn} noLogIn={this.dontLogin}/>;
        break;
      case 'register':
        screenToShow = <Register change={this.changeScreen} />;
        break;
      case 'forgot':
        screenToShow = <ForgotPassword change={this.changeScreen}/>;
        break;
    }

    return (
      <KeyboardAvoidingView
        behavior="position"
        keyboardVerticalOffset={-w(40)}
        style={styles.container}
      >
        <ImageBackground
          source={this.props.background}
          style={styles.background}
          resizeMode="stretch"

        >
          {screenToShow}
        </ImageBackground>
      </KeyboardAvoidingView>
    )
  }
}

/*FirebaseLogin.propTypes = {
  login: PropTypes.func.isRequired,
};*/

FirebaseLogin.defaultProps = {
  background: null,
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ecd235',
  },
  background: {
    width: '100%',
    height: '100%',
  }
});
