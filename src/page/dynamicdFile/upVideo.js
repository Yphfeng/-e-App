import React, {Component, } from 'react';
import {
	Image,
	StyleSheet,
	BackHandler,
	ToastAndroid,
	WebView,
	View,
	ActivityIndicator,
	StatusBar,
	TouchableOpacity,
	Text,
	Alert,
    NativeModules,
    Platform,
    DeviceEventEmitter
} from 'react-native';
import * as WeChat from 'react-native-wechat'
import NavBar from '../../common/NavBarShare'
import {statusBarHeight, height, width, } from '../../utils/uiHeader';
import { URL, } from "../../utils/network/baseService";
import WebViewAndroid from "react-native-webview-android";
import Spinner from 'react-native-loading-spinner-overlay';
const currentHeight = StatusBar.currentHeight;
export default class UpVideo extends Component
{
		static navigationOptions = {

			header: null,
		};

		constructor(props)
		{
			super(props)
			this.state = {
				typeArr: [
					{name: "微信好友", imgUrl: "../../img/wx.jpg", },
					{name: "微信朋友圈", imgUrl: "../../img/wx_row.jpg", },
				],
                showTypePop: false,
                spinner: false,
			}
		}

		componentWillMount()
		{
			BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
		}

		componentDidMount()
		{

		}

		componentWillUnmount()
		{
			BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
		}

	onBackAndroid = () =>
	{
		if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now())
		{
			//最近2秒内按过back键，可以退出应用。
			BackHandler.exitApp();
			return false;
		}
		this.lastBackPressed = Date.now();
		ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
		return true;
	};

	back()
	{
        if(Platform.OS == "android"){
            this.props.navigation.pop();
            return
        }
		this.canGoBack = this.targetUrl.canGoBack
        console.log('路由12312313', this.canGoBack, this.targetUrl)
		if (this.canGoBack)
		{
			this.webView.goBack();
		}
		else
		{
			this.props.navigation.pop();
		}
	}

	showShare()
	{
		this.setState({
			showTypePop: true,
		})
    }

    onMessage(event){
        console.warn(event)
        if(event.message == '1'){
            this.setState({
                spinner: true
            })
            return
        }
        this.setState({
            spinner: false
        })
        DeviceEventEmitter.emit('webUrl', {url: event.message});
        this.props.navigation.pop();
    }

    getMessage = (event) =>
	{
		console.warn(event.nativeEvent.data, "收到的通知")
        let get_data = JSON.parse(event.nativeEvent.data);
        if(get_data.playUrl){
            DeviceEventEmitter.emit('webUrl', {url: get_data.playUrl});
            this.props.navigation.pop();
        }
	}

	renderEle()
	{
            var time = (new Date()).valueOf();
            var uri = URL + "updataAliyun/updata.html?time=" + time
			return (
				Platform.OS != "android" ?<WebView
                    allowFileAccess = {true}
					ref={(webview) => this.webView = webview}
                    source={{uri: uri, }}
                    onMessage={this.getMessage}
					onNavigationStateChange={(event)=>{this.targetUrl = event}}
					startInLoadingState
					renderLoading={() => {
						return this.loading()
					}}
                />:

                <WebViewAndroid
                    ref="webViewAndroidSample"
                    javaScriptEnabled={true}
                    injectedJavaScript={`window.myMessageToRecover = 'Hello from React Native';`}
                    url={uri}
                    onMessage={this.onMessage.bind(this)}
                    style={{ flex: 1 }} />
			)

	}

	share = (i, s) =>
	{
		console.log(i, s, "分享")
		var url = this.targetUrl.url;
		if (i.name == "微信好友")
		{
			WeChat.isWXAppInstalled()
				.then(isInstalled =>
				{
					if (isInstalled)
					{
						WeChat.shareToSession({
							type: "news",
							title: "分享医疗商城",
							description: "分享医疗商城",
							thumbImage: "../../img/logo.png",
							imageUrl: "../../img/logo.png",
							webpageUrl: url,
						}).catch(err =>
						{
							Alert.alert(err.message)
						})

					}
					else
					{
						Alert.alert("请安装微信")
					}
				})
		}
		else
		{
			WeChat.isWXAppInstalled()
				.then(isInstalled =>
				{
					if (isInstalled)
					{
						WeChat.shareToTimeline({
							type: "news",
							description: "分享医疗商城",
							thumbImage: '分享的标题图片',
							webpageUrl: url,
						}).catch(err =>
						{
							Alert.alert(err.message)
						})

					}
					else
					{
						Alert.alert("请安装微信")
					}
				})
		}
	}








	render()
	{
		console.log(this.props.navigation, '新的参数111')


		return (
			<View style={{flex: 1, }}>
                <StatusBar
					translucent={true}
					animated={true}
					backgroundColor={"#24a090"}
					barStyle={"light-content"}
				/>
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="选择视频"
					leftIcon="chevron-left"
					leftColor="#fff"
					rightColor= "#ccc"
					leftPress={this.back.bind(this)}
					rightPress={this.showShare.bind(this)}
					titleStyle={{paddingLeft: 20, }}
				/>
                {this.renderEle()}
                <Spinner
					visible={this.state.spinner}
					textContent='上传中'
				/>
			</View>
		);
	}

	loading = () =>
	{
		return <ActivityIndicator style={styles.flash} size='small' color='#aa00aa'/>
	}

}
const styles = StyleSheet.create({
	sBar: {
		height: currentHeight,
	},
	flash: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	tabBarIcon: {
		width: 19,
		height: 19,
	},
});
