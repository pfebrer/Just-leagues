import React, { Component } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Image, Keyboard } from 'react-native';
import InputField from "../../components/InputField";
import {w, h, totalSize} from '../../../api/Dimensions';
import GetStarted from './GetStarted';
import Firebase from '../../../api/Firebase';
import { translate } from '../../../assets/translations/translationWorkers';
import { Toast } from 'native-base';

const companyLogo = require('../../assets/companylogo.png');
const email = require('../../assets/email.png');
const password = require('../../assets/password.png');

export default class Login extends Component {

  state = {
    isEmailCorrect: false,
    isPasswordCorrect: false,
    isLogin: false,
  };

  getStarted = (mode) => {

    Keyboard.dismiss();

    if (mode == "google") {
      this.setState({ isLogin: true });

      const googleLoginFunc = __DEV__ ? Firebase.signInWithGoogleAsync : Firebase.signInWithGoogleAsync;

      var googleUser = googleLoginFunc().then((result) => {
        if (result.cancelled || result.error) this.setState({ isLogin: false })
      })
      

    } else if (mode == "email") {
      const email = this.email.getInputValue();
      const password = this.password.getInputValue();
  
      this.setState({
        isEmailCorrect: email === '',
        isPasswordCorrect: password === '',
      }, () => {
        if(email !== '' && password !== ''){
          this.loginToFireBase(email, password);
        } else {
          Toast.show({
            text: 'Fill up all fields',
            buttonText: 'Okay'
          })
        }
      });
    }
        
  };

  changeInputFocus = name => () => {
    if (name === 'Email') {
      this.setState({ isEmailCorrect: this.email.getInputValue() === '' });
      this.password.input.focus();
    } else {
      this.setState({ isPasswordCorrect: this.password.getInputValue() === '' });
    }
  };

  loginToFireBase = (email, password) => {
    this.setState({ isLogin: true });
    Firebase.userLogin(email, password)
      .then(user => {
        if(user) this.props.success(user);
        this.setState({ isLogin: false });
      });
  };

  render() {

    return (
      <View style={styles.container}>
        <Image style={styles.icon} resizeMode="contain" source={companyLogo}/>
        <View>
            <InputField
            placeholder={translate("auth.email")}
            keyboardType="email-address"
            style={styles.email}
            error={this.state.isEmailCorrect}
            focus={this.changeInputFocus}
            ref={ref => this.email = ref}
            icon={email}
            />
            <InputField
            placeholder={translate("auth.password")}
            returnKeyType="done"
            secureTextEntry={true}
            blurOnSubmit={true}
            error={this.state.isPasswordCorrect}
            ref={ref => this.password = ref}
            focus={this.changeInputFocus}
            icon={password}
            />
        </View>
        <GetStarted
          click={this.getStarted}
          isLogin={this.state.isLogin}
        />
        <View style={styles.textContainer}>
          <TouchableOpacity onPress={this.props.change('register')} activeOpacity={0.6}>
            <Text style={styles.createAccount}>{translate("auth.create account")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.props.change('forgot')} style={styles.forgotPasswordTouch} activeOpacity={0.6}>
            <Text style={styles.forgotPassword}>{translate("auth.forgot password")}</Text>
          </TouchableOpacity>
        </View>

      </View>
    )
  }
}

/*<TouchableOpacity onPress={this.props.noLogIn} style={styles.touchable, styles.avoidLogInTouch} activeOpacity={0.6}>
  <Text style={styles.useAsGuest}>{translate("auth.use app as guest")}</Text>
</TouchableOpacity>*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: "space-between",
    marginBottom: h(8)
  },
  icon: {
    width: w(70),
    height: h(30),
    marginTop: h(2),
    marginBottom: h(2),
  },
  textContainer: {
    width: w(100),
    flexDirection: 'row',
    marginTop: h(5),
    paddingLeft: 30,
    paddingRight: 30
  },
  email: {
    marginBottom: h(3),
  },
  forgotPasswordTouch:{
    flex:1
  },
  avoidLogInTouch:{
    paddingTop: 30
  },
  createAccount: {
    color:'#ffffffEE',
    textAlign: 'left',
    fontSize: totalSize(1.8),
    fontWeight: '600',
  },
  forgotPassword: {
    color:'#ffffffEE',
    textAlign: 'right',
    fontSize: totalSize(1.8),
    fontWeight: '600',
  },
  useAsGuest:{
    color:'#ffffffEE',
    textAlign: 'center',
    fontSize: totalSize(1.5),
  },
});
