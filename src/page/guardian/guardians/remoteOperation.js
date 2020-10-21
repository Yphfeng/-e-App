
/**
 * @author lam
 */
'use strict';

import React, {Component,} from 'react'
import {
	Text,
	View,
	StyleSheet,
	StatusBar,
	Dimensions, BackHandler,
	TouchableOpacity,
	Alert,
	Modal,
	ScrollView,
	Image,
} from 'react-native'
import NavBar from '../../../common/NavBar'
import Toast, { DURATION } from 'react-native-easy-toast'
import { connect, } from 'react-redux'
import {statusBarHeight, height, width, } from '../../../utils/uiHeader';
import Icon from 'react-native-vector-icons/Ionicons'
import * as webSocketActions from '../../../actions/webSocketActions';
import * as bleActions from '../../../actions/device/bleActions';
import * as guardianActions from '../../../actions/device/guardianActions';
import * as Utils from '../../../utils/utils';
const contentHeight = height - NavBar.topbarHeight - statusBarHeight
const currentHeight = statusBarHeight;

class RemoteOperation extends Component
{
	static navigationOptions = {
		header: null,
	}
	constructor(props)
	{
		super(props);
		this.state = {
			user: this.props.user,
			typeArr: [],
			socketMsg: this.props.socketMsg,
			modalVisible: false,
			guardian: this.props.guardian,
		};
		this.isConnect = false;
	}
	componentWillMount() {

		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount()
	{

	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
	}

	onBackAndroid = () => {
		var refreshData = this.props.navigation.state.params.refreshData;
		if (refreshData)
		{
			refreshData();
		}
		this.props.beGuardian(null);
		this.props.navigation.goBack();
		return true;
	};

	componentWillReceiveProps(newProps)
	{
		console.log(newProps, 'qweqwe');
		this.setState({
			user: newProps.user,
			socketMsg: newProps.socketMsg,
			guardian: newProps.guardian,
		})
		var socketMsg = newProps.socketMsg;
		if (socketMsg !== this.props.socketMsg)
		{
			if (socketMsg && socketMsg.sn == 12)
			{
				if (this.isConnect)
				{
					return;
				}
				if (socketMsg.type === 2)
				{
					console.log('连接的数据23123123123', socketMsg)
					this.props.remoteLoading(false);
					this.setState({
						typeArr: socketMsg.devices,
						modalVisible: true,
					})
				}
				if (socketMsg.title == "没有搜索到设备")
				{
					this.refs.toast.show(socketMsg.title)
				}
			}
			if (socketMsg && socketMsg.sn == 9)
			{
				this.props.remoteLoading(false);
				this.refs.toast.show(
					<View style={{justifyContent: "center", alignItems: 'center'}}>
						<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
						<Text style={{color: '#fff', }}>{socketMsg.title}</Text>
					</View>
				)
			}
			if (socketMsg && socketMsg.sn == 0)
			{
				this.props.remoteLoading(false);
				this.refs.toast.show(
					<View style={{justifyContent: "center", alignItems: 'center'}}>
						<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
						<Text style={{color: '#fff', }}>{socketMsg.msg}</Text>
					</View>
				)
			}
		}

	}

	back() {
		var refreshData = this.props.navigation.state.params.refreshData;
		if (refreshData)
		{
			refreshData();
		}
		this.props.beGuardian(null);
		this.props.navigation.pop();
	}

	/**远程连接设备 */
	remoteConnect = () =>
	{
		this.isConnect = false;
		var item = this.state.guardian;
		var user = this.state.user;
		console.log(user, '12123');
		if (!user)
		{
			return;
		}
		this.props.remoteLoading(true, "连接中");
		console.log(item, user, '连接的属性123')
		this.props.bletoolSend(12, item.underGuardian, user.user_id, "连接设备", '连接设备', 1);
	}
	remoteUpdata = () =>
	{
		//数据上传
		// webSocketActions.sendMessage();
		var item = this.state.guardian;
		var user = this.state.user;
		console.log(user, '12123');
		if (!user)
		{
			return;
		}
		this.props.remoteLoading(true, "上传中");
		this.props.sendMessage(2, item.underGuardian, user.user_id, "数据上传");
	}

	saveInfo = () =>
	{
		var item = this.state.guardian;
		var user = this.state.user;
		if (!user)
		{
			return;
		}
		this.props.navigation.navigate("MineProfilePage", {guardian: item, })
	}

	healthManager = () =>
	{
		var item = this.state.guardian;
		var user = this.state.user;
		if (!user)
		{
			return;
		}
		this.props.beGuardian(item);
		this.props.navigation.navigate("MyCourse", {guardian: item})
		setTimeout(() => {
			this.props.sendMessage(4, item.underGuardian, user.user_id, "健康管理");
		}, 1000)
	}

	healthService = () =>
	{
		var item = this.state.guardian;
		var user = this.state.user;
		if (!user)
		{
			return;
		}
		this.props.beGuardian(item);

		this.props.navigation.navigate("IsBuyCourse", {guardian: item})

		this.props.serviceMessage(5, item.underGuardian, user.user_id, "健康服务", "健康服务", 0);
	}

	bindDevice = () =>
	{
		var item = this.props.navigation.state.params ? this.props.navigation.state.params.item : null;
		var user = this.state.user;
		if (!user)
		{
			return;
		}
		this.props.navigation.navigate("DeviceManage", {guardian: item, })

		this.props.deviceSend(7, item.underGuardian, user.user_id, "绑定解绑设备", "设备管理", 0);
	}

	remoteDeviceService = () => {
		var item = this.props.navigation.state.params.item;
		var user = this.state.user;
		if (!user)
		{
			return;
		}
		this.props.navigation.navigate("BleTool", {guardian: item, })
		setTimeout(() => {
			this.props.bletoolSend(8, item.underGuardian, user.user_id, '设备应用', '设备应用', 0);
		}, 1000)
	}

	goAir = () =>
	{
		var item = this.state.guardian;
		var user = this.state.user;
		if (!user)
		{
			return;
		}
		this.props.navigation.navigate("AirUpdata", {guardian: item, })

		this.props.sendMessage(6, item.underGuardian, user.user_id, "空中升级", 0);
	}

	connectDirect = item =>
	{
		//监护人操作
		this.setState({
			modalVisible: false,
		});
		this.isConnect = true;
		var aitem = this.props.navigation.state.params.item;
		var user = this.state.user;
		if (!user)
		{
			return;
		}
		var guardian = this.state.guardian;
		guardian.deviceSn = item.device_sn;
		this.props.beGuardian(guardian);

		setTimeout(() =>
		{
			this.props.remoteLoading(true, '连接中');
			console.log(aitem, '监护人信息', item, )
			this.props.multipleSend(12, user.user_id, aitem.underGuardian, '连接设备', '连接设备', 4, item);
		}, 1000)
	}

	renderList = () => {
		var typeArr = this.state.typeArr;
		if (typeArr.length < 1)
		{
			return null;
		}
		var viewList = typeArr.map(item =>
		{
			var signal = null;
			if (item.livel == 1)
			{
				signal = <Image style={styles.siginal} source={require("../../../img/blueToolth_strong.png")} />
			}
			else if (item.livel == 2)
			{
				signal = <Image style={styles.siginal} source={require("../../../img/blueToolth_middle.png")} />
			}
			else
			{
				signal = <Image style={styles.siginal} source={require("../../../img/blueToolth_small.png")} />
			}
			var name = item.device_name;
			var device_name = Utils.stitchingName(name);
			return (<View key={item.id} style={styles.deviceList}>
				<View style={styles.deviceWholeicon}>
					<Image source={item.isCicle ? require('../../../img/D98F75F2422DFAA6EDECFB07E4EC6FEC.png') : require('../../../img/4504C9A05948F7484AED647093D6F3A9.png')} resizeMode="contain" style={styles.deviceIcon} />
				</View>
				<View style={{height: 60, justifyContent: 'space-around',}}>
					<View style={styles.proName}><Text style={{fontSize: 16, }}>{item.prevName}号{device_name}</Text>{signal}</View>
					<View><Text style={{fontSize: 14, }}>编号：{item.device_sn}</Text></View>
				</View>
				<TouchableOpacity
					style={styles.connectBtn}
					onPress={() => this.connectDirect(item)}
				>
					<Text style={{color: '#fff'}}>连接</Text>
				</TouchableOpacity>
			</View>)
		})
		return viewList
	}

	closeDevice = () =>
	{
		this.setState({
			modalVisible: false,
		})
	}

	render()
	{

		let NavBarContent = null;
		let statusBar = null;

		NavBarContent = (<NavBar
			title="功能操作"
			leftIcon="ios-arrow-back"
			leftPress={this.back.bind(this)}
		/>)
		statusBar = (<StatusBar
			backgroundColor={"#24A090"}
			barStyle={this.props.barStyle || 'light-content'}
			translucent={true}
			style={styles.statusBarHeight}
		/>)

		return (
			<View style={{flex: 1,backgroundColor: "#ddd"}}>
				{statusBar}
				<View style={styles.statusBarHeight} backgroundColor={this.state.isFullScreen ? "#000" : '#24A090'}/>
				{NavBarContent}
				<View style={styles.container}>
					<View style={styles.header}><Text style={{color: '#666', }}>连接蓝牙可用功能</Text></View>
					<View style={styles.listWhole}>
						<TouchableOpacity
							style={styles.listItem}
							onPress={this.remoteConnect}
						>
							<Text>连接设备</Text>
							<Icon name="ios-arrow-forward" size={24} color={"#ccc"}></Icon>
						</TouchableOpacity>
						{/*<TouchableOpacity
							style={styles.listItem}
							onPress={this.remoteUpdata}
						>
							<Text>数据上传</Text>
							<Icon name="ios-arrow-forward" size={24} color={"#ccc"}></Icon>
						</TouchableOpacity>*/}
						<TouchableOpacity
							style={styles.listItem}
							onPress={this.saveInfo}
						>
							<Text>个人信息完善</Text>
							<Icon name="ios-arrow-forward" size={24} color={"#ccc"}></Icon>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.listItem}
							onPress={this.healthManager}
						>
							<Text>健康管理</Text>
							<Icon name="ios-arrow-forward" size={24} color={"#ccc"}></Icon>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.listItem}
							onPress={this.healthService}
						>
							<Text>健康服务</Text>
							<Icon name="ios-arrow-forward" size={24} color={"#ccc"}></Icon>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.listItem}
							onPress={this.goAir}
						>
							<Text>空中升级</Text>
							<Icon name="ios-arrow-forward" size={24} color={"#ccc"}></Icon>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.listItem}
							onPress={this.bindDevice}
						>
							<Text>绑定解绑设备</Text>
							<Icon name="ios-arrow-forward" size={24} color={"#ccc"}></Icon>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.listItem, {borderBottomWidth: 0, }]}
							onPress={this.remoteDeviceService}
						>
							<Text>设备应用</Text>
							<Icon name="ios-arrow-forward" size={24} color={"#ccc"}></Icon>
						</TouchableOpacity>
					</View>
					<View style={styles.tips}><Text style={{color: 'red'}}>用户需在App中连接蓝牙后，监护人才能进行操控这些功能</Text></View>
					<Modal
						animationType="none"
						transparent={true}
						visible={this.state.modalVisible}
						onRequestClose={() => {
							this.setState({modalVisible: false, })
						}}
					>
						<View style={styles.modalContent}>
							<View style={styles.listContent}>
								<View style={styles.activeTitle}>
									<Text>请选择您要连接的设备</Text>
									<TouchableOpacity
										style={styles.modalIcon}
										onPress={this.closeDevice}
									>
										<Icon name="ios-close-outline" size={36} color="#000"></Icon>
									</TouchableOpacity>
								</View>
								<ScrollView style={styles.searchDevicesContent}>
									<View style={styles.deviceContent}>
										{this.renderList()}
									</View>
								</ScrollView>
							</View>
						</View>

					</Modal>
				</View>
				<Toast
					ref="toast"
					position={'center'}
				/>
			</View>
		)
	}
}

function mapStateToProps(state)
{
	console.log(state, '子组件的属性')
	return {
		user: state.loginIn.user ? state.loginIn.user : null,
		socketMsg: state.webSocketReducer.socketMsg,
		guardian: state.webSocketReducer.guardian,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		sendMessage: (a, b, c, d, e, f, g) => dispatch(webSocketActions.sendMessage(a, b, c, d, e, f, g)),
		serviceMessage: (a, b, c, d, e, f, g) => dispatch(webSocketActions.serviceSend(a, b, c, d, e, f, g)),
		deviceSend: (a, b, c, d, e, f, g, h) => dispatch(webSocketActions.deviceSend(a, b, c, d, e, f, g, h)),
		bletoolSend: (a, b, c, d, e, f, g, h) => dispatch(webSocketActions.bletoolSend(a, b, c, d, e, f, g, h)),
		remoteLoading: (status, text) => dispatch(webSocketActions.remoteLoading(status, text)),
		multipleSend: (a, b, c, d, e, f, g) => dispatch(webSocketActions.multipleSend(a, b, c, d, e, f, g)),
		beGuardian: guardian => dispatch(webSocketActions.bleGuardian(guardian)),

	}
}

export default connect(mapStateToProps, mapDispatchToProps)(RemoteOperation)


const styles = StyleSheet.create({
	container: {
		marginHorizontal: 15,
	},
	statusBarHeight: {
		height: statusBarHeight,
		width: width,
	},
	header: {
		paddingVertical: 30,

	},
	listWhole: {
		width: width - 30,
		backgroundColor: '#fff',
		borderRadius: 10,
		paddingHorizontal: 10,
		paddingVertical: 10,
	},
	listItem: {
		flexDirection: 'row',
		borderBottomColor: '#ccc',
		borderBottomWidth: 1,
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 7,
	},
	tips: {
		marginTop: 20,
	},
	modalContent: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: width,
		height: height - statusBarHeight - NavBar.topbarHeight,
		backgroundColor: 'rgba(0,0,0,.5)',
		marginTop: statusBarHeight + NavBar.topbarHeight,
		justifyContent: 'center',
		alignItems: 'center',
	},
	listContent: {
		width: width - 50,
		backgroundColor: '#fff',
		height: 400,
		borderRadius: 8,
	},
	listTitle: {
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',
	},
	content: {
		flex: 1,
		justifyContent: 'space-around',
		alignItems: 'flex-start',
	},
	contentText: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	optArea: {
		flex: 1,
		flexDirection: 'column',
		marginTop: 12,
		marginBottom: 12,
	},
	modalIcon: {
		position: 'absolute',
		height: 60,
		justifyContent: 'center',
		alignItems: 'center',
		right: 10,
		top: 0,
	},
	deviceWholeicon: {
		height: 60,
		justifyContent: 'center',
		alignItems: 'center',
	},
	deviceIcon: {
		width: 60,
		height: 60,
	},
	deviceList: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 15,
		height: 60,
	},
	deviceContent: {
		paddingHorizontal: 10,
	},
	connectBtn: {
		backgroundColor: '#1D8B7A',
		borderRadius: 15,
		width: 60,
		height: 30,
		justifyContent: 'center',
		alignItems: 'center',
	},
	activeDevice: {
		borderRadius: 10,
		backgroundColor: '#fff',
		width: width - 100,
		height: width - 100,
		position: 'absolute',
		top: height/2 - (width - 100)/2,
		marginLeft: 50,
		zIndex: 2,
		alignItems: 'center',
	},
	activeImg: {
		width: 89,
		height: 140,
	},
	activeTitle: {
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',
	},
	proName: {
		flexDirection: 'row',
	},
	siginal: {
		marginLeft: 5,
	},
	searchDevicesContent: {
		height: 150,
	},
});
