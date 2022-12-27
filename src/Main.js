import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import React, { useState, useEffect, useCallback } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

import AppNavigator from './navigation/AppNavigator';
import { NativeBaseProvider} from 'native-base';

//REDUX STUFF
import store from './redux/store'
import { Provider } from 'react-redux'

//Crash notification
import * as Sentry from 'sentry-expo';
import Constants from 'expo-constants';

import { SafeAreaView } from 'react-native';
import TranslationManager from './assets/translations/TranslationManager';
// if (Platform.OS === 'android') {
//   SafeAreaView.setStatusBarHeight(0);
// }

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: 'https://859a3f17d2964dd6b8c9dd3e6bcd2624@sentry.io/1886709',
  enableInExpoDevelopment: false,
  debug: false
});

//Sentry.setRelease(Constants.manifest.revisionId);

export default function Main(props) {

  const [isLoadingComplete, setLoadingComplete] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await loadResourcesAsync()
      } catch (e) {
        handleLoadingError(e);
      } finally {
        // Tell the application to render
        handleFinishLoading(setLoadingComplete);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (isLoadingComplete) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setLoadingComplete`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [isLoadingComplete]);

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <Provider store={store}>
        <NativeBaseProvider>
          <TranslationManager/>
          <View style={styles.container} onLayout={onLayoutRootView} >
            {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
              <AppNavigator />
          </View>
        </NativeBaseProvider>
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
      //Roboto: require("native-base/Fonts/Roboto.ttf"),
      //Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
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