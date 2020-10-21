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
import ToggleSwitch from 'toggle-switch-react-native'
import { connect, } from 'react-redux'
import Toast, { DURATION, } from 'react-native-easy-toast'
import Spinner from 'react-native-loading-spinner-overlay'
import { isOpenManullyLaser, isOpenManullyHr, setPointer, } from '../../actions/device/bleActions';
import * as bleActions from "../../actions/device/bleActions";
import Feather from "react-native-vector-icons/Feather";
import Icon from "react-native-vector-icons/Ionicons";
import * as webSocketActions from '../../actions/webSocketActions';

import {statusBarHeight, height, width, } from '../../utils/uiHeader';

//FontAwesome
class BletoolPage extends Component
{
	static navigationOptions = {
		header: null,
	}
	constructor(props)
	{
		super(props);
		this.state = {
			isShow: false,
			spinner: false,
			socketMsg: this.props.socketMsg,
			connnectStatus: this.props.connnectStatus,
			firmWare: this.props.firmWare,
		};
		this.isGuargianDeviceName = '';
	}
	componentWillMount()
	{
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount()
	{

		var guardian = this.props.navigation.state.params ? this.props.navigation.state.params.guardian : null;
		if (guardian)
		{
			this.props.remoteLoading(true, "加载中");
			this.guardian = guardian;
			return;
		}

		if (this.props.connectStatus == 4)
		{
			if (this.props.dataProgress > 0)
			{
				this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
					<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
					<Text style={{color: '#fff', }}>数据上传中</Text>
				</View>)
				return;
			}
			this.setState({
				spinner: true,
			})
			var productModle = this.props.firmWare.productModle;
			console.log(this.props.firmWare, 'aasdasdasguj');
			this.setState({
				isShow: productModle && (productModle.indexOf("HA05") > -1 || productModle.indexOf("HA06") > -1) ? true : false,
			})
			if (this.state.socketMsg)
			{
				console.log('发送的数据1232')
				this.props.bletoolSend(8, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '设备应用', '设备应用', 8, productModle)
			}
			this.props.getApplicationFirst(this.onGetCallback);
		}
		else
		{
			this.setState({
				spinner: false,
			})
		}
	}

	onGetCallback = res =>
	{
		console.log(res, '驱蚊器');
		setTimeout(() => {
			this.setState({
				spinner: false,
			})
		}, 2000)
		var status = res.status;
		if (status === 1 && res.message === '成功')
		{
			var dic = res.dic;
			if (this.state.socketMsg)
			{
				console.log('发送的数据1232')
				this.props.bletoolSend(8, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '设备应用', '设备应用', 7,  dic.isManuallyHrStatus)
				this.props.bletoolSend(8, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '设备应用', '设备应用', 6, dic.isAutoHrStatus)
			}
		}
	}
	componentWillReceiveProps(nextProps)
	{
		console.log(nextProps, '新年的第七位', this.guardian)
		this.setState({
			socketMsg: nextProps.socketMsg,
			user: nextProps.user,
			connnectStatus: nextProps.connnectStatus,
			firmWare: nextProps.firmWare,
			dataProgress: nextProps.dataProgress,
		})
		if (!this.guardian)
		{
			this.setState({
				AutoHrState: nextProps.AutoHrState,
				manuallyHrState: nextProps.manuallyHrState,
				manuallyLaserState: nextProps.manuallyLaserState,
			})
			if (nextProps.socketMsg && nextProps.socketMsg.sn == 8)
			{
				if (nextProps.socketMsg.type == 0)
				{
					console.log("zhix", nextProps.AutoHrState, nextProps.manuallyHrState)
					var AutoHrState =  nextProps.AutoHrState ? 1 : 0;
					var manuallyHrState = nextProps.manuallyHrState ? 1 : 0;
					var manuallyLaserState = nextProps.manuallyLaserState ? 1 : 0;
					var device_name = nextProps.firmWare ? nextProps.firmWare.productModle : null;
					this.props.bletoolSend(8, nextProps.socketMsg.guardian, nextProps.socketMsg.underGuardian, '设备应用', '设备应用', 7, manuallyHrState)
					this.props.bletoolSend(8, nextProps.socketMsg.guardian, nextProps.socketMsg.underGuardian, '设备应用', '设备应用', 6, AutoHrState)
					this.props.bletoolSend(8, nextProps.socketMsg.guardian, nextProps.socketMsg.underGuardian, '设备应用', '设备应用', 10, manuallyLaserState)
					this.props.bletoolSend(8, nextProps.socketMsg.guardian, nextProps.socketMsg.underGuardian, '设备应用', '设备应用', 8, device_name)
				}
			}
			if (nextProps.socketMsg && nextProps.socketMsg.sn == 8 && nextProps.socketMsg !== this.props.socketMsg)
			{
				console.log("zhix2", nextProps.socketMsg, nextProps.connectStatus)
				if (nextProps.socketMsg.type == 1)
				{
					this.setAutoHrState();
				}
				else if (nextProps.socketMsg.type == 2)
				{
					this.setmanuallyHrState();
				}
				else if (nextProps.socketMsg.type == 3)
				{
					this.props.navigation.navigate("LaserMeasurePage", {status: this.state.manuallyLaserState});
				}
				else if (nextProps.socketMsg.type == 9)
				{
					console.log(this.isGuargianDeviceName, '设备型号');
					this.props.navigation.navigate('Test', {productModle: this.state.firmWare.productModle, });
				}
				if (nextProps.heartRateManualValue !== this.props.heartRateManualValue)
				{
					this.props.realTimeSend(10, nextProps.socketMsg.guardian, nextProps.socketMsg.underGuardian, nextProps.heartRateManualValue)
				}
			}
		}
		else
		{
			if (nextProps.socketMsg !== this.props.socketMsg)
			{
				if (nextProps.socketMsg && nextProps.socketMsg.sn == 10)
				{
					console.log(nextProps.socketMsg, '收到的实时心率')
					this.setState({
						heartRateManualValue: nextProps.socketMsg.heartRate,
					})
				}
				else if (nextProps.socketMsg && nextProps.socketMsg.sn == 9)
				{
					this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
						<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
						<Text style={{color: '#fff', }}>{nextProps.socketMsg.title}</Text>
					</View>)
				}
				else if (nextProps.socketMsg && nextProps.socketMsg.sn == 8){
					if (nextProps.socketMsg.type == 6)
					{
						this.setState({
							AutoHrState: nextProps.socketMsg.status ? true : false,
						})
						console.log(nextProps.socketMsg.status, '收到的监护人心率数据')
					}
					else if (nextProps.socketMsg.type == 7)
					{
						this.props.remoteLoading(false);
						this.setState({
							manuallyHrState: nextProps.socketMsg.status ? true : false,
						})
					}
					else if (nextProps.socketMsg.type == 8)
					{
						this.setState({
							isShow: nextProps.socketMsg.status && (nextProps.socketMsg.status.indexOf("HA05") > -1 || nextProps.socketMsg.status.indexOf("HA06") > -1) ? true : false,
						})
						this.isGuargianDeviceName = nextProps.socketMsg.status;
					}
					else if (nextProps.socketMsg.type == 10)
					{
						this.setState({
							manuallyLaserState: nextProps.socketMsg.status,
						})
					}
				}
			}

		}
		if (!nextProps.bleStatus && nextProps.bleStatus !== this.props.bleStatus)
		{
			this.setState({
				spinner: false,
			})
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>请打开蓝牙</Text>
			</View>)
			return;
		}

		if (nextProps.instruction == 1 && nextProps.instruction !== this.props.instruction)
		{
			this.setState({
				spinner: false,
			})
			this.refs.toast.show(nextProps.instructionMsg)
		}

	}

	componentWillUnmount()
	{
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
	}

	onBackAndroid = () => {
		this.props.navigation.goBack();
		return true;
	};

	back()
	{
		this.props.navigation.pop();
	}
	events(res)
	{
		console.log(res);
	}
	_isShow()
	{
		if (this.state.isShow)
		{
			return (<TouchableOpacity style={styles.list} onPress={this.setPointer.bind(this)}>
				<Text>指针校准</Text>
				<Feather name="chevron-right" size={24} color="#ccc"></Feather>
			</TouchableOpacity>)
		}
	}
	render()
	{
		return (
			<View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="设备应用"
					leftIcon="ios-arrow-back"
					leftPress={this.back.bind(this)}
				/>
				<ScrollView>
					<View style={styles.list}>
						<Text>自动心率监测</Text>
						<View>
							<ToggleSwitch
								onColor="#24a090"
								offColor="#ccc"
								isOn={this.state.AutoHrState}
								onToggle={() => {this.setAutoHrState()}}

							/>
						</View>
					</View>
					<View style={styles.list}>
						<Text>心率开启</Text>
						<View style={styles.hr}>
							<Text style={{paddingRight: 10,color: '#24a090'}}>{this.state.heartRateManualValue}次/分钟</Text>
							<View>
								<ToggleSwitch
									onColor="#24a090"
									offColor="#ccc"
									isOn={this.state.manuallyHrState}
									onToggle={isOn => {this.setmanuallyHrState()}}
								/>
							</View>
						</View>
					</View>
					<TouchableOpacity style={styles.list} onPress={this.setmanuallyLaserState}>
						<Text>手动激光</Text>
						<Feather name="chevron-right" size={24} color="#ccc"></Feather>
					</TouchableOpacity>
					{this._isShow()}
				</ScrollView>
				<Toast
					ref="toast"
					position="center"
				/>
				<Spinner
					visible={this.state.spinner}
					textContent={'加载中...'}
					textStyle={styles.spinnerTextStyle}
				/>
			</View>
		)
	}
	setmanuallyLaserState = () =>
	{
		if (this.props.dataProgress > 0)
		{
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>数据上传中</Text>
			</View>)
			return;
		}
		if (this.guardian)
		{
			var user = this.state.user;
			this.props.navigation.navigate("LaserMeasurePage", {guardian: this.guardian, });
			this.props.bletoolSend(8, this.guardian.underGuardian, user.user_id, '设备应用', '设备应用', 3)
			return;
		}
		if (!this.props.bleStatus)
		{
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>请打开蓝牙</Text>
			</View>)
			return;
		}
		if (this.props.connectStatus !== 4)
		{
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>请连接设备</Text>
			</View>)
			if (this.state.socketMsg)
			{
				this.props.sendSocketMessage(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '请连接设备');
			}
			return
		}
		this.props.navigation.navigate("LaserMeasurePage");
	}
	setmanuallyHrState()
	{
		if (this.props.dataProgress > 0)
		{
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>数据上传中</Text>
			</View>)
			return;
		}

		if (this.guardian)
		{

			this.setState({
				manuallyHrState: !this.state.manuallyHrState,
				heartRateManualValue: 0,
			})
			var user = this.state.user;
			this.props.bletoolSend(8, this.guardian.underGuardian, user.user_id, '设备应用', '设备应用', 2)

			return;
		}

		if (!this.props.bleStatus)
		{
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>请打开蓝牙</Text>
			</View>)
			return;
		}

		if (this.props.connectStatus !== 4)
		{
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>请连接设备</Text>
			</View>)
			if (this.state.socketMsg)
			{
				this.props.sendSocketMessage(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '请连接设备');
			}
			return
		}

		this.setState({
			heartRateManualValue: 0,
		})
		this.props.isOpenManullyHr(!this.state.manuallyHrState, this.onCallback)

	}
	setAutoHrState()
	{
		if (this.props.dataProgress > 0)
		{
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>数据上传中</Text>
			</View>)
			return;
		}
		if (this.guardian)
		{
			this.setState({
				AutoHrState: !this.state.AutoHrState,
			})
			var user = this.state.user;
			this.props.bletoolSend(8, this.guardian.underGuardian, user.user_id, '设备应用', '设备应用', 1)

			return;
		}
		if (!this.props.bleStatus)
		{
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>请打开蓝牙</Text>
			</View>)
			return;
		}
		if (this.props.connectStatus !== 4)
		{
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>请连接设备</Text>
			</View>)
			return
		}
		this.props.isOpenAutoHr(!this.state.AutoHrState, this.onCallback)
	}

	onCallback = res =>
	{
		console.log(res, '设置的之')
		var status = res.status;

		if (status === 1)
		{
			this.setState({
				heartRateManualValue: 0,
			})
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>{res.message}</Text>
			</View>)
			if (this.state.socketMsg)
			{
				this.props.bletoolSend(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '设置成功')
			}
		}
		else if (status === 2)
		{
			this.setState({
				heartRateManualValue: res.hrRealtime,
			})
			if (this.state.socketMsg)
			{
				this.props.realTimeSend(10, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, res.hrRealtime)
			}

		}
		else
		{
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>{res.message}</Text>
			</View>)
			if (this.state.socketMsg)
			{
				this.props.bletoolSend(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, res.message)
			}
		}
	}
	setPointer()
	{
		if (this.props.dataProgress > 0)
		{
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>数据上传中</Text>
			</View>)
			return;
		}
		if (this.guardian)
		{
			this.props.navigation.navigate("Test", {guardian: this.guardian, productModle: this.isGuargianDeviceName,})
			console.log(this.isGuargianDeviceName, '指针跳转参数')
			this.props.bletoolSend(8, this.guardian.underGuardian, this.guardian.guardian, '设备应用', '设备应用', 9, this.isGuargianDeviceName)
			return;
		}
		if (!this.props.bleStatus)
		{
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>请打开蓝牙</Text>
			</View>)
			return;
		}
		if (this.props.connectStatus !== 4)
		{
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>请连接设备</Text>
			</View>)
			if (this.state.socketMsg)
			{
				this.props.sendSocketMessage(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '请连接设备');
			}
			return
		}
		this.props.navigation.navigate("Test", {productModle: this.state.firmWare.productModle, })
	}
}

function mapStateToProps(state) {
	console.log(state,'子组件的属性')
	return {
		connectStatus: state.ble.connectStatus,
		userDeviceList: state.user.userDeviceList,
		deviceMsg: state.ble.deviceMsg,
		deviceBindStatus: state.ble.deviceBindStatus,
		bleStatus: state.ble.bleStatus,
		deviceInformation: state.ble.deviceInformation,
		connectLoadingStatus: state.ble.connectLoadingStatus,
		instruction: state.ble.instruction,
		instructionMsg: state.ble.instructionMsg,
		socketMsg: state.webSocketReducer.socketMsg,
		user: state.loginIn.user,
		firmWare: state.ble.firmWare,
		dataProgress: state.ble.dataProgress,
		AutoHrState: state.ble.AutoHrState,
		manuallyHrState: state.ble.manuallyHrState,
		manuallyLaserState: state.ble.manuallyLaserState,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		getApplicationFirst: callback => dispatch(bleActions.getApplicationFirst(callback)),
		isOpenManullyLaser: (isOpen,deviceId) => dispatch(isOpenManullyLaser(isOpen,deviceId)),
		isOpenManullyHr: (isOpen, callback) => dispatch(isOpenManullyHr(isOpen, callback)),
		isOpenAutoHr: (isOpen, callback) => dispatch(bleActions.isOpenAutoHr(isOpen, callback)),
		connectionSucceeded: (s) => dispatch(bleActions.connectionSucceeded(s)),
		detachGetManuallyHRState: (id) => dispatch(bleActions.detachGetManuallyHRState(id)),
		remoteLoading: (status, text) => dispatch(webSocketActions.remoteLoading(status, text)),
		bletoolSend: (a, b, c, d, e, f, g) => dispatch(webSocketActions.bletoolSend(a, b, c, d, e, f, g)),
		sendSocketMessage: (a, b, c, d) => dispatch(webSocketActions.sendMessage(a, b, c, d)),
		realTimeSend: (a, b, c, d,) => dispatch(webSocketActions.realTimeSend(a, b, c, d,)),

	}
}

export default connect(mapStateToProps,mapDispatchToProps)(BletoolPage)


const styles = StyleSheet.create({
	spinnerTextStyle: {
		color: '#FFF',
	},
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
		borderBottomWidth: 1,
		borderBottomColor: '#ccc',
	},
	hr: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
});
