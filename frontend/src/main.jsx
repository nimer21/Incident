import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import store from './redux/store.js'
import { Provider } from 'react-redux'

if (process.env.NODE_ENV === "production" && window.__REDUX_DEVTOOLS_EXTENSION__) {
  console.warn("Redux DevTools should not be enabled in production!");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <BrowserRouter basename="/">
    <AuthProvider>
    <App />
    </AuthProvider>
    </BrowserRouter>
    </Provider>
  </StrictMode>,
)
