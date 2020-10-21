import * as bleSaga from './bleSaga';
import * as loginSaga from './loginSaga';
import * as appSaga from './appSaga';
import * as courseSaga from './courseSaga';
import * as deviceSaga from './deviceSaga';
import {takeLatest, all, takeEvery, take, } from 'redux-saga/effects';
import * as guardianSaga from './guardianSaga';
export default function* rootSaga() 
{
	yield all([
		//启动页面
		takeLatest('FIRST_LOADING', loginSaga.startUp),
		takeLatest('GET_LOGIN', loginSaga.loginIn),     //手机登录
		takeEvery('GET_WX_LOGIN', loginSaga.loginWXIn), //微信登录
		takeEvery('BIND_PHONE', loginSaga.bindPhone), //绑定手机号
		takeLatest('LOGIN_OUT', loginSaga.loginOut),
		//引导图相关
		takeEvery('BG_SEARCH', bleSaga.bgSearchDevices), //引导图搜素设备
		//进入首页初始化
		takeEvery('FIRST_HOME', appSaga.appLoad), //进入首页初始化
		takeEvery('START_SEARCHING', bleSaga.startSearchDevices), //蓝牙搜素设备
		takeEvery('START_CONNECT_DEVICE', bleSaga.startConnectDevice), //绑定一个设备后自动连接
		takeLatest('START_SEVERAL_CONNECT_DEVICE', bleSaga.startSeveralConnectDevice), //绑定多个设备连接
		takeLatest('IS_BIND', bleSaga.isBind), //判断是否绑定
		takeLatest('CONNECT_BLE', bleSaga.connectBle), //连接设备
		takeLatest('NO_CONNECT_BLE', bleSaga.noConnectBle), //没有绑定设备时连接
		takeLatest('CONNECT_SECOND_BLE', bleSaga.connectSecondBle), //选择设备连接
		takeLatest('DISCONNECT_DEVICE', bleSaga.disConnectBle), //断开设备
		takeLatest('UPDATA', bleSaga.upData), //上传数据
		takeEvery('GET_BLE_STATUS', bleSaga.getBleStatus), //蓝牙状态变化
		takeLatest('MANY_CONNECT_OR_SEARCH_RESULT', bleSaga.connectForManyDevices), //多设备连接
		
		//指令的返回操作
		takeEvery('CONNECT_CMD', bleSaga.connectCmd),
		//蓝牙搜索
		takeEvery('BIND_DEVICE', bleSaga.bindDevice), //绑定设备

		//疗程相关操作
		takeEvery('GET_USER_COURSE_LIST', courseSaga.getUserCourseList), //获取用户疗程
		takeEvery('ACTIVE_COURSE', courseSaga.activeCourse),  //激活
		takeLatest('USE_COURSE', courseSaga.useCourse),    //使用
		takeLatest('SWITCH_COURSE', courseSaga.switchCourse),  //切换
		takeLatest('STOP_COURSE', courseSaga.stopCourse),  //暂停
		takeLatest('MY_COURSE', courseSaga.returnMyCourse), //我的疗程回调

		//健康服务
		takeLatest('WRITE_COURSE', courseSaga.writeCourse), //写入疗程
		takeLatest('GET_ARTICAL_COURSE_LIST', courseSaga.getUserArticalCourseList), //获取已购疗程
		takeLatest('BUY_COURSE', courseSaga.returnCourse), //购买疗程的蓝牙回调

		//设备绑定解绑相关
		takeLatest('GET_USER_DEVICELIST', deviceSaga.getUserDeviceList),
		takeLatest('DEVICE_BIND', deviceSaga.bindCMD),  //设备cmd操作
		takeLatest('CONFIRM_UNBIND', deviceSaga.confirmUnbind), //解绑

		//空中升级相关
		takeLatest('UPDATA_AIR', bleSaga.upDataAir),
		takeLatest('AIR_CALLBACK', bleSaga.airCallback),
		takeEvery('DFU_PROGRESS', bleSaga.getDfuProgress),

		//设备应用相关
		takeLatest('DEVICE_APPLICATION', bleSaga.dataFromApplication), //设备应用
		takeLatest('GET_APPLICATION_FIRST', bleSaga.getApplicationFirst), //初始化应用状态
		takeLatest('IS_OPEN_AUTOHR', bleSaga.isOpenAutoHr),
		takeLatest('OPEN_MANULLY_HR', bleSaga.isOpenManuallyHr),
		takeLatest('OPEN_MANULLY_LASER', bleSaga.isOpenManuallyLaser),
		takeLatest('SET_LASER_MANUALLY_PARAMETERS', bleSaga.setLaserManuallyParameters), //设置手动激光参数
		takeLatest('GET_MANUALLY_LASER_STATE', bleSaga.getManuallyLaserState), //获取手动激光状态

		//数据监测
		takeLatest('GET_DEVICE_DATA', bleSaga.getDeviceData),
		takeLatest('DEVICE_DATA_OBSERVE', bleSaga.returnDataObserve), //数据监测回调

		//监护人相关
		takeEvery('ADD_GUARDIAN', guardianSaga.addGuardian), //监护人信息保存

		//消息相关
		takeEvery('GET_USER_MSG_COUNT', appSaga.getUserMsgCount),
		
	]);
}
