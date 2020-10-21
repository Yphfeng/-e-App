'use strict';
import * as types from '../constants/device/bleTypes';

import { Platform, } from "react-native"

/**
 * [蓝牙的初始状态，0蓝牙未开启， 1设备未绑定， 2设备未连接 ，3设备已连接]
 * @type {Object}
 */
const initialState = {
	bleBoardCastStatus: 0,
	bleBoardCastInfo: "", //蓝牙广播时间
	unBindDataStatus: 0, //解绑时数据上传 0未上传初始状态，1解绑时上传状态，2上传成功状态，3上传失败状态,4空中升级时上传，5与h5交互时上传
	dataProgress: 0,
	androidVersion: Platform.Version,
	isConnectORsearch: 0, //判断是搜索还是连接
	bleStatus: 2, //蓝牙状态，1已打开，0，已关闭，2初始关闭状态
	searchStatus: 0, //搜索状态
	connectStatus: 0, //连接状态
	connectedDevice: null, //已连接的设备
	device_sn: '',
	deviceId: '',
	device_name: '',
	deviceType: 0,//1租赁，0普通
	courseListArray: [],//租赁疗程
	userDeviceList: [],//用户绑定的设备
	userSearchedList: [], //用户搜索到的设备
	deviceBindStatus: 0, //0未绑定 1已绑定
	bindMsg: '',
	bindCode: 0, //绑定错误码
	deviceMsg: '',
	eq: 0,
	LASER_POWER: {},
	manuallyLaserState: false,
	manuallyHrState: false,
	AutoHrState: false,
	realTimeHrStatus: false,
	heartRateManualValue: 0,
	connectLoadingStatus: 0, //0连接中，1同步指令成功，2数据上传成功,3设备应用初始化成功，4连接成功。5.设备操作中
	firmWare: {},//固件版本信息
	airUpdataStatus: 0,
	airUpdataMsg: '',
	progressBarValue: 0,//进度条的值
	deviceInformation: {},//设备信息
	updataErr: 0, //上传错误信息状态
	sacnTimeOut: 0, //扫描超时处理(0成功，1超时)
	instruction: 0, //配置超时处理(0成功，1超时)
	untied: 0, //数据上传过程中接触绑定提示(0失败，1成功，2上传中)
	sportStatus: 0,
	heartStatus: 0,
	laserStatus: 0,
	autoUpdataStatus: 0, //0为自动上传，1为手动上传
	pointerStatus: 0, //首页指针功能的显示隐藏
	isupGrade: false, //App是否热更新
	upProgress: {}, //热更新进度对象
	upGrade_error: 0,
	upGrade_band: {}, //大版本更新对象
	instructionMsg: '',
	deviceArray: [], //设备型号数组
	deviceTreatmentParams: null,
	laserTreatmentStatus: null,
	bleAction: '', //蓝牙功能
};

export default function ble(state = initialState, action)
{
	switch (action.type)
	{
	case "GET_TREATMENT_STATUS":
		return {
			...state,
			laserTreatmentStatus: action.data,
		}
	case types.GET_TREATMENT_PARAMS:
		return {
			...state,
			deviceTreatmentParams: action.data,
		}
	case 'IS_CONNECT_OR_SEARCH':
		return {
			...state,
			isConnectORsearch: action.status,
		}
	case 'GET_BLE_STATUS_RESULT':
		return {
			...state,
			bleStatus: action.status,
		}
	case types.GET_CONNECT_STATUS:
		return {
			...state,
			bleStatus: action.status,
		};
	case types.CONNECT_SUCCESS:
		return {
			...state,
			connectStatus: action.status,
			connectedDevice: action.connectedDevice ? action.connectedDevice : null,
			eq: action.eq,
			pointerStatus: action.pointShow,
		}
	case "DISCONNECT":
		return {
			...state,
			connectStatus: 0,
			connectedDevice: null,
			eq: 0,
			pointerStatus: 0,
		}
	case types.LASER_MANUALLY_PARAMETERS:
		return {
			...state,
			LASER_POWER: action.dic,
		}
	case types.MANUALLY_LASER_STATE:
		return {
			...state,
			manuallyLaserState: action.status,
		}
	case types.MANUALLY_HR_STATE:
		return {
			...state,
			manuallyHrState: action.status,
		}
	case types.AUTO_HR_STATE:
		return {
			...state,
			AutoHrState: action.status,
		}
	case types.LOADING_STATUS:
		return {
			...state,
			connectLoadingStatus: action.status,
		}
	case types.GET_DEVICE_TYPE_SUCCESS:
		return {
			...state,
			deviceType: action.status,
			courseListArray: action.courseListArray,
		}
	case types.GET_DEVICE_TYPE_FAIL:
		return {
			...state,
			deviceType: action.status,
			courseListArray: action.courseListArray,
		}
	case types.DISCONNECT_DEVICE:
		return {
			...state,
			connectStatus: 0,
			deviceMsg: action.status ? "断开成功" : "断开失败",

		}

	case types.SET_USER_COURSE:
		return {
			...state,
			deviceMsg: action.msg,
		}
	case types.IS_MANUALLY_LASER_STATE:
		return {
			...state,
			manuallyLaserState: action.isOpen,
			deviceMsg: action.isOpen ? "开启激光强度和时长成功" : "关闭激光强度和时长成功",
			connectLoadingStatus: 4,
		}
	case types.IS_MANUALLY_HR_STATE:
		return {
			...state,
			manuallyHrState: action.isOpen,
			deviceMsg: action.msg,
			connectLoadingStatus: 4,
		}
	case types.IS_AUTO_HR_STATE:
		return {
			...state,
			AutoHrState: action.isOpen,
			deviceMsg: action.msg,
			connectLoadingStatus: 4,
		}
	case types.IS_REALTIME_HR_STATE:
		return {
			...state,
			heartRateManualValue: action.value,
			realTimeHrStatus: action.isOpen,
		}
	case types.GET_FIRMWARE_VERSION:
		return {
			...state,
			firmWare: action.data,
		}
	case types.AIR_UPDATING:
		return {
			...state,
			airUpdataStatus: action.status,
			connectStatus: 0,
			airUpdataMsg: action.msg,
		}
	case types.GET_PROGRESSBAR_VALUE:
		return {
			...state,
			progressBarValue: action.value,
		}
	case types.CONNECTION_SUCCEEDED:
		return {
			...state,
			connectLoadingStatus: action.connectLoadingStatus,
		}
	case types.DEVICE_INFORMATION:
		return {
			...state,
			deviceInformation: action.data,
		}
	case types.UPDATA_ERR:
		return {
			...state,
			updataErr: action.data,
			instructionMsg: action.msg,
		}
	case types.SCAN_TIME_OUT:
		return {
			...state,
			sacnTimeOut: action.status,
		}
	case types.INSTRUCTION_TIME_OUT:
		return {
			...state,
			instruction: action.status,
			instructionMsg: action.s,
		}
	case types.UNTIED_PROMPT:
		return {
			...state,
			untied: action.status,

		}
	case types.UPDATA_SPORTS:
		return {
			...state,
			sportStatus: action.status,
		}
	case types.UPDATA_HEART:
		return {
			...state,
			heartStatus: action.status,
		}
	case types.UPDATA_LASER:
		return {
			...state,
			laserStatus: action.status,
		}
	case types.UPDATA_DEVICE_NAME:
		return {
			...state,
			device_name: action.name,
		}
	case types.POINTER_SHOW:
		return {
			...state,
			pointerStatus: action.data,
		}
	case types.UPGRADE:
		return {
			...state,
			isupGrade: action.status,
		}
	case types.UPGRADE_PROGRESS:
		return {
			...state,
			upProgress: action.data,
		}
	case types.UPGRADE_ERROR:
		return {
			...state,
			upGrade_error: action.data,
		}
	case types.UPGRADEBAND:
		return {
			...state,
			upGrade_band: action.data,
		}
	case types.SEARCHED_DEVICES:
		return {
			...state,
			userSearchedList: action.device,
		}
	case types.DEVICE_ARRAY:
		return {
			...state,
			deviceArray: action.data,
		}
	case types.DATA_PROGRESS:
		return {
			...state,
			dataProgress: action.status,
		}
	case types.UNBIND_DATA_STATUS:
		return {
			...state,
			unBindDataStatus: action.status,
		}
	case types.SET_BOARDCAST_INFO:
		return {
			...state,
			deviceMsg: action.msg,
			bleBoardCastStatus: action.status,

		}
	case types.BOARDCAST_INFO:
		return {
			...state,
			bleBoardCastInfo: action.v,
			bleBoardCastStatus: action.status,
			deviceMsg: action.msg,
		}
	case 'BLE_ACTION':
		return {
			...state,
			bleAction: action.key,
		}
	default:
		return state;
	}
}

