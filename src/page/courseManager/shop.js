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

class CourseShop extends Component
{
		static navigationOptions = {

			header: null,
		};

		constructor(props)
		{
			super(props)
			this.state = {

			}
		}

		componentWillMount()
		{
			BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
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


		var uri = "https://ccc.ymylkj.cn/shop/front/products/product_search?cat_id=&share_id=-1"

        console.log(uri, '传入的手机号')
        return (
            <WebView
                ref={(webview) => this.webView = webview}
                source={{uri: uri, }}
                onNavigationStateChange={(event)=>{this.targetUrl = event}}
            />
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
				<View style={styles.sBar} backgroundColor={'#24a090'}/>
				<NavBar
					title="分享商城"
					leftIcon="chevron-left"
					leftColor="#fff"
					leftPress={this.back.bind(this)}
				/>
				<View style={{height: height - statusBarHeight - NavBar.topbarHeight, }}>
					{this.renderEle()}
				</View>
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
export default connect(mapStateToProps, mapDispatchToProps)(CourseShop)

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
