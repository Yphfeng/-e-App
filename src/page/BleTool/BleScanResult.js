/**
 * @author lam
 */
'use strict';

import React, {Component} from 'react'
import {
	Text,
	View,
	StyleSheet,
	StatusBar,
	Dimensions, BackHandler,
	TouchableOpacity,
	Image,
	DeviceEventEmitter,
} from 'react-native'
import NavBar from '../../common/NavBar'
import Item from '../../common/Item'
import Toast, { DURATION } from 'react-native-easy-toast'
import Spinner from 'react-native-loading-spinner-overlay';
import { connect } from 'react-redux'
import * as bleActions from "../../actions/device/bleActions";
import Icon from 'react-native-vector-icons/Ionicons'
import {statusBarHeight, height, width, } from '../../utils/uiHeader';
import * as deviceService from '../../utils/network/deviceService';

const contentHeight = height - NavBar.topbarHeight - statusBarHeight

//FontAwesome
class BleScanResultPage extends Component {
	static navigationOptions = {
		header: null
	}
	constructor(props) {
		super(props);
		this.state = {
			isActiveAlert: false,
			isBackground: false,
			bleStatus: this.props.bleStatus,
		};
	}
	componentWillMount() {
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount() {
		this.viewDidAppear = this.props.navigation.addListener('didFocus', async (obj)=>
		{
			var dic = new Object();
			var device_sn = this.props.navigation.state.params.code;
			dic.device_sn = device_sn;
			let detail = await deviceService.getDeviceDetail(dic)
			if (detail.code === 200)
			{
				var device_code =detail.data.device_code;
				if (device_code.indexOf("HA05") > -1|| device_code.indexOf("HA06") > -1) {
					var status = 1;
				}
				else
				{
					status = 0;
				}
				this.setState({
					device_sn: device_sn,
					deviceName: detail.data.device_alias ? detail.data.device_alias : detail.data.armarium_device_name,
					prevName: device_sn.substring(13),
					status: status,
					device_code: device_code,
				})
			}
			else
			{
				this.setState({
					device_sn: device_sn,
					deviceName: '激光治疗手表',
					prevName: device_sn.substring(13),
					status: 0,
					device_code: '',
				})
			}
		})
	}

	componentWillReceiveProps(nextProps)
	{
		this.setState({
			bleStatus: nextProps.bleStatus,
		})
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
	}

	onBackAndroid = () => {
		this.props.navigation.goBack();
		return true;
	};

	back() {
		this.props.navigation.goBack(this.props.navigation.state.params.key);
		// this.props.navigation.pop();
	}

	startBind()
	{
		var bleStatus = this.state.bleStatus;
		if (!bleStatus)
		{
			this.refs.toast.show(
				<View style={{justifyContent: "center", alignItems: 'center'}}>
					<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
					<Text style={{color: '#fff', }}>蓝牙未开启</Text>
				</View>
			)
			return;
		}
		this.setState({
			isActiveAlert: true,
			isBackground: true,
		})
	}

	confirmBind = () =>
	{
		var bleStatus = this.state.bleStatus;
		if (!bleStatus)
		{
			this.refs.toast.show(
				<View style={{justifyContent: "center", alignItems: 'center'}}>
					<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
					<Text style={{color: '#fff', }}>蓝牙未开启</Text>
				</View>
			)
			return;
		}
		//弹出提示框
		var devices = {
			device_sn: this.props.navigation.state.params.code,
			device_name: this.props.navigation.state.params.name,
		}
		this.setState({
			spinner: 'true',
			spinnerText: '绑定中',
			isActiveAlert: false,
			isBackground: false,
		})
		this.props.bindDevice(1, devices, this.onScanCallback);
	}

	onScanCallback = res =>
	{
		console.log(res, '绑定的回调');
		this.setState({
			spinner: false,
		})
		if (res.status === 1)
		{
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>{res.message}</Text>
			</View>)
			DeviceEventEmitter.emit('DeviceSearch', true);
			setTimeout(() =>
			{
				this.props.navigation.navigate('Home');
			}, 1000)
		}
		else
		{
			this.refs.toast.show(res.message)
		}
	}
	render() {
		return (
			<View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="扫码绑定结果"
					leftIcon="ios-arrow-back"
					leftPress={this.back.bind(this)}
				/>
				<View style={{height: contentHeight,}}>
					<View style={{height: contentHeight - 150}}>
						<View style={styles.list}>
							<View style={styles.contentLeft}>
								<View style={styles.imgStyle}><Image source={this.state.status ? require('../../img/D98F75F2422DFAA6EDECFB07E4EC6FEC.png') : require('../../img/4504C9A05948F7484AED647093D6F3A9.png')} roundAsCircle={true} style={styles.img} />
								</View>
								<View style={styles.listContent}>
									<Text style={{ color: '#000',fontSize: 16,fontWeight: 'bold'}}>{this.state.prevName}号{this.state.deviceName}</Text>
									<Text style={{ color: '#7f8389',paddingTop: 5}}>设备型号：{this.state.device_code}</Text>
									<Text style={{ color: '#7f8389',paddingTop: 5}}>设备编号：{this.state.device_sn}</Text>
								</View>
							</View>
						</View>
					</View>
					<View style={styles.bottomBtn}>
						<TouchableOpacity style={[styles.bindText,{borderColor: '#979797'}]} onPress={this.startBind.bind(this)}>
							<Text style={{color: '#fff'}}>提交绑定</Text>
						</TouchableOpacity>
					</View>
				</View>
				<Toast
					ref="toast"
					position="center"
				/>
				<Spinner
					visible={this.state.spinner}
					textContent={this.state.spinnerText}
					textStyle={{fontSize: 14, }}
					overlayColor="rgba(0, 0, 0, .25)"
				/>
				{this.state.isBackground ? <View style={styles.background}></View> : null}
				{this.state.isActiveAlert ? <View style={styles.activeDevice}>
					<View style={styles.activeTitle}><Text style={{fontSize: 18, }}>激活设备指导图</Text></View>
					<View style={{flexDirection: 'row'}}>
						<Image source={require('../../img/C80806031BCF1507E2FCB495CB74E384.png')} resizeMode="contain" style={styles.activeImg} />
						<Image source={require('../../img/D7ED496A339487763402DA502FF3911B.png')} resizeMode="contain" style={styles.activeImg} />
					</View>
					<View><Text style={{fontWeight: "bold", fontSize: 16,  }}>请"按一下"设备上的激活按钮</Text></View>
					<TouchableOpacity onPress={this.confirmBind} style={styles.bindConnect}><Text style={[styles.whiteColor, {fontWeight: 'bold', }]}>确定</Text></TouchableOpacity>
				</View> : null}
			</View>
		)
	}
}

function mapStateToProps(state) {
	console.log(state,'子组件的属性')
	return {
		bleStatus: state.ble.bleStatus,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		startSearchDevices: callback => dispatch(bleActions.startSearchDevices(callback)),
		bindDevice: (status, devices, callback) => dispatch(bleActions.bindDevice(status, devices, callback)),
	}
}

export default connect(mapStateToProps,mapDispatchToProps)(BleScanResultPage)


const styles = StyleSheet.create({
	title: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		color: "#666"
	},
	sBar: {
		height: statusBarHeight,
		width: width,
	},
	list: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		paddingTop: 20,
		paddingBottom: 20,
		backgroundColor: '#fff',
		paddingHorizontal: 10,
	},
	contentLeft: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'flex-start'
	},
	hr:{
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center'
	},
	imgStyle: {
		width: 65,
		height: 65,
		marginRight: 10,
		borderRadius: 50,
		borderWidth: 1,
		borderColor: '#ccc',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center'

	},
	img: {
		width: 65,
		height: 65,
	},
	listContent: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'flex-start',
		flex: 1,
		height: 65
	},
	bottomBtn: {
		height: 150,
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
	},
	btnText: {
		borderRadius: 35,
		borderWidth: 1,
		width: 145,
		height: 45,
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center'
	},
	bindText: {
		width: width - 50,
		backgroundColor: '#24a090',
		borderRadius: 35,
		height: 45,
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		paddingLeft: 20,
		paddingRight: 20
	},
	background: {
		backgroundColor: "rgba(0, 0 ,0, .5)",
		width: width,
		height: height,
		position: 'absolute',
		left: 0,
		top: 0,
		zIndex: 1,
	},
	activeDevice: {
		borderRadius: 10,
		backgroundColor: '#f3f3f3',
		width: width - 100,
		height: width - 100,
		position: 'absolute',
		top: height/2 - (width - 100)/2,
		marginLeft: 50,
		zIndex: 2,
		alignItems: 'center',
	},
	activeImg: {
		width: 80,
		height: 140,
	},
	activeTitle: {
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',
	},
	bindConnect: {
		width: 100,
		height: 30,
		backgroundColor: '#24a090',
		borderRadius: 6,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 5,
	},
	whiteColor: {
		color: '#fff',
	},
});
