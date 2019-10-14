import React from 'react';
import {Platform, StatusBar, StyleSheet, View} from 'react-native';
import {AppLoading, Asset, Font, Icon} from 'expo';
import AppNavigator from './navigation/AppNavigator';

export default class App extends React.Component {
    state = {
        isLoadingComplete: false
    };

    render() {
        if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
            return (
                <AppLoading
                    startAsync={this._loadResourcesAsync}
                    onError={this._handleLoadingError}
                    onFinish={this._handleFinishLoading}
                />
            );
        } else {
            return (
                <View style={styles.container}>
                    {Platform.OS === 'ios' && <StatusBar barStyle="default"/>}
                    <AppNavigator/>
                </View>
            );
        }
    }

    _loadResourcesAsync = async () => {
        return Promise.all([

            Asset.loadAsync([
                require('./assets/images/bg.jpg'),
                require('./assets/images/blank-profile.png'),
                require('./assets/images/loginBG.jpg'),
                require('./assets/images/loginBG2.jpg')
            ]),
            Font.loadAsync({
                // This is the font that we are using for our tab bar
                //...Icon.Ionicons.font,
                // We include SpaceMono because we use it in HomeScreen.js. Feel free
                // to remove this if you are not using it in your app
                'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
                'lucidaGrandeBold': require('./assets/fonts/LucidaGrandeBold.ttf'),
                'lucidaGrande': require('./assets/fonts/LucidaGrande.ttf'),
                'roboto': require('./assets/fonts/Roboto-Bold.ttf'),
                'bold': require('./assets/fonts/Roboto-Bold.ttf')
            })
        ]);
    };

    _handleLoadingError = error => {
        // In this case, you might want to report the error to your error
        // reporting service, for example Sentry
        console.warn(error);
    };

    _handleFinishLoading = () => {
        this.setState({isLoadingComplete: true});
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#5e5e5e',
        alignItems: 'center',
        justifyContent: 'center'
    }
});