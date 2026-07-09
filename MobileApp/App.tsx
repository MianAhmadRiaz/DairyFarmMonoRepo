import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import React, { useEffect, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import Routes from './src/routes'
import { persistedStore, store } from './src/shared/store/configureStore'
import { initI18n } from './src/shared/i18n'


function App(): React.JSX.Element {
  // Gate rendering until i18n has resolved the initial language + direction,
  // so the first paint is already in the correct locale/layout direction.
  const [i18nReady, setI18nReady] = useState(false)

  useEffect(() => {
    initI18n().finally(() => setI18nReady(true))
  }, [])

  if (!i18nReady) {
    return <></>
  }

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
