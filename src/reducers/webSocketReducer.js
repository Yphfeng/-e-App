import * as types from '../constants/webSocketTypes';

const initwsState ={
	status: '未连接',
	isSuccess: false,
	ws: null,
	socketMsg: null,
	sendMsg: '',
	remoteLoadingStatus: false,
	remoteLoadingText: '',
	guardian: '',
}

export default function webSocket(state=initwsState, action) 
{
	switch (action.type)
	{
	case types.CONNECTSUCCESS:
		return { 
			...state,
			status: "连接成功",
			isSuccess: true,
		}
	case types.CONNECTFALL:
		return {
			...state,
			status: "未连接",
			socketMsg: null,
			isSuccess: false,
		}
	case types.RETURNMSG:
		return {
			...state,
			socketMsg: action.msgstr,
		}
	case types.SEND:
		return {
			...state,
			sendMsg: action.msg,
		}
	case types.REMOTE_LOADING:
		return {
			...state,
			remoteLoadingStatus: action.status,
			remoteLoadingText: action.text,
		}
	case 'BE_GUARDIAN':
		return {
			...state,
			guardian: action.guardian,
		}
	default:
		return state;
	}
}