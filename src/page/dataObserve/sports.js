import React, {Component, } from 'react';
import {
	Image,
	StyleSheet,
	BackHandler,
	ToastAndroid,
	WebView,
	View,
	ActivityIndicator,
	StatusBar,
	TouchableOpacity,
	Text,
	Alert,
	Platform,
} from 'react-native';
import NavBar from '../../common/NavBar'
import { connect, } from 'react-redux';
import { URL, } from "../../utils/network/baseService";
import * as bleDataHandle from '../../utils/ble/application/data/bleDataHandle';
import Toast, { DURATION, } from 'react-native-easy-toast'
import Icon from 'react-native-vector-icons/Ionicons'

import BleModule from '../../utils/ble/bleModule';
const BluetoothManager = new BleModule();
import {statusBarHeight, height, width, } from '../../utils/uiHeader';
import * as bleActions from '../../actions/device/bleActions';
import * as dataService from '../../utils/network/dataService';

var _that;
class SportsObserve extends Component
{
	static navigationOptions = {
		header: null,
		dataProgress: 0,
	};
	constructor(props)
	{
		super(props)
		this.state = {
			connectStatus: this.props.connectStatus,
			bleStatus: this.props.bleStatus,
			connectedDevice: this.props.connectedDevice,

		}
		this.isStartH5 = 0;
		this.time = (new Date()).valueOf();
		this.isFirstUpdate = false;
		this.isOnLoad = true
		this.isCopy = true
	}

	componentWillMount()
	{
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount()
	{
		_that = this;
		this.timeout = setInterval(() =>
		{
			_that.updateStatus('query');
		}, 3000)
	}

	componentWillUnmount()
	{
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
		this.timeout && clearInterval(this.timeout);
	}
	componentWillReceiveProps(newProps)
	{
		this.setState({
			connectStatus: newProps.connectStatus,
			bleStatus: newProps.bleStatus,
			connectedDevice: newProps.connectedDevice,
		})
	}

	async updateStatus(type, flag= null, status= "")
	{
		var that = this;
		var sn = this.props.navigation.state.params.sn;
		var data = {
			type: type,
			device_sn: sn,
		}
		if (flag)
		{
			data.flag = flag
		}
		if (status)
		{
			data.status = status
		}
		console.log(data, '参数123');
		var res = await dataService.updateStatus(data);
		if ( res.code == 200)
		{
			console.log(res, '数据请减肥1', type);
			if (type == 'query' && res.data.flag && res.data.flag == 1)
			{
				console.log(res, '数据请减肥2');
				var connectStatus = this.props.connectStatus;
				var connectedDevice = this.props.connectedDevice;
				console.log(connectedDevice, sn, '连接的设备', connectStatus)
				if (connectStatus === 4)
				{

					if (connectedDevice.device_sn === sn)
					{
						var data_type = res.data.category;
						if (data_type === '0')
						{
							//上传运动
							that.props.getDeviceData('day_sports', this.onCallback)
						}
						else if (data_type === '1') {
							//上传心率
							that.props.getDeviceData('day_heart', this.onCallback)
						}
						else if (data_type === '2') {
							//上传激光
							that.props.getDeviceData('day_laser', this.onCallback)
						}
					}
					else
					{
						that.updateStatus('updateAll', 3, 100);
						that.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
							<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
							<Text style={{color: '#fff', }}>请连接设备</Text>
						</View>)
					}
				}
				else
				{
					that.updateStatus('updateAll', 3, 100);
					that.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
						<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
						<Text style={{color: '#fff', }}>请连接设备</Text>
					</View>)
				}
			}
		}
	}

	getMessage = (event) =>
	{
		console.log(event.nativeEvent.data, "收到的通知",  _that.state, this)
		let get_data = JSON.parse(event.nativeEvent.data);
	}

	onBackAndroid = () =>
	{
		if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now())
		{
			//最近2秒内按过back键，可以退出应用。
			BackHandler.exitApp();
			return false;
		}
		this.lastBackPressed = Date.now();
		ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
		// return true;
		return true;
	};

	back()
	{
		this.props.navigation.pop();
	}

	onCallback = res =>
	{
		//数据上传的返回
		console.log(res, '数据上传的返回');
		var status = res.status;
		if (status === 5)
		{
			this.setState({
				dataProgress: res.progress,
			})
			this.updateStatus('updateAll', 3, res.progress);
		}
		else if (status === 0)
		{
			console.log(_that.refs.toast, '上传失败11231阿熟悉熟悉')
			this.updateStatus('updateAll', 3, 100);
			_that.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>上传失败</Text>
			</View>)
		}
	}

	shouldComponentUpdate(nextProps, nextState)
	{
		return false
	}

	renderWebView()
	{
		let token = this.props.userInfo ? this.props.userInfo.token : '';
		var tokend = '';
		let sn = this.props.navigation.state.params.sn;
		let userToken = this.props.navigation.state.params.token;
		if (userToken) {
			tokend = userToken
		} else {
			tokend = token;
		}
		let uri = URL + "wxdata/sportData.html?token=" + tokend + "&sn=" + sn + "&time=" + this.time + "&version=app";
		console.log(uri, '链接22222')
		if (Platform.OS == "android")
		{
			return (
				<WebView
					ref={( webView ) => this.webView = webView}
					onLoadEnd={this.onLoadEnd}
					source={{uri: uri, }}
					onMessage={this.getMessage}
					javaScriptEnabled={true}
					onNavigationStateChange={(event)=>{ this.targetUrl = event.url}}
				/>
			)
		}
		else
		{
			return (
				<WebView
					ref={( webView ) => this.webView = webView}
					onLoadEnd={this.onLoadEnd}
					source={{uri: uri, }}
					onMessage={this.getMessage}
					javaScriptEnabled={true}
					onNavigationStateChange={(event)=>{ this.targetUrl = event.url}}

				/>
			)
		}
	}


	render()
	{
		return (
			<View style={{flex: 1, }}>
				<StatusBar
					translucent={true}
					animated={true}
					backgroundColor={"#24a090"}
					barStyle={"light-content"}
				/>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="数据监控"
					leftIcon="ios-arrow-back"
					leftPress={this.back.bind(this)}
					titleStyle={{paddingLeft: 20, }}
				/>
				{this.renderWebView()}
				<Toast
					ref="toast"
					position="center"
				/>
			</View>
		);
	}
}


function mapStateToProps(state)
{
	console.log(state, '子组件的属性')
	return {
		loginInStatus: state.loginIn.status,
		connectStatus: state.ble.connectStatus,
		userDeviceList: state.user.userDeviceList,
		bleStatus: state.ble.bleStatus,
		connectedDevice: state.ble.connectedDevice,
		deviceInformation: state.ble.deviceInformation,
		firmWare: state.ble.firmWare,
		userInfo: state.loginIn.user,
		dataProgress: state.ble.dataProgress,
		updataErr: state.ble.updataErr,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		getDeviceData: (params, callback) => dispatch(bleActions.getDeviceData(params, callback)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(SportsObserve)



const styles = StyleSheet.create({
	sBar: {
		height: statusBarHeight,
	},
	flash: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	tabBarIcon: {
		width: 19,
		height: 19,
	},
	img: {
		width: width,
		height: height,
	},
});
