/**
 * @author lam
 */
'use strict';

import React, {Component, } from 'react'
import {
	Text,
	View,
	ScrollView,
	StyleSheet,
	StatusBar,
	Dimensions, BackHandler,
	TouchableOpacity,
} from 'react-native'
import NavBar from '../../common/NavBar'
import Item from '../../common/Item'
import { connect, } from 'react-redux'
import * as bleActions from "../../actions/device/bleActions";
import * as webSocketActions from '../../actions/webSocketActions';
import Toast, { DURATION, } from 'react-native-easy-toast'
import {statusBarHeight, height, width, } from '../../utils/uiHeader';
import Icon from "react-native-vector-icons/Ionicons";
//FontAwesome
class LaserMeasurePage extends Component
{
	static navigationOptions = {
		header: null,
	}
	constructor(props)
	{
		super(props);
		this.state = {
			isRefreshing: false,
			avatarSource: null,
			power: [1, 2, 3, 4, ],
			duration: [8, 16, ],
			durationSecond: [24,32, ],
			toolPeopleText: "",
			toolPlaceText: "",
			powerValue: this.props.LASER_POWER ? this.props.LASER_POWER.power : 4,
			durationValue: this.props.LASER_POWER ? this.props.LASER_POWER.duration : 24,
			laserText: '开启激光',
			socketMsg: this.props.socketMsg,
			parameter: new Object(),
			guardian: this.props.guardian,
			user: this.props.user,

		};
	}
	componentWillMount()
	{
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount()
	{
		var guardian = this.state.guardian;
		console.log(guardian, '监护人1212', this.props.guardian)
		if (guardian)
		{
			this.guardian = guardian
			var manuallyLaserState = this.props.navigation.state.params.status;
			this.setState({
				manuallyLaserState: manuallyLaserState,
			})
		}
		else
		{

			if (this.props.socketMsg)
			{
				//传参数给监护人
				var params = new Object();
				if (this.props.LASER_POWER)
				{
					params.power = this.props.LASER_POWER.power;
				}
				else
				{
					params.power = 4;
				}
				if (this.props.LASER_POWER)
				{
					params.time = this.props.LASER_POWER.duration;
				}
				else
				{
					params.time = 24;
				}
				params.duration = 10000;
				console.log(this.props.socketMsg, '发送回复给监护人')
				this.props.realTimeSend(11, this.props.socketMsg.guardian, this.props.socketMsg.underGuardian, params)
			}
			this.props.getManuallyLaserState(this.onGetCallback);

		}
		if (this.props.LASER_POWER.power == 1)
		{
			this.setState({
				toolPeopleText: '体质偏弱，皮肤偏薄血管较细者',
				toolPlaceText: "安静休息时，非活动状态中",
			})
		}
		else if (this.props.LASER_POWER.power == 2 )
		{
			this.setState({
				toolPeopleText: '正常体质，无其他适应症',
				toolPlaceText: "正常生活活动，行走办公等",
			})
		}
		else if (this.props.LASER_POWER.power == 3 )
		{
			this.setState({
				toolPeopleText: '亚健康人群，有血液相关指标偏高、偏低，需要调整者',
				toolPlaceText: "有氧运动时，如慢跑，瑜伽之类的运动",
			})
		}
		else
		{
			this.setState({
				toolPeopleText: '为智能模式，适应治疗仪适应病症范围人群，及无其他疾病人群',
				toolPlaceText: "除极限运动外",
			})
		}
	}

	onGetCallback = res =>
	{
		var status = res.status;
		var dic = res.dic;
		if (status === 1)
		{
			this.setState({
				manuallyLaserState: dic.isManuallyLaserStatus,
				laserText: dic.isManuallyLaserStatus ? '关闭激光' : '开启激光',
			})
		}
	}
	componentWillUnmount()
	{
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
	}

	onBackAndroid = () =>
	{
		this.props.navigation.goBack();
		return true;
	};

	back()
	{
		this.props.navigation.pop();
	}

	componentWillReceiveProps(newProps)
	{
		console.log(newProps, '新的属性1laser')
		this.setState({
			socketMsg: newProps.socketMsg,
			user: newProps.user,
			guardian: newProps.guardian,
		})
		var user = newProps.user;
		if (!this.guardian)
		{
			if (newProps.socketMsg && newProps.socketMsg.sn == 8 && newProps.socketMsg !== this.props.socketMsg)
			{
				if (newProps.socketMsg.type == 4)
				{
					//切换后处理强度参数
					this.setState({
						powerValue: newProps.socketMsg.parameter.power,
						durationValue: newProps.socketMsg.parameter.time,
					})

				}
				else if (newProps.socketMsg.type == 5)
				{
					this.startLaser();
				}
			}
			else
			{
				this.setState({
					powerValue: newProps.LASER_POWER ? newProps.LASER_POWER.power : 4,
					durationValue: newProps.LASER_POWER ? newProps.LASER_POWER.duration : 24,
				})
			}

		}

		if ( newProps.socketMsg && newProps.socketMsg.sn == 11)
		{
			if (newProps.socketMsg.heartRate)
			{
				this.setState({
					powerValue: newProps.socketMsg.heartRate.power,
					durationValue: newProps.socketMsg.heartRate.time,
					parameter: newProps.socketMsg.heartRate,
				})
			}
		}
		else if (newProps.socketMsg && newProps.socketMsg.sn == 9)
		{
			this.props.remoteLoading(false);
		}

		if (newProps.manuallyLaserState !== this.props.manuallyLaserState)
		{
			if (newProps.socketMsg && newProps.socketMsg.type == 5)
			{
				this.props.sendSocketMessage(9, newProps.socketMsg.guardian, newProps.socketMsg.underGuardian, "成功")
			}
			this.refs.toast.show(newProps.deviceMsg);
		}

		if (newProps.LASER_POWER.power == 1 && newProps.LASER_POWER.power !== this.props.LASER_POWER.power)
		{
			this.setState({
				toolPeopleText: '体质偏弱，皮肤偏薄血管较细者',
				toolPlaceText: "安静休息时，非活动状态中",
			})
		}
		else if (newProps.LASER_POWER.power == 2 && newProps.LASER_POWER.power !== this.props.LASER_POWER.power)
		{
			this.setState({
				toolPeopleText: '正常体质，无其他适应症',
				toolPlaceText: "正常生活活动，行走办公等",
			})
		}
		else if (newProps.LASER_POWER.power == 3 && newProps.LASER_POWER.power !== this.props.LASER_POWER.power)
		{
			this.setState({
				toolPeopleText: '亚健康人群，有血液相关指标偏高、偏低，需要调整者',
				toolPlaceText: "有氧运动时，如慢跑，瑜伽之类的运动",
			})
		}
		else
		{
			this.setState({
				toolPeopleText: '为智能模式，适应治疗仪适应病症范围人群，及无其他疾病人群',
				toolPlaceText: "除极限运动外",
			})
		}

	}

	clickItem(item)
	{

		// if (this.state.manuallyLaserState)
		// {
		// 	this.refs.toast.show("关闭激光后才能调整")
		// 	return;
		// }
		console.log(item, "选择激光强度")
		this.setState({
			powerValue: item.item,
		})
		var index = item.item;
		if (index == 1)
		{
			this.setState({
				toolPeopleText: '体质偏弱，皮肤偏薄血管较细者',
				toolPlaceText: "安静休息时，非活动状态中",
			})
		}
		else if (index == 2)
		{
			this.setState({
				toolPeopleText: '正常体质，无其他适应症',
				toolPlaceText: "正常生活活动，行走办公等",
			})
		}
		else if (index == 3)
		{
			this.setState({
				toolPeopleText: '亚健康人群，有血液相关指标偏高、偏低，需要调整者',
				toolPlaceText: "有氧运动时，如慢跑，瑜伽之类的运动",
			})
		}
		else
		{
			this.setState({
				toolPeopleText: '为智能模式，适应治疗仪适应病症范围人群，及无其他疾病人群',
				toolPlaceText: "除极限运动外",
			})
		}
		if (this.guardian)
		{
			var parameter = this.state.parameter;
			parameter.power = item.item;
			var user = this.state.user;
			this.props.laserSend(8, this.guardian.underGuardian, user.user_id, '设备应用', '设备应用', 4, parameter)
		}

	}

	clickDuration(item)
	{
		// if (this.state.manuallyLaserState)
		// {
		// 	this.refs.toast.show("关闭激光后才能调整")
		// 	return;
		// }
		this.setState({
			durationValue: item.item,
		})
		if (this.guardian)
		{
			var parameter = this.state.parameter;
			parameter.time = item.item;
			var user = this.state.user;
			this.props.laserSend(8, this.guardian.underGuardian, user.user_id, '设备应用', '设备应用', 4, parameter)
		}
	}

	renderPowerItem(item, i)
	{
		var value = this.state.powerValue;
		var select = null;
		if (item == value)
		{
			select = <TouchableOpacity style={[styles.selectPower, styles.selectedPower, ]} onPress={this.clickItem.bind(this, {item: item, })} key={i}><Text style={[styles.selectText, styles.selectedText, ]}>{item}</Text></TouchableOpacity>
		}
		else
		{
			select = <TouchableOpacity style={styles.selectPower} onPress={this.clickItem.bind(this, {item: item, })} key={i}><Text style={styles.selectText}>{item}</Text></TouchableOpacity>
		}
		return (

			select

		)
	}
	renderPower()
	{
		var power = this.state.power;
		return (
			<View style={styles.powerWhole}>
				{
					power.length>0 ? power.map((item, i) => this.renderPowerItem(item, i)) : null
				}
			</View>
		)
	}

	renderDuration(duration)
	{
		var power = duration;
		return (
			<View style={styles.powerWhole}>
				{
					power.length>0 ? power.map((item, i) => this.renderDurationItem(item, i)) : null
				}
			</View>
		)
	}

	renderDurationItem(item, i)
	{
		var value = this.state.durationValue;
		var select = null;
		if (item == value)
		{
			select = <TouchableOpacity style={[styles.selectDuration, styles.selectedPower, ]} onPress={this.clickDuration.bind(this, {item: item, })} key={i}><Text style={[styles.selectText, styles.selectedText, ]}>{item}</Text></TouchableOpacity>
		}
		else
		{
			select = <TouchableOpacity style={styles.selectDuration} onPress={this.clickDuration.bind(this, {item: item, })} key={i}><Text style={styles.selectText}>{item}</Text></TouchableOpacity>
		}
		return (

			select

		)
	}

	startLaser = () =>
	{
		var guardian = this.guardian;
		var user = this.state.user;
		if (guardian)
		{
			this.setState({
				manuallyLaserState: !this.state.manuallyLaserState,
				laserText: this.state.manuallyLaserState ? "开启激光" : '关闭激光',
			})
			this.props.remoteLoading(true, "设置中");
			this.props.bletoolSend(8, guardian.underGuardian, user.user_id, '设备应用', '设备应用', 5)
			return;
		}
		var durationValue = this.state.durationValue;
		var powerValue = this.state.powerValue;
		console.log(durationValue, powerValue, this.props.LASER_POWER)
		console.log(this.state.manuallyLaserState, '激光状态')
		if (this.state.manuallyLaserState)
		{
			this.props.isOpenManullyLaser(!this.state.manuallyLaserState, this.onCallback)
		}
		else
		{
			this.props.detachSetLaserManuallyParameters(powerValue, durationValue, this.onCallback)
		}

	}

	onCallback = res =>
	{
		this.setState({
			manuallyLaserState: !this.state.manuallyLaserState,
			laserText: this.state.manuallyLaserState ? '开启激光' : '关闭激光',
		})
		this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
			<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
			<Text style={{color: '#fff', }}>{res.message}</Text>
		</View>)
		if (res.status === 1)
		{
			if (this.state.socketMsg)
			{
				this.props.bletoolSend(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '设置成功')
			}
		}
		else
		{
			if (this.state.socketMsg)
			{
				this.props.bletoolSend(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '设置成功')
			}
		}

	}


	render()
	{
		return (
			<View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="手动激光"
					leftIcon="ios-arrow-back"
					leftPress={this.back.bind(this)}
				/>
				<ScrollView style={{height: height - 100, }}>
					<View style={styles.list}>
						<Text style={{fontSize: 18, color: '#444', }}>选择激光强度：</Text>
					</View>
					<View style={{marginTop: 20, marginBottom: 20, }}>
						{this.renderPower()}
					</View>
					<View style={styles.toolText}>
						<Text>适用人群：{this.state.toolPeopleText}</Text>
						<Text>适用场景：{this.state.toolPlaceText}</Text>
					</View>


					<View style={styles.list}>
						<Text style={{fontSize: 18, color: '#444', }}>选择激光时长（分钟）：</Text>
					</View>
					{this.renderDuration(this.state.duration)}
					{this.renderDuration(this.state.durationSecond)}
					<View style={styles.toolText}>
						<Text>激光照射时长越长对人体血液治疗强度越大，请根据自身体质与病情程度酌情选择使用</Text>
					</View>
				</ScrollView>
				<View style={styles.startLaser}>
					<TouchableOpacity style={styles.laserBtn} onPress={this.startLaser}>
						<Text style={{color: '#fff', }}>{this.state.laserText}</Text>
					</TouchableOpacity>
				</View>
				<Toast ref="toast"
					position="center"
				/>
			</View>
		)
	}
}

function mapStateToProps(state) {
	console.log(state,'子组件的属性')
	return {
		connectStatus: state.ble.connectStatus,
		bleStatus: state.ble.bleStatus,
		realTimeHrStatus: state.ble.realTimeHrStatus,
		deviceInformation: state.ble.deviceInformation,
		LASER_POWER: state.ble.LASER_POWER,
		socketMsg: state.webSocketReducer.socketMsg,
		user: state.loginIn.user,
		guardian: state.webSocketReducer.guardian,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		getManuallyLaserState: callback => dispatch(bleActions.getManuallyLaserState(callback)),
		isOpenManullyLaser: (isOpen, callback) => dispatch(bleActions.isOpenManullyLaser(isOpen, callback)),
		detachSetLaserManuallyParameters: (power, duration, callback) => dispatch(bleActions.detachSetLaserManuallyParameters(power, duration, callback)),
		laserSend: (a, b, c, d, e, f, g) => dispatch(webSocketActions.laserSend(a, b, c, d, e, f, g)),
		remoteLoading: (status, text) => dispatch(webSocketActions.remoteLoading(status, text)),
		bletoolSend: (a, b, c, d, e, f) => dispatch(webSocketActions.bletoolSend(a, b, c, d, e, f)),
		realTimeSend: (a, b, c, d,) => dispatch(webSocketActions.realTimeSend(a, b, c, d,)),
		sendSocketMessage: (a, b, c, d) => dispatch(webSocketActions.sendMessage(a, b, c, d)),

	}
}

export default connect(mapStateToProps, mapDispatchToProps)(LaserMeasurePage)



const styles = StyleSheet.create({
	title: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		color: "#666",
	},
	sBar: {
		height: statusBarHeight,
		width: width,
	},
	list: {
		flexDirection: 'row',
		paddingLeft: 10,
		paddingTop: 10,
		paddingRight: 10,
		paddingBottom: 10,
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	operate: {
		backgroundColor: '#24a090',
		borderRadius: 5,
		paddingLeft: 15,
		paddingRight: 15,
		paddingTop: 6,
		paddingBottom: 6,
	},
	hr: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	powerWhole: {
		flexDirection: 'row',
		justifyContent: "space-around",
		alignItems: 'center',
	},
	selectPower: {
		backgroundColor: '#fcfcfc',
		borderColor: '#d8d8d8',
		borderWidth: 1,
		borderRadius: 10,
		width: width/4 - 40,
		height: width/4 - 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	selectDuration: {
		backgroundColor: '#fcfcfc',
		borderColor: '#d8d8d8',
		borderWidth: 1,
		borderRadius: 10,
		width: width/2 - 40,
		height: 40,
		marginBottom: 15,
		justifyContent: 'center',
		alignItems: 'center',
	},
	itemWhole: {
		width: width/4 - 40,
		height: width/4 - 40,
	},
	selectedPower: {
		borderColor: '#24a090',
	},
	selectedText: {
		color: '#24a090',
	},
	selectText: {
		color: '#d8d8d8',
	},
	startLaser: {
		height: 100,
		justifyContent: 'center',
		alignItems: 'center',
	},
	laserBtn: {
		height: 40,
		width: width - 40,
		backgroundColor: '#24a090',
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	toolText: {
		width: width,
		paddingHorizontal: 10,
	},
});
