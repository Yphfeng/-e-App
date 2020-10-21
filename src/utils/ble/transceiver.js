
import BleCoding from './coding';
import { Platform, } from 'react-native';


export default class Transceiver
{
	constructor()
	{
		this.coding = new BleCoding();
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
	Uint162Str(arraybuffer)
	{
		return String.fromCharCode.apply(null, new Uint16Array(arraybuffer));
	}

	strToHexCharCode(str)
	{
		if (str === "")
			return "";
		var hexCharCode = [];
		hexCharCode.push("0x");
		for (var i = 0; i < str.length; i++) {
			hexCharCode.push((str.charCodeAt(i)).toString(16));
		}
		return hexCharCode.join("");
	}


	/**
	 * 写数据到蓝牙兼容ios和android
	 * 参数：(peripheralId, serviceUUID, characteristicUUID, data, maxByteSize)
	 * Write with response to the specified characteristic, you need to call retrieveServices method before.
	 *cmd: 发送的指令
	* dataViewParameters: 写入蓝牙的数据
	* type: '所进行的操作'
	* id: 蓝牙id
	*  */
	writeData(cmd, dataViewParameters, type='')
	{
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
			for (var index = 0; index < currentCount; index++) {
				sendArray.push(aesDataView.getUint8(index + packetNum * this.sendDataCount));
			}
			// callBack(sendArray);
		}
		console.log(sendArray,"蓝牙bleWrite")
		// data = this.addProtocol(data);   //在数据的头尾加入协议格式，如0A => FEFD010AFCFB，不同的蓝牙协议应作相应的更改
		//console.log('test_UUID_1', this.peripheralId, this.writeWithResponseServiceUUID[index], this.writeWithResponseCharacteristicUUID[index]);
		return sendArray

	}

	/**
	 * 写心率血压数据到蓝牙兼容ios和android
	 * 参数：(peripheralId, serviceUUID, characteristicUUID, data, maxByteSize)
	 * Write with response to the specified characteristic, you need to call retrieveServices method before.
	 *cmd: 发送的指令
	* dataViewParameters: 写入蓝牙的数据
	* type: '所进行的操作'
	* id: 蓝牙id
	*  */
	writeHRData(cmd, dataViewParameters, type='')
	{
		// if (Platform.OS == 'android')
		// {
		// 	index = 1
		// }
		// else
		// {
		// 	index = 0
		// }

		var aesBuffer = this.coding.encodingHRData(cmd, dataViewParameters);
		var aesDataView = new DataView(aesBuffer);
		let totalDataCount = aesDataView.byteLength;
		const packetCount = parseInt((totalDataCount - 1) / this.sendDataCount + 1);
		var sendArray = new Array();
		for (var packetNum = 0; packetNum < parseInt((totalDataCount - 1) / this.sendDataCount + 1); packetNum++) {

			var currentCount = (totalDataCount >= (packetNum + 1) * this.sendDataCount ? this.sendDataCount : totalDataCount - packetNum * this.sendDataCount);
			// var sendArray = new Array();
			for (var index = 0; index < currentCount; index++) {
				sendArray.push(aesDataView.getUint8(index + packetNum * this.sendDataCount));
			}
			// callBack(sendArray);
		}
		console.log(sendArray,"蓝牙bleWrite")
		// data = this.addProtocol(data);   //在数据的头尾加入协议格式，如0A => FEFD010AFCFB，不同的蓝牙协议应作相应的更改
		//console.log('test_UUID_1', this.peripheralId, this.writeWithResponseServiceUUID[index], this.writeWithResponseCharacteristicUUID[index]);
		return sendArray

	}

	sendHandle(cmd, dataViewParameters, callBack)
	{
		console.log(cmd)
		console.log('加密前数据 CMD:', cmd, 'data', dataViewParameters);
		if (cmd == 0x0C00)
		{
			this.coding.setPktCount();
		}
		var aesBuffer = this.coding.encodingData(cmd, dataViewParameters);
		var aesDataView = new DataView(aesBuffer);
		let totalDataCount = aesDataView.byteLength;
		const packetCount = parseInt((totalDataCount - 1) / this.sendDataCount + 1);

		for (var packetNum = 0; packetNum < parseInt((totalDataCount - 1) / this.sendDataCount + 1); packetNum++) {

			var currentCount = (totalDataCount >= (packetNum + 1) * this.sendDataCount ? this.sendDataCount : totalDataCount - packetNum * this.sendDataCount);
			var sendArray = new Array();
			for (var index = 0; index < currentCount; index++)
			{
				sendArray.push(aesDataView.getUint8(index + packetNum * this.sendDataCount));
			}
			callBack(sendArray);
		}

		// if (Platform.OS == 'android') { // 如果是android使用同步延时的方法进行发送
		//   var packetNum = 0;
		//   var myTinterval;
		//   myTinterval = setInterval(function () {

		//     var currentCount = (totalDataCount >= (packetNum + 1) * this.sendDataCount ? this.sendDataCount : totalDataCount - packetNum * this.sendDataCount)
		//     var sendArray = new Array();
		//     for (var index = 0; index < currentCount; index++) {
		//       sendArray.push(aesDataView.getUint8(index + packetNum * this.sendDataCount));
		//     }
		//     packetNum += 1;
		//     if (packetNum >= packetCount) {
		//       clearInterval(myTinterval);
		//     }
		//     callBack(sendArray);
		//   }, 500);
		// } else {

		//   for (var packetNum = 0; packetNum < parseInt((totalDataCount - 1) / this.sendDataCount + 1); packetNum++) {

		//     var currentCount = (totalDataCount >= (packetNum + 1) * this.sendDataCount ? this.sendDataCount : totalDataCount - packetNum * this.sendDataCount);
		//     var sendArray = new Array();
		//     for (var index = 0; index < currentCount; index++) {
		//       sendArray.push(aesDataView.getUint8(index + packetNum * this.sendDataCount));
		//     }
		//     callBack(sendArray);
		//   }
		// }
	}

	sendHRHandle(cmd, dataViewParameters, callBack)
	{
		console.log(cmd)
		console.log('加密前数据 CMD:', cmd, 'data', dataViewParameters);
		if (cmd == 0x0C00)
		{
			this.coding.setPktCount();
		}
		var aesBuffer = this.coding.encodingHRData(cmd, dataViewParameters);
		var aesDataView = new DataView(aesBuffer);
		let totalDataCount = aesDataView.byteLength;
		const packetCount = parseInt((totalDataCount - 1) / this.sendDataCount + 1);

		for (var packetNum = 0; packetNum < parseInt((totalDataCount - 1) / this.sendDataCount + 1); packetNum++) {

			var currentCount = (totalDataCount >= (packetNum + 1) * this.sendDataCount ? this.sendDataCount : totalDataCount - packetNum * this.sendDataCount);
			var sendArray = new Array();
			for (var index = 0; index < currentCount; index++)
			{
				sendArray.push(aesDataView.getUint8(index + packetNum * this.sendDataCount));
			}
			callBack(sendArray);
		}

		// if (Platform.OS == 'android') { // 如果是android使用同步延时的方法进行发送
		//   var packetNum = 0;
		//   var myTinterval;
		//   myTinterval = setInterval(function () {

		//     var currentCount = (totalDataCount >= (packetNum + 1) * this.sendDataCount ? this.sendDataCount : totalDataCount - packetNum * this.sendDataCount)
		//     var sendArray = new Array();
		//     for (var index = 0; index < currentCount; index++) {
		//       sendArray.push(aesDataView.getUint8(index + packetNum * this.sendDataCount));
		//     }
		//     packetNum += 1;
		//     if (packetNum >= packetCount) {
		//       clearInterval(myTinterval);
		//     }
		//     callBack(sendArray);
		//   }, 500);
		// } else {

		//   for (var packetNum = 0; packetNum < parseInt((totalDataCount - 1) / this.sendDataCount + 1); packetNum++) {

		//     var currentCount = (totalDataCount >= (packetNum + 1) * this.sendDataCount ? this.sendDataCount : totalDataCount - packetNum * this.sendDataCount);
		//     var sendArray = new Array();
		//     for (var index = 0; index < currentCount; index++) {
		//       sendArray.push(aesDataView.getUint8(index + packetNum * this.sendDataCount));
		//     }
		//     callBack(sendArray);
		//   }
		// }
	}


	receiveData(cmd, dataArray, callBack)
	{

		if (dataArray[0] == 165)
		{
			this.isReceiveData = true;
			this.receiveDataArray = new Array();
			this.receiveIndex = 0;
		}
		if (this.isReceiveData)
		{
			dataArray.forEach(v =>
			{
				this.receiveDataArray.push(v);
			})
			this.receiveIndex += dataArray.length;
			if (this.receiveDataArray[1] == this.receiveIndex - 2)
			{ // 接收一条完整的指令
				this.isReceiveData = false;
				var data = this.receiveDataArray.slice(2, this.receiveIndex);
				let v = this.coding.decodingData(data);
				this.dataDistributionMethods(cmd, v, callBack);
			}
		}
		// console.log('transveiver receiveData', cmd );
	}

	receiveHRData(cmd, dataArray, callBack)
	{

		if (dataArray[0] == 165)
		{
			this.isReceiveData = true;
			this.receiveDataArray = new Array();
			this.receiveIndex = 0;
		}
		if (this.isReceiveData)
		{
			dataArray.forEach(v =>
			{
				this.receiveDataArray.push(v);
			})
			this.receiveIndex += dataArray.length;
			if (this.receiveDataArray[1] == this.receiveIndex - 2)
			{ // 接收一条完整的指令
				this.isReceiveData = false;
				var data = this.receiveDataArray.slice(2, this.receiveIndex);
				let v = this.coding.decodingHRData(data);
				this.dataDistributionMethods(cmd, v, callBack);
			}
		}
		// console.log('transveiver receiveData', cmd );
	}

	dataDistributionMethods(cmd, v, callBack)
	{
		console.log("设备回来的数据", v);
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
		case cmd.kGXYL_SetlaserTreatmentStatus:
			console.log(data,'-06行3132')
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
		case cmd.kGXYL_GetLaserRegimenParameters: // 获取激光参数

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
				if (data[6] == 0 && data[7] == 0)
				{// 如果第6、7位为0的情况下表示天数
					body.remainingDays = year;
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
		case cmd.kGXYL_GetManuallyLaserState:
			body.manuallyLaserState = data[0];
			break;
		case cmd.kGXYL_GetBoardCastDuration:
			body.boardCastDuration = data[0];
			break;
		case cmd.kGXYL_BloodPressureCalibration:
			console.log(data, '血压校准的底层')
			body.data = data[0]
			break;
		case cmd.kGXYL_getRealtimeHRData:
			console.log(data, '传输的实时心率血压数据')
			break;
		case cmd.kGXYL_GetRealtimeHeartRateBloodPressure:
			console.log(data, '获取实时心率血压数据')
			body.data = data
			break;
		case cmd.kGXYL_setBloodPressureHR:
			console.log(data, '开关心率血压监测')
			body.data = data[0]
			break;
		case cmd.kGXYL_setHR:
			console.log(data, '开关心率监测')
			break;
		case cmd.kGXYL_RemoveBloodPressureCalibrationData:
			console.log(data, '擦除血压校准数据')
			break;
		case cmd.kGXYL_SetBoardCastDuration:
			console.log(data, '设置的蓝牙广播')
			break;
		case cmd.kGXYL_startDFUBlood:
			console.log(data, '开始血压底层空中升级')
			break;
		case cmd.kGXYL_GetTime:
			console.log(data,"123123")
			var year = data[0] + data[1] * 256;
			var month = data[2];
			var day = data[3];
			var dayOfweek = data[4];
			var hour = data[5];
			var min = data[6];
			var second = data[7];
			body.time = year + "-" + month + "-"
				+ day + " " + hour + ":" +  min + ":" + second
				+ " " + '周' + dayOfweek
			break;
		case cmd.kGXYL_RealtimeIsOpen:
			console.log(data, 'shishixinlv1')
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
			body.treatmentStatus = data[0];
			body.remainDays = data[1];
			break;
		default:
			break;
		}
		dic.cmd = v.cmd;
		dic.body = body;
		callBack(dic);
	}
}

