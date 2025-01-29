import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import store, { persistor } from './redux/store.js'
import { Provider } from 'react-redux'
import { PersistGate } from "redux-persist/integration/react";

if (process.env.NODE_ENV === "production" && window.__REDUX_DEVTOOLS_EXTENSION__) {
  console.warn("Redux DevTools should not be enabled in production!");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <BrowserRouter basename="/">
    <AuthProvider>
    <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
    <App />
    </PersistGate>
    </AuthProvider>
    </BrowserRouter>
    </Provider>
  </StrictMode>,
)
