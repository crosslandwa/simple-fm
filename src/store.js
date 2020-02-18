import { createStore, applyMiddleware, compose } from 'redux'
import rootReducer from './reducers'
import persistState from 'redux-localstorage'
import { middleware as autoplayerMiddleware } from './autoplayer/interactions'
import { qwertyFMMiddleware } from './qwertyFM/middleware'
import { middleware as pushMiddleware } from './push-integration'

const naturalEnhancer = (createStore) => (...args) => createStore(...args)

const localStorageAvailable = !!(window && window.localStorage)
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

function createAppStore () {
  const middlewares = [pushMiddleware, autoplayerMiddleware, qwertyFMMiddleware]
  return createStore(
    rootReducer,
    composeEnhancers(
      applyMiddleware(...middlewares),
      localStorageAvailable ? persistState() : naturalEnhancer
    )
  )
}

export default createAppStore
