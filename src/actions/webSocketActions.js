import {CONNECTCLOSE, CONNECTFALL, CONNECTSUCCESS, SENDMSG, RETURNMSG, SEND, } from '../constants/webSocketTypes'

export const wsconnectclose =  ()  => ({ type: CONNECTCLOSE});
export const connectsuccess =  ()  => ({ type: CONNECTSUCCESS});
export const connectfall =  ()  => ({ type: CONNECTFALL});
export const sendmsg =  (sendmsg)  => ({ type: SENDMSG,sendmsg:sendmsg});
export const wsmsgres =  (msgstr)  => ({ type: RETURNMSG,msgstr:msgstr});
export const send = (msg) => ({type: SEND, msg: msg, })
var ws = null; // 缓存 websocket连接
var socketId = null;

/**
 * 
 * @param {连接socket} id 
 */
export function connectWebsocket(id)
{
	console.log(id, '长连接的id');
	return dispatch => 
	{
		if (!id) 
		{
			return;
		} 
		// if (ws)
		// {
		// 	dispatch(connectsuccess())
		// 	return;
		// }
		// else
		// {
		// 	// ws = new WebSocket("wss://www.shixiaoli.com/wss?uid=" + id); //测试线
		// 	ws = new WebSocket("wss://ws.sharemedical.vip/wss?uid=" + id); //正式线
		// }
		ws = new WebSocket("wss://ws.sharemedical.vip/wss?uid=" + id); //正式线
		console.log(id, '新的id')
		socketId = id;
		ws.onopen = () => 
		{
			console.log("连接成功")
			dispatch(connectsuccess())
		};
		ws.onerror = e => 
		{
			dispatch(connectfall())
		};
		ws.onmessage = e => {
			var data = JSON.parse(e.data);
			console.log(data, "收到的内容")
			dispatch(wsmsgres(data))
		};
		ws.onclose = e => {
			// connection closed
			connectWebsocket(socketId);
			dispatch(connectfall())
		};
	}
}


/**
 * 
 * @param {发送消息} s 
 */
export function sendMessage(sn, underGuardian, guardian, title, type=0, index=0, device_sn=0)
{
	var message = {
		action: "remoteOperation",
		param: { sn: sn, underGuardian: underGuardian, guardian: guardian, title: title, device_sn: device_sn, guardianDeviceSn: device_sn, }
	}
	console.log(message, '阿萨达说')
	return dispatch => 
	{
		if (ws)
		{
			if (sn == 4)
			{
				message.param.type = type;
				message.param.url = '健康管理';
				message.param.index = index;
				message.param.guardianDeviceSn = device_sn;
			}
			else if (sn == 6)
			{
				message.param.type = type;
				message.param.url = "空中升级";
				message.param.firmWare = index;
			}
			ws.send(JSON.stringify(message))
			dispatch(send("发送成功"))
		}
		else
		{
			dispatch(send("发送失败"))
		}
	}
}

//实时心率数据
export function realTimeSend(sn, underGuardian, guardian, heartRate) 
{
	var message = {
		action: "remoteOperation",
		param: { sn: sn, underGuardian: underGuardian, guardian: guardian, heartRate: heartRate }
	}
	console.log('实时', message)
	return dispatch => 
	{
		try {
			if (ws)
			{
				ws.send(JSON.stringify(message))
				dispatch(send("发送成功"))
			}
			else
			{
				dispatch(send("发送失败"))
			}
		} catch (error) {
			dispatch(send("发送失败"))
		}
	}
}
//健康服务
export function serviceSend(sn, underGuardian, guardian, title, url, type, index, phone) 
{
	var message = {
		action: "remoteOperation",
		param: { sn: sn, underGuardian: underGuardian, guardian: guardian, title: title, }
	}
	if (sn == 5) 
	{
		message.param.url = url;
		message.param.type = type;
		message.param.index = index;
	}
	if (index <= 0)
	{
		message.param.phone = phone
	}
	console.log('健康服务', message)
	return dispatch => 
	{
		if (ws)
		{
			ws.send(JSON.stringify(message))
			dispatch(send("发送成功"))
		}
		else
		{
			dispatch(send("发送失败"))
		}
	}
}

//发送激光指令
export function laserSend(sn, underGuardian, guardian, title, url, type, parameter) {
	var message = {
		action: "remoteOperation",
		param: { sn: sn, underGuardian: underGuardian, guardian: guardian, title: title }
	}
	if (sn == 8) 
	{
		message.param.url = url;
		message.param.type = type;
		message.param.parameter = parameter;
	}
	console.log('健康服务', message)
	return dispatch => 
	{
		if (ws)
		{
			ws.send(JSON.stringify(message))
			dispatch(send("发送成功"))
		}
		else
		{
			dispatch(send("发送失败"))
		}
	}
}

export function selectSend(sn, underGuardian, guardian, title, url, type, selectSn, deviceInfo, index) {
	var message = {
		action: "remoteOperation",
		param: { sn: sn, underGuardian: guardian, guardian: underGuardian, title: title }
	}
	if (sn == 7) 
	{
		message.param.url = url;
		message.param.type = type;
		message.param.selectSn = selectSn;
		message.param.deviceInfo = deviceInfo;
		message.param.index = index;
	}
	console.log('健康服务', message)
	return dispatch => 
	{
		if (ws)
		{
			ws.send(JSON.stringify(message))
			dispatch(send("发送成功"))
		}
		else
		{
			dispatch(send("发送失败"))
		}
	}
}

export function deviceSend(sn, underGuardian, guardian, title, url, type, index, name) {
	var message = {
		action: "remoteOperation",
		param: { sn: sn, underGuardian: underGuardian, guardian: guardian, title: title }
	}
	if (sn == 7) 
	{
		message.param.url = url;
		message.param.type = type;
	}
	if (index >= 0)
	{
		message.param.index = index;
	}
	if (name)
	{
		message.param.name = name;
	}
	console.log('绑定解绑设备', message)
	return dispatch => 
	{
		if (ws)
		{
			console.log(message, "sn== 7")
			ws.send(JSON.stringify(message))
			dispatch(send("发送成功"))
		}
		else
		{
			dispatch(send("发送失败"))
		}
	}
}

export function bletoolSend(sn, underGuardian, guardian, title, url, type, status, devices) 
{
	var message = {
		action: "remoteOperation",
		param: { sn: sn, underGuardian: underGuardian, guardian: guardian, title: title, }
	}
	if (sn == 8 || sn == 12) 
	{
		message.param.url = url;
		message.param.type = type;
	}
	if (status)
	{
		message.param.status = status;
	}
	else
	{
		message.param.status = 0
	}
	
	if (devices) 
	{
		message.param.devices = devices
	}
	console.log('绑定解绑设备', message)
	return dispatch => 
	{
		if (ws)
		{
			ws.send(JSON.stringify(message))
		}
		else
		{
			dispatch(send("发送失败"))
		}
	}
}

/**空中升级指令 */
export function airSend(sn, underGuardian, guardian, title, type,) 
{
	var message = {
		action: "remoteOperation",
		param: { sn: sn, underGuardian: underGuardian, guardian: guardian, title: title, }
	}
	if (sn == 6) 
	{
		message.param.type = type;
	}
	console.log('绑定解绑设备', message)
	return dispatch => 
	{
		if (ws)
		{
			ws.send(JSON.stringify(message))
			dispatch(send("发送成功"))
		}
		else
		{
			dispatch(send("发送失败"))
		}
	}
}

/**
 * 处理收到的消息
 */


/**
  * 监护的loadinng状态
  */
export function remoteLoading(status, text)
{
	return {
		type: 'REMOTE_LOADING',
		status,
		text,
	}
}


//多设备连接
export function multipleSend(sn, underGuardian, guardian, title, url, type, devices)
{
	var message = {
		action: "remoteOperation",
		param: { sn: sn, underGuardian: guardian, guardian: underGuardian, title: title, }
	}
	if (sn == 12) 
	{
		message.param.url = url;
		message.param.type = type;
	}
	if (devices) 
	{
		message.param.devices = devices;
	}

	console.log('健康服务', message)
	return dispatch => 
	{
		if (ws)
		{
			ws.send(JSON.stringify(message))
			dispatch(send("发送成功"))
		}
		else
		{
			dispatch(send("发送失败"))
		}
	}
}

export function bleGuardian(guardian)
{
	console.log(guardian, '信息2312312211')
	return dispatch => 
	{
		dispatch({
			type: 'BE_GUARDIAN',
			guardian: guardian,
		})
	}
	
}