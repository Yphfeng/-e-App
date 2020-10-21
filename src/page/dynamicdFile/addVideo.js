
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
import Video from 'react-native-video';

import Toast, { DURATION, } from 'react-native-easy-toast'
import Feather from 'react-native-vector-icons/Feather'
import { connect, } from 'react-redux'

import RNFetchBlob from 'rn-fetch-blob';

import {statusBarHeight, height, width, } from '../../utils/uiHeader';
import Sound from 'react-native-sound';
import * as javaBase from '../../utils/network/javaService';
import SyanImagePicker from 'react-native-syan-image-picker';
import ImagePicker from "react-native-image-picker";
import * as userService from '../../utils/network/userService';
import QBStorage from '../../utils/storage/storage';
import * as communityActions from '../../actions/communityActions';
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

class AddVideo extends Component
{
	static navigationOptions = {
		header: null,
	}
	constructor(props) {
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
			currentTime: 0.0,
			paused: true, //默认暂停播放
			isFullScreen: false,
			videoWidth: width,
			videoHeight: width * 9/16,
			visible: true,
			newdata: {}, //圈子详情数据
			images: [], //图片列表
			audioStatus: 0, //音频按钮状态
			selectedPhotos: [], //选择的图片列表
			addVideo: '', //添加视频
			audioUrl: '',
			audioTime: 0,
			audioPath: '',
			newImg: [],
			newAudio: '',
			imgIndex: 0,
			user: {},
			spinner: false,
			keyposition: 0,
			keyboardHeight: 0,
		};
		this.AccessKeyId = ""
		this.AccessKeySecret = ""
		this.SecurityToken = ""
		this.FileProfix = ""
		this.openid = ""
		this.access_token = ""
		this.unionid = ""
		this.aliyunUrl = "https://bjy-dev.oss-cn-shenzhen.aliyuncs.com/"
		this.img = [];
		this.allData= [];
	}
	componentWillMount() {

		BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
	}
	componentDidMount() {
		console.log(this.props.navigation, 'luyou11111')
		// this.detail(47);
		this.getUploadVoucher();
		QBStorage.get('user')
			.then((user) =>
			{
				this.setState({
					user: user
				})
			})
			.catch(err => {

			})
		// this.setState({
		//     video_url: 'https://bjy-dev.oss-cn-shenzhen.aliyuncs.com/avatar/201911/c2d4HL0awIKKR2St60tlq79gR43ihy92F0_vLtWqYj37gA%15742337444980.6684852554982723.mp4'
		// })
		Keyboard.addListener('keyboardDidShow', (event) => {
			this.setState({
				keyposition: event.duration,
			})
		})
		Keyboard.addListener('keyboardDidHide', (event) => {
			this.setState({
				keyposition: 0,
			})
		})
		this.willBlurSubscription = this.props.navigation.addListener(
			'willBlur',
			payload => {
				//如果在播放就都暂停
				if (!this.state.paused)
				{
					this.setState({
						paused: true,
					})
				}
			}
		);
	}

	getUploadVoucher()
	{
		userService.getUploadVoucher()
			.then(res =>
			{
				console.log(res, '获取阿里云oos')
				if (res.StatusCode == 200)
				{
					this.AccessKeyId = res.AccessKeyId,
					this.AccessKeySecret = res.AccessKeySecret
					this.SecurityToken = res.SecurityToken
					this.FileProfix = res.FileProfix
				}
			})
			.catch(err => {
				console.log(err,'获取阿里云oos')
			})
	}

	detail(id)
	{
		var self = this;
		javaBase.requestToken({
			path: '/xcx/near/detail?id=' + id,
			body: {method: 'get'},
		})
			.then((res) => {
				if (res.code==1){
					var newdata = res.data;
					if (!newdata.wxUserName){
						newdata.wxUserName="匿名用户"
					}
					// console.warn('圈子详情', newdata)
					self.setState({
						id: newdata.id,
						video_url: newdata.videoUrl,
						voiceUrl: newdata.voiceUrl,
						newdata: newdata,
						time: self.format(newdata.createTime)
					})
					if (newdata.photoUrls!=null){
						var images = newdata.photoUrls.split(',');
						self.setState({
							images: images
						})
					}
					whoosh = new Sound(newdata.voiceUrl, null, (error) => {
						if (error) {
							return console.log('资源加载失败', error);
						}
					})
				}
			})
			.catch(err => {
				//console.warn(err, 'errerr');
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

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
		this.willBlurSubscription.remove();
	}

	onBackAndroid = () => {
		this.props.navigation.goBack();
		return true;
	};

	back() {
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
	onLoad = (data)=> {
		console.log(data,'初始加载......', this.state.paused)
		if (Number(data.duration)<10)
		{
			this.setState({
				video_url: '',
			});
			// this.refs.toast.show("视频时长不少于10S不超过1min");
			Alert.alert(
				'提示',
				'视频时长不少于10S不超过1min',
				[
					{text: '确定', onPress: ()=> console.log('点击确定')},
				]
			);
			return
		}
		if (Number(data.duration)>60)
		{
			this.setState({
				video_url: '',
			});
			// this.refs.toast.show("视频时长不少于10S不超过1min");
			Alert.alert(
				'提示',
				'视频时长不少于10S不超过1min',
				[
					{text: '确定', onPress: ()=> console.log('点击确定')},
				]
			);
			return
		}
		this.setState({
			duration: data.duration,
			paused: true,
		});
	};
	onAudioBecomingNoisy = () =>
	{
		this.setState({paused: true, })
	};
	onProgress = (data) =>
	{
		this.setState({currentTime: data.currentTime, });
	};
	/// 屏幕旋转时宽高会发生变化，可以在onLayout的方法中做处理，比监听屏幕旋转更加及时获取宽高变化
	_onLayout = (event) =>
	{
		//获取根View的宽高
		let {width, height, } = event.nativeEvent.layout;
		console.log('通过onLayout得到的宽度：' + width);
		console.log('通过onLayout得到的高度：' + height);

		// 一般设备横屏下都是宽大于高，这里可以用这个来判断横竖屏
		let isLandscape = (height == height - NavBar.topbarHeight - currentHeight);
		if (isLandscape)
		{
			this.setState({
				videoWidth: width,
				videoHeight: height - NavBar.topbarHeight - currentHeight,
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
	onControlShrinkPress()
	{
		if (this.state.isFullScreen)
		{
			this.setState({
				isFullScreen: !this.state.isFullScreen,
				videoHeight: width * 9/16,
			})
		}
		else
		{
			this.setState({
				isFullScreen: !this.state.isFullScreen,
				videoHeight: height - NavBar.topbarHeight - currentHeight,
			})
		}
	}
	//暂停
	onPaused = () =>
	{
		console.log(this.state.paused, "暂停吗暂停吗暂停吗暂停吗暂停吗暂停吗")
		var paused = this.state.paused;
		if (paused)
		{
			this.lay = setTimeout(() =>
			{
				this.setState({
					visible: false,
				})
			}, 1000)
		}
		this.setState({
			paused: !paused,
		})

	}

	slider(value)
	{
		console.log(value, '12312313131')
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
	openPicker(){
		var photos = this.state.selectedPhotos;
		SyanImagePicker.showImagePicker({
			imageCount: 8 - photos.length,
		}, (err, selectedPhotos) => {
		if (err) {
			// 取消选择
			return;
		}
		// 选择成功，渲染图片
		// ...
			console.warn('selectedPhotos', selectedPhotos)
			this.setState({
				selectedPhotos: photos.concat(selectedPhotos)
			})
			for (var i = 0; i<selectedPhotos.length; i++){
				// this.startUpload(selectedPhotos[i].uri)
				// this.upImg(selectedPhotos[i].uri)
			}
		})
	}
	//添加视频
	addVideoBtn()
	{
		// this.props.navigation.push("UpVideo");
		// return;
		const options = {
			title: "选择视频",
			cancelButtonTitle: "取消",
			chooseFromLibraryButtonTitle: "从相册中选择",
			takePhotoButtonTitle: "拍摄",
			durationLimit: 60,
			mediaType: 'video',
		};

		ImagePicker.showImagePicker(options, (response) => {
			console.log('Response = ', response);
			// Alert.alert(
			// 	'提示',
			// 	response.uri,
			// 	[
			// 		{text: '确定', onPress: ()=> console.log('点击确定')},
			// 		{text: '取消', onPress: ()=> console.log('点击取消')}
			// 	]
			// );
			if (response.didCancel)
			{
				console.log('User cancelled photo picker');
			}
			else if (response.error)
			{
				console.log('ImagePicker Error: ', response.error);
			}
			else if (response.customButton)
			{
				console.log('User tapped custom button: ', response.customButton);
			}
			else {
				let source = {uri: response.uri, };

				// You can also display the image using data:
				// let source = { uri: 'data:image/jpeg;base64,' + response.data };
				this.setState({
					video_url: source.uri,
					paused: false,
				})
				// this.startUpload(source.uri)
                // this.uploadVideo(response.uri)
				// this.upImg(response.uri)
				// this.newStartUpload(response)
			}
		});
	}
	upImg(img)
	{
		javaBase.uploadFile({
			path: '/api/upload',
			body: {method: 'post', img: img, },
		})
			.then((res) => {
				console.log('图片上传', res)
			})
			.catch(err => {
				console.warn(err, 'errerr');
			})
	}
	uploadVideo(videoUrl)
	{
		console.log('参数', RNFetchBlob.wrap(videoUrl), videoUrl)
		RNFetchBlob.fetch('POST', 'https://dev.sharemedical.vip/Weixin/upload/video', {
			Authorization: "Bearer access-token...",
			'Dropbox-API-Arg': JSON.stringify({
				path: videoUrl,
				mode: 'add',
				autorename: true,
				mute: false,
			}),
			'Content-Type': 'multipart/form-data',
		}, [
			// append field data from file path
			{
				name: 'video',
				filename: 'video.mp4',
				type: 'video/*',
				// Change BASE64 encoded data to a file path with prefix `RNFetchBlob-file://`.
				// Or simply wrap the file path with RNFetchBlob.wrap().
				data: RNFetchBlob.wrap(videoUrl),
			},
		])
			.uploadProgress((written, total) => {
				console.log('uploaded', written / total)
			})
			.then((res) => {

				console.log(res.data, "数据的返回")
			})
			.catch((err) => {
				console.log(err, "失败")
				// error handling ..
			})

	}

	AddAudio()
	{
		this.props.navigation.push("AddAudio")
	}

	audioPlay()
	{
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
	}
	audioPause()
	{
		this.setState({
			audioStatus: 0,
		})
		whoosh.pause();
	}
	save(){
		this.setState({
			spinner: true,
		})
		var newImg = ''
		for(var i=0; i<this.state.newImg.length; i++){
			if(i == 0){
				newImg = newImg + this.state.newImg[i]
			} else{
				newImg = newImg + ',' + this.state.newImg[i]
			}
		}
		var requestFrom = {
			method: 'post',
			id: '',
			token: this.state.user.token,
			photoUrls: newImg,
			voiceUrl: this.state.newAudio,
			title: this.state.title,
			latitude: 31.241934950086804,
			longitude: 121.35456217447917,
			voiceDuration: this.state.audioTime,
			videoUrl: this.state.video_url,
			context: this.state.context,
		};
		console.log('requestFrom', requestFrom)
		javaBase.requestToken({
			path: '/xcx/user/save',
			body: requestFrom,
		})
			.then((res)=>
			{
				this.allData= [];
				console.log('add', res);
				this.setState({
					spinner: false,
				})
				if (res.code == '1')
				{
					this.refs.toast.show("已提交审核，请耐心等待");
					this.props.navigation.pop();
					this.props.navigation.navigate('DynamicMine')

				}
				else
				{
					this.refs.toast.show(res.msg)
				}
			})
			.catch((err)=>{
				console.log(err)
			})
	}

	onChangeTitle(text)
	{
		this.setState({
			title: text,
		})
	}
	nextTo = () =>
	{
		var video_url = this.state.video_url
		if (!video_url)
		{
			this.refs.toast.show("请添加视频");
		}
		else
		{
			this.props.pbVideo(video_url);
			this.props.navigation.navigate("AddAudio");
		}

	}

	render()
	{

		console.log(this.state.video_url, '获取的数据', this.state.paused)
		let video_url = this.state.video_url;
		let videoComponent = null;
		let pauseBtn = null;
		let autoTime = null;
		let sliderView  = null;
		let fullBtn = null;
		let NavBarContent = null;
		let statusBar = null;
		let modify = null; //修改
		autoTime = (<View style={styles.volumeControl}>
			<Text style={{color: '#fff',fontSize: 12}}>{formatTime(this.state.duration - this.state.currentTime)}</Text>
		</View>)
		modify = (<TouchableOpacity onPress={this.addVideoBtn.bind(this)} style={styles.controls1}>
			<Text style={{color: '#fff'}}>修改</Text>
		</TouchableOpacity>)
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
			pauseBtn = (<Feather name="play" color="#fff" size={24}></Feather>)
		}
		else
		{
			pauseBtn = (<Feather name="pause" color="#fff" size={24}></Feather>)
		}
		if (!this.state.isFullScreen)
		{
			NavBarContent = (<NavBar
				title="发布视频"
				leftIcon="ios-arrow-back"
				leftPress={this.back.bind(this)}
				rightText={"下一步"}
				rightPress={this.nextTo}
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
		if (!video_url)
		{
			videoComponent = null
		}
		else
		{
			videoComponent = (<Video
				ref={(ref) =>
				{
					this.video = ref
				}}
				/* For ExoPlayer */
				source={{uri: video_url, }}
				style={{width: this.state.videoWidth, height: this.state.videoHeight, backgroundColor: '#000'}}
				rate={this.state.rate}
				paused={this.state.paused}
				volume={this.state.volume}
				muted={this.state.muted}
				resizeMode={this.state.resizeMode}
				onLoad={this.onLoad}
				onProgress={this.onProgress}
				onEnd={this.onEnd}
				onAudioBecomingNoisy={this.onAudioBecomingNoisy}
				repeat={false}
				playInBackground={false}

			/>)
		}

		if (!this.state.visible)
		{
			pauseBtn = null;
			fullBtn = null;
			sliderView = null;autoTime = null;
			modify = null;
		}

		return (
			<View style={{flex: 1, backgroundColor: "#FFF",}}>
				{statusBar}
				<View style={styles.statusBarHeight} backgroundColor={this.state.isFullScreen ? "#000" : '#24A090'}/>
				{NavBarContent}
				<View>
					{this.state.video_url!=''?<View style={styles.container}>
						<TouchableOpacity
							activeOpacity={1}
							onPress={this.setVisible}
							style={{width: this.state.videoWidth,height: this.state.videoHeight,}}>
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
						{modify}
					</View>:
						<View style={styles.noPictrue}><TouchableOpacity onPress={this.addVideoBtn.bind(this)} style={styles.addImg}>
							<Image source={require('../../img/addPicture.png')} />
							<Text style={{fontSize: 20, color: '#505050', paddingTop: 10, paddingBottom: 20, }}>添加视频</Text>
							<Text style={{fontSize: 14, color: '#64505050'}}>时长不少于十秒，不超过一分钟，大小100M以内</Text>
						</TouchableOpacity></View>
					}
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
		pbVideo: (url) => dispatch(communityActions.pbVideo(url)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(AddVideo)


const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'center',
		backgroundColor: 'black',
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
	addImg: {
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
		bottom: 5,
		left: 0,
		width: '100%',
		paddingLeft: 10,
		paddingRight: 10
	},
	controls1: {
		backgroundColor: 'transparent',
		flexDirection: 'row',
		justifyContent: 'flex-end',
		position: 'absolute',
		top:10,
		right: 0,
		paddingLeft: 10,
		paddingRight: 10
	},
	volumeControl: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
});
