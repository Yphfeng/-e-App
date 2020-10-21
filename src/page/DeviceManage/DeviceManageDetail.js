/**
 * @author lam
 */
'use strict';

import React, {Component, } from 'react'
import {
	Text,
	View,
	StyleSheet,
	BackHandler,
	TouchableOpacity,
	Image,
	Alert,
	Platform,
	TextInput,
	Keyboard,
	Modal,
	ProgressBarAndroid,
	DeviceEventEmitter,
} from 'react-native'
import {ProgressView} from "@react-native-community/progress-view";
import NavBar from '../../common/NavBar'
import Toast, { DURATION, } from 'react-native-easy-toast'
import Icon from 'react-native-vector-icons/Ionicons';
import Modals from "react-native-modal";
import CommonDialog from '../../common/Modal';
import * as Utils from '../../utils/utils';
import { connect, } from 'react-redux'
import * as bleActions from "../../actions/device/bleActions";
import * as deviceService from "../../utils/network/deviceService";
import * as qbDate from '../../utils/qbDate';
import {statusBarHeight, height, width, } from '../../utils/uiHeader';
import * as webSocketActions from '../../actions/webSocketActions';
import * as deviceActions from '../../actions/device/deviceActions';
import Spinner from 'react-native-loading-spinner-overlay';
const contentHeight = height - NavBar.topbarHeight - statusBarHeight;

//FontAwesome
class DeviceManageDetail extends Component
{
	static navigationOptions = {
		header: null,
	}
	constructor(props)
	{
		super(props);
		this.state = {
			isVisible: false,
			dataProgress: this.props.dataProgress,
			progress: 0,
			dataProgressModal: false,
			display: false,
			dic: new Object(),
			user: this.props.user,
			connectStatus: this.props.connectStatus,
			connectedDevice: this.props.connectedDevice,
			spinnerText: '解绑中',
			spinner: false,
		}
		this.device_alias = "";
		this.guardian = null;
		this.spinner = false;
	}
	componentWillMount()
	{
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	async componentDidMount()
	{


		console.log(this.props, '收到的数据状态');
		var device_sn = this.props.navigation.state.params.item.device_sn;
		var guardian = this.props.navigation.state.params ? this.props.navigation.state.params.guardian : null;
		var dic = new Object();
		console.log(guardian, '新的数据信息')
		if (guardian)
		{
			this.guardian = guardian;
			dic.armariumScienceSession = guardian.userToken;
		}
		dic.device_sn = device_sn;
		this.setState({
			dic: dic,
		})
		let detail = await deviceService.getDeviceDetail(dic)
		console.log(detail, '获取的设备1111', this.state)
		if (detail.status == 1)
		{
			var device_code = detail.data.device_code;
			device_sn = detail.data.device_sn;
			if (device_code.indexOf("HA05") > -1|| device_code.indexOf("HA06") > -1)
			{
				var status = 1;
			}
			else
			{
				status = 0;

			}
			var prevName = device_sn.substring(13);
			var name = detail.data.armarium_device_name;
			var armarium_device_name = Utils.stitchingName(name);
			this.setState({
				armarium_device_name: armarium_device_name,
				device_sn: detail.data.device_sn,
				firmware_sn: detail.data.firmware_sn,
				use_course_name: detail.data.use_course_name ? detail.data.use_course_name : '无',
				device_alias: detail.data.device_alias,
				bind_time: detail.data.bind_time,
				device_code: detail.data.device_code,
				status: status,
				prevName: prevName,
				display: true,
			})
		}
		else
		{
			this.setState({
				armarium_device_name: "",
				device_sn: "",
				firmware_sn: "",
				use_course_name: "",
				device_alias: "",
				bind_time: "",
				device_code: '',
			})
		}

	}
	async componentWillReceiveProps(nextProps)
	{
		console.log(nextProps, '收到的新属性')
		this.setState({
			dataProgress: nextProps.dataProgress,
			user: nextProps.user,
			socketMsg: nextProps.socketMsg,
			connectStatus: nextProps.connectStatus,
			connectedDevice: nextProps.connectedDevice,
		})

		if (nextProps.socketMsg && nextProps.socketMsg !== this.props.socketMsg && nextProps.socketMsg.sn == 7)
		{
			if (nextProps.socketMsg.type == 2)
			{
				this.confirmCancel();
			}
			else if (nextProps.socketMsg.type == 3)
			{
				this.confirmCancel();
			}
		}
		else if (nextProps.socketMsg && nextProps.socketMsg.sn == 9)
		{
			this.props.remoteLoading(false)
			if (nextProps.socketMsg.title == "更改成功")
			{
				this.setState({
					isVisible: false,
					device_alias: this.device_alias,
				})
				this.refs.toast.show(nextProps.socketMsg.title)
			}
			else if (nextProps.socketMsg.title == "解绑成功")
			{
				this.refs.toast.show(nextProps.socketMsg.title)
				this.props.navigation.navigate("GuardianList")
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

	//弹出提示
	alert(text, callback)
	{
		Alert.alert('提示', text, [{ text:'确定',onPress:()=>{ callback()} },{text: '取消',onPress: () => {}}]);
	}

	async reName()
	{
		var params = {
			device_sn: this.state.device_sn,
			device_alias: this.device_alias,
		}
		var guardian = this.props.navigation.state.params ? this.props.navigation.state.params.guardian : null;
		if (guardian)
		{
			var user = this.state.user;
			params.armariumScienceSession = guardian.userToken;
			this.props.deviceSend(7, guardian.underGuardian, user.user_id, '绑定解绑设备', '设备管理1', 1, 0, this.device_alias)
			return;
		}


		let result = await deviceService.upDateDeviceAlias(params)
		console.log(result,'别名')
		if (result.status == 1)
		{
			this.setState({
				isVisible: false,
				device_alias: params.device_alias,
			})
			if (this.state.device_sn == this.props.device_sn)
			{
				this.props.upDataDeviceName(params.device_alias);
			}

			this.refs.toast.show("修改成功")
		}
		else
		{
			this.refs.toast.show(result.msg);
		}

	}

	closeKey()
	{
		console.log("!23123123123")
		Keyboard.dismiss();
	}

	cancelBind = () =>
	{
		if (this.state.connectStatus == 4 && this.state.connectedDevice.device_sn === this.state.device_sn)
		{
			this.refs.dConfirm.show({
				thide: true,
				messText: '解绑前会自动上传您的健康数据',
				buttons: [
					{txt: '直接解绑', onpress: this.confirmCancel.bind(this), txtStyle: {fontSize: 16, }, },
					{txt: '取消解绑', txtStyle: {fontSize: 16, }, onpress: this.cancel.bind(this), },
				],
			})
		}
		else
		{
			this.refs.dConfirm.show({
				thide: true,
				messText: '直接解绑设备，可能会导致您的数据丢失',
				buttons: [
					{txt: '确认解绑', txtStyle: {fontSize: 16, }, onpress: this.confirmCancel.bind(this), },
					{txt: '取消解绑', txtStyle: {color: 'rgba(2, 187, 0, 1)', fontSize: 16, }, onpress: this.cancel.bind(this), },
				],
			})
		}
	}

	cancel()
	{
		this.refs.dConfirm.hide();
	}

	confirmCancel = () =>
	{
		if (this.guardian)
		{
			setTimeout(() =>
			{
				this.props.remoteLoading(true, '解绑中...');
				this.props.deviceSend(7, this.guardian.underGuardian, this.state.user.user_id, '绑定解绑设备', '设备管理1', 2)
			}, 1000)
			return;
		}
		if (this.props.dataProgress > 0)
		{
			this.refs.toast.show(
				<View style={{justifyContent: "center", alignItems: 'center'}}>
					<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
					<Text style={{color: '#fff', }}>数据上传中</Text>
				</View>
			);
			return;
		}
		if (this.state.connectStatus === 4 && this.state.connectedDevice.device_sn === this.state.device_sn)
		{
			this.setState({
				dataProgressModal: true,
			})
		}
		else
		{
			this.setState({
				spinner: true,
			});
		}
		this.props.confirmCancel(this.state.dic, this.onUnbindCallback);
	}

	onUnbindCallback = res =>
	{
		console.log(res, '解绑的回调');
		this.setState({
			spinner: false,
		})
		//解绑的回调
		if (res.status === 1)
		{
			this.setState({
				progress: res.progress / 100,
			})
		}
		else if (res.status === 2)
		{
			this.setState({
				dataProgressModal: false,
			})
			this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
				<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
				<Text style={{color: '#fff', }}>{res.message}</Text>
			</View>)
			if (this.state.socketMsg)
			{
				this.props.sendSocketMessage(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, "解绑成功")
			}
			setTimeout(() =>
			{
				DeviceEventEmitter.emit('DeviceSearch', true);
				if (this.props.navigation.state.params.refreshData)
				{
					this.props.navigation.state.params.refreshData()
				}
				this.props.navigation.navigate('DeviceManage');
			}, 1000)
		}
		else if (res.status === 0)
		{
			this.setState({
				dataProgressModal: false,
			})
			setTimeout(() => {
				this.refs.toast.show(<View style={{justifyContent: "center", alignItems: 'center'}}>
					<Icon name="ios-checkmark-outline" size={55} color="#fff"></Icon>
					<Text style={{color: '#fff', }}>{res.message}</Text>
				</View>)
			}, 1000)
			if (this.state.socketMsg)
			{
				this.props.sendSocketMessage(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, "解绑失败")
			}
		}
	}

	renderProgress = () =>
	{
		if (Platform.OS == "android")
		{
			return (
				<View style={styles.progressStyle}>
					<Text style={{color: '#dd9013', paddingBottom: 10}}>{this.state.progress*100}%</Text>
					<ProgressBarAndroid
						styleAttr="Horizontal"
						indeterminate={false}
						progress={this.state.progress}
						style={{width: width - 150,  }}
					/>
				</View>
			)
		}
		else
		{
			return (
				<View style={styles.progressStyle}>
					<Text style={{color: '#dd9013', paddingBottom: 10}}>{this.state.progress*100}%</Text>
					<ProgressView
						progress={this.state.progress}
						progressTintColor="#dd9013"
						style={{width: width - 150,  }}
					/>
				</View>
			)
		}
	}

	render()
	{
		let tips = null, connectText;
		if (this.props.connectStatus !== 4)
		{
			tips = (<View style={{backgroundColor: 'rgba(255,159,0,0.1017)', alignItems: "flex-start", justifyContent: 'center', height: 28, paddingLeft: 10, }} >
				<Text style={{color: '#4A4A4A', }}>请连接设备上传数据，再进行解除绑定!</Text>
			</View>)
		}
		else
		{
			tips = null;
		}

		if (this.state.device_sn == this.props.device_sn && this.props.connectStatus == 1)
		{
			connectText = (<Text style={{borderColor: '#24a090',borderRadius: 10,paddingHorizontal: 6,paddingVertical: 2,borderWidth: 1,color: '#24a090',fontSize: 12,fontWeight: 'bold',marginLeft: 5}}>已连接</Text>)
		}
		else
		{
			connectText = null;
		}
		if (!this.state.display)
		{
			return (
				<View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
					<View style={styles.sBar} backgroundColor={'#24a090'}/>
					<NavBar
						title="设备详情"
						leftIcon="ios-arrow-back"
						leftPress={this.back.bind(this)}
					/>
					<View style={{height: contentHeight - 100, }}>

					</View>
				</View>
			)
		}
		else
		{

			return (
				<View style={{flex: 1, backgroundColor: "#f3f3f3"}}>
					<View style={styles.sBar} backgroundColor={'#24a090'}/>
					<NavBar
						title="设备详情"
						leftIcon="ios-arrow-back"
						leftPress={this.back.bind(this)}
					/>
					<View style={{height: contentHeight - 100, }}>
						{tips}
						<View style={{flexDirection: 'column', backgroundColor: '#F5F5F5', marginTop: 10, }}>
							<View style={styles.list}>
								<View style={styles.contentLeft}>
									<View style={styles.imgStyle}>
										<Image source={this.state.status ? require('../../img/D98F75F2422DFAA6EDECFB07E4EC6FEC.png') : require('../../img/4504C9A05948F7484AED647093D6F3A9.png')} roundAsCircle={true} style={styles.img} />
									</View>
									<View style={styles.listContent}>
										<View style={{flexDirection: 'row',justifyContent: 'center',alignItems: 'center'}}>
											<Text numberOfLines={1} style={{ color: '#000',fontSize: 18,fontWeight: 'bold'}}>{this.state.prevName}号{this.state.device_alias ? this.state.device_alias : this.state.armarium_device_name }</Text>
											{connectText}
										</View>
										<View style={{flexDirection: 'row', paddingTop: 10, }}>
											<Text style={{ color: '#7f8389', paddingRight: 5, }}>{this.state.bind_time ? qbDate.DateFormat(this.state.bind_time, 0) : null}</Text>
											<Text style={{ color: '#7f8389', paddingRight: 5, }}>{this.state.bind_time ? qbDate.DateFormat(this.state.bind_time, 1) : null}</Text>
											<Text style={{ color: '#7f8389', paddingRight: 5, }}>绑定</Text>
										</View>

									</View>
								</View>
								<TouchableOpacity onPress={() => this.setState({isVisible: true, })}><Image source={require("../../img/edit.png")} /></TouchableOpacity>
							</View>
						</View>
						<View style={styles.content}>
							<View style={styles.contentItem}><Text>设备类型:</Text><Text>{this.state.armarium_device_name}</Text></View>
							<View style={styles.contentItem}><Text>设备型号:</Text><Text>{this.state.device_code}</Text></View>
							<View style={styles.contentItem}><Text>设备编号:</Text><Text>{this.state.device_sn}</Text></View>
							<View style={styles.contentItem}><Text>固件版本:</Text><Text>{this.state.firmware_sn}</Text></View>
							<View style={styles.contentItem}><Text>使用疗程:</Text><Text>{this.state.use_course_name}</Text></View>
						</View>
					</View>
					<View style={{height: 100, justifyContent: 'center', alignItems: 'center', }}>
						<TouchableOpacity style={styles.btnAdd} onPress={this.cancelBind}>
							<Text style={{color: '#fff'}}>解除绑定</Text>
						</TouchableOpacity>
					</View>
					<CommonDialog types={'confirm'} ref="dConfirm" />
					<Modal
						animationType="fade"
						transparent={true}
						visible={this.state.dataProgressModal}
						onRequestClose={() => { }}
					>
						<View style={styles.modalContent}>
							<View style={styles.modalProgressInner}>

								<View style={[styles.modalBody, {paddingTop: 20, }]}>
									<Text>数据正在上传，请稍等片刻，此过程可能需要3-5分钟</Text>
									{this.renderProgress()}
								</View>
							</View>
						</View>
					</Modal>
					<Modals
						isVisible={this.state.isVisible}
						onBackdropPress={() => this.setState({ isVisible: false, })}
						hideModalContentWhileAnimating={true}
						useNativeDriver={true}
					>
						<TouchableOpacity style={styles.modalContext} onPress={this.closeKey.bind(this)} activeOpacity={1}>
							<View style={styles.modalInner}>
								<View style={{justifyContent: 'center', alignItems: 'center', }}>
									<Text style={{fontSize: 17, color: '#333333', paddingBottom: 10, }}>设备命名</Text>
									<Text style={{fontSize: 11, color: '#666', paddingBottom: 10, }}>昵称字数请控制在15字以内</Text>
								</View>
								<View style={{width: 220, borderBottomColor: '#ccc', borderBottomWidth: 1, paddingVertical: 3, }}>
									<TextInput
										placeholder="请输入设备昵称"
										style={{textAlign: 'center', fontSize: 18, }}
										placeholderTextColor="#ccc"
										underlineColorAndroid="transparent"
										onChangeText={(device_alias) => this.device_alias = device_alias }
										maxLength={15}
									/>
								</View>
								<View style={{flexDirection: 'row', justifyContent: 'space-around', alignItems: "center", width: 220, marginTop: 20, }}>
									<TouchableOpacity style={[styles.cancel, styles.btn, ]} onPress={()=> this.setState({isVisible: false, })}>
										<Text style={{color: '#7F8389', }}>取消</Text>
									</TouchableOpacity>
									<TouchableOpacity style={[styles.rename, styles.btn, ]} onPress={this.reName.bind(this)}>
										<Text style={{color: '#fff', }}>确定</Text>
									</TouchableOpacity>
								</View>
							</View>
						</TouchableOpacity>
					</Modals>
					<Spinner
						visible={this.state.spinner}
						textContent={this.state.spinnerText}
						textStyle={{fontSize: 14, }}
					/>
					<Toast
						ref="toast"
						position="center"
						defaultCloseDelay={2000}
					/>
				</View>
			)
		}
	}
}

function mapStateToProps(state)
{
	return {
		msg: state.ble.deviceMsg,
		connectedDevice: state.ble.connectedDevice,
		connectStatus: state.ble.connectStatus,
		dataProgress: state.ble.dataProgress,
		deviceInformation: state.ble.deviceInformation,
		firmWare: state.ble.firmWare,
		user: state.loginIn.user,
		socketMsg: state.webSocketReducer.socketMsg,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		confirmCancel: (dic, callback) => dispatch(deviceActions.confirmCancel(dic, callback)),
		upDataDeviceName: (s) => dispatch(bleActions.upDataDeviceName(s)),
		getDataProgress: (s) => dispatch(bleActions.getDataProgress(s)),
		deviceSend: (a, b, c, d, e, f, g, h) => dispatch(webSocketActions.deviceSend(a, b, c, d, e, f, g, h)),
		remoteLoading: (status, text) => dispatch(webSocketActions.remoteLoading(status, text)),
		sendSocketMessage: (a, b, c, d,) => dispatch(webSocketActions.sendMessage(a, b, c, d,)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DeviceManageDetail)


const styles = StyleSheet.create({
	wholeBleModal: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	bleModal: {
		width: width - 100,
		height: 200,
		backgroundColor: '#000',
		justifyContent: 'center',
		alignItems: 'center',
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
		justifyContent: 'space-around',
		alignItems: 'center',
		width: width - 20,
		marginLeft: 10,
		marginRight: 10,
		marginBottom: 10,
		backgroundColor: '#fff',
		paddingHorizontal: 10,
		borderRadius: 4,
	},
	contentLeft: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
		paddingTop: 20,
		paddingBottom: 20,
		borderColor: '#f4f4f4',

	},
	hr: {
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
		justifyContent: 'center',
		alignItems: 'flex-start',
		flex: 1,
	},
	btnAdd: {
		height: 40,
		width: width - 40,
		backgroundColor: '#24a090',
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	btn: {
		width: 87,
		height: 33,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
	},
	cancel: {
		borderColor: '#666',
	},
	rename: {
		borderColor: '#24A090',
		backgroundColor: '#24A090',
	},
	content: {
		flexDirection: 'column',
		width: width - 20,
		marginLeft: 10,
		marginRight: 10,
		backgroundColor: '#fff',
		paddingHorizontal: 20,
		paddingTop: 30,
		paddingBottom: 20,
	},
	contentItem: {
		flexDirection: 'row',
		justifyContent: "space-between",
		alignItems: 'center',
		paddingBottom: 10,
		borderRadius: 4,
	},
	modalContext: {
		width: width - 80,
		marginLeft: 20,
		marginRight: 20,
		height: 200,
		backgroundColor: '#fff',
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		justifyContent: "center",
		alignItems: 'center',
		height: height,
		backgroundColor: 'rgba(111,87,87,.4)',
	},
	modalinner: {
		width: width - 50,
		marginLeft: 25,
		marginRight: 25,
		height: 180,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
	},
	modalProgressInner: {
		width: width - 100,
		marginLeft: 25,
		marginRight: 25,
		height: 150,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 10,
	},
	modalBody: {
		paddingHorizontal: 20,
		paddingTop: 10,
		justifyContent: "flex-start",
		alignItems: "flex-start",
		width: width - 100,
		flex: 1,
	},
	progressStyle: {
		width: width - 150,
		justifyContent: 'center',
		alignItems: 'center',
		flex: 1,
	},
	textTitle: {
		fontSize: 16,
	},
});
