/**
 * 从蓝牙获取运动，激光，心率数据
 */
import * as cmd from '../../cmd'

/**
 * [getMotionData 获取运动数据]
 * @Author   袁进
 * @DateTime 2018-11-23T11:13:50+0800
 * @param    {Number}                 year  [年]
 * @param    {Number}                 month [月]
 * @param    {Number}                 day   [日]
 * @param    {Object}                 ble   [蓝牙类的实例]
 * @return   {[type]}                       [description]
 */
export function getMotionData(year, month, day, ble, id) {

	if (year == undefined || month == undefined || day == undefined) {
		return
	}
	var buffer = new ArrayBuffer(4);
	var dataView = new DataView(buffer);
	dataView.setUint8(0, parseInt(year % 256));
	dataView.setUint8(1, parseInt(year / 256));
	dataView.setUint8(2, parseInt(month));
	dataView.setUint8(3, parseInt(day));
	console.log('来了，老弟')
	ble.write(cmd.kGXYL_GetMotionRecording,dataView,'获取运动数据',id)

}
/**
 * [getHrData 获取心率数据]
 * @Author   袁进
 * @DateTime 2018-11-23T11:15:01+0800
 * @param    {Number}                 year  [年]
 * @param    {Number}                 month [月]
 * @param    {Number}                 day   [日]
 * @param    {Object}                 ble   [蓝牙类的实例]
 * @param    {Number}                 startIndex [获取数据的起始位置]
 * @param    {Number}                 length     [数据的长度]
 * @return   {[type]}                            [description]
 */
export function getHrData(ble,id, year, month, day, startIndex, length) {

	if (year == undefined || month == undefined || day == undefined) {
		return
	}
	var startIndex1 = startIndex || 0;
	var length1 = length || 100;

	var buffer = new ArrayBuffer(6);
	var dataView = new DataView(buffer);
	dataView.setUint8(0, parseInt(year % 256));
	dataView.setUint8(1, parseInt(year / 256));
	dataView.setUint8(2, parseInt(month));
	dataView.setUint8(3, parseInt(day));
	dataView.setUint8(4, parseInt(startIndex1));
	dataView.setUint8(5, parseInt(length1));
	console.log('laoge11111')
	ble.write(cmd.kGXYL_GetHRRecording,dataView,'获取心率数据',id)

}
/**
 * [getLaserData 获取激光数据]
 * @Author   袁进
 * @DateTime 2018-11-23T11:16:27+0800
 * @param    {Number}                 year  [年]
 * @param    {Number}                 month [月]
 * @param    {Number}                 day   [日]
 * @param    {Object}                 ble   [蓝牙类的实例]
 * @param    {Number}                 startIndex [获取数据的起始位置]
 * @param    {Number}                 length     [数据的长度]
 * @return   {[type]}                            [description]
 */
export function getLaserData(ble,id, year, month, day, startIndex, length) {

	if (year == undefined || month == undefined || day == undefined) {
		return
	}
	var startIndex1 = startIndex || 0;
	var length1 = length || 120;

	var buffer = new ArrayBuffer(6);
	var dataView = new DataView(buffer);
	dataView.setUint8(0, parseInt(year % 256));
	dataView.setUint8(1, parseInt(year / 256));
	dataView.setUint8(2, parseInt(month));
	dataView.setUint8(3, parseInt(day));
	dataView.setUint8(4, parseInt(startIndex1));
	dataView.setUint8(5, parseInt(length1));
	console.log('laoge')
	ble.write(cmd.kGXYL_GetLaserRecording,dataView, '获取激光数据',id)
}