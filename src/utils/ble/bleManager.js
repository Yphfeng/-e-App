
import BleCenter from './center';
import QRCode from "./qrCode";
import * as cmd from './cmd';
import transceiver from './transceiver';
import { Platform, } from 'react-native';
import * as deviceService from "../network/deviceService";
import { NordicDFU, DFUEmitter, } from "react-native-nordic-dfu";
export default class BleManager
{ // 单例

	static getInstance()
	{
		if (!BleManager.instance)
		{
			BleManager.instance = new BleManager();
		}
		return BleManager.instance;
	}
	constructor()
	{
		this.deviceMap = new Map(); // 搜索到设备的缓存
		this.qrCode = new QRCode();
		this.bleCenter = BleCenter.getInstance();
		this.bleId = "";
		this.transceiver = new transceiver();
		this.operateType = 1;
		this.DFUTYPE = 0;

		this.eq = new Object();
		this.sync = new Object();
		this.device_sn = "";
		this.laserManuallyParameters = new Object();
		this.deviceInfo = new Object();
		this.laserManuallyPaymentDuration = new Object();
		this.deviceInformation = new Object()
		this.setLaserManuallyParametersValue = new Object()
		this.laserTreatmentParameters = new Object()
		this.manuallyHRState = new Object();
		this.autoHRState = new Object();
		this.manuallyLaserState = new Object();
		this.getDeviceTime = new Object();
		this.isOpenLaser = new Object();
		this.broadcastDuration = new Object()
		this.laserData = [];
		this.heartData = [];
		this.sportsData = [];
		this.laserType = 0;
		this.restoreFactoryValue = new Object();
		this.setPointerValue = new Object();
		this.startDFUValue = new Object();
		this.getTreatmentStatusData = new Object();
		this.isOpenAutoHrActionStatus = new Object();
		this.isOpenHrActionStatus = new Object();
		this.realtimeDataStatus = new Object();
		this.realtimeIsOpen = '';
		this.getRealtimeHeartRateBloodPressure = new Object();
		this.setBroadcastDurationData = new Object();
		this.set_bloodPressureCalibrationData = new Object();

	}

	/**************************************************************************************** */
	/***************************蓝牙中心控制                 ********************************** */
	/**************************************************************************************** */
	/**
	 * 初始化蓝牙设备
	 */
	openBLE()
	{
		this.bleCenter.start();  //蓝牙初始化
	}

	/**
	 * 检查蓝牙状态
	 */
	checkState() {
		this.bleCenter.checkState();
	}

	/**
	 * 关闭蓝牙功能
	 */
	closeBLE()
	{
		console.log('关闭蓝牙连接')
		this.updateStateListener.remove();
		this.stopScanListener.remove();
		this.discoverPeripheralListener.remove();
		this.connectPeripheralListener.remove();
		this.disconnectPeripheralListener.remove();
		this.updateValueListener.remove();
		console.log(this.bleCenter.isConnecting)
		if (this.bleCenter.isConnecting)
		{
			this.bleCenter.disconnect();  //退出时断开蓝牙连接
		}
	}
	/**
	 * 扫描设备
	 * s: 扫描时间（秒）
	 */
	async scan(s)
	{
		try
		{
			if (this.scaning)
			{  //当前正在扫描中
				var aa = await this.bleCenter.stopScan();
				this.scaning = false;
				this.deviceMap = new Map();
			}
			console.log('扫描中1')
			if (this.bleCenter.bluetoothState == 'on')
			{
				const result = await this.bleCenter.scan(s);
			}

		}
		catch (error)
		{
			this.scaning = false;
			return error
		}
	}

	/**
	 * 打开蓝牙
	 */
	enableBluetooth()
	{
		this.bleCenter.enableBluetooth();
	}

	getDevice(s)
	{
		const _this = this;
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve(_this.deviceMap)
			}, s*1000);
		} )
	}

	/**
	 * 停止扫描
	 */
	async stopScan()
	{
		try
		{
			var result = await this.bleCenter.stopScan();
			this.scaning = false;
			return result;
		}
		catch (error)
		{
			return error
		}
	}

	/**
	 *
	 * @param {连接设备的id} id
	 * @param {是否带上疗程连接}isCourse
	 */
	async connectPeripheral(id, device_sn, isCourse=false, isOperation=false) {
		try {
			if (this.bleCenter.isConnecting) {
				return;
			}
			if (this.scaning) {
				var stopScan = await this.bleCenter.stopScan();
				this.scaning = false;
			}
			else {
				this.scaning = true;
				const scanResult = await this.scan(5);
				var device = scanResult.find((item, index) => {
					return item.id == id
				})
				console.log(device, '搜索到的设备')
				if(!device || device.length < 1) {
					return {msg: '无法搜索到此设备，请激活！'}
				}
			}
			var result = await this.bleCenter.connect(id);

			var notify = await this.bleCenter.startNotification();
			var DFUnotify = await this.bleCenter.startDFUNotification();
			if(!result || !result.id)
			{
				var disResult = await this.bleCenter.disconnect();
				return result
			}
			if(!isCourse) {
				return result;
			}
			if(!isOperation) {
				return result
			} else {
				this.device_sn = device_sn;
				var syncTime = await this.syncTime();
				var sync = await this.getValue("sync", 1000);

				var getEQ = await this.getEQ();

				const laserManuallyParameters = await this.getLaserManuallyParameters()
				const setLaserManuallyParameters = await this.setLaserManuallyParameters(2,4)
				const deviceInfo = await this.getDeviceInfo();

				// const laserManuallyPaymentDuration = await this.setLaserManuallyPaymentDuration(this.deviceInformation.eb);
				const laserManuallyPaymentDuration = await this.setLaserManuallyPaymentDuration("999");

				const manuallyHRState = await this.getManuallyHRState();
				const autoHRState = await this.getAutoHRState()
				const manuallyLaserState = await this.getManuallyLaserState()
				var returnAllDatas = {
					state: "连接成功",
					syncTime: this.sync,
					eq: this.eq,
					laserManuallyParameters: this.laserManuallyParameters,
					deviceInfo: this.deviceInfo,
					laserManuallyPaymentDuration: this.laserManuallyPaymentDuration,
					setLaserManuallyParameters: this.setLaserManuallyParametersValue,
					manuallyHRState: this.manuallyHRState,
					autoHRState: this.autoHRState,
					manuallyLaserState: this.manuallyLaserState,
				}
				console.log(returnAllDatas,"连接返回的数据")
				// this.operateType = 0;
				return returnAllDatas

				// var deviceInformation = this.deviceInformation;
				// if (deviceInformation.type == 0) {
				//     console.debug('第一次连接没有疗程参数');
				//     return
				// }
				// var parametersArray = [];
				// deviceInformation.parameter_list.forEach(v => {
				//     let item = {
				//         power: parseInt(v.power_level),
				//         duration: parseInt(v.start_duration),
				//         startHour: parseInt(v.start_time.split(":")[0]),
				//         startMinute: parseInt(v.start_time.split(":")[1]),
				//     }
				//     parametersArray.push(item);
				// })

				// let courseNumber = parseInt(deviceInformation.course_data.course_type_sn);
				// let coursePeriodic = parseInt(deviceInformation.course_data.course_cycle_work_days);
				// let courseGap = parseInt(deviceInformation.course_data.course_cycle_rest_days);
				// let courseEndDate = qbDate.getNewDay(deviceInformation.remaining_days).split('-');
				// const dic = {
				//     index: courseNumber,
				//     periodic: coursePeriodic,
				//     gap: courseGap,
				//     endDate: courseEndDate,
				//     parameters: parametersArray
				// }
				// const laserRegimenParameters = await this.setLaserTreatmentParameters(dic);
				// const setlaserTreatmentStatus = await this.setlaserTreatmentStatus(1,1);
				// const realtimeIsOpen = await this.isOpenRealtimeData(isOpen);
				// console.log(sync,"连接成功的返回1", syncTime);
				// console.log(getEQ,"连接返回的电量")
				// console.log(laserManuallyParameters,"返回的激光参数")
				// console.log(deviceInfo,"返回的设备信息")
				// console.log(laserManuallyPaymentDuration,"设置的手动激光付费参数");
				// console.log(manuallyHRState,"手动心率的状态")
				// console.log(autoHRState,"自动心率的状态")
				// console.log(manuallyLaserState,"手动激光的状态")
				// console.log(laserRegimenParameters,"设置疗程参数")
				// console.log(setlaserTreatmentStatus,"设置疗程周期")

				// console.log(realtimeIsOpen,"实时心率")



			}
		} catch (error) {
			console.log(error,"包的错111")
			return error;
		}
	}


	/**
	 * 断开设备
	 */
	async disconnectPeripheral()
	{
		try
		{
			const result = await this.bleCenter.disconnect();
			this.operateType = 1;
			return result;
		}
		catch (error)
		{
			return error;
		}

	}

	/**
	 * 打开通知
	 */
	async startNotification() {
		try {
			const result = await this.bleCenter.startNotification(0);
			return result
		} catch (error) {
			return error
		}
	}

	/**
	 *
	 * @param {蓝牙连接成功的回调} callBack
	 */
	listenerConnectPeripheral(callBack) {

		this.connectPeripheralListener = this.bleCenter.addListener('BleManagerConnectPeripheral', (args) => {
			callBack(args);
		});
	}


	/**
	 *
	 * @param {蓝牙状态更新监听器} callBack
	 */
	listenerDidUpdateState(callBack)
	{

		this.updateStateListener = this.bleCenter.addListener('BleManagerDidUpdateState', (args) => {
			this.bleCenter.bluetoothState = args.state;
			callBack(args.state);
		});
	}

	/**
	 *
	 * @param {蓝牙断开} callBack
	 */

	listenerDisconnectPeripheral(callBack)
	{

		this.disconnectPeripheralListener = this.bleCenter.addListener('BleManagerDisconnectPeripheral', (args) => {
			// // console.log('BleManagerDisconnectPeripheral:', args);
			let newData = [...this.deviceMap.values()]
			this.bleCenter.initUUID();  //断开连接后清空UUID
			callBack(args);
		});
	}

	/**
	 *
	 * @param {蓝牙停止扫描监听器} callBack
	 */
	listenerStopScan(callBack) {

		this.stopScanListener = this.bleCenter.addListener('BleManagerStopScan', () => {
			this.scaning = false;
			callBack();
		});
	}

	/**
	 *
	 * @param {扫描到一个外围设备监听器} callBack
	 */
	listenerDiscoverPeripheral(callBack)
	{

		this.discoverPeripheralListener = this.bleCenter.addListener('BleManagerDiscoverPeripheral', (data) => {
			console.log('设备扫描中', data)
			console.log("DFU的编号", this.DFUTYPE, data.name)
			if (!data.name)
			{
				return
			}
			if (data.name && data.name == "DfuTarg")
			{
				this.deviceMap.set(deviceSN, data);
				callBack(data)
				return;
			}
			if (data.name && data.name == "WY_DFU_Targ")
			{
				this.deviceMap.set(deviceSN, data);
				callBack(data)
				return;
			}

			var _bytes;
			if (Platform.OS == 'android')
			{
				//_bytes = data.advertising.bytes;
				_bytes = data.advertising.manufacturerData.bytes;
			}
			else if
			(Platform.OS == 'ios' && data.advertising.manufacturerData)
			{
				_bytes = data.advertising.manufacturerData.bytes;
			}
			else
			{
				return;
			}
			if (_bytes == undefined) { return; }
			let deviceSN = this.qrCode.resolvingBroadcastInformation(_bytes);
			console.log(_bytes, '新设备字节',_bytes.length)
			console.log(deviceSN, '新设备编号')
			if (deviceSN == false) { return; }
			var item = {
				device_sn: deviceSN,
				id: data.id,
				name: data.name,
			}
			this.deviceMap.set(deviceSN, item);
			callBack(item)
		});
	}

	/**
	 *
	 * @param {收到蓝牙数据的回调} callBack
	 */
	listenerUpdateValueListener(callBack)
	{

		this.updateValueListener = this.bleCenter.addListener("BleManagerDidUpdateValueForCharacteristic", (args) => {

			this.transceiver.receiveData(cmd, args.value, (_object) => {
				callBack(_object);
			})
		});
	}




	async dataFromConnect(dataObject) {

		console.log(cmd,"收到的指令123456789", dataObject)
		switch (dataObject.cmd) {
			case cmd.kGXYL_TimeSync:
				try {
					this.sync = dataObject.body;
					console.log(dataObject,"同步时间的返回值")
				} catch (error) {
					console.log(error);
				}
				break;
			case cmd.kGXYL_GetEQ:
				//设置界面电量
				try {
					// var result = await this.getLaserManuallyParameters()
					console.log(dataObject.body,"获取电量")
					this.eq = dataObject.body;
					var deviceInformation = await deviceService.writeInformation({device_sn: this.device_sn})
					console.log(deviceInformation,"获取的设备信息123123123")
					this.deviceInformation = deviceInformation.data.deviceInfo
				} catch (error) {

				}
				break;
			case cmd.kGXYL_GetLaserManuallyParameters:
				//获取到的手动激光参数
				try {

					var dic = {
						power: dataObject.body.power,
						time: dataObject.body.time,
						duration: dataObject.body.duration
					};
					this.laserManuallyParameters = dic;
				} catch (error) {

				}
				break;
			case cmd.kGXYL_GetDeviceInfo:
				//获取设备信息
				this.deviceInfo = dataObject.body.deviceInfo
				break;
			case cmd.kGXYL_LaserManuallyPayParameters:
				//写入激光付费参数成功
				console.log(dataObject,"写入激光付费参数的回调")
				this.laserManuallyPaymentDuration = dataObject.body
				break;
			case cmd.kGXYL_LaserManuallyParameters:
				this.setLaserManuallyParametersValue = dataObject.body
				break;
			case cmd.kGXYL_GetManuallyHRState:
					this.manuallyHRState = dataObject.body

				break;
			case cmd.kGXYL_GetAutoHRState:
					this.autoHRState = dataObject.body
			break;
			case cmd.kGXYL_GetManuallyLaserState:
					this.manuallyLaserState = dataObject.body
				break;
			case cmd.kGXYL_LaserRegimenParameters:
				this.laserRegimenParameters = dataObject.body
				break;
			case cmd.kGXYL_SetlaserTreatmentStatus:
				console.log(dataObject, '设置激光疗程状态的回调')
				this.setlaserTreatmentStatus = dataObject.body;
				break;
			// case cmd.kGXYL_RealtimeIsOpen:

			// 	if(dataObject.body.realtimeData)
			// 	{
			// 		PubSub.publish('realData',{realtimeIsOpen: dataObject.body.realtimeData})
			// 	}

			// 	break;
			case cmd.kGXYL_GetTime:
				console.log(dataObject,'获取的设备时间回调')
				this.getDeviceTime = dataObject.body

				break;
			case cmd.kGXYL_LaserIsOpen:
				console.log(dataObject, "fanhui")
				this.isOpenLaser = dataObject.body
				break;
			case cmd.kGXYL_GetBoardCastDuration:
				console.log(dataObject, "获取蓝牙广播的")
				this.broadcastDuration = dataObject.body
				break;
			case cmd.kGXYL_GetLaserRegimenParameters:
				this.laserTreatmentParameters = dataObject.body
				break;
			case cmd.kGXYL_GetLaserRecording:
				console.log(dataObject, "新的数据")

				break;
			case cmd.kGXYL_RestoreFactorySettings:
				this.restoreFactory = dataObject.body
				break;
			case cmd.kGXYL_setPointer:
				this.setPointerValue = dataObject.body
				break
			case cmd.kGXYL_setNewPointer:
				this.setPointerValue = dataObject.body
				break;
			case cmd.KGXYL_startDFU:
				this.startDFUValue = dataObject.body
				break;
			case cmd.kGXYL_GetlaserTreatmentStatus:
				console.log(dataObject, '激光疗程状态返回值')
				this.getTreatmentStatusData = dataObject.body
				break;
			case cmd.kGXYL_HRAutomaticallIsOpen:
				this.isOpenAutoHrActionStatus = dataObject.body
				break;
			case cmd.kGXYL_HRManuallyIsOpen:
				console.log(dataObject, '开关手动心率')
				this.isOpenHrActionStatus = dataObject.body
				break;
			case cmd.kGXYL_GetRealtimeHeartRateBloodPressure:
				console.log(dataObject, '获取实时心率血压数据')
				this.getRealtimeHeartRateBloodPressure = dataObject.body
				PubSub.publish('realHRBloodData',{realHRBloodData: dataObject.body.data})
				break;
			case cmd.kGXYL_SetBoardCastDuration:
				console.log(dataObject,'设置的蓝牙广播回调1')
				this.setBroadcastDurationData = dataObject.body
				break;
			case cmd.kGXYL_GetBoardCastDuration:

				break;
			case cmd.kGXYL_BloodPressureCalibration:
				console.log(dataObject, '血压校准的返回值')
				this.set_bloodPressureCalibrationData = dataObject.body;
				break;
			case cmd.kGXYL_RemoveBloodPressureCalibrationData:
				console.log(dataObject, '擦除血压校准数据')
				break;
			case cmd.kGXYL_getRealtimeHRData:
				break;
			case cmd.kGXYL_setBloodPressureHR:
				this.set_bloodPressureHR = dataObject.body;
				console.log(dataObject, '心率血压监测开启')
				break;
			case cmd.kGXYL_setHR:
				console.log(dataObject, '开关心率监测')
				break;
			case cmd.kGXYL_startDFUBlood:
				console.log(dataObject, '开始血压空中升级')
				break;
			default:
				console.log('连接收到异常指令')
			break;
		}
	}

	async dataFromoperate(dataObject) {

	}

		/**
	 * [syncTime 同步时间]
	 * @Author   袁进
	 * @DateTime 2018-11-23T10:06:45+0800
	 * @param    {[Object]}                 ble [蓝牙类实例]
	 * @param    {[String]}                 id  [连接的设备id]
	 * @return   {[type]}                     [description]
	 */
	async syncTime() {
		try {
			// 设置日期

			var timestamp2 = new Date(2017,1,1,0,0,0).getTime()/1000;

			var timestamp = parseInt(new Date().getTime() / 1000 - timestamp2); //本地时区相差得秒数

			timestamp = timestamp;
			var timeBuffer = new ArrayBuffer(4);
			var timeDataView = new DataView(timeBuffer);
			timeDataView.setUint8(0, timestamp & 0x000000FF);
			timeDataView.setUint8(1, (timestamp & 0x0000FF00) >> 8);
			timeDataView.setUint8(2, (timestamp & 0x00FF0000) >> 16);
			timeDataView.setUint8(3, (timestamp & 0xFF000000) >> 24);
			// 发送数据
			console.log(timeDataView,'同步时间的参数')
			var sendArray = this.transceiver.writeData(cmd.kGXYL_TimeSync, timeDataView);
			var result = await this.bleCenter.write(sendArray);

			var returnData = await this.getValue("sync", 1000)
			console.log(returnData,"发送同步时间")
			return returnData
		}
		catch (error)
		{
			return error
		}
	}

	/**
 * 获取电量
 */
	async getEQ() {
		try {
			var timeBuffer = new ArrayBuffer(0);
			var dataView = new DataView(timeBuffer);
			var sendArray = await this.transceiver.writeData(cmd.kGXYL_GetEQ, dataView);
			var result = await this.bleCenter.write(sendArray);
			var returnData = await this.getValue("eq", 1000)
			console.log(returnData,"发送同步时间")
			return returnData
		} catch (error) {
			return error
		}
	}

	/**
	 * 获取手动激光参数
	 */
	async getLaserManuallyParameters() {
		try {
			var timeBuffer = new ArrayBuffer(0);
			var dataView = new DataView(timeBuffer);
			const sendArray = await this.transceiver.writeData(cmd.kGXYL_GetLaserManuallyParameters, dataView)
			const result = await this.bleCenter.write(sendArray)
			var returnData = await this.getValue("laserManuallyParameters", 1000)
			console.log(returnData,"发送同步时间")
			return returnData

		} catch (error) {

		}
	}

	/**
	 * 获取设备信息
	 */
	async getDeviceInfo() {
		try {
			var timeBuffer = new ArrayBuffer(0);
			var dataView = new DataView(timeBuffer);
			const sendArray = this.transceiver.writeData(cmd.kGXYL_GetDeviceInfo, dataView)
			const result = await this.bleCenter.write(sendArray);
			const returnData = await this.getValue("deviceInfo", 1000);
			console.log(returnData, "获取的设备信息")
			return returnData;
		} catch (error) {
			return error
		}
	}

	/**
	 *
	 * @param {设置手动激光付费时长} duration
	 */
	async setLaserManuallyPaymentDuration(duration) {
		try {
			var timeBuffer = new ArrayBuffer(4);
			var dataView = new DataView(timeBuffer);
			dataView.setUint8(0, duration & 0x000000FF);
			dataView.setUint8(1, (duration & 0x0000FF00) >> 8);
			dataView.setUint8(2, (duration & 0x00FF0000) >> 16);
			dataView.setUint8(3, (duration & 0xFF0000FF) >> 24);
			const sendArray = await this.transceiver.writeData(cmd.kGXYL_LaserManuallyPayParameters, dataView)
			const result = await this.bleCenter.write(sendArray);
			const resultData = await this.getValue("laserManuallyPaymentDuration", 1000)
			return resultData
		} catch (error) {

		}
	}
	/**
	 * 写入激光参数
	 * @param {功率} power
	 * @param {持续时间} duration
	 */
	async setLaserManuallyParameters (power,duration) {
		try {
			var timeBuffer = new ArrayBuffer(2);
			var dataView = new DataView(timeBuffer);
			dataView.setUint8(0, power);
			dataView.setUint8(1, duration);
			const sendArray = await this.transceiver.writeData(cmd.kGXYL_LaserManuallyParameters, dataView)
			const result = await this.bleCenter.write(sendArray)
			const returnData = await this.getValue("setLaserManuallyParameters", 1000)
		return returnData
		} catch (error) {

		}
	}

	/**
	 * 获取手动心率状态
	 */
	async getManuallyHRState() {
		try {
			var timeBuffer = new ArrayBuffer(0);
			var dataView = new DataView(timeBuffer);
			const sendArray = await this.transceiver.writeData(cmd.kGXYL_GetManuallyHRState, dataView)
			const result = await this.bleCenter.write(sendArray)
			const returnData = this.getValue("manuallyHRState", 1000)
			return returnData
		} catch (error) {

		}
	}
	/**
	 * 获取自动心率
	 */
	async getAutoHRState() {
		try {
			var timeBuffer = new ArrayBuffer(0);
			var dataView = new DataView(timeBuffer);
			const sendArray = await this.transceiver.writeData(cmd.kGXYL_GetAutoHRState, dataView)
			const result = await this.bleCenter.write(sendArray)
			const returnData = await this.getValue("autoHRState", 1000)
			return returnData
		} catch (error) {

		}

	}

	/**
	 * 获取手动激光开启状态
	 */
	async getManuallyLaserState() {
		try {
			var timeBuffer = new ArrayBuffer(0);
			var dataView = new DataView(timeBuffer);
			const sendArray = await this.transceiver.writeData(cmd.kGXYL_GetManuallyLaserState, dataView)
			const result = await this.bleCenter.write(sendArray)
			const returnData = await this.getValue("manuallyLaserState", 1000)
			return returnData
		} catch (error) {

		}
	}

	/**
	 *
	 * @param {写入疗程参数} treatment
	 */
	async setLaserTreatmentParameters(treatment) {
		try {
			var length = treatment.parameters.length * 4 + 8;
			var dataBuffer = new ArrayBuffer(length);
			var dataView = new DataView(dataBuffer);

			var parameterArray = treatment.parameters;// 参数列表
			dataView.setUint8(0, treatment.index);// 序号
			dataView.setUint8(1, parameterArray.length);// 参数列表个数
			dataView.setUint8(2, treatment.periodic);// 开启周期
			dataView.setUint8(3, treatment.gap);// 关闭周期

			if (treatment.endDate != undefined) {

			const year = parseInt(treatment.endDate[0]);
			dataView.setUint8(4, year % 256);
			dataView.setUint8(5, year / 256);
			dataView.setUint8(6, parseInt(treatment.endDate[1]));
			dataView.setUint8(7, parseInt(treatment.endDate[2]));
			} else {
			// console.log("疗程天数出错")
			return
			}

			// 拼接参数列表里的参数
			parameterArray.forEach((parameter, index) => {
			dataView.setUint8(8 + index * 4 + 0, parameter.power);
			dataView.setUint8(8 + index * 4 + 1, parameter.duration);
			dataView.setUint8(8 + index * 4 + 2, parameter.startHour);
			dataView.setUint8(8 + index * 4 + 3, parameter.startMinute);
			})

			const sendArray = await this.transceiver.writeData(cmd.kGXYL_LaserRegimenParameters, dataView)
			const result = await this.bleCenter.write(sendArray)
			const returnData = await this.getValue("laserRegimenParameters", 1000);
			return returnData
		} catch (error) {

		}

	}
	/**
	 *
	 * @param {写入疗程周期} dic
	 */
	async setTreatmentStatus(dic) {
		try {
			var buffer = new ArrayBuffer(2);
			var dataView = new DataView(buffer);
			dataView.setInt8(0, parseInt(dic.isOpen));
			dataView.setInt8(1, parseInt(dic.remainDays));
			const sendArray = await this.transceiver.writeData(cmd.kGXYL_SetlaserTreatmentStatus,dataView)
			const result = await this.bleCenter.write(sendArray);
			const returnData = await this.getValue("treatmentStatus", 1000)
			return returnData
		} catch (error) {

		}
	}
	/**
	 * 获取的时间
	 */
	async getTime() {
		try {
			var timeBuffer = new ArrayBuffer(0);
			var dataView = new DataView(timeBuffer);
			const sendArray = await this.transceiver.writeData(cmd.kGXYL_GetTime,dataView)
			const result = await this.bleCenter.write(sendArray);
			const returnData = await this.getValue("getDeviceTime", 1000)
			console.log(returnData,"获取的时间")
			return returnData
		} catch (error) {

		}
	}

	/**
	 * [isOpenLaserAction 开关手动激光]
	 * @Author   袁进
	 * @DateTime 2018-11-23T10:12:24+0800
	 * @param    {Boolean}                isOpen     [true:开启手动激光,false:关闭手动激光]
	 * @return   {Boolean}                           [description]
	 */
	async isOpenLaserAction(isOpen) {

		try {
			var buffer = new ArrayBuffer(1);
			var dataView = new DataView(buffer);
			isOpen == true ? dataView.setUint8(0, 1) : dataView.setUint8(0, 0);
			const sendArray = await this.transceiver.writeData(cmd.kGXYL_LaserIsOpen, dataView)
			const result = await this.bleCenter.write(sendArray)
			const returnData = await this.getValue("isOpenLaserAction", 1000)
			console.log(returnData, "开关激光")
			return returnData
		} catch (error) {
			return error
		}
	}
	/**
	 * 获取激光疗程状态
	 */
	async getTreatmentStatus() {
		try {
			var buffer = new ArrayBuffer(0);
			var dataView = new DataView(buffer);
			var sendArray = await this.transceiver.writeData(cmd.kGXYL_GetlaserTreatmentStatus, dataView)
			var result = await this.bleCenter.write(sendArray)
			var returnData = await this.getValue("getTreatmentStatus", 1000)
			return returnData
		} catch (error) {
			return error
		}
	}

	/**
	 * [getBroadcastDuration 获取蓝牙广播时长]
	 * @Author   袁进
	 * @DateTime 2019-03-13T10:14:35+0800
	 * @return   {[type]}                          [description]
	 */
	async getBroadcastDuration() {
		try {
			var buffer = new ArrayBuffer(0);
			var dataView = new DataView(buffer);
			const sendArray = await this.transceiver.writeData(cmd.kGXYL_GetBoardCastDuration, dataView);
			const result = await this.bleCenter.write(sendArray);
			const returnData = await this.getValue("broadcastDuration", 1000);
			console.log(returnData, "sssss")
			return returnData
		} catch (error) {
			return error
		}
	}

	/**
	 * [getLaserTreatmentParameters 获取疗程参数]
	 * @Author   袁进
	 * @DateTime 2019-01-11T21:44:19+0800
	 * @param    {[type]}                 dic      [description]
	 * @param    {[type]}                 ble      [description]
	 * @param    {[type]}                 deviceId [description]
	 * @return   {[type]}                          [description]
	 */
	async getLaserTreatmentParameters() {
		try {
			var dataBuffer = new ArrayBuffer(0)
			var dataView = new DataView(dataBuffer);
			const sendArray = await this.transceiver.writeData(cmd.kGXYL_GetLaserRegimenParameters, dataView)
			const result = await this.bleCenter.write(sendArray)
			const returnData = await this.getValue("laserTreatmentParameters", 1000)
			return returnData
		} catch (error) {
			return error
		}
	}

	/**
	 * 恢复出厂设置
	 */
	async restoreFactory() {
		try {
			var timeBuffer = new ArrayBuffer(0);
			var dataView = new DataView(timeBuffer);
			const sendArray = await this.transceiver.writeData(cmd.kGXYL_RestoreFactorySettings, dataView)
			const result = await this.bleCenter.write(sendArray)
			const returnData = await this.getValue("restoreFactoryValue", 1000)
			return returnData
		} catch (error) {
			return error
		}
	}

	/**
	 *
	 * @param {设置表盘指针} dic
	 */
	async setPointer(dic) {
		try {
			var timeBuffer = new ArrayBuffer(3);
			var dataView = new DataView(timeBuffer);
			if (dic.type == 1 && dic.hour != "null" && dic.minute != "null") {

				dataView.setInt8(0, parseInt(dic.type));
				dataView.setUint8(1, parseInt(dic.hour));
				dataView.setInt8(2, parseInt(dic.minute));
			} else if (dic.type == 0 && dic.sec != "null") {

				dataView.setInt8(0, parseInt(dic.type));
				dataView.setUint8(1, parseInt(dic.sec % 256));
				dataView.setInt8(2, parseInt(dic.sec / 256));
			}
			const sendArray = await this.transceiver.writeData(cmd.kGXYL_setPointer, dataView)
			const result = await this.bleCenter.write(sendArray)
			const returnData = await this.getValue("setPointerValue", 1000)
			return returnData

		} catch (error) {
			return error
		}
	}

		/**
	 *
	 * @param {设置表盘指针} dic
	 * 06x指针
	 */
	async setNewPointer(dic) {
		try {
			console.log(dic, '06x指针校准')
			if(dic.type == 1)
			{

				var timeBuffer = new ArrayBuffer(4);
				var dataView = new DataView(timeBuffer);
				var timeBuffer1 = new ArrayBuffer(4);
				var dataView1= new DataView(timeBuffer1);

				dataView.setInt8(0, 1);
				dataView.setUint8(1, 0);
				dataView.setInt8(2, parseInt(dic.direction));
				dataView.setInt8(3, parseInt(dic.step));

				dataView1.setInt8(0, 1);
				dataView1.setUint8(1, 1);
				dataView1.setInt8(2, parseInt(dic.minDirection));
				dataView1.setInt8(3, parseInt(dic.minStep));
				const sendArray6 = await this.transceiver.writeData(cmd.kGXYL_setNewPointer, dataView)
				const result = await this.bleCenter.write(sendArray6)
				const sendArray1 = await this.transceiver.writeData(cmd.kGXYL_setNewPointer, dataView1)
				const result1 = await this.bleCenter.write(sendArray1)

				dataView.setInt8(0, 2);
				dataView.setUint8(1, 0);
				dataView.setInt8(2, parseInt(dic.direction));
				dataView.setInt8(3, parseInt(dic.step));

				const sendArray2 = await this.transceiver.writeData(cmd.kGXYL_setNewPointer, dataView)
				const result2 = await this.bleCenter.write(sendArray2)

				dataView1.setInt8(0, 2);
				dataView1.setUint8(1, 1);
				dataView1.setInt8(2, parseInt(dic.minDirection));
				dataView1.setInt8(3, parseInt(dic.minStep));

				const sendArray7 = await this.transceiver.writeData(cmd.kGXYL_setNewPointer, dataView1)
				const result3 = await this.bleCenter.write(sendArray7)

				var dic = {
					type: dic.type,
					hour: dic.hour,
					minute: dic.minute,
					second: dic.second,
				}
				const res = await this.setPointer(dic);
				dataView.setInt8(0, 0);
				dataView.setUint8(1, 0);
				dataView.setInt8(2, parseInt(dic.direction));
				dataView.setInt8(3, parseInt(dic.step));

				dataView1.setInt8(0, 0);
				dataView1.setUint8(1, 1);
				dataView1.setInt8(2, parseInt(dic.minDirection));
				dataView1.setInt8(3, parseInt(dic.minStep));

				const sendArray4 = await this.transceiver.writeData(cmd.kGXYL_setNewPointer, dataView)
				const result4 = await this.bleCenter.write(sendArray4)

				const sendArray5 = await this.transceiver.writeData(cmd.kGXYL_setNewPointer, dataView1)
				const result5 = await this.bleCenter.write(sendArray5)

				const returnData = await this.getValue("setPointerValue", 1000)
				console.log(returnData, '06x指针校准的返回3')

				return returnData
			}
			else
			{
				var timeBuffer = new ArrayBuffer(4);
				var dataView = new DataView(timeBuffer);
				dataView.setInt8(0, 1);
				dataView.setUint8(1, 2);
				dataView.setInt8(2, parseInt(dic.secDirection));
				dataView.setInt8(3, parseInt(dic.secStep));
				const sendArray = await this.transceiver.writeData(cmd.kGXYL_setNewPointer, dataView)
				const result = await this.bleCenter.write(sendArray)

				dataView.setInt8(0, 2);
				dataView.setUint8(1, 2);
				dataView.setInt8(2, parseInt(dic.secDirection));
				dataView.setInt8(3, parseInt(dic.secStep));
				const sendArray1 = await this.transceiver.writeData(cmd.kGXYL_setNewPointer, dataView)
				const result1 = await this.bleCenter.write(sendArray1)
				var dic = {
					type: dic.type,
					sec: dic.second,
				}
				const res = await this.setPointer(dic);

				dataView.setInt8(0, 0);
				dataView.setUint8(1, 2);
				dataView.setInt8(2, parseInt(dic.secDirection));
				dataView.setInt8(3, parseInt(dic.secStep));
				const sendArray2 = await this.transceiver.writeData(cmd.kGXYL_setNewPointer, dataView)
				const result2 = await this.bleCenter.write(sendArray2)
				const returnData = await this.getValue("setPointerValue", 1000)
				console.log(returnData, '06x指针校准的返回3')
			}
		} catch (error) {
			return error
		}
	}

		/**
	 * 扫描设备
	 * s: 扫描时间（秒）
	 */
	async dfuScan(s) {
		try {
			if (this.scaning) {  //当前正在扫描中
				var aa = await this.bleCenter.stopScan();
				this.scaning = false;
				this.deviceMap = new Map();
			}

			console.log('扫描中1')

			const result = await this.bleCenter.scan(s);
			this.scaning = true;
			const deviceMap = await this.getDevice(s);
			return [...deviceMap.values()]
		} catch (error) {
			this.scaning = false;
		}
	}

	/**
	 *
	 * @param {升级文件的路径} dataUrl
	 */
	async startDFU(dataUrl) {
		try {
			this.DFUTYPE = 1;
			var timeBuffer = new ArrayBuffer(0);
			var dataView = new DataView(timeBuffer);
			const sendArray = await this.transceiver.writeData(cmd.KGXYL_startDFU, dataView)
			const result = await this.bleCenter.write(sendArray)
			const returnData = await this.getValue("startDFUValue", 1000)
			console.log(returnData, '开始空中升级', NordicDFU)
			if(returnData) {
				// PubSub.subscribe('DFU', async (msg, data) => {
				//     var id = data.item.id;
				//     console.log(id, '空中升级')
				//     try {
				//         var dfuResult = await NordicDFU.startDFU({deviceAddress: id,filePath: dataUrl})
				//     } catch (error) {
				//         console.log(error, '出错')
				//         var dfuResult = null
				//     }

				//     console.log(dfuResult, "dfu升级结果")
				//     this.DFUTYPE = 0;
				//     return dfuResult
				// })
				const searchDevice = await this.dfuScan(5)
				console.log(searchDevice, "dfu升级搜索到的设备")
				const resultDevice = searchDevice.find((item, index) => {
					return item.name == "DfuTarg"
				})
				console.log("dfu设备", dataUrl)
				if(resultDevice)
				{

					console.log(resultDevice, '升级搜索到的设备结果')
					var dfuResult = await NordicDFU.startDFU({
						deviceAddress: resultDevice.id,
						filePath: dataUrl
					})
					console.log(dfuResult, "dfu升级结果")
					this.DFUTYPE = 0;
					return dfuResult


				}
				else
				{

					var dfu = {msg: '没有找到待升级的设备'}
					this.DFUTYPE = 0;
					return dfu
				}
			}
		} catch (error) {
			console.log(error,'dfu的错误')
			this.DFUTYPE = 0;
			return error
		}
	}

Str2Bytes(str)

{

	var pos = 0;

	var len = str.length;

	if(len %2 != 0)

	{

	return null;

	}

	len /= 2;

	var hexA = new Array();

	for(var i=0; i<len; i++)

	{

	var s = str.substr(pos, 2);

	var v = parseInt(s, 16);

	hexA.push(v);

	pos += 2;

	}

	return hexA;

}

	/**
	 *
	 * @param {血压心率空中升级的文件路径} dataUrl
	 */
	async startDFUWithBlood(dataUrl)
	{
		try {
			this.DFUTYPE = 2;
			var timeBuffer = new ArrayBuffer(0);
			var dataView = new DataView(timeBuffer);
			// dataView.setInt8(0,1);
			// dataView.setUint8(1,0);
			// var len = dataView.length;
			// var sendArray = new Array();
			// for(var i = 0; i< len; i++)
			// {
			//     sendArray.push(dataView.getUint8(i))
			// }
			const sendArray = await this.transceiver.writeHRData(cmd.kGXYL_startDFUBlood, dataView)
			console.log('sendArray为[1,0]', '参数1121312')
			const result = await this.bleCenter.writeDFU(sendArray)








			const returnData = await this.getValue("startDFUValue", 2000)
			if(!this.eq)
			{
				return;
			}

			if(returnData) {
				const searchDevice = await this.dfuScan(5)
				console.log(searchDevice, "dfu升级搜索到的设备")
				const resultDevice = searchDevice.find((item, index) => {
					return item.name == "WY_DFU_Targ"
				})
				console.log(resultDevice, "dfu设备", NordicDFU)
				if(resultDevice)
				{
					const dfuResult = await NordicDFU.startDFU({
						deviceAddress: resultDevice.id,
						filePath: dataUrl
					})
					console.log(dfuResult, "dfu升级结果")
					return dfuResult
				}
				else
				{
					var dfu = {msg: '没有找到待升级的设备'}
					return dfu
				}
			}
		} catch (error) {
			console.log(error, 'dfu的错误')
			return error
		}
	}

	/**
	 * 获取实时心率血压数据
	 */
	async getRealtimeHRBloodData()
	{
		try {
			var timeBuffer = new ArrayBuffer(0);
			var dataView = new DataView(timeBuffer);
			const sendArray = await this.transceiver.writeData(cmd.kGXYL_GetRealtimeHeartRateBloodPressure, dataView)
			const result = await this.bleCenter.write(sendArray)
			const returnData = await this.getValue("getRealtimeHeartRateBloodPressure", 1000)
			return returnData
		} catch (error) {
			return error
		}
	}

	/**
	 * 血压校准
	 */
	async checkBlood(dic)
	{
		try {
			console.log(dic, '血压校准的参数')
			var timeBuffer = new ArrayBuffer(3);
			var dataView = new DataView(timeBuffer);
			dataView.setUint8(0, dic.systolic);
			dataView.setUint8(1, dic.diastolic);
			dataView.setUint8(2, dic.HRData);
			const sendArray = await this.transceiver.writeData(cmd.kGXYL_BloodPressureCalibration, dataView)
			const result = await this.bleCenter.write(sendArray)
			const returnData = await this.getValue("set_bloodPressureCalibrationData", 1000)
			return returnData
		} catch (error) {
			return error
		}
	}

	/**
	 * 擦除校准数据
	 */
	async removeCheckData()
	{
		try {
			var timeBuffer = new ArrayBuffer(3);
			var dataView = new DataView(timeBuffer);
			dataView.setUint8(0, 0);
			dataView.setUint8(1, 0);
			dataView.setUint8(2, 0);
			const sendArray = await this.transceiver.writeData(cmd.kGXYL_RemoveBloodPressureCalibrationData, dataView)
			const result = await this.bleCenter.write(sendArray)
			const returnData = await this.getValue("remove_bloodPressureCalibrationData", 1000)
			return returnData
		} catch (error) {
			return error
		}
	}

	/**
	 *
	 * @param {开关心率血压监测} dic
	 */
	async isHRBlood(isOpen)
	{
		try {
			var timeBuffer = new ArrayBuffer(1);
			var dataView = new DataView(timeBuffer);
			dataView.setUint8(0, isOpen);
			const sendArray = await this.transceiver.writeData(cmd.kGXYL_setBloodPressureHR, dataView)
			const result = await this.bleCenter.write(sendArray)
			const returnData = await this.getValue("set_bloodPressureHR", 1000)
			return returnData
		} catch (error) {
			return error
		}
	}

	/**
	 * DFU状态变化的监听器
	 */
	dfuStateChanged(callBack)
	{
		DFUEmitter.addListener("DFUStateChanged", ({ state }) => {
			callBack(state)
		});
	}

	/**
	 * DFU进度条监听器
	 */
	dfuProgress(callBack)
	{
		DFUEmitter.addListener("DFUProgress", ({ percent }) => {
			callBack(percent)
		});
	}

	/**
	 *
	 * @param {开关自动心率监测} isOpen
	 */
	async isOpenAutoHrAction(isOpen)
	{
		try {
			var buffer = new ArrayBuffer(1);
			var dataView = new DataView(buffer);
			isOpen == true ? dataView.setUint8(0, 1) : dataView.setUint8(0, 0);
			var sendArray = await this.transceiver.writeData(cmd.kGXYL_HRAutomaticallIsOpen, dataView)
			var result = await this.bleCenter.write(sendArray)
			var returnData = await this.getValue("isOpenAutoHrAction", 1000)
			return returnData
		} catch (error) {
			return error
		}
	}

	/**
	 *
	 * @param {开关手动心率监测} isOpen
	 */
	async isOpenHrAction(isOpen)
	{
		try {
			var buffer = new ArrayBuffer(1);
			var dataView = new DataView(buffer);
			isOpen ? dataView.setUint8(0, 1) : dataView.setUint8(0, 0);
			var sendArray = await this.transceiver.writeData(cmd.kGXYL_HRManuallyIsOpen, dataView)
			var result = await this.bleCenter.write(sendArray)
			var returnData = await this.getValue('isOpenHrAction', 2000)
			console.log(returnData, '底层手动心率')
			return returnData
		} catch (error) {
			return error
		}
	}

	/**
	 *
	 * @param {实时心率监测} isOpen
	 */
	async isOpenRealtimeData(isOpen)
	{
		try {
			var buffer = new ArrayBuffer(1);
			var dataView = new DataView(buffer);
			isOpen ? dataView.setUint8(0, 1) : dataView.setUint8(0, 0);
			var sendArray = await this.transceiver.writeData(cmd.kGXYL_RealtimeIsOpen, dataView)
			var result = await this.bleCenter.write(sendArray)
		} catch (error) {
			return error
		}
	}

	/**
	 *
	 * @param {实时心率数据} callBack
	 */
	pubSubRealData(callBack)
	{
		PubSub.subscribe("realData",callBack)
	}

	/**
	 *
	 * @param {实时心率血压数据} callBack
	 */
	pubSubRealHRBloodData(callBack)
	{
		PubSub.subscribe("realHRBloodData", callBack)
	}

	/**
	 *
	 * @param {设置蓝牙广播时长} duration
	 */
	async setBroadcastDuration(duration)
	{
		try {
			var buffer = new ArrayBuffer(1);
			var dataView = new DataView(buffer);
			dataView.setUint8(0, duration);
			var sendArray = await this.transceiver.writeData(cmd.kGXYL_SetBoardCastDuration, dataView)
			var result = await this.bleCenter.write(sendArray)
			var returnData = await this.getValue('setBroadcastDuration', 2000)
			console.log(returnData, '设置蓝牙广播时长成功')
			return returnData

		} catch (error) {
			console.log(error, '设置蓝牙广播时长失败')
			return error
		}
	}


	getValue(type,s)
	{
		var value;
		return new Promise((resolve,reject) => {
			setTimeout(() => {
				if(type == "eq"){
					value = this.eq
				}
				if(type == "sync") {
					value = this.sync
				}
				if(type == "laserManuallyParameters") {
					value = this.laserManuallyParameters
				}
				if(type == "deviceInfo") {
					value = this.deviceInfo
				}
				if(type == "laserManuallyPaymentDuration") {
					value = this.laserManuallyPaymentDuration
				}
				if(type == "laserManuallyParameters") {
					value = this.laserManuallyParameters
				}
				if(type == "setLaserManuallyParameters") {
					value = this.setLaserManuallyParametersValue
				}
				if(type == "manuallyHRState") {
					value = this.manuallyHRState
				}
				if(type == "autoHRState") {
					value = this.autoHRState
				}
				if(type == "manuallyLaserState") {
					value = this.manuallyLaserState
				}
				if(type == "laserRegimenParameters") {
					value = this.laserRegimenParameters
				}
				if(type == "treatmentStatus") {
					value = this.setlaserTreatmentStatus
				}
				if(type == "getDeviceTime") {
					value = this.getDeviceTime;
				}
				if( type == "isOpenLaserAction" ) {
					value = this.isOpenLaser
				}
				if (type == "broadcastDuration") {
					value = this.broadcastDuration
				}
				if (type == "laserTreatmentParameters") {
					value = this.laserTreatmentParameters
				}
				if(type == "restoreFactoryValue") {
					value = this.restoreFactoryValue
				}
				if(type == "setPointerValue") {
					value = this.setPointerValue
				}
				if(type == "startDFUValue") {
				value = this.startDFUValue
				}
				if(type == "getTreatmentStatus")
				{
					value = this.getTreatmentStatusData
				}
				if(type == 'isOpenAutoHrAction')
				{
					value = this.isOpenAutoHrActionStatus
				}
				if(type == 'isOpenHrAction')
				{
					value = this.isOpenHrActionStatus
				}
				if (type == 'getRealtimeHeartRateBloodPressure')
				{
					value = this.getRealtimeHeartRateBloodPressure
				}
				if (type == 'setBroadcastDuration')
				{
					value = this.setBroadcastDurationData
				}
				if(type == "set_bloodPressureCalibrationData")
				{
					value = this.set_bloodPressureCalibrationData
				}
				if(type == "set_bloodPressureHR")
				{
					value = this.set_bloodPressureHR
				}

				if(value){
					resolve(value)
				}
				if(!value) {
					console.log("获取的value", value)
					reject()
				}

			},s)
		})

	}
}
