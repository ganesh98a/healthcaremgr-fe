import React from 'react';
import ReactDOM from 'react-dom';
import dotenv from 'dotenv';

import './components/admin/scss/components/admin/salesforce/lightning/salesforce-lightning-design-system.scss'

import './index.css';
import App from './App';
import { unregister } from './registerServiceWorker';
import { Provider } from 'react-redux'
import rootReducer from './reducers';



import { createStore, applyMiddleware, compose } from 'redux'


import thunkMiddleware from 'redux-thunk'
import callAPIMiddleware from './middlewares/callAPIMiddleware';
dotenv.config()

//const store = createStore(rootReducer)

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
    rootReducer,
    composeEnhancer(applyMiddleware(thunkMiddleware, callAPIMiddleware)),
);

ReactDOM.render(<Provider store={store}>
    <App />
</Provider>, document.getElementById('root'));

unregister();
