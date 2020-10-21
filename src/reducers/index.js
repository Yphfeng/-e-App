'use strict';

import {combineReducers, } from 'redux';
import loginIn from './loginReducer';
import reg from './regReducer';
import ble from './bleReducer';
import user from './userReducer';
import guardian from './guardianReducer';
import community from './communityReducer';
import webSocketReducer from './webSocketReducer';
import courseDetail from './page/courseDetailReducer';
import courseList from './page/courseListReducer';
import course from './courseReducer';
import {persistReducer, } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import AsyncStorage from '@react-native-community/async-storage';
const persistConfig = {
	key: 'loginIn',
	storage: AsyncStorage,
	stateReconciler: autoMergeLevel2,
}

const rootReducer = combineReducers({
	loginIn: persistReducer(persistConfig, loginIn), // 登录类型状态
	reg: reg, // 注册类型状态
	ble: ble,
	user: user,
	courseDetail: courseDetail,
	courseList: courseList,
	course: course,
	community: community,
	webSocketReducer: webSocketReducer,
	guardian: guardian,
});

export default rootReducer;
