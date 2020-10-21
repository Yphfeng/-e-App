
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

class AudioTotext extends Component
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
			visible: true,
			user: {},
			title: '',
			text: '语音转化为文字',
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
		this.PL && this.PL.focus()
	}
	conversion(time)
	{
		var time = time;
		var min = Math.floor(time%3600);
		var s = (time%60)<10 ? ('0'+(time%60)):(time%60);
		var newTime = Math.floor(min/60) + ':' + s;
		return newTime;
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
		if(!this.state.recording){
			return
		}
		this.setState({
			process: 0
		})
		this.setState({stop: true, recording: false, paused: false});
		try {
			await AudioRecorder.stopRecording();
		} catch (error) {
			console.error(error);
		}
		this.audioPause();
	}

	onBackAndroid = () => {
		this.props.navigation.goBack();
		return true;
	};

	back()
	{
		this.props.navigation.pop();
	}

	nextTo = () =>
	{
		var text = this.state.text;
		if (!text)
		{
			this.refs.toast.show("转换中...")
		}
		else
		{
			this.props.pbContent(text)
			this.props.navigation.navigate("DynamicPreview");
		}
	}

	onChange = value =>
	{
		this.setState({
			text: value,
		})
	}


	render()
	{
		let NavBarContent = null;
    	let statusBar = null;
		NavBarContent = (<NavBar
			title="内容"
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

		return (
			<ScrollView style={{flex: 1,backgroundColor: "#FFF"}}>
				{statusBar}
				<View style={styles.statusBarHeight} backgroundColor={this.state.isFullScreen ? "#000" : '#24A090'}/>
				{NavBarContent}
				<View>
					<TextInput
						underlineColorAndroid={'transparent'}
						placeholder="输入内容"
						multiline={true}
						onChangeText={this.onChange}
						style={styles.inputStyle}
						ref={p => this.PL = p}

					/>
				</View>
				<Toast ref="toast" />
			</ScrollView>
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
		pbContent: text => dispatch(communityActions.pbContent(text)),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(AudioTotext)


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
	inputStyle: {
		width: width - 30,
		marginLeft: 15,
		height: 150,
		padding: 10,
		borderBottomColor: '#ccc',
		borderBottomWidth: 1,
		textAlignVertical: "top",
	},
});
