import {put, call, delay, take, select, takeEvery, race, } from 'redux-saga/effects';

export function* addGuardian(action)
{
    console.log(action, '监护人12312')
	yield put({type: 'ADD_GUARDIAN_RESULT', user: action.user, })
}