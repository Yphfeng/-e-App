'use strict';
import {createStore, applyMiddleware, compose} from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from './index'; //
import {persistStore, } from 'redux-persist';
import createSagaMiddleware from 'redux-saga'
import {initSagas, } from '../sagas/initSaga';

export default function configureStore(initialState)
{
	const sagaMiddleware = createSagaMiddleware();
	// const createStoreWithMiddleware = applyMiddleware(thunkMiddleware, sagaMiddleware)(createStore);
	// const store = createStoreWithMiddleware(rootReducer, initialState)
	const store = createStore(
		rootReducer,
		compose(
			applyMiddleware(sagaMiddleware, thunkMiddleware )
		),
	);
	const persistor = persistStore(store);
	initSagas(sagaMiddleware);
	return {store, persistor, };
}
