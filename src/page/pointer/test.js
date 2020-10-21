/**
 * @author lam
 */
'use strict';

import React, {Component} from 'react'
import {
	Text,
	View,
	ScrollView,
	StyleSheet,
	StatusBar,
	Dimensions, BackHandler,
	TouchableOpacity,
	Button,
	Image,
	Slider,
	Platform,
	TextInput,
	Alert,
	InteractionManager,
} from 'react-native'
import NavBar from '../../common/NavBar'
import Video from 'react-native-video';
import Toast, { DURATION, } from 'react-native-easy-toast'
import Feather from 'react-native-vector-icons/Feather'


import Picker from 'react-native-wheel-picker'
import { connect, } from 'react-redux'
import { setPointer, setNewPointer, } from '../../actions/device/bleActions';
import CommonDialog from '../../common/Modal';
import * as HomeService from '../../utils/network/homeService'
import { getDate, } from '../../utils/utils';
import * as webSocketActions from '../../actions/webSocketActions';

import {statusBarHeight, height, width, } from '../../utils/uiHeader';
const contentHeight = height - NavBar.topbarHeight - statusBarHeight;

function formatTime(second) {
	let h = 0, i = 0, s = parseInt(second);
	if (s > 60) {
		i = parseInt(s / 60);
		s = parseInt(s % 60);
	}
	// 补零
	let zero = function (v) {
		return (v >> 0) < 10 ? "0" + v : v;
	};
	console.log([zero(h), zero(i), zero(s)].join(":"));
	return [zero(h), zero(i), zero(s)].join(":");
	// return zero(s);
}

var PickerItem = Picker.Item;
var hour = [],min = [];
for(var i =1; i<13; i++) {
	if(i<10) {
		i = "0" + i
	}
	hour.push(i.toString())
}
for(var j = 1; j< 61; j++){
	if(j < 10) {
		j = '0' + j
	}
	min.push(j.toString())
}

class TimeCalibrationPage extends Component
{
	static navigationOptions = {
		header: null,
	}
	constructor(props)
	{
		super(props);
		this.state = {
			productModle: '',
			isRefreshing: false,
			avatarSource: null,
			// video_url: this.props.productModle.indexOf("HA06") > -1?'https://bjy-dev.oss-cn-shenzhen.aliyuncs.com/device_vedio/06X_201910091417.mp4' : 'https://out-20171211195831931-n32wihx1qm.oss-cn-shanghai.aliyuncs.com/video/50290720-16773071368-0003-ce30-e58-2036c.mp4',
			video_url: '',
			content_url: 'https://bjy-dev.oss-cn-shenzhen.aliyuncs.com/guide/guide_img/QQ%E5%9B%BE%E7%89%8720190705142946.png',
			rate: 1,
			volume: 1,
			muted: false,
			resizeMode: 'contain',
			duration: 0.0,
			currentTime: 0.0,
			paused: true,
			isFullScreen: false,
			videoWidth: width,
			videoHeight: width * 9/16,
			visible: true,
			hourList: hour,
			minList: min,
			selectedHourItem: '0',
			selectedMinItem: '0',
			time: 0, //时间选择器的显示隐藏,
			btnStatus: 0, //确定取消按钮的状态,
			prevent: 0, //HA06X防止多次点击
			note: '1、表盘从0-60被标刻成 60个刻度位，分针和时针可以精确指向这些刻度位；2、表盘时针和分针可独立调节和正反转调节；3、输入当前时针和分针指向的不准的刻度位；4、确认后请点击确定，然后点击调节，时针和分针将会自动调回到正确的时间刻度位。',
			socketMsg: this.props.socketMsg,
		};
	}
	componentWillMount()
	{
		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);

	}
	componentDidMount()
	{

		InteractionManager.runAfterInteractions(() => {
			var guardian = this.props.navigation.state.params ? this.props.navigation.state.params.guardian : null;
			console.log('qweqweqweqwe', this.state.socketMsg, guardian, this.props.navigation.state.params.productModle)
			if (guardian)
			{
				this.guardian = guardian;
				var productModle = this.props.navigation.state.params.productModle;
				var dic = new Object();
				dic.armariumScienceSession = this.guardian.userToken;
				HomeService.getAboutClockVideo(dic)
					.then((res)=>
					{
						console.log(this.state.socketMsg, '收到的11111', res)
						if (res.status == 1)
						{
							console.log(this.state.socketMsg, '收到的11111')
							this.setState({
								video_url: productModle && productModle.indexOf("HA06") > -1?'https://bjy-dev.oss-cn-shenzhen.aliyuncs.com/device_vedio/06X_201910091417.mp4' : res.info.video_url,
								content_url: res.info.preview_img,
								productModle: productModle,
							})
						}
					})
					.catch(err => {
						console.log(err)
					})
				return;
			}
			productModle = this.props.navigation.state.params.productModle;
			HomeService.getAboutClockVideo()
				.then((res)=>{
					console.log(this.state.productModle, productModle, 'xinghao', res)
					if (res.status == 1)
					{
						this.setState({
							video_url: productModle.indexOf("HA06") > -1?'https://bjy-dev.oss-cn-shenzhen.aliyuncs.com/device_vedio/06X_201910091417.mp4' : res.info.video_url,
							content_url: res.info.preview_img,
							productModle: productModle,

						})
					}
				})
		})

	}

	componentWillReceiveProps(newProps)
	{
		console.log(newProps, '新的数据')
		this.setState({
			socketMsg: newProps.socketMsg,
			user: newProps.user,
			connectedDevice: newProps.connectedDevice,
		})
		if (newProps.socketMsg && newProps.socketMsg.sn == 8)
		{
			var socketMsg = newProps.socketMsg;
			if (socketMsg.type == 10)
			{
				this.setState({
					selectedHourItem: socketMsg.status.hour,
					selectedMinItem: socketMsg.status.minute,
					btnStatus: 1,
				})
				setTimeout(() => {
					this.guardianConfirmSet();
				}, 1000)
			}
			else if (socketMsg.type == 11)
			{
				this.guardianConfirmTidySet();
			}
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

	backfullScreen() {
		this.setState({
			isFullScreen: !this.state.isFullScreen,
			videoHeight: width * 9/16,
		})
	}
	onEnd = () =>
	{
		this.video.seek(0)
		this.setState({
			paused: true,
			currentTime: 0,

		})
	};
	onLoad = (data)=>
	{
		console.log(data, '初始加载......')
		this.setState({
			duration: data.duration,
		});
	};
	onAudioBecomingNoisy = () =>
	{
		this.setState({paused: true, })
	};

	onAudioFocusChanged = (event: { hasAudioFocus: boolean })=> {
		console.log(event,'qwqweqweqewqweqweqewqew')
		// this.setState({paused: !event.hasAudioFocus})
	};
	onProgress = (data) => {
		this.setState({currentTime: data.currentTime, });
	};
	/// 屏幕旋转时宽高会发生变化，可以在onLayout的方法中做处理，比监听屏幕旋转更加及时获取宽高变化
	_onLayout = (event) => {
		//获取根View的宽高
		let {width, height} = event.nativeEvent.layout;
		console.log('通过onLayout得到的宽度：' + width);
		console.log('通过onLayout得到的高度：' + height);

		// 一般设备横屏下都是宽大于高，这里可以用这个来判断横竖屏
		let isLandscape = (height == height - NavBar.topbarHeight - statusBarHeight);
		if (isLandscape)
		{
			this.setState({
				videoWidth: width,
				videoHeight: height - NavBar.topbarHeight - statusBarHeight,
				isFullScreen: true,
			})
		}
		else
		{
			this.setState({
				videoWidth: width,
				videoHeight: width * 9/16,
				isFullScreen: false,
			})
		}
	};
	// 点击了工具栏上的全屏按钮
	onControlShrinkPress() {
		if (this.state.isFullScreen) {
			this.setState({
				isFullScreen: !this.state.isFullScreen,
				videoHeight: width * 9/16
			})
		} else {
			this.setState({
				isFullScreen: !this.state.isFullScreen,
				videoHeight: height - NavBar.topbarHeight - statusBarHeight,
			})
		}
	}
	//暂停
	onPaused = () => {
		console.log(this.state.paused,"暂停吗暂停吗暂停吗暂停吗暂停吗暂停吗")
		var paused = this.state.paused;
		if(paused) {
			this.lay = setTimeout(() => {
				this.setState({
					visible: false
				})
			},1000)
		}
		this.setState({
			paused: !paused
		})

	}

	slider(value) {
		console.log(value,'12312313131')
		this.setState({
			currentTime: value,
		})
		this.video.seek(value)
	}

	setVisible =()=> {
		this.setState({
			visible: !this.state.visible,
		})
	}



	onPickerHourSelect (index)
	{
		this.setState({
			selectedHourItem: index < 10 ? Number('0' + index) : index,
		})
	}
	onPickerMinSelect (index)
	{
		console.log(index, '选择的分针')
		this.setState({
			selectedMinItem: index < 10 ? Number('0' + index) : index,
		})
	}

	//被监护人直接调整
	guardianConfirmSet()
	{
		var Hour = this.state.selectedHourItem.toString();
		var Minute = this.state.selectedMinItem.toString();
		if (Hour == this.state.h && Minute == this.state.m )
		{
			if (this.guardian)
			{
				this.props.bleToolSend(9, this.guardian.guardian, this.guardian.underGuardian, '时间没有偏差, 无法调整');
			}
			this.refs.toast.show("时间没有偏差，无法调整");
			return;
		}
		var device_name = this.state.productModle;
		if (device_name.indexOf("HA06") > -1)
		{
			if (this.state.prevent == 1)
			{
				return;
			}
			this.props.setNewPointer({hour: Hour, minute: Minute, type: 1, }, this.props.connectedDevice.bleId)
			this.setState({
				prevent: 1,
			});
			setTimeout(() =>
			{
				this.setState({
					prevent: 0,
				})
			}, 3000);
		}
		else
		{
			console.log(Hour,Minute,'shijain1');
			this.props.setPointer({hour: Hour,minute: Minute,type: 1},this.props.connectedDevice.bleId)
			// this.props.setNewPointer({hour: Hour, minute: Minute, type: 1, }, this.props.deviceId)
		}
		if (this.state.socketMsg)
		{
			this.props.bleToolSend(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '成功');
		}
	}

	//被监护人直接调整
	guardianConfirmTidySet()
	{
		if (this.props.connectStatus !== 4)
		{
			this.refs.toast.show("请连接设备")
			if (this.state.socketMsg)
			{
				this.props.sendSocketMessage(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '请连接设备');
			}
			return
		}
		this.props.setPointer({value: 5, type: 0, }, this.props.connectedDevice.bleId)
	}
	confirmSet()
	{
		if (this.guardian)
		{
			this.alert();
			return;
		}
		if (!this.props.bleStatus)
		{
			this.refs.toast.show("请打开蓝牙")
			return;
		}
		if (this.props.connectStatus !== 4)
		{
			this.refs.toast.show("请连接设备")
			if (this.state.socketMsg)
			{
				this.props.sendSocketMessage(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '请连接设备');
			}
			return
		}
		this.alert();
	}
	set = () => {
		if (this.guardian)
		{
			var Hour = this.state.selectedHourItem.toString();
			var Minute = this.state.selectedMinItem.toString();
			var status = {
				hour: Hour,
				minute: Minute,
			}
			this.props.bleToolSend(8, this.guardian.underGuardian, this.guardian.guardian, '设备应用', '设备应用', 10, status)
			return;
		}
		Hour = this.state.selectedHourItem.toString();
		Minute = this.state.selectedMinItem.toString();
		if (Hour == this.state.h && Minute == this.state.m )
		{
			if (this.guardian)
			{
				this.props.bleToolSend(9, this.guardian.guardian, this.guardian.underGuardian, '时间没有偏差, 无法调整');
			}
			this.refs.toast.show("时间没有偏差，无法调整");
			return;
		}
		var device_name = this.state.productModle;
		if (device_name.indexOf("HA06") > -1)
		{
			if (this.state.prevent == 1)
			{
				return;
			}
			this.props.setNewPointer({hour: Hour, minute: Minute, type: 1, }, this.props.connectedDevice.bleId)
			this.setState({
				prevent: 1,
			});
			setTimeout(() =>
			{
				this.setState({
					prevent: 0,
				})
			}, 3000);
		}
		else
		{
			console.log(Hour,Minute,'shijain1');
			this.props.setPointer({hour: Hour,minute: Minute,type: 1},this.props.connectedDevice.bleId)
			// this.props.setNewPointer({hour: Hour, minute: Minute, type: 1, }, this.props.deviceId)
		}

	}

	//弹框提示
	alert()
	{
		var Hour = this.state.selectedHourItem;
		var Minute = this.state.selectedMinItem;
		if (Hour === '0' || Minute === '0')
		{
			this.refs.toast.show('请选择表盘时间');
			return;
		}

		var text = '时针：' + this.state.selectedHourItem + ',' + '分针：' + this.state.selectedMinItem
		this.refs.dConfirm.show({
			thide: false,
			title: '请确认表盘上的时间',
			messText: text,
			buttons: [
				{txt: '取消', onpress: this.cancelDialog.bind(this), txtStyle: {fontSize: 16, }, },
				{txt: '同步', txtStyle: {fontSize: 16, }, onpress: this.set.bind(this), },
			],
		})
	}

	cancelDialog()
	{
		this.refs.dConfirm.hide();
	}

	HAsecondSet()
	{
		if (!this.state.HAsecond)
		{
			this.refs.toast.show("请输入指针的刻度");
			return;
		}
		var dic = {
			type: 0,
			second: this.state.HAsecond,
		}
		this.props.setNewPointer(dic, this.props.connectedDevice.bleId)
	}

	confirmHA06XSet()
	{
		if (!this.state.HAhour || !this.state.HAminute)
		{
			this.refs.toast.show("请输入指针的刻度");
			return;
		}
		var dic = {
			type: 1,
			hour: this.state.HAhour,
        	minute: this.state.HAminute,
		}
		this.props.setNewPointer(dic, this.props.connectedDevice.bleId)
	}

	onChangeHour(text)
	{
		this.setState({
			HAhour: text,
		})
	}
	onChangeMinute(text)
	{
		this.setState({
			HAminute: text,
		})
	}

	confirmTidySet()
	{
		if (this.guardian)
		{
			this.props.bleToolSend(8, this.guardian.underGuardian, this.guardian.guardian, '设备应用', '设备应用', 11);
			return;
		}
		if (!this.props.bleStatus)
		{
			this.refs.toast.show("请打开蓝牙")
			return;
		}
		if (this.props.connectStatus !== 4)
		{
			this.refs.toast.show("请连接设备")
			if (this.state.socketMsg)
			{
				this.props.sendSocketMessage(9, this.state.socketMsg.guardian, this.state.socketMsg.underGuardian, '请连接设备');
			}
			return
		}
		this.props.setPointer({value: 5, type: 0, }, this.props.connectedDevice.bleId)
	}
	show = () => {
		this.setState({
			time: 1,
		})
	}
	hide = () => {
		this.setState({
			time: 0,
		})
	}
	cancel = () => {
		this.setState({
			time: 0,
			btnStatus: 0,
		})
	}
	determine = () => {
		this.setState({
			time: 0,
			btnStatus: 1,
		})
	}

	renderHA06X()
	{
		var component;
		var device_sn = this.state.productModle;
		console.log(device_sn, '新的属性HA06X')
		if (!device_sn)
		{
			return null;
		}
		if (device_sn.indexOf("HA06") > -1)
		{
			component =  (
				<View>
					<View style={styles.child}>
						<View style={styles.childTitle}>
							<View style={styles.dot}></View>
							<Text style={{fontSize: 15}}>1、时间调整</Text>
						</View>
						<View style={styles.childTitle}>
							<View style={styles.placeholder}></View>
							<TouchableOpacity style={styles.select} onPress={()=>{this.show()}}>
								<Text style={{fontSize: 15}}>{this.state.btnStatus==1?(this.state.selectedHourItem+':' +(this.state.selectedMinItem>=10?this.state.selectedMinItem:('0'+this.state.selectedMinItem))):'请输入表盘指针时间'}</Text>
							</TouchableOpacity>
							<View style={styles.pointerBtn}>
								<TouchableOpacity style={styles.btnTitle} onPress={this.confirmSet.bind(this)}>
									<Text style={{color: '#fff'}}>调整</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</View>
			)
		}
		else
		{
			component =  (
				<View>
					<View style={styles.child}>
						<View style={styles.childTitle}>
							<View style={styles.dot}></View>
							<Text>1、将当前手表</Text>
							<Text style={{color: 'red'}}>指针错误时间</Text>
							<Text>输入</Text>
						</View>
						<View style={styles.childTitle}>
							<View style={styles.placeholder}></View>
							<TouchableOpacity style={styles.select} onPress={()=>{this.show()}}>
								<Text style={{fontSize: 15}}>{this.state.btnStatus==1?(this.state.selectedHourItem+':' +(this.state.selectedMinItem>=10?this.state.selectedMinItem:('0'+this.state.selectedMinItem))):'请输入表盘指针时间'}</Text>
							</TouchableOpacity>
							<View style={styles.pointerBtn}>
								<TouchableOpacity style={styles.btnTitle} onPress={this.confirmSet.bind(this)}>
									<Text style={{color: '#fff'}}>调整</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>

					<View style={styles.child}>
						<View style={styles.childTitle}>
							<View style={styles.dot1}></View>
							<Text style={{fontSize: 15}}>秒钟微调</Text>
						</View>
						<View style={styles.childTitle}>
							<View style={styles.placeholder}></View>
							<View style={styles.select1}>
								<Text style={{fontSize: 15}}>每次点击，手表秒针加五秒</Text>
							</View>
							<View style={styles.pointerBtn}>
								<TouchableOpacity style={styles.btnTitle} onPress={this.confirmTidySet.bind(this)}>
									<Text style={{color: '#fff'}}>+5秒</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</View>
			)
		}
		return component
	}

	render()
	{

		console.log(this.state.video_url,'获取的数据')
		let video_url = this.state.video_url;
		let image_url = this.state.content_url;
		let videoComponent = null;
		let pauseBtn = null;
		let autoTime = null;
		let sliderView  = null;
		let fullBtn = null;
		let NavBarContent = null;
		let statusBar = null;
		let productModle = this.state.productModle; //判断设备型号
		console.log(productModle, '设备型号')
		autoTime = (<View style={styles.volumeControl}>
			<Text style={{color: '#fff',fontSize: 12}}>{formatTime(this.state.duration - this.state.currentTime)}</Text>
		</View>)
		sliderView = (<View style={{flex: 1}}>
			<Slider
				minimumValue={0}
				maximumValue={this.state.duration}
				value={this.state.currentTime}
				onSlidingComplete={this.slider.bind(this)}
				style={{flex: 1}}
				maximumTrackTintColor={"#fff"}

			/>
		</View>)

		if (this.state.paused)
		{
			pauseBtn = (<Feather name="pause" color="#fff" size={24}></Feather>)
		}
		else
		{
			pauseBtn = (<Feather name="play" color="#fff" size={24}></Feather>)
		}
		if (!this.state.isFullScreen)
		{
			NavBarContent = (<NavBar
				title="指针调整"
				leftIcon="ios-arrow-back"
				leftPress={this.back.bind(this)}
			/>)
			fullBtn = (<TouchableOpacity onPress={this.onControlShrinkPress.bind(this)} style={{width: 40,justifyContent: 'center',alignItems: 'center'}}>
				<Feather name="maximize" color="#fff" size={24}></Feather>
			</TouchableOpacity>)
			statusBar = (<StatusBar
				backgroundColor={"#24A090"}
				barStyle={this.props.barStyle || 'light-content'}
				translucent={true}
			/>)
		}
		else
		{
			NavBarContent = !this.state.visible ? <View style={{height: NavBar.topbarHeight,backgroundColor: '#000' }}></View> : (<NavBar
				leftIcon="ios-arrow-back"
				leftPress={this.backfullScreen.bind(this)}
				style={{backgroundColor: '#000'}}
			/>);
			fullBtn = (<TouchableOpacity onPress={this.onControlShrinkPress.bind(this)} style={{width: 40,justifyContent: 'center',alignItems: 'center'}}>
				<Feather name="maximize" color="#fff" size={24}></Feather>
			</TouchableOpacity>)
			statusBar = (<StatusBar
				backgroundColor={"#000"}
				barStyle={this.props.barStyle || 'light-content'}
				translucent={true}
				hidden={this.state.visible ? false : true}
			/>)
		}
		if (!video_url || !productModle)
		{
			videoComponent = null
		}
		else
		{
			videoComponent = (<Video
				ref={(ref: Video) => {
					this.video = ref
				}}
				/* For ExoPlayer */
				source={{uri: this.state.productModle.indexOf("HA06") > -1?'https://bjy-dev.oss-cn-shenzhen.aliyuncs.com/device_vedio/06X_201910091417.mp4':'https://bjy-dev.oss-cn-shenzhen.aliyuncs.com/about/clockVideo/%E6%8C%87%E9%92%88%E8%B0%83%E8%8A%82%E6%95%99%E7%A8%8B.mp4'}}
				// poster={image_url}
				style={{width: this.state.videoWidth,height: this.state.videoHeight}}
				rate={this.state.rate}
				paused={this.state.paused}
				volume={this.state.volume}
				muted={this.state.muted}
				resizeMode={this.state.resizeMode}
				onLoad={this.onLoad}
				onProgress={this.onProgress}
				onEnd={this.onEnd}
				onAudioBecomingNoisy={this.onAudioBecomingNoisy}
				onAudioFocusChanged={this.onAudioFocusChanged}
				repeat={false}

			/>)
		}

		if (!this.state.visible)
		{
			pauseBtn = null;
			fullBtn = null;
			sliderView = null;autoTime = null;
		}

		return (
			<View style={{flex: 1,backgroundColor: "#f3f3f3"}} onLayout={this._onLayout}>
				{statusBar}
				<View style={styles.sBar} backgroundColor={this.state.isFullScreen ? "#000" : '#24A090'}/>
				{NavBarContent}
				<ScrollView
					scrollEnabled={false}
				>
					<View style={styles.container}>
						<TouchableOpacity
							onPress={this.setVisible}
							style={{width: this.state.videoWidth,height: this.state.videoHeight}}>
							{videoComponent}
						</TouchableOpacity>
						<View style={styles.controls}>
							<TouchableOpacity style={styles.btn} onPress={this.onPaused.bind(this)}>
								{pauseBtn}
							</TouchableOpacity>
							<View style={styles.textStyle}>
								{autoTime}
							</View>
							{sliderView}
							{fullBtn}
						</View>
					</View>

					<View style={styles.tipText}>
						<View style={{justifyContent: 'center', alignItems: 'center', }}><View style={styles.tipTitle}><Text>指针调节操作流程指导</Text></View></View>
						<View style={{flexDirection: 'row', paddingBottom: 5,  }}>
							<Text>请将当前手表</Text>
							<Text style={{color: 'red'}}>指针错误时间</Text>
							<Text>输入，确认无误后，</Text>
							<Text style={{color: 'red'}}>点击</Text>
						</View>
						<View style={{flexDirection: 'row', }}><Text style={{color: 'red'}}>调整按钮，</Text><Text>手表指针将</Text><Text style={{color: 'red'}}>自动同步</Text><Text>手机正确时间。</Text></View>
					</View>
					{this.renderHA06X()}
					{productModle && productModle.indexOf("HA06") > -1?<View style={styles.note}>
						<Text style={{fontSize: 15,color: 'red'}}>{this.state.note}</Text>
					</View>:null}
				</ScrollView>
				{this.state.time==1&&<View style={{height: contentHeight/3.5, width: width, position: 'absolute', bottom: 0, backgroundColor: '#fff'}}>
					<View style={styles.staus}>
						<TouchableOpacity style={styles.stausCancel} onPress={()=> {this.cancel()}}>
							<Text style={{color: '#579FE8'}}>取消</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.stausCancel1} onPress={()=>{this.determine()}}>
							<Text style={{color: '#579FE8'}}>确定</Text>
						</TouchableOpacity>
					</View>
					<View style={{flexDirection: 'row',height: contentHeight/3, width: width, position: 'absolute'}}>
						{productModle && productModle.indexOf("HA06") > -1?<Picker style={{width: 150, flex:1}}
							selectedValue={this.state.selectedHourItem}
							itemStyle={{color:"#000", fontSize:12}}
							curtainColor="#000"
							onValueChange={(index) => this.onPickerHourSelect(index)}>
							{this.state.minList.map((value, i) => (
								<PickerItem label={value} value={Number(value)} key={"money"+value}/>
							))}
						</Picker>:<Picker style={{width: 150, flex:1}}
							selectedValue={this.state.selectedHourItem}
							itemStyle={{color:"#000", fontSize:12}}
							curtainColor="#000"
							onValueChange={(index) => this.onPickerHourSelect(index)}>
							{this.state.hourList.map((value, i) => (
								<PickerItem label={value} value={Number(value)} key={"money"+value}/>
							))}
						</Picker>}
						<Picker style={{width: 150, flex: 1}}
							selectedValue={this.state.selectedMinItem}
							itemStyle={{color:"#000", fontSize:12}}
							onValueChange={(index) => this.onPickerMinSelect(index)}>
							{this.state.minList.map((value, i) => (
								<PickerItem label={value} value={Number(value)} key={"money"+value}/>
							))}
						</Picker>
					</View>
				</View>}
				<Toast
					ref="toast"
					position="center"
					isImg={true}
				/>
				<CommonDialog types={'confirm'} ref="dConfirm" />
			</View>
		)
	}
}

function mapStateToProps(state) {
	console.log(state,'子组件的属性')
	return {
		connectedDevice: state.ble.connectedDevice,
		connectStatus: state.ble.connectStatus,
		bleStatus: state.ble.bleStatus,
		socketMsg: state.webSocketReducer.socketMsg,
		user: state.loginIn.user,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		setPointer: (dic, deviceId) => dispatch(setPointer(dic, deviceId)),
		setNewPointer: (dic, deviceId) => dispatch(setNewPointer(dic, deviceId)),
		bleToolSend: (a, b, c, d, e, f, g, h) => dispatch(webSocketActions.bletoolSend(a, b, c, d, e, f, g, h)),
		remoteLoading: (status, text) => dispatch(webSocketActions.remoteLoading(status, text)),
		sendSocketMessage: (a, b, c, d) => dispatch(webSocketActions.sendMessage(a, b, c, d)),
	}
}

export default connect(mapStateToProps,mapDispatchToProps)(TimeCalibrationPage)

const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'center',
		backgroundColor: 'black',
	},
	sBar: {
		height: statusBarHeight,
		width: width,
	},
	title: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		color: "#666"
	},
	subTitle: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingLeft: 10,
		paddingRight: 10,
		paddingBottom: 10,
		paddingTop: 20,
	},
	textStyle: {
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'column',
		width: 60,
	},
	btn: {
		height: 20,
		width: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	controls: {
		backgroundColor: 'transparent',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		position: 'absolute',
		bottom:10,
		left: 0,
		width: '100%',
		paddingLeft: 10,
		paddingRight: 10
	},
	volumeControl: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	commonent: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 20,
		marginBottom: 20
	},
	commonentBtn: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 15,
		paddingTop: 10,
		paddingLeft: 40,
		paddingRight: 40,
		paddingBottom: 10,
		borderWidth: 1,
		borderColor: '#8b8e9c',
	},
	imageUp: {
		width: 30,
		height: 30,
	},
	imgContent: {
		marginTop: 10,
	},
	imgStyle: {
		width: width,
		resizeMode:'cover',
		minHeight: 300,
	},
	HApointer: {
		width: width,
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: "center",
	},

	tipText: {
		marginLeft: 15,
		marginRight: 15,
		marginTop: 15,
		backgroundColor: '#ccc',
		borderRadius: 5,
		paddingVertical:10,
		paddingHorizontal: 10,
	},
	note: {
		marginLeft: 15,
		marginRight: 15,
		marginTop: 15,
		borderRadius: 5,
		paddingVertical:10,
		paddingHorizontal: 10,
		height: 100,
	},
	child: {
		marginLeft: 15,
		marginRight: 15,
		marginTop: 15,
	},
	childTitle: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	dot: {
		width: 13,
		height: 13,
		borderRadius: 6.5,
		backgroundColor: '#F09896',
		marginRight: 8,
	},
	dot1: {
		width: 13,
		height: 13,
		borderRadius: 6.5,
		backgroundColor: '#FAE09D',
		marginRight: 8,
	},
	placeholder: {
		flex: 1
	},
	select: {
		flex: 11,
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderColor: '#666',
	},
	selectHA: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	select1: {
		flex: 11,
		paddingVertical: 10,
	},
	pointerBtn: {
		flex: 4,
		alignItems: 'center',
		justifyContent: 'center',
	},
	btnTitle: {
		backgroundColor: '#24a090',
		width: 70,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 5,
		borderRadius: 20
	},
	staus: {
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderColor: '#ECECEC',
		paddingHorizontal: 20,
		paddingVertical: 10,
		zIndex: 100,
	},
	stausCancel: {
		flex: 1,
	},
	stausCancel1: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'flex-end'
	},
	tipTitle: {
		borderBottomColor: '#000',
		borderBottomWidth: 1,
		width: 143,
		marginBottom: 5,
	},
});
