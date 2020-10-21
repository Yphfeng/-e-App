
/**
 * @author lam
 */
'use strict';

import React, {Component,} from 'react'
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
	DeviceEventEmitter,
	KeyboardAvoidingView,
	Keyboard,
	Alert,
} from 'react-native'
import NavBar from '../../common/NavBar'
import Item from '../../common/Item'
import Toast, { DURATION } from 'react-native-easy-toast'
import Feather from 'react-native-vector-icons/Feather'
import { connect, } from 'react-redux'
import * as communityActions from '../../actions/communityActions';
import {statusBarHeight, height, width, } from '../../utils/uiHeader';
import Sound from 'react-native-sound';

import {AudioRecorder, AudioUtils, } from 'react-native-audio';

const contentHeight = height - NavBar.topbarHeight - statusBarHeight
const currentHeight = statusBarHeight;

function formatTime(second)
{
	let h = 0, i = 0, s = parseInt(second);
	if (s > 60)
	{
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

var whoosh;

class AddAudio extends Component
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
			video_url: '',
			rate: 1,
			volume: 1,
			muted: false,
			resizeMode: 'contain',
			duration: 0.0,
			paused: true,
			isFullScreen: false,
			videoWidth: width,
			videoHeight: width * 9/16,
			visible: true,
			newdata: {}, //圈子详情数据
			images: [], //图片列表
			selectedPhotos: [], //选择的图片列表
			audioUrl: '',
			audioTime: 0,
			newImg: [],
			newAudio: '',
			imgIndex: 0,
			user: {},
			title: '',
			spinner: false,
			keyposition: 0,
			keyboardHeight: 0,
			hasPermission: undefined, //授权状态
			audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac', // 文件路径
			recording: false, //是否录音
			stop: true, //录音是否停止
			currentTime: '00:00', //录音时长
			audioStatus: 0,
			process: 0,//页面状态
			remaining: 150, //剩余时间
			audioFileURL: '',
		};
		this.AccessKeyId = ""
		this.AccessKeySecret = ""
		this.SecurityToken = ""
		this.FileProfix = ""
		this.openid = ""
		this.access_token = ""
		this.unionid = ""
		this.img = [];
		this.allData= [];
	}
	componentWillMount() {

		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount()
	{
		this.didFocusSubscription = this.props.navigation.addListener(
			'didFocus',
			payload => {
				//如果在播放就都暂停
				this.initial()
			}
		);

		this.willBlurSubscription = this.props.navigation.addListener(
			'willBlur',
			async payload => {
				//如果在播放就都暂停
				if (!this.state.recording)
				{
					return
				}
				this.setState({
					process: 0,
				})
				this.setState({stop: true, recording: false, paused: false, });
				try {
					await AudioRecorder.stopRecording();
				} catch (error) {
					console.error(error);
				}
				this.audioPause();
			}
		);
	}
	conversion(time)
	{
		var time = time;
		var min = Math.floor(time%3600);
		var s = (time%60)<10 ? ('0'+(time%60)):(time%60);
		var newTime = Math.floor(min/60) + ':' + s;
		return newTime;
	}

	initial()
	{
		const rationale = {
			'title': '获取录音权限',
			'message': 'XXX正请求获取麦克风权限用于录音,是否准许'
		};
		// PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, rationale)
		// .then((result) => {
		//     console.warn('result', result)
		// })
		// 请求授权
		AudioRecorder.requestAuthorization()
			.then(isAuthor => {
				console.warn('是否授权: ' + isAuthor)
				if(!isAuthor) {
				return alert('请前往设置开启录音权限')
				}
				this.setState({hasPermission: isAuthor})
				this.prepareRecordingPath(this.state.audioPath);
				// 录音进展
				AudioRecorder.onProgress = async (data) => {
					//console.warn('onProgress', data, Math.floor(data.currentTime))
					this.setState({
						currentTime: this.conversion(Math.floor(data.currentTime)),
						remaining: 150 - Math.floor(data.currentTime)
					});
					//大于等于150秒停止录音
					if(Math.floor(data.currentTime) >= 150){
						this.setState({
							process: 2
						})
						this.setState({stop: true, recording: false, paused: false});
						try {
						await AudioRecorder.stopRecording();
						} catch (error) {
						console.error(error);
						}
					}
				};
				// 完成录音
				AudioRecorder.onFinished = (data) => {
				// data 返回需要上传到后台的录音数据
				console.warn('currentTime', this.state.currentTime)
				console.log("录音数据", data)
					this.setState({
						audioFileURL: data.audioFileURL,
					})
				};
			})
	}
	format(shijianchuo) {
		//shijianchuo是整数，否则要parseInt转换
		var time = new Date(shijianchuo);
		var y = time.getFullYear();
		var m = time.getMonth() + 1;
		var d = time.getDate();
		var h = time.getHours();
		var mm = time.getMinutes();
		return y + '/' + this.add0(m) + '/' + this.add0(d) + ' ' + this.add0(h) + ':' + this.add0(mm);
	}
	add0(m) { return m < 10 ? '0' + m : m }

	async componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
		this.didFocusSubscription.remove();
		this.willBlurSubscription.remove();
	}

	onBackAndroid = () => {
		this.props.navigation.goBack();
		return true;
	};

	back() {
		this.props.navigation.pop();
	}

	nextTo = () =>
	{
		var audioFileURL = this.state.audioFileURL;
		var duration = 150 - this.state.remaining;
		var audioPath = this.state.audioPath;
		if (!audioFileURL)
		{
			this.refs.toast.show("请添加录音")
		}
		else
		{
			console.log(audioFileURL, audioPath,duration, '语音信息')
			this.props.pbAudio(audioFileURL, audioPath, duration)
			this.props.navigation.navigate("AudioTotext");
			// this.props.navigation.navigate("DynamicPreview");
		}
	}
	// 开始录音
	_record = async () =>
	{
		if (!this.state.hasPermission) {
			return alert('没有授权')
		}
		if (this.state.recording) {
			return alert('正在录音中...')
		}
		console.warn('hengheng')
		if (this.state.stop)
		{
			this.prepareRecordingPath(this.state.audioPath)
		}
		this.setState({recording: true,pause: false, process: 1, })

		try
		{
			await AudioRecorder.startRecording()
		}
		catch (err)
		{
			console.warn('errrrrr', err)
		}
	}

	// 停止录音
	_stop = async () => {
		if (!this.state.recording){
			this.refs.toast.show("您还没有录音")
			return
		}
		if ((150 - this.state.remaining)<10){
			this.refs.toast.show("录音不能少于10秒")
			return
		}
		this.setState({stop: true, recording: false, paused: false, process: 2, });
		try
		{
			await AudioRecorder.stopRecording();
		} catch (error)
		{
		console.error(error);
		}
	}
	//暂停
	audioPause = () =>
	{
		this.setState({
			audioStatus: 0,
		})
		whoosh.pause();
	}

	//重录
	reRecord(){
		this.setState({
			process: 0,
			currentTime: '00:00',
			remaining: 150,
		})
	}
	addEdit()
	{
		if (this.state.audioStatus==1)
		{
			this.audioPause();
		}
		DeviceEventEmitter.emit('audioMessage', {audioPath: this.state.audioPath, audioUrl: this.state.audioFileURL, time: 150-this.state.remaining, });
		// this.props.navigation.pop();
	}

	// 播放录音
	_play = async () => {
		whoosh = new Sound(this.state.audioPath, '', (err) => {
			if (err)
			{
				return console.log(err)
			}
			this.setState({
				audioStatus: 1,
			})
			whoosh.play(success => {
				if (success)
				{
					console.log('success - 播放成功')
					this.setState({
						audioStatus: 0,
					})
				}
				else
				{
					console.log('fail - 播放失败')
					this.setState({
						audioStatus: 0,
					})
				}
			})
		})
	}

	//删除
	delete()
	{
		this.setState({
			process: 0,
			currentTime: '00:00',
			remaining: 150,
		})
	}


	    /**
     * AudioRecorder.prepareRecordingAtPath(path,option)
     * 录制路径
     * path 路径
     * option 参数
     */
	prepareRecordingPath = (path) =>
	{
		const option = {
			SampleRate: 44100.0, //采样率
			Channels: 2, //通道
			AudioQuality: 'High', //音质
			AudioEncoding: 'aac', //音频编码
			OutputFormat: 'mpeg_4', //输出格式
			MeteringEnabled: false, //是否计量
			MeasurementMode: false, //测量模式
			AudioEncodingBitRate: 32000, //音频编码比特率
			IncludeBase64: true, //是否是base64格式
			AudioSource: 0, //音频源
		}
		AudioRecorder.prepareRecordingAtPath(path,option)
    }

	render() {

		console.log(this.state.video_url,'获取的数据')
		let { recording, currentTime, remaining, } = this.state
		let videoComponent = null;
		let title = null;
		let NavBarContent = null;
    	let statusBar = null;
    	let img = null; //添加图片

		NavBarContent = (<NavBar
			title="添加语音"
			leftIcon="ios-arrow-back"
			leftPress={this.back.bind(this)}
			rightText="下一步"
			rightPress={this.nextTo}
		/>)
		statusBar = (<StatusBar
			backgroundColor={"#24A090"}
			barStyle={this.props.barStyle || 'light-content'}
			translucent={true}
			style={styles.statusBarHeight}
		/>)

		if (this.state.process == 0)
		{
			img = (<View style={styles.noPictrue}>
				<View style={styles.audioContent}>
					<Image source={require('../../img/audio.png')} />
					<Text style={{fontSize: 20, color: '#505050', paddingTop: 10, paddingBottom: 20,marginTop: -50, }}>添加语音</Text>
					<Text style={{fontSize: 14, color: '#64505050', marginTop: 20, }}>建议语音时长10-300s，大小不超过100M</Text>
				</View>
				<View style={styles.audioBtn}>
					<TouchableOpacity style={styles.startAudio} onPress={this._record.bind(this)}>
						<Text>开始录音</Text>
					</TouchableOpacity>
				</View>

        	</View>)
		}
		else if (this.state.process == 1)
		{
			img = (
				<View style={styles.noPictrue}>
					<View  style={styles.audioContent}>
						<Image source={require('../../img/audio.png')} />
						<Text style={{fontSize: 20, color: '#505050', paddingTop: 10, paddingBottom: 20,marginTop: -50, }}>添加语音</Text>
						<Text style={{fontSize: 14, color: '#64505050', marginTop: 20, }}>建议语音时长10-300s，大小不超过100M</Text>
						<View style={{marginTop: 30, }}>
							<Text>录音时长：{currentTime}</Text>
						</View>
					</View>
					<View style={styles.audioBtn}>
						<TouchableOpacity style={styles.startAudio} onPress={this._stop}>
							<Text>结束录音</Text>
						</TouchableOpacity>
					</View>
				</View>
			)
		}
		else
		{
			img = (<View style={styles.noPictrue}>
				<View  style={styles.audioContent}>
					<Image source={require('../../img/audio.png')} />
					<Text style={{fontSize: 20, color: '#505050', paddingTop: 10, paddingBottom: 20,marginTop: -50, }}>添加语音</Text>
					<Text style={{fontSize: 14, color: '#64505050', marginTop: 20, }}>建议语音时长10-300s，大小不超过100M</Text>
					<View style={{marginTop: 30, }}>
						<Text>录音时长：{currentTime}</Text>
					</View>
				</View>
				<View style={styles.bottmBtn}>
					<View style={styles.btnChild}>
						<TouchableOpacity style={styles.btnColor} onPress={this.delete.bind(this)}>
							<View style={styles.btnItem}>
								<View style={styles.imgDelete}><Image source={require('../../img/delete_audio.png')} /></View>
							</View>
							<Text style={styles.btnFont}>删除</Text>
						</TouchableOpacity>
						{this.state.audioStatus == 0?<TouchableOpacity style={styles.btnColor}  onPress={this._play.bind(this)}>
							<View style={styles.btnItem}>
								<View style={styles.imgOperate}><Image source={require('../../img/play_audio.png')} /></View>
							</View>
							<Text>播放</Text>
						</TouchableOpacity>:
							<TouchableOpacity  onPress={this.audioPause} style={styles.btnColor}>
								<View style={styles.btnItem}>
									<View style={styles.imgOperate}><Image source={require('../../img/parse.png')} /></View>
								</View>
								<Text>暂停</Text>
							</TouchableOpacity>}
						<TouchableOpacity style={styles.btnColor} onPress={this.reRecord.bind(this)}>
							<View style={styles.btnItem}>
								<View style={styles.imgDelete}><Image source={require('../../img/record.png')} /></View>
							</View>
							<Text style={styles.btnFont}>重录</Text>
						</TouchableOpacity>

					</View>
				</View>
			</View>)
		}

		return (
			<View style={{flex: 1,backgroundColor: "#FFF"}}>
				{statusBar}
				<View style={styles.statusBarHeight} backgroundColor={this.state.isFullScreen ? "#000" : '#24A090'}/>
				{NavBarContent}
				<View>
					{img}
				</View>
				<Toast ref="toast" />
			</View>
		)
	}
}


function mapStateToProps(state)
{
	console.log(state, '子组件的属性')
	return {

	}
}

function mapDispatchToProps(dispatch)
{
	return {
		pbAudio: (url, path, duration) => dispatch(communityActions.pbAudio(url, path, duration)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(AddAudio)


const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'center',
		backgroundColor: 'black',
		marginHorizontal: 10,
	},
	statusBarHeight: {
		height: statusBarHeight,
		width: width,
	},
	noPictrue: {
		width: width,
		height: height - statusBarHeight - NavBar.topbarHeight,
		justifyContent: 'center',
		alignItems: 'center',
	},
	audioContent: {
		justifyContent: 'center',
		alignItems: 'center',
		height: height - NavBar.topbarHeight - statusBarHeight - 200,
	},
	startAudio: {
		width: width - 40,
		backgroundColor: '#999999',
		borderRadius: 16,
		height: 48,
		justifyContent: 'center',
		alignItems: 'center',
	},

	imgContent: {
		paddingHorizontal: 15,
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		paddingVertical: 20,
	},
	imgContentChild: {
		width: (width - 50) / 3,
		height: (width - 30) / 3,
		marginBottom: 10,
	},
	imgContentChild1: {
		width: width  * 0.29,
		height: width * 0.29,
		marginRight: 15,
		marginBottom: 15,
		borderColor: '#666',
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	bottmBtn: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		height: 200,
	},
	btnChild: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		width: width,
		height: 200,
	},
	btnColor: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	btnFont: {
		fontSize: 15,
	},
	audioComponent: {
		marginHorizontal: 10,
		backgroundColor: '#fff',
		marginTop: 40,
		paddingHorizontal: 10,
		paddingVertical: 10,
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 5,
	},
	audioImgLog: {
		width: 100,
		height: 100,
	},
	audioImg: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 6
	},
	audioBtn: {
		height: 200,
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	audioLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	processing: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end',
		marginRight: 15,
		flex: 3,
	},
	shareImg: {
		width: 30,
		height: 30,
	},
	btnItem: {
		height: 100,
		justifyContent: 'center',
		alignItems: 'center',
	},
	imgDelete: {
		width: 66,
		height: 66,
		borderRadius: 66,
		backgroundColor: '#ccc',
		justifyContent: 'center',
		alignItems: 'center',
	},
	imgOperate: {
		width: 88,
		height: 88,
		borderRadius: 88,
		backgroundColor: '#24A090',
		justifyContent: 'center',
		alignItems: 'center',
	},
});
