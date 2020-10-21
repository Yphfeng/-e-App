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
	Image,
	PermissionsAndroid,
	Platform,
	DeviceEventEmitter,
	Alert,
} from 'react-native'
import NavBar from '../../common/NavBar'
import Item from '../../common/Item'
import Toast, { DURATION, } from 'react-native-easy-toast'

import { connect, } from 'react-redux'
import Spinner from 'react-native-loading-spinner-overlay';
import * as bleActions from "../../actions/device/bleActions";
import * as webSocketActions from '../../actions/webSocketActions';
import Icon from 'react-native-vector-icons/Ionicons'
import {RadioGroup, RadioButton, } from '../../lib/react-native-flexi-radio-button'

import {statusBarHeight, height, width, } from '../../utils/uiHeader';

const contentHeight = height - NavBar.topbarHeight - statusBarHeight - 100

//FontAwesome
class BleSearchResultPage extends Component
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
			searchText: '搜索中',
			searchStatus: false,
			searchDevices: [],
			isOnSelect: true,
			bindMsg: '',
			index: null,
			spinner: false,
			spinnerText: '正在搜索',
			connectStatus: this.props.connectStatus,
			socketMsg: this.props.socketMsg,
		};
		this.onSelect = this.onSelect.bind(this)
		this.guardian = null;
		this.toGuadianData = true;
	}
	componentWillMount()
	{
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount()
	{
		console.log(this.props, '收到的数据状态');
		var guardian = this.props.navigation.state.params ? this.props.navigation.state.params.guardian : null;
		if (guardian)
		{
			this.guardian = guardian;
			return;
		}
		if (!this.props.bleStatus)
		{
			this.setState({
				searchText: '搜索',
			})
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>请打开蓝牙</Text>
			</View>)

			return;
		}
		console.log(guardian, "是否开始搜索")
		this.toGuadianData = true;
		if (Platform.OS == 'ios')
		{
			this.setState({
				spinner: true,
			})
			this.props.startSearchDevices(this.onStartSearchCallback);

		}
		else
		{
			PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION)
				.then((data) =>
				{
					if (data)
					{
						this.setState({
							spinner: true,
						})
						this.props.startSearchDevices(this.onStartSearchCallback);

					}
					else
					{
						PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION)
							.then((granted) =>
							{
								if (granted === PermissionsAndroid.RESULTS.GRANTED) {
									this.setState({
										spinner: true,
									})
									this.props.startSearchDevices(this.onStartSearchCallback);

								}
							})
							.catch(errr =>
							{

							})

					}
				})
				.catch((error) =>
				{

				})
		}
	}

	onStartSearchCallback = res =>
	{
		this.setState({
			spinner: false,
			searchText: '重新搜索',
		})
		var status = res.status;
		if (status === 1)
		{
			var devices = res.devices;
			this.setState({
				searchDevices: devices,
			})
			console.log(this.state.socketMsg, '监护人123')
			if (this.state.socketMsg)
			{
				var guardianDevices = res.devices;
				var willDevices = [];
				var len = guardianDevices ? guardianDevices.length : 0;
				if (len < 1)
				{
					this.props.deviceSend(7, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '绑定解绑设备', '设备管理2', 1, 0, [])
				}
				for (var i = 0; i < len; i++)
				{
					console.log(guardianDevices[i], '123阿四小时')
					var deviceInfo = new Object();
					deviceInfo.name = guardianDevices[i].device_code;
					deviceInfo.localName = guardianDevices[i].device_code;
					guardianDevices[i].deviceInfo = deviceInfo;
					guardianDevices[i].num = guardianDevices[i].prevName;
					guardianDevices[i].type = guardianDevices[i].isCicle ? 1 : 0;
					willDevices.push(guardianDevices[i]);
				}
				console.log(guardianDevices, '设备监护人信息', willDevices)
				this.props.deviceSend(7, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '绑定解绑设备', '设备管理2', 1, 0, willDevices)
			}
		}
		else
		{
			this.setState({
				searchDevices: [],
			})
			this.refs.toast.show(
				<View style={{justifyContent: "center", alignItems: 'center'}}>
					<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
					<Text style={{color: '#fff', }}>没有搜索到设备</Text>
				</View>);
			if (this.state.socketMsg)
			{
				this.props.deviceSend(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '没有搜索到设备')
			}
		}
	}
	async componentWillReceiveProps(nextProps)
	{
		this.setState({
			connectStatus: nextProps.connectStatus,
			socketMsg: nextProps.socketMsg,
			user: nextProps.user,
			searchStatus: nextProps.searchStatus,
		})
		console.log(nextProps.socketMsg, '收到的新属性', this.props.socketMsg)
		if (this.guardian)
		{
			if (nextProps.socketMsg && nextProps.socketMsg.sn == 7 && nextProps.socketMsg !== this.props.socketMsg)
			{
				console.log(nextProps.socketMsg, '列表页收到的数据111111111', this.props.socketMsg)

				if (nextProps.socketMsg.name && nextProps.socketMsg.type == 1 && nextProps.socketMsg.url == '设备管理2' )
				{
					var searchDevices = nextProps.socketMsg.name;
					for (var i = 0; i< searchDevices.length; i++)
					{

						searchDevices[i].prevName = searchDevices[i].num;
						searchDevices[i].device_name = searchDevices[i].type === 1 ? '激光治疗手表' : '激光治疗手环'
						searchDevices[i].isCicle = searchDevices[i].type === 1 ? 1 : 0
					}
					this.setState({
						searchDevices: searchDevices,
						searchText: '重新搜索',
						waiting: false,
					})
				}
			}
			else if (nextProps.socketMsg && nextProps.socketMsg.sn == 9 && nextProps.socketMsg !== this.props.socketMsg)
			{
				this.props.remoteLoading(false);
				this.refs.toast.show(nextProps.socketMsg.title);
				if (nextProps.socketMsg.title === '绑定成功')
				{
					this.props.navigation.navigate("GuardianList");
				}
				else if (nextProps.socketMsg.title == "没有搜索到设备")
				{
					this.setState({
						searchText: '重新搜索',
					})
				}
			}
		}
		else
		{
			if (nextProps.socketMsg !== this.props.socketMsg && nextProps.socketMsg.sn == 7)
			{
				if (nextProps.socketMsg.type == 4)
				{
					this.toGuadianData = true;
					this.reSearch({type: nextProps.socketMsg.title, })
				}
				if (nextProps.socketMsg.type == 3)
				{
					console.log("!23123123");
					this.startBind()
				}
				if (nextProps.socketMsg.type == 2 && nextProps.socketMsg.selectSn)
				{
					var devices = this.state.searchDevices;
					var selectedIndex = devices.findIndex(item => {
						return item.device_sn === nextProps.socketMsg.selectSn
					})
					this.onSelect(selectedIndex, nextProps.socketMsg.selectSn)
				}
			}
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
	onSelect(index, value)
	{
		console.log(index, value)
		var user = this.state.user;
		if (index == this.state.index)
		{
			this.setState({
				index: null,
				isOnSelect: true,
				device_sn: '',
			})
		}
		else
		{
			this.setState({
				device_sn: value,
				isOnSelect: false,
				index: index,
			})
			var isSelect = this.state.searchDevices;
			if (this.guardian)
			{
				//选择时发送消息给监护人
				this.props.selectSend(7, user.user_id, this.guardian.underGuardian, '绑定解绑设备', '设备管理2', 2, value, isSelect[index].deviceInfo, index)
			}
		}

	}
	reSearch(res)
	{
		var type = res.type;
		if (this.guardian)
		{
			console.log(this.guardian, '重新搜索');
			// this.props.deviceSend(7, this.guardian.underGuardian, this.guardian.guardian, '重新搜索', '设备管理3', 0, 100);
			this.props.deviceSend(7, this.guardian.underGuardian, this.guardian.guardian, '绑定解绑设备', '设备管理2', 4, 0)

			return;
		}
		if (this.props.bleStatus !== 1)
		{
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>请打开蓝牙</Text>
			</View>)
			return;
		}
		this.setState({
			spinner: true,
		})
		console.log(res,'typesssss')
		type = res.type;
		if (Platform.OS == 'ios')
		{
			this.props.startSearchDevices(this.onStartSearchCallback);

		}
		else
		{
			PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION)
				.then((data) =>
				{
					if (data)
					{
						this.props.startSearchDevices(this.onStartSearchCallback);

					}
					else
					{
						PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION)
							.then((granted) =>
							{
								if (granted === PermissionsAndroid.RESULTS.GRANTED)
								{
									this.props.startSearchDevices(this.onStartSearchCallback);

								}
							})
							.catch(errr => {

							})

					}
				})
				.catch((error) => {

				})
		}
	}
	startBind()
	{
		if (this.guardian)
		{
			var user = this.state.user;
			this.props.remoteLoading(true, "绑定中");
			console.log(user.user_id, this.guardian.underGuardian, '绑定111')
			this.props.deviceSend(7, this.guardian.underGuardian, user.user_id, '绑定解绑设备', '设备管理2', 3, 0)
			return;
		}
		console.log(this.state.connectStatus, '连接的情况')
		this.setState({
			waiting: true,
			spinner: true,
			spinnerText: '绑定中',
		})
		var devices = this.state.searchDevices[this.state.index];
		console.log(devices, this.state.searchDevices, this.state.index, '要绑定的信息')
		this.props.bindDevice(0, devices, this.onBindCallback);

	}

	onBindCallback = res =>
	{
		console.log(res, '绑定的回调');
		this.setState({
			waiting: false,
			spinner: false,
		})
		this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
			<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
			<Text style={{color: '#fff', }}>{res.message}</Text>
		</View>)
		if (res.status === 1)
		{
			DeviceEventEmitter.emit('DeviceSearch', true);
			setTimeout(() =>
			{
				this.props.navigation.navigate('Home');
			}, 1000)
			if (this.state.socketMsg)
			{
				this.props.deviceSend(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '绑定成功');
			}
		}
		else
		{
			if (this.state.socketMsg)
			{
				this.props.deviceSend(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '绑定失败');
			}
		}
	}

	renderEmpty = () =>
	{
		return (<View style={styles.emptyEmpty}>
			<View style={[styles.emptyItem, styles.emptyTitle,]}><Text style={styles.emptyStyle}>添加设备流程</Text></View>
			<View style={styles.emptyItem}><Text style={styles.emptyStyle}>1. 请确认蓝牙已经正常"打开"。</Text></View>
			<View style={styles.emptyItem}><Text style={styles.emptyStyle}>2. 请确认"按一次"设备上的激活"按钮"，已便能搜索出硬件设备。</Text></View>
			<View style={styles.emptyItem}><Text style={styles.emptyStyle}>3. 以上两步操作成功后，点击下方按钮。</Text></View>
		</View>)
	}

	render()
	{
		let list = null ;
		let m = null;
		let renderBtn = null;
		if (!this.state.searchDevices)
		{
			m = (<View style={{height: contentHeight, }}>
				<View style={{flexDirection: 'column',backgroundColor: '#f4f4f4', justifyContent: 'center', alignItems: 'center', }}>
					<View>{this.renderEmpty()}</View>
				</View>
			</View>
			)
		}
		else
		{
			if (this.state.searchDevices.length < 1)
			{
				m = (<View style={{height: contentHeight, }}>
					<View style={{flexDirection: 'column',backgroundColor: '#f4f4f4', justifyContent: 'center', alignItems: 'center', }}>
						<View>{this.renderEmpty()}</View>
					</View>
				</View>
				)
			}
			else
			{
				list = this.state.searchDevices.map((item, index) =>
				{
					return (<RadioButton value={item.device_sn} key={item.id}>
						<View style={styles.list}>
							<View style={styles.contentLeft}>
								<View style={styles.imgStyle}>
									<Image source={item.isCicle ? require('../../img/D98F75F2422DFAA6EDECFB07E4EC6FEC.png') : require('../../img/4504C9A05948F7484AED647093D6F3A9.png')} roundAsCircle={true} style={styles.img} />
								</View>
								<View style={styles.listContent}>
									<Text style={{ color: '#000', fontSize: 20, }}>{item.prevName}号{item.device_name}</Text>
									<Text style={{ color: '#666', }}>设备型号：{item.device_code}</Text>
									<Text style={{ color: '#666', }}>设备编号：{item.device_sn}</Text>
								</View>
							</View>
						</View>
					</RadioButton> )
				})
				m = (<ScrollView style={{height: contentHeight, }}>

					<View style={{flexDirection: 'column', }}>
						<RadioGroup
							onSelect = {(index, value) => this.onSelect(index, value)}
							color={'#ccc'}
							activeColor={'#24a090'}
							selectedIndex={this.state.index}
						>{list}</RadioGroup>
					</View>
				</ScrollView>
				)
			}
		}

		if (this.state.isOnSelect)
		{

			renderBtn = (<View style={styles.bottomBtn}>
				<TouchableOpacity style={styles.btnText} activeOpacity={1} onPress={this.reSearch.bind(this,{type: this.state.searchText, })}>
					<Text style={{color: '#fff', }}>{this.state.searchText}</Text>
				</TouchableOpacity>
			</View>)
		}
		else
		{
			renderBtn = ( <View style={styles.bottomBtn}>
				<TouchableOpacity style={[styles.bindText,{borderColor: '#979797'}, ]} activeOpacity={1} disabled={this.state.waiting} onPress={this.startBind.bind(this)}>
					<Text style={{color: '#fff'}}>提交绑定</Text>
				</TouchableOpacity>
			</View>)
		}
		return (
			<View style={{flex: 1, backgroundColor: "#f3f3f3", }}>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="蓝牙搜索"
					leftIcon="ios-arrow-back"
					leftPress={this.back.bind(this)}
				/>
				{m}
				{renderBtn}
				<Toast
					ref="toast"
					position="center"
					defaultCloseDelay={2000}
				/>
				<Spinner
					visible={this.state.spinner}
					textContent={this.state.spinnerText}
					textStyle={{fontSize: 14, }}
					overlayColor="rgba(0, 0, 0, .25)"
				/>
			</View>
		)
	}
}

function mapStateToProps(state) {
	console.log(state,'子组件的属性')
	return {
		bleStatus: state.ble.bleStatus,
		searchStatus: state.ble.searchStatus,
		connectStatus: state.ble.connectStatus,
		bindStatus: state.user.bindStatus,
		deviceBindStatus: state.ble.deviceBindStatus,
		BleBindMsg: state.ble.bindMsg,
		bindCode: state.ble.bindCode,
		msg: state.ble.msg,
		connectLoadingStatus: state.ble.connectLoadingStatus,
		socketMsg: state.webSocketReducer.socketMsg,
		user: state.loginIn.user,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		startSearchDevices: callback => dispatch(bleActions.startSearchDevices(callback)),
		bindDevice: (status, devices, callback) => dispatch(bleActions.bindDevice(status, devices, callback)),
		addBindSN: (device_sn) => dispatch(bleActions.addBindSN(device_sn)),
		unbindDevice: (device_sn, type) => dispatch(bleActions.unbindDevice(device_sn, type)),
		connectionSucceeded: (s) => dispatch(bleActions.connectionSucceeded(s)),
		setBroadcastDuration: (dic, deviceId) => dispatch(bleActions.setBroadcastDuration(dic, deviceId)),
		bindService: (deviceId, sn) => dispatch(bleActions.bindService(deviceId, sn)),
		deviceSend: (a, b, c, d, e, f, g, h) => dispatch(webSocketActions.deviceSend(a, b, c, d, e, f, g, h)),
		selectSend: (a, b, c, d, e, f, g, h, k) => dispatch(webSocketActions.selectSend(a, b, c, d, e, f, g, h, k)),
		remoteLoading: (status, text) => dispatch(webSocketActions.remoteLoading(status, text)),
		sendMessage: (a, b, c, d, e, f, g, h) => dispatch(webSocketActions.sendMessage(a, b, c, d, e, f, g, h)),
	}
}

export default connect(mapStateToProps,mapDispatchToProps)(BleSearchResultPage)


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
		paddingTop: 10,
		paddingBottom: 10,
	},
	contentLeft: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	hr:
	{
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
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
		alignItems: 'center',
	},
	img: {
		width: 65,
		height: 65,
	},
	listContent: {
		flexDirection: 'column',
		justifyContent: 'space-around',
		alignItems: 'flex-start',
		flex: 1,
		height: 65,
	},
	bottomBtn: {
		width: width,
		height: 100,
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
	},
	btnText: {
		borderRadius: 35,
		width: width - 50,
		height: 45,
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#24a090',
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
		paddingRight: 20,
	},
	emptyEmpty: {
		width: width - 60,
		height: height - 100 - statusBarHeight,
		marginLeft: 30,
		justifyContent: 'center',
		alignItems: "flex-start",
	},
	emptyStyle: {
		fontSize: 18,
		color: '#666',
	},
	emptyItem: {
		width: width - 60,
		marginBottom: 15,
	},
	emptyTitle: {
		justifyContent: 'center',
		alignItems: 'center',
	},
});
