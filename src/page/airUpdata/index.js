/* eslint-disable comma-dangle */
/* eslint-disable no-mixed-spaces-and-tabs */
import React, {Component, } from 'react';
import {
	Image,
	StyleSheet,
	BackHandler,
	View,
	ActivityIndicator,
	TouchableOpacity,
	Text,
	Platform,
	Alert,
	DeviceEventEmitter,
	Modal,
} from 'react-native';
import NavBar from '../../common/NavBar'
import { connect, } from 'react-redux'
import Toast, { DURATION, } from 'react-native-easy-toast'
import * as deviceService from '../../utils/network/deviceService';
import * as bleDataHandle from '../../utils/ble/application/data/bleDataHandle'
import * as bleActions from "../../actions/device/bleActions";
import {statusBarHeight, height, width, } from '../../utils/uiHeader';
import * as webSocketActions from '../../actions/webSocketActions';
const contentHeight = height - NavBar.topbarHeight - statusBarHeight

class AirUpdata extends Component
{
    static navigationOptions =
    {
    	header: null,
    };

    constructor(props)
    {
    	super(props);
    	this.state = {
    		isStartUpdata: false,
    		progressBarValue: 0,
    		upDataDetail: '升级说明',
    		upDataStatus: 1,
    		airUpdataStatus: 1,
    		isNew: false,
    		isUpDataProgressFail: false,
    		progress: this.props.dataProgress/100,
    		dataProgress: this.props.dataProgress,
    		dataProgressModal: false,
    		deviceInformation: this.props.deviceInformation,
    		socketMsg: this.props.socketMsg,
			user: this.props.user,
    		spinner: false,
			spinnerText: '正在升级...',
			connectStatus: this.props.connectStatus,
			barWidth: 0,
		};
		this.guardian = null;
    }

    componentWillMount()
    {
    	BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }

    componentWillUnmount()
    {
    	BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    	this.progressSuccess && clearTimeout(this.progressSuccess);
    	this.airUpdata && clearTimeout(this.airUpdata);
    	this.listener && this.listener.remove();
    }

	onBackAndroid = () =>
	{
		this.props.navigation.goBack();
		return true;
	};

	componentDidMount()
	{
		var _that = this;
		console.log(this.props, '获取新的数据');
		var dic = new Object();
		var guardian = this.props.navigation.state.params ? this.props.navigation.state.params.guardian : null;
		if (guardian)
		{
			this.guardian = guardian;
			dic.armariumScienceSession = guardian.userToken;
			return;
		}
		if (this.props.connectStatus === 4)
		{
			if (this.props.socketMsg)
			{
				this.props.sendSocketMessage(6, this.props.socketMsg.guardian, this.props.socketMsg.underGuardian, "空中升级1", 0, this.props.firmWare);
			}
			var versionRealty = this.props.firmWare ? this.props.firmWare.firmwareVersion.substring(1, 2) + '.' + this.props.firmWare.firmwareVersion.substring(2, 3) + '.' + this.props.firmWare.firmwareVersion.substring(3) : null;
			var str = this.props.firmWare.firmwareVersion && this.props.firmWare.firmwareVersion.substring(1,5);
			this.setState({
				productModle: this.props.firmWare ? this.props.firmWare.productModle : null,
				firmwareVersion: "V" + versionRealty,
			})
			deviceService.checkVersion({
				// eslint-disable-next-line camelcase
				firmware_code: this.props.firmWare ? this.props.firmWare.productModle : null,
				// eslint-disable-next-line camelcase
				version_sn: str,
				armariumScienceSession: dic.armariumScienceSession,

			})
				.then((res) =>
				{
					console.log(res, '检查最新版本号')
					if (res.status == 2)
					{
						this.setState({
							upDataDetail: res.msg,
							upDataStatus: 1,
							newFirmwareVersion: "V" + versionRealty,
						})

					}
					else if (res.status == 1)
					{
						this.setState({
							upDataDetail: '升级说明',
							upDataStatus: 0,
							newFirmwareVersion: 'V' + res.data.version_sn,
							newFirmwareVersionName: res.data.version_sn,
							// eslint-disable-next-line comma-dangle
							newPproductModle: res.data.firmware_code,
							isNew: true,
							destribtion: res.data.description
						})
						deviceService.getUploadUrl({
							// eslint-disable-next-line camelcase
							firmware_code: res.data.firmware_code,
							// eslint-disable-next-line camelcase
							version_sn: res.data.version_sn,
							armariumScienceSession: dic.armariumScienceSession,
						})
							.then(res =>
							{
								console.log(res, '固件下载地址');
								if (res.status == 1)
								{
									DeviceEventEmitter.emit("getUploadUrl", res.data.url)
								}

							})
							.catch(err =>
							{

							})
					}
					else
					{
						this.setState({
							upDataDetail: '暂无可升级版本',
							upDataStatus: 1,
							newFirmwareVersion: "",
						})
					}
				})
				.catch(err =>
				{
					this.setState({
						upDataDetail: '暂无可升级版本',
						upDataStatus: 1,
						newFirmwareVersion: "",
					})
				})
		}
		else
		{
			if (this.state.socketMsg)
			{
				this.props.airSend(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '被监护人设备未连接')
			}
		}
		this.listener =DeviceEventEmitter.addListener('bleChange', function(isOn)
		{
			console.log(isOn, '空中升级111')
			if (!isOn)
			{
				_that.setState({
					isUpDataProgressFail: false,
					dataProgressModal: false,
				})
				_that.refs.toast.show('蓝牙未开启')
			}
			//  use param do something
		});
		this.dfuListener = DeviceEventEmitter.addListener('dfu_UpLoad', () => {
			this.setState({
				isUpDataProgressFail: false,
				dataProgressModal: false,
				spinner: false,
			})
			this.refs.toast.show('升级失败,请重试')
			if (this.state.socketMsg)
			{
				this.props.airSend(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '升级失败')
			}

		})
	}

	getDeviceInfo(newProps)
	{
		var guardian = this.guardian;
		var versionRealty = newProps.socketMsg.firmWare ? newProps.socketMsg.firmWare.firmwareVersion.substring(1, 2) + '.' + newProps.socketMsg.firmWare.firmwareVersion.substring(2, 3) + '.' + newProps.socketMsg.firmWare.firmwareVersion.substring(3) : null;
		var str = newProps.socketMsg.firmWare.firmwareVersion && newProps.socketMsg.firmWare.firmwareVersion.substring(1,5);
		this.setState({
			productModle: newProps.socketMsg.firmWare ? newProps.socketMsg.firmWare.productModle : null,
			firmwareVersion: "V" + versionRealty,
		})
		deviceService.checkVersion({
			// eslint-disable-next-line camelcase
			firmware_code: newProps.socketMsg.firmWare ? newProps.socketMsg.firmWare.productModle : null,
			// eslint-disable-next-line camelcase
			version_sn: str,
			armariumScienceSession: guardian.userToken,
		})
			.then((res) =>
			{
				console.log(res, '检查最新版本号')
				if (res.status == 2)
				{
					this.setState({
						upDataDetail: res.msg,
						upDataStatus: 1,
						newFirmwareVersion: "V" + versionRealty,
					})

				}
				else if (res.status == 1)
				{
					this.setState({
						upDataDetail: '升级说明',
						upDataStatus: 0,
						newFirmwareVersion: 'V' + res.data.version_sn,
						newFirmwareVersionName: res.data.version_sn,
						// eslint-disable-next-line comma-dangle
						newPproductModle: res.data.firmware_code,
						isNew: true,
						destribtion: res.data.description
					})
					deviceService.getUploadUrl({
						// eslint-disable-next-line camelcase
						firmware_code: res.data.firmware_code,
						// eslint-disable-next-line camelcase
						version_sn: res.data.version_sn,
						armariumScienceSession: guardian.userToken,
					})
						.then(res =>
						{
							console.log(res, '固件下载地址');
							if (res.status == 1)
							{
								DeviceEventEmitter.emit("getUploadUrl", res.data.url)
							}

						})
						.catch(err =>
						{

						})
				}
				else
				{
					this.setState({
						upDataDetail: '暂无可升级版本',
						upDataStatus: 1,
						newFirmwareVersion: "",
					})
				}
			})
			.catch(err =>
			{
				this.setState({
					upDataDetail: '暂无可升级版本',
					upDataStatus: 1,
					newFirmwareVersion: "",
				})
			})

	}

	componentWillReceiveProps(newProps)
	{
		console.log(newProps, '新的属性11')
		this.setState({
			socketMsg: newProps.socketMsg,
			user: newProps.user,
			airUpdataMsg: newProps.airUpdataMsg,
			connectStatus: newProps.connectStatus,
			bleStatus: newProps.bleStatus,
		})
		this.setState({
			deviceInformation: newProps.deviceInformation,
		})
		if (this.guardian)
		{
			if (newProps.socketMsg && newProps.socketMsg.sn == 6)
			{
				if (newProps.socketMsg.firmWare && newProps.socketMsg.firmWare !== 0)
				{
					this.getDeviceInfo(newProps)
				}
			}
		}
		else
		{
			if (newProps.socketMsg && newProps.socketMsg.sn == 6 && newProps.socketMsg !== this.props.socketMsg )
			{
				if (newProps.socketMsg.type == 1)
				{
					this.upDataAir();
				}
			}
		}
		if (this.guardian)
		{
			if (newProps.socketMsg && newProps.socketMsg.sn == 9 && newProps.socketMsg !== this.props.socketMsg)
			{
				if (newProps.socketMsg.title == '升级成功')
				{
					this.props.remoteLoading(false);
					this.refs.toast.show(newProps.socketMsg.title)
					setTimeout(() => {
						this.props.navigation.navigate("RemoteOperation")
					}, 1000)
				}
				else if (newProps.socketMsg.title == '升级失败')
				{
					this.props.remoteLoading(false);
					this.refs.toast.show(newProps.socketMsg.title)
				}
				else if (newProps.socketMsg.title == '被监护人设备未连接')
				{
					this.props.remoteLoading(false);
					this.refs.toast.show(newProps.socketMsg.title)
				}
				else
				{
					this.props.remoteLoading(true, '升级中');
				}

			}
		}

	}

	back()
	{
		this.props.navigation.pop();
	}

	explain()
	{
		if (!this.state.isNew)
		{
			return;
		}
		this.props.navigation.navigate("UpDataExplain", {note: this.state.newFirmwareVersion, destribtion: this.state.destribtion})
	}

	goConnect()
	{
		this.props.navigation.navigate("Main");
	}

	alert(title="提示", text)
	{
		Alert.alert(title,
			text,
			[
				{
					text: '取消',
					onPress: () => {}
				},
				{
					text: '确定',
					onPress: () => {}
				},
			],
			{
				cancelable: true,
				onDismiss: () => {
				}
			});
	}


	upData()
	{
		if (this.guardian)
		{
			this.setState({
				isUpDataProgressFail: !this.state.isUpDataProgressFail,
			})
		}
		else
		{
			if (this.props.connectStatus == 4)
			{

				this.setState({
					isUpDataProgressFail: !this.state.isUpDataProgressFail,
				})
			}
			else
			{
				this.refs.toast.show('请连接设备')
			}
		}
	}

	closeModal = () =>
	{
		this.setState({
			dataProgressModal: false,
		})
	}



	renderProgress = () =>
	{
		if (Platform.OS == "android")
		{
			return (
				<View style={styles.progressStyle}>
					<Text style={{color: '#fff'}}>{parseInt(this.state.progressBarValue)}%</Text>
					<View style={{width: width - 150, height: 8, justifyContent: 'flex-start', alignItems: 'flex-start',  }}>
						<View style={{width: width - 150, height: 8, backgroundColor: '#000'  }}></View>
						<View style={[styles.progressValue, {width: this.state.barWidth}]}></View>
					</View>

				</View>
			)
		}
		else
		{
			return (
				<View style={styles.progressStyle}>
					<Text style={{color: '#fff'}}>{this.state.progressBarValue}%</Text>
					<View style={{width: width - 150, height: 8, justifyContent: 'flex-start', alignItems: 'flex-start',  }}>
						<View style={{width: width - 150, height: 8, backgroundColor: '#000'  }}></View>
						<View style={[styles.progressValue, {width: this.state.barWidth}]}></View>
					</View>
				</View>
			)
		}
	}

	upDataAir = () =>
	{
		this.setState({
			isUpDataProgressFail: false,
		})
		if (this.guardian)
		{
			this.props.remoteLoading(true, '升级中');
			this.props.airSend(6, this.guardian.underGuardian, this.guardian.guardian, '空中升级1', 1)
			return;
		}
		var connectStatus = this.state.connectStatus;
		if (connectStatus !== 4)
		{
			this.refs.toast.show('请连接设备')
			return;
		}
		this.setState({
			dataProgressModal: true,
			spinner: true,
		})
		var dic = new Object();
		//空中升级
		this.props.upDataAir(dic, this.onAirCallback);
	}

	onAirCallback = res =>
	{
		console.log(res, '空中升级的回调')
		var status = res.status;
		if (status === 0)
		{
			this.setState({
				dataProgressModal: false,
				spinner: false,
			})
			this.refs.toast.show(res.message)
			if (this.state.socketMsg)
			{
				this.props.airSend(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '升级失败')
			}
		}
		else if (status === 5)
		{
			var progress = res.progress;
			if (progress === 50)
			{
				this.setState({
					barWidth: (width - 150) / 3,
					progressBarValue: 30,
				})
			}
			else if (progress === 30)
			{
				this.setState({
					barWidth: (width - 150) / 4,
					progressBarValue: 25,
				})
			}
			else if (progress === 60)
			{
				this.setState({
					barWidth: (width - 150) / 2,
					progressBarValue: 50,
				})
			}
			else if (progress === 90)
			{
				this.setState({
					barWidth: (width - 150) / 2 + (width - 150) / 3,
					progressBarValue: 90,
				})
			}
			else if (progress === 100)
			{
				console.log(progress, '升级的进度111')
				this.setState({
					progressBarValue: 100,
					barWidth: width - 150,
					dataProgressModal: false,
					upDataDetail: '已升级',
					upDataStatus: 1,
					spinner: false,
				})
				if (this.state.socketMsg)
				{
					this.props.airSend(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '升级成功');
				}
				setTimeout(() =>
				{
					this.refs.toast.show('升级成功')
					deviceService.updateComplete({
						// eslint-disable-next-line camelcase
						version_sn: this.state.newFirmwareVersionName,
						// eslint-disable-next-line camelcase
						armarium_device_chang: this.props.firmWare.factorySerialNumber
					})
						.then(res =>
						{
							console.log(res, '更新固件成功')
							if (res.status == 1)
							{
								this.setState({
									productModle: this.state.newPproductModle,
									firmwareVersion: this.state.newFirmwareVersion
								})

							}
						})
						.catch(err =>
						{

						})
				}, 1000)
			}
		}
	}

	render()
	{
		let viewContent = null, viewButton = null;

		if (this.guardian)
		{
			viewContent = (<View style={{width: width}}>
				<View style={[styles.listView, styles.listFirst]}>
					<View style={styles.icon}>
						<Image source={require('../../img/course_img.png')} roundAsCircle={true} style={styles.img} />
					</View>
					<View>
						<Text style={styles.titleText}>激光治疗手环</Text>
						<Text style={styles.titleSubText}>{this.state.productModle}</Text>
						<Text style={styles.titleSubText}>固件版本号: {this.state.firmwareVersion}</Text>
					</View>
				</View>
				<TouchableOpacity style={styles.listView} onPress={this.explain.bind(this)}>
					<View style={styles.icon}>
						<Image source={require('../../img/course_img.png')} roundAsCircle={true} style={styles.img} />
					</View>
					<View>
						<Text style={styles.titleText}>新固件版本号</Text>
						<Text style={styles.titleSubText}>{this.state.newFirmwareVersion}</Text>
					</View>
					<View style={styles.extra}><Text style={{color: '#FB2525'}}>{this.state.upDataDetail}></Text></View>
				</TouchableOpacity>
			</View>)
			if (this.state.upDataStatus == 1)
			{
				viewButton = null;
			}
			else
			{

				viewButton = (<TouchableOpacity style={styles.upData} onPress={this.upData.bind(this)}><Text style={{color: '#fff'}}>马上升级</Text></TouchableOpacity>)

			}
		}
		else
		{
			viewContent = (<View style={{width: width}}>
				<View style={[styles.listView, styles.listFirst]}>
					<View style={styles.icon}>
						<Image source={require('../../img/course_img.png')} roundAsCircle={true} style={styles.img} />
					</View>
					<View>
						<Text style={styles.titleText}>激光治疗手环</Text>
						<Text style={styles.titleSubText}>{this.state.productModle}</Text>
						<Text style={styles.titleSubText}>固件版本号: {this.state.firmwareVersion}</Text>
					</View>
				</View>
				<TouchableOpacity style={styles.listView} onPress={this.explain.bind(this)}>
					<View style={styles.icon}>
						<Image source={require('../../img/course_img.png')} roundAsCircle={true} style={styles.img} />
					</View>
					<View>
						<Text style={styles.titleText}>新固件版本号</Text>
						<Text style={styles.titleSubText}>{this.state.newFirmwareVersion}</Text>
					</View>
					<View style={styles.extra}><Text style={{color: '#FB2525'}}>{this.state.upDataDetail}></Text></View>
				</TouchableOpacity>
			</View>)
			if (this.state.upDataStatus !== 1)
			{
				viewButton = (<TouchableOpacity style={styles.upData} onPress={this.upData.bind(this)}><Text style={{color: '#fff'}}>马上升级</Text></TouchableOpacity>)
			}

		}

		return (
			<View style={{backgroundColor: '#f5f5f5'}}>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="空中升级"
					leftIcon="ios-arrow-back"
					leftPress={this.back.bind(this)}
				/>
				<View style={styles.topView}>
					{viewContent}
				</View>
				<View style={styles.bottomView}>
					{viewButton}
				</View>
				<Toast
					ref="toast"
					position={'center'}
					isImg={true}
				/>
				<Modal
					animationType="fade"
					transparent={true}
					visible={this.state.isUpDataProgressFail}
					onRequestClose={() => this.setState({ isUpDataProgressFail: false, })}
				>
					<TouchableOpacity activeOpacity={1} style={styles.bleModal} onPress={() => this.setState({ isUpDataProgressFail: false, })}>
						<View style={styles.modalProgressInner}>
							<View style={styles.modalBody}>
								<Text>设备升级过程，时间可能持续一分钟左右，请耐心等待。</Text>
							</View>
							<View style={styles.modalBottom}>
								<TouchableOpacity style={styles.optUp} onPress={this.upDataAir}>
									<Text style={[styles.textMid, {color: '#3DBE1C', }, ]}>确定升级</Text>
								</TouchableOpacity>
							</View>
						</View>
					</TouchableOpacity>
				</Modal>
				<Modal
					animationType="fade"
					transparent={true}
					visible={this.state.dataProgressModal}
					onRequestClose={() => { }}
				>
					<View style={styles.modalContent}>
						<View style={{height: 200, justifyContent: 'center', alignItems: 'center', }}>
							<View style={styles.spinnerContent}>
								<View style={styles.spinner}>
									<ActivityIndicator
										color={"#fff"}
										size={"large"}
										style={{flex: 1, }}
									/>
								</View>
								<View><Text style={{color: '#fff'}}>正在升级...</Text></View>
							</View>
							{this.renderProgress()}
						</View>
					</View>
				</Modal>
			</View>
		);
	}
}
function mapStateToProps(state)
{
	console.log(state, '子组件的属性')
	return {
		bleStatus: state.ble.bleStatus,
		msg: state.loginIn.msg,
		connectStatus: state.ble.connectStatus,
		airUpdataStatus: state.ble.airUpdataStatus,
		firmWare: state.ble.firmWare,
		deviceId: state.ble.deviceId,
		dataProgress: state.ble.dataProgress,
		unBindDataStatus: state.ble.unBindDataStatus,
		deviceInformation: state.ble.deviceInformation,
		device_sn: state.ble.device_sn,
		socketMsg: state.webSocketReducer.socketMsg,
		user: state.loginIn.user,
		airUpdataMsg: state.ble.airUpdataMsg
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		upDataAir: (s, callback) => dispatch(bleActions.upDataAir(s, callback)),
		startDFU: (s) => dispatch(bleActions.startDFU(s)),
		airUpdating: (s) => dispatch(bleActions.airUpdating(s)),
		updataUnbindData: (s) => dispatch(bleActions.updataUnbindData(s)),
		getDeviceData: (bleManager, dataType, id, deviceSN, _responseJSON, firmWare) => dispatch(bleDataHandle.getDeviceData(bleManager, dataType, id, deviceSN, _responseJSON, firmWare)),
		airSend: (a, b, c, d, e) => dispatch(webSocketActions.airSend(a, b, c, d, e)),
		sendSocketMessage: (a, b, c, d, e, f, g) => dispatch(webSocketActions.sendMessage(a, b, c, d, e, f, g)),
		remoteLoading: (status, text) => dispatch(webSocketActions.remoteLoading(status, text)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(AirUpdata)


const styles = StyleSheet.create({
	container: {
	},
	sBar: {
		height: statusBarHeight,
		width: width
	},
	white: {
		color: '#fff'
	},
	flash: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center'
	},
	tabBarIcon: {
		width: 19,
		height: 19,
	},
	topView: {
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'center',
		height: contentHeight-100,

	},
	bottomView: {
		height: 100,
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',

	},
	upData: {
		height: 45,
		width: width - 40,
		backgroundColor: '#24A090',
		borderRadius: 30,
		justifyContent: 'center',
		alignItems: 'center',
	},
	img: {
		width: 50,
		height: 50,
	},
	icon: {
		paddingRight: 10
	},
	titleText: {
		fontSize: 16,
		color: '#333',
	},
	titleSubText: {
		fontSize: 12,
		color: '#888',
	},
	listView: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-start',
		paddingTop: 15,
		paddingBottom: 15,
		paddingLeft: 15,
		paddingRight: 15,
		backgroundColor: '#fff',
	},
	listFirst: {
		borderBottomColor: '#ccc',
		borderBottomWidth: 1,
	},
	extra: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'flex-end',
	},
	progressBar: {
		height: 45,
		width: width - 40,
	},
	modalContext: {
		width: width - 80,
		marginLeft: 20,
		marginRight: 20,
		height: 200,
		backgroundColor: '#fff',
		borderRadius: 8,
	},
	modalInner: {
		width: width - 80,
		height: 200,
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		justifyContent: "center",
		alignItems: 'center',
		height: height,
		backgroundColor: 'rgba(0,0,0,.6)',
		width: width,
	},
	modalinner: {
		width: width - 50,
		marginLeft: 25,
		marginRight: 25,
		height: 250,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
	},
	modalProgressInner: {
		width: width - 100,
		marginLeft: 25,
		marginRight: 25,
		height: 144,
		backgroundColor: '#fff',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
	},
	modalBody: {
		paddingHorizontal: 20,
		justifyContent: 'center',
		alignItems: 'center',
		width: width - 100,
		flex: 1,
	},
	modalBottom: {
		flexDirection: 'row',
		justifyContent: "space-around",
		alignItems: 'center',
		height: 45,
		width: width - 100,
		borderTopColor: '#ccc',
		borderTopWidth: 1,
	},
	failUpdateYes: {
		backgroundColor: '#24a090',
	},
	opt: {
		width: (width - 50)/2 - 50,
		height: 34,
		borderRadius: 4,
		justifyContent: 'center',
		alignItems: 'center',
	},
	optYes: {
		backgroundColor: '#24a090',
		width: (width - 100)/2 - 50,
		height: 34,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	optNo: {
		width: (width - 100)/2 - 50,
		height: 34,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		borderColor: '#7f8389',
		borderWidth: 1,

	},
	optUp: {
		width: width - 100,
		height: 45,
		justifyContent: 'center',
		alignItems: 'center',
	},
	progressStyle: {
		width: width - 150,
		justifyContent: 'center',
		alignItems: 'center',
		flex: 1,
	},
	bleModal: {
		width: width,
		height: height,
		backgroundColor: "rgba(0, 0, 0, .5)",
		justifyContent: 'center',
		alignItems: 'center',
	},
	spinnerContent: {
		width: 120,
		height: 120,
		backgroundColor: 'rgba(0, 0, 0, 0.65)',
		borderRadius: 5,
		justifyContent: 'center',
		alignItems: 'center',
	},
	spinner: {
		width: 80,
		height: 80,
	},
	progressValue: {
		position: 'absolute',
		top: 0,
		left: 0,
		zIndex: 1,
		height: 8,
		backgroundColor: '#47A396',
	}
});
