/**
 * 蓝牙写数据，回数据底层类
 */
import {
	Platform,
	NativeModules,
	NativeEventEmitter,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import coding from './coding';
import * as cmd from './cmd';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default class BleModule
{
	static getInstance()
	{
		if (!BleModule.instance)
		{
			BleModule.instance = new BleModule();
		}
		return BleModule.instance;
	}
	constructor()
	{
		this.isConnecting = false; //蓝牙是否连接
		this.bluetoothState = 'off'; //蓝牙打开状态
		this.coding = new coding();
		this.ASCIIDic = {
			38: "&", 48: "0", 49: "1", 50: "2",
			51: "3", 52: "4", 53: "5", 54: "6",
			55: "7", 56: "8", 57: "9", 65: "A",
			66: "B", 67: "C", 68: "D", 69: "E",
			70: "F", 71: "G", 72: "H", 73: "I",
			74: "J", 75: "K", 76: "L", 77: "M",
			78: "N", 79: "O", 80: "P", 81: "Q",
			82: "R", 83: "S", 84: "T", 85: "U",
			86: "V", 87: "W", 88: "X", 89: "Y",
			90: "Z", 97: "a", 98: "b", 99: "c",
			100: "d", 101: "e", 102: "f", 103: "g",
			104: "h", 105: "i", 106: "j", 107: "k",
			108: "l", 109: "m", 110: "n", 111: "o",
			112: "p", 113: "q", 114: "r", 115: "s",
			116: "t", 117: "u", 118: "v", 119: "w",
			120: "x", 121: "y", 122: "z",
		}
		// this.receiveDataArray = new Array();
		// this.receiveIndex = 0;
		// this.isReceiveData = false;
		this.sendDataCount = 18; // 每20个字节一包
		this.realtimeDataCount = 0
	}

	/**
	 * 添加监听器
	 * 所有监听事件如下
	 * BleManagerStopScan：扫描结束监听
	 * BleManagerDiscoverPeripheral：扫描到一个新设备
	 * BleManagerDidUpdateState：蓝牙状态改变
	 * BleManagerDidUpdateValueForCharacteristic：接收到新数据
	 * BleManagerConnectPeripheral：蓝牙设备已连接
	 * BleManagerDisconnectPeripheral：蓝牙设备已断开连接
	 * */
	addListener(str, fun) {
		return bleManagerEmitter.addListener(str, fun);
	}

	/**
	 * 初始化蓝牙模块
	 * Init the module.
	 * */
	start() {
		BleManager.start({ showAlert: false })
			.then(() => {
				this.checkState();
				console.log('Init the module success.');
			}).catch(error => {
				console.log('Init the module fail.');
			});
	}

	/**
	 * 强制检查蓝牙状态
	 * Force the module to check the state of BLE and trigger a BleManagerDidUpdateState event.
	 * */
	checkState() {
		BleManager.checkState();
	}

	/**
	 * 返回扫描到的蓝牙设备
	 * Return the discovered peripherals after a scan.
	 * */
	getDiscoveredPeripherals() {
		return new Promise((resolve, reject) => {
			BleManager.getDiscoveredPeripherals([])
				.then((peripheralsArray) => {
					console.log('扫描到的蓝牙设备信息', peripheralsArray);
					resolve(peripheralsArray);
				})
				.catch(error => {

				});
		});
	}

	/**
	 * 写数据到蓝牙兼容ios和android
	 * 参数：(peripheralId, serviceUUID, characteristicUUID, data, maxByteSize)
	 * Write with response to the specified characteristic, you need to call retrieveServices method before.
	 * */
	write(cmd,dataViewParameters,type='',id)
	{
		return new Promise((resolve,reject) => {


			if (Platform.OS == 'android')
			{
				index = 1
			}
			else
			{
				index = 0
			}
			if (cmd == 0x0C00)
			{
				this.coding.setPktCount();
			}
			var aesBuffer = this.coding.encodingData(cmd, dataViewParameters);
			var aesDataView = new DataView(aesBuffer);
			let totalDataCount = aesDataView.byteLength;
			const packetCount = parseInt((totalDataCount - 1) / this.sendDataCount + 1);
			var sendArray = new Array();
			for (var packetNum = 0; packetNum < parseInt((totalDataCount - 1) / this.sendDataCount + 1); packetNum++) {

				var currentCount = (totalDataCount >= (packetNum + 1) * this.sendDataCount ? this.sendDataCount : totalDataCount - packetNum * this.sendDataCount);
				// var sendArray = new Array();
				for (var index = 0; index < currentCount; index++)
				{
					sendArray.push(aesDataView.getUint8(index + packetNum * this.sendDataCount));
				}
				// callBack(sendArray);
			}
			console.log(sendArray,'发送的数据')
			// data = this.addProtocol(data);   //在数据的头尾加入协议格式，如0A => FEFD010AFCFB，不同的蓝牙协议应作相应的更改
			//9C2C4841-69C3-4742-9F69-764351FB0783  9C2C48A5-69C3-4742-9F69-764351FB0783
			//console.log('test_UUID_1', this.peripheralId, this.writeWithResponseServiceUUID[index], this.writeWithResponseCharacteristicUUID[index]);
			BleManager.write(id, "9C2C4841-69C3-4742-9F69-764351FB0783", "9C2C48A5-69C3-4742-9F69-764351FB0783", sendArray)
				.then(() => {
					console.log(type+'成功');
					resolve()
				})
				.catch((error) => {
					console.log(type+'失败');
					reject(error)
				});
		})
	}

	//空中升级的写数据
	writeDFU(cmd, dataViewParameters, type='', id)
	{
		return new Promise((resolve,reject) => {


			if (Platform.OS == 'android')
			{
				num = 1
			}
			else
			{
				num = 0
			}
			if (cmd == 0x0C00)
			{
				this.coding.setPktCount();
			}
			var aesBuffer = this.coding.encodingData(cmd, dataViewParameters);
			var aesDataView = new DataView(aesBuffer);
			let totalDataCount = aesDataView.byteLength;
			const packetCount = parseInt((totalDataCount - 1) / this.sendDataCount + 1);
			var sendArray = new Array();
			for (var packetNum = 0; packetNum < parseInt((totalDataCount - 1) / this.sendDataCount + 1); packetNum++) {

				var currentCount = (totalDataCount >= (packetNum + 1) * this.sendDataCount ? this.sendDataCount : totalDataCount - packetNum * this.sendDataCount);
				// var sendArray = new Array();
				for (var index = 0; index < currentCount; index++)
				{
					sendArray.push(aesDataView.getUint8(index + packetNum * this.sendDataCount));
				}
				// callBack(sendArray);
			}
			console.log(sendArray, '发送的数据', num);
			// data = this.addProtocol(data);   //在数据的头尾加入协议格式，如0A => FEFD010AFCFB，不同的蓝牙协议应作相应的更改
			//9C2C4841-69C3-4742-9F69-764351FB0783  9C2C48A5-69C3-4742-9F69-764351FB0783
			// console.log('test_UUID_1', this.peripheralId, this.writeWithResponseServiceUUID[num], this.writeWithResponseCharacteristicUUID[num]);
			BleManager.write(id, '9C2C4841-69C3-4742-9F69-764351FB0783', '9C2C48A5-69C3-4742-9F69-764351FB0783', sendArray)
				.then(() => {
					console.log(type+'成功');
					resolve()
				})
				.catch((error) => {
					console.log(type+'失败');
					reject(error)
				});
		})
	}
	/*
	接收指令数据
	*/
	receiveData(cmd, dataArray, callBack) {
		console.log(dataArray,'接收的数据1112123')

	if (dataArray[0] == 165) {
	this.isReceiveData = true;
	this.receiveDataArray = new Array();
	this.receiveIndex = 0;
	}
	if (this.isReceiveData) {
	dataArray.forEach(v => {
		this.receiveDataArray.push(v);
	})
	this.receiveIndex += dataArray.length;
	if (this.receiveDataArray[1] == this.receiveIndex - 2) { // 接收一条完整的指令
		this.isReceiveData = false;
		var data = this.receiveDataArray.slice(2, this.receiveIndex);
		let v = this.coding.decodingData(data);
		this.dataDistributionMethods(cmd, v, callBack);
	}
	}
	// console.log('transveiver receiveData', cmd );
}

	dataDistributionMethods(cmd, v, callBack)
	{
		console.log("设备回来的数据", cmd);
		var data = v.data;
		var dic = new Object();
		var body = new Object();
		switch (v.cmd)
		{
		case cmd.kGXYL_TimeSync:
		case cmd.kGXYL_setPointer:
		case cmd.kGXYL_setNewPointer:
		case cmd.kGXYL_LaserRegimenParameters:
		case cmd.kGXYL_LaserManuallyParameters:
		case cmd.kGXYL_LaserManuallyPayParameters:
		case cmd.kGXYL_LaserIsOpen:
		case cmd.kGXYL_HRAutomaticallIsOpen:
		case cmd.kGXYL_HRManuallyIsOpen:
			var state = "";
			console.log(data,'接收指令数据')
			switch (data[0]) {
			case 0: state = "设置成功"; break;
			case 1: state = "设置失败"; break;
			case 2: state = "设置无效"; break;
			case 3: state = "占用"; break;
			case 4: state = "未发现"; break;
			case 5: state = "重复操作"; break;
			case 6: state = "正在充电"; break;
			case 7: state = "请充电!"; break;
			case 8: state = "无资源"; break;
			default: state = "设置失败"; break;
			}
			body.setState = state;
			break;
		case cmd.kGXYL_GetEQ:             // 获取电量
			body.eq = data[2];
			break;
		case cmd.kGXYL_GetLaserRecording: // 获取激光数据
			body.data = data;
			break;
		case cmd.kGXYL_GetHRRecording: // 获取心率数据
			body.data = data;
			break;
		case cmd.kGXYL_GetMotionRecording: // 获取运动数据
			body.data = data;
			break;
		case cmd.kGXYL_GetLaserManuallyParameters: // 获取手动激光参数
			body.duration = data[0] | data[1] << 8 | data[2] << 16 | data[3] << 24;
			body.power = data[4];
			body.time = data[5];
			break;
		case cmd.kGXYL_GetLaserRegimenParameters: // 获取激光疗程参数
			console.log(data,'获取的激光参数///////')
			if (data.length == 1 && data[0] == 4)
			{
				body.isEmpty = true; // 表示没有设置参数
			}
			else
			{
				body.isEmpty = false;
				body.sequence = data[0];// 序号
				body.pCount = data[1];// 参数列表个数
				body.periodic = data[2];// 开启周期
				body.gap = data[3];// 关闭间隙
				var year = data[4] | data[5] << 8;// 结束日期
				if ((data[6] == 0 && data[7] == 0) || (data[6] == 255 && data[7] == 255))
				{// 如果第6、7位为0的情况下表示天数
					body.endDate = year;
					body.treatmentDurationType = '0';
				}
				else
				{
					var month = data[6] + "";
					var day = data[7] + "";
					body.endDate = year + "-" + (month.length == 1 ? ("0" + month) : month) + "-" + (day.length == 1 ? ("0" + day) : day);
					body.treatmentDurationType = '1';
				}
				if (data.length > 8)
				{ // 大于8， 表示有参数列表
					var paramentersTotalDuration = 0;
					var treatmentParaArray = new Array();
					var parametersCount = (data.length - 8) / 4;
					for (var index = 0; index < parametersCount; index++)
					{
						let treatment = new Object();
						treatment.power = data[8 + index * 4];
						treatment.duration = data[8 + index * 4 + 1];
						treatment.startHour = data[8 + index * 4 + 2];
						treatment.startMinute = data[8 + index * 4 + 3];
						treatmentParaArray.push(treatment);
						paramentersTotalDuration += parseInt(treatment.duration);
					}
					body.parameters = treatmentParaArray; // 参数列表
				}
			}
			break;
		case cmd.kGXYL_GetDeviceInfo:
			var asciiString = "";
			data.forEach((item) =>
			{
				if (this.ASCIIDic[item])
				{
					asciiString += this.ASCIIDic[item];
				}
			})
			var array = asciiString.split("&");
			body.deviceInfo = {
				"productModle": array[0],
				"manufacturerName": array[1],
				"firmwareVersion": array[2],
				"protocolStackVersion": array[3],
				"hardwareVersion": array[4],
				"factorySerialNumber": array[5],
			}
			break;
		case cmd.kGXYL_GetManuallyHRState:
			body.manuallyHRState = data[0];
			break;
		case cmd.kGXYL_GetAutoHRState:
			body.autoHRState = data[0];
			break;
		case cmd.kGXYL_GetBoardCastDuration:
			body.boardCastDuration = data[0];
			break;
		case cmd.kGXYL_SetBoardCastDuration:
			console.log(data, '设置的蓝牙广播')
			break;
		case cmd.kGXYL_GetManuallyLaserState:
			body.manuallyLaserState = data[0];
			console.log(data, "激光开关状态1111")
			break;
		case cmd.kGXYL_RealtimeIsOpen:
			if (data.length == 1)
			{
				var state = "";
				switch (data[0]) {
				case 0: state = "设置成功"; break;
				case 1: state = "设置失败"; break;
				case 2: state = "设置无效"; break;
				case 3: state = "占用"; break;
				case 4: state = "未发现"; break;
				case 5: state = "重复操作"; break;
				case 6: state = "充电保护"; break;
				case 7: state = "请充电!"; break;
				case 8: state = "无资源"; break;
				default: break;
				}
				body.setState = state;
			}
			else if (data.length == 5)
			{
				if (this.realtimeDataCount == 0)
				{
					var realtimeData1 = new Object();
					realtimeData1.hrRealtime = data[4];
					realtimeData1.motionRealtime = data[0] | data[1] << 8 | data[2] << 16 | data[3] << 24;
					body.realtimeData = realtimeData1;
				}
				else
				{
					this.realtimeDataCount == 6 ? this.realtimeDataCount = 0 : this.realtimeDataCount++;
					return;
				}
			}
			else
			{
				return;
			}
			break;
		case cmd.kGXYL_GetlaserTreatmentStatus:
			//获取激光疗程周期
			body.treatmentStatus = data[0];
			body.remainDays = data[1];
			break;
		case cmd.kGXYL_SetlaserTreatmentStatus:
		//设置激光疗程周期
			console.log(data, '设置激光疗程周期')
			var state = "";
			switch (data[0])
			{
			case 0: state = "设置成功"; break;
			case 1: state = "设置失败"; break;
			case 2: state = "设置无效"; break;
			case 3: state = "占用"; break;
			case 4: state = "未发现"; break;
			case 5: state = "重复操作"; break;
			case 6: state = "正在充电"; break;
			case 7: state = "请充电!"; break;
			case 8: state = "无资源"; break;
			default: state = "设置失败"; break;
			}
			body.setState = state;
			break;
		case cmd.kGXYL_setLaserRegimen:
			body.setState = "成功";
			console.log(body, "设置激光暂停的返回值")

			break;
		case cmd.kGXYL_GetTime:
			console.log(data, '获取日期')
			var timeString = data[0] + data[1] * 256;
			body.date = timeString;
			break;
		default:
			break;
		}
		dic.cmd = v.cmd;
		dic.body = body;
		callBack(dic);
	}


	/**
	 * 返回已连接的蓝牙设备
	 * Return the connected peripherals.
	 * */
	getConnectedPeripherals() {
		BleManager.getConnectedPeripherals([])
			.then((peripheralsArray) => {
				// console.log('Connected peripherals: ', peripheralsArray);
			}).catch(error => {

			})
	}

	/**
	 * 判断指定设备是否已连接
	 * Check whether a specific peripheral is connected and return true or false
	 */
	isPeripheralConnected() {
		return new Promise((resolve, reject) => {
			BleManager.isPeripheralConnected(this.peripheralId, [])
				.then((isConnected) => {
					resolve(isConnected);
					if (isConnected) {
						// console.log('Peripheral is connected!');
					} else {
						// console.log('Peripheral is NOT connected!');
					}
				}).catch(error => {
					reject(error);
				})
		});
	}

	/**
	 * 蓝牙接收的信号强度
	 * Read the current value of the RSSI
	 * */
	readRSSI(id) {
		return new Promise((resolve, reject) => {
			BleManager.readRSSI(id)
				.then((rssi) => {
					// console.log(id,'RSSI: ',rssi);
					resolve(rssi)
				})
				.catch((error) => {
					// console.log(error);
					reject(error)
				});
		});
	}

	/**
	 * Android only
	 * 开启一个绑定远程设备的进程
	 * Start the bonding (pairing) process with the remote device
	 * */
	createBond() {
		BleManager.createBond(this.peripheralId)
			.then(() => {
				// console.log('createBond success or there is already an existing one');
			})
			.catch(() => {
				// console.log('fail to bond');
			})
	}

	/**
	 * Android only
	 * 获取已绑定的设备
	 * Return the bonded peripherals
	 * */
	getBondedPeripherals() {
		BleManager.getBondedPeripherals([])
			.then((bondedPeripheralsArray) => {
				// Each peripheral in returned array will have id and name properties
				// console.log('Bonded peripherals: ' + bondedPeripheralsArray);
			});
	}

	/**
	 * 在已绑定的缓存列表中移除设备
	 * Removes a disconnected peripheral from the cached list.
	 * It is useful if the device is turned off,
	 * because it will be re-discovered upon turning on again
	 * */
	removePeripheral() {
		return new Promise((resolve, reject) => {
			BleManager.removePeripheral(this.peripheralId)
				.then(() => {
					resolve();
				})
				.catch(error => {
					reject(error);
				})
		});
	}

	/**
	 * 添加蓝牙协议格式，包头、数据长度、包尾，不同的蓝牙协议应作相应的更改
	 * 0A => FEFD010AFCFB
	 * */
	addProtocol(data) {
		return 'FEFD' + this.getHexByteLength(data) + data + 'FCFB';
	}

	/**
	 * 计算十六进制数据长度，每两位为1个长度，返回十六进制长度
	 * */
	getHexByteLength(str) {
		let length = parseInt(str.length / 2);
		let hexLength = this.addZero(length.toString(16));
		return hexLength;
	}

	/**
	 * 在字符串前面添加 0, 默认补充为2位
	 * */
	addZero(str, bit = 2) {
		for (let i = str.length; i < bit; i++) {
			str = '0' + str;
		}
		return str;
	}

	/**
	 * ios系统从蓝牙广播信息中获取蓝牙MAC地址
	 * */
	getMacAddressFromIOS(data) {
		let macAddressInAdvertising = data.advertising.kCBAdvDataManufacturerMacAddress;
		//为undefined代表此蓝牙广播信息里不包括Mac地址
		if (!macAddressInAdvertising) {
			return;
		}
		macAddressInAdvertising = macAddressInAdvertising.replace("<", "").replace(">", "").replace(" ", "");
		if (macAddressInAdvertising != undefined && macAddressInAdvertising != null && macAddressInAdvertising != '') {
			macAddressInAdvertising = this.swapEndianWithColon(macAddressInAdvertising);
		}
		return macAddressInAdvertising;
	}

	/**
	 * ios从广播中获取的mac地址进行大小端格式互换，并加上冒号:
	 * @param string         010000CAEA80
	 * @returns string       80:EA:CA:00:00:01
	 * */
	swapEndianWithColon(str) {
		let format = '';
		let len = str.length;
		for (let j = 2; j <= len; j = j + 2) {
			format += str.substring(len - j, len - (j - 2));
			if (j != len) {
				format += ":";
			}
		}
		return format.toUpperCase();
	}
}
