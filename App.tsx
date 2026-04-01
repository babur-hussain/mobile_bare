import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import {store} from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId:
    '208100625363-gq9qa2rgvnphdq4cls7ecpq7cs1dl371.apps.googleusercontent.com', // Web Client ID from google-services.json
  iosClientId:
    '208100625363-5gb0dd86nvgkmbpifqe41142rq7l2h6b.apps.googleusercontent.com', // Extracted from iOS GoogleService-Info.plist
});

function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <RootNavigator />
      </Provider>
    </SafeAreaProvider>
  );
}

export default App;
