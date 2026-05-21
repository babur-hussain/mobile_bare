import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import {store} from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {LogBox} from 'react-native';

// Suppress non-critical warnings in production
LogBox.ignoreLogs(['new NativeEventEmitter']);

GoogleSignin.configure({
  webClientId:
    '208100625363-gq9qa2rgvnphdq4cls7ecpq7cs1dl371.apps.googleusercontent.com',
  iosClientId:
    '208100625363-5gb0dd86nvgkmbpifqe41142rq7l2h6b.apps.googleusercontent.com',
});

// Global unhandled promise rejection handler — prevents silent crashes in production
const defaultHandler =
  (global as any).ErrorUtils?.getGlobalHandler?.() || (() => {});

(global as any).ErrorUtils?.setGlobalHandler?.((error: any, isFatal: boolean) => {
  // Log or report to crash analytics (e.g. Firebase Crashlytics)
  console.error('[GlobalError]', isFatal ? 'FATAL' : 'non-fatal', error);
  defaultHandler(error, isFatal);
});

function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <Provider store={store}>
          <RootNavigator />
        </Provider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default App;
