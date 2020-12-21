import { AppLoading } from 'expo';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import React, { useState } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AppNavigator from './navigation/AppNavigator';
import { Root } from 'native-base';

//REDUX STUFF
import store from './redux/store'
import { Provider } from 'react-redux'

//Crash notification
import * as Sentry from 'sentry-expo';
import Constants from 'expo-constants';

import { SafeAreaView } from 'react-navigation';
import TranslationManager from './assets/translations/TranslationManager';
if (Platform.OS === 'android') {
  SafeAreaView.setStatusBarHeight(0);
}

Sentry.init({
  dsn: 'https://859a3f17d2964dd6b8c9dd3e6bcd2624@sentry.io/1886709',
  enableInExpoDevelopment: false,
  debug: true
});

Sentry.setRelease(Constants.manifest.revisionId);

export default function App(props) {

  const [isLoadingComplete, setLoadingComplete] = useState(false);

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    return (
      <AppLoading
        startAsync={loadResourcesAsync}
        onError={handleLoadingError}
        onFinish={() => handleFinishLoading(setLoadingComplete)}
      />
    );
  } else {
    return (
      <Provider store={store}>
        <Root>
          <TranslationManager/>
          <View style={styles.container}>
            {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
              <AppNavigator />
          </View>
        </Root>
      </Provider>
    );
  }
}

async function loadResourcesAsync() {
  await Promise.all([
    Asset.loadAsync([
        require('./assets/images/blank-profile.png'),
        require('./assets/images/icon.png')
    ]),
    Font.loadAsync({
      // This is the font that we are using for our tab bar
      ...Ionicons.font,
      // We include SpaceMono because we use it in HomeScreen.js. Feel free to
      // remove this if you are not using it in your app
      'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      'lucidaGrandeBold': require('./assets/fonts/LucidaGrandeBold.ttf'),
      'lucidaGrande': require('./assets/fonts/LucidaGrande.ttf'),
      'roboto': require('./assets/fonts/Roboto-Bold.ttf'),
      'bold': require('./assets/fonts/Roboto-Bold.ttf'),
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
    })
  ]);
}

function handleLoadingError(error) {
  // In this case, you might want to report the error to your error reporting
  // service, for example Sentry
  console.warn(error);
}

function handleFinishLoading(setLoadingComplete) {
  setLoadingComplete(true);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});