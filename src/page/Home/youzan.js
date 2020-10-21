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
} from 'react-native';
import * as WeChat from 'react-native-wechat'
import NavBar from '../../common/NavBarShare'
import Share from "../../common/shareComponent";
import { connect, } from 'react-redux'
import {statusBarHeight, height, width, } from '../../utils/uiHeader';

class Youzan extends Component
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
				mobile: this.props.mobile,
			}
		}

		componentWillMount()
		{
			BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
		}

		componentDidMount()
		{
			var phone =  this.props.navigation.state.params.phone;
		}

		componentWillUnmount()
		{
			BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
		}
		componentWillReceiveProps(newProps)
		{
			this.setState({
				mobile: newProps.phone,
			})
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
		this.canGoBack = this.targetUrl.canGoBack
		console.log('路由12312313', this.canGoBack, this.targetUrl)
		if (this.canGoBack && this.targetUrl.title !== '我的' && this.targetUrl.title !== '首页' && this.targetUrl.title !== '商品分类页' )
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

	renderEle()
	{
		var mobile = this.props.navigation.state.params.phone;
		var customer_id = this.props.navigation.state.params.shop_id ? this.props.navigation.state.params.shop_id : 45;
		var shop_url = this.props.navigation.state.params.shop_url;
		if (!mobile)
		{
			mobile = this.state.mobile;
		}
		if (mobile)
		{
			if (shop_url)
			{
				var uri = 'https://'+ shop_url + "/development_interface/open_up_interface/skip_shop_index?phone=" + mobile + "&sign=95d3a4b81747762a0e026912587c4585&customer_id=" + customer_id
			}
			else
			{
				uri = "https://ccc.ymylkj.cn/development_interface/open_up_interface/skip_shop_index?phone=" + mobile + "&sign=95d3a4b81747762a0e026912587c4585&customer_id=" + customer_id
			}
			console.log(uri, '传入的手机号')
			return (
				<WebView
					ref={(webview) => this.webView = webview}
					source={{uri: uri, }}
					onNavigationStateChange={(event)=>{this.targetUrl = event}}
				/>
			)
		}
		else
		{
			return <View style={{height: height-statusBarHeight, justifyContent: 'center', alignItems: 'center'}}><Text>加载中</Text></View>;
		}
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
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="分享商城"
					leftIcon="chevron-left"
					rightIcon="share-2"
					leftColor="#fff"
					rightColor= "#ccc"
					leftPress={this.back.bind(this)}
					rightPress={this.showShare.bind(this)}
					titleStyle={{paddingLeft: 20, }}
				/>
				<View style={{height: height - statusBarHeight - NavBar.topbarHeight, }}>
					{this.renderEle()}
				</View>

				<Share entityList={this.state.typeArr} callback={(i, s) => {
					this.share(i, s)
				}} show={this.state.showTypePop} closeModal={(show) => {
					this.setState({
						showTypePop: show,
					})
				}}
				title="分享到"
				/>
			</View>
		);
	}

	loading = () =>
	{
		return <ActivityIndicator style={styles.flash} size='small' color='#aa00aa'/>
	}

}

function mapStateToProps(state)
{
	console.log(state,'子组件的属性')
	return {
		user: state.loginIn.user,
		phone: state.loginIn.user ? state.loginIn.user.mobile: '',
	}
}

function mapDispatchToProps(dispatch)
{
	return {
	}
}
export default connect(mapStateToProps, mapDispatchToProps)(Youzan)

const styles = StyleSheet.create({
	container: {
		marginTop: statusBarHeight,
	},
	sBar: {
		height: statusBarHeight,
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
