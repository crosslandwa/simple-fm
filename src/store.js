import { createStore, applyMiddleware, compose } from 'redux'
import rootReducer from './reducers'
import persistState from 'redux-localstorage'
import { middleware as melodyMiddleware } from './melody/interactions'
import { qwertyFMMiddleware } from './qwertyFM/middleware'

const naturalEnhancer = (createStore) => (...args) => createStore(...args)

const localStorageAvailable = !!(window && window.localStorage)
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

function createAppStore () {
  const middlewares = [melodyMiddleware, qwertyFMMiddleware]
  return createStore(
    rootReducer,
    composeEnhancers(
      applyMiddleware(...middlewares),
      localStorageAvailable ? persistState() : naturalEnhancer
    )
  )
}

export default createAppStore
