
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
	Image,
	Slider,
	Alert,
} from 'react-native'
import NavBar from '../../common/NavBar'
import Item from '../../common/Item'
import Video from 'react-native-video';
import Orientation from 'react-native-orientation';
import Toast, { DURATION } from 'react-native-easy-toast'
import Feather from 'react-native-vector-icons/Feather'
import { connect, } from 'react-redux'
import RNFetchBlob from 'rn-fetch-blob';

import {statusBarHeight, height, width,} from '../../utils/uiHeader';
import Sound from 'react-native-sound';
import * as javaBase from '../../utils/network/javaService';
import SyanImagePicker from 'react-native-syan-image-picker';
import ImagePicker from "react-native-image-picker";
import * as userService from '../../utils/network/userService';
import moment from 'moment';
import AliyunOSS from 'aliyun-oss-react-native';
import QBStorage from '../../utils/storage/storage';
import Spinner from 'react-native-loading-spinner-overlay';
import * as communityActions from '../../actions/communityActions';

const contentHeight = height - NavBar.topbarHeight - statusBarHeight
const currentHeight = statusBarHeight;

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

var whoosh;

class DynamicPreview extends Component {
	static navigationOptions = {
		header: null
	}
	constructor(props) {
		super(props);
		this.state = {
			isRefreshing: false,
			avatarSource: null,
			videoUrl: this.props.videoUrl,
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
			newdata: {}, //圈子详情数据
			images: [], //图片列表
			audioStatus: 0, //音频按钮状态
			photoUrls: this.props.photoUrls, //选择的图片列表
			addVideo: '', //添加视频
			audioUrl: this.props.audioUrl,
			audioPath: this.props.audioPath,
			audioDuration: this.props.audioDuration,
			content: this.props.content,
			audioTime: 0,
			newImg: [],
			newAudio: '',
			imgIndex: 0,
			user: {},
			title: this.props.title,
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
		console.log(this.state.audioPath, '语音地址');
		whoosh = new Sound(this.state.audioPath, null, (error) => {
			if (error)
			{
				return console.log('资源加载失败', error);
			}
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
				this.audioPause();
			}
		);


	}

	componentWillReceiveProps(newProps)
	{
		console.log(newProps, '新的属性')
		this.setState({
			user: newProps.user,
			title: newProps.title,
			photoUrls: newProps.photoUrls,
			videoUrl: newProps.videoUrl,
			audioUrl: newProps.audioUrl,
			audioDuration: newProps.audioDuration,
			content: newProps.content,
			audioPath: newProps.audioPath,
		})
	}

	shouldComponentUpdate(newProps, newState)
	{
		return true
	}

	getUploadVoucher()
	{
		userService.getUploadVoucher()
			.then(res =>
			{
				console.log(res,'获取阿里云oos')
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

	format(shijianchuo)
	{
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
	onEnd = () => {
		this.video.seek(0)
		this.setState({
			paused: true,
			currentTime: 0,

		})
	};
	onLoad = (data)=> {
		console.log(data,'初始加载......')
		if(Number(data.duration)<10){
			this.setState({
				video_url: ''
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
		if(Number(data.duration)>60){
			this.setState({
				video_url: ''
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
			duration: data.duration
		});
	};
	onAudioBecomingNoisy = () => {
		this.setState({paused: true})
	};

	onAudioFocusChanged = (event: { hasAudioFocus: boolean })=> {
		console.log(event,'qwqweqweqewqweqweqewqew')
		// this.setState({paused: !event.hasAudioFocus})
	};
	onProgress = (data) => {
		this.setState({currentTime: data.currentTime});
	};
	/// 屏幕旋转时宽高会发生变化，可以在onLayout的方法中做处理，比监听屏幕旋转更加及时获取宽高变化
	_onLayout = (event) => {
		//获取根View的宽高
		let {width, height} = event.nativeEvent.layout;
		console.log('通过onLayout得到的宽度：' + width);
		console.log('通过onLayout得到的高度：' + height);

		// 一般设备横屏下都是宽大于高，这里可以用这个来判断横竖屏
		let isLandscape = (height == height - NavBar.topbarHeight - currentHeight);
		if (isLandscape){
			this.setState({
				videoWidth: width,
				videoHeight: height - NavBar.topbarHeight - currentHeight,
				isFullScreen: true,
			})
		} else {
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
				videoHeight: height - NavBar.topbarHeight - currentHeight,
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
			this.audioPause();
		}
		this.setState({
			paused: !paused,
		})

	}

	audioPausedVideo = () =>
	{
		this.setState({
			paused: true,
		})
		console.log(this.state.paused,"暂停吗暂停吗暂停吗暂停吗暂停吗暂停吗")
		var paused = this.state.paused;
		if (paused)
		{
			this.lay = setTimeout(() => {
				this.setState({
					visible: false,
				})
			}, 1000)
		}
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
			visible: !this.state.visible
		})
	}
	openPicker(){
		var photos = this.state.photoUrls;
		SyanImagePicker.showImagePicker({
			imageCount: 8 - photos.length,
		}, (err, photoUrls) => {
		if (err) {
			// 取消选择
			return;
		}
		// 选择成功，渲染图片
		// ...
			console.warn('photoUrls', photoUrls)
			this.setState({
				photoUrls: photos.concat(photoUrls)
			})
			for(var i = 0; i<photoUrls.length; i++){
				// this.startUpload(photoUrls[i].uri)
				// this.upImg(photoUrls[i].uri)
			}
		})
	}
	//添加视频
	addVideoBtn(){
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
			if (response.didCancel) {
				console.log('User cancelled photo picker');
			}
			else if (response.error) {
				console.log('ImagePicker Error: ', response.error);
			}
			else if (response.customButton) {
				console.log('User tapped custom button: ', response.customButton);
			}
			else {
				let source = {uri: response.uri};

				// You can also display the image using data:
				// let source = { uri: 'data:image/jpeg;base64,' + response.data };
				console.warn('source', source)
				this.setState({
					video_url: source.uri
				})
				// this.startUpload(source.uri)
            	// this.uploadVideo(response.uri)
				// this.upImg(response.uri)
				// this.newStartUpload(response)
			}
		});
	}
	upImg(img){
		javaBase.uploadFile({
			path: '/api/upload',
			body: {method: 'post', img: img},
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
	// HomeService.uploadVideo({
	//     video: videoUrl
	// })
	// .then((res) => {
	//     console.log('hah', res)
	// })
	// .catch(err => {
	//     console.log('err', err);
	// })
	// RNFetchBlob.fetch('POST', 'https://dev.sharemedical.vip/Weixin/upload/video', {
	//     // header...
	//     'Content-Type': 'multipart/form-data'
	// }, [
	//       // path是指文件的路径，wrap方法可以根据文件路径获取到文件信息
	//       { name: 'video', type: 'video/mp4', data: RNFetchBlob.wrap(videoUrl) },
	//       //... 可能还会有其他非文件字段{name:'字段名',data:'对应值'}
	//     ]).then((res) => {
	//       console.log('res', res)
	//     }).catch((err) => {
	//       console.log('err', err)
	// })



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

	/**
 * [startUpload 上传到阿里云]
 * @Author   袁进
 * @DateTime 2019-03-21T16:18:04+0800
 * @param    {[type]}                 uri [description]
 * @return   {[type]}                     [description]
 */
	startUpload(path, num)
	{
		const endPoint = 'oss-cn-shenzhen.aliyuncs.com';
		const configuration = {
		maxRetryCount: 3,
		timeoutIntervalForRequest: 30,
		timeoutIntervalForResource: 24 * 60 * 60,
		};

		//根据AliyunOss配置AccessKey
		AliyunOSS.initWithSecurityToken(this.SecurityToken,this.AccessKeyId, this.AccessKeySecret, endPoint, configuration);
		console.log(path, '上传路径oos')
		this.uploadOssFile(path, num)

	}

	uploadOssFile = (filepath, num) => {

		const filetype = filepath ? filepath.substring(filepath.lastIndexOf('.')).toLowerCase() : '';
		//获取图片后缀
		const bucketname = 'bjy-dev';
		const currm = moment(new Date());
		console.warn(currm, 'currm')
		const oo = Math.random();
		var objectKey;
    	if (num < this.allData.length-2)
    	{
			objectKey = `images/${currm.format('YYYYMM')}/${this.FileProfix}${oo}${filetype}`;
		}
		else if (this.allData.length-1)
		{
			objectKey = `audio/${currm.format('YYYYMM')}/${this.FileProfix}${oo}${filetype}`;
		}
		else
		{
			objectKey = `vodio/${currm.format('YYYYMM')}/${this.FileProfix}${oo}${filetype}`;
		}

		console.log(objectKey,'路径')
		// 生成objectKey，作为自定义路径
		return AliyunOSS.asyncUpload(bucketname, objectKey, filepath)
			.then((res) =>
			{
				console.warn(res,'上传成功打o偶爱云')
				if (num<this.allData.length-2)
				{
					this.img.push(this.aliyunUrl + objectKey)
					this.setState({
						newImg: this.img,
					})
					this.startUpload(this.allData[num+1], num+1)
				}
				else if (num<this.allData.length-1)
				{
					this.setState({
						newAudio: this.aliyunUrl+objectKey,
					})
					this.startUpload(this.allData[num+1], num+1)
				}
				else
				{
					this.setState({
						video_url: this.aliyunUrl+objectKey,
					})
					this.save()
				}
				console.warn(this.state.video_url)
				// if(type == 'img'){
				// 	this.img.push(this.aliyunUrl + objectKey)
				// 	this.setState({
				// 		newImg: this.img
				// 	})
				// } else{
				// 	this.setState({
				// 		newAudio: this.aliyunUrl+objectKey
				// 	})
				// }
				// if(this.state.newImg.length == this.state.photoUrls.length){
				// 	this.save()
				// }
			})
			.catch(error => {
				console.log('=== error', error);
				this.setState({
					spinner: false
				})
				this.refs.toast.show("上传失败");
			});
		};
	AddAudio(){
		this.props.navigation.push("AddAudio")
	}

	audioPlay() {
		this.setState({
			audioStatus: 1
		})
		var paused = this.state.paused;
		if (!paused)
		{
			this.audioPausedVideo();
		}
		whoosh.play(success => {
			if(success) {
				this.onPaused()
				console.log('success - 播放成功')
				this.setState({
					audioStatus: 0
				})
			}else {
				console.log('fail - 播放失败')
				this.setState({
					audioStatus: 0
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
		for(var i=0; i<this.state.photoUrls.length; i++){
			if (i == 0)
			{
				newImg = newImg + this.state.newImg[i]
			}
			else
			{
				newImg = newImg + ',' + this.state.newImg[i]
			}
		}
		var requestFrom = {
			id: '',
			token: this.state.user.token,
			photoUrls: newImg,
			voiceUrl: this.state.newAudio,
			title: this.state.title,
			latitude: 31.241934950086804,
			longitude: 121.35456217447917,
			voiceDuration: this.state.audioDuration,
			videoUrl: this.state.video_url,
			context: this.state.content,
		};
		console.log('requestFrom', requestFrom)
		javaBase.request({
			path: 'Weixin/Circle/add',
			body: requestFrom,
		})
			.then((res)=>{
				this.allData= [];
				console.log('add', res);
				this.setState({
					spinner: false,
				})
				if (res.code == '1')
				{
					this.refs.toast.show("已提交审核，请耐心等待");
					//清空提交的值
					this.props.clearPb();
					this.props.navigation.navigate("DynamicSuccess");

				}
				else
				{
					this.refs.toast.show(res.msg)
				}
			})
			.catch((err)=>{
				console.log(err, '错误返回')
			})
	}
	aliyunSave = () =>{

		// this.props.navigation.navigate("DynamicSuccess")

		var photoUrls = this.state.photoUrls;
		this.setState({
			spinner: true,
		})
		this.allData= [];
		this.img = [];
		this.setState({
			newAudio: '',
		})
		for (var i=0; i<photoUrls.length; i++)
		{
			this.setState({
				imgIndex: i+1
			})
			var photo = photoUrls[i]
			//this.startUpload(photo.uri, 'img')
			this.allData.push(photo.uri)
		}
		this.allData.push(this.state.audioUrl)
		this.allData.push(this.state.videoUrl)
		console.warn(this.allData)
		this.startUpload(this.allData[0], 0)
		// if(this.state.audioUrl){
		// 	this.startUpload(this.state.audioUrl, 'audio')
		// }
		// this.save();
		console.log('kankan', this.state.newImg, this.state.newAudio)
	}

	deleteImg(index)
	{
		var photos = this.state.photoUrls;
		photos.splice(index, 1);
		this.setState({
			photoUrls: photos,
		})
	}

	onChangeTitle(text)
	{
		this.setState({
			title: text,
		})
	}
	onChangeContext(text){
		this.setState({
			context: text,
		})
	}
	onFocus()
	{
		this.setState({
			keyboardHeight: 1,
		})
	}
	onBlur()
	{
		this.setState({
			keyboardHeight: 0,
		})
	}

	render()
	{

		console.log(this.state.video_url,'获取的视频地址', this.state.videoUrl)
		let video_url = this.state.videoUrl;
		let videoComponent = null;
		let pauseBtn = null;
		let autoTime = null;
		let sliderView  = null;
		let fullBtn = null;
		let NavBarContent = null;
		let statusBar = null;
		let title = null; //输入标题
		let img = null; //添加图片
		let voice = null; //添加语音
		let Description = null; //添加内容描述
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

		if(this.state.paused) {
			pauseBtn = (<Feather name="play" color="#fff" size={24}></Feather>)
		}else{
			pauseBtn = (<Feather name="pause" color="#fff" size={24}></Feather>)
		}
		if (!this.state.isFullScreen)
		{
			NavBarContent = (<NavBar
				title="分享案例"
				leftIcon="ios-arrow-back"
                leftPress={this.back.bind(this)}
                rightText={"发布"}
                rightPress={this.aliyunSave}
			/>)
			fullBtn = (<TouchableOpacity onPress={this.onControlShrinkPress.bind(this)} style={{width: 40,justifyContent: 'center',alignItems: 'center'}}>
						<Feather name="maximize" color="#fff" size={24}></Feather>
					</TouchableOpacity>)
			statusBar = (<StatusBar
				backgroundColor={"#24A090"}
				barStyle={this.props.barStyle || 'light-content'}
				translucent={true}
			/>)
			title = (<View style={{marginHorizontal: 10,paddingVertical: 20, }}>
				<Text style={{fontSize: 16, color: '#343434'}}>{this.state.title}</Text>
			</View>)
			img = (
				<View style={styles.imgContent}>
					{this.state.photoUrls.map((item, i)=>{
						return (<View key={i}>
							<Image source={{uri: item.uri}} style={styles.imgContentChild} resizeMode="cover"/>
						</View>)
					})}
				</View>)
			voice = (<View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
				<View style={styles.audioComponent}>
					<View style={styles.audioImg}>
						<View style={styles.audioLeft}>
							{this.state.audioStatus==0?<View>
								<Image source={require("../../img/audioPause.png")} style={styles.shareImg}/>
							</View>:
								<View>
									<Image source={require("../../img/audioPlay.png")} style={styles.shareImg}/>
								</View>}
							<Text>{this.state.audioDuration}s</Text>
						</View>
						{this.state.audioStatus == 0?<View style={styles.processing}></View>:
							<View style={styles.processing}>
								<Image source={require("../../img/iconVoice.png")} style={styles.shareImg}/>
								<Image source={require("../../img/iconVoice.png")} style={styles.shareImg}/>
								<Image source={require("../../img/iconVoice.png")} style={styles.shareImg}/>
							</View>}
					</View>
					{this.state.audioStatus == 0?<TouchableOpacity onPress={this.audioPlay.bind(this)} style={styles.audioBtn}>
						<Text>播放</Text>
					</TouchableOpacity>:
						<TouchableOpacity onPress={this.audioPause.bind(this)} style={styles.audioBtn}>
							<Text>暂停</Text>
						</TouchableOpacity>}
				</View>
			</View>)
			Description = (<View style={{marginHorizontal: 10, }}>
				<Text>{this.state.content}</Text>
			</View>)
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
		if(!video_url) {
			videoComponent = null
		}else{
			videoComponent = (<Video
				ref={(ref: Video) => {
					this.video = ref
				}}
				/* For ExoPlayer */
				source={{uri: video_url, }}
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
			modify = null;
		}

		return (
			<View style={{flex: 1,backgroundColor: "#FFF"}} onLayout={this._onLayout}>
				{statusBar}
				<View style={styles.sBar} backgroundColor={this.state.isFullScreen ? "#000" : '#24A090'}/>
				{NavBarContent}
				<ScrollView>
					{title}
					{Description}
					{voice}
					{img}
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
						{modify}
					</View>


				</ScrollView>
				<Toast ref="toast" />
				<Spinner
					visible={this.state.spinner}
					textContent="上传中"
				/>
			</View>
		)
	}
}

function mapStateToProps(state)
{
	console.log(state, '子组件的属性')
	return {
		user: state.loginIn.user,
		title: state.community.title,
		photoUrls: state.community.photoUrls,
		videoUrl: state.community.videoUrl,
		audioUrl: state.community.audioUrl,
		audioPath: state.community.audioPath,
		audioDuration: state.community.audioDuration,
		content: state.community.content,
	}
}

function mapDispatchToProps(dispatch)
{
	return {
		clearPb: () => dispatch(communityActions.clearPb()),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DynamicPreview)


const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'center',
		backgroundColor: 'black',
		marginHorizontal: 10,
	},
	sBar: {
		height: statusBarHeight,
		width: width
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
		borderColor: '#8b8e9c'
	},
	imageUp: {
		width: 30,
		height: 30,
	},
	imgStyle: {
		width: width,
		resizeMode:'cover',
		minHeight: 300
	},

	inputText: {
		borderBottomWidth: 1,
		borderColor: '#666',
		marginHorizontal: 10,
		fontSize: 15,
		marginBottom: 10,
		height: 50,
	},
	addImg: {
		justifyContent: 'center',
		alignItems: 'center',
		height: 100,
		backgroundColor: '#F2F2F2',
		marginHorizontal: 10,
		marginBottom: 10,
	},
	addVideoContent: {
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F2F2F2',
		marginHorizontal: 10,
		marginBottom: 10,
	},
	addVoice: {
		justifyContent: 'center',
		alignItems: 'center',
		height: 60,
		backgroundColor: '#F2F2F2',
		marginHorizontal: 10,
		marginTop: 10,
	},
	addContent: {
		marginHorizontal: 10,
		fontSize: 15,
		marginBottom: 30,
	},
	addRelease: {
		marginHorizontal: 10,
		backgroundColor: '#24a090',
		justifyContent: 'center',
		alignItems: 'center',
		height: 40,
		borderRadius: 30,
	},
	btnFont: {
		color: '#fff',
		fontSize: 18,
	},
	help: {
		marginTop: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},
	helpBtn: {
		color: '#666',
		fontSize: 15,
	},

	imgContent: {
		paddingHorizontal: 10,
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		paddingVertical: 20
	},
	imgContentChild: {
		width: width  * 0.27,
		height: width * 0.27,
		marginRight: 10,
		marginBottom: 10,
	},
	imgContentChild1: {
		width: width  * 0.29,
		height: width * 0.29,
		marginRight: 10,
		marginBottom: 10,
		borderColor: '#666',
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	audioComponent: {
		flex: 5,
        marginHorizontal: 10,
        backgroundColor: '#f2f2f2',
        marginTop: 10,
        paddingHorizontal: 10,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 5,
    },
    audioImg: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 6
    },
    audioBtn: {
        flex: 1,
        borderLeftColor: '#666',
        borderLeftWidth: 1,
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
});
