/**
 * 蓝牙应用类
 */

import * as cmd from '../cmd'
export default class Applicat
{
	constructor()
	{

	}

	/**获取设备时间 */
	getTime(ble, id)
	{
		return new Promise((resolve, reject) => {
			var timeBuffer = new ArrayBuffer(0);
			var timeDataView = new DataView(timeBuffer);
			// 发送数据
			console.log(timeDataView, '获取时间的参数')
			ble.write(cmd.kGXYL_GetTime, timeDataView, '发送时间获取指令', id)
				.then(() =>
				{
					resolve()
				})
				.catch(error =>
				{
					reject(error)
				})
		})
	}
	/**
	 * [syncTime 同步时间]
	 * @Author   袁进
	 * @DateTime 2018-11-23T10:06:45+0800
	 * @param    {[Object]}                 ble [蓝牙类实例]
	 * @param    {[String]}                 id  [连接的设备id]
	 * @return   {[type]}                     [description]
	 */
	syncTime(ble, id)
	{
		return new Promise((resolve, reject) =>
		{
			var timestamp2 = new Date("2017/1/1 00:00:00").getTime() / 1000;// 2017/1/1的秒数
			var timestamp = parseInt(new Date().getTime() / 1000 - timestamp2); //本地时区相差得秒数

			var timeBuffer = new ArrayBuffer(4);
			var timeDataView = new DataView(timeBuffer);
			timeDataView.setUint8(0, timestamp & 0x000000FF);
			timeDataView.setUint8(1, (timestamp & 0x0000FF00) >> 8);
			timeDataView.setUint8(2, (timestamp & 0x00FF0000) >> 16);
			timeDataView.setUint8(3, (timestamp & 0xFF000000) >> 24);
			// 发送数据
			console.log(timeDataView, '同步时间的参数')
			ble.write(cmd.kGXYL_TimeSync, timeDataView, '发送时间同步指令', id)
				.then(() =>
				{
					resolve()
				})
				.catch(error =>
				{
					reject(error)
				})
		})
	}

	syncTimeForHA01Y(ble, id)
	{
		return new Promise((resolve, reject) => {
			// 设置日期
			var timestamp2 = new Date("2017/1/1 00:00:00").getTime() / 1000;// 2017/1/1的秒数
			var timestamp = parseInt(new Date().getTime() / 1000 - timestamp2); //本地时区相差得秒数
			var timeBuffer = new ArrayBuffer(4);
			var timeDataView = new DataView(timeBuffer);
			timeDataView.setUint8(0, timestamp & 0x000000FF);
			timeDataView.setUint8(1, (timestamp & 0x0000FF00) >> 8);
			timeDataView.setUint8(2, (timestamp & 0x00FF0000) >> 16);
			timeDataView.setUint8(3, (timestamp & 0xFF000000) >> 24);
			// 发送数据
			console.log(timeDataView, '同步时间的参数')
			ble.write(cmd.kGXYL_TimeSync, timeDataView, '发送时间同步指令', id)
				.then(() => {
					resolve()
				})
				.catch(error => {
					reject(error)
				})
		})
	}
	/**
	 * [getEQ 获取电量]
	 * @Author   袁进
	 * @DateTime 2018-11-23T10:07:54+0800
	 * @param    {[Object]}                 ble [蓝牙类实例]
	 * @param    {[String]}                 id  [连接的设备id]
	 * @return   {[type]}                     [description]
	 */
	getEQ(ble, id)
	{
		return new Promise((resolve, reject) =>
		{

			var timeBuffer = new ArrayBuffer(0);
			var dataView = new DataView(timeBuffer);
			ble.write(cmd.kGXYL_GetEQ, dataView, '发送获取电量指令', id)
				.then(() =>
				{
					resolve()
				})
				.catch(error =>
				{
					reject(error)
				})
		})
	}
	/**
	 * [setLaserManuallyPaymentDuration 设置手动激光付费参数]
	 * @Author   袁进
	 * @DateTime 2018-11-23T10:08:22+0800
	 * @param    {[Number]}                 duration [手动激光总时长]
	 * @param    {[Object]}                 ble      [蓝牙类实例]
	 * @param    {[String]}                 deviceId [连接的设备id]
	 */
	setLaserManuallyPaymentDuration(duration,ble,deviceId) {
		return new Promise((resolve,reject) => {

			var timeBuffer = new ArrayBuffer(4);
			var dataView = new DataView(timeBuffer);
			dataView.setUint8(0, duration & 0x000000FF);
			dataView.setUint8(1, (duration & 0x0000FF00) >> 8);
			dataView.setUint8(2, (duration & 0x00FF0000) >> 16);
			dataView.setUint8(3, (duration & 0xFF0000FF) >> 24);
			ble.write(cmd.kGXYL_LaserManuallyPayParameters,dataView,'发送设置激光手动的付费时长指令',deviceId)
				.then(() => {
					resolve()
				})
				.catch(error => {
					reject(error)
				})
		})
	}
	/**
	 * [getLaserManuallyParameters 获取手动激光参数]
	 * @Author   袁进
	 * @DateTime 2018-11-23T10:09:00+0800
	 * @param    {[Object]}                 ble      [蓝牙类实例]
	 * @param    {[String]}                 deviceId [连接的设备id]
	 * @return   {[type]}                          [description]
	 */
	getLaserManuallyParameters(ble,deviceId) {
		return new Promise((resolve,reject) => {


			var timeBuffer = new ArrayBuffer(0);
			var dataView = new DataView(timeBuffer);
			ble.write(cmd.kGXYL_GetLaserManuallyParameters,dataView,'发送获取手动激光指令',deviceId)
				.then(() => {
					resolve()
				})
				.catch(error => {
					reject(error)
				})
		})
	}
	/**
	 * [setLaserManuallyParameters 设置手动激光参数]
	 * @Author   袁进
	 * @DateTime 2018-11-23T10:09:48+0800
	 * @param    {[Number]}                 power    [功率]
	 * @param    {[Number]}                 duration [持续时间]
	 * @param    {[Object]}                 ble      [蓝牙类实例]
	 * @param    {[String]}                 deviceId [连接的设备id]
	 */
	setLaserManuallyParameters(power, duration,ble,deviceId) {
		return new Promise((resolve,reject) => {

			var timeBuffer = new ArrayBuffer(2);
			var dataView = new DataView(timeBuffer);
			dataView.setUint8(0, power);
			dataView.setUint8(1, duration);
			ble.write(cmd.kGXYL_LaserManuallyParameters,dataView,'设置手动激光参数',deviceId)
				.then(() => {
					resolve()
				})
				.catch(error => {
					reject(error)
				})
		})
	}
	/**
	 * [getManuallyHRState 获取手动心率开启状态]
	 * @Author   袁进
	 * @DateTime 2018-11-23T10:10:21+0800
	 * @param    {[Object]}                 ble      [蓝牙类实例]
	 * @param    {[String]}                 deviceId [连接的设备id]
	 * @return   {[type]}                          [description]
	 */
	getManuallyHRState(ble,deviceId) {
		return new Promise((resolve,reject) => {

			var timeBuffer = new ArrayBuffer(0);
			var dataView = new DataView(timeBuffer);
			ble.write(cmd.kGXYL_GetManuallyHRState,dataView,'发送获取手动心率开关状态指令',deviceId)
				.then(() => {
					resolve()
				})
				.catch(error => {
					reject(error)
				})
		})
	}
	/**
	 * [getAutoHRState 获取自动心率开启状态]
	 * @Author   袁进
	 * @DateTime 2018-11-23T10:11:52+0800
	 * @param    {[Object]}                 ble      [蓝牙类实例]
	 * @param    {[String]}                 deviceId [连接的设备id]
	 * @return   {[type]}                          [description]
	 */
	getAutoHRState(ble,deviceId) {
		return new Promise((resolve,reject) => {

			var timeBuffer = new ArrayBuffer(0);
			var dataView = new DataView(timeBuffer);
			ble.write(cmd.kGXYL_GetAutoHRState,dataView,'发送获取自动心率开关指令',deviceId)
				.then(() => {
					resolve()
				})
				.catch(error => {
					reject(error)
				})
		})
	}
	/**
	 * [getManuallyLaserState 获取手动激光开启状态]
	 * @Author   袁进
	 * @DateTime 2018-11-23T10:12:07+0800
	 * @param    {[Object]}                 ble      [蓝牙类实例]
	 * @param    {[String]}                 deviceId [连接的设备id]
	 * @return   {[type]}                          [description]
	 */
	getManuallyLaserState(ble,deviceId) {
		return new Promise((resolve,reject) => {


			var timeBuffer = new ArrayBuffer(0);
			var dataView = new DataView(timeBuffer);
			ble.write(cmd.kGXYL_GetManuallyLaserState,dataView,'发送获取手动激光开关状态令',deviceId)
				.then(() => {
					resolve()
				})
				.catch(error => {
					reject(error)
				})
		})
	}
	/**
	 * [isOpenLaserAction 开关手动激光]
	 * @Author   袁进
	 * @DateTime 2018-11-23T10:12:24+0800
	 * @param    {Boolean}                isOpen     [true:开启手动激光,false:关闭手动激光]
	 * @param    {[Object]}                 ble      [蓝牙类实例]
	 * @param    {[String]}                 deviceId [连接的设备id]
	 * @return   {Boolean}                           [description]
	 */
	isOpenLaserAction(isOpen,ble,deviceId) {
		return new Promise((resolve,reject) => {
			var buffer = new ArrayBuffer(1);
			var dataView = new DataView(buffer);
			isOpen == true ? dataView.setUint8(0, 1) : dataView.setUint8(0, 0);
			ble.write(cmd.kGXYL_LaserIsOpen,dataView,'开关手动激光',deviceId)
				.then(() => {
					resolve()
				})
				.catch(error => {
					reject(error)
				})
		})
	}
	/**
	 * [isOpenHrAction 开关手动心率]
	 * @Author   袁进
	 * @DateTime 2018-11-23T10:15:38+0800
	 * @param    {Boolean}                isOpen   [true:开启手动心率,false:关闭手动心率]
	 * @param    {Object}                 ble      [蓝牙类实例]
	 * @param    {String}                 deviceId [连接的设备id]
	 * @return   {Boolean}                         [description]
	 */
	isOpenHrAction(isOpen,ble,deviceId) {
		return new Promise((resolve,reject) => {

			var buffer = new ArrayBuffer(1);
			var dataView = new DataView(buffer);
			isOpen ? dataView.setUint8(0, 1) : dataView.setUint8(0, 0);
			ble.write(cmd.kGXYL_HRManuallyIsOpen,dataView,'开关手动心率',deviceId)
				.then(() => {
					resolve()
				})
				.catch(error => {
					reject(error)
				})
		})
	}

	/**
	 * [isOpenAutoHrAction 开关自动心率]
	 * @Author   袁进
	 * @DateTime 2018-11-23T10:16:48+0800
	 * @param    {Boolean}                isOpen   [true:开启自动心率,false:关闭自动心率]
	 * @param    {Object}                 ble      [蓝牙类实例]
	 * @param    {String}                 deviceId [连接的设备id]
	 * @return   {Boolean}                         [description]
	 */
	isOpenAutoHrAction(isOpen, ble, deviceId)
	{
		return new Promise((resolve, reject) =>
		{

			var buffer = new ArrayBuffer(1);
			var dataView = new DataView(buffer);
			isOpen == true ? dataView.setUint8(0, 1) : dataView.setUint8(0, 0);
			ble.write(cmd.kGXYL_HRAutomaticallIsOpen,dataView,'开关自动心率',deviceId)
				.then(() => {
					resolve()
				})
				.catch(error => {
					reject(error)
				})
		})
	}
	/**
	 * [isOpenRealtimeData 开关实时心率]
	 * @Author   袁进
	 * @DateTime 2018-11-23T10:17:28+0800
	 * @param    {Boolean}                isOpen   [true:开启实时心率,false:关闭实时心率]
	 * @param    {Object}                 ble      [蓝牙类实例]
	 * @param    {String}                 deviceId [连接的设备id]
	 * @return   {Boolean}                         [description]
	 */
	isOpenRealtimeData(isOpen,ble,deviceId) {
		return new Promise((resolve,reject) => {

			var buffer = new ArrayBuffer(1);
			var dataView = new DataView(buffer);
			isOpen ? dataView.setUint8(0, 1) : dataView.setUint8(0, 0);
			ble.write(cmd.kGXYL_RealtimeIsOpen,dataView,'打开/关闭实时数据',deviceId)
				.then(() => {
					resolve()
				})
				.catch(error => {
					reject(error)
				})
		})
	}
	/**
	* [setLaserTreatmentParameters 设置激光疗程参数]
	* @Author   袁进
	* @DateTime 2018-11-28T11:46:37+0800
	* @param    {[type]}                 treatment [description]
	*/
	setLaserTreatmentParameters(treatment, ble, deviceId)
	{
		return new Promise((resolve, reject) =>
		{
			console.log(treatment.index, '使用的疗程');

			var length = treatment.parameters.length * 4 + 8;
			var dataBuffer = new ArrayBuffer(length);
			var dataView = new DataView(dataBuffer);
			console.log(treatment.index, treatment.parameters, "CANSHU1")
			var parameterArray = treatment.parameters;// 参数列表
			dataView.setUint8(0, treatment.index);// 序号
			dataView.setUint8(1, parameterArray.length);// 参数列表个数
			dataView.setUint8(2, treatment.periodic);// 开启周期
			dataView.setUint8(3, treatment.gap);// 关闭周期
			var endDate = treatment.endDate;
			if (endDate != undefined)
			{
				var arr = endDate.split("-");
				console.log(arr.length, "截止时间的长度")
				if (arr.length  == 3)
				{
					const year = parseInt(arr[0]);
					dataView.setUint8(4, year % 256);
					dataView.setUint8(5, year / 256);
					dataView.setUint8(6, parseInt(arr[1]));
					dataView.setUint8(7, parseInt(arr[2]));
				}
				else
				{
					const year = parseInt(endDate);
					dataView.setUint8(4, year % 256);
					dataView.setUint8(5, year / 256);
					dataView.setUint8(6, 0);
					dataView.setUint8(7, 0);
				}


			}
			else
			{
			// console.log("疗程天数出错")
				return
			}

			// 拼接参数列表里的参数
			parameterArray.forEach((parameter, index) =>
			{
				dataView.setUint8(8 + index * 4 + 0, parameter.power);
				dataView.setUint8(8 + index * 4 + 1, parameter.duration);
				dataView.setUint8(8 + index * 4 + 2, parameter.startHour);
				dataView.setUint8(8 + index * 4 + 3, parameter.startMinute);
			})

			ble.write(cmd.kGXYL_LaserRegimenParameters, dataView, '设置激光疗程', deviceId)
				.then(() =>
				{
					resolve()
				})
				.catch(error =>
				{
					reject(error)
				})
		})
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
	getLaserTreatmentParameters(ble, deviceId)
	{
		return new Promise((resolve, reject) =>
		{
			var dataBuffer = new ArrayBuffer(0)
			var dataView = new DataView(dataBuffer);
			ble.write(cmd.kGXYL_GetLaserRegimenParameters, dataView, '设置激光疗程成功', deviceId)
				.then(() => {
					resolve()
				})
				.catch(error => {
					reject(error)
				})
		})
	}
	/**
 * 设置表指针时间
 *
 * dic: type, hour, minute, sec
 * type: 1为设置小时和分钟的，0为设置微调
 */
	setPointer(dic,ble,deviceId) {
		return new Promise((resolve,reject) => {


			var timeBuffer = new ArrayBuffer(3);
			var dataView = new DataView(timeBuffer);
			if (dic.type + '' == "1" && dic.hour + '' != "null" && dic.minute + '' != "null") {

				dataView.setInt8(0, parseInt(dic.type));
				dataView.setUint8(1, parseInt(dic.hour));
				dataView.setInt8(2, parseInt(dic.minute));
			} else if (dic.type + '' == "0" && dic.sec + '' != "null") {

				dataView.setInt8(0, parseInt(dic.type));
				dataView.setUint8(1, parseInt(dic.value % 256));
				dataView.setInt8(2, parseInt(dic.value / 256));
			}
			ble.write(cmd.kGXYL_setPointer,dataView,'设置表指针时间',deviceId)
				.then(() => {
					resolve()
				})
				.catch(error => {
					reject(error)
				})
		})
	}

/**
     *
     * @param {设置表盘指针} dic
	 * dic.type 0时针， 1分针 2秒针
	 * dic.second  刻度
     * 06x指针
     */
	async setNewPointer(dic, ble, deviceId)
	{
		// var remainder = dic.minute % 12;
		// var specific = remainder < 6 ? 0 : 1
		// var conversion = dic.hour * 5 + parseInt(dic.minute / 12) + specific;
		var conversion = parseInt(dic.hour);

		var timeBuffer, dataView, timeBuffer1, dataView1;
		try
		{
			console.log(dic, '06x指针校准')

			timeBuffer = new ArrayBuffer(4);
			dataView = new DataView(timeBuffer);
			timeBuffer1 = new ArrayBuffer(4);
			dataView1= new DataView(timeBuffer1);

			dataView.setInt8(0, 1);
			dataView.setUint8(1, 0);
			dataView.setInt8(2, 0);
			dataView.setInt8(3, 1);
			const res1 = await ble.write(cmd.kGXYL_setNewPointer, dataView, '设置表指针开始时', deviceId)

			dataView.setInt8(0, 2);
			dataView.setUint8(1, 0);
			dataView.setInt8(2, 0);
			dataView.setInt8(3, 1);
			const res2 = await ble.write(cmd.kGXYL_setNewPointer, dataView, '设置表指针运行时', deviceId)


			dataView1.setInt8(0, 1);
			dataView1.setUint8(1, 1);
			dataView1.setInt8(2, 0);
			dataView1.setInt8(3, 1);
			const res3 = await ble.write(cmd.kGXYL_setNewPointer,dataView1, '设置表分针开始时间', deviceId)
			dataView1.setInt8(0, 2);
			dataView1.setUint8(1, 1);
			dataView1.setInt8(2, 0);
			dataView1.setInt8(3, 1);
			const res4 = await ble.write(cmd.kGXYL_setNewPointer,dataView1, '设置表分针针运行时间', deviceId)

			var params = {
				type: 1,
				hour: conversion,
				minute: dic.minute,
			}
			this.setPointer(params, ble, deviceId);

			dataView.setInt8(0, 0);
			dataView.setUint8(1, 0);
			dataView.setInt8(2, 0);
			dataView.setInt8(3, 1);
			const res5 = await ble.write(cmd.kGXYL_setNewPointer,dataView, '设置表指针时针结束', deviceId)

			dataView1.setInt8(0, 0);
			dataView1.setUint8(1, 1);
			dataView1.setInt8(2, 0);
			dataView1.setInt8(3, 1);
			const res6 = await ble.write(cmd.kGXYL_setNewPointer,dataView1, '设置表分针结束', deviceId)



		}
		catch (error)
		{
			console.log(error)
			return error
		}
	}

	/**
	 * [getDeviceInfo 获取设备信息]
	 * @Author   袁进
	 * @DateTime 2019-01-11T19:36:43+0800
	 * @return   {[type]}                 [description]
	 */
	getDeviceInfo(ble, deviceId)
	{
		return new Promise((resolve, reject) =>
		{
			var timeBuffer = new ArrayBuffer(0);
			var dataView = new DataView(timeBuffer);
			ble.write(cmd.kGXYL_GetDeviceInfo,dataView,'获取设备信息',deviceId)
				.then(() => {
					resolve()
				})
				.catch(error => {
					reject(error)
				})
		})
	}

	/**
	 * [startDFU 开始空中升级]
	 * @Author   袁进
	 * @DateTime 2019-02-18T14:43:47+0800
	 * @param    {[type]}                 ble      [description]
	 * @param    {[type]}                 deviceId [description]
	 * @return   {[type]}                          [description]
	 */
	startDFU(ble, deviceId)
	{
		return new Promise((resolve, reject) =>
		{
			var timeBuffer = new ArrayBuffer(0);
			var dataView = new DataView(timeBuffer);
			ble.writeDFU(cmd.KGXYL_startDFU, dataView, '启动空中升级', deviceId)
				.then(() =>
				{
					resolve()
				})
				.catch(err =>
				{
					reject(err)
				})
		})
	}

	/**
	 * [getTreatmentStatus 获取激光疗程周期]
	 * @Author   袁进
	 * @DateTime 2019-03-13T14:49:20+0800
	 * @param    {[type]}                 ble      [description]
	 * @param    {[type]}                 deviceId [description]
	 * @return   {[type]}                          [description]
	 */
	getTreatmentStatus(ble,deviceId)
	{
		return new Promise((resolve,reject) => {
			var buffer = new ArrayBuffer(0);
			var dataView = new DataView(buffer);
			ble.write(cmd.kGXYL_GetlaserTreatmentStatus,dataView,'获取激光疗程状态',deviceId)
				.then(() => {
					resolve()
				})
				.catch(err => {
					reject(err)
				})
		})
	}

	/**
	 * [setTreatmentStatus 设置激光疗程周期]
	 * @Author   袁进
	 * @DateTime 2019-03-13T14:51:10+0800
	 * @param    {[type]}                 dic      [description]
	 * @param    {[type]}                 ble      [description]
	 * @param    {[type]}                 deviceId [description]
	 */
	// eslint-disable-next-line no-unreachable
	setTreatmentStatus(dic,ble,deviceId)
	{
		return new Promise((resolve,reject) => {

			var buffer = new ArrayBuffer(2);
			var dataView = new DataView(buffer);
			dataView.setInt8(0, parseInt(dic.isOpen));
			dataView.setInt8(1, parseInt(dic.remainDays));
			ble.write(cmd.kGXYL_SetlaserTreatmentStatus,dataView,'设置激光疗程状态',deviceId)
				.then(() => {
					resolve()
				})
				.catch(err => {
					reject(err)
				})
		})
	}

	//设置蓝牙长连接
	async setBroadcastDuration(duration, ble, deviceId)
	{
		try
		{
			var buffer = new ArrayBuffer(1);
			var dataView = new DataView(buffer);
			dataView.setUint8(0, duration);
			var res = await ble.write(cmd.kGXYL_SetBoardCastDuration, dataView, '设置蓝牙广播时长', deviceId);
			var state = {state: "设置成功", };
			return state;
		}
		catch (error)
		{
			var ss = {state: '设置·失败', error: error, }
			return ss;
		}
	}

	//获取蓝牙长广播
	getBroadcastDuration(ble, deviceId)
	{
		return new Promise((resolve, reject) =>
		{
			var buffer = new ArrayBuffer(0);
			var dataView = new DataView(buffer);
			ble.write(cmd.kGXYL_GetBoardCastDuration, dataView, '获取蓝牙广播时长', deviceId)
				.then(() =>
				{
					resolve()
				})
				.catch(err =>
				{
					reject(err)
				})
		})
	}

	//开启，暂停激光疗程
	async setLaserRegimen(isOpen, ble, deviceId)
	{
		try
		{
			console.log(isOpen, '设置激光疗程暂停');

			var timeBuffer = new ArrayBuffer(1);
			var dataView = new DataView(timeBuffer);
			isOpen == true ? dataView.setInt8(0, 1) : dataView.setInt8(0, 0);
			var res = await ble.write(cmd.kGXYL_setLaserRegimen, dataView, '设置激光疗程开启暂停', deviceId);
			var state = {state: "设置成功", };
			return state;
		}
		catch (error)
		{
			console.log(error)
			state = {state: "设置失败", };
			return state;
		}
	}

}
