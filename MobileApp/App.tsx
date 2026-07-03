import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import Routes from './src/routes'
import { persistedStore, store } from './src/shared/store/configureStore'


function App(): React.JSX.Element {
  // useEffect(() => {
  //   requestFCMUserPermission();
  // }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Provider store={store}>
          <PersistGate persistor={persistedStore}>
            <Routes />
          </PersistGate>
        </Provider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}

export default App
