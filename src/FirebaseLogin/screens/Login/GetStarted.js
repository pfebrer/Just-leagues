import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator, Text, TouchableOpacity, Image } from 'react-native';
import {w, h, totalSize} from '../../../api/Dimensions';
import { translate } from '../../../assets/translations/translationWorkers';

import * as WebBrowser from 'expo-web-browser';
import * as NEW_Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential, OAuthProvider } from 'firebase/auth';
import Firebase from '../../../api/Firebase';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';

// import * as GoogleSignIn from 'expo-google-sign-in';

WebBrowser.maybeCompleteAuthSession();

export default function GetStarted (props){

    // Response state
    const [response, setResponse] = React.useState({});

    // Using the new API, which only works inside ExpoGo for some reason
    const [request, NEW_response, NEW_promptAsync] = NEW_Google.useIdTokenAuthRequest(
        {
            //clientId: "524738063553-o9ij9j358m9odfs30kivd3bmecso1kvi.apps.googleusercontent.com"
            expoClientId: '524738063553-o9ij9j358m9odfs30kivd3bmecso1kvi.apps.googleusercontent.com',
            webClientId: '524738063553-o9ij9j358m9odfs30kivd3bmecso1kvi.apps.googleusercontent.com',
            androidClientId: '524738063553-inqd7vg0cgfjrmlqpi777uocvjvoegnl.apps.googleusercontent.com',
            iosClientId: '524738063553-7a5ri1erg2jgc74u50oju3i1ksffdft4.apps.googleusercontent.com',
            clientId: '524738063553-o9ij9j358m9odfs30kivd3bmecso1kvi.apps.googleusercontent.com'
        },
    );
    // If a response is received using the new API, set the response state.
    React.useEffect(() => setResponse(NEW_response), [NEW_response]);

    // Using the old API because it is the only way I can make it work in standalone apps.
    const OLD_promptAsync = async () => { 
        await GoogleSignIn.initAsync({
            clientId: '524738063553-7a5ri1erg2jgc74u50oju3i1ksffdft4.apps.googleusercontent.com',
        });
        await GoogleSignIn.askForPlayServicesAsync();
        const response = await GoogleSignIn.signInAsync();
        await GoogleSignIn.signOutAsync()
        setResponse(response);
        
    }

    const promptAsync = __DEV__ ? NEW_promptAsync : NEW_promptAsync;

    const appleLogin = () => {
        const nonce = Math.random().toString(36).substring(2, 10);
    
        return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce)
            .then((hashedNonce) =>
                AppleAuthentication.signInAsync({
                    requestedScopes: [
                        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                        AppleAuthentication.AppleAuthenticationScope.EMAIL
                    ],
                    nonce: hashedNonce
                })
            )
            .then((appleCredential) => {
                const { identityToken } = appleCredential;
                const provider = new OAuthProvider('apple.com');
                const credential = provider.credential({
                    idToken: identityToken,
                    rawNonce: nonce
                });

                return credentialLogin(Firebase.auth, credential)
                // Successful sign in is handled by firebase.auth().onAuthStateChanged
            })
            .catch((error) => {
                // ...
            });
    };

    const credentialLogin = (auth, credential) => {
        signInWithCredential(auth, credential).then().catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
            console.log(errorMessage)
          });;;
    }
    
    React.useEffect(() => {
        if (response?.type === 'success') {
          var id_token, access_token;
          if (__DEV__  || true){
            // With new method (NOT WORKING ON STANDALONE APP)
            var { id_token, access_token } = response.params;
          } else {
            // With old deprecated login
            var { idToken: id_token } = response.user.auth;
          }
          
          const auth = Firebase.auth;
          const credential = GoogleAuthProvider.credential(id_token, access_token);
          credentialLogin(auth, credential)
        }
    }, [response]);

    return (
      [
      <TouchableOpacity key="email"
        onPress={() => {props.click("email")}}
        style={{...styles.button, ...styles.mailButton}}
        activeOpacity={0.6}
      >
        {props.isLogin
          ? <ActivityIndicator size="large" style={styles.spinner} color='white' />
          : <Text style={{...styles.text, ...styles.mailText}}>{translate("auth.log in").toUpperCase()}</Text>}
      </TouchableOpacity>,
      <TouchableOpacity key="google"
      onPress={() => {promptAsync()}}
      style={{...styles.button, ...styles.googleButton}}
      activeOpacity={0.6}
    >
      {props.isLogin
        ? <ActivityIndicator size="large" style={styles.spinner} color='white' />
        : [<Image key="googleIcon" style={styles.googleLogo} source={require("../../../assets/images/googleIcon.png")}/>,
          <Text key="googleText" style={{...styles.text, ...styles.googleText}}>{translate("auth.sign in with google")}</Text>]}
    </TouchableOpacity>,
    <AppleAuthentication.AppleAuthenticationButton
    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
    cornerRadius={5}
    style={styles.appleButton}
    onPress={appleLogin}
  />    
]

    );
}

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

  appleButton: {
    width: '85%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: w(5),
    marginTop: h(2),
    elevation: 3,
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
