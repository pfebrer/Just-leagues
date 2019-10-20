import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableOpacity, Text, Keyboard } from 'react-native';
import { w, h, totalSize } from "../../../api/Dimensions";
import InputField from '../../components/InputField';
import Firebase from '../../../api/Firebase';
import { translate } from '../../../assets/translations/translationManager';

const email = require('../../assets/email.png');

export default class ForgotPassword extends Component {

  state = {
    isEmailCorrect: false,
  };

  sendEmail = () => {

    Keyboard.dismiss();

    const email = this.email.getInputValue();
    this.setState({
      isEmailCorrect: email === '',
    }, () => {
      if(email !== ''){
        this.sendEmailWithPassword(email);
      } else {
        Toast.show({
          text: 'Enter correct e-mail address',
          buttonText: 'Okay'
        })
      }
    });
  };

  sendEmailWithPassword = (email) => {
    Firebase.sendEmailWithPassword(email)
      .then(result => {
        if(result) this.props.change('login')();
      });
  };

  onFocusChanged = () => {
    this.setState({ isEmailCorrect: this.email.getInputValue() === '' });
  };

  render(){
    return (
      <View style={styles.container}>
        <Text style={styles.forgot}>{translate("auth.forgot your password?")}</Text>
        <InputField
          placeholder={translate("auth.email")}
          keyboardType="email-address"
          error={this.state.isEmailCorrect}
          returnKeyType="done"
          blurOnSubmit={true}
          focus={this.changeInputFocus}
          ref={ref => this.email = ref}
          icon={email}
        />
        <TouchableOpacity onPress={this.sendEmail} activeOpacity={0.6} style={styles.button}>
          <Text style={styles.buttonText}>{translate("auth.send email")}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.props.change('login')} style={styles.touchable}>
          <Text style={styles.login}>{'<'} {translate("auth.log in")}</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

ForgotPassword.propTypes = {
  change: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgot: {
    color:'white',
    fontSize: totalSize(2.5),
    marginBottom: h(5),
    fontWeight: '700',
  },
  button: {
    width: w(85),
    marginTop: h(6),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: w(1.8),
    borderRadius: w(25),
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    paddingVertical: h(1),
    fontSize: totalSize(2),
  },
  login: {
    color:'#ffffffEE',
    fontSize: totalSize(2),
    fontWeight: '700',
  },
  touchable: {
    alignSelf: 'flex-start',
    marginLeft: w(8),
    marginTop: h(4),
  }
});